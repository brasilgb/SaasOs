<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('others', function (Blueprint $table) {
            $table->boolean('public_order_access_key_required')->default(false);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->text('public_access_key')->nullable();
            $table->string('public_access_key_hash')->nullable();
        });

        DB::table('orders')->select('id')->orderBy('id')->chunkById(100, function ($orders): void {
            foreach ($orders as $order) {
                $key = Str::upper(Str::random(8));
                DB::table('orders')->where('id', $order->id)->update([
                    'public_access_key' => Crypt::encryptString($key),
                    'public_access_key_hash' => Hash::make($key),
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['public_access_key', 'public_access_key_hash']);
        });

        Schema::table('others', function (Blueprint $table) {
            $table->dropColumn('public_order_access_key_required');
        });
    }
};
