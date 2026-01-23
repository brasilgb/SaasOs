import { maskCnpj, maskMoney } from "@/Utils/mask";
import { usePage } from "@inertiajs/react";
import moment from "moment";
import { forwardRef } from "react"

type Props = {
  paper: "58mm" | "80mm";
  items: any;
  total: any;
  customer: any;
  sale: any;
}

const widths = {
  "58mm": "219px",
  "80mm": "302px",
}

const Receipt = forwardRef<HTMLDivElement, Props>(
  ({ paper, items, total, customer, sale }, ref) => {
    const { auth } = usePage().props as any;
    const companyData = auth?.user?.tenant;

    return (
      <div
        ref={ref}
        id="print-area"
        className="bg-white text-black font-mono mx-auto"
        style={{ width: widths[paper] }}
      >
        <div className="p-2 text-[12px]">

          <div className="text-center font-bold uppercase">
            {companyData?.company}
          </div>

          <div className="text-center text-[10px] leading-tight">
            CNPJ: {maskCnpj(companyData?.cnpj)}<br />
            {companyData?.street}, {companyData?.number} - {companyData?.district}<br />
            {companyData?.city} - {companyData?.state}<br />
            {companyData?.telephone}
          </div>

          <div className="border-t border-dashed border-black my-2" />

          <div className="text-[10px]">
            Venda Nº {sale?.id}<br />
            Data: {moment(sale?.date).format('DD/MM/YYYY HH:mm')}<br />
            Cliente: {customer}
          </div>

          <div className="border-t border-dashed border-black my-2" />

          {items.map((item: any, i: number) => (
            <div key={i} className="text-[10px] mt-1">
              {item.name}
              <div className="flex justify-between pl-2">
                <span>{item.selected_quantity} x R$ {maskMoney(String(item.sale_price))}</span>
                <span>R$ {maskMoney(String(item.selected_quantity * item.sale_price))}</span>
              </div>
            </div>
          ))}

          <div className="border-t border-dashed border-black my-2" />

          <div className="flex justify-between font-bold text-[14px]">
            <span>TOTAL</span>
            <span>R$ {total}</span>
          </div>

          <div className="text-center text-[10px] mt-2">
            Documento sem valor fiscal
          </div>

        </div>
      </div>
    )
  }
)

Receipt.displayName = "Receipt"

export default Receipt
