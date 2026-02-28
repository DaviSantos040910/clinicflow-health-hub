# Checklist de Deploy (Vercel + Supabase)

## 1. Variáveis de Ambiente (Vercel)
Configure as seguintes chaves nas configurações do projeto na Vercel (Project Settings > Environment Variables):

### Frontend (Expostos para o cliente)
- `VITE_SUPABASE_URL`: Sua URL do Supabase (ex: https://xyz.supabase.co)
- `VITE_SUPABASE_ANON_KEY`: Sua chave pública `anon` do Supabase.

### Backend (Edge Functions)
As Edge Functions rodam no Supabase, não na Vercel. Configure estas no Dashboard do Supabase (Settings > Edge Functions):
- `STRIPE_SECRET_KEY`: Chave secreta da API do Stripe (`sk_test_...` ou `sk_live_...`).
- `STRIPE_WEBHOOK_SECRET`: Segredo de assinatura do Webhook do Stripe (`whsec_...`).
- `SENDGRID_API_KEY`: Chave de API do SendGrid para envio de e-mails (`SG...`).
- `SUPABASE_URL`: (Geralmente auto-configurado, mas verifique).
- `SUPABASE_SERVICE_ROLE_KEY`: (Auto-configurado, usado para operações admin).

## 2. Configurações de Build (Vercel)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` (ou `bun install` se usar Bun)

## 3. Webhooks (Configuração Externa)
- **Stripe**: Aponte o webhook para `https://<seu-projeto>.supabase.co/functions/v1/stripe-webhook`.
  - Eventos necessários:
    - `checkout.session.completed`
    - `invoice.payment_succeeded`
    - `customer.subscription.deleted`

## 4. Banco de Dados
- Certifique-se de ter rodado todas as migrações SQL.
- (Opcional) Rode o script `supabase/seed.sql` para popular dados de teste se for um ambiente de Staging.

## 5. Verificações Finais
- [ ] O domínio personalizado da Landing Page está configurado?
- [ ] O DNS para o SendGrid (CNAMEs) está validado para evitar Spam?
- [ ] O Stripe está em modo "Live" (Produção)?
