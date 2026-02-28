import { useState, useEffect } from "react";
import { useOrganization } from "@/contexts/OrganizationContext";
import { supabase } from "@/integrations/supabase/client";
import { WhatsappConfig } from "@/types/whatsapp";
import { ChatPreview } from "@/components/whatsapp/ChatPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Save, MessageSquare, Plus, Trash2, QrCode, AlertTriangle, PlayCircle } from "lucide-react";
import { toast } from "sonner";

export default function WhatsappConfigPage() {
  const { organization } = useOrganization();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [config, setConfig] = useState<Partial<WhatsappConfig>>({
    is_active: false,
    bot_welcome_message: 'Olá! Bem-vindo à nossa clínica. Como podemos ajudar?',
    bot_fallback_message: 'Desculpe, não entendi. Escolha uma das opções do menu.',
    trigger_menu: {
        "1": "Agendar Consulta",
        "2": "Meus Agendamentos",
        "3": "Falar com Atendente"
    }
  });

  useEffect(() => {
    if (organization?.id) {
        fetchConfig();
    }
  }, [organization?.id]);

  const fetchConfig = async () => {
    try {
        const { data, error } = await supabase
            .from('whatsapp_configs')
            .select('*')
            .eq('organization_id', organization!.id)
            .maybeSingle();

        if (error) throw error;

        if (data) {
            const menu = data.trigger_menu as Record<string, string> || {};
            setConfig({
                ...data,
                trigger_menu: menu
            } as any);
        }
    } catch (err) {
        console.error("Error fetching whatsapp config:", err);
        toast.error("Erro ao carregar configurações.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSave = async () => {
      setIsSaving(true);
      try {
          const payload = {
              organization_id: organization!.id,
              instance_id: config.instance_id,
              api_key: config.api_key,
              is_active: config.is_active,
              bot_welcome_message: config.bot_welcome_message,
              bot_fallback_message: config.bot_fallback_message,
              trigger_menu: config.trigger_menu
          };

          const { error } = await supabase
              .from('whatsapp_configs')
              .upsert(payload, { onConflict: 'organization_id' });

          if (error) throw error;
          toast.success("Configurações salvas com sucesso!");

      } catch (err: any) {
          console.error(err);
          toast.error("Erro ao salvar: " + err.message);
      } finally {
          setIsSaving(false);
      }
  };

  const updateMenuOption = (key: string, value: string) => {
      setConfig(prev => ({
          ...prev,
          trigger_menu: {
              ...prev.trigger_menu,
              [key]: value
          }
      }));
  };

  const removeMenuOption = (keyToDelete: string) => {
      const newMenu = { ...config.trigger_menu };
      delete newMenu[keyToDelete];
      setConfig(prev => ({ ...prev, trigger_menu: newMenu }));
  };

  const addMenuOption = () => {
      const currentKeys = Object.keys(config.trigger_menu || {}).map(Number).filter(n => !isNaN(n));
      const nextKey = currentKeys.length > 0 ? Math.max(...currentKeys) + 1 : 1;
      updateMenuOption(String(nextKey), "Nova Opção");
  };

  if (isLoading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div className="container py-8 space-y-8">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-display font-bold">Bot WhatsApp</h1>
                <p className="text-muted-foreground">Configure o assistente virtual da {organization?.name}</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar Tudo
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column: Configuration */}
            <div className="space-y-6">

                {/* Connection Status Card */}
                <Card className="border-l-4 border-l-yellow-500 bg-yellow-50/20">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <WifiIcon isActive={config.is_active} />
                                Status da Conexão
                            </div>
                            <Badge variant={config.is_active ? "default" : "secondary"} className={config.is_active ? "bg-green-600" : "bg-yellow-500 text-white"}>
                                {config.is_active ? "Online" : "Modo Simulação"}
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            Gerencie a conexão com a API oficial.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="active-switch" className="font-medium">Ativar Respostas Automáticas</Label>
                            <Switch
                                id="active-switch"
                                checked={config.is_active}
                                onCheckedChange={(val) => setConfig(prev => ({...prev, is_active: val}))}
                            />
                        </div>

                        {!config.is_active && (
                            <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 p-3 rounded-md">
                                <AlertTriangle className="h-4 w-4" />
                                O bot está em modo simulação. Ele não responderá a mensagens reais.
                            </div>
                        )}

                        <Separator />

                        <div className="pt-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" className="w-full gap-2 text-slate-600" disabled>
                                            <QrCode className="h-4 w-4" />
                                            Ler QR Code (Conectar WhatsApp Real)
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Funcionalidade em desenvolvimento</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardContent>
                </Card>

                {/* Messages Config */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Fluxo de Conversa
                        </CardTitle>
                        <CardDescription>Personalize como o bot interage com seus pacientes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-base">Mensagem de Boas-vindas</Label>
                            <Textarea
                                className="min-h-[100px]"
                                value={config.bot_welcome_message}
                                onChange={e => setConfig(prev => ({...prev, bot_welcome_message: e.target.value}))}
                                placeholder="Digite a mensagem inicial..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Enviada automaticamente quando o paciente manda "Oi" ou inicia a conversa.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base">Menu de Opções</Label>
                                <Button variant="ghost" size="sm" onClick={addMenuOption} className="h-8 text-primary">
                                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                                </Button>
                            </div>

                            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border">
                                {Object.entries(config.trigger_menu || {}).map(([key, value]) => (
                                    <div key={key} className="flex gap-2 items-center group">
                                        <div className="bg-white border px-3 py-2 rounded-md font-bold text-slate-700 min-w-[2.5rem] text-center shadow-sm">
                                            {key}
                                        </div>
                                        <Input
                                            className="bg-white shadow-sm"
                                            value={value as string}
                                            onChange={(e) => updateMenuOption(key, e.target.value)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeMenuOption(key)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {Object.keys(config.trigger_menu || {}).length === 0 && (
                                    <p className="text-sm text-center text-muted-foreground py-2">Nenhuma opção configurada.</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-base">Mensagem de Erro (Fallback)</Label>
                            <Input
                                value={config.bot_fallback_message}
                                onChange={e => setConfig(prev => ({...prev, bot_fallback_message: e.target.value}))}
                                placeholder="Ex: Desculpe, não entendi."
                            />
                            <p className="text-xs text-muted-foreground">Enviada quando o bot não reconhece a resposta do paciente.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Preview */}
            <div className="hidden lg:block sticky top-8 h-fit">
                <div className="bg-slate-100 rounded-xl p-6 border border-slate-200">
                    <div className="text-center mb-6 space-y-2">
                        <div className="flex items-center justify-center gap-2 text-primary font-semibold">
                            <PlayCircle className="h-5 w-5" />
                            <h3>Teste em Tempo Real</h3>
                        </div>
                        <p className="text-sm text-muted-foreground px-8">
                            Interaja com o simulador abaixo para testar as respostas configuradas.
                        </p>
                    </div>

                    <div className="flex justify-center">
                        <ChatPreview
                            config={config}
                            clinicName={organization?.name || "Sua Clínica"}
                            logoUrl={organization?.logo_url}
                        />
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}

function WifiIcon({ isActive }: { isActive?: boolean }) {
    return (
        <div className={`h-3 w-3 rounded-full transition-colors duration-500 ${isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-400'}`} />
    );
}
