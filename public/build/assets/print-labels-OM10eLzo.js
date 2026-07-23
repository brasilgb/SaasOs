import{r as h,j as e}from"./vendor-CPQ7knhm.js";import{E as f}from"./ean13-barcode-DiRZ-dp9.js";const p=(s,o)=>{const m=[];for(let a=0;a<s.length;a+=o)m.push(s.slice(a,a+o));return m};function w({data:s,format:o="a4"}){const m=h.useRef(null),a=Array.isArray(s)?s:[],x=p(a,96),g=o==="thermal";return h.useEffect(()=>{const t=window.setTimeout(()=>{window.print()},300);return()=>window.clearTimeout(t)},[]),e.jsx("div",{ref:m,className:"bg-white text-black",children:g?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
                        @page {
                            size: 60mm 40mm;
                            margin: 0;
                        }
                        @media print {
                            html, body {
                                margin: 0;
                                padding: 0;
                                width: 60mm;
                            }
                        }
                        .thermal-sheet {
                            display: flex;
                            flex-direction: column;
                            gap: 0;
                        }
                        .thermal-label {
                            width: 60mm;
                            height: 40mm;
                            box-sizing: border-box;
                            page-break-after: always;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 3mm;
                        }
                        .thermal-label:last-child {
                            page-break-after: auto;
                        }
                        .thermal-box {
                            width: 100%;
                            height: 100%;
                            border: 1.2px solid #000;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                            align-items: stretch;
                            text-align: center;
                            padding: 2mm 2.2mm;
                            box-sizing: border-box;
                            gap: 1mm;
                        }
                        .thermal-header {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            gap: 2mm;
                            border-bottom: 1px solid #000;
                            padding-bottom: 1mm;
                        }
                        .thermal-badge {
                            font-size: 7px;
                            font-weight: 800;
                            letter-spacing: 0.8px;
                            border: 1px solid #000;
                            padding: 0.5mm 1.2mm;
                            white-space: nowrap;
                        }
                        .thermal-company {
                            font-size: 9px;
                            font-weight: 700;
                            line-height: 1.1;
                            text-align: left;
                            max-width: 36mm;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .thermal-body {
                            display: flex;
                            flex-direction: column;
                            align-items: stretch;
                            justify-content: center;
                            gap: 0.8mm;
                            flex: 1;
                        }
                        .thermal-customer {
                            font-size: 8.5px;
                            line-height: 1.1;
                            text-align: left;
                            max-width: 100%;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .thermal-order-row {
                            display: flex;
                            align-items: baseline;
                            justify-content: flex-start;
                            gap: 1.6mm;
                        }
                        .thermal-order-tag {
                            font-size: 9px;
                            font-weight: 800;
                            letter-spacing: 0.8px;
                            line-height: 1;
                        }
                        .thermal-order-number {
                            font-size: 22px;
                            font-weight: 800;
                            line-height: 1;
                            letter-spacing: 0.5px;
                        }
                        .thermal-footer {
                            border-top: 1px solid #000;
                            padding-top: 1mm;
                            display: flex;
                            flex-direction: column;
                            gap: 0.5mm;
                        }
                        .thermal-phone {
                            font-size: 8.5px;
                            line-height: 1;
                            text-align: center;
                            max-width: 100%;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                        }
                        .thermal-barcode {
                            width: 100%;
                            height: 8mm;
                            display: block;
                            color: #000;
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                            shape-rendering: crispEdges;
                        }
                        .thermal-code {
                            font-size: 8px;
                            letter-spacing: 0.6px;
                            line-height: 1;
                        }
                    `}),e.jsx("div",{className:"thermal-sheet",children:a.map((t,r)=>e.jsx("div",{className:"thermal-label",children:e.jsxs("div",{className:"thermal-box",children:[e.jsxs("div",{className:"thermal-header",children:[e.jsx("div",{className:"thermal-company",children:t.company}),e.jsx("div",{className:"thermal-badge",children:"ASSISTENCIA"})]}),e.jsxs("div",{className:"thermal-body",children:[e.jsx("div",{className:"thermal-customer",children:t.customer||"Cliente nao informado"}),e.jsxs("div",{className:"thermal-order-row",children:[e.jsx("div",{className:"thermal-order-tag",children:"OS"}),e.jsxs("div",{className:"thermal-order-number",children:["#",t.order]})]})]}),e.jsxs("div",{className:"thermal-footer",children:[e.jsx(f,{className:"thermal-barcode",value:t.barcode||String(t.order)}),e.jsx("div",{className:"thermal-code",children:t.barcode||String(t.order)}),e.jsx("div",{className:"thermal-phone",children:t.telephone})]})]})},`thermal-${r}-${t.order}`))})]}):x.map((t,r)=>{const c=p(t,6);return e.jsxs("div",{className:"page",children:[c.map((d,l)=>e.jsxs("div",{className:"row",children:[d.map((i,n)=>e.jsx("div",{className:"etiqueta",children:e.jsxs("div",{className:"conteudo",children:[e.jsx("div",{className:"empresa",children:i.company}),e.jsx("div",{className:"pedido",children:i.order}),e.jsx("div",{className:"telefone",children:i.telephone})]})},`${r}-${l}-${n}`)),d.length<6&&Array.from({length:6-d.length}).map((i,n)=>e.jsx("div",{className:"etiqueta"},`empty-col-${r}-${l}-${n}`))]},l)),c.length<16&&Array.from({length:16-c.length}).map((d,l)=>e.jsx("div",{className:"row",children:Array.from({length:6}).map((i,n)=>e.jsx("div",{className:"etiqueta"},`empty-label-${r}-${l}-${n}`))},`empty-row-${r}-${l}`))]},r)})})}export{w as default};
