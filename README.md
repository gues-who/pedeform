# Pedeform

Plataforma de Concierge Digital e Experiência Fluida (Seamless) para Alta Gastronomia.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Front-end | Next.js 16 + TypeScript + Tailwind CSS + Framer Motion |
| Back-end | Node.js + NestJS + TypeScript |
| Tempo real | WebSockets (Socket.IO) |
| Pagamentos | Stripe (pendente) |
| Banco de dados | PostgreSQL + MongoDB (pendente — ambiente local usa mock in-memory) |

## Estrutura

```
apps/
  web/    # Next.js — cliente (mesa), painéis admin
  api/    # NestJS — REST /v1 + WebSocket /realtime
packages/
  shared/ # Tipos e constantes de domínio compartilhados
```

## Como rodar localmente

### Pré-requisitos
- Node.js >= 20
- npm >= 9

### Instalar dependências

```bash
npm install
```

### Variáveis de ambiente

Crie os arquivos abaixo (não estão no git por segurança):

**`apps/api/.env`**
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

**`apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/v1
NEXT_PUBLIC_WS_URL=http://localhost:3001
API_BASE_URL=http://localhost:3001/v1
```

### Iniciar

```bash
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/v1
- Mesa demo: http://localhost:3000/mesa/demo
- Admin: http://localhost:3000/admin

## Módulos

| Módulo | Área | Rota |
|--------|------|------|
| Cliente | Experiência de mesa | `/mesa/[mesaId]` |
| Admin / Maître | Operação e financeiro | `/admin` |
| API REST | Cardápio, pedidos, mesas | `GET/POST /v1/...` |
| WebSocket | Tempo real mesa ↔ cozinha | `ws://…/realtime` |

## Fluxo de pedido

1. Cliente acessa `/mesa/demo` (ou escaneia QR code)
2. Navega pelo cardápio e adiciona itens
3. Revisa o pedido e clica **"Enviar à cozinha"**
4. API cria o pedido e emite `order.created` via WebSocket
5. Página **Acompanhar** mostra progresso em tempo real (`pending → preparing → almost_ready → served`)
6. Conta com divisão por convidado e checkout via Stripe (pendente)
