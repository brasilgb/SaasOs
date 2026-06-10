<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('schedules', 'local_payment_received')) {
                $table->boolean('local_payment_received')->default(false)->after('updated_at');
            }

            if (! Schema::hasColumn('schedules', 'local_payment_amount')) {
                $table->decimal('local_payment_amount', 10, 2)->nullable()->after('local_payment_received');
            }

            if (! Schema::hasColumn('schedules', 'local_payment_received_at')) {
                $table->timestamp('local_payment_received_at')->nullable()->after('local_payment_amount');
            }

            if (! Schema::hasColumn('schedules', 'local_payment_user_id')) {
                $table->foreignId('local_payment_user_id')
                    ->nullable()
                    ->after('local_payment_received_at')
                    ->constrained('users')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            if (Schema::hasColumn('schedules', 'local_payment_user_id')) {
                $table->dropForeign(['local_payment_user_id']);
            }

            $table->dropColumn(array_filter([
                Schema::hasColumn('schedules', 'local_payment_user_id') ? 'local_payment_user_id' : null,
                Schema::hasColumn('schedules', 'local_payment_received_at') ? 'local_payment_received_at' : null,
                Schema::hasColumn('schedules', 'local_payment_amount') ? 'local_payment_amount' : null,
                Schema::hasColumn('schedules', 'local_payment_received') ? 'local_payment_received' : null,
            ]));
        });
    }
};
