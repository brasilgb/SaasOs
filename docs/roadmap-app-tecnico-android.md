# Roadmap App Android VetorOS Técnico

## Objetivo

Criar um app Android para técnicos externos executarem atendimentos de campo a partir dos agendamentos liberados pelo sistema web.

O núcleo do app será o agendamento (`schedules`). Cada agendamento aponta para uma ordem de serviço (`orders`) e só aparece no app quando estiver marcado como enviado ao técnico.

## Fluxo Principal

```text
Sistema Web
Cliente + OS -> criar agendamento -> marcar Enviar ao técnico

App Android
Técnico loga -> vê agendamentos enviados -> abre atendimento -> atualiza visita/OS
```

## MVP

### 1. Login do Técnico

- Usar autenticação via API/Sanctum.
- Permitir acesso ao app apenas para usuários técnicos.
- Retornar token, dados do usuário, avatar, empresa e logo.

### 2. Lista de Agendamentos

Listar apenas agendamentos:

- do técnico logado;
- com `send_to_technician = true`;
- vinculados a uma ordem de serviço.

Exibir:

- data e hora;
- cliente;
- endereço;
- ordem de serviço;
- serviço;
- status do atendimento.

### 3. Detalhe do Atendimento

Exibir:

- dados do cliente;
- telefone e WhatsApp;
- endereço completo;
- dados da ordem de serviço;
- dados do equipamento;
- problema relatado;
- observações;
- técnico responsável.

Ações rápidas:

- ligar para cliente;
- abrir WhatsApp;
- abrir rota no Google Maps/Waze.

### 4. Status da Visita

O técnico poderá atualizar o status do atendimento:

- Agendado;
- A caminho;
- Cheguei ao local;
- Em atendimento;
- Concluído;
- Cancelado.

Cada alteração deverá registrar:

- data e hora;
- técnico responsável;
- localização GPS quando disponível.

### 5. Check-in e Check-out

Check-in:

- registrar horário de chegada;
- capturar GPS;
- permitir observação opcional.

Check-out:

- registrar horário de saída;
- capturar GPS;
- permitir observação opcional.

### 6. Atualização da Ordem de Serviço

Permitir que o técnico registre:

- diagnóstico;
- solução aplicada;
- observações técnicas;
- status da OS, quando aplicável.

### 7. Fotos

Permitir upload de fotos vinculadas à ordem de serviço.

No MVP, as fotos podem ser uma lista única. A separação por etapa fica para fase posterior:

- antes;
- durante;
- depois.

### 8. Pagamento No Local Manual

No MVP, o pagamento será apenas informativo e manual.

Campos no app:

- `Pago no local`;
- valor recebido;
- forma de pagamento:
  - Pix;
  - Dinheiro;
  - Cartão;
  - Transferência;
  - Outro;
- observação opcional.

O app não deve integrar gateway, caixa ou fiscal nesta fase.

Fluxo recomendado:

```text
App Android
Técnico marca "Pago no local"

Sistema Web
Financeiro vê pagamento informado pelo técnico
Financeiro confirma/lança no caixa da OS
```

## API Prevista Para o MVP

```http
GET /api/tecnico/agendamentos
GET /api/tecnico/agendamentos/{schedule}
POST /api/tecnico/agendamentos/{schedule}/status
POST /api/tecnico/agendamentos/{schedule}/check-in
POST /api/tecnico/agendamentos/{schedule}/check-out
POST /api/tecnico/ordens/{order}/atendimento
POST /api/tecnico/ordens/{order}/fotos
POST /api/tecnico/ordens/{order}/pagamento-local
```

## Backend Necessário

### Agendamentos

Usar a base já criada:

- `schedules.order_id`;
- `schedules.send_to_technician`;
- configuração `enable_technician_schedule_notifications`.

Criar estruturas complementares para:

- histórico de status do atendimento;
- check-in/check-out;
- GPS;
- pagamento local informado pelo técnico.

### Segurança

- O técnico só pode acessar agendamentos do próprio `user_id`.
- O técnico só pode acessar OS vinculadas aos seus agendamentos.
- Todos os dados devem respeitar `tenant_id`.

## Fase 2

- Assinatura digital do cliente.
- Fotos categorizadas por etapa: antes, durante e depois.
- Histórico completo de alterações com GPS.
- Comprovante simples do atendimento.
- Push notification para novo agendamento, alteração e cancelamento.
- Visualização de pagamentos locais pendentes de conferência no sistema web.

## Fase 3

- Funcionamento offline.
- Sincronização de alterações pendentes.
- Vídeos curtos como evidência técnica.
- Estoque individual do técnico.
- Roteirização com múltiplos atendimentos.
- Assistente IA para suporte técnico.

## Fora Do MVP

Estes itens não entram na primeira versão:

- gateway de pagamento;
- integração fiscal;
- baixa automática de estoque;
- roteirização inteligente;
- IA;
- offline completo;
- vídeos;
- assinatura digital.

## Decisão De Produto

O app Android VetorOS Técnico deve começar como um app de assistência agendada.

O agendamento é o ponto de entrada. A ordem de serviço é o conteúdo técnico do atendimento. O financeiro completo continua no sistema web até uma fase posterior.
