import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    active?: string;
    enabled?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    othersettings: {budget: boolean, navigation: boolean}
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Customer {
    id: number;
    name: string;
    cpf: string;
    birth: string;
    email: string;
    cep: string;
    uf: string;
    city: string;
    district: string;
    street: string;
    complement: string;
    number: number;
    phone: string;
    contactname: string;
    whatsapp: string;
    contactphone: string;
    observations: string;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User;
    };
    errors: Record<string, string>;
    success?: string; // Optional success message from Laravel
    error?: string; // Optional error message from Laravel
};
export interface Order {
    id: number;
    customer_id: number;
    equipment_id: number;
    model: string;
    service_status: number;
    created_at: string;
    updated_at: string;
    customer: Customer;
    equipment: Equipment;
    delivery_date: string;
}

export interface Scheduler {
    id: number;
    customer_id: number;
    service: string;
    status: number;
    schedules: string;
    created_at: string;
    updated_at: string;
    customer: Customer;
    user: User;
}

export interface Message {
    id: number;
    sender_id: number;
    recipient_id: number;
    title: string;
    message: string;
    status: number;
    sender: User;
    recipient: User;
}