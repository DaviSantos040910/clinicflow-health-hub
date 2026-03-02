import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FindClinicDialog } from "@/components/landing/FindClinicDialog";
import {
  CheckCircle2,
  Calendar,
  Users,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  LayoutDashboard,
  BellRing,
  ChevronDown,
  Stethoscope,
  Scissors,
  Dumbbell,
  Briefcase,
  Wrench,
  Sparkles,
  Phone,
  Mail,
  UserPlus,
  Settings,
  BarChart3,
  Layers,
} from "lucide-react";

const whatsappNumber = "5589981013110";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  "Olá! Tenho interesse no ClinicFlow. Gostaria de saber mais sobre adaptação para o meu negócio."
)}`;

/* ─── Intersection Observer Hook ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ═══════════════════════════════════════════════════════ */
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
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/20 overflow-x-hidden">
      {/* ─── Header ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-white/80 backdrop-blur-md shadow-sm border-b py-3"
            : "bg-transparent py-5"
          }`}
      >
        <div className="container flex items-center justify-between">
          <div
            className="flex items-center gap-2 font-display font-bold text-2xl text-primary cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-5 h-5"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            ClinicFlow
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#para-quem" className="hover:text-primary transition-colors">
              Para quem
            </a>
            <a href="#beneficios" className="hover:text-primary transition-colors">
              Benefícios
            </a>
            <a href="#como-funciona" className="hover:text-primary transition-colors">
              Como funciona
            </a>
            <a href="#faq" className="hover:text-primary transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsFindClinicOpen(true)}
              className="text-slate-600 hidden sm:inline-flex"
            >
              Já sou cliente
            </Button>
            <Button
              onClick={() => navigate("/login?demo=true")}
              className="shadow-lg shadow-primary/20"
            >
              Entrar / Criar Conta
            </Button>
          </div>
        </div>
      </header>

      {/* ══════════════════ 1) HERO ══════════════════ */}
      <section className="relative pt-32 pb-24 px-4 bg-gradient-to-b from-slate-50 via-white to-white overflow-hidden">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-3xl" />

        <div className="container text-center max-w-4xl mx-auto space-y-8 relative z-10">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Demo: Clínica
            </span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Adaptável: outros nichos
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight text-slate-900 leading-[1.08]">
            Gerencie clientes e agendamentos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
              em um só lugar.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Uma plataforma de gestão para pequenos negócios — esta demo está
            configurada para <strong>clínica</strong>, mas a base é adaptável
            para qualquer segmento.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              size="lg"
              className="h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
              onClick={() => navigate("/login?demo=true")}
            >
              Ver Demonstração
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg w-full sm:w-auto"
              onClick={() => navigate("/login")}
            >
              Entrar / Criar Conta
            </Button>
          </div>
        </div>
      </section>

      {/* ══════════════════ 2) SOCIAL PROOF LEVE ══════════════════ */}
      <SocialProofSection />

      {/* ══════════════════ 3) PARA QUEM É ══════════════════ */}
      <SegmentsSection />

      {/* ══════════════════ 4) O QUE VOCÊ RESOLVE ══════════════════ */}
      <BenefitsSection />

      {/* ══════════════════ 5) COMO FUNCIONA ══════════════════ */}
      <HowItWorksSection />

      {/* ══════════════════ 6) SEÇÃO ADAPTÁVEL ══════════════════ */}
      <AdaptableSection />

      {/* ══════════════════ 7) CTA FINAL ══════════════════ */}
      <CTASection navigate={navigate} />

      {/* ══════════════════ 8) FAQ ══════════════════ */}
      <FAQSection />

      {/* ─── Footer ─── */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-display font-bold text-xl text-white">
            <div className="bg-primary text-white p-1 rounded-md">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            ClinicFlow
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} ClinicFlow — Plataforma de Gestão para
            Pequenos Negócios.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/contato" className="hover:text-white transition-colors">
              Contato
            </Link>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </footer>

      <FindClinicDialog
        isOpen={isFindClinicOpen}
        onClose={() => setIsFindClinicOpen(false)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════ */

/* ─── 2 · Social Proof ─── */
function SocialProofSection() {
  const { ref, visible } = useInView();
  const items = [
    { icon: ClipboardList, label: "Feito para operar no dia a dia" },
    { icon: Sparkles, label: "Fluxos simples e rápidos" },
    { icon: LayoutDashboard, label: "Painel administrativo completo" },
  ];
  return (
    <section ref={ref} className="py-14 bg-slate-50/60 border-y">
      <div className="container">
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 p-6 rounded-xl hover:bg-white/70 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <it.icon className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-800">{it.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 3 · Para quem é ─── */
function SegmentsSection() {
  const { ref, visible } = useInView();
  const segments = [
    { icon: Stethoscope, name: "Clínicas", tag: "demo", color: "text-primary" },
    { icon: Scissors, name: "Salões", color: "text-pink-500" },
    { icon: Dumbbell, name: "Academias", color: "text-orange-500" },
    { icon: Briefcase, name: "Consultorias", color: "text-violet-500" },
    { icon: Wrench, name: "Serviços locais", color: "text-amber-600" },
  ];
  return (
    <section id="para-quem" ref={ref} className="py-24 bg-white">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Para quem é o ClinicFlow?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Construímos uma base sólida que pode ser{" "}
            <strong>customizada sob demanda</strong> para diferentes segmentos.
          </p>
        </div>

        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {segments.map((s, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center gap-3 p-6 rounded-2xl border bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 group"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {s.tag && (
                <span className="absolute -top-2.5 right-3 bg-primary text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                  {s.tag}
                </span>
              )}
              <div
                className={`w-14 h-14 rounded-xl bg-current/10 flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}
                style={{ backgroundColor: "currentColor", opacity: 0.1 }}
              >
                <s.icon className={`w-7 h-7 ${s.color} relative z-10`} style={{ opacity: 1 }} />
              </div>
              <span className="font-semibold text-slate-800 text-sm text-center">
                {s.name}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          💡 Customizável sob demanda — entre em contato para adaptar ao seu
          nicho.
        </p>
      </div>
    </section>
  );
}

/* ─── 4 · Benefícios ─── */
function BenefitsSection() {
  const { ref, visible } = useInView();
  const benefits = [
    {
      icon: Calendar,
      title: "Agenda organizada",
      desc: "Visualize, crie e gerencie compromissos com uma agenda intuitiva e visual.",
    },
    {
      icon: Users,
      title: "Controle de clientes",
      desc: "Cadastro completo, busca rápida e histórico acessível em poucos cliques.",
    },
    {
      icon: ClipboardList,
      title: "Histórico e atendimentos",
      desc: "Registre cada interação e consulte o histórico detalhado quando precisar.",
    },
    {
      icon: LayoutDashboard,
      title: "Painel administrativo",
      desc: "Indicadores em tempo real para acompanhar a operação do seu negócio.",
    },
    {
      icon: BellRing,
      title: "Redução de no-shows",
      desc: "Lembretes e confirmações ajudam a diminuir faltas e otimizar a agenda.",
    },
    {
      icon: ShieldCheck,
      title: "Controle de acessos",
      desc: "Permissões por perfil garantem segurança e organização na equipe.",
    },
  ];
  return (
    <section id="beneficios" ref={ref} className="py-24 bg-slate-50/60 border-t">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            O que você resolve com ClinicFlow
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Organize clientes, agenda, serviços e operações — tudo em um sistema
            simples e rápido.
          </p>
        </div>

        <div
          className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {benefits.map((b, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border bg-white hover:shadow-xl transition-all duration-300 group"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <b.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-900">
                {b.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 5 · Como funciona ─── */
function HowItWorksSection() {
  const { ref, visible } = useInView();
  const steps = [
    {
      icon: UserPlus,
      number: "01",
      title: "Cadastre sua conta",
      desc: "Crie seu acesso em minutos — sem burocracia.",
    },
    {
      icon: Settings,
      number: "02",
      title: "Configure serviços e agenda",
      desc: "Adicione profissionais, horários e serviços que seu negócio oferece.",
    },
    {
      icon: Users,
      number: "03",
      title: "Gerencie clientes e atendimentos",
      desc: "Cadastre clientes, agende atendimentos e registre o histórico.",
    },
    {
      icon: BarChart3,
      number: "04",
      title: "Acompanhe tudo no painel",
      desc: "Monitore indicadores e tome decisões com dados em tempo real.",
    },
  ];
  return (
    <section
      id="como-funciona"
      ref={ref}
      className="py-24 bg-white border-t"
    >
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Quatro passos para sair do caos e ganhar controle.
          </p>
        </div>

        <div
          className={`grid sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {steps.map((s, i) => (
            <div
              key={i}
              className="relative text-center group"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary mb-5 group-hover:shadow-lg group-hover:scale-105 transition-all">
                <s.icon className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-primary/60 tracking-widest">
                PASSO {s.number}
              </span>
              <h3 className="text-lg font-bold mt-1 mb-2 text-slate-900">
                {s.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 6 · Adaptável ─── */
function AdaptableSection() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-24 bg-slate-50/60 border-t">
      <div
        className={`container max-w-4xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
      >
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-10 md:p-16 text-center text-white">
          {/* decorative glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(199_89%_48%/0.15),transparent_60%)]" />

          <Layers className="w-12 h-12 mx-auto mb-6 text-primary" />
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Mesma base, aparência e campos adaptáveis
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6 text-lg">
            Regras, telas e campos podem ser ajustados para o seu nicho. A
            plataforma cresce junto com o seu negócio — sem precisar começar do
            zero.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mt-8 text-sm">
            {[
              "Campos e formulários personalizáveis",
              "Fluxos ajustados ao seu mercado",
              "Branding com sua identidade visual",
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-slate-200">{t}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-xs text-slate-500">
            Demo configurada para clínica (exemplo). Adaptável para salão,
            academia, consultório, estética, serviços e mais.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─── 7 · CTA Final ─── */
function CTASection({ navigate }: { navigate: (path: string) => void }) {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-24 bg-white border-t">
      <div
        className={`container text-center max-w-3xl mx-auto transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
      >
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          Quer uma versão para o seu negócio?
        </h2>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          Entre em contato e descubra como podemos adaptar a plataforma para o
          seu segmento — sem compromisso.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white gap-2 h-14 px-8 text-lg shadow-xl shadow-green-600/20"
            >
              <Phone className="w-5 h-5" />
              Falar pelo WhatsApp
            </Button>
          </a>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-8 text-lg"
            onClick={() => navigate("/contato")}
          >
            <Mail className="w-5 h-5 mr-2" />
            Solicitar Adaptação
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─── 8 · FAQ ─── */
function FAQSection() {
  const { ref, visible } = useInView();
  const faqs = [
    {
      q: "Isso é só para clínica?",
      a: "Não. A demo atual está configurada com o tema clínica, mas a base do sistema é adaptável para salões, academias, consultorias, serviços locais e outros nichos.",
    },
    {
      q: "Dá para adicionar pagamento online?",
      a: "Sim! Integrações como pagamento online, gateway Pix e outras podem ser adicionadas como evolução do sistema, sob orçamento.",
    },
    {
      q: "Quanto tempo para adaptar ao meu negócio?",
      a: "Depende do nicho e do escopo de personalização. Entre em contato para uma avaliação sem compromisso — não trabalhamos com prazos genéricos.",
    },
    {
      q: "Preciso instalar alguma coisa?",
      a: "Não. O sistema funciona 100% online no navegador. Basta criar sua conta e começar a usar.",
    },
  ];
  return (
    <section id="faq" ref={ref} className="py-24 bg-slate-50/60 border-t">
      <div className="container max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Perguntas frequentes
          </h2>
        </div>

        <div
          className={`space-y-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {faqs.map((f, i) => (
            <FAQItem key={i} question={f.q} answer={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border rounded-2xl bg-white overflow-hidden transition-shadow hover:shadow-md"
      onClick={() => setOpen(!open)}
    >
      <button className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 cursor-pointer">
        <span>{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""
            }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5 px-5" : "max-h-0"
          }`}
      >
        <p className="text-slate-600 leading-relaxed text-sm">{answer}</p>
      </div>
    </div>
  );
}
