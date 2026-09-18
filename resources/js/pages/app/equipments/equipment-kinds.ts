export const EQUIPMENT_KINDS = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'pc', label: 'PC' },
    { value: 'other', label: 'Outro' },
] as const;

export function equipmentKindLabel(kind?: string | null): string {
    return EQUIPMENT_KINDS.find((option) => option.value === kind)?.label ?? '—';
}
