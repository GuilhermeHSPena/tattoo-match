# Tattoo Match

Aplicação web completa para conectar clientes e tatuadores. Projeto acadêmico UNIVESP.

## Stack

- **Next.js 14** (App Router) — frontend + API Routes
- **Prisma 5** — ORM e migrations
- **PostgreSQL** (Neon / Vercel Postgres) — banco de dados
- **NextAuth v4** — autenticação com JWT
- **Recharts** — gráficos do dashboard
- **Jest** — testes unitários
- **GitHub Actions** — integração contínua
- **Vercel** — deploy (igual ao Mapa-Bateria)

---

## Estrutura

```
tattoo-match/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.js   # NextAuth handler
│   │   │   └── register/route.js       # POST /api/auth/register
│   │   ├── tattoos/
│   │   │   ├── route.js                # GET, POST /api/tattoos
│   │   │   └── [id]/route.js           # DELETE /api/tattoos/:id
│   │   ├── requests/
│   │   │   ├── route.js                # GET, POST /api/requests
│   │   │   └── [id]/status/route.js    # PATCH /api/requests/:id/status
│   │   └── analytics/
│   │       ├── summary/route.js
│   │       ├── over-time/route.js
│   │       └── top-tattoos/route.js
│   ├── page.js          # Home
│   ├── login/page.js
│   ├── register/page.js
│   ├── gallery/page.js
│   ├── dashboard/page.js   # Painel do cliente
│   └── admin/page.js       # Painel do tatuador
├── components/
│   └── Navbar.js
├── lib/
│   ├── prisma.js       # Singleton do Prisma Client
│   ├── auth.js         # Configuração do NextAuth
│   ├── apiHelpers.js   # ok(), err(), requireSession(), requireRole()
│   └── apiClient.js    # Cliente HTTP para o frontend
├── prisma/
│   └── schema.prisma
├── __tests__/
│   └── api.test.js     # 16 testes unitários com Jest
└── .github/workflows/ci.yml
```

---

## Desenvolvimento local

### 1. Clone e instale

```bash
git clone <seu-repo>
cd tattoo-match
npm install
```

### 2. Banco de dados local

Crie um banco PostgreSQL local ou use o [Neon](https://neon.tech) (gratuito):
- No Neon: New Project → copie a connection string

### 3. Variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais.

Para gerar o `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Migrations e execução

```bash
npx prisma migrate dev --name initial
npm run dev
```

Acesse `http://localhost:3000`.

---

## Testes

```bash
npm test
```

Os 16 testes cobrem: helpers da API (ok/err), validação de registro, validação de status de pedido, agrupamento de analytics por dia, e formatação de resposta de tatuagem.

---

## Deploy no Vercel

Idêntico ao Mapa-Bateria:

1. Suba o código no GitHub
2. No [vercel.com](https://vercel.com): **New Project** → importa o repositório
3. Adicione as variáveis de ambiente:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | Connection string do Neon/Vercel Postgres |
| `DIRECT_URL` | Mesma connection string (necessário para migrations) |
| `NEXTAUTH_SECRET` | String aleatória longa (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL do deploy, ex: `https://tattoo-match.vercel.app` |

4. **Deploy** — o Vercel detecta Next.js automaticamente.

Para rodar as migrations em produção:
```bash
npx prisma migrate deploy
```

---

## Endpoints da API

### Auth
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Cadastro |
| POST | `/api/auth/signin` | Público | Login (NextAuth) |

### Tatuagens
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/tattoos` | Público | Lista (filtros: category, size, artist_id) |
| POST | `/api/tattoos` | Tatuador | Cadastra no portfólio |
| DELETE | `/api/tattoos/:id` | Tatuador | Remove do portfólio |

### Pedidos
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/requests` | Cliente | Cria pedido |
| GET | `/api/requests` | Autenticado | Cliente vê os próprios; tatuador vê os das suas tatuagens |
| PATCH | `/api/requests/:id/status` | Tatuador | Aprova ou recusa |

### Analytics
| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| GET | `/api/analytics/summary` | Tatuador | Totais por status |
| GET | `/api/analytics/over-time` | Tatuador | Pedidos por dia |
| GET | `/api/analytics/top-tattoos` | Tatuador | Top 10 mais pedidas |

---

## Requisitos UNIVESP atendidos

| Requisito | Como está atendido |
|---|---|
| Framework web | Next.js 14 |
| Banco de dados | PostgreSQL via Prisma |
| JavaScript | React, Next.js, Recharts |
| Nuvem | Vercel |
| Acessibilidade | ARIA, WCAG AA, navegação por teclado |
| Controle de versão | Git / GitHub |
| Integração contínua | GitHub Actions |
| Testes | Jest (16 testes unitários) |
| API | REST API documentada acima |
| Análise de dados | Dashboard com gráficos de pedidos |
