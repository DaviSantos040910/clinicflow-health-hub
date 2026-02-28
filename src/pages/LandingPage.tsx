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
  Users
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
          <div className="flex items-center gap-2 font-display font-bold text-2xl text-primary cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="bg-primary text-white p-1 rounded-lg">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
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
            <Button onClick={() => navigate("/nova-clinica")} className="shadow-lg shadow-primary/20">
              Começar Agora
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
            <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-primary/20 hover:scale-105 transition-transform" onClick={() => navigate("/nova-clinica")}>
              Criar Conta Grátis
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
                    {/* Placeholder for screenshots - In a real app, use real images */}
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
                <p className="text-lg text-slate-600">Sem taxas de instalação. Cancele quando quiser.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Starter Plan */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                    <h3 className="text-xl font-bold text-slate-900">Starter</h3>
                    <p className="text-slate-500 mt-2">Para quem está começando.</p>
                    <div className="my-6">
                        <span className="text-4xl font-bold text-slate-900">Grátis</span>
                        <span className="text-slate-500"> / trial</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <PricingItem text="1 Profissional" />
                        <PricingItem text="Agenda Básica" />
                        <PricingItem text="Prontuário Simples" />
                        <PricingItem text="Suporte por Email" />
                    </ul>
                    <Button variant="outline" className="w-full h-12" onClick={() => navigate("/nova-clinica")}>
                        Começar Grátis
                    </Button>
                </div>

                {/* Pro Plan */}
                <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden transform hover:-translate-y-1 transition-transform">
                    <div className="absolute top-0 right-0 bg-primary text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
                    <h3 className="text-xl font-bold">Pro</h3>
                    <p className="text-slate-400 mt-2">Para clínicas em crescimento.</p>
                    <div className="my-6">
                        <span className="text-4xl font-bold">R$ 97</span>
                        <span className="text-slate-400"> / mês</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                        <PricingItem text="Profissionais Ilimitados" light />
                        <PricingItem text="Financeiro Completo (Stripe)" light />
                        <PricingItem text="Bot de WhatsApp Integrado" light />
                        <PricingItem text="Suporte Prioritário" light />
                    </ul>
                    <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white border-0" onClick={() => navigate("/nova-clinica")}>
                        Assinar Agora
                    </Button>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-display font-bold text-xl text-slate-800">
                <div className="bg-primary text-white p-1 rounded-md">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                </div>
                ClinicFlow
            </div>
            <p className="text-sm text-slate-500">© 2024 ClinicFlow SaaS. Todos os direitos reservados.</p>
            <div className="flex gap-6 text-sm text-slate-600">
                <a href="#" className="hover:text-primary">Termos</a>
                <a href="#" className="hover:text-primary">Privacidade</a>
                <a href="#" className="hover:text-primary">Contato</a>
            </div>
        </div>
      </footer>

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
