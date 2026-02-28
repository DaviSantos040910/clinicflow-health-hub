import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FindClinicDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FindClinicDialog({ isOpen, onClose }: FindClinicDialogProps) {
  const navigate = useNavigate();
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    setLoading(true);
    try {
      // Clean input (remove full url if pasted)
      const cleanSlug = slug.replace(/^(?:https?:\/\/)?(?:www\.)?[^\/]+\/portal\//, "").split('/')[0].trim();

      // Check if org exists
      const { data, error } = await supabase
        .from("organizations")
        .select("slug, name")
        .eq("slug", cleanSlug)
        .single();

      if (error || !data) {
        toast.error("Clínica não encontrada. Verifique o endereço.");
      } else {
        toast.success(`Redirecionando para ${data.name}...`);
        navigate(`/portal/${data.slug}`);
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar clínica");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acessar Portal da Clínica</DialogTitle>
          <DialogDescription>
            Digite o endereço personalizado da sua clínica para fazer login.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Endereço da Clínica</Label>
            <div className="flex items-center">
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-l-md border border-r-0 border-input h-10 flex items-center">
                    /portal/
                </span>
                <Input
                    id="slug"
                    placeholder="clinica-vida"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="rounded-l-none"
                    autoFocus
                />
            </div>
          </div>
          <DialogFooter>
             <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
             <Button type="submit" disabled={loading}>
               {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
               Acessar
             </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
