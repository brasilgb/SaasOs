<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Mail\TenantImprovementRequestCreatedMail;
use App\Models\TenantImprovementRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class TenantImprovementRequestController extends Controller
{
    private const REQUEST_TYPES = [
        'improvement',
        'adjustment',
    ];

    public function index(): Response
    {
        $user = auth()->user();

        $requests = TenantImprovementRequest::query()
            ->where('tenant_id', $user?->tenant_id)
            ->with('user:id,name')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('app/tenant-improvement-requests/index', [
            'requests' => $requests,
            'requestTypes' => self::REQUEST_TYPES,
        ]);
    }

    public function store(): RedirectResponse
    {
        $user = auth()->user();

        $validated = request()->validate([
            'request_type' => ['required', 'in:'.implode(',', self::REQUEST_TYPES)],
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:4000'],
        ]);

        $requestItem = TenantImprovementRequest::query()->create([
            'tenant_id' => $user->tenant_id,
            'user_id' => $user->id,
            'request_type' => $validated['request_type'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => 'new',
        ]);

        $adminRecipients = User::query()
            ->whereIn('roles', [User::ROLE_ROOT_SYSTEM, User::ROLE_ROOT_APP])
            ->pluck('email')
            ->filter(fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->values()
            ->all();

        if (! empty($adminRecipients)) {
            $requestItem->load(['tenant:id,name,company,email', 'user:id,name,email']);

            Mail::to($adminRecipients)->send(new TenantImprovementRequestCreatedMail($requestItem));
        }

        return back()->with('message', 'Solicitação registrada com sucesso.');
    }
}
