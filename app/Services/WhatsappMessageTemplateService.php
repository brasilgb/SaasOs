<?php

namespace App\Services;

use App\Models\App\WhatsappMessage;

class WhatsappMessageTemplateService
{
    public function defaultMessages(): array
    {
        return [
            'generatedbudget' => "{{ saudacao }}, {{ cliente }}!\nEquipamento analisado preliminarmente. Segue orçamento inicial para reparo conforme diagnóstico técnico apresentado na OS {{ ordem }}.\nO serviço será executado somente mediante sua aprovação. Valores e prazo podem sofrer alterações caso sejam identificadas necessidades adicionais durante o reparo.\nVocê pode acompanhar pelo link: {{ link_os }}",
            'servicecompleted' => "{{ saudacao }}, {{ cliente }}!\nSua OS {{ ordem }} foi concluída com sucesso.\nVocê pode acompanhar pelo link: {{ link_os }}\nQualquer dúvida, conte com a gente.",
            'feedback' => "{{ saudacao }}, {{ cliente }}!\nSua OS {{ ordem }} foi finalizada e sua opinião é muito importante para nós.\nAcesse sua área do cliente pelo link {{ link_os }} e deixe uma nota com um comentário rápido sobre sua experiência.\nSeu feedback nos ajuda a melhorar cada atendimento.",
            'defaultmessage' => "{{ saudacao }}, {{ cliente }}!\nAtualização da sua OS {{ ordem }}.\nAcompanhe pelo link: {{ link_os }}\nQualquer dúvida, estamos à disposição.",
            'budgetfollowup' => "{{ saudacao }}, {{ cliente }}!\nSeu orçamento da OS {{ ordem }} segue aguardando retorno há {{ dias_pendentes }} dias.\nVocê pode aprovar ou acompanhar pelo link: {{ link_os }}\nSe precisar de ajuda, estamos à disposição.",
            'pendingpayment' => "{{ saudacao }}, {{ cliente }}!\nA OS {{ ordem }} segue com saldo pendente de {{ saldo }}.\nVocê pode acompanhar pelo link: {{ link_os }}\nSe já realizou o pagamento, desconsidere esta mensagem.",
        ];
    }

    public function current(): WhatsappMessage
    {
        return WhatsappMessage::query()->latest('id')->firstOr(function () {
            return WhatsappMessage::create($this->defaultMessages());
        });
    }

    public function update(WhatsappMessage $whatsappMessage, array $data): WhatsappMessage
    {
        $whatsappMessage->update($data);

        return $whatsappMessage->refresh();
    }
}
