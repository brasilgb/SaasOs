<?php

namespace App\Services;

use App\Models\App\WhatsappMessage;

class WhatsappMessageTemplateService
{
    public function defaultMessages(): array
    {
        return [
            'generatedbudget' => "{{ saudacao }}, {{ cliente }}!\n\nSeu orçamento da OS {{ ordem }} já está disponível.\n\nVocê pode acompanhar pelo link: {{ link_os }}\n\nSe tiver dúvidas, estamos à disposição.",
            'servicecompleted' => "{{ saudacao }}, {{ cliente }}!\n\nSua OS {{ ordem }} foi concluída com sucesso.\n\nVocê pode acompanhar pelo link: {{ link_os }}\n\nQualquer dúvida, conte com a gente.",
            'feedback' => "{{ saudacao }}, {{ cliente }}!\n\nSua OS {{ ordem }} foi finalizada e sua opinião é muito importante para nós.\n\nAcesse sua área do cliente pelo link {{ link_os }} e deixe uma nota com um comentário rápido sobre sua experiência.\n\nSeu feedback nos ajuda a melhorar cada atendimento.",
            'defaultmessage' => "{{ saudacao }}, {{ cliente }}!\n\nAtualização da sua OS {{ ordem }}.\n\nAcompanhe pelo link: {{ link_os }}\n\nQualquer dúvida, estamos à disposição.",
            'budgetfollowup' => "{{ saudacao }}, {{ cliente }}!\n\nSeu orçamento da OS {{ ordem }} segue aguardando retorno há {{ dias_pendentes }} dias.\n\nVocê pode aprovar ou acompanhar pelo link: {{ link_os }}\n\nSe precisar de ajuda, estamos à disposição.",
            'pendingpayment' => "{{ saudacao }}, {{ cliente }}!\n\nA OS {{ ordem }} segue com saldo pendente de {{ saldo }}.\n\nVocê pode acompanhar pelo link: {{ link_os }}\n\nSe já realizou o pagamento, desconsidere esta mensagem.",
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
