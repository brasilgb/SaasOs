import{r as x,j as i}from"./vendor-BuJb2mYm.js";import{i as f,E as g}from"./ean13-barcode-CuNz8zR2.js";const b=["212222","222122","222221","121223","121322","131222","122213","122312","132212","221213","221312","231212","112232","122132","122231","113222","123122","123221","223211","221132","221231","213212","223112","312131","311222","321122","321221","312212","322112","322211","212123","212321","232121","111323","131123","131321","112313","132113","132311","211313","231113","231311","112133","112331","132131","113123","113321","133121","313121","211331","231131","213113","213311","213131","311123","311321","331121","312113","312311","332111","314111","221411","431111","111224","111422","121124","121421","141122","141221","112214","112412","122114","122411","142112","142211","241211","221114","413111","241112","134111","111242","121142","121241","114212","124112","124211","411212","421112","421211","212141","214121","412121","111143","111341","131141","114113","114311","411113","411311","113141","114131","311141","411131","211412","211214","211232","2331112"];function w(e){return String(e||"").trim().replace(/[^\x20-\x7E]/g,"")}function u({value:e}){if(!e)return null;if(f(e))return i.jsx(g,{className:"part-barcode",value:e});const s=104,n=[...e].map(t=>t.charCodeAt(0)-32),m=(s+n.reduce((t,o,a)=>t+o*(a+1),0))%103,p=[s,...n,m,106],d=10,c=[];let r=d;p.forEach(t=>{b[t].split("").forEach((o,a)=>{const l=Number(o);a%2===0&&c.push({x:r,width:l}),r+=l})});const h=r+d;return i.jsx("svg",{className:"part-barcode",viewBox:`0 0 ${h} 40`,preserveAspectRatio:"none","aria-label":`Codigo de barras ${e}`,children:c.map((t,o)=>i.jsx("rect",{x:t.x,y:"0",width:t.width,height:"40",fill:"#000"},`${t.x}-${o}`))})}function v({part:e}){const s=w(String((e==null?void 0:e.reference_number)??""));return x.useEffect(()=>{const n=window.setTimeout(()=>{window.print()},300);return()=>window.clearTimeout(n)},[]),i.jsxs("div",{className:"bg-white text-black",children:[i.jsx("style",{children:`
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
            `}),i.jsx("div",{className:"part-sheet",children:i.jsxs("div",{className:"part-label",children:[i.jsxs("div",{className:"part-top",children:[i.jsx("div",{className:"part-category",children:(e==null?void 0:e.category)||"Produto"}),i.jsx("div",{className:"part-badge",children:(e==null?void 0:e.type)==="product"?"PRODUTO":"PECA"})]}),i.jsx("div",{className:"part-name",children:(e==null?void 0:e.name)||"Item sem nome"}),i.jsxs("div",{className:"part-ref",children:["Ref: ",(e==null?void 0:e.reference_number)||"-"]}),i.jsxs("div",{className:"part-price",children:["R$"," ",Number((e==null?void 0:e.sale_price)||0).toFixed(2).replace(".",",")]}),i.jsxs("div",{className:"part-footer",children:[i.jsx(u,{value:s}),i.jsx("div",{className:"part-code",children:s})]})]})})]})}export{v as default};
