<?php

namespace App\Http\Controllers\App;

use App\Events\WhatsappMessageSettingsUpdated;
use App\Http\Controllers\Controller;
use App\Models\App\WhatsappMessage;
use App\Services\WhatsappMessageTemplateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class WhatsappMessageController extends Controller
{
    public function __construct(
        private readonly WhatsappMessageTemplateService $whatsappMessageTemplateService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(WhatsappMessage $whatsappmessage)
    {
        Gate::authorize('whatsapp-messages.access');

        $whatsappmessage = $this->whatsappMessageTemplateService->current();

        return Inertia::render('app/whatsapp-message/index', ['whatsappmessage' => $whatsappmessage]);
    }

    public function update(Request $request, WhatsappMessage $whatsappmessage): RedirectResponse
    {
        Gate::authorize('whatsapp-messages.access');

        $data = $request->validate([
            'generatedbudget' => 'nullable|string|max:5000',
            'servicecompleted' => 'nullable|string|max:5000',
            'feedback' => 'nullable|string|max:5000',
            'defaultmessage' => 'nullable|string|max:5000',
            'budgetfollowup' => 'nullable|string|max:5000',
            'pendingpayment' => 'nullable|string|max:5000',
        ]);

        $whatsappmessage = $this->whatsappMessageTemplateService->update($whatsappmessage, $data);
        event(new WhatsappMessageSettingsUpdated($whatsappmessage->id, (int) Auth::id(), [
            'updated_fields' => array_keys(array_filter($data, fn ($value) => $value !== null)),
        ]));

        return redirect()->route('app.whatsapp-message.index', ['whatsappmessage' => $whatsappmessage->id])->with('success', 'Mensagens do WhatsApp editadas com sucesso');
    }
}
