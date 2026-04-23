import{u as x,j as e,H as f,af as v,e as b}from"./vendor-616b0WND.js";import{t as j}from"./app-toast-messages-UBHMc141.js";import{B as h}from"./breadcrumbs-TBZR7o_i.js";import{I as k}from"./icon-v5h-vecz.js";import{B as u}from"./button-CWhvExll.js";import{L as r}from"./label-HV5QH6QA.js";import{T as t}from"./textarea-CgroZfiF.js";import{A as S}from"./app-layout-BJGHKP3y.js";import"./index-e0PRenng.js";import"./utils-B80DjS2q.js";import"./app-D0gQG_ta.js";/* empty css            */import"./app-sidebar-header-Ds_uv1Mk.js";import"./badge-DJu_cbwO.js";import"./tooltip-BJ5Z26OI.js";import"./mask-J12cI_QU.js";import"./moment-BLMuvzoS.js";const N=[{title:"Dashboard",href:route("app.dashboard")},{title:"Mensagens Whatsapp",href:"#"}],s={generatedbudget:`{{ saudacao }}, {{ cliente }}!

Seu orçamento da OS {{ ordem }} já está disponível.

Você pode acompanhar pelo link: {{ link_os }}

Se tiver dúvidas, estamos à disposição.`,servicecompleted:`{{ saudacao }}, {{ cliente }}!

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

Se já realizou o pagamento, desconsidere esta mensagem.`},m={cliente:"João da Silva",ordem:"1024",link_os:"https://seusite.com.br/os/abc123",saudacao:"Boa tarde",saudação:"Boa tarde",saldo:"R$ 185,00",dias_pendentes:"3"},y=d=>d.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"_").replace(/-/g,"_"),i=d=>d?d.replace(/\{\{\s*([^}]+?)\s*\}\}/g,(o,n)=>{const l=y(String(n));return l in m?m[l]:""}):"";function H({whatsappmessage:d}){const{data:o,setData:n,patch:l,processing:c}=x({generatedbudget:d==null?void 0:d.generatedbudget,servicecompleted:d==null?void 0:d.servicecompleted,feedback:d==null?void 0:d.feedback,defaultmessage:d==null?void 0:d.defaultmessage,budgetfollowup:d==null?void 0:d.budgetfollowup,pendingpayment:d==null?void 0:d.pendingpayment}),p=a=>{a.preventDefault(),l(route("app.whatsapp-message.update",d==null?void 0:d.id),{onSuccess:()=>{j("Sucesso","Mensagens para whatsapp ajustadas com sucesso")}})},g=()=>{n("generatedbudget",s.generatedbudget),n("servicecompleted",s.servicecompleted),n("feedback",s.feedback),n("defaultmessage",s.defaultmessage),n("budgetfollowup",s.budgetfollowup),n("pendingpayment",s.pendingpayment)};return e.jsxs(S,{children:[e.jsx(f,{title:"Mensagens WhatsApp"}),e.jsxs("div",{className:"flex h-16 items-center justify-between px-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(k,{iconNode:v,className:"h-8 w-8"}),e.jsx("h2",{className:"text-xl font-semibold tracking-tight",children:"Mensagens WhatsApp"})]}),e.jsx("div",{children:e.jsx(h,{breadcrumbs:N})})]}),e.jsx("div",{className:"flex items-center justify-between p-4",children:e.jsx("div",{})}),e.jsx("div",{className:"p-4",children:e.jsx("div",{className:"rounded-lg border p-2",children:e.jsxs("form",{onSubmit:p,autoComplete:"off",className:"space-y-8",children:[e.jsxs("div",{className:"mt-4 grid gap-4",children:[e.jsxs("div",{className:"text-muted-foreground rounded-md border border-dashed p-3 text-sm",children:["Você pode usar placeholders nas mensagens: ",e.jsx("code",{children:"{{ cliente }}"}),", ",e.jsx("code",{children:"{{ ordem }}"}),","," ",e.jsx("code",{children:"{{ link_os }}"}),", ",e.jsx("code",{children:"{{ saudacao }}"}),", ",e.jsx("code",{children:"{{ saldo }}"})," e"," ",e.jsx("code",{children:"{{ dias_pendentes }}"}),"."]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"generatedbudget",children:"Orçamento gerado"}),e.jsx(t,{id:"generatedbudget",value:o.generatedbudget,onChange:a=>n("generatedbudget",a.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",i(o.generatedbudget)]})]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"servicecompleted",children:"Serviço concluído"}),e.jsx(t,{id:"servicecompleted",value:o.servicecompleted,onChange:a=>n("servicecompleted",a.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",i(o.servicecompleted)]})]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"feedback",children:"Feedback ao cliente"}),e.jsx(t,{id:"feedback",value:o.feedback,onChange:a=>n("feedback",a.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",i(o.feedback)]})]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"defaultmessage",children:"Mensagem padrão (demais status)"}),e.jsx(t,{id:"defaultmessage",value:o.defaultmessage,onChange:a=>n("defaultmessage",a.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",i(o.defaultmessage)]})]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"budgetfollowup",children:"Orçamento parado"}),e.jsx(t,{id:"budgetfollowup",value:o.budgetfollowup,onChange:a=>n("budgetfollowup",a.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",i(o.budgetfollowup)]})]}),e.jsxs("div",{className:"grid gap-2 md:col-span-2",children:[e.jsx(r,{htmlFor:"pendingpayment",children:"Cobrança pendente"}),e.jsx(t,{id:"pendingpayment",value:o.pendingpayment,onChange:a=>n("pendingpayment",a.target.value)}),e.jsxs("div",{className:"text-muted-foreground bg-muted/40 rounded-md p-2 text-xs whitespace-pre-wrap",children:["Prévia: ",i(o.pendingpayment)]})]})]}),e.jsxs("div",{className:"flex justify-end gap-2",children:[e.jsx(u,{type:"button",variant:"outline",onClick:g,disabled:c,children:"Restaurar modelos"}),e.jsxs(u,{type:"submit",disabled:c,children:[e.jsx(b,{}),"Salvar"]})]})]})})})]})}export{H as default};
