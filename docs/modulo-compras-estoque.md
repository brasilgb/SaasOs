# Módulo de Compras (Ordens de Compra) conectado ao Estoque

> Status: implementado em 2026-09-16 (backend + frontend). Este documento é o plano original de implementação, mantido como referência arquitetural do módulo.

## Contexto

O sistema de estoque atual (`Part` + `PartMovement`) só sabe **consumir** estoque (uso em OS, venda, garantia) ou receber ajustes manuais soltos, gerados ao editar a peça diretamente. Não existe fornecedor como entidade, não existe ordem de compra, e a entrada de estoque não deixa rastro de "por que entrou" nem se conecta ao financeiro. O objetivo deste módulo é fechar esse ciclo: cadastrar fornecedores, criar ordens de compra com itens, e ao confirmar o recebimento, dar entrada automática no estoque (com `PartMovement` dedicado) e gerar a conta a pagar correspondente — reaproveitando ao máximo os padrões já existentes no projeto (`Tenantable`, `TenantSequence`, `AccountPayable.source_type`, etc.) em vez de criar um sistema paralelo.

## Decisões de produto (v1)

1. **Custo da peça**: ao receber, `cost_price` da `Part` é sobrescrito com o custo unitário do recebimento (sem média ponderada nesta v1).
2. **Financeiro**: ao confirmar o recebimento, gera automaticamente uma `AccountPayable` (`source_type = 'purchase_order'`), reaproveitando o padrão já usado por `technician_commission`.
3. **Recebimento**: só total (tudo ou nada) nesta v1 — sem recebimento parcial por item.
4. **Menu**: grupo próprio "Compras" no `navLinks.ts`, separado do grupo "Estoque" existente.

Fluxo de status da ordem de compra: `rascunho` (editável) → `enviada` (travada, aguardando fornecedor) → `recebida` (dispara estoque + financeiro) | `cancelada` (a partir de rascunho ou enviada, sem efeito colateral).

## Modelo de dados

Segue o padrão de `Tenantable` (`app/Tenantable.php`) + `TenantSequence::next()` (`app/Support/TenantSequence.php`), já usados em `Part`/`AccountPayable`.

- **`suppliers`**: `id, tenant_id, name, document, phone, email, notes, status, timestamps`.
- **`purchase_orders`**: `id, tenant_id, purchase_order_number (sequencial por tenant), supplier_id, status, total_amount, expected_date, received_at, notes, created_by, timestamps`.
- **`purchase_order_items`**: `id, purchase_order_id, part_id, quantity, unit_cost, timestamps` — sem `tenant_id` (segue o padrão de `SaleItem`, sempre acessado via relação com o pai já tenantizado).
- **`purchase_order_logs`**: idêntica em estrutura a `account_payable_logs` (auditoria por ação).
- **`part_movements`**: ganhou a coluna `purchase_order_id` (nullable, FK própria — não reaproveita `order_id`, que é FK de `orders`) e o novo tipo de movimento `PartMovement::TYPE_PURCHASE = 'compra'`.

## Backend

- **Models novos**: `Supplier`, `PurchaseOrder`, `PurchaseOrderItem`, `PurchaseOrderLog` (`app/Models/App/`).
- **Models editados**: `PartMovement` (+ `TYPE_PURCHASE`, relação `purchaseOrder()`), `AccountPayable` (+ `SOURCE_PURCHASE_ORDER`).
- **`app/Services/PurchaseOrderService.php`**: `create`, `update` (só em rascunho), `send`, `receive` (dá entrada no estoque com `lockForUpdate()` + `PartMovement` + gera `AccountPayable` via `AccountPayableService`), `cancel`, `delete`. Segue o padrão de `AccountPayableService`.
- **`app/Policies/PurchaseOrderPolicy.php`**: `viewAny/create/update/delete` com checagem de `hasPermission('purchase_orders')` + mesmo tenant. Fornecedor usa um `Gate::define('suppliers.access', ...)` simples, sem policy dedicada.
- **Permissões**: `purchase_orders` e `suppliers` adicionadas em `User::permissions()` para admin/root e operador — técnico não tem acesso.
- **Controllers**: `SupplierController` (CRUD simples) e `PurchaseOrderController` (fino, delega ao service) em `app/Http/Controllers/App/`.
- **Rotas**: `routes/app.php` — `suppliers` (resource sem show/create/edit) e `purchase-orders` (resource + `send`/`receive`/`cancel`).

## Frontend

- **`resources/js/pages/app/suppliers/index.tsx`**: listagem + modal de criar/editar, no molde de `accounts-payable/index.tsx`.
- **`resources/js/pages/app/purchase-orders/index.tsx`**: listagem com filtro por status, ações contextuais (Editar/Enviar/Excluir em rascunho; Receber/Cancelar em enviada).
- **`resources/js/pages/app/purchase-orders/create.tsx`**: formulário completo (reaproveitado para criar e editar) com lista repetível de itens, usando `AsyncResourceSelect` + o endpoint `app.parts.search` já existente para autocomplete de peças.
- **`resources/js/Utils/navLinks.ts`**: novo grupo "Compras" (ícone `Truck`), com itens "Ordens de compra" e "Fornecedores" (ícone `Building2`), visibilidade controlada pela permissão do usuário.

## Verificação realizada

- `php -l` em todos os arquivos PHP novos/editados — sem erros de sintaxe.
- `php artisan migrate` das 5 migrations novas — aplicadas com sucesso em ambiente local.
- Teste end-to-end via Tinker: criação de fornecedor → PO com item → `send` → `receive` — confirmado que `parts.quantity` e `cost_price` são atualizados, `part_movements` recebe registro `movement_type = 'compra'` vinculado à PO, e `accounts_payable` é gerada automaticamente com `source_type = 'purchase_order'` e valor batendo com o total da PO. Registros de teste removidos ao final.
- `npx tsc --noEmit` — zero erros em todo o projeto.
- `npm run build` — build de produção do Vite concluído sem erros.

## Pendente (não coberto nesta v1)

- Testes automatizados (Pest/PHPUnit) para o fluxo de compras — o projeto não tinha testes equivalentes para `AccountPayable`/`Part` para servir de referência direta.
- Teste manual no navegador (login real, navegação pelas telas) — não executado nesta sessão.
- Recebimento parcial por item, custo médio ponderado e geração de PDF/etiqueta da ordem de compra ficaram fora do escopo por decisão do usuário.
