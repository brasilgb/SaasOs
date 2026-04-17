<?php

namespace App\Listeners;

use App\Events\SaleCreated;
use App\Models\App\Sale;
use App\Models\App\SaleLog;

class RecordSaleCreatedLifecycle
{
    public function handle(SaleCreated $event): void
    {
        $sale = Sale::query()->find($event->saleId);

        if (! $sale) {
            return;
        }

        SaleLog::create([
            'sale_id' => $sale->id,
            'user_id' => $event->actorId,
            'action' => 'created',
            'data' => $event->data,
        ]);
    }
}
