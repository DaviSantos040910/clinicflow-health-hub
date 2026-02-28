import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const MAILERSEND_API_KEY = Deno.env.get("MAILERSEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  dynamic_template_data?: Record<string, unknown>;
}

serve(async (req) => {
  // 1. Handle CORS (OPTIONS request)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Validate Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Verify JWT with Supabase Auth
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Invalid or expired token");
    }

    // 3. Parse and Validate Body
    const { to, subject, html, dynamic_template_data }: EmailRequest = await req.json();

    if (!to || !subject) {
      throw new Error("Missing required fields: 'to' and 'subject'");
    }

    if (!MAILERSEND_API_KEY) {
      console.error("MAILERSEND_API_KEY is not set");
      throw new Error("Internal Server Error: Email service configuration missing");
    }

    // 4. Construct MailerSend Request
    const mailerSendBody = {
      from: {
        email: "no-reply@clinicflow.app",
        name: "ClinicFlow"
      },
      to: [
        { email: to }
      ],
      subject: subject,
      html: html,
      variables: dynamic_template_data ? [
        {
          email: to,
          substitutions: Object.entries(dynamic_template_data).map(([key, value]) => ({
            var: key,
            value: value,
          })),
        }
      ] : undefined,
    };

    // 5. Call MailerSend API
    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        Authorization: `Bearer ${MAILERSEND_API_KEY}`,
      },
      body: JSON.stringify(mailerSendBody),
    });

    if (!res.ok) {
      const errorData = await res.text();
      console.error("MailerSend API Error:", errorData);
      throw new Error(`MailerSend API Error: ${res.statusText}`);
    }

    // 6. Return Success
    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in send-email function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
