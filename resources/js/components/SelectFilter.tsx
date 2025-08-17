import * as React from "react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { statusServico } from "@/Utils/dataSelect"
import { useForm, usePage } from "@inertiajs/react";

export default function SelectFilter() {
    const { ziggy } = usePage().props as any;
    const { status } = (ziggy as any).query

    const { data, get } = useForm({
        statusorder: status || '',
    });

    function handleSubmit(value: any) {
        console.log("Selected status:", value);
        get(route('app.orders.index', { "status": `${value}` }));
    }

    return (
        <div className="flex items-center space-x-2">
            <Select defaultValue={`${data.statusorder}`} value={`${data.statusorder}`} onValueChange={(value) => handleSubmit(value)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar ordem por status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Feedback</SelectLabel>
                        <SelectItem value="999">Listar Feedback</SelectItem>
                        <SelectLabel>Status</SelectLabel>
                        {statusServico.map((status) => (
                            <SelectItem key={status.value} value={`${status.value}`}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}

