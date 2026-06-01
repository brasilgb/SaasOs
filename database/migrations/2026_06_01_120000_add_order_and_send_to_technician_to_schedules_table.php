<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->foreignId('order_id')->nullable()->after('customer_id')->constrained()->nullOnDelete();
            $table->boolean('send_to_technician')->default(false)->after('responsible_technician');
            $table->timestamp('check_in_at')->nullable()->after('send_to_technician');
            $table->decimal('check_in_latitude', 10, 7)->nullable()->after('check_in_at');
            $table->decimal('check_in_longitude', 10, 7)->nullable()->after('check_in_latitude');
            $table->text('check_in_observations')->nullable()->after('check_in_longitude');
            $table->timestamp('check_out_at')->nullable()->after('check_in_observations');
            $table->decimal('check_out_latitude', 10, 7)->nullable()->after('check_out_at');
            $table->decimal('check_out_longitude', 10, 7)->nullable()->after('check_out_latitude');
            $table->text('check_out_observations')->nullable()->after('check_out_longitude');
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('order_id');
            $table->dropColumn([
                'send_to_technician',
                'check_in_at',
                'check_in_latitude',
                'check_in_longitude',
                'check_in_observations',
                'check_out_at',
                'check_out_latitude',
                'check_out_longitude',
                'check_out_observations',
            ]);
        });
    }
};
