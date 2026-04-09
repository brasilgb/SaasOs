<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\MessageRequest;
use App\Models\App\Message;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    private function canAccessMessage(Message $message): bool
    {
        $userId = Auth::id();

        return $message->sender_id === $userId || $message->recipient_id === $userId;
    }

    private function canManageMessage(Message $message): bool
    {
        return $message->sender_id === Auth::id();
    }

    private function canReadMessage(Message $message): bool
    {
        return $message->recipient_id === Auth::id();
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->search;
        $sdate = $request->get('dt');
        $status = $request->get('status');
        $filter = $request->get('filter');

        $logged = Auth::user();
        $query = Message::where(function ($q) use ($logged) {
            $q->where('recipient_id', $logged->id)
                ->orWhere('sender_id', $logged->id);
        })->orderBy('id', 'DESC');

        if ($sdate) {
            $query->whereDate('created_at', $sdate);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('message_number', 'like', '%'.$search.'%')
                    ->orWhere('title', 'like', '%'.$search.'%')
                    ->orWhereHas('sender', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%$search%");
                    })
                    ->orWhereHas('recipient', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%$search%");
                    });
            });
        }

        if ($filter === 'received') {
            $query->where('recipient_id', $logged->id);
        } elseif ($filter === 'sent') {
            $query->where('sender_id', $logged->id);
        }

        if ($status !== null && in_array((string) $status, ['0', '1'], true)) {
            $query->where('status', (int) $status);
        }

        $messages = $query->with('sender')->with('recipient')->paginate(11)->withQueryString();

        return Inertia::render('app/messages/index', ['messages' => $messages, 'search' => $search, 'status' => $status, 'filter' => $filter]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $logged = Auth::user();
        $users = User::where('id', '!=', $logged->id)->get();

        return Inertia::render('app/messages/create-message', ['users' => $users]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MessageRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $data['sender_id'] = Auth::id();
        $data['message_number'] = Message::exists() ? Message::latest()->first()->message_number + 1 : 1;
        Message::create($data);

        return redirect()->route('app.messages.index')->with('success', 'Agenda cadastrada com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message, Request $request)
    {
        abort_unless($this->canAccessMessage($message), 403);

        $logged = Auth::user();
        $users = User::where('id', '!=', $logged->id)->get();

        return Inertia::render('app/messages/edit-message', [
            'message' => $message,
            'users' => $users,
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Message $message, Request $request)
    {
        abort_unless($this->canManageMessage($message), 403);

        return redirect()->route('app.messages.show', [
            'message' => $message->id,
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MessageRequest $request, Message $message): RedirectResponse
    {
        abort_unless($this->canManageMessage($message), 403);

        $data = $request->validated();
        $data['sender_id'] = $message->sender_id;
        $message->update($data);

        return redirect()->route('app.messages.show', ['message' => $message->id])->with('success', 'Agenda editada com sucesso');
    }

    /**
     * Update the specified resource in storage.
     */
    public function read(Request $request, Message $message): RedirectResponse
    {
        abort_unless($this->canReadMessage($message), 403);

        $message->update(['status' => (bool) $request->get('status')]);

        return redirect()->route('app.messages.index')->with('success', 'Mensagem marcada como lida');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        abort_unless($this->canManageMessage($message), 403);

        $message->delete();

        return redirect()->route('app.messages.index')->with('success', 'Mensagem excluida com sucesso!');
    }
}
