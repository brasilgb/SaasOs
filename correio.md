# VetorOS 2 — Etapa de Arquitetura: Modelo Multiempresa e Escopos de Dados

Realize uma análise arquitetural completa do modelo multiempresa/multitenant do VetorOS 2 antes de qualquer implementação.

## Contexto já aprovado

O VetorOS 2 será um SaaS reescrito com:

* Backend Node.js;
* Frontend Next.js;
* PostgreSQL;
* arquitetura multiempresa/multitenant;
* segurança e isolamento de dados como requisitos arquiteturais;
* fiscal nativo no domínio do sistema;
* transmissão fiscal desacoplada através de providers;
* Orçamento como módulo separado da Ordem de Serviço;
* preservação das regras de negócio maduras do sistema legado, evitando uma simples reescrita de CRUDs.

## Hierarquia obrigatória

A estrutura conceitual inicial é:

Tenant
→ Empresa
→ Filial
→ Usuários
→ Dados operacionais

Considere:

### Tenant

Representa a conta SaaS/cliente comercial do VetorOS.

Um Tenant poderá possuir:

* uma empresa;
* várias empresas/CNPJs;
* uma ou várias filiais por empresa.

O `tenant_id` é a principal fronteira de isolamento de segurança do SaaS.

Nenhum dado de um tenant poderá ser acessado por outro tenant.

### Empresa

Representa uma entidade jurídica/CNPJ pertencente ao tenant.

Uma empresa poderá possuir:

* dados cadastrais próprios;
* certificados digitais;
* configurações fiscais;
* séries fiscais;
* parâmetros tributários;
* contas financeiras;
* filiais.

### Filial

Representa a unidade operacional.

Uma filial poderá possuir, conforme decisão de domínio:

* estoque próprio;
* caixa próprio;
* usuários vinculados;
* ordens de serviço;
* vendas;
* agenda;
* técnicos;
* numeração operacional;
* configurações locais.

## Objetivo desta etapa

Criar um documento de arquitetura definindo claramente o ownership e o escopo de todos os principais dados do VetorOS.

Para cada entidade ou módulo, determinar se pertence a:

* Tenant;
* Empresa;
* Filial;
* ou combinação desses níveis.

Não implementar código nesta etapa.

## Módulos a analisar

No mínimo:

* Tenant;
* empresas;
* filiais;
* usuários;
* roles;
* permissions;
* clientes;
* contatos;
* endereços;
* equipamentos;
* marcas;
* modelos;
* categorias;
* técnicos;
* fornecedores;
* produtos;
* peças;
* serviços;
* tabelas de preço;
* estoque;
* movimentações de estoque;
* estoque por filial;
* estoque em posse de técnico;
* orçamentos;
* itens de orçamento;
* aprovação/reprovação de orçamento;
* ordens de serviço;
* itens da OS;
* checklist;
* diagnósticos;
* laudos;
* fotos/anexos;
* agenda;
* visitas externas;
* vendas/PDV;
* itens de venda;
* caixa;
* abertura/fechamento de caixa;
* recebimentos;
* formas de pagamento;
* contas a pagar;
* contas a receber;
* comissões;
* despesas;
* financeiro;
* NF-e;
* NFC-e;
* NFS-e;
* documentos fiscais;
* certificados digitais;
* séries fiscais;
* configurações tributárias;
* mensagens;
* WhatsApp;
* notificações;
* templates;
* auditoria;
* logs;
* configurações;
* integrações;
* API keys;
* webhooks;
* planos SaaS;
* assinatura;
* limites de uso.

## Questões obrigatórias

Para cada domínio, responder:

1. Qual entidade é proprietária do dado?
2. O registro deve conter `tenant_id`?
3. Deve possuir `company_id`?
4. Deve possuir `branch_id`?
5. O dado pode ser compartilhado entre empresas do mesmo tenant?
6. O dado pode ser compartilhado entre filiais?
7. Como deve funcionar a autorização?
8. Existem riscos de vazamento entre empresas ou filiais?
9. Qual deve ser a estratégia de índices e constraints para garantir isolamento?
10. Quais entidades precisam de identificadores sequenciais próprios por empresa ou filial?

## Clientes

Avaliar especificamente se um cliente deve poder:

* existir uma única vez no Tenant;
* ser utilizado por múltiplas empresas;
* possuir relacionamento específico com cada empresa;
* possuir histórico separado por empresa/filial.

Evitar duplicação desnecessária de CPF/CNPJ, mas sem permitir vazamento de informações entre empresas que eventualmente precisem operar de forma isolada.

Propor o modelo mais adequado.

## Produtos e catálogo

Avaliar separadamente:

* produto mestre;
* SKU;
* preço;
* custo;
* tributação;
* estoque.

Considerar a possibilidade de:

* catálogo compartilhado no Tenant;
* preços diferentes por empresa ou filial;
* estoques obrigatoriamente separados por filial;
* configurações fiscais por empresa.

## Ordem de Serviço

A OS deverá estar associada pelo menos ao Tenant e à unidade operacional responsável.

Definir corretamente o relacionamento com:

* empresa;
* filial;
* cliente;
* equipamento;
* técnico;
* orçamento;
* peças;
* serviços;
* estoque;
* caixa;
* financeiro;
* fiscal.

## Orçamento

Orçamento é uma entidade independente.

O fluxo padrão esperado é:

Orçamento
→ análise/aprovação pelo cliente
→ aprovado
→ geração de Ordem de Serviço

Entretanto, o sistema também poderá permitir criação direta de OS em cenários onde orçamento prévio não seja necessário.

A relação não deve obrigar toda OS a nascer de orçamento.

Definir contratos e invariantes para esse processo.

## Fiscal

Considerar desde a arquitetura:

Empresa
→ configuração fiscal
→ certificado
→ séries
→ documentos fiscais

A transmissão deverá ser feita posteriormente através de uma abstração de provider.

Não acoplar o domínio fiscal a Focus NFe, PlugNotas, TecnoSpeed ou qualquer fornecedor específico.

Prever contratos como:

`FiscalProvider`

capaz de suportar futuramente APIs oficiais ou terceiros.

Nesta etapa, apenas modelar o domínio; não escolher definitivamente o fornecedor.

## Segurança

Segurança é requisito arquitetural.

Definir como garantir que:

* toda consulta operacional tenha escopo de Tenant;
* autorização nunca dependa apenas do frontend;
* IDs enviados pelo cliente não permitam acesso cruzado;
* relacionamentos sejam validados no backend;
* operações entre empresas e filiais respeitem permissões;
* usuários só possam operar nos escopos autorizados.

Evitar depender exclusivamente de filtros manuais espalhados pelos repositories.

Propor uma estratégia estrutural para impedir consultas sem `tenant_id`.

## Usuários

Avaliar um modelo no qual um usuário possa:

* pertencer ao Tenant;
* ter acesso a uma ou várias empresas;
* ter acesso a uma ou várias filiais;
* possuir papéis/permissões distintos dependendo do escopo.

Exemplo:

Usuário A:

* Empresa 1 → administrador;
* Empresa 2 → financeiro;
* Filial 3 → somente leitura.

Propor uma arquitetura que permita esse nível de controle sem transformar o sistema de permissões em algo excessivamente complexo.

## Numerações

Analisar as sequências de:

* cliente;
* orçamento;
* ordem de serviço;
* venda;
* recibo;
* movimentação financeira;
* documentos internos.

Determinar quais numerações devem ser:

* globais do Tenant;
* por Empresa;
* por Filial.

Documentos fiscais devem respeitar suas próprias regras e séries fiscais.

Evitar utilizar `MAX(numero) + 1`.

Propor mecanismo concorrente seguro.

## Resultado esperado

Produzir um documento:

`docs/architecture/MULTITENANCY_AND_DATA_OWNERSHIP.md`

O documento deve conter:

1. visão geral;
2. hierarquia Tenant → Empresa → Filial;
3. princípios de isolamento;
4. matriz de ownership dos módulos;
5. modelo de usuários e permissões;
6. estratégia de clientes;
7. estratégia de produtos;
8. estratégia de estoque;
9. modelo Orçamento → OS;
10. impactos financeiros;
11. impactos fiscais;
12. estratégia de numeração;
13. constraints e integridade;
14. índices;
15. auditoria;
16. riscos arquiteturais;
17. decisões recomendadas;
18. pontos que ainda precisam de decisão do proprietário do produto.

Não alterar migrations nem escrever código de produção nesta etapa.

O objetivo é transformar a arquitetura multiempresa em uma especificação suficientemente clara para que o schema PostgreSQL possa ser desenhado posteriormente sem ambiguidades.
# Prompt de Execução — VetorOS 2 — Ciclo 1: Baseline + Fundação Multitenant DB-01

Você é o CTO/engenheiro principal responsável pela implementação do VetorOS 2.

## Missão

Executar **somente** o primeiro ciclo aprovado:

```text
FASE 0 — Descoberta/Baseline
+
FASE DB-01 — Fundação Multitenant e Segurança
```

Não avance para clientes, produtos, estoque, orçamento, OS, caixa, financeiro ou fiscal nesta rodada.

## Documentos normativos

Considere como fonte de verdade arquitetural, nesta ordem:

1. `VETOROS_2_ARQUITETURA_MULTITENANCY_ADRS_APROVADOS.md`
2. `VETOROS_2_SCHEMA_LOGICO_POSTGRESQL_V1_1.md`
3. `VETOROS_2_PLANO_FINAL_IMPLEMENTACAO.md`
4. `VETOROS_2_REVISAO_CRITICA_SCHEMA_V1.md`
5. `MULTITENANCY_AND_DATA_OWNERSHIP.md`

Se o repositório divergir, não descarte código silenciosamente: relate a divergência e adapte preservando comportamento útil quando compatível com a nova arquitetura.

---

# PARTE A — Baseline obrigatório

Antes de alterar código:

1. identifique estrutura do monorepo;
2. identifique package manager e versões reais;
3. mostre versões de Node/Fastify/Next/Drizzle/Postgres relevantes;
4. localize:
   - schema Drizzle;
   - migrations;
   - auth;
   - users/roles;
   - Docker;
   - tests;
5. liste tabelas/migrations atuais;
6. identifique assumptions single-tenant;
7. execute:
   - install (somente se necessário);
   - typecheck;
   - lint;
   - tests;
   - build;
8. registre falhas preexistentes.

Crie:

```text
docs/architecture/VETOROS_2_BASELINE_REPOSITORIO.md
```

ou localização documental equivalente já usada pelo projeto.

Não use falha preexistente como justificativa para esconder nova regressão.

---

# PARTE B — Fundação DB-01

Implementar, respeitando convenções reais do projeto:

```text
identities
tenants
tenant_memberships
tenant_user_profiles
companies
branches

permissions
system_role_templates
system_role_template_permissions
tenant_roles
tenant_role_permissions
access_grants
branch_memberships

audit_events
```

## PK

Use UUID conforme padrões do projeto, preferindo UUIDv7 se a stack/infra já suportar de modo limpo. Não introduza biblioteca desnecessária apenas para cumprir estética; documente a solução.

## FKs

Crie chaves candidatas/uniques necessárias para FKs compostas.

Obrigatório impedir fisicamente cross-tenant/cross-company onde a invariância já está definida.

## Role model

Não misture role template global diretamente com tenant role efetiva.

```text
system_role_templates
tenant_roles
```

`access_grants` deve referenciar tenant role com FK que carregue `tenant_id`, impedindo role de outro Tenant.

## Membership model

Cardinalidade:

```text
Identity
→ many TenantMemberships

TenantMembership
→ one TenantUserProfile
```

---

# PARTE C — TenantContext

Implemente uma única abstraction tenant-aware para acesso ao banco, por exemplo:

```ts
withTenantTransaction(context, callback)
```

O nome pode seguir convenção do projeto.

Requisitos:

- transação obrigatória;
- `SET LOCAL app.tenant_id`;
- actor identity;
- effective user profile;
- rollback/cleanup automático;
- repositories tenant-owned não devem usar conexão global sem contexto.

Nunca aceite `tenant_id` do body/query como autoridade.

---

# PARTE D — RLS

Implemente PostgreSQL RLS nas tabelas tenant-owned desta fase.

Requisitos:

```text
missing context = deny
wrong tenant = deny
correct tenant = pass RLS
```

O runtime comum:

```text
NO BYPASSRLS
```

Avalie/implemente `FORCE ROW LEVEL SECURITY` onde apropriado.

Não use usuário owner/superuser como conexão normal da API.

Se Docker/local exigir criação de database roles, ajuste bootstrap/migrations de forma reproduzível.

Papéis conceituais:

```text
vetoros_runtime
vetoros_worker
vetoros_migration
vetoros_control_plane
```

Nesta rodada implemente o necessário para runtime/migration e deixe os demais preparados/documentados se ainda não houver worker/control plane.

---

# PARTE E — Permissions e Seeds

Criar catálogo inicial idempotente.

Roles templates iniciais:

```text
owner
administrator
attendance
technician
inventory
cashier
finance
fiscal
read_only
```

Não invente permissões de módulos ainda inexistentes além do necessário para formar o catálogo; use naming estável e documente.

Templates de sistema devem ser imutáveis pelo runtime.

---

# PARTE F — Auditoria

Implementar estrutura `audit_events` append-only para eventos desta fase, incluindo:

- membership;
- role/grant;
- mudança de escopo relevante;
- login/context switch se integração com auth já for viável.

Nunca registrar:

- password;
- token;
- secret.

---

# PARTE G — Testes obrigatórios

Crie testes automatizados que provem, não apenas simulem:

## RLS

1. Tenant A não lê linha de B.
2. Tenant A não cria linha como B.
3. Tenant A não altera B.
4. Tenant A não apaga B.
5. contexto ausente não ganha acesso.
6. contexto reutilizado no pool não vaza Tenant anterior.

## FKs

7. Branch A não aponta Company de outro Tenant.
8. AccessGrant A não aponta tenant_role B.
9. tenant_user_profile não aponta membership de outro Tenant.
10. grant Branch não aponta Branch de Company incompatível.

## Runtime permissions

11. runtime não altera `system_role_templates`.
12. runtime não possui BYPASSRLS.

## TenantContext

13. erro dentro do callback causa rollback.
14. contexto correto permanece somente durante transaction.

Não marque esses testes como skip.

---

# PARTE H — Compatibilidade

Se já existir login/user model:

- não faça substituição destrutiva sem analisar;
- crie migração/adapter compatível quando necessário;
- documente o que ficou legado e qual será a estratégia de migração.

Não implemente ainda migração completa de dados legados, salvo backfill mínimo estritamente necessário à integridade da DB-01.

---

# PARTE I — Qualidade

Ao final rode a suíte completa disponível:

```text
typecheck
lint
tests
build
```

Também valide Docker/migrations em:

1. banco limpo;
2. execução das migrations do zero;
3. se houver mecanismo existente, rollback/recreate ou restore test.

Não afirme sucesso sem executar os comandos relevantes.

---

# PARTE J — Relatório obrigatório

Entregue ao final:

## 1. Resumo
O que foi implementado.

## 2. Baseline
Estado encontrado antes das alterações.

## 3. Arquivos criados
Lista.

## 4. Arquivos alterados
Lista + propósito.

## 5. Migrations
Número/nome + tabelas/constraints/RLS.

## 6. TenantContext
Como funciona.

## 7. RLS
Policies e database roles.

## 8. Testes
Tabela:

```text
comando | resultado | quantidade | duração aproximada se disponível
```

## 9. Testes de isolamento
Descreva cada cenário e resultado.

## 10. Compatibilidade
Impactos no código antigo.

## 11. Pendências
Somente pendências reais; não esconda erros.

## 12. Riscos
Qualquer risco arquitetural observado.

## 13. Gate
Declare uma das opções:

```text
DB-01 APROVÁVEL
```

ou

```text
DB-01 NÃO APROVÁVEL
```

com motivo objetivo.

---

# STOP CONDITION

Após concluir DB-01:

**PARE.**

Não implemente DB-02.

Não crie clientes/produtos/estoque/orçamentos/OS novos nesta rodada.

A fundação será revisada pelo Diretor/COO antes da autorização da próxima fase.

A prioridade é qualidade e isolamento comprovado, não velocidade de quantidade de módulos.
