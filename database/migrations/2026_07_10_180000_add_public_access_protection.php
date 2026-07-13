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
        if (! Schema::hasColumn('others', 'public_order_access_key_required')) {
            Schema::table('others', function (Blueprint $table) {
                $table->boolean('public_order_access_key_required')->default(false);
            });
        }

        if (! Schema::hasColumn('orders', 'public_access_key')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->text('public_access_key')->nullable();
            });
        }

        if (! Schema::hasColumn('orders', 'public_access_key_hash')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->string('public_access_key_hash')->nullable();
            });
        }

        DB::table('orders')
            ->select('id')
            ->where(function ($query) {
                $query->whereNull('public_access_key')
                    ->orWhereNull('public_access_key_hash');
            })
            ->orderBy('id')
            ->chunkById(100, function ($orders): void {
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
        $orderColumns = array_values(array_filter(
            ['public_access_key', 'public_access_key_hash'],
            fn (string $column): bool => Schema::hasColumn('orders', $column),
        ));

        if ($orderColumns !== []) {
            Schema::table('orders', function (Blueprint $table) use ($orderColumns) {
                $table->dropColumn($orderColumns);
            });
        }

        if (Schema::hasColumn('others', 'public_order_access_key_required')) {
            Schema::table('others', function (Blueprint $table) {
                $table->dropColumn('public_order_access_key_required');
            });
        }
    }
};
