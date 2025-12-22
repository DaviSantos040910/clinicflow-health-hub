import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  FileText, 
  Shield, 
  Zap, 
  BarChart3,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Agendamento inteligente",
    description: "Gerencie consultas com facilidade. Evite conflitos e otimize sua agenda automaticamente."
  },
  {
    icon: Users,
    title: "Gestão de pacientes",
    description: "Cadastro completo, histórico médico e prontuários digitais sempre à mão."
  },
  {
    icon: FileText,
    title: "Prontuários digitais",
    description: "Documentação segura e acessível. Anexe exames, receitas e laudos."
  },
  {
    icon: BarChart3,
    title: "Relatórios e métricas",
    description: "Acompanhe o desempenho da sua clínica com dashboards intuitivos."
  },
  {
    icon: Shield,
    title: "Segurança de dados",
    description: "Proteção total com criptografia e backup automático na nuvem."
  },
  {
    icon: Zap,
    title: "Rápido e intuitivo",
    description: "Interface moderna e fácil de usar. Comece em minutos, sem treinamento."
  },
];

const benefits = [
  "Reduza faltas com lembretes automáticos",
  "Acesse de qualquer dispositivo",
  "Suporte técnico especializado",
  "Atualizações constantes e gratuitas",
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.1),transparent_50%)]" />
        
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium rounded-full bg-accent text-accent-foreground">
              <Zap className="h-4 w-4" />
              Sistema completo para clínicas modernas
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Gerencie sua clínica com{" "}
              <span className="text-gradient">simplicidade</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Agendamentos, prontuários, financeiro e relatórios em uma única plataforma intuitiva. 
              Mais tempo para cuidar dos seus pacientes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gradient" size="xl" asChild>
                <Link to="/cadastro">
                  Começar grátis
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline-primary" size="xl" asChild>
                <Link to="/login">
                  Já tenho conta
                </Link>
              </Button>
            </div>
            
            <p className="mt-6 text-sm text-muted-foreground">
              Sem cartão de crédito • Configuração em 5 minutos
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Tudo que sua clínica precisa
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ferramentas poderosas e fáceis de usar para otimizar cada aspecto da sua gestão
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group glass-card p-6 hover:shadow-glow transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary text-primary-foreground mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
                Por que escolher o{" "}
                <span className="text-gradient">ClinicFlow</span>?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Desenvolvido por profissionais de saúde para profissionais de saúde. 
                Entendemos suas necessidades e criamos a solução ideal.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li 
                    key={index}
                    className="flex items-center gap-3 animate-slide-in-right"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                <Button variant="gradient" size="lg" asChild>
                  <Link to="/cadastro">
                    Experimentar agora
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative animate-fade-in-up">
              <div className="aspect-square max-w-md mx-auto rounded-2xl bg-gradient-primary p-8 shadow-glow">
                <div className="h-full rounded-xl bg-card/90 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center">
                  <div className="text-5xl font-display font-bold text-gradient mb-2">98%</div>
                  <p className="text-muted-foreground">de satisfação dos usuários</p>
                  <div className="mt-6 flex -space-x-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-primary border-2 border-card flex items-center justify-center text-primary-foreground text-sm font-medium"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">+500 clínicas confiam em nós</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4 animate-fade-in">
            Pronto para transformar sua clínica?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto animate-fade-in">
            Comece grátis hoje e veja a diferença que uma gestão eficiente pode fazer.
          </p>
          <Button 
            size="xl" 
            className="bg-card text-foreground hover:bg-card/90 animate-fade-in-up"
            asChild
          >
            <Link to="/cadastro">
              Criar conta grátis
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 ClinicFlow. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Termos de uso
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacidade
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Suporte
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
