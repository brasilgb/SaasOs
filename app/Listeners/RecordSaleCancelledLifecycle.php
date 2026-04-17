<?php

namespace App\Listeners;

use App\Events\SaleCancelled;
use App\Models\App\Sale;
use App\Models\App\SaleLog;
use App\Services\OperationalAuditService;

class RecordSaleCancelledLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(SaleCancelled $event): void
    {
        $sale = Sale::query()->find($event->saleId);

        if (! $sale) {
            return;
        }

        SaleLog::create([
            'sale_id' => $sale->id,
            'user_id' => $event->actorId,
            'action' => 'cancelled',
            'data' => $event->logData,
        ]);

        $this->operationalAuditService->record(
            'sale_cancelled',
            'sale',
            $sale,
            $event->actorId,
            $event->auditData,
        );
    }
}
