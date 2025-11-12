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

interface SelectFilterProps {
    dataStatus: any;
    url: string;
    noOrder?: boolean;
}

export default function SelectFilter({dataStatus, url, noOrder}: SelectFilterProps) {
    const { ziggy } = usePage().props as any;
    const { status } = (ziggy as any).query

    const { data, get } = useForm({
        statusorder: status || '',
    });

    function handleSubmit(value: any) {
        console.log("Selected status:", value);
        get(route(`${url}`, { "status": `${value}` }));
    }

    return (
        <div className="flex items-center space-x-2">
            <Select defaultValue={`${data.statusorder}`} value={`${data.statusorder}`} onValueChange={(value) => handleSubmit(value)}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {!noOrder &&
                        <>
                        <SelectLabel>Feedback</SelectLabel>
                        <SelectItem value="999">Listar Feedback</SelectItem></>
                        }
                        <SelectLabel>Status</SelectLabel>
                        {dataStatus.map((status: any) => (
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

