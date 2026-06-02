<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->text('technician_diagnosis')->nullable()->after('services_performed');
            $table->text('technician_solution')->nullable()->after('technician_diagnosis');
            $table->text('technician_observations')->nullable()->after('technician_solution');
            $table->timestamp('technician_attended_at')->nullable()->after('technician_observations');
            $table->boolean('technician_local_payment_received')->default(false)->after('technician_attended_at');
            $table->decimal('technician_local_payment_amount', 10, 2)->nullable()->after('technician_local_payment_received');
            $table->string('technician_local_payment_method', 50)->nullable()->after('technician_local_payment_amount');
            $table->text('technician_local_payment_notes')->nullable()->after('technician_local_payment_method');
            $table->timestamp('technician_local_payment_received_at')->nullable()->after('technician_local_payment_notes');
            $table->foreignId('technician_local_payment_user_id')
                ->nullable()
                ->after('technician_local_payment_received_at')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['technician_local_payment_user_id']);
            $table->dropColumn([
                'technician_diagnosis',
                'technician_solution',
                'technician_observations',
                'technician_attended_at',
                'technician_local_payment_received',
                'technician_local_payment_amount',
                'technician_local_payment_method',
                'technician_local_payment_notes',
                'technician_local_payment_received_at',
                'technician_local_payment_user_id',
            ]);
        });
    }
};
