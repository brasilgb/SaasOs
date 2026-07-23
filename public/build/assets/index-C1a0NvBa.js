import{u as x,j as e,H as f,av as v,e as b}from"./vendor-C2rDGDZ3.js";import{t as j}from"./app-toast-messages-_jeBqEkd.js";import{I as h}from"./icon-CWyTqxQL.js";import{B as u}from"./button-4EYy_YSd.js";import{L as r}from"./label-o8TnPRBx.js";import{T as t}from"./textarea-CV91AnC3.js";import{A as k}from"./app-layout-v28I6w6K.js";import"./utils-B0ZjmqUl.js";import"./flash-toast-messages-D8O0HyGa.js";import"./app-sidebar-header-7lDFKeqa.js";import"./badge-B7it_fYc.js";import"./avatar-cqk8PmCs.js";import"./mask-EsF1SpyB.js";import"./moment-BLMuvzoS.js";import"./SubscriptionPaymentSuccess-BlnxGmlb.js";import"./dialog-CoDNIi9_.js";const S=[{title:"Painel",href:route("app.dashboard")},{title:"Mensagens Whatsapp",href:"#"}],i={generatedbudget:`{{ saudacao }}, {{ cliente }}!

Equipamento analisado preliminarmente. Segue orçamento inicial para reparo conforme diagnóstico técnico apresentado na OS {{ ordem }}.

O serviço será executado somente mediante sua aprovação. Valores e prazo podem sofrer alterações caso sejam identificadas necessidades adicionais durante o reparo.

Você pode acompanhar pelo link: {{ link_os }}`,servicecompleted:`{{ saudacao }}, {{ cliente }}!

Sua OS {{ ordem }} foi concluída com sucesso.

Você pode acompanhar pelo link: {{ link_os }}

Qualquer dúvida, conte com a gente.`,feedback:`{{ saudacao }}, {{ cliente }}!

Sua OS {{ ordem }} foi finalizada e sua opinião é muito importante para nós.

Acesse sua área do cliente pelo link {{ link_os }} e deixe uma nota com um comentário rápido sobre sua experiência.

Seu feedback nos ajuda a melhorar cada atendimento.`,defaultmessage:`{{ saudacao }}, {{ cliente }}!

Atualização da sua OS {{ ordem }}.

Acompanhe pelo link: {{ link_os }}

Qualquer dúvida, estamos à disposição.`,budgetfollowup:`{{ saudacao }}, {{ cliente }}!

Seu orçamento da OS {{ ordem }} segue aguardando retorno há {{ dias_pendentes }} dias.

Você pode aprovar ou acompanhar pelo link: {{ link_os }}

Se precisar de ajuda, estamos à disposição.`,pendingpayment:`{{ saudacao }}, {{ cliente }}!

A OS {{ ordem }} segue com saldo pendente de {{ saldo }}.

Você pode acompanhar pelo link: {{ link_os }}

Se já realizou o pagamento, desconsidere esta mensagem.`},m={cliente:"João da Silva",ordem:"1024",link_os:"https://seusite.com.br/os/abc123",saudacao:"Boa tarde",saudação:"Boa tarde",saldo:"R$ 185,00",dias_pendentes:"3"},N=d=>d.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"_").replace(/-/g,"_"),s=d=>d?d.replace(/\{\{\s*([^}]+?)\s*\}\}/g,(n,a)=>{const l=N(String(a));return l in m?m[l]:""}):"";function q({whatsappmessage:d}){const{data:n,setData:a,patch:l,processing:c}=x({generatedbudget:d==null?void 0:d.generatedbudget,servicecompleted:d==null?void 0:d.servicecompleted,feedback:d==null?void 0:d.feedback,defaultmessage:d==null?void 0:d.defaultmessage,budgetfollowup:d==null?void 0:d.budgetfollowup,pendingpayment:d==null?void 0:d.pendingpayment}),p=o=>{o.preventDefault(),l(route("app.whatsapp-message.update",d==null?void 0:d.id),{onSuccess:()=>{j("Sucesso","Mensagens para whatsapp ajustadas com sucesso")}})},g=()=>{a("generatedbudget",i.generatedbudget),a("servicecompleted",i.servicecompleted),a("feedback",i.feedback),a("defaultmessage",i.defaultmessage),a("budgetfollowup",i.budgetfollowup),a("pendingpayment",i.pendingpayment)};return e.jsxs(k,{breadcrumbs:S,children:[e.jsx(f,{title:"Mensagens WhatsApp"}),e.jsx("div",{className:"flex min-h-16 flex-col justify-center gap-1 px-4 py-3",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(h,{iconNode:v,className:"h-8 w-8"}),e.jsx("h2",{className:"text-xl font-semibold tracking-tight",children:"Mensagens WhatsApp"})]})}),e.jsx("div",{className:"flex items-center justify-between p-4",children:e.jsx("div",{})}),e.jsx("div",{className:"p-4",children:e.jsx("div",{className:"rounded-lg border p-2",children:e.jsxs("form",{onSubmit:p,autoComplete:"off",className:"space-y-8",children:[e.jsxs("div",{className:"mt-4 grid gap-4",children:[e.jsxs("div",{className:"text-muted-foreground rounded-md border border-dashed p-3 text-sm",children:["Para usar as mensagens padrão, basta clicar em salvar. Se precisar, altere os textos conforme a necessidade. Os templates inserem automaticamente informações do cliente e da O.S. pelos placeholders: ",e.jsx("code",{children:"{{ cliente }}"}),","," ",e.jsx("code",{children:"{{ ordem }}"}),", ",e.jsx("code",{children:"{{ link_os }}"}),", ",e.jsx("code",{children:"{{ saudacao }}"}),","," ",e.jsx("code",{children:"{{ saldo }}"})," e ",e.jsx("code",{children:"{{ dias_pendentes }}"}),"."]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"generatedbudget",children:"Orçamento gerado"}),e.jsx(t,{id:"generatedbudget",value:n.generatedbudget,onChange:o=>a("generatedbudget",o.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",s(n.generatedbudget)]})]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"servicecompleted",children:"Serviço concluído"}),e.jsx(t,{id:"servicecompleted",value:n.servicecompleted,onChange:o=>a("servicecompleted",o.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",s(n.servicecompleted)]})]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"feedback",children:"Feedback ao cliente"}),e.jsx(t,{id:"feedback",value:n.feedback,onChange:o=>a("feedback",o.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",s(n.feedback)]})]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"defaultmessage",children:"Mensagem padrão (demais status)"}),e.jsx(t,{id:"defaultmessage",value:n.defaultmessage,onChange:o=>a("defaultmessage",o.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",s(n.defaultmessage)]})]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"budgetfollowup",children:"Orçamento parado"}),e.jsx(t,{id:"budgetfollowup",value:n.budgetfollowup,onChange:o=>a("budgetfollowup",o.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",s(n.budgetfollowup)]})]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"pendingpayment",children:"Cobrança pendente"}),e.jsx(t,{id:"pendingpayment",value:n.pendingpayment,onChange:o=>a("pendingpayment",o.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",s(n.pendingpayment)]})]})]}),e.jsxs("div",{className:"flex justify-end gap-2",children:[e.jsx(u,{type:"button",variant:"outline",onClick:g,disabled:c,children:"Restaurar modelos"}),e.jsxs(u,{type:"submit",disabled:c,children:[e.jsx(b,{}),"Salvar"]})]})]})})})]})}export{q as default};
