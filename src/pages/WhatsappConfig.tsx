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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, MessageSquare, Plus, Trash2 } from "lucide-react";
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
            // Ensure trigger_menu is treated as a Record<string, string>
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
          // Check if config exists to decide Update or Insert
          // We can use upsert since we have a unique constraint on organization_id,
          // but we need the ID if it exists to be clean, or let upsert handle conflict.

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
        <div>
            <h1 className="text-3xl font-display font-bold">Bot WhatsApp</h1>
            <p className="text-muted-foreground">Configure o assistente virtual da {organization?.name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Configuration Form */}
            <div className="space-y-6">

                {/* Connection Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <WifiIcon isActive={config.is_active} />
                            Status da Conexão
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="active-switch">Bot Ativo</Label>
                            <Switch
                                id="active-switch"
                                checked={config.is_active}
                                onCheckedChange={(val) => setConfig(prev => ({...prev, is_active: val}))}
                            />
                        </div>
                        <Separator />
                        <div className="space-y-2">
                            <Label>Instance ID</Label>
                            <Input
                                placeholder="ex: inst_12345"
                                value={config.instance_id || ''}
                                onChange={e => setConfig(prev => ({...prev, instance_id: e.target.value}))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>API Key</Label>
                            <Input
                                type="password"
                                placeholder="••••••••••••"
                                value={config.api_key || ''}
                                onChange={e => setConfig(prev => ({...prev, api_key: e.target.value}))}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Messages Config */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Mensagens
                        </CardTitle>
                        <CardDescription>Personalize como o bot fala com seus pacientes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Boas-vindas</Label>
                            <Textarea
                                rows={3}
                                value={config.bot_welcome_message}
                                onChange={e => setConfig(prev => ({...prev, bot_welcome_message: e.target.value}))}
                            />
                            <p className="text-xs text-muted-foreground">Enviada quando o paciente inicia a conversa.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Menu de Opções</Label>
                            <div className="space-y-2">
                                {Object.entries(config.trigger_menu || {}).map(([key, value]) => (
                                    <div key={key} className="flex gap-2 items-center">
                                        <div className="bg-slate-100 px-3 py-2 rounded-md font-bold text-slate-600 min-w-[2.5rem] text-center">
                                            {key}
                                        </div>
                                        <Input
                                            value={value as string}
                                            onChange={(e) => updateMenuOption(key, e.target.value)}
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeMenuOption(key)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addMenuOption} className="w-full mt-2 border-dashed">
                                    <Plus className="h-4 w-4 mr-2" /> Adicionar Opção
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2 pt-4">
                            <Label>Mensagem de Erro (Fallback)</Label>
                            <Textarea
                                rows={2}
                                value={config.bot_fallback_message}
                                onChange={e => setConfig(prev => ({...prev, bot_fallback_message: e.target.value}))}
                            />
                            <p className="text-xs text-muted-foreground">Enviada quando o bot não entende a resposta.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                    </Button>
                </div>

            </div>

            {/* Preview Section */}
            <div className="hidden lg:block sticky top-8">
                <div className="text-center mb-4">
                    <h3 className="font-semibold text-lg">Pré-visualização</h3>
                    <p className="text-sm text-muted-foreground">Como o paciente verá no WhatsApp</p>
                </div>
                <ChatPreview
                    config={config}
                    clinicName={organization?.name || "Sua Clínica"}
                    logoUrl={organization?.logo_url}
                />
            </div>

        </div>
    </div>
  );
}

function WifiIcon({ isActive }: { isActive?: boolean }) {
    return (
        <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`} />
    );
}
