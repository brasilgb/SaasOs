import{r as d,j as t}from"./vendor-DVMCu2My.js";import{u as n}from"./use-active-section-C6QrPRik.js";function m({sections:r}){const s=n(r.map(e=>e.id)),[o,a]=d.useState(!1);return t.jsxs("aside",{children:[t.jsx("button",{onClick:()=>a(!o),className:"lg:hidden mb-6 text-sm font-medium",children:"Índice"}),t.jsxs("nav",{className:`
        ${o?"block":"hidden"}
        lg:block
        sticky top-24
        space-y-2
        text-sm
        `,children:[t.jsx("p",{className:"font-semibold mb-4 text-foreground",children:"Índice"}),r.map(e=>t.jsx("a",{href:`#${e.id}`,className:`
              block
              border-l
              pl-3
              py-1
              transition-colors

              ${s===e.id?"border-primary text-foreground font-medium":"border-transparent text-muted-foreground hover:text-foreground"}
            `,children:e.title},e.id))]})]})}export{m as default};
