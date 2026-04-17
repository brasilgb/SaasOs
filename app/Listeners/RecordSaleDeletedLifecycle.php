<?php

namespace App\Listeners;

use App\Events\SaleDeleted;
use App\Models\App\Sale;
use App\Services\OperationalAuditService;

class RecordSaleDeletedLifecycle
{
    public function __construct(private readonly OperationalAuditService $operationalAuditService) {}

    public function handle(SaleDeleted $event): void
    {
        $sale = Sale::query()->find($event->saleId);

        if (! $sale) {
            return;
        }

        $this->operationalAuditService->record(
            'sale_deleted',
            'sale',
            $sale,
            $event->actorId,
            $event->auditData,
        );
    }
}
