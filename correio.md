# VetorOS 2 — CRM-02 Customer Equipment

## Objetivo

Implementar o cadastro de equipamentos pertencentes aos clientes, integrado à arquitetura já aprovada em DB-01, AUTH-01, CORE-01 e CRM-01.

Esta fase deve permanecer estritamente dentro do domínio de equipamentos de clientes. Não iniciar Orçamento, Ordem de Serviço, Estoque, Financeiro ou Fiscal.

## Fonte de verdade

Respeitar integralmente a arquitetura já existente no repositório `vetoros2`.

Não alterar migrations aprovadas anteriormente.

Não copiar arquitetura, migrations ou regras do VetorOS legado. O legado pode ser consultado apenas como referência funcional.

A cadeia de segurança permanece obrigatória:

Identity
→ Session
→ TenantMembership
→ TenantContext
→ Authorization
→ PostgreSQL RLS

Missing tenant context = deny.

---

# 1. Modelo de equipamento

Criar entidade multitenant para equipamentos pertencentes a clientes.

Sugestão conceitual:

`customer_equipments`

Campos mínimos:

* `id`
* `tenant_id`
* `customer_id`
* `equipment_number`
* `category`
* `brand`
* `model`
* `serial_number`
* `imei`
* `color`
* `accessories`
* `notes`
* `status`
* `created_at`
* `updated_at`

Avaliar os tipos PostgreSQL adequados conforme os padrões já existentes no projeto.

Não usar enums PostgreSQL se o projeto estiver adotando vocabulários controlados na aplicação/check constraints.

---

# 2. Número do equipamento

`equipment_number` deve ser:

* sequencial por tenant;
* gerado exclusivamente pelo backend/banco;
* transacional;
* seguro sob concorrência;
* independente do `customer_number`;
* nunca baseado em `MAX()+1`.

Reutilizar o padrão já aprovado em CRM-01 para counters, se aplicável.

Garantir unicidade:

`tenant_id + equipment_number`

---

# 3. Ownership

Todo equipamento deve pertencer obrigatoriamente a:

`Tenant → Customer → Equipment`

`tenant_id` nunca pode ser aceito do frontend como fonte de autoridade.

O tenant deve ser derivado exclusivamente da sessão/TenantContext.

O `customer_id` informado deve pertencer ao tenant ativo.

Criar constraints/FKs compostas quando necessárias para impedir referências cross-tenant também no banco.

Não confiar apenas na aplicação.

---

# 4. Identificadores

### Serial number

Permitir serial opcional.

Normalizar espaços e valores vazios.

### IMEI

IMEI deve ser opcional.

Quando informado:

* remover caracteres de formatação;
* aceitar somente dígitos;
* validar tamanho compatível;
* armazenar normalizado.

Não assumir que todo equipamento possui IMEI.

Evitar uma regra global de unicidade que impeça casos legítimos sem comprovação funcional.

Caso seja implementada unicidade, deve ser tenant-aware e justificada.

---

# 5. Categoria

Permitir categorias de equipamentos sem engessar o sistema somente para informática ou celulares.

O VetorOS precisa atender múltiplos segmentos de assistência técnica.

Exemplos:

* smartphone;
* tablet;
* notebook;
* desktop;
* monitor;
* impressora;
* eletroeletrônico;
* ferramenta;
* equipamento industrial;
* outro.

Projetar de forma extensível.

Não criar ainda um módulo completo de catálogo de categorias se isso extrapolar CRM-02.

---

# 6. Status

Definir um vocabulário mínimo para o cadastro do equipamento.

Exemplo:

* `active`
* `inactive`

Não misturar status do cadastro do equipamento com lifecycle de Ordem de Serviço.

Status como:

* aguardando orçamento;
* em manutenção;
* pronto;
* entregue;

pertencem futuramente à OS e não ao cadastro base do equipamento.

---

# 7. Segurança e RLS

A nova tabela deve seguir exatamente o modelo de isolamento das fases anteriores.

Obrigatório:

* RLS habilitado;
* `FORCE ROW LEVEL SECURITY`;
* policies tenant-aware;
* runtime role sem `BYPASSRLS`;
* ausência de TenantContext deve negar acesso;
* usuário de Tenant Alpha não pode observar dados de Tenant Beta.

Não criar bypass administrativo informal.

---

# 8. Permissions

Adicionar permissions compatíveis com AUTH-01:

* `customer_equipments.read`
* `customer_equipments.create`
* `customer_equipments.update`

Adicionar `delete` somente se houver necessidade arquitetural real.

Preferir desativação/status a exclusão destrutiva caso isso seja consistente com CRM-01 e com auditoria futura de OS.

Integrar às roles/seeds atuais sem duplicar mecanismos de autorização.

---

# 9. Auditoria

Toda criação e alteração deve gerar auditoria append-only reutilizando o mecanismo já existente.

Registrar pelo menos:

* tenant;
* actor;
* entidade;
* entity id;
* ação;
* before/after quando aplicável;
* timestamp.

Não criar segundo sistema de auditoria.

---

# 10. API

Implementar endpoints REST seguindo o padrão existente.

Mínimo:

`GET /customers/:customerId/equipments`

`POST /customers/:customerId/equipments`

`GET /customer-equipments/:id`

`PATCH /customer-equipments/:id`

A listagem deve suportar:

* busca;
* paginação;
* ordenação;
* filtro por status;
* filtro por categoria.

Busca deve considerar quando aplicável:

* número do equipamento;
* marca;
* modelo;
* serial;
* IMEI.

Evitar `%termo%` indiscriminado se o projeto já possui estratégia mais eficiente de busca.

---

# 11. Frontend

Integrar ao cadastro de cliente já criado em CRM-01.

Na tela:

`/app/customers/:id`

adicionar seção/aba de equipamentos.

Permitir:

* listar equipamentos;
* cadastrar;
* visualizar;
* editar;
* ativar/desativar conforme status definido.

Criar também uma rota adequada para detalhes/edição se isso estiver alinhado ao padrão atual.

Exemplo:

`/app/customer-equipments/:id`

ou equivalente coerente com a arquitetura existente.

Não criar ainda botão funcional de "Abrir OS" ou "Criar orçamento" além de eventual placeholder visual claramente não operacional.

---

# 12. UX

O formulário deve ser rápido para uso em balcão.

Campos essenciais devem aparecer primeiro.

Sugestão:

* categoria;
* marca;
* modelo;
* serial/IMEI;
* cor;
* acessórios;
* observações.

Não tornar campos opcionais obrigatórios apenas para preencher cadastro.

O usuário deve conseguir cadastrar equipamentos genéricos sem serial ou IMEI.

---

# 13. Dados de teste / seed

Adicionar dados idempotentes para tenants Alpha/Beta já utilizados nos testes.

Criar equipamentos vinculados aos clientes existentes.

Garantir que os seeds não produzam duplicidade em execuções subsequentes.

---

# 14. Testes obrigatórios

Cobrir no mínimo:

1. criação de equipamento no tenant correto;
2. geração sequencial de `equipment_number`;
3. concorrência na geração do número;
4. listagem somente do tenant ativo;
5. Tenant Alpha não lê equipamento de Tenant Beta;
6. Tenant Alpha não altera equipamento de Tenant Beta;
7. tentativa de vincular customer de outro tenant falha;
8. missing TenantContext = deny;
9. usuário sem permission de leitura recebe resposta adequada;
10. usuário sem permission de criação não cria;
11. usuário sem permission de update não altera;
12. IMEI inválido é rejeitado;
13. equipamento sem IMEI é permitido;
14. equipamento sem serial é permitido;
15. auditoria é criada;
16. busca/paginação funcionam;
17. RLS permanece efetiva mesmo diante de acesso runtime direto inadequado.

Executar também toda a suíte existente para garantir ausência de regressão.

---

# 15. Validação

Executar os comandos oficiais existentes no repositório para:

* typecheck;
* lint;
* testes;
* build;
* migrations;
* testes de integração;
* testes de isolamento/RLS.

Não alterar código apenas para ocultar falhas preexistentes.

Qualquer falha encontrada deve ser classificada claramente entre:

* regressão da CRM-02;
* falha preexistente;
* problema de ambiente.

---

# 16. Restrições

Não implementar nesta rodada:

* orçamento;
* ordem de serviço;
* checklist técnico;
* diagnóstico;
* peças;
* estoque;
* venda;
* financeiro;
* emissão fiscal;
* garantia;
* upload de fotos;
* assinatura do cliente.

Esses módulos terão fases próprias.

---

# 17. Gate

Ao final gerar relatório contendo:

* resumo;
* arquitetura;
* migration criada;
* tabelas/constraints/índices;
* permissions;
* RLS;
* auditoria;
* endpoints;
* frontend;
* seeds;
* testes executados;
* resultado da suíte completa;
* riscos;
* pendências;
* arquivos criados;
* arquivos alterados.

Finalizar obrigatoriamente com um dos gates:

**CRM-02 APROVÁVEL**

ou

**CRM-02 NÃO APROVÁVEL**

Não fazer commit.

Não iniciar a próxima fase.

Parar para revisão.
