# Instruções para o Ambiente de Demonstração (Demo)

Este projeto contém funcionalidades de demonstração que requerem dados fictícios e algumas configurações específicas para que tudo opere de forma suave e realista para quem for testar a plataforma.

Abaixo estão as instruções manuais para configurar este ambiente:

## 1. Banco de Dados e Dados Fictícios

Para que a experiência do usuário na demo funcione corretamente (exibindo pacientes, consultas, métricas e perfis de diferentes níveis de acesso), você deve popular o banco de dados com os dados de demonstração.

*   **Passo 1:** Garanta que seu projeto do Supabase esteja rodando.
*   **Passo 2:** Vá até o painel SQL do seu projeto no Supabase, ou execute localmente o script de *seed*.
*   **Passo 3:** Execute o script `supabase/demo_seed.sql` no banco de dados. Ele inserirá os usuários iniciais, dados de organização, perfis e roles (como owner/admin, recepcionista e médico), além de pacientes e consultas de forma bastante realista.

> **Aviso:** Se você estiver fazendo o *deploy* em produção e quiser apenas um ambiente de demo para portfólio, é recomendável usar um banco de dados separado (projeto Supabase diferente) para não misturar os dados de demonstração com dados reais.

## 2. Variáveis de Ambiente Necessárias

Certifique-se de que o seu `.env` ou o ambiente de *deploy* possui as seguintes variáveis configuradas para que todas as integrações da aplicação funcionem corretamente:

```env
# Banco de Dados e Autenticação (Supabase)
VITE_SUPABASE_URL="URL_DO_SEU_PROJETO_SUPABASE"
VITE_SUPABASE_PUBLISHABLE_KEY="SUA_CHAVE_PUBLICA_SUPABASE"

# Integração de Pagamentos (Stripe - Edge Functions)
STRIPE_SECRET_KEY="SUA_CHAVE_SECRETA_DO_STRIPE"
STRIPE_WEBHOOK_SECRET="SEU_SEGREDO_DE_WEBHOOK_DO_STRIPE"

# Integração de Email (SendGrid - Edge Functions)
SENDGRID_API_KEY="SUA_CHAVE_DE_API_DO_SENDGRID"

# Integração de WhatsApp (Bot - Edge Functions)
WHATSAPP_GATEWAY_URL="URL_DA_API_DE_WHATSAPP_SE_HOUVER"
```

> **Nota sobre o WhatsApp:** A plataforma suporta um modo de simulação que responde usando o estado local, caso o webhook retorne em modo simulado. Porém, em um ambiente totalmente de produção para mensagens reais, seria necessária uma API ou Gateway como a "Evolution API" configurada.

## 3. Contas de Teste (Logins Demo)

O botão "Acessar Demo" na página inicial (`/`) redireciona o usuário para o `/login?demo=true`.
Lá, o sistema oferece 3 perfis configurados via `demo_seed.sql`:

*   **Administrador / Gestor:** `admin@vidasaudavel.com` (Senha: `123456`)
*   **Recepcionista:** `ana@vidasaudavel.com` (Senha: `123456`)
*   **Médico:** `silva@vidasaudavel.com` (Senha: `123456`)

> Se encontrar problemas para realizar o login através destes dados, verifique se a funcionalidade de *Confirm Email* do Supabase está desativada no seu projeto, ou aprove os usuários criados no menu *Authentication*.

## 4. Diferenças entre Níveis de Acesso na Demo

*   **Administrador (Owner/Admin):** Tem acesso ao painel financeiro, configurações, WhatsApp Bot, relatórios completos e assinaturas.
*   **Recepcionista:** Pode gerenciar a agenda de todos os médicos, registrar pacientes e iniciar conversas ou cobranças, mas não acessa a aba "Financeiro" global ou configurações sensíveis.
*   **Médico:** Tem a visão restrita à sua própria agenda (os agendamentos associados a ele) e seus pacientes, com permissões para adicionar notas ou visualizar as consultas marcadas para o dia.

Siga estas instruções e seu portfólio estará pronto para exibir um sistema SaaS completo!