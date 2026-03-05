<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-BaaS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Railway-Deploy-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" alt="Railway" />
</p>

<h1 align="center">🚀 ServiceFlow</h1>

<p align="center">
  <strong>Plataforma SaaS de Gestão e Agendamento para o Seu Negócio</strong>
</p>

<p align="center">
  Gerencie clientes, agenda, equipe e financeiro em um só lugar.<br/>
  Demo configurada para clínicas — adaptável para salões, academias, consultórios e mais.
</p>

<p align="center">
  <a href="https://serviceflow.up.railway.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-serviceflow.up.railway.app-7C3AED?style=for-the-badge" alt="Live Demo" />
  </a>
</p>

---

## 📋 Sobre o Projeto

**ServiceFlow** é uma plataforma completa de gestão para o seu negócio, construída com tecnologias modernas e arquitetura escalável. O sistema oferece controle de acesso granular (RBAC) com 4 níveis de permissão, integração com pagamentos (Stripe), e-mails automatizados (MailerSend) e chatbot WhatsApp.

### ✨ Destaques

- 🔐 **RBAC com 4 níveis** — Admin, Recepcionista, Financeiro e Profissional
- 🏢 **Multi-tenancy** — Arquitetura preparada para múltiplas organizações isoladas
- 💳 **Integração Stripe** — Checkout, webhooks e gestão de assinaturas
- 📧 **E-mails transacionais** — MailerSend integrado via Edge Functions
- 🤖 **WhatsApp Bot** — Configuração de chatbot para atendimento automático
- 🛡️ **Row Level Security** — Segurança no nível do PostgreSQL, não apenas no frontend
- 📱 **Responsivo** — Mobile-first com design premium e glassmorphism

---

## 🖥️ Demo

Acesse a demo em **[serviceflow.up.railway.app](https://serviceflow.up.railway.app/)** e explore o sistema com 3 perfis pré-configurados:

| Perfil | Email | Senha |
|---|---|---|
| 👑 **Administrador** | `admin@vidasaudavel.com` | `123456` |
| 🧑‍💼 **Recepcionista** | `ana@vidasaudavel.com` | `123456` |
| 🩺 **Médico** | `silva@vidasaudavel.com` | `123456` |

> Clique em **"Ver Demo"** na landing page para acessar os perfis com auto-preenchimento.

---

## 🛠️ Tech Stack

### Frontend
| Tecnologia | Descrição |
|---|---|
| **React 18** | Biblioteca principal de UI (SPA) |
| **TypeScript** | Tipagem estática em todo o projeto |
| **Vite** | Bundler e dev server ultrarrápido |
| **React Router v6** | Roteamento com rotas protegidas e redirect por role |
| **Shadcn/UI** | 49+ componentes (Radix UI + Tailwind CSS) |
| **Tailwind CSS** | Estilização utilitária responsiva |
| **TanStack React Query** | Gerenciamento de estado assíncrono e cache |
| **Zod** | Validação de schemas em formulários |
| **Recharts** | Gráficos e visualizações de dados |

### Backend & Infraestrutura
| Tecnologia | Descrição |
|---|---|
| **Supabase** | Backend-as-a-Service (PostgreSQL + Auth + Edge Functions) |
| **PostgreSQL** | Banco relacional com RLS, views e procedures |
| **Supabase Auth** | Autenticação com JWT e Row Level Security |
| **Edge Functions** | 5 serverless functions (Deno runtime) |
| **Stripe** | Processamento de pagamentos e assinaturas |
| **MailerSend** | Disparo de e-mails transacionais |
| **Railway** | Hospedagem com CI/CD via GitHub |

---

## 🏗️ Arquitetura

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                    │
│  Landing Page · Login · Dashboard · Agenda · Pacientes       │
│  Profissionais · Financeiro · WhatsApp Config · Contato      │
├──────────────────────────────────────────────────────────────┤
│                      SUPABASE CLOUD                          │
│  ┌──────────┐  ┌────────────┐  ┌──────────────────────────┐ │
│  │   Auth    │  │  Database  │  │     Edge Functions       │ │
│  │ (JWT/RLS) │  │ (Postgres  │  │  · send-email            │ │
│  │           │  │  + RLS)    │  │  · create-checkout       │ │
│  └──────────┘  └────────────┘  │  · stripe-webhook        │ │
│                                │  · whatsapp-webhook       │ │
│                                │  · generate-payment       │ │
│                                └──────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│                   SERVIÇOS EXTERNOS                          │
│     Stripe (pagamentos) · MailerSend (e-mails)               │
│     WhatsApp Business API (chatbot)                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura do Projeto

```
ServiceFlow/
├── src/
│   ├── components/           # Componentes reutilizáveis
│   │   ├── ui/               # 49 componentes Shadcn/UI
│   │   ├── agenda/           # CalendarView, AppointmentModal
│   │   ├── financeiro/       # BillingModal, PaymentLinkGenerator
│   │   ├── landing/          # FindClinicDialog
│   │   ├── whatsapp/         # WhatsApp config components
│   │   ├── Header.tsx        # Header com navegação por role
│   │   ├── Logo.tsx          # Componente de logo
│   │   ├── ProtectedRoute.tsx # Guard de rotas com roles
│   │   └── WhatsAppCTA.tsx   # Botão flutuante global
│   ├── contexts/
│   │   ├── AuthContext.tsx    # Auth + RBAC context
│   │   └── OrganizationContext.tsx
│   ├── pages/                # 20 páginas da aplicação
│   └── integrations/
│       └── supabase/         # Client, types e hooks
├── supabase/
│   ├── functions/            # 5 Edge Functions (Deno)
│   └── migrations/           # 13 migrations SQL
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

---

## 🔐 Sistema de Permissões (RBAC)

O sistema implementa **Role-Based Access Control** com 4 níveis:

| Funcionalidade | Admin | Recepcionista | Financeiro | Profissional |
|---|:---:|:---:|:---:|:---:|
| Dashboard completo | ✅ | ✅ | ✅ | 📌 Apenas seus dados |
| Receita mensal | ✅ | ❌ | ✅ | ❌ |
| Gerenciar agenda (todos) | ✅ | ✅ | ✅ | 📌 Apenas a sua |
| Gerenciar pacientes | ✅ | ✅ | ✅ | 📌 Apenas os seus |
| Excluir pacientes | ✅ | ❌ | ❌ | ❌ |
| Observações de consulta | ❌ | ❌ | ❌ | ✅ Exclusivo |
| Profissionais (CRUD) | ✅ | 👁️ | 👁️ | ❌ |
| Financeiro completo | ✅ | ✅ | ✅ | ❌ |
| Config. WhatsApp | ✅ | ✅ | ✅ | ❌ |

**Implementação em 3 camadas:**
- **Rota** → `<ProtectedRoute allowedRoles={[...]}>`
- **Componente** → `useAuth()` com `hasPermission()`
- **Banco** → PostgreSQL Row Level Security (RLS)

---

## 🚀 Começando

### Pré-requisitos

- **Node.js** ≥ 18
- **npm** ≥ 9
- Conta no [Supabase](https://supabase.com) (backend)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/DaviSantos040910/ServiceFlow.git

# 2. Entre no diretório do projeto
cd ServiceFlow

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase
```

### Variáveis de Ambiente

```env
# Supabase (obrigatório)
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-anon-publica"

# Stripe (Edge Functions)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# MailerSend (Edge Functions)
MAILERSEND_API_KEY="mlsn...."
```

### Executando

```bash
# Modo de desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview do build
npm run preview
```

---

## 🌐 Deploy

O projeto está configurado para deploy no **Railway** com CI/CD automático via GitHub.

| Componente | Plataforma |
|---|---|
| Frontend (React/Vite) | Railway |
| Backend (PostgreSQL + Auth) | Supabase |
| Edge Functions (Serverless) | Supabase |
| Pagamentos | Stripe |
| E-mails | MailerSend |

> 📖 Consulte o [DEPLOY.md](./DEPLOY.md) para o guia completo passo a passo.

---

## 📊 Funcionalidades

<table>
  <tr>
    <td>

**🏠 Landing Page**
- Design premium com gradientes e glassmorphism
- Seção de funcionalidades com cards interativos
- Planos de preço e CTA de WhatsApp

</td>
    <td>

**📊 Dashboard**
- Cards de estatísticas em tempo real
- Botões de ação rápida
- Lista de próximas consultas

</td>
  </tr>
  <tr>
    <td>

**📅 Agenda**
- Visão diária e semanal
- Modal de criação/edição de agendamentos
- Integração financeira por consulta

</td>
    <td>

**👥 Pacientes**
- Busca avançada por nome, email ou telefone
- Painel lateral com histórico completo
- Observações exclusivas por profissional

</td>
  </tr>
  <tr>
    <td>

**💰 Financeiro**
- Visão geral de receitas e despesas
- Geração de links de pagamento (Stripe)
- Gráficos e métricas financeiras

</td>
    <td>

**🤖 WhatsApp Bot**
- Chatbot de atendimento automático
- Mensagens de boas-vindas e triagem
- Webhook para processamento de mensagens

</td>
  </tr>
</table>

---

## 🎯 Destaques Técnicos

| # | Destaque | Descrição |
|---|---|---|
| 1 | **RBAC Completo** | 4 níveis de acesso em 3 camadas (rota, componente, banco) |
| 2 | **Multi-tenancy** | Organizações isoladas com Row Level Security |
| 3 | **Integração Stripe** | Checkout, webhooks e gestão de assinaturas |
| 4 | **Edge Functions** | 5 serverless functions em Deno (Supabase) |
| 5 | **TypeScript E2E** | Tipagem forte no frontend e nas Edge Functions |
| 6 | **CI/CD** | Deploy automático GitHub → Railway |
| 7 | **Design System** | 49+ componentes com Radix UI + Tailwind |
| 8 | **Demo Inteligente** | Seletor visual de perfis com auto-preenchimento |
| 9 | **UX Profissional** | Skeleton loaders, empty states, toast, responsivo |
| 10 | **Segurança** | RLS no PostgreSQL + JWT Auth + RBAC |

---

## 👤 Autor

<table>
  <tr>
    <td align="center">
      <strong>Davi Santos</strong><br/>
      Full Stack Developer<br/><br/>
      <a href="mailto:davisantossousa2@gmail.com">📧 davisantossousa2@gmail.com</a><br/>
      <a href="https://wa.me/5589981013110">💬 WhatsApp: (89) 98101-3110</a><br/>
      <a href="https://github.com/DaviSantos040910">🐙 GitHub</a>
    </td>
  </tr>
</table>

---

<p align="center">
  Feito com ❤️ por <strong>Davi Santos</strong>
</p>
