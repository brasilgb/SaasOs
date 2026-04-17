<?php

namespace App\Http\Controllers\App;

use App\Events\MessageCreated;
use App\Events\MessageDeleted;
use App\Events\MessageReadStatusUpdated;
use App\Events\MessageUpdated;
use App\Http\Controllers\Controller;
use App\Http\Requests\MessageRequest;
use App\Models\App\Message;
use App\Services\MessageService;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function __construct(
        private readonly MessageService $messageService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Message::class);

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
        $this->authorize('create', Message::class);

        $logged = Auth::user();
        $users = User::where('id', '!=', $logged->id)->get();

        return Inertia::render('app/messages/create-message', ['users' => $users]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MessageRequest $request): RedirectResponse
    {
        $this->authorize('create', Message::class);

        $data = $request->validated();
        $message = $this->messageService->create($data, (int) Auth::id());
        event(new MessageCreated($message->id, (int) Auth::id(), [
            'recipient_id' => $message->recipient_id,
            'title' => $message->title,
            'status' => (bool) $message->status,
        ]));

        return redirect()->route('app.messages.index')->with('success', 'Mensagem cadastrada com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message, Request $request)
    {
        $this->authorize('view', $message);

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
        $this->authorize('update', $message);

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
        $this->authorize('update', $message);

        $message = $this->messageService->update($message, $request->validated());
        event(new MessageUpdated($message->id, (int) Auth::id(), [
            'recipient_id' => $message->recipient_id,
            'title' => $message->title,
            'status' => (bool) $message->status,
        ]));

        return redirect()->route('app.messages.show', ['message' => $message->id])->with('success', 'Mensagem editada com sucesso');
    }

    /**
     * Update the specified resource in storage.
     */
    public function read(Request $request, Message $message): RedirectResponse
    {
        $this->authorize('markRead', $message);

        $message = $this->messageService->updateReadStatus($message, (bool) $request->get('status'));
        event(new MessageReadStatusUpdated($message->id, (int) Auth::id(), [
            'status' => (bool) $message->status,
        ]));

        return redirect()->route('app.messages.index')->with('success', 'Mensagem marcada como lida');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        $this->authorize('delete', $message);

        event(new MessageDeleted($message->id, (int) Auth::id(), [
            'recipient_id' => $message->recipient_id,
            'title' => $message->title,
            'status' => (bool) $message->status,
        ]));
        $this->messageService->delete($message);

        return redirect()->route('app.messages.index')->with('success', 'Mensagem excluída com sucesso!');
    }
}
