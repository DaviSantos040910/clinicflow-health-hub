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

    const { appointment_id, amount, description } = await req.json();
    if (!appointment_id || !amount) throw new Error("Missing required fields: appointment_id, amount");

    // 2. Fetch Billing Config (Optional: logic for custom gateway accounts)
    // For this implementation, we simulate using the platform's main Stripe account.
    // In a real Connect scenario, we would use:
    /*
    const { data: billingConfig } = await supabase
      .from("organization_billing_configs")
      .select("payment_gateway_account_id")
      .eq("organization_id", profile.organization_id)
      .single();
    */

    // 3. Fetch Appointment to get Patient ID
    const { data: appointment } = await supabase
      .from("appointments")
      .select("patient_id")
      .eq("id", appointment_id)
      .single();

    if (!appointment) throw new Error("Appointment not found");

    // 4. Create Bill Record (Pending)
    const { data: bill, error: billError } = await supabase
      .from("bills")
      .insert({
        organization_id: profile.organization_id,
        appointment_id: appointment_id,
        patient_id: appointment.patient_id,
        amount: amount,
        status: 'pending',
        created_by: user.id,
        payment_method: 'stripe_checkout'
      })
      .select()
      .single();

    if (billError) throw billError;

    // 5. Create Stripe Checkout Session
    const origin = req.headers.get("origin") || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: description || `Consulta - Agendamento #${appointment_id.slice(0, 8)}`,
            },
            unit_amount: Math.round(amount * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/portal/callback?bill_id=${bill.id}`, // Reuse the callback page? Or a specific one.
      cancel_url: `${origin}/dashboard`, // TODO: Redirect to specific page
      customer_email: undefined, // We could pass patient email if we fetched it
      metadata: {
        type: 'appointment_payment',
        organization_id: profile.organization_id,
        bill_id: bill.id,
        appointment_id: appointment_id
      },
    });

    // 6. Update Bill with Link
    await supabase
      .from("bills")
      .update({ payment_link: session.url })
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
