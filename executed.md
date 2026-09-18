# Resultado da execução de `correio.md` — WAHA no VetorOS 1

Data: 2026-09-18. Escopo: exclusivamente `vetoros1`. Nada do VetorOS 2 foi tocado ou usado como referência de arquitetura.

## 1. Como o WhatsApp funcionava antes (auditoria)

Não existia integração real com nenhuma API de WhatsApp. "WhatsApp" era, em todo o sistema, um link `https://wa.me/<telefone>?text=...` montado no navegador e aberto em nova aba — nada saía do backend, nenhuma sessão/conexão era armazenada, não havia webhook.

O que já existia e foi **reaproveitado**:

- `whatsapp_messages` (tabela) / `WhatsappMessage` (model) / `WhatsappMessageTemplateService`: templates de mensagem editáveis por tenant (`generatedbudget`, `servicecompleted`, `feedback`, `defaultmessage`, `budgetfollowup`, `pendingpayment`), com placeholders `{{ cliente }}`, `{{ ordem }}`, `{{ link_os }}`, `{{ saudacao }}`, `{{ saldo }}`, `{{ dias_pendentes }}`.
- Tela de configuração `Configurações → Mensagens WhatsApp` (`resources/js/pages/app/whatsapp-message/index.tsx`), permissão `whatsapp_messages` / gate `whatsapp-messages.access`.
- `resources/js/components/WhatsAppButtonProps.tsx`: toda a lógica de escolha de template por contexto/status da OS e substituição de placeholders — **mantida**, só o passo final de envio mudou.
- `normalizeWhatsappPhone()` (`resources/js/Utils/mask.tsx`): normalização de telefone — mantida no frontend e espelhada em PHP (novo `App\Support\WhatsAppPhone`) para o envio server-side.

O que foi **substituído** (deixava de existir de verdade, então não havia "remover", só parar de usar):

- Os 4 pontos que abriam `wa.me` diretamente: botão da OS (`orders/index.tsx`), botão do cliente (`customers/index.tsx`), e a rota REST duplicada/morta `Route::resource('whatsapp-messages', ...)` em `routes/app.php` (havia duas rotas resource apontando pro mesmo controller — a plural nunca era usada pelo frontend; removida).

O que foi **deliberadamente deixado como estava** (fora do escopo do pedido — comunicação operacional cliente↔assistência, não interna):

- `schedules/index.tsx` (escritório → técnico): é comunicação interna via `wa.me`, não atendimento ao cliente final.
- Página pública de acompanhamento da OS (`serviceorders/index.tsx`, "Falar com a assistência"): é o *cliente* abrindo o WhatsApp dele para falar com a loja — não faz sentido passar pela sessão WAHA da empresa, porque quem envia é o cliente, não o tenant.
- Site institucional/admin interno (`pages/site/*`, `pages/admin/*`): não é fluxo de produto do tenant.

## 2. Arquitetura implementada

```
Controller (Order/Customer/WhatsappConnection)
        ↓
WhatsAppService   (ciente de tenant: conexão, status, envio, templates)
        ↓
WahaService       (adapter HTTP puro, não sabe o que é tenant)
        ↓
WAHA
        ↓
WhatsApp do tenant
```

- **1 sessão WAHA por tenant**, nome determinístico `vetoros1-{tenant_id}` (sem conceito de matriz/filial — não existe no VetorOS 1, então não foi inventado).
- Status nunca é tratado como verdade absoluta: `WhatsAppService::status()` sempre consulta o WAHA e resincroniza a linha local; se o WAHA estiver fora do ar, mantém o último status conhecido em vez de quebrar a tela (`WhatsappConnectionControllerTest::test_status_keeps_last_known_state_when_waha_is_unavailable`).
- QR Code só é servido autenticado, atrás do gate `whatsapp-messages.access`, nunca por URL pública.
- Toda falha do WAHA vira uma mensagem segura (`App\Exceptions\WhatsAppException`), nunca stack trace cru — ex.: *"O WhatsApp desta empresa está desconectado. Reconecte-o nas configurações."*

## 3. Arquivos criados

**Backend**
- `app/Models/App/WhatsappConnection.php` — 1 linha por tenant (`tenant_id` único), status/telefone/timestamps de conexão.
- `app/Services/WahaService.php` — adapter HTTP puro para a REST API do WAHA (`createSession`, `getSessionStatus`, `getQrCodeImage`, `stopSession`, `logoutSession`, `sendText`, `sendFile`).
- `app/Services/WhatsAppService.php` — fachada ciente de tenant; único ponto que controllers/jobs devem chamar.
- `app/Exceptions/WhatsAppException.php` — erros funcionais com mensagem já segura para exibir ao usuário.
- `app/Support/WhatsAppPhone.php` — normalização/validação de telefone em PHP, espelhando `normalizeWhatsappPhone()` do frontend.
- `app/Http/Controllers/App/WhatsappConnectionController.php` — `status` (polling JSON), `connect`, `qrCode` (imagem PNG autenticada), `disconnect`.
- `database/migrations/2026_09_18_090000_create_whatsapp_connections_table.php`.
- `database/factories/App/WhatsappConnectionFactory.php`.
- `tests/Feature/App/WhatsappConnectionControllerTest.php` (7 casos) e `tests/Feature/App/WhatsAppSendControllerTest.php` (6 casos).

**Frontend**
- `resources/js/pages/app/whatsapp-message/connection-panel.tsx` — card de status + botão conectar/desconectar + QR Code com polling (3s) enquanto `starting`/`qr_required`.

## 4. Arquivos alterados

**Backend**
- `routes/app.php` — rotas novas (`whatsapp-connection/{status,qr,connect,disconnect}`, `orders/{order}/whatsapp`, `customers/{customer}/whatsapp`); removida a rota resource `whatsapp-messages` (plural) morta.
- `config/services.php` / `.env.example` — bloco `waha` (`WAHA_BASE_URL`, `WAHA_API_KEY`, `WAHA_WEBHOOK_URL`, `WAHA_WEBHOOK_SECRET`).
- `app/Http/Controllers/App/OrderController.php` — novo método `sendWhatsapp()` (mesmo padrão de `sendPaymentReminder`/`sendBudgetFollowUp`: autoriza, tenta, loga em `order_logs` como `whatsapp_sent`, flash de sucesso/erro).
- `app/Http/Controllers/App/CustomerController.php` — novo método `sendWhatsapp()`.
- `app/Http/Controllers/App/WhatsappMessageController.php` — `index()` agora também injeta o status de conexão atual (`connection`) na página.
- `app/Services/WhatsappMessageTemplateService.php` — novo `render()` (substituição de `{{ placeholder }}` em PHP), usado pelo `WhatsAppService::renderTemplate()`; a lógica de normalização de chave espelha a que já existia em JS.

**Frontend**
- `resources/js/components/WhatsAppButtonProps.tsx` — continua montando a mensagem (templates/contexto/status, sem mudança nessa parte); o clique agora faz `router.post('orders/{id}/whatsapp', { message })` em vez de `window.open('wa.me/...')`. Precisa de uma nova prop `orderId`.
- `resources/js/pages/app/orders/index.tsx` — passa `orderId={order.id}` para o `WhatsAppButton`.
- `resources/js/pages/app/customers/index.tsx` — botão de WhatsApp do cliente trocado de `<a href wa.me>` para `<button>` que dispara `router.post('customers/{id}/whatsapp', ...)`; desabilitado quando o cliente não tem telefone válido.
- `resources/js/pages/app/whatsapp-message/index.tsx` — página agora tem abas **Conexão** (novo painel) e **Templates de mensagem** (formulário existente, sem mudanças de comportamento).

## 5. Migrations

Uma migration nova, `whatsapp_connections`:

```
id, tenant_id (FK, único — 1 conexão por tenant),
session_name (único), status, phone_number,
connected_at, disconnected_at, last_synced_at, timestamps
```

## 6. Permissões

Nenhuma permissão nova foi criada. A tela de conexão vive dentro da mesma área "Mensagens WhatsApp" que já existia, então reaproveitei o gate/permissão já existentes (`whatsapp-messages.access` / `whatsapp_messages`) em vez de criar uma segunda permissão para o mesmo pedaço de tela — menos superfície para administrar papéis.

## 7. Testes criados

13 testes novos, todos usando `Http::fake()` — **nenhum depende de um WhatsApp real ou do WAHA estar no ar**:

- `WhatsappConnectionControllerTest` (7): conectar cria sessão local + chama WAHA; status sincroniza e mapeia `WORKING→connected`/`STOPPED→disconnected`/etc.; status mantém o último estado conhecido se o WAHA cair; QR Code retorna a imagem; QR Code retorna erro amigável (503) se o WAHA estiver fora; desconectar chama logout e zera o status local; **isolamento entre tenants** (cada um só enxerga/mexe na própria conexão).
- `WhatsAppSendControllerTest` (6): envio pela OS funciona quando conectado e grava em `order_logs`; falha com mensagem amigável quando desconectado (sem nenhuma chamada HTTP real); falha quando o cliente não tem telefone válido; **OS de outro tenant é rejeitada** (404→redirect, controlado pelo route-model-binding tenant-aware já existente); envio pelo cliente funciona conectado; falha amigável quando desconectado.

## 8. Docker / infraestrutura

Não havia `docker-compose.yml` no projeto (só um `Dockerfile` isolado). Criei um `docker-compose.yml` **apenas com o serviço `waha`** — não tentei encaixar o Laravel nem o MySQL nele, porque o ambiente de desenvolvimento atual roda nativamente (MySQL local, não containerizado), e inventar isso quebraria a suposição de como o projeto já é rodado. Basta:

```bash
docker compose up -d waha
```

e apontar `WAHA_BASE_URL=http://localhost:3000` no `.env`. Em produção, `WAHA_BASE_URL` pode apontar para qualquer servidor — a integração não assume que Laravel e WAHA compartilham host.

## 9. Roteiro de teste manual

```bash
# 1. Subir o WAHA localmente
docker compose up -d waha

# 2. Configurar o .env do Laravel
WAHA_BASE_URL=http://localhost:3000
WAHA_API_KEY=            # deixe vazio se não configurou WHATSAPP_API_KEY no compose

# 3. Rodar as migrations
php artisan migrate

# 4. Acessar o VetorOS logado como usuário com permissão "whatsapp_messages"
#    Configurações → Mensagens WhatsApp → aba "Conexão"

# 5. Clicar "Conectar WhatsApp" — a tela passa a fazer polling e mostra o QR Code
# 6. No celular da empresa: WhatsApp → Aparelhos conectados → Conectar um aparelho → escanear
# 7. Em poucos segundos o status muda para "Conectado" e mostra o número

# 8. Abrir um cliente com WhatsApp cadastrado → clicar no ícone verde de WhatsApp
#    (envia uma saudação simples pelo número conectado da empresa)

# 9. Abrir uma OS → clicar no botão de WhatsApp (mesma mensagem que já era
#    montada antes, agora enviada de verdade via WAHA em vez de abrir wa.me)

# 10. Conferir o envio no histórico/log da OS (ação "whatsapp_sent")

# 11. Reiniciar o container do WAHA e verificar que a sessão continua
#     conectada depois (persistência via volume waha_sessions)
docker compose restart waha

# 12. Testar o caminho de erro: parar o container do WAHA e tentar enviar
#     uma mensagem — deve aparecer o erro amigável, não uma tela quebrada
docker compose stop waha
```

Suíte automatizada (não depende do WAHA real, ambiente sem `pdo_sqlite` — ver nota abaixo):

```bash
mysql -h127.0.0.1 -uroot -p16050912 -e "CREATE DATABASE IF NOT EXISTS vetoros1_test;"
DB_CONNECTION=mysql DB_HOST=127.0.0.1 DB_PORT=3306 DB_DATABASE=vetoros1_test DB_USERNAME=root DB_PASSWORD=16050912 \
CACHE_STORE=array SESSION_DRIVER=array QUEUE_CONNECTION=sync MAIL_MAILER=array APP_ENV=testing BCRYPT_ROUNDS=4 \
php artisan test --filter "WhatsappConnectionControllerTest|WhatsAppSendControllerTest"
```

## 10. Código antigo removido

- Rota resource `whatsapp-messages` (plural) — duplicada, morta, nunca usada pelo frontend.
- Os 4 `window.open('https://wa.me/...')` que enviavam mensagem de verdade (OS e cliente) — trocados pelo envio via WAHA. Os 2 que são links de *abertura de conversa pelo próprio usuário* (agenda interna, portal público do cliente) foram mantidos de propósito (ver seção 1).

Não sobrou nenhuma implementação concorrente: só existe um caminho de envio agora (`WhatsAppService`), e a única forma de "enviar de verdade" nas telas de OS/cliente passa por ele.

## 11. Validação executada

- `php -l` em todos os arquivos PHP novos/alterados — sem erro de sintaxe.
- `npx tsc --noEmit` — sem erro de tipo.
- `npx vite build` — build completo sem falhas.
- Suíte de testes completa (MySQL local, `vetoros1_test`, descartável): **260 passaram, 15 falharam** — os mesmos 15 que já falhavam antes desta tarefa (memória do projeto já documentava isso; confirmado de novo aqui, nenhum é meu). Os 13 testes novos estão entre os que passam.

## 12. Pendências reais

- **Não testado contra um WAHA de verdade** (o ambiente sandbox não tem Docker funcional) — toda a integração foi validada com `Http::fake()`. O parsing do telefone conectado (`me.id` → `WhatsappConnection.phone_number`) assume o formato `"5511999999999@c.us"`; se a versão do WAHA usada em produção devolver um formato diferente (ex.: com `+` na frente), o campo `phone_number` fica vazio até o primeiro `status()` bem-sucedido corrigir — vale validar no roteiro manual acima (passo 7).
- **Envio é síncrono, não passa por fila**, mesmo o projeto já tendo `QUEUE_CONNECTION=database` e jobs (`app/Jobs/*`) para e-mail. Decisão deliberada: não há confirmação de que um worker (`queue:work`) realmente roda em produção, e enfileirar sem worker deixaria a mensagem "presa" silenciosamente — pior do que uma requisição um pouco mais lenta. Se um worker for confirmado, trocar a chamada direta a `WhatsAppService::sendText()` por um `Job implements ShouldQueue` é uma mudança pequena e isolada.
- **Webhook do WAHA não foi implementado** (item opcional do pedido — "confirmação de mensagem" etc.). `WahaService::createSession()` já manda a URL de `services.waha.webhook_url` se ela estiver configurada, mas não existe endpoint Laravel para recebê-la ainda. Sem isso, o VetorOS sabe que *pediu* o envio ao WAHA, mas não sabe se foi de fato entregue/lido.
- **Reparei, mas não mexi**: `.env.example` já tinha (antes desta tarefa) credenciais de Mercado Pago com aparência real, versionadas. Não faz parte deste pedido, mas vale um giro de chave se forem credenciais reais de produção.
