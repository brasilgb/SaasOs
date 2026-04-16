<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\WhatsappMessage;
use App\Services\OperationalAuditService;
use App\Services\WhatsappMessageTemplateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WhatsappMessageController extends Controller
{
    public function __construct(
        private readonly OperationalAuditService $operationalAuditService,
        private readonly WhatsappMessageTemplateService $whatsappMessageTemplateService,
    ) {}

    private function logOperationalAudit(string $action, WhatsappMessage $whatsappmessage, array $data = []): void
    {
        $this->operationalAuditService->record($action, 'whatsapp_message_settings', $whatsappmessage, Auth::id(), $data);
    }

    private function authorizeWhatsappMessagesAccess(): void
    {
        abort_unless(auth()->user()?->hasPermission('whatsapp_messages'), 403);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(WhatsappMessage $whatsappmessage)
    {
        $this->authorizeWhatsappMessagesAccess();

        $whatsappmessage = $this->whatsappMessageTemplateService->current();

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
            'budgetfollowup' => 'nullable|string|max:5000',
            'pendingpayment' => 'nullable|string|max:5000',
        ]);

        $whatsappmessage = $this->whatsappMessageTemplateService->update($whatsappmessage, $data);
        $this->logOperationalAudit('whatsapp_message_settings_updated', $whatsappmessage, [
            'updated_fields' => array_keys(array_filter($data, fn ($value) => $value !== null)),
        ]);

        return redirect()->route('app.whatsapp-message.index', ['whatsappmessage' => $whatsappmessage->id])->with('success', 'Mensagens do WhatsApp editadas com sucesso');
    }
}
