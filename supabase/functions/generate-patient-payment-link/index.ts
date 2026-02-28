import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Auth & Role Check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    // Fetch Profile for Role & Org
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.organization_id) {
      throw new Error("User does not have an organization");
    }

    const allowedRoles = ['owner', 'admin', 'receptionist'];
    if (!allowedRoles.includes(profile.role || '')) {
         throw new Error("Permission denied: Only Admin or Receptionist can generate payment links.");
    }

    const { appointment_id, patient_id, amount, description } = await req.json();
    if (!amount) throw new Error("Missing required field: amount");
    if (!appointment_id && !patient_id) throw new Error("Must provide appointment_id or patient_id");

    // 2. Resolve Patient ID
    let finalPatientId = patient_id;
    if (!finalPatientId && appointment_id) {
        const { data: appointment } = await supabase
          .from("appointments")
          .select("patient_id")
          .eq("id", appointment_id)
          .single();

        if (appointment) {
            finalPatientId = appointment.patient_id;
        } else {
            throw new Error("Appointment not found");
        }
    }

    // 3. Create Bill Record (Pending)
    // We create this BEFORE Stripe to ensure we have a record to attach metadata to.
    const { data: bill, error: billError } = await supabase
      .from("patient_bills")
      .insert({
        organization_id: profile.organization_id,
        appointment_id: appointment_id || null,
        patient_id: finalPatientId,
        amount: amount,
        status: 'pending',
        description: description,
        created_by: user.id,
        payment_method: 'stripe_checkout'
      })
      .select()
      .single();

    if (billError) throw billError;

    // 4. Create Stripe Checkout Session
    const origin = req.headers.get("origin") || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: description || `Consulta Médica`,
            },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/portal/callback?bill_id=${bill.id}`,
      cancel_url: `${origin}/dashboard`,
      // customer_email: We could pass patient email if we fetched it, but skipping for brevity
      metadata: {
        type: 'appointment_payment',
        bill_type: 'consultation', // Specific requirement
        organization_id: profile.organization_id,
        bill_id: bill.id,
        appointment_id: appointment_id || '',
        patient_id: finalPatientId
      },
    });

    // 5. Update Bill with Link
    await supabase
      .from("patient_bills")
      .update({
        payment_link_url: session.url,
        external_reference_id: session.id
      })
      .eq("id", bill.id);

    return new Response(JSON.stringify({ url: session.url, bill_id: bill.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
