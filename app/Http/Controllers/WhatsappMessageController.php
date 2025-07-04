<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\WhatsappMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WhatsappMessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(WhatsappMessage $whatsappmessage)
    {
        if (WhatsappMessage::get()->isEmpty()) {
            WhatsappMessage::create(['id' => '1']);
        }
        $query = WhatsappMessage::orderBy("id", "DESC")->first();
        $whatsappmessage = WhatsappMessage::where("id", $query->id)->first();

        return Inertia::render('whatsapp-message/index', ["whatsappmessage" => $whatsappmessage]);
    }

    public function update(Request $request, WhatsappMessage $whatsappmessage): RedirectResponse
    {
        $data = $request->all();
        $whatsappmessage->update($data);
        return redirect()->route('whatsapp-message.index', ['whatsappmessage' => $whatsappmessage->id])->with('success', 'Mensagens do WhatsApp editadas com sucesso');
    }
}
