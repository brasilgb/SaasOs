<?php

use Illuminate\Database\Eloquent\Relations\HasMany;
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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants');
            $table->string('name');
            $table->string('email')->unique();
            $table->string('telephone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('password');
            $table->tinyInteger('roles')->default(1); // 1-Administrador, 2-Usuário, 3-Técnico
            $table->boolean('is_root')->default(0);
            $table->boolean('is_active')->default(1);
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }

    
    // public function schedules(): HasMany
    // {
    //     return $this->hasMany(Schedule::class);
    // }
    
    // public function senders(): HasMany
    // {
    //     return $this->hasMany(Message::class);
    // }

    // public function recipients(): HasMany
    // {
    //     return $this->hasMany(Message::class);
    // }
    
};
