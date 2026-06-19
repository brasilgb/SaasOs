<?php

namespace App\Models\App;

use App\Models\User;
use App\Tenantable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Schedule extends Model
{
    use HasFactory, Tenantable;

    protected $casts = [
        'material_checklist' => 'array',
        'service_closure_requested_at' => 'datetime',
        'service_closure_amount' => 'decimal:2',
        'service_closure_priced_at' => 'datetime',
        'send_to_technician' => 'boolean',
        'check_in_at' => 'datetime',
        'check_in_latitude' => 'decimal:7',
        'check_in_longitude' => 'decimal:7',
        'check_out_at' => 'datetime',
        'check_out_latitude' => 'decimal:7',
        'check_out_longitude' => 'decimal:7',
        'local_payment_received' => 'boolean',
        'local_payment_amount' => 'decimal:2',
        'local_payment_received_at' => 'datetime',
        'local_payment_cash_registered_at' => 'datetime',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ScheduleImage::class);
    }

    public static function normalizeMaterialChecklist(mixed $items): array
    {
        return collect(is_array($items) ? $items : [])
            ->map(function ($item): ?array {
                if (is_string($item)) {
                    $name = trim($item);

                    return $name === '' ? null : [
                        'name' => mb_substr($name, 0, 150),
                        'quantity' => 1,
                        'part_id' => null,
                        'used' => false,
                    ];
                }

                if (! is_array($item)) {
                    return null;
                }

                $name = trim((string) ($item['name'] ?? $item['label'] ?? $item['item'] ?? ''));
                $quantity = max(1, (int) ($item['quantity'] ?? 1));

                if ($name === '') {
                    return null;
                }

                return [
                    'name' => mb_substr($name, 0, 150),
                    'quantity' => $quantity,
                    'part_id' => filled($item['part_id'] ?? null) ? (int) $item['part_id'] : null,
                    'used' => (bool) ($item['used'] ?? false),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    public function normalizedMaterialChecklist(): array
    {
        return self::normalizeMaterialChecklist($this->material_checklist ?? []);
    }

    public function materialChecklistLabels(): array
    {
        return collect($this->normalizedMaterialChecklist())
            ->map(fn (array $item): string => ($item['quantity'] ?? 1).'x '.$item['name'])
            ->values()
            ->all();
    }
}
