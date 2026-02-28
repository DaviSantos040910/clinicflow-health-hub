import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FindClinicDialog } from "@/components/landing/FindClinicDialog";
import {
  CheckCircle2,
  Calendar,
  DollarSign,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Users,
  Phone,
  Sparkles,
  Mail
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const whatsappNumber = "5589981013110";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Tenho interesse no ClinicFlow. Gostaria de saber mais.")}`;

export default function LandingPage() {
  const [isFindClinicOpen, setIsFindClinicOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20">

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b py-3' : 'bg-transparent py-5'}`}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-2 font-display font-bold text-2xl text-primary cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="bg-primary text-white p-1 rounded-lg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            ClinicFlow
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#funcionalidades" className="hover:text-primary transition-colors">Funcionalidades</a>
            <a href="#precos" className="hover:text-primary transition-colors">Planos</a>
            <a href="#sobre" className="hover:text-primary transition-colors">Sobre</a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setIsFindClinicOpen(true)} className="text-slate-600">
              Já sou cliente
            </Button>
            <Button onClick={() => navigate("/contato")} className="shadow-lg shadow-primary/20">
              Entrar em Contato
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="container text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Novo: Bot de WhatsApp Integrado
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-slate-900 leading-[1.1]">
            Gerencie sua clínica com <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Inteligência</span> e Simplicidade.
          </h1>

          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Elimine faltas com confirmações automáticas, controle o financeiro sem planilhas e ofereça agendamento 24/7 para seus pacientes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-primary/20 hover:scale-105 transition-transform" onClick={() => navigate("/contato")}>
              Solicitar Demonstração
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg w-full sm:w-auto" onClick={() => navigate("/login?demo=true")}>
              Acessar Demo
            </Button>
          </div>

          {/* Carousel Mockup */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-xl border bg-slate-900/5 p-2 shadow-2xl backdrop-blur-sm lg:rounded-2xl lg:p-4">
            <div className="rounded-lg bg-white overflow-hidden shadow-sm border aspect-video relative">
              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-400">
                <Carousel className="w-full h-full" opts={{ loop: true, align: "start" }}>
                  <CarouselContent>
                    <CarouselItem className="flex items-center justify-center bg-slate-50">
                      <div className="text-center">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-primary/40" />
                        <h3 className="font-bold text-lg text-slate-700">Agenda Inteligente</h3>
                        <p className="text-sm">Visualização diária, semanal e status de pagamento</p>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="flex items-center justify-center bg-slate-50">
                      <div className="text-center">
                        <DollarSign className="h-16 w-16 mx-auto mb-4 text-green-500/40" />
                        <h3 className="font-bold text-lg text-slate-700">Controle Financeiro</h3>
                        <p className="text-sm">Links de pagamento e fluxo de caixa</p>
                      </div>
                    </CarouselItem>
                    <CarouselItem className="flex items-center justify-center bg-slate-50">
                      <div className="text-center">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-blue-500/40" />
                        <h3 className="font-bold text-lg text-slate-700">Bot WhatsApp</h3>
                        <p className="text-sm">Auto-atendimento para pacientes</p>
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="funcionalidades" className="py-24 bg-white">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Tudo o que sua clínica precisa</h2>
            <p className="text-lg text-slate-600">Uma plataforma completa para substituir softwares antigos e planilhas complexas.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Users}
              title="Multi-profissional"
              description="Gerencie agendas de médicos, dentistas e terapeutas em um único painel com permissões personalizadas."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Zero Calote"
              description="Gere links de pagamento (Pix/Cartão) antes da consulta e receba notificações automáticas de confirmação."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Atendimento 24/7"
              description="Configure um Bot de WhatsApp para triagem e agendamento básico, mesmo quando a recepção está fechada."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-24 bg-slate-50 border-t">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Planos simples e transparentes</h2>
            <p className="text-lg text-slate-600">Sistema pronto para usar ou totalmente personalizado para sua clínica.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pro Plan - Ready to Go */}
            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden transform hover:-translate-y-1 transition-transform">
              <div className="absolute top-0 right-0 bg-primary text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
              <h3 className="text-xl font-bold">ClinicFlow Pro</h3>
              <p className="text-slate-400 mt-2">Sistema completo, pronto para usar.</p>
              <div className="my-6">
                <span className="text-4xl font-bold">R$ 299</span>
                <span className="text-slate-400"> / mês</span>
              </div>
              <ul className="space-y-4 mb-8">
                <PricingItem text="Profissionais Ilimitados" light />
                <PricingItem text="Agenda Inteligente Completa" light />
                <PricingItem text="Financeiro com Links de Pagamento" light />
                <PricingItem text="Bot de WhatsApp Integrado" light />
                <PricingItem text="Suporte Prioritário" light />
                <PricingItem text="Painel Administrativo Completo" light />
              </ul>
              <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white border-0" onClick={() => navigate("/contato")}>
                Contratar Agora
              </Button>
            </div>

            {/* Custom */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow relative">
              <div className="absolute top-4 right-4">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Personalizado</h3>
              <p className="text-slate-500 mt-2">Adaptamos o sistema às necessidades únicas da sua clínica.</p>
              <div className="my-6">
                <span className="text-4xl font-bold text-slate-900">Sob consulta</span>
              </div>
              <ul className="space-y-4 mb-8">
                <PricingItem text="Tudo do plano Pro" />
                <PricingItem text="Funcionalidades sob medida" />
                <PricingItem text="Design personalizado (Logo e cores)" />
                <PricingItem text="Integrações exclusivas" />
                <PricingItem text="Onboarding e treinamento dedicado" />
                <PricingItem text="Suporte VIP via WhatsApp" />
              </ul>
              <Button variant="outline" className="w-full h-12" onClick={() => navigate("/contato")}>
                Entrar em Contato
              </Button>
            </div>
          </div>

          {/* Adaptability Banner */}
          <div className="mt-12 max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-2xl p-8 text-center border border-primary/20">
            <h3 className="text-xl font-bold text-slate-900 mb-2">💡 Adaptamos o sistema à sua realidade</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Seja uma clínica odontológica, consultório psicológico ou centro médico multidisciplinar — nós customizamos cada detalhe para atender seu fluxo de trabalho.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 h-12 px-6">
                  <Phone className="w-5 h-5" />
                  Falar pelo WhatsApp
                </Button>
              </a>
              <Button variant="outline" className="h-12 px-6" onClick={() => navigate("/contato")}>
                <Mail className="w-5 h-5 mr-2" />
                Enviar Email
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About / CTA Section */}
      <section id="sobre" className="py-24 bg-white border-t">
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Sobre o ClinicFlow</h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed">
            O ClinicFlow é uma plataforma SaaS moderna desenvolvida para simplificar a gestão de clínicas e consultórios.
            Com tecnologia de ponta, oferecemos uma experiência premium que elimina a complexidade do dia a dia
            clínico, permitindo que você foque no que realmente importa: seus pacientes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 text-lg shadow-xl shadow-primary/20" onClick={() => navigate("/contato")}>
              Agendar Demonstração
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800">
            <div className="bg-primary text-white p-1 rounded-md">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            ClinicFlow
          </div>
          <p className="text-sm text-slate-500">© 2024 ClinicFlow SaaS. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm text-slate-600">
            <Link to="/contato" className="hover:text-primary">Contato</Link>
            <a href="#" className="hover:text-primary">Termos</a>
            <a href="#" className="hover:text-primary">Privacidade</a>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp CTA */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl shadow-green-500/30 transition-all hover:scale-110 group"
        title="Fale conosco pelo WhatsApp"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Fale conosco!
        </span>
      </a>

      <FindClinicDialog isOpen={isFindClinicOpen} onClose={() => setIsFindClinicOpen(false)} />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-xl border bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 group">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingItem({ text, light = false }: { text: string, light?: boolean }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle2 className={`w-5 h-5 ${light ? 'text-green-400' : 'text-green-600'}`} />
      <span className={light ? 'text-slate-300' : 'text-slate-600'}>{text}</span>
    </li>
  );
}
