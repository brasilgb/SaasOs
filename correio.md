# VetorOS 1 — Substituição da integração atual de WhatsApp por WAHA

Trabalhe **somente no projeto VetorOS 1**.

Não aplicar arquitetura, migrations, conceitos ou estruturas do VetorOS 2.

O objetivo é analisar como o WhatsApp funciona atualmente no VetorOS 1 e **substituir o método antigo por uma integração com WAHA**, mantendo as funcionalidades já existentes e melhorando a estrutura apenas onde for necessário.

## Objetivo principal

Cada cliente/empresa que utiliza o VetorOS deve conectar **o seu próprio número de WhatsApp** através de QR Code.

O VetorOS não utilizará um número central.

Fluxo esperado:

```text
Empresa cliente
   ↓
Configurações do WhatsApp
   ↓
Conectar WhatsApp
   ↓
WAHA gera QR Code
   ↓
Cliente escaneia com seu próprio telefone
   ↓
Sessão fica conectada
   ↓
Mensagens do VetorOS saem pelo WhatsApp desse cliente
```

---

## 1. Auditar primeiro o que já existe

Antes de alterar código, faça uma auditoria completa de tudo relacionado a WhatsApp no VetorOS 1.

Localize:

* serviços;
* controllers;
* rotas;
* componentes React;
* configurações;
* migrations;
* tabelas;
* modelos;
* envio por `wa.me`;
* APIs anteriores;
* mensagens predefinidas;
* mensagens de Ordem de Serviço;
* mensagens de orçamento;
* envio de recibos;
* envio de PDF;
* mensagens para clientes;
* telas de configuração;
* jobs/queues, se existirem.

Identifique:

* o que deve ser removido;
* o que pode ser reaproveitado;
* o que precisa ser adaptado.

Não mantenha implementações duplicadas sem necessidade.

---

## 2. Não reestruturar o VetorOS 1 inteiro

Esta tarefa é de integração com WhatsApp.

Não aproveitar para:

* converter arquitetura;
* refazer multitenancy;
* alterar módulos que não têm relação;
* trazer estruturas do VetorOS 2;
* criar refatorações extensas sem necessidade.

Preservar o funcionamento atual do VetorOS 1.

---

## 3. Implementar WAHA como serviço separado

Criar uma camada central para comunicação com WAHA.

Exemplo conceitual:

```text
VetorOS 1
   ↓
WhatsAppService
   ↓
WahaService
   ↓
WAHA
   ↓
WhatsApp do cliente
```

Evitar chamadas HTTP para WAHA espalhadas em controllers e componentes.

Centralizar operações como:

```php
sendText()
sendImage()
sendDocument()
createSession()
getSessionStatus()
getQrCode()
disconnect()
```

---

## 4. Configuração

Utilizar `.env` para dados globais do serviço WAHA.

Exemplo:

```env
WAHA_BASE_URL=http://waha:3000
WAHA_API_KEY=
```

Não armazenar API key global no banco.

---

## 5. Sessão por cliente do VetorOS

Cada empresa/tenant do VetorOS 1 deve possuir sua própria sessão no WAHA.

A sessão deve ter identificação segura.

Exemplo conceitual:

```text
vetoros-{tenant_id}
```

ou outra identificação baseada na estrutura real existente no VetorOS 1.

Antes de implementar, descubra qual entidade atualmente identifica corretamente cada cliente/empresa do SaaS.

Não assumir nomes de tabela.

---

## 6. Persistência da conexão

Reutilize estrutura existente caso já exista algo adequado.

Caso não exista, criar uma tabela específica, por exemplo:

```text
whatsapp_connections
```

Campos mínimos conceituais:

```text
id
tenant/client/company identifier
provider
session_name
phone_number
status
connected_at
disconnected_at
created_at
updated_at
```

Adapte os nomes para a arquitetura real do VetorOS 1.

---

## 7. Tela de conexão

Criar ou adaptar a tela existente de configuração do WhatsApp.

Estado desconectado:

```text
WhatsApp

Status: Não conectado

[ Conectar WhatsApp ]
```

Ao clicar:

```text
Conectando...

QR CODE

Abra o WhatsApp no celular:
Configurações
→ Aparelhos conectados
→ Conectar aparelho
```

Depois de escanear:

```text
Status: Conectado

Número: (51) 99999-9999

[ Desconectar ]
```

A atualização do status deve ocorrer automaticamente ou por polling controlado.

---

## 8. Manter as funcionalidades já existentes

O VetorOS 1 já possui funcionalidades de mensagens de WhatsApp.

Não remover recursos úteis.

Adaptar o mecanismo de envio existente para utilizar WAHA.

Verifique especialmente:

```text
Clientes
Ordens de Serviço
Orçamentos
Checklist
Contrato de manutenção
Recibos
Mensagens
```

Se atualmente existir envio de texto, imagem, PDF ou documento, preservar essa capacidade quando tecnicamente suportada.

---

## 9. Ordem de Serviço

Os botões existentes de WhatsApp dentro da OS devem continuar funcionando.

Mas, em vez do mecanismo antigo, devem chamar o novo serviço WAHA.

Exemplos:

```text
Avisar recebimento
Enviar orçamento
Avisar equipamento pronto
Avisar retirada
Enviar recibo
Enviar documento
```

Não alterar o fluxo operacional da OS desnecessariamente.

---

## 10. Clientes

Na tela de cliente, preservar ou melhorar a ação:

```text
Enviar WhatsApp
```

O número deve vir do cadastro do cliente.

Centralize a normalização do telefone.

Para números brasileiros, enviar no formato internacional exigido pelo WhatsApp, por exemplo:

```text
5551999999999
```

Não espalhar essa lógica em vários arquivos.

---

## 11. Mensagens predefinidas

O VetorOS 1 já possui conceitos de mensagens utilizadas no atendimento.

Analise antes de criar estrutura nova.

Se as mensagens já estiverem armazenadas e funcionando, reaproveite.

Exemplos de conteúdo:

```text
Olá {cliente}, seu equipamento foi recebido.
```

```text
Olá {cliente}, o orçamento da OS {numero_os} está disponível.
```

```text
Olá {cliente}, seu equipamento está pronto para retirada.
```

Não duplicar tabelas ou funcionalidades se o VetorOS 1 já tiver algo equivalente.

---

## 12. PDFs e documentos

Analise como o VetorOS 1 atualmente gera:

* orçamento;
* recibo;
* checklist;
* contrato;
* documentos da OS.

Se houver ação de compartilhamento via WhatsApp, adapte para enviar o documento utilizando WAHA.

Não reescrever o sistema de geração dos PDFs.

---

## 13. Envio por fila

Verifique se o VetorOS 1 já utiliza queue/jobs.

Se utilizar, prefira colocar os envios de WhatsApp em fila.

Fluxo:

```text
Ação do usuário
   ↓
Job
   ↓
WhatsAppService
   ↓
WAHA
```

Se o projeto não utilizar filas atualmente, avalie o impacto antes de introduzir complexidade desnecessária.

Não transformar esta implementação em uma reestruturação geral do projeto.

---

## 14. Tratamento de falhas

Tratar adequadamente situações como:

```text
WAHA indisponível
sessão desconectada
timeout
telefone inválido
falha de envio
```

Não retornar erro técnico cru para o usuário.

Exemplo:

```text
O WhatsApp desta empresa está desconectado.
Reconecte-o nas configurações.
```

---

## 15. Segurança

Um cliente do VetorOS nunca pode:

* visualizar QR Code de outro cliente;
* utilizar sessão de outro cliente;
* desconectar sessão de outro cliente;
* enviar mensagem pelo número de outro cliente.

Todas as operações devem respeitar o isolamento já existente no VetorOS 1.

Não alterar a arquitetura de segurança sem necessidade.

---

## 16. Não implementar marketing em massa

O WAHA será utilizado para comunicação operacional.

Não adicionar:

* disparo em massa;
* listas frias;
* campanhas;
* scraping;
* spam;
* automações agressivas.

Prioridade:

```text
OS
Clientes
Orçamentos
Recibos
Atendimento
```

---

## 17. Docker / infraestrutura

Verifique como o VetorOS 1 é executado atualmente.

Se existir ambiente Docker local, adicionar WAHA de forma compatível.

Se produção estiver em hospedagem que não suporte container, **não quebre o deploy atual**.

Nesse caso, deixar WAHA preparado para rodar em servidor separado e configurar o VetorOS via:

```env
WAHA_BASE_URL=https://...
```

A integração do Laravel não deve depender de WAHA estar no mesmo servidor.

---

## 18. Persistência da sessão WAHA

A sessão do WhatsApp não pode ser perdida toda vez que WAHA reiniciar.

Verifique a forma recomendada de persistência da versão instalada do WAHA e configure corretamente.

Não armazenar QR Code ou credenciais sensíveis no banco do VetorOS sem necessidade.

---

## 19. Compatibilidade futura

Mesmo trabalhando no VetorOS 1, evitar acoplar todos os módulos diretamente ao WAHA.

Ideal:

```text
Controller
   ↓
WhatsAppService
   ↓
WahaService
```

Assim, se futuramente trocarmos WAHA por API oficial, o impacto ficará concentrado nesta camada.

Não é necessário criar arquitetura excessivamente sofisticada.

---

## 20. Testes

Criar testes para a integração sem depender de um número real de WhatsApp.

Mockar as respostas HTTP do WAHA.

Testar pelo menos:

```text
criação de sessão
consulta de status
obtenção do QR Code
envio de texto
envio de documento
sessão desconectada
falha do WAHA
isolamento entre clientes
```

Não exigir WhatsApp real para executar a suíte automatizada.

---

## 21. Teste manual

Ao finalizar, entregue um roteiro para teste real.

Exemplo:

```text
1. Subir WAHA
2. Acessar VetorOS
3. Entrar com cliente teste
4. Abrir Configurações → WhatsApp
5. Clicar Conectar
6. Escanear QR Code
7. Confirmar status conectado
8. Abrir cliente
9. Enviar mensagem
10. Abrir OS
11. Enviar mensagem da OS
12. Enviar PDF
13. Reiniciar WAHA
14. Confirmar persistência da sessão
```

Entregue também os comandos necessários.

---

## 22. Remover método antigo

Depois que WAHA estiver funcionando corretamente, remover o mecanismo antigo.

Eliminar:

* services obsoletos;
* chamadas antigas;
* configurações não utilizadas;
* variáveis `.env` antigas;
* endpoints antigos;
* código morto.

Antes de remover, certifique-se de que nenhuma funcionalidade atual dependa dele.

---

## 23. Não mexer no VetorOS 2

Reforço:

Esta implementação é exclusivamente para o:

```text
vetoros1
```

Não utilizar como base:

```text
vetoros2
```

Não criar código, migrations ou conceitos pensando no VetorOS 2.

Caso exista mais de um projeto no diretório raiz, confirme pelos arquivos e estrutura que está operando no VetorOS 1 antes de fazer alterações.

---

## 24. Entrega

Antes de implementar, apresente resumidamente:

1. como o WhatsApp funciona hoje no VetorOS 1;
2. quais arquivos participam;
3. qual integração antiga será substituída;
4. o que será reaproveitado;
5. mudanças de banco necessárias;
6. mudanças de frontend necessárias;
7. mudanças de backend necessárias.

Depois implemente.

Não pare apenas na análise.

Ao terminar, entregue:

* arquivos criados;
* arquivos alterados;
* migrations;
* services;
* controllers;
* rotas;
* componentes;
* configurações;
* alterações Docker/infra;
* testes;
* código antigo removido;
* comandos de teste manual;
* pendências, se existirem.

Compile e valide o que for possível no ambiente atual.

O objetivo final é **preservar o VetorOS 1 como está funcionalmente e apenas substituir de forma limpa e segura o mecanismo atual de WhatsApp pelo WAHA**.
