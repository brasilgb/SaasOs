<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\WhatsappMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsappMessageController extends Controller
{
    private function authorizeWhatsappMessagesAccess(): void
    {
        abort_unless(auth()->user()?->hasPermission('whatsapp_messages'), 403);
    }

    private function defaultMessages(): array
    {
        return [
            'generatedbudget' => "{{ saudacao }}, {{ cliente }}!\n\nSeu orçamento da OS {{ ordem }} já está disponível.\n\nVocê pode acompanhar pelo link: {{ link_os }}\n\nSe tiver dúvidas, estamos à disposição.",
            'servicecompleted' => "{{ saudacao }}, {{ cliente }}!\n\nSua OS {{ ordem }} foi concluída com sucesso.\n\nVocê pode acompanhar pelo link: {{ link_os }}\n\nQualquer dúvida, conte com a gente.",
            'feedback' => "{{ saudacao }}, {{ cliente }}!\n\nEsperamos que tenha gostado do atendimento da OS {{ ordem }}.\n\nSeu feedback é muito importante para continuarmos melhorando.",
            'defaultmessage' => "{{ saudacao }}, {{ cliente }}!\n\nAtualização da sua OS {{ ordem }}.\n\nAcompanhe pelo link: {{ link_os }}\n\nQualquer dúvida, estamos à disposição.",
        ];
    }

    /**
     * Display a listing of the resource.
     */
    public function index(WhatsappMessage $whatsappmessage)
    {
        $this->authorizeWhatsappMessagesAccess();

        if (WhatsappMessage::get()->isEmpty()) {
            WhatsappMessage::create($this->defaultMessages());
        }
        $query = WhatsappMessage::orderBy('id', 'DESC')->first();
        $whatsappmessage = WhatsappMessage::where('id', $query->id)->first();

        return Inertia::render('app/whatsapp-message/index', ['whatsappmessage' => $whatsappmessage]);
    }

    public function update(Request $request, WhatsappMessage $whatsappmessage): RedirectResponse
    {
        $this->authorizeWhatsappMessagesAccess();

        $data = $request->validate([
            'generatedbudget' => 'nullable|string|max:5000',
            'servicecompleted' => 'nullable|string|max:5000',
            'feedback' => 'nullable|string|max:5000',
            'defaultmessage' => 'nullable|string|max:5000',
        ]);

        $whatsappmessage->update($data);

        return redirect()->route('app.whatsapp-message.index', ['whatsappmessage' => $whatsappmessage->id])->with('success', 'Mensagens do WhatsApp editadas com sucesso');
    }
}
