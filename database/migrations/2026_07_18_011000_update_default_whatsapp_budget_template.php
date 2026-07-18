<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $generatedBudget = "{{ saudacao }}, {{ cliente }}!\nEquipamento analisado preliminarmente. Segue orçamento inicial para reparo conforme diagnóstico técnico apresentado na OS {{ ordem }}.\nO serviço será executado somente mediante sua aprovação. Valores e prazo podem sofrer alterações caso sejam identificadas necessidades adicionais durante o reparo.\nVocê pode acompanhar pelo link: {{ link_os }}";

        DB::table('whatsapp_messages')
            ->whereNull('generatedbudget')
            ->orWhere('generatedbudget', '')
            ->orWhere('generatedbudget', 'Ola {{ cliente }}, seu orçamento da OS {{ ordem }} esta pronto.')
            ->orWhere('generatedbudget', 'Seu orcamento foi gerado e esta disponivel para aprovacao.')
            ->update(['generatedbudget' => $generatedBudget]);
    }

    public function down(): void
    {
        //
    }
};
