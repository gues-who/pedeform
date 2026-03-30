# Pedeform — Especificação de Arquitetura e Produto

**Documento canônico.** Antes de implementar qualquer feature, fluxo de pedido, integração ou alteração estrutural, **consulte este arquivo** para manter fidelidade ao produto, aos módulos e à stack acordada.

---

## 1. Visão do produto

**Tema:** Plataforma de Concierge Digital e Experiência Fluida (Seamless) para Alta Gastronomia.

**Princípios de UX:** discrição, ritmo de serviço alinhado à cozinha, sensação premium (motion suave, hierarquia visual clara), checkout com mínima fricção.

---

## 2. Stack tecnológica (contrato do projeto)

| Camada | Tecnologia | Uso |
|--------|------------|-----|
| Front-end | **Next.js** + **TypeScript** | Web app premium (cliente), painéis Maître/KDS e admin |
| UI | **Tailwind CSS** | Design minimalista, responsivo, design tokens consistentes |
| Motion | **Framer Motion** | Transições e microinterações fluidas (sem exageros que prejudiquem performance) |
| PWA | Next.js PWA / Workbox (conforme versão) | Instalabilidade e experiência app-like onde fizer sentido |
| Back-end | **Node.js** + **NestJS** + **TypeScript** | API, domínio, integrações |
| SQL | **PostgreSQL** | Dados transacionais e de integridade: pedidos, contas, cardápio versionado, pagamentos, vínculos financeiros |
| Documento / perfil flexível | **MongoDB** | Histórico comportamental, preferências VIP, notas de CRM não estruturadas em tabela única |
| Tempo real | **WebSockets** (NestJS Gateway + cliente) | Sincronia mesa ↔ salão ↔ cozinha |
| Pagamentos | **Stripe** | Checkout, Apple Pay, Google Pay, cartões; fluxo “pagamento invisível” / 1 clique onde aplicável |
| Nuvem | **AWS** | Hospedagem, filas e serviços conforme evolução (detalhar em ADR/infra quando existir) |

**Regra:** não introduzir frameworks paralelos no mesmo papel (ex.: segundo ORM para o mesmo banco) sem decisão documentada.

---

## 3. Organização do repositório (alvo)

Monorepo recomendado para alinhar contratos e tipos:

```
apps/
  web/          # Next.js — cliente + painéis (rotas/áreas separadas por módulo)
  api/          # NestJS — HTTP + WebSocket + jobs
packages/
  shared/       # Tipos, constantes de domínio, validadores compartilhados (opcional)
```

Nomes de pastas e módulos Nest devem refletir os **módulos de negócio** abaixo.

---

## 4. Módulos de negócio e fronteiras

### 4.1 Módulo Cliente (Web App Premium)

- **QR Code → roteamento** para mesa/sessão (identificador estável no URL ou token).
- **Cardápio digital imersivo:** fotos em alta resolução, categorias, detalhes de pratos.
- **Harmonização (Sommelier):** sugestões vinculadas a itens ou menus (conteúdo gerenciável no admin).
- **Divisão de conta:** divisão por convidado/item, totais claros antes do pagamento.
- **Pagamento invisível / ultrarrápido:** fluxo com mínimos passos; integração Stripe conforme seção 8.

**Front:** rotas públicas/autenticadas por sessão de mesa; estado otimista com confirmação via API/WebSocket.

### 4.2 Módulo Salão e Cozinha (Maître & KDS)

- **Maître:** visão em tempo real do status das mesas (ritmo, tempos, alertas discretos).
- **KDS:** filas por estação/timing (entradas, principais, sobremesas), ordenação por prioridade e tempo de disparo.

**Regra de sincronia:** eventos de pedido e mudança de estado devem propagar em tempo real; evitar polling como caminho principal.

### 4.3 Módulo Gerencial e CRM (Dashboard Admin)

- **Cardápios sazonais:** versões, disponibilidade, preços, mídia.
- **CRM / VIP:** reconhecimento de cliente (quando identificado), histórico, alergias, vinhos favoritos — **MongoDB** para perfil rico e evolutivo; **PostgreSQL** para IDs e vínculos com pedidos quando necessário.
- **Analytics:** ticket médio, permanência na mesa, faturamento — agregações com fonte de verdade em PostgreSQL + pipelines conforme necessidade.

---

## 5. Arquitetura back-end (NestJS)

Padrão **em camadas** por feature/módulo:

1. **Presentation:** controllers (REST), gateways (WebSocket), DTOs de entrada com validação (`class-validator` / Zod conforme padrão adotado).
2. **Application:** casos de uso / application services (orquestração).
3. **Domain:** entidades, regras de negócio puras, interfaces de repositório.
4. **Infrastructure:** implementação de repositórios (TypeORM/Prisma + driver PG; Mongoose/MongoDB), adaptadores Stripe, filas.

**Dependência:** domínio não depende de framework; infraestrutura depende do domínio.

**Módulos Nest sugeridos (nomes ilustrativos):** `auth`, `session-mesa`, `menu`, `orders`, `payments`, `realtime`, `crm`, `analytics`, `kds`.

---

## 6. Arquitetura front-end (Next.js)

- **App Router** com segmentação por área: cliente, staff (Maître/KDS), admin.
- **Componentes** compartilhados em `components/ui` (design system leve em Tailwind).
- **Estado servidor** onde possível (RSC + fetch); **client state** para tempo real e interações densas (Zustand/React Query conforme padrão escolhido).
- **Framer Motion:** transições de layout e presença; respeitar `prefers-reduced-motion`.

---

## 7. Modelo de dados (divisão SQL vs MongoDB)

| Dado | Onde |
|------|------|
| Pedidos, itens, totais, status, mesa, pagamentos | PostgreSQL |
| Cardápio estruturado, preços, disponibilidade | PostgreSQL |
| Perfil VIP extenso, histórico de interações, preferências em evolução | MongoDB |
| Referência cruzada | IDs e metadados mínimos no SQL; documento Mongo referenciado por `customerId` / `externalId` |

---

## 8. Tempo real (WebSockets)

- **Gateway** dedicado no NestJS; autenticação por token de sessão (mesa/staff).
- **Salas ou tópicos** por `mesaId`, `cozinha`, `salão`, evitando broadcast global desnecessário.
- **Eventos tipados** compartilhados (idealmente em `packages/shared`): `order.created`, `order.updated`, `kds.item.ready`, etc.

---

## 9. Pagamentos (Stripe)

- **PaymentIntents** / Checkout conforme fluxo (mesa vs pré-autorização).
- Webhooks Stripe com idempotência e persistência de eventos em PostgreSQL.
- Suporte a **Apple Pay / Google Pay** via Stripe; testes em ambiente de staging.

---

## 10. Infraestrutura AWS (diretriz)

- API e WebSocket atrás de load balancer / API Gateway conforme desenho.
- PostgreSQL gerenciado (RDS ou equivalente); MongoDB Atlas ou documento em AWS conforme escolha.
- Segredos em Parameter Store / Secrets Manager; logs e métricas (CloudWatch).

Detalhes de VPC e CI/CD entram em documentos de infra quando existirem.

---

## 11. Convenções transversais

- **Idioma do código:** inglês para símbolos e APIs; **produto e documentação** podem ser em português.
- **API REST:** recursos no plural, versionamento `/v1` quando público externo.
- **Erros:** formato consistente (código, mensagem, detalhes opcionais); nunca vazar dados sensíveis.
- **Segurança:** HTTPS obrigatório; validar toda entrada; princípio do menor privilégio nas IAM keys AWS.

---

## 12. Fluxo crítico de referência (pedido → cozinha → pagamento)

1. Cliente escaneia QR e abre sessão da mesa.
2. Itens vão para pedido em PostgreSQL; eventos WebSocket notificam Maître e KDS.
3. KDS atualiza status; cliente vê progresso onde o produto exigir (sem ruído desnecessário).
4. Divisão de conta calculada no back-end; pagamento via Stripe; confirmação persistida e evento final.

Qualquer nova feature deve explicitar em qual etapa entra e quais módulos toca.

---

## 13. Evolução deste documento

Alterações arquiteturais relevantes devem **atualizar este arquivo** ou um ADR referenciado aqui, para que a “fonte da verdade” permaneça única.

**Última revisão conceitual:** 2025-03-23.
