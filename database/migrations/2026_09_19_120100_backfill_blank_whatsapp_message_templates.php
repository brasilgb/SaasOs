<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $budgetFollowUp = "{{ saudacao }}, {{ cliente }}!\nSeu orçamento da OS {{ ordem }} segue aguardando retorno há {{ dias_pendentes }} dias.\nVocê pode aprovar ou acompanhar pelo link: {{ link_os }}\nSe precisar de ajuda, estamos à disposição.";
        $pendingPayment = "{{ saudacao }}, {{ cliente }}!\nA OS {{ ordem }} segue com saldo pendente de {{ saldo }}.\nVocê pode acompanhar pelo link: {{ link_os }}\nSe já realizou o pagamento, desconsidere esta mensagem.";
        $technicianSchedule = "{{ saudacao }}, {{ tecnico }}!\nVisita agendada para {{ data_visita }}.\nServiço: {{ servico }}.\nMateriais: {{ materiais }}.\nCliente: {{ cliente }}.\nEndereço: {{ endereco }}.";

        DB::table('whatsapp_messages')
            ->where(fn ($query) => $query->whereNull('budgetfollowup')->orWhere('budgetfollowup', ''))
            ->update(['budgetfollowup' => $budgetFollowUp]);

        DB::table('whatsapp_messages')
            ->where(fn ($query) => $query->whereNull('pendingpayment')->orWhere('pendingpayment', ''))
            ->update(['pendingpayment' => $pendingPayment]);

        DB::table('whatsapp_messages')
            ->where(fn ($query) => $query->whereNull('technicianschedule')->orWhere('technicianschedule', ''))
            ->update(['technicianschedule' => $technicianSchedule]);
    }

    public function down(): void
    {
        //
    }
};
