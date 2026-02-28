import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WHATSAPP_GATEWAY_URL = Deno.env.get("WHATSAPP_GATEWAY_URL");
const WHATSAPP_API_KEY = Deno.env.get("WHATSAPP_API_KEY");

serve(async (req) => {
  // 1. CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, sender, instance_id, is_simulation, organization_id } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 2. Identification
    let config;
    let orgId = organization_id;

    if (!is_simulation) {
       // Production: Find config by instance_id
       if (!instance_id) throw new Error("Missing instance_id");

       const { data, error } = await supabase
         .from('whatsapp_configs')
         .select('*')
         .eq('instance_id', instance_id)
         .single();

       if (error || !data) throw new Error("Instance not found");
       config = data;
       orgId = config.organization_id;
    } else {
       // Simulation: Fetch config by organization_id provided by frontend
       if (!orgId) throw new Error("Missing organization_id for simulation");

       const { data, error } = await supabase
         .from('whatsapp_configs')
         .select('*')
         .eq('organization_id', orgId)
         .single();

       if (error) throw new Error("Config not found");
       config = data;
    }

    if (!config.is_active && !is_simulation) {
        return new Response(JSON.stringify({ status: "ignored", reason: "bot_inactive" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
    }

    // 3. Bot Logic
    const msg = message.trim().toLowerCase();
    let replyText = "";

    // Keywords logic
    if (['oi', 'olá', 'ola', 'inicio', 'start', 'menu'].includes(msg)) {
        replyText = config.bot_welcome_message;
        if (config.trigger_menu) {
            replyText += "\n\n";
            // @ts-ignore: trigger_menu is JSONB
            Object.entries(config.trigger_menu).forEach(([key, val]) => {
                replyText += `*${key}*. ${val}\n`;
            });
        }
    } else if (config.trigger_menu && config.trigger_menu[msg]) {
        // Simple handler for numeric options
        const option = config.trigger_menu[msg];
        if (option.toLowerCase().includes('agendar')) {
            // In a real app, generate a specific link or flow
            // Need to fetch org slug to make the link useful
            const { data: org } = await supabase.from('organizations').select('slug').eq('id', orgId).single();
            replyText = `Para agendar, acesse: ${req.headers.get("origin") || 'https://clinicflow.com'}/portal/${org?.slug || 'login'}`;
        } else if (option.toLowerCase().includes('falar') || option.toLowerCase().includes('atendente')) {
            replyText = "Um de nossos atendentes irá responder em breve. Aguarde um momento.";
        } else {
            replyText = `Você escolheu: ${option}`;
        }
    } else {
        replyText = config.bot_fallback_message || "Desculpe, não entendi. Digite 'Menu' para ver as opções.";
    }

    // 4. Output
    if (is_simulation) {
        return new Response(JSON.stringify({ reply: replyText }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
        });
    } else {
        // Production: Send to Evolution API
        if (WHATSAPP_GATEWAY_URL && replyText) {
            await fetch(`${WHATSAPP_GATEWAY_URL}/message/sendText/${instance_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": WHATSAPP_API_KEY || ""
                },
                body: JSON.stringify({
                    number: sender,
                    options: {
                        delay: 1200,
                        presence: "composing",
                        linkPreview: false
                    },
                    textMessage: {
                        text: replyText
                    }
                })
            });
        }

        return new Response(JSON.stringify({ status: "sent" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
        });
    }

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
