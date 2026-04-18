# SigmaOS

Plataforma web para assistências técnicas com gestão de atendimento, clientes, ordens, follow-ups, cobranças, indicadores, financeiro e portal público do cliente.

## Stack

- PHP 8.2
- Laravel 12
- React 19 + TypeScript
- Inertia.js
- Tailwind CSS 4
- shadcn/ui + Radix UI

## Principais módulos

- Cadastros de clientes, equipamentos, serviços, peças e checklists
- Ordens de serviço com orçamento, pagamentos, comprovantes e recibos
- Portal público da OS por `tracking_token`
- Follow-ups de orçamento e cobrança
- Tarefas operacionais e performance comercial
- Indicadores de qualidade, garantia e avaliações de clientes
- Vendas, despesas e caixa
- Configuração SMTP por tenant

## Requisitos

- PHP 8.2+
- Composer
- Node.js 20+
- Banco de dados compatível com Laravel

## Instalação

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm run dev
```

## Comandos úteis

```bash
composer dev
php artisan test
npm run types
```

Observação: no estado atual do projeto, `npm run types` ainda pode falhar por erros TypeScript antigos em arquivos não relacionados às features recentes.

## Configurações gerais

A tela `Outras configurações` foi organizada em duas abas:

### Sistema e SMTP

- Habilitação de recursos financeiros e operacionais do sistema
- Configuração SMTP por tenant
- Envio de e-mail de teste

### Operacionais

- Visibilidade dos menus operacionais
- Meta de retorno em garantia
- Intervalo de follow-up com cliente
- Prazo para solicitar avaliação do cliente
- Metas comerciais

## Novas features recentes

### 1. Visibilidade dos menus operacionais

Agora é possível mostrar ou ocultar menus diretamente em `Outras configurações`:

- `Acompanhamentos`
- `Tarefas`
- `Perf. comercial`
- `Garantia/Avaliações`

Essas opções controlam a navegação do app e são persistidas por tenant na tabela `others`.

### 2. Follow-up automático com chave liga/desliga

Foi adicionada a opção `Envio automático de follow-up`.

Comportamento:

- se estiver desabilitada, o sistema não envia follow-up automático de orçamento nem de cobrança
- se estiver habilitada, o sistema respeita o campo `Dias entre contatos`

Campos relacionados:

- `automatic_follow_ups_enabled`
- `communication_follow_up_cooldown_days`

### 3. Portal público da ordem de serviço

O acompanhamento público da OS foi consolidado em rotas como:

- `/os/{token}`
- `/os/{token}/receipt/{type}`
- `/os/{token}/payment-proof`
- `/os/{token}/fiscal-proof`

Capacidades:

- acompanhar status da OS
- aprovar ou reprovar orçamento
- confirmar aviso de conclusão
- confirmar retirada
- enviar avaliação do atendimento
- consultar comprovantes públicos da ordem

O fluxo público usa `tracking_token` único por ordem.

### 4. Feedback do cliente simplificado

O painel público do cliente foi simplificado para deixar a avaliação mais direta:

- nota em 5 estrelas
- opinião textual

### 5. Importação de clientes por CSV

A importação foi ajustada para ficar mais tolerante a arquivos grandes e dados inconsistentes:

- e-mails repetidos são aceitos
- CPF/CNPJ inválido ou repetido não é mais bloqueio na importação
- lotes com erro fazem fallback por linha
- a resposta final informa melhor quantidades importadas e falhas

## Multi-tenant, isolamento e segurança

O projeto trabalha com isolamento por tenant.

Endurecimentos recentes:

- configurações de `Other`, `Company` e branding carregadas por `tenant_id`
- `TenantScope` prioriza `auth()->user()->tenant_id`
- `Tenantable` preenche `tenant_id` automaticamente e restringe route model binding ao tenant atual
- policies críticas passaram a validar tenant explicitamente
- fluxos públicos da OS foram ajustados para resolver a ordem por `tracking_token` sem depender do tenant autenticado na sessão

## Migrations importantes recentes

Se o ambiente estiver desatualizado, rode:

```bash
php artisan migrate
```

Migrations recentes relacionadas a novas features:

- `2026_04_17_133257_drop_customers_tenant_id_cpfcnpj_unique`
- `2026_04_17_154103_add_menu_visibility_flags_to_others_table`
- `2026_04_17_160523_add_automatic_follow_ups_enabled_to_others_table`

## Estratégia de baseline das migrations

O projeto já acumulou muitas migrations incrementais. Para enxugar esse histórico sem quebrar clientes em produção, a estratégia recomendada é criar uma nova baseline por blocos funcionais, mantendo compatibilidade com ambientes já migrados.

Blocos atuais do schema:

- `core`: planos, tenants, usuários, cache, jobs, personal access tokens
- `cadastros`: clientes, equipamentos, serviços, checklists, mensagens, agendamentos
- `ordens`: orders, order_parts, order_status_history, order_payments, order_logs, images, receipts, companies, whatsapp_messages
- `financeiro`: sales, sale_items, sale_logs, expenses, expense_logs, cash_sessions, cash_session_logs, payments
- `configuracoes`: others, settings, branches
- `qualidade-operacao`: garantia, avaliações, follow-ups, operational_audits

Sequência segura para enxugar:

1. Congelar novas mudanças estruturais enquanto a baseline é montada.
2. Gerar a estrutura final do banco em ambiente limpo.
3. Criar novas migrations consolidadas por bloco, com o schema final já pronto.
4. Validar `migrate:fresh --seed` com os seeders atuais.
5. Só depois aposentar o histórico antigo.

Regras práticas:

- não apagar migrations antigas antes de validar a nova baseline em banco limpo
- não misturar refactor de código com refactor estrutural de banco na mesma entrega
- manter nomes e tipos finais das colunas exatamente como estão em produção
- revisar defaults importantes, especialmente em `others`, `orders`, `sales` e `cash_sessions`

Prioridade de consolidação:

1. `others` e blocos de configuração
2. `orders` e extensões de follow-up/garantia/feedback
3. `sales`, `expenses` e `cash_sessions`
4. tabelas administrativas (`periods`, `features`, `branches`, `settings`)

Checklist mínimo antes de apagar o histórico antigo:

- `php artisan migrate:fresh --seed` sobe sem erro
- login funciona
- tenant demo é criado corretamente
- OS, pagamentos, vendas e caixa funcionam
- portal público por `tracking_token` funciona
- SMTP/teste de e-mail funciona
- menus operacionais respeitam os defaults novos

Observação: hoje os seeders já foram ajustados para o estado atual do produto, então o caminho correto é primeiro validar `migrate:fresh --seed` localmente e só depois iniciar o squash real das migrations.

## Estrutura resumida

- `app/Http/Controllers/App`: controllers autenticados do painel
- `app/Http/Controllers/OsController.php`: portal público da OS
- `resources/js/pages/app`: telas React do painel
- `resources/js/pages/app/serviceorders`: acompanhamento público da OS
- `routes/app.php`: rotas autenticadas
- `routes/web.php`: rotas públicas

## Licença

Uso interno do projeto SigmaOS. Ajuste este trecho se houver política formal de licenciamento.
