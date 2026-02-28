# ClinicFlow — Sistema de Gestão para Clínicas e Consultórios

## 📋 Visão Geral

**ClinicFlow** é uma plataforma SaaS completa para gestão de clínicas médicas e consultórios, desenvolvida com arquitetura moderna, controle de acesso granular por nível de usuário (RBAC), integração com pagamentos, disparo automatizado de e-mails e configuração de chatbot via WhatsApp.

O sistema permite que administradores, recepcionistas e médicos utilizem a mesma plataforma com funcionalidades e restrições específicas para cada perfil, garantindo segurança e praticidade no dia a dia clínico.

**🔗 Link do projeto em produção:** *(inserir URL do Railway aqui)*
**🔗 Repositório GitHub:** [github.com/DaviSantos040910/clinicflow-health-hub](https://github.com/DaviSantos040910/clinicflow-health-hub)

---

## 🚀 Tecnologias Utilizadas

### Frontend
| Tecnologia | Uso |
|---|---|
| **React 18** | Biblioteca principal de UI (SPA) |
| **TypeScript** | Tipagem estática em todo o projeto |
| **Vite** | Bundler e dev server ultrarrápido |
| **React Router v6** | Roteamento com rotas protegidas e redirecionamento por role |
| **Shadcn/UI** | Biblioteca de componentes (Radix UI + Tailwind) |
| **Tailwind CSS** | Estilização utilitária responsiva |
| **Tanstack React Query** | Gerenciamento de estado assíncrono e cache |
| **date-fns** | Manipulação e formatação de datas (locale pt-BR) |
| **Zod** | Validação de schemas em formulários |
| **Sonner** | Notificações toast elegantes |
| **Lucide React** | Ícones SVG |
| **Embla Carousel** | Carrossel de slides na landing page |

### Backend & Infraestrutura
| Tecnologia | Uso |
|---|---|
| **Supabase** | Backend-as-a-Service (PostgreSQL + Auth + Storage + Edge Functions) |
| **Supabase Auth** | Autenticação com email/senha e Row Level Security (RLS) |
| **Supabase Edge Functions** | Serverless functions (Deno runtime) para webhooks e integrações |
| **PostgreSQL** | Banco de dados relacional com RLS, views e procedures |
| **MailerSend** | Disparo de e-mails transacionais (confirmação, pagamento, etc.) |
| **Stripe** | Processamento de pagamentos e assinaturas |
| **Railway** | Hospedagem e deploy contínuo (CI/CD via GitHub) |

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)                 │
│   Landing Page ─ Login ─ Dashboard ─ Agenda ─ Pacientes │
│   Profissionais ─ Financeiro ─ Contato ─ Config WhatsApp│
├─────────────────────────────────────────────────────────┤
│                    SUPABASE CLOUD                        │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────────┐│
│  │   Auth    │  │ Database │  │    Edge Functions       ││
│  │ (JWT/RLS) │  │ (Postgres│  │  - send-email          ││
│  │           │  │  + RLS)  │  │  - create-checkout     ││
│  └──────────┘  └──────────┘  │  - stripe-webhook      ││
│                               │  - whatsapp-webhook    ││
│                               │  - generate-payment    ││
│                               └────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│              SERVIÇOS EXTERNOS                           │
│   Stripe (pagamentos) ─ MailerSend (e-mails)            │
│   WhatsApp Business API (chatbot)                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Sistema de Permissões (RBAC)

O sistema implementa **Role-Based Access Control** com 3 níveis de acesso:

| Funcionalidade | Admin | Recepcionista | Médico |
|---|:---:|:---:|:---:|
| Dashboard completo | ✅ | ✅ | ✅ (apenas seus dados) |
| Agenda — ver todas | ✅ | ✅ | ❌ (apenas suas consultas) |
| Agenda — criar para qualquer médico | ✅ | ✅ | ❌ (apenas para si) |
| Pacientes — ver todos | ✅ | ✅ | ❌ (apenas os seus) |
| Pacientes — cadastrar/editar | ✅ | ✅ | ❌ |
| Pacientes — excluir | ✅ | ❌ | ❌ |
| Observações de consulta (exclusivo) | ❌ | ❌ | ✅ |
| Profissionais — visualizar | ✅ | ✅ | ❌ |
| Profissionais — editar | ✅ | ❌ | ❌ |
| Financeiro | ✅ | ✅ | ❌ |
| Confirmar pagamento de paciente | ✅ | ✅ | ❌ |
| Configurações de WhatsApp | ✅ | ✅ | ❌ |

### Implementação técnica:
- **Frontend:** Componente `<ProtectedRoute>` com prop `allowedRoles` que redireciona para `/acesso-negado`
- **Backend:** PostgreSQL Row Level Security (RLS) para garantir segurança no nível do banco
- **Contexto:** `AuthContext` com `useAuth()` fornecendo `role`, `user`, `profile` e `hasPermission()`

---

## 📄 Páginas e Funcionalidades

### 🏠 Landing Page
- Design moderno com gradientes, animações e tipografia premium
- Seção de funcionalidades com cards interativos
- Planos de preço: **Pro (R$ 299/mês)** e **Personalizado (sob consulta)**
- Carrossel demonstrativo das funcionalidades
- Botão "Acessar Demo" para testar o sistema sem cadastro
- CTA flutuante de WhatsApp em todas as páginas

### 🔐 Login com Modo Demo Inteligente
- Formulário de login padrão com validação (Zod)
- **Modo Demo (`/login?demo=true`):** 3 cards selecionáveis (Admin, Recepcionista, Médico), cada um mostrando lista de permissões ✅ e restrições ❌, com ícones e cores distintas por perfil
- Auto-preenchimento de credenciais demo ao selecionar un perfil
- Redirecionamento pós-login por role

### 📊 Dashboard
- Cards de estatísticas: consultas hoje, total do mês, receita, taxa de confirmação
- Lista de próximas consultas com **data + horário** formatados em pt-BR
- Botão "Ver todas" navegando para `/agenda`
- Conteúdo adaptado por nível de acesso

### 📅 Agenda
- Visão diária e semanal do calendário
- Criação/edição de agendamentos com modal completo
- Médico: campo "Profissional" **travado** (não pode agendar para outro médico)
- Aba financeira por agendamento com geração de link de pagamento
- Status: Agendada, Confirmada, Concluída, Cancelada

### 👥 Pacientes
- Listagem com busca por nome, email ou telefone
- Médico vê apenas **seus pacientes** (filtro por `professional_id`)
- Painel lateral com:
  - **Informações do paciente** (todos os roles)
  - **Observações da consulta** (apenas médico — campo exclusivo e editável)
  - **Financeiro** (admin/recepcionista — status de pagamento com botão de confirmação)
  - **Histórico de consultas** (filtrado por médico quando logado como profissional)
- Botão de excluir: **apenas admin**

### 👨‍⚕️ Profissionais
- CRUD completo de profissionais com agenda semanal configurável
- Especialidade, CRM, contato
- Médico: **não tem acesso** a esta aba
- Recepcionista: **visualiza** mas não edita
- Admin: acesso total

### 💰 Financeiro
- Visão geral de receitas, despesas e saldo
- Gráficos e métricas financeiras
- Geração de links de pagamento (integração Stripe)
- Acessível para admin e recepcionista

### 📞 Página de Contato
- Formulário de contato (nome, email, mensagem)
- Dados de contato: email, telefone/WhatsApp
- Botão direto de WhatsApp para atendimento imediato
- Substituiu o antigo fluxo de "Criar Conta" (agora todas as ações de criação de clínica passam pela equipe)

### 🤖 Configuração de WhatsApp Bot
- Configuração do chatbot de WhatsApp Business
- Mensagens automáticas de boas-vindas e triagem
- Webhook para recebimento de mensagens

---

## 🗄️ Banco de Dados (PostgreSQL)

### Tabelas principais:
| Tabela | Descrição |
|---|---|
| `organizations` | Clínicas/consultórios cadastrados (multi-tenancy) |
| `profiles` | Perfis de usuário com role (admin, recepcionista, profissional) |
| `professionals` | Profissionais da clínica com especialidade e agenda |
| `patients` | Pacientes com dados pessoais e observações |
| `appointments` | Agendamentos vinculando paciente + profissional + data/hora |
| `patient_bills` | Cobranças por consulta (status, valor, forma de pagamento) |
| `subscriptions` | Assinaturas das clínicas (integração Stripe) |
| `whatsapp_config` | Configuração do bot de WhatsApp por organização |
| `master_admins` | Administradores-mestre (painel geral de todas as clínicas) |

### 13 migrations SQL organizadas cronologicamente:
- Schema base → Auth → Multi-tenancy → Assinaturas → WhatsApp → Billing → Master Admin → Views financeiras

---

## ⚡ Edge Functions (Serverless)

| Função | Descrição |
|---|---|
| `send-email` | Disparo de e-mails transacionais via MailerSend API |
| `create-checkout` | Criação de checkout session no Stripe |
| `stripe-webhook` | Processamento de webhooks do Stripe (pagamento confirmado, assinatura ativa) |
| `generate-patient-payment-link` | Gera link de pagamento individual para um paciente |
| `whatsapp-webhook` | Recebe e processa mensagens do WhatsApp Business API |

---

## 📱 UX/UI Highlights

- **Design System** completo com tokens de cor, tipografia (Inter/Outfit via Google Fonts) e espaçamento
- **Glassmorphism** em cards e modais
- **Gradientes** personalizados no header, botões e landing page
- **Animações** suaves (fade-in, float, scale) com classes CSS customizadas
- **Responsividade** total (mobile-first com breakpoints para tablet e desktop)
- **Dark mode** suportado via CSS variables
- **Skeleton loaders** para estados de carregamento
- **Empty states** customizados com ícones e CTAs contextuais
- **WhatsApp CTA flutuante** persistente em todas as páginas

---

## 🔄 DevOps & Deploy

- **Versionamento:** Git + GitHub
- **CI/CD:** Railway auto-deploy a partir da branch `main` via integração GitHub
- **Build:** `vite build` → assets estáticos servidos com `serve`
- **Edge Functions:** Deploy via `npx supabase functions deploy`
- **Variáveis de ambiente:** Gerenciadas no Railway e Supabase Dashboard

---

## 📐 Estrutura do Projeto

```
clinicflow-health-hub/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/              # 49 componentes Shadcn/UI
│   │   ├── agenda/          # CalendarView, AppointmentModal
│   │   ├── financeiro/      # BillingModal, PaymentLinkGenerator
│   │   ├── landing/         # FindClinicDialog
│   │   ├── whatsapp/        # WhatsApp config components
│   │   ├── Header.tsx       # Header com nav por role
│   │   ├── ProtectedRoute.tsx # Guard de rotas com roles
│   │   └── WhatsAppCTA.tsx  # Botão flutuante global
│   ├── contexts/
│   │   ├── AuthContext.tsx   # Auth + RBAC context
│   │   └── OrganizationContext.tsx
│   ├── pages/               # 20 páginas
│   └── integrations/
│       └── supabase/        # Client, types e hooks
├── supabase/
│   ├── functions/           # 5 Edge Functions (Deno)
│   └── migrations/          # 13 migrations SQL
├── public/
└── package.json
```

---

## 🎯 Destaques Técnicos para Recrutadores

1. **RBAC completo** — Implementação de controle de acesso em 3 camadas: rota, componente e banco de dados
2. **Multi-tenancy** — Arquitetura preparada para múltiplas clínicas isoladas
3. **Integração Stripe** — Checkout, webhooks e gestão de assinaturas
4. **Serverless Functions** — 5 Edge Functions em Deno para lógica de negócio
5. **Row Level Security** — Segurança no nível do PostgreSQL, não apenas no frontend
6. **TypeScript end-to-end** — Tipagem forte no frontend e nas Edge Functions
7. **CI/CD** — Deploy automático via GitHub → Railway
8. **Design System** — 49+ componentes reutilizáveis com Radix UI
9. **Modo Demo inteligente** — Seletor visual de perfis para demonstração do RBAC
10. **UX profissional** — Skeleton loaders, empty states, toast notifications, responsividade total

---

## 👤 Autor

**Davi Santos**
- Email: davisantossousa2@gmail.com
- WhatsApp: (89) 98101-3110
