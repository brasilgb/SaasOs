import{r,j as i}from"./vendor-Czgx20rQ.js";const s={0:"101001101101",1:"110100101011",2:"101100101011",3:"110110010101",4:"101001101011",5:"110100110101",6:"101100110101",7:"101001011011",8:"110100101101",9:"101100101101"};function o(e){const t=String(e||"").replace(/\D/g,"");return t?t.slice(0,12):`${Date.now()}`.slice(-12)}function d({value:e}){const t=`1010${e.split("").map(n=>s[n]??s[0]).join("00")}101`;return i.jsx("div",{className:"part-barcode","aria-label":`Codigo de barras ${e}`,children:t.split("").map((n,a)=>i.jsx("span",{className:n==="1"?"bar on":"bar off"},`${e}-${a}`))})}function l({part:e}){const t=o((e==null?void 0:e.reference_number)??"");return r.useEffect(()=>{const n=window.setTimeout(()=>{window.print()},300);return()=>window.clearTimeout(n)},[]),i.jsxs("div",{className:"bg-white text-black",children:[i.jsx("style",{children:`
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
                    display: flex;
                    align-items: stretch;
                    justify-content: center;
                }
                .part-barcode .bar {
                    display: block;
                    width: 0.32mm;
                    height: 100%;
                }
                .part-barcode .bar.on {
                    background: #000;
                }
                .part-barcode .bar.off {
                    background: transparent;
                }
                .part-code {
                    font-size: 8px;
                    letter-spacing: 0.6px;
                    line-height: 1;
                    text-align: center;
                }
            `}),i.jsx("div",{className:"part-sheet",children:i.jsxs("div",{className:"part-label",children:[i.jsxs("div",{className:"part-top",children:[i.jsx("div",{className:"part-category",children:(e==null?void 0:e.category)||"Produto"}),i.jsx("div",{className:"part-badge",children:(e==null?void 0:e.type)==="product"?"PRODUTO":"PECA"})]}),i.jsx("div",{className:"part-name",children:(e==null?void 0:e.name)||"Item sem nome"}),i.jsxs("div",{className:"part-ref",children:["Ref: ",(e==null?void 0:e.reference_number)||"-"]}),i.jsxs("div",{className:"part-price",children:["R$ ",Number((e==null?void 0:e.sale_price)||0).toFixed(2).replace(".",",")]}),i.jsxs("div",{className:"part-footer",children:[i.jsx(d,{value:t}),i.jsx("div",{className:"part-code",children:t})]})]})})]})}export{l as default};
