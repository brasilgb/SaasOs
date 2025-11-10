<?php

namespace App\Http\Controllers\App;

use App\Models\App\Message;
use App\Http\Controllers\Controller;
use App\Http\Requests\MessageRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $sdate = $request->get('dt');

        $query = Message::orderBy('id', 'DESC');
        if ($sdate) {
            $query->whereDate('messages', $sdate);
        }
        if ($search) {
            $query = Message::where(function ($query) use ($search) {
                $query->where('id', 'like', "%$search%")
                ->orWhere('service', 'like', "%$search%");
            })
            ->orWhereHas('user', function ($query) use ($search) {
                $query->where('name', 'like', "%$search%");
            });
        }
        $messages = $query->with('sender')->with('recipient')->paginate(12);

        return Inertia::render('app/messages/index', ['messages' => $messages]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $logged = auth()->user();
        $users = User::where('id', '!=', $logged->id)->get();
        return Inertia::render('app/messages/create-message', ['users' => $users]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MessageRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['message_number'] = Message::exists() ? Message::latest()->first()->message_number + 1 : 1;
        Message::create($data);
        return redirect()->route('app.messages.index')->with('success', 'Agenda cadastrada com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message)
    {
        $users = User::get();
        return Inertia::render('app/messages/edit-message', ['message' => $message, 'users' => $users]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Message $message)
    {
        return redirect()->route('app.messages.show', ['message' => $message->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MessageRequest $request, Message $message): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['message_number'] = Message::exists() ? Message::latest()->first()->message_number + 1 : 1;
        $message->update($data);
        return redirect()->route('app.messages.show', ['message' => $message->id])->with('success', 'Agenda editada com sucesso');
    }

    /**
     * Update the specified resource in storage.
     */
    public function read(MessageRequest $request, Message $message): RedirectResponse
    {
        $data = $request->all();
        $message->update($data);
        return redirect()->route('app.messages.index')->with('success', 'Mensagem marcada como lida');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        $message->delete();
        return redirect()->route('app.messages.index')->with('success', 'Mensagem excluida com sucesso!');
    }
}
