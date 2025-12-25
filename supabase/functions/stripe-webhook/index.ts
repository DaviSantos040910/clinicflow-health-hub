import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Error: missing stripe-signature header", { status: 400 });
  }

  try {
    const body = await req.text();
    let event;

    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        endpointSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Initialize Supabase Admin Client
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    switch (event.type) {
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        const customerId = invoice.customer;

        // We need to find which organization this belongs to.
        // Option A: We stored organization_id in metadata on the Subscription/Customer.
        // Option B: We look up by customer_id if we saved it previously.

        // Let's try to fetch the subscription to get metadata if not present in invoice
        const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
        const organizationId = subscription.metadata.organization_id;

        if (organizationId) {
            await supabase
            .from("organizations")
            .update({
              subscription_status: "active",
              stripe_customer_id: customerId as string,
              // We could also infer plan_type from the price_id in the invoice lines
            })
            .eq("id", organizationId);
        } else {
            console.error("No organization_id found in subscription metadata");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        // In this event, we definitely have the object with metadata
        const organizationId = subscription.metadata.organization_id;

        if (organizationId) {
            await supabase
            .from("organizations")
            .update({
              subscription_status: "canceled",
            })
            .eq("id", organizationId);
        }
        break;
      }

      // Handle other statuses like 'past_due' if needed
      case "customer.subscription.updated": {
         const subscription = event.data.object;
         const organizationId = subscription.metadata.organization_id;

         if(organizationId && subscription.status) {
             // Map Stripe status to our Enum
             // Stripe: active, past_due, unpaid, canceled, incomplete, incomplete_expired, trialing
             // Ours: active, past_due, trial, canceled, incomplete

             let status = subscription.status;
             if (status === 'trialing') status = 'trial';
             if (status === 'unpaid') status = 'past_due';

             // Simple mapping validation
             const validStatuses = ['active', 'past_due', 'trial', 'canceled', 'incomplete'];
             if (validStatuses.includes(status)) {
                 await supabase.from("organizations").update({ subscription_status: status }).eq("id", organizationId);
             }
         }
         break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err: any) {
    console.error(`Error processing webhook: ${err.message}`);
    return new Response(`Error: ${err.message}`, { status: 400 });
  }
});
