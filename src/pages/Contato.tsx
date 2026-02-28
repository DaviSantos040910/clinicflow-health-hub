import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Mail, Phone, User, MessageSquare, Send, ArrowLeft } from "lucide-react";

export default function Contato() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const whatsappNumber = "5589981013110";
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Tenho interesse no ClinicFlow. Gostaria de saber mais sobre os planos.")}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !message) {
            toast.error("Por favor, preencha todos os campos.");
            return;
        }

        setIsLoading(true);

        // Simula envio — em produção, integrar com MailerSend ou outro serviço
        setTimeout(() => {
            toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
            setName("");
            setEmail("");
            setMessage("");
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen flex bg-gradient-hero">
            {/* Left Side - Info */}
            <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-primary">
                <div className="text-center text-primary-foreground max-w-md animate-fade-in-up">
                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm animate-float">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-4">
                        Vamos conversar?
                    </h2>
                    <p className="text-primary-foreground/80 text-lg mb-8">
                        Tire suas dúvidas, solicite uma demonstração ou contrate agora mesmo.
                    </p>

                    <div className="space-y-6 text-left bg-primary-foreground/10 rounded-2xl p-6 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-primary-foreground/60">Email</p>
                                <p className="font-medium">davisantossousa2@gmail.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm text-primary-foreground/60">Telefone / WhatsApp</p>
                                <p className="font-medium">(89) 98101-3110</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-xl w-full">
                                <MessageSquare className="w-5 h-5" />
                                Falar pelo WhatsApp
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md animate-fade-in">
                    <div className="mb-6">
                        <Link to="/">
                            <Logo size="lg" />
                        </Link>
                    </div>

                    <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao início
                    </Link>

                    <div className="glass-card p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl font-display font-bold text-foreground">
                                Entre em Contato
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Preencha o formulário ou entre em contato diretamente.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Seu nome"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Mensagem</Label>
                                <textarea
                                    id="message"
                                    placeholder="Conte-nos como podemos ajudar..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                />
                            </div>

                            <Button
                                type="submit"
                                variant="gradient"
                                size="lg"
                                className="w-full mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    "Enviando..."
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar Mensagem
                                    </>
                                )}
                            </Button>
                        </form>

                        {/* Mobile WhatsApp + Contact Info */}
                        <div className="mt-6 pt-6 border-t border-border space-y-4 lg:hidden">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span>davisantossousa2@gmail.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>(89) 98101-3110</span>
                            </div>
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white gap-2 w-full mt-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Falar pelo WhatsApp
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
