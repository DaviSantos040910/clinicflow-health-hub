import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, X, Shield, User, Stethoscope, DollarSign } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const roleIcons = {
  admin: Shield,
  recepcionista: User,
  profissional: Stethoscope,
  financeiro: DollarSign,
};

const roleLabels = {
  admin: "Admin",
  recepcionista: "Recepcionista",
  profissional: "Profissional",
  financeiro: "Financeiro",
};

export function Header() {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const RoleIcon = role ? roleIcons[role] : User;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/agenda">Agenda</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/pacientes">Pacientes</Link>
              </Button>
              {role !== 'profissional' && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profissionais">Profissionais</Link>
                </Button>
              )}
              {(role === 'admin' || role === 'recepcionista' || role === 'financeiro') && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/financeiro">Financeiro</Link>
                </Button>
              )}
              <div className="flex items-center gap-3">
                {role && (
                  <Badge variant="secondary" className="flex items-center gap-1.5">
                    <RoleIcon className="h-3 w-3" />
                    {roleLabels[role]}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {profile?.full_name || user.email}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button variant="gradient" asChild>
                <Link to="/contato">Entrar em Contato</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 animate-fade-in">
          <nav className="flex flex-col gap-3">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-2 pb-3 border-b border-border">
                  {role && (
                    <Badge variant="secondary" className="flex items-center gap-1.5">
                      <RoleIcon className="h-3 w-3" />
                      {roleLabels[role]}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {profile?.full_name || user.email}
                  </span>
                </div>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/agenda">Agenda</Link>
                </Button>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/pacientes">Pacientes</Link>
                </Button>
                {role !== 'profissional' && (
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/profissionais">Profissionais</Link>
                  </Button>
                )}
                {(role === 'admin' || role === 'recepcionista' || role === 'financeiro') && (
                  <Button variant="ghost" asChild className="justify-start">
                    <Link to="/financeiro">Financeiro</Link>
                  </Button>
                )}
                <Button variant="ghost" onClick={handleLogout} className="justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="justify-start">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button variant="gradient" asChild>
                  <Link to="/contato">Entrar em Contato</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
