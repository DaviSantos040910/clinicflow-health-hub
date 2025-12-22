import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function AcessoNegado() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-hero">
      <div className="w-full max-w-md animate-fade-in text-center">
        <div className="mb-8">
          <Link to="/" className="inline-block">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="glass-card p-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 text-destructive mb-6">
            <ShieldX className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            Acesso Negado
          </h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta página. 
            Entre em contato com um administrador se acredita que isso é um erro.
          </p>
          
          <Button variant="gradient" asChild className="w-full">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para o Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
