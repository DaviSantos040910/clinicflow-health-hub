# Guia Definitivo de Deploy (Railway + Supabase)

Este guia foi criado passo a passo para iniciantes. Vamos colocar o seu projeto no ar, dividindo a infraestrutura em duas partes:
1. **Supabase**: Seu banco de dados, autenticação e servidor (Backend / Edge Functions).
2. **Railway**: A hospedagem da sua aplicação feita em React e Vite (Frontend).

Siga os passos exatamente nesta ordem!

---

## Parte 1: Configurando o Banco e Backend (Supabase)

O código já possui o Supabase totalmente integrado, mas precisamos de um ambiente "Real" na nuvem.

### Passo 1: Criar o Projeto
1. Acesse [Supabase.com](https://supabase.com) e crie sua conta (ou faça login).
2. Clique em **"New Project"**.
3. Escolha um nome, defina uma senha forte para o banco de dados e aguarde a criação (leva cerca de 2 minutos).

### Passo 2: Configurar o Banco de Dados (Subir Migrations)
Seu projeto local tem tabelas cruciais (na pasta `supabase/migrations`). Você precisa enviar isso para a nuvem.
1. Abra o terminal (no VSCode ou outro na pasta do seu projeto).
2. Faça login pelo terminal (isso pedirá para você ir até o navegador copiar um token):
   ```bash
   npx supabase login
   ```
3. Vincule a sua conta da nuvem ao seu projeto local:
   ```bash
   npx supabase link --project-ref AQUI_VAI_A_SUA_REF
   ```
   > **Como descobrir SUA_REF**: Vá em *Project Settings* (no Supabase), a "Reference ID" são aquelas letrinhas aleatórias da sua URL. O próprio comando link guiará você.
4. Empurre suas tabelas pro banco online (este comando irá solicitar a senha do banco criada no passo 1):
   ```bash
   npx supabase db push
   ```

### Passo 3: Hospedar suas Funções (E-mail e Pagamentos)
Temos funções como o Checkout (Stripe) e E-mails (MailerSend). Elas ficam na pasta `supabase/functions/`. Vamos hospedá-las.
1. No terminal, digite:
   ```bash
   npx supabase functions deploy
   ```
2. Após o sucesso, configure as chaves secretas (Senhas de verdade das APIS, não de teste) que farão elas funcionar no ambiente real:
   ```bash
   npx supabase secrets set STRIPE_SECRET_KEY=sua_chave_secreta_stripe
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=sua_secret_de_webhook
   npx supabase secrets set MAILERSEND_API_KEY=sua_chave_api_mailersend
   ```

### Passo 4: Pegar Chaves para a Próxima Etapa
Vá no painel do Supabase, em **Project Settings > API**:
- Guarde a **Project URL** (ex: `https://xyz.supabase.co`).
- Guarde a **Project API Key (anon / public)**.
*Elas serão o "coração" que conectará seu Frontend (Railway) ao Banco.*

---

## Parte 2: Fazendo o Deploy no Railway (Frontend)

O Railway descobre automaticamente que o projeto é Vite e já constrói o app para você. Configuramos o arquivo `package.json` para facilitar sua vida (o comando `npm start` usando `serve`).

### Passo 1: Atualizar o GitHub
Seu repositório no GitHub deve estar atualizado com o código atual. Use os comandos padrões de Git para fazer isso (`git commit` e `git push`).

### Passo 2: Criar Projeto no Railway
1. Acesse [Railway.app](https://railway.app), logue com seu GitHub.
2. Na página inicial, clique em **"New Project"**.
3. Selecione **"Deploy from GitHub repo"** e procure pelo repositório do seu projeto (ex: `clinicflow-health-hub`).
4. Clique na sua nova aplicação e veja que ela vai começar o "Build" (Construção). Deixe estar ou clique para abortar, porque antes precisamos colocar as variáveis do passo 4 anterior.

### Passo 3: Configurar Variáveis (Coração do Frontend)
Sem isso, a página não carregará sistema de login algum.
1. No painel do seu app no Railway, acesse a aba **"Variables"** (Variáveis).
2. Adicione **DUAS** novas variáveis clicando em "New Variable". O nome deve ser em caps lock exatamente assim:
   - Variável 1: `VITE_SUPABASE_URL` -> (Cole a URL do Supabase, com https://)
   - Variável 2: `VITE_SUPABASE_PUBLISHABLE_KEY` -> (Cole a chave "anon" do Supabase)

### Passo 4: Expor na Web (Domínio)
1. Mude para a aba **"Settings"** (Configurações) no Railway.
2. Desça até encontrar a área de **Networking**.
3. Clique em **"Generate Domain"** (Gerar Domínio).
   *O Railway vai criar um link público seu. Algo como: `nome-app.up.railway.app`.*

### Passo 5: Autorizar o Acesso (A Cereja do Bolo)
Se você tentar entrar agora, será impedido de logar. Precisamos dizer ao Supabase que este novo site tem permissão.
1. Volte ao site do **Supabase**.
2. Vá em **Authentication > URL Configuration**.
3. Em *Site URL*, insira o seu novo link inteiro gerado pelo Railway (ex: `https://nome-app.up.railway.app`).
4. Em *Redirect URLs*, insira exatamente a mesma URL e adicione as rotas importantes (ou apenas confie na principal, no modelo padrão). Salve.

### Passo 6: Acesse seu Sistema!
1. Volte ao Railway e clique no novo Domínio Público que foi gerado.
2. A página deve carregar, e você já pode criar contas e testar a aplicação no ar!

---

## Checklist Rápido Pós-Deploy

- [ ] O domínio público gerado pelo Railway abre a landing page do ClinicFlow?
- [ ] O botão de acesso leva ao formulário de Login, permitindo o cadastro?
- [ ] Os webhooks e painéis em `Stripe` ou `MailerSend` estão apontando para o seu novo site e suas novas rotas Supabase na nuvem? (Crucial para emissões e cobranças onlines!)
- [ ] Está tudo configurado como SSL/HTTPS? Sim! O Railway e Supabase fazem isso sozinhos por você.
