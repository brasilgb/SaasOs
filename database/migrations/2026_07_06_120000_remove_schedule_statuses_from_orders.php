<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('orders')->where('service_status', 11)->update(['service_status' => 1]);
        DB::table('orders')->where('service_status', 12)->update(['service_status' => 7]);

        DB::table('order_status_history')->where('status', 11)->update([
            'status' => 1,
            'note' => 'Ordem Aberta',
        ]);
        DB::table('order_status_history')->where('status', 12)->update([
            'status' => 7,
            'note' => 'Serviço concluído',
        ]);
    }

    public function down(): void
    {
        // Os status de agendamento não pertencem mais às ordens de serviço.
    }
};
