import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { WhatsappConfig } from "@/types/whatsapp";
import { format } from "date-fns";
import { User, Wifi } from "lucide-react";

interface ChatPreviewProps {
  config: Partial<WhatsappConfig>;
  clinicName: string;
  logoUrl?: string | null;
}

export function ChatPreview({ config, clinicName, logoUrl }: ChatPreviewProps) {
  const currentTime = format(new Date(), "HH:mm");

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
        <div className="bg-[#075E54] p-3 pt-8 flex items-center gap-2 text-white shadow-sm z-10">
          <Avatar className="h-8 w-8 border border-white/20">
            <AvatarImage src={logoUrl || undefined} />
            <AvatarFallback className="bg-emerald-700 text-xs">
              {clinicName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{clinicName}</p>
            <p className="text-[10px] text-emerald-100 truncate">
               {config.is_active ? 'Online' : 'Offline'}
            </p>
          </div>
          <Wifi className="h-4 w-4 opacity-80" />
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm relative z-10">

            {/* User Hello */}
            <div className="flex justify-end">
                <div className="bg-[#DCF8C6] p-2 px-3 rounded-lg rounded-tr-none shadow-sm max-w-[80%]">
                    <p className="text-gray-800">Olá</p>
                    <span className="text-[10px] text-gray-500 float-right ml-2 mt-1">{currentTime}</span>
                </div>
            </div>

            {/* Bot Welcome */}
            <div className="flex justify-start">
                <div className="bg-white p-2 px-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%]">
                    <p className="text-gray-800 whitespace-pre-line">
                        {config.bot_welcome_message || "Mensagem de boas-vindas..."}
                    </p>
                    <span className="text-[10px] text-gray-500 float-right ml-2 mt-1">{currentTime}</span>
                </div>
            </div>

            {/* Menu Options */}
            {config.trigger_menu && Object.keys(config.trigger_menu).length > 0 && (
                <div className="flex justify-start">
                    <div className="bg-white p-2 px-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%]">
                        <p className="text-gray-800 font-medium mb-1">Escolha uma opção:</p>
                        <div className="space-y-1 text-gray-700">
                             {Object.entries(config.trigger_menu).map(([key, value]) => (
                                 <div key={key} className="flex gap-2">
                                     <span className="font-bold text-emerald-600">{key}.</span>
                                     <span>{value as string}</span>
                                 </div>
                             ))}
                        </div>
                        <span className="text-[10px] text-gray-500 float-right ml-2 mt-1">{currentTime}</span>
                    </div>
                </div>
            )}
        </div>

        {/* Footer Input */}
        <div className="bg-[#F0F0F0] p-2 flex items-center gap-2 px-4 z-10">
            <div className="flex-1 bg-white rounded-full h-8 px-4 flex items-center text-gray-400 text-xs">
                Digite uma mensagem...
            </div>
            <div className="bg-[#00897B] rounded-full p-2">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                    <path d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
                </svg>
            </div>
        </div>

      </div>
    </div>
  );
}
