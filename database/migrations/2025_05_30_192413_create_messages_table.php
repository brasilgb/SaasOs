<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary()->index();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants');
            $table->bigInteger('sender_id')->nullable()->references('id')->on('users')->onDelete('cascade');
            $table->bigInteger('recipient_id')->nullable()->references('id')->on('users')->onDelete('cascade');
            $table->text('title');
            $table->text('message');
            $table->boolean('status');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
