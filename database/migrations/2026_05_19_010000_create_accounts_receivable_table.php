<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accounts_receivable', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('source_type', 30);
            $table->unsignedBigInteger('source_id');
            $table->string('description')->nullable();
            $table->decimal('total_amount', 12, 2);
            $table->decimal('paid_amount', 12, 2)->default(0);
            $table->decimal('balance_amount', 12, 2)->default(0);
            $table->date('due_date')->nullable();
            $table->string('status', 20)->default('pending');
            $table->string('payment_method', 30)->nullable();
            $table->unsignedSmallInteger('installment_number')->default(1);
            $table->unsignedSmallInteger('installments_total')->default(1);
            $table->timestamp('last_paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['tenant_id', 'source_type', 'source_id', 'installment_number'], 'accounts_receivable_source_unique');
            $table->index(['tenant_id', 'status', 'due_date'], 'accounts_receivable_status_due_idx');
            $table->index(['tenant_id', 'customer_id'], 'accounts_receivable_customer_idx');
        });

        $this->backfillOrders();
        $this->backfillSales();
    }

    public function down(): void
    {
        Schema::dropIfExists('accounts_receivable');
    }

    private function backfillOrders(): void
    {
        if (! Schema::hasTable('orders') || ! Schema::hasTable('order_payments')) {
            return;
        }

        DB::table('orders')
            ->leftJoinSub(
                DB::table('order_payments')
                    ->selectRaw('order_id, COALESCE(SUM(amount), 0) as paid_amount, MAX(paid_at) as last_paid_at')
                    ->groupBy('order_id'),
                'payments',
                'payments.order_id',
                '=',
                'orders.id'
            )
            ->whereNotNull('orders.tenant_id')
            ->where('orders.service_cost', '>', 0)
            ->select([
                'orders.id',
                'orders.tenant_id',
                'orders.customer_id',
                'orders.order_number',
                'orders.service_cost',
                'orders.delivery_forecast',
                'orders.created_at',
                'orders.updated_at',
                'payments.paid_amount',
                'payments.last_paid_at',
            ])
            ->orderBy('orders.id')
            ->chunkById(500, function ($orders): void {
                $now = now();
                $rows = $orders->map(function ($order) use ($now): array {
                    $total = round((float) $order->service_cost, 2);
                    $paid = round((float) ($order->paid_amount ?? 0), 2);
                    $balance = round(max(0, $total - $paid), 2);

                    return [
                        'tenant_id' => $order->tenant_id,
                        'customer_id' => $order->customer_id,
                        'source_type' => 'order',
                        'source_id' => $order->id,
                        'description' => 'OS '.$order->order_number,
                        'total_amount' => $total,
                        'paid_amount' => min($paid, $total),
                        'balance_amount' => $balance,
                        'due_date' => $order->delivery_forecast,
                        'status' => $this->statusFor($total, $paid),
                        'payment_method' => null,
                        'installment_number' => 1,
                        'installments_total' => 1,
                        'last_paid_at' => $order->last_paid_at,
                        'notes' => null,
                        'created_at' => $order->created_at ?? $now,
                        'updated_at' => $order->updated_at ?? $now,
                    ];
                })->all();

                DB::table('accounts_receivable')->insert($rows);
            }, 'orders.id', 'id');
    }

    private function backfillSales(): void
    {
        if (! Schema::hasTable('sales')) {
            return;
        }

        DB::table('sales')
            ->whereNotNull('tenant_id')
            ->where('total_amount', '>', 0)
            ->select([
                'id',
                'tenant_id',
                'customer_id',
                'sales_number',
                'total_amount',
                'paid_amount',
                'financial_status',
                'payment_method',
                'status',
                'created_at',
                'updated_at',
            ])
            ->orderBy('id')
            ->chunkById(500, function ($sales): void {
                $now = now();
                $rows = $sales->map(function ($sale) use ($now): array {
                    $total = round((float) $sale->total_amount, 2);
                    $paid = round((float) ($sale->paid_amount ?? 0), 2);
                    $balance = round(max(0, $total - $paid), 2);

                    return [
                        'tenant_id' => $sale->tenant_id,
                        'customer_id' => $sale->customer_id,
                        'source_type' => 'sale',
                        'source_id' => $sale->id,
                        'description' => 'Venda '.$sale->sales_number,
                        'total_amount' => $total,
                        'paid_amount' => min($paid, $total),
                        'balance_amount' => $balance,
                        'due_date' => $sale->created_at ? substr((string) $sale->created_at, 0, 10) : null,
                        'status' => $sale->status === 'cancelled' ? 'cancelled' : $this->statusFor($total, $paid),
                        'payment_method' => $sale->payment_method,
                        'installment_number' => 1,
                        'installments_total' => 1,
                        'last_paid_at' => $paid > 0 ? $sale->created_at : null,
                        'notes' => null,
                        'created_at' => $sale->created_at ?? $now,
                        'updated_at' => $sale->updated_at ?? $now,
                    ];
                })->all();

                DB::table('accounts_receivable')->insert($rows);
            });
    }

    private function statusFor(float $total, float $paid): string
    {
        if ($paid <= 0) {
            return 'pending';
        }

        if ($paid + 0.009 < $total) {
            return 'partial';
        }

        return 'paid';
    }
};
