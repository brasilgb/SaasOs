<?php

namespace App\Support;

final class OrderStatus
{
    public const OPEN = 1;
    public const CANCELLED = 2;
    public const BUDGET_GENERATED = 3;
    public const BUDGET_APPROVED = 4;
    public const BUDGET_REJECTED = 5;
    public const REPAIR_IN_PROGRESS = 6;
    public const SERVICE_COMPLETED = 7;
    public const SERVICE_NOT_EXECUTED = 8;
    public const CUSTOMER_NOTIFIED = 9;
    public const DELIVERED = 10;

    /**
     * @return array<int, string>
     */
    public static function labels(): array
    {
        return [
            self::OPEN => 'Ordem Aberta',
            self::CANCELLED => 'Ordem Cancelada',
            self::BUDGET_GENERATED => 'Orçamento Gerado',
            self::BUDGET_APPROVED => 'Orçamento Aprovado',
            self::BUDGET_REJECTED => 'Orçamento reprovado',
            self::REPAIR_IN_PROGRESS => 'Reparo em andamento',
            self::SERVICE_COMPLETED => 'Serviço concluído',
            self::SERVICE_NOT_EXECUTED => 'Serviço não executado',
            self::CUSTOMER_NOTIFIED => 'Cliente avisado / aguardando retirada',
            self::DELIVERED => 'Entregue ao cliente',
        ];
    }

    /**
     * @return list<int>
     */
    public static function values(): array
    {
        return array_keys(self::labels());
    }

    public static function label(int|string|null $status, string $fallback = 'Status atualizado'): string
    {
        if ($status === null || $status === '') {
            return $fallback;
        }

        return self::labels()[(int) $status] ?? $fallback;
    }

    /**
     * @return array<int, list<int>>
     */
    public static function transitions(): array
    {
        return [
            self::OPEN => [self::CANCELLED, self::BUDGET_GENERATED],
            self::CANCELLED => [],
            self::BUDGET_GENERATED => [self::BUDGET_APPROVED, self::BUDGET_REJECTED, self::CANCELLED],
            self::BUDGET_APPROVED => [self::REPAIR_IN_PROGRESS, self::SERVICE_COMPLETED, self::SERVICE_NOT_EXECUTED, self::CANCELLED],
            self::BUDGET_REJECTED => [self::BUDGET_GENERATED, self::CANCELLED],
            self::REPAIR_IN_PROGRESS => [self::SERVICE_COMPLETED, self::SERVICE_NOT_EXECUTED, self::CANCELLED],
            self::SERVICE_COMPLETED => [self::CUSTOMER_NOTIFIED, self::DELIVERED],
            self::SERVICE_NOT_EXECUTED => [self::CUSTOMER_NOTIFIED, self::DELIVERED],
            self::CUSTOMER_NOTIFIED => [self::DELIVERED],
            self::DELIVERED => [],
        ];
    }

    public static function canTransition(int|string|null $from, int|string|null $to): bool
    {
        if ($from === null || $to === null || $from === '' || $to === '') {
            return false;
        }

        $fromStatus = (int) $from;
        $toStatus = (int) $to;

        if ($fromStatus === $toStatus) {
            return true;
        }

        return in_array($toStatus, self::transitions()[$fromStatus] ?? [], true);
    }
}
