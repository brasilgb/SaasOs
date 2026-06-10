<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        // Campos preservados: o agendamento voltou a armazenar serviço e detalhes próprios.
    }

    public function down(): void
    {
        // No-op para evitar recriação duplicada em bancos onde os campos nunca foram removidos.
    }
};
