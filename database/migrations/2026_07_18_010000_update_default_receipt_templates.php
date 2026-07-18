<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $defaults = [
            'receivingequipment' => 'Eu {{ cliente }}, inscrito(a) sob CPF/CNPJ numero {{ cpf_cnpj }}, me responsabilizo por eventuais perdas e/ou danos de arquivos, fotos, agenda, ou quaisquer outros dados armazenados no HD, SSD, cartao de memoria ou memoria interna do meu equipamento, inclusive peliculas ou adesivos, capas e demais acessorios, ficando a Mega System Informatica isenta de qualquer responsabilidade. E obrigatoria a apresentacao desta Ordem de Servico (O.S.) no ato da retirada para que o equipamento seja liberado pela empresa. Caso o aparelho nao seja retirado em ate 90 dias, a contar da presente data, tal fato sera considerado como abandono, estando a empresa apta a descarta-lo. O(A) cliente declara e reconhece que todas as informacoes aqui fornecidas sao verdadeiras e que entendeu e aceitou todos os termos desta Ordem de Servico.',
            'equipmentdelivery' => 'Eu {{ cliente }}, inscrito(a) sob CPF/CNPJ numero {{ cpf_cnpj }}, declaro estar ciente de que, de acordo com o Codigo de Defesa do Consumidor (Lei n. 8.078/90, secao IV, Art. 26), tenho o direito de solicitar a garantia pelo servico executado em 30 (trinta) dias, tratando-se de servicos e de produtos nao duraveis (relacionado a sistema); e em 90 (noventa) dias, tratando-se de fornecimento de servico e de produtos duraveis (relacionado a pecas).',
            'budgetissuance' => 'Equipamento analisado preliminarmente. Segue orcamento inicial para reparo conforme diagnostico tecnico apresentado nesta O.S. O servico sera executado somente mediante aprovacao do cliente. Valores e prazo podem sofrer alteracoes caso sejam identificadas necessidades adicionais durante o reparo.',
        ];

        DB::table('receipts')
            ->whereNull('receivingequipment')
            ->orWhere('receivingequipment', '')
            ->orWhere('receivingequipment', 'Recebemos seu equipamento para avaliacao.')
            ->orWhere('receivingequipment', 'Recebi o equipamento descrito para diagnostico e manutencao.')
            ->update(['receivingequipment' => $defaults['receivingequipment']]);

        DB::table('receipts')
            ->whereNull('equipmentdelivery')
            ->orWhere('equipmentdelivery', '')
            ->orWhere('equipmentdelivery', 'Seu equipamento foi entregue.')
            ->orWhere('equipmentdelivery', 'Entreguei o equipamento em perfeitas condicoes de funcionamento.')
            ->update(['equipmentdelivery' => $defaults['equipmentdelivery']]);

        DB::table('receipts')
            ->whereNull('budgetissuance')
            ->orWhere('budgetissuance', '')
            ->orWhere('budgetissuance', 'Seu orçamento foi emitido.')
            ->orWhere('budgetissuance', 'Orcamento emitido e validado com o cliente.')
            ->update(['budgetissuance' => $defaults['budgetissuance']]);
    }

    public function down(): void
    {
        //
    }
};
