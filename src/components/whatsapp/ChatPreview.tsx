import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WhatsappConfig } from "@/types/whatsapp";
import { format } from "date-fns";
import { Wifi, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ChatPreviewProps {
  config: Partial<WhatsappConfig>;
  clinicName: string;
  logoUrl?: string | null;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatPreview({ config, clinicName, logoUrl }: ChatPreviewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize chat with welcome message when config loads
  useEffect(() => {
    if (config.bot_welcome_message) {
      const welcomeMsg: Message = {
        id: 'welcome',
        text: config.bot_welcome_message,
        sender: 'bot',
        timestamp: new Date()
      };

      const menuMsg: Message | null = config.trigger_menu && Object.keys(config.trigger_menu).length > 0 ? {
        id: 'menu',
        text: formatMenu(config.trigger_menu),
        sender: 'bot',
        timestamp: new Date()
      } : null;

      setMessages(menuMsg ? [welcomeMsg, menuMsg] : [welcomeMsg]);
    }
  }, [config.bot_welcome_message, config.trigger_menu]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const formatMenu = (menu: any) => {
      let text = "Escolha uma opção:\n";
      Object.entries(menu).forEach(([key, value]) => {
          text += `*${key}*. ${value}\n`;
      });
      return text;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('whatsapp-webhook', {
        body: {
          is_simulation: true,
          message: userMsg.text,
          organization_id: config.organization_id // Ensure we send context
        }
      });

      if (error) throw error;

      // Add Bot Response
      const botMsg: Message = {
        id: Math.random().toString(),
        text: data?.reply || config.bot_fallback_message || "Desculpe, não entendi.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      console.error("Simulation error:", err);
      // Fallback for simulation (if backend is not ready)
      setTimeout(() => {
         // Simple local logic for demo purposes if backend fails
         let reply = config.bot_fallback_message || "Desculpe, não entendi.";
         const menuOption = config.trigger_menu?.[userMsg.text.trim()];

         if (menuOption) {
             reply = `Você escolheu: *${menuOption}*\n(Esta é uma resposta simulada)`;
         }

         const fallbackMsg: Message = {
            id: Math.random().toString(),
            text: reply,
            sender: 'bot',
            timestamp: new Date()
         };
         setMessages(prev => [...prev, fallbackMsg]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="mx-auto w-[320px] h-[640px] bg-black rounded-[3rem] p-3 border-4 border-gray-800 shadow-2xl relative overflow-hidden">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-20"></div>

      {/* Screen */}
      <div className="w-full h-full bg-[#E5DDD5] rounded-[2.5rem] overflow-hidden flex flex-col relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
             style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}>
        </div>

        {/* Header */}
        <div className="bg-[#075E54] p-3 pt-8 flex items-center gap-2 text-white shadow-sm z-10 cursor-pointer" onClick={() => setMessages([])} title="Clique para reiniciar">
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarImage src={logoUrl || undefined} />
            <AvatarFallback className="bg-emerald-700 text-xs">
              {clinicName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{clinicName}</p>
            <p className="text-[10px] text-emerald-100 truncate flex items-center gap-1">
               {config.is_active ? 'Online' : 'Offline'}
            </p>
          </div>
          <Wifi className="h-4 w-4 opacity-80" />
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2 text-sm relative z-10 scrollbar-hide" ref={scrollRef}>
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                        p-2 px-3 rounded-lg shadow-sm max-w-[85%] relative group
                        ${msg.sender === 'user' ? 'bg-[#DCF8C6] rounded-tr-none' : 'bg-white rounded-tl-none'}
                    `}>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-[13px]">
                            {msg.text.split('\n').map((line, i) => (
                                <span key={i}>
                                    {line.includes('*') ?
                                        <span className="font-bold">{line.replace(/\*/g, '')}</span> :
                                        line
                                    }
                                    <br/>
                                </span>
                            ))}
                        </p>
                        <span className="text-[9px] text-gray-500 float-right ml-2 mt-1 -mb-1 block">
                            {format(msg.timestamp, "HH:mm")}
                            {msg.sender === 'user' && <span className="ml-1 text-blue-400">✓✓</span>}
                        </span>
                    </div>
                </div>
            ))}

            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-white p-2 px-4 rounded-lg rounded-tl-none shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                </div>
            )}
        </div>

        {/* Footer Input */}
        <form onSubmit={handleSend} className="bg-[#F0F0F0] p-2 flex items-center gap-2 px-2 z-10">
            <div className="flex-1 bg-white rounded-full h-9 flex items-center overflow-hidden border border-transparent focus-within:border-emerald-500 transition-colors">
                <input
                    className="flex-1 px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400"
                    placeholder="Digite uma mensagem..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isTyping}
                />
            </div>
            <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="bg-[#00897B] rounded-full p-2.5 shadow-sm hover:bg-[#00796B] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
                <Send className="h-4 w-4 text-white ml-0.5" />
            </button>
        </form>

      </div>
    </div>
  );
}
