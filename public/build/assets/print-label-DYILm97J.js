import{r as a,j as i}from"./vendor-BnvwCQ3X.js";import{g as n,E as r}from"./ean13-barcode-vSv6ml7-.js";function l({part:e}){const t=String((e==null?void 0:e.part_number)??""),s=n(t);return a.useEffect(()=>{const o=window.setTimeout(()=>{window.print()},300);return()=>window.clearTimeout(o)},[]),i.jsxs("div",{className:"bg-white text-black",children:[i.jsx("style",{children:`
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
                .part-sheet {
                    width: 60mm;
                    height: 40mm;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 3mm;
                    box-sizing: border-box;
                }
                .part-label {
                    width: 100%;
                    height: 100%;
                    border: 1.2px solid #000;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    padding: 2mm 2.2mm;
                    box-sizing: border-box;
                    gap: 1mm;
                    font-family: Arial, sans-serif;
                }
                .part-top {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 2mm;
                    border-bottom: 1px solid #000;
                    padding-bottom: 1mm;
                }
                .part-badge {
                    font-size: 7px;
                    font-weight: 800;
                    letter-spacing: 0.8px;
                    border: 1px solid #000;
                    padding: 0.5mm 1.2mm;
                    white-space: nowrap;
                }
                .part-category {
                    font-size: 8px;
                    font-weight: 700;
                    max-width: 35mm;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .part-name {
                    font-size: 10px;
                    font-weight: 700;
                    line-height: 1.15;
                    min-height: 7mm;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .part-ref {
                    font-size: 8px;
                    line-height: 1;
                }
                .part-price {
                    font-size: 13px;
                    font-weight: 800;
                    line-height: 1;
                }
                .part-footer {
                    border-top: 1px solid #000;
                    padding-top: 1mm;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5mm;
                }
                .part-barcode {
                    width: 100%;
                    height: 8mm;
                    display: block;
                    color: #000;
                    print-color-adjust: exact;
                    -webkit-print-color-adjust: exact;
                    shape-rendering: crispEdges;
                }
                .part-code {
                    font-size: 8px;
                    letter-spacing: 0.6px;
                    line-height: 1;
                    text-align: center;
                }
            `}),i.jsx("div",{className:"part-sheet",children:i.jsxs("div",{className:"part-label",children:[i.jsxs("div",{className:"part-top",children:[i.jsx("div",{className:"part-category",children:(e==null?void 0:e.category)||"Produto"}),i.jsx("div",{className:"part-badge",children:(e==null?void 0:e.type)==="product"?"PRODUTO":"PECA"})]}),i.jsx("div",{className:"part-name",children:(e==null?void 0:e.name)||"Item sem nome"}),i.jsxs("div",{className:"part-ref",children:["Nº do produto: ",t||"-"]}),i.jsxs("div",{className:"part-price",children:["R$"," ",Number((e==null?void 0:e.sale_price)||0).toFixed(2).replace(".",",")]}),i.jsxs("div",{className:"part-footer",children:[i.jsx(r,{className:"part-barcode",value:s}),i.jsx("div",{className:"part-code",children:s})]})]})})]})}export{l as default};
