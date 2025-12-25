import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

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
    // The Supabase client sends the JWT in the Authorization header.
    // We could verify it using supabase.auth.getUser(), but often just presence is checked if RLS isn't needed deeply here.
    // However, robust code should check it.
    // For this generic function, checking for the header is a basic first step.
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // 3. Parse and Validate Body
    const { to, subject, html, dynamic_template_data }: EmailRequest = await req.json();

    if (!to || !subject) {
      throw new Error("Missing required fields: 'to' and 'subject'");
    }

    if (!SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY is not set");
      throw new Error("Internal Server Error: Email service configuration missing");
    }

    // 4. Construct SendGrid Request
    const sendGridBody = {
      personalizations: [
        {
          to: [{ email: to }],
          dynamic_template_data: dynamic_template_data,
        },
      ],
      from: { email: "no-reply@clinicflow.app" }, // Replace with your verified sender
      subject: subject,
      content: html ? [{ type: "text/html", value: html }] : undefined,
    };

    // 5. Call SendGrid API
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify(sendGridBody),
    });

    if (!res.ok) {
        const errorData = await res.text();
        console.error("SendGrid API Error:", errorData);
        throw new Error(`SendGrid API Error: ${res.statusText}`);
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
      status: 400, // Or 500 depending on error type
    });
  }
});
