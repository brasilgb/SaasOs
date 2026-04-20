<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\TenantImprovementRequestCreatedMail;
use App\Mail\TenantImprovementRequestUpdatedMail;
use App\Models\TenantImprovementRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class TenantImprovementRequestController extends Controller
{
    private const STATUSES = [
        'new',
        'reviewing',
        'adjusting',
        'done',
    ];

    public function previewAdminEmail(TenantImprovementRequest $tenantImprovementRequest)
    {
        $tenantImprovementRequest->loadMissing(['tenant:id,name,company,email', 'user:id,name,email']);

        return new TenantImprovementRequestCreatedMail($tenantImprovementRequest);
    }

    public function previewCustomerEmail(TenantImprovementRequest $tenantImprovementRequest)
    {
        $tenantImprovementRequest->loadMissing(['tenant:id,name,company,email', 'user:id,name,email']);

        return new TenantImprovementRequestUpdatedMail($tenantImprovementRequest);
    }

    public function index(Request $request)
    {
        $search = trim((string) $request->string('search')->value());
        $status = trim((string) $request->string('status')->value());
        $type = trim((string) $request->string('type')->value());

        $query = TenantImprovementRequest::query()
            ->with(['tenant:id,name,company,email', 'user:id,name'])
            ->when($search !== '', function ($builder) use ($search) {
                $builder->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('tenant', function ($tenantQuery) use ($search) {
                            $tenantQuery->where('company', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            })
            ->when($status !== '', fn ($builder) => $builder->where('status', $status))
            ->when($type !== '', fn ($builder) => $builder->where('request_type', $type))
            ->latest('id');

        return Inertia::render('admin/tenant-improvement-requests/index', [
            'requests' => $query->paginate(15)->withQueryString(),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'type' => $type,
            ],
            'summary' => [
                'total' => TenantImprovementRequest::count(),
                'new' => TenantImprovementRequest::where('status', 'new')->count(),
                'reviewing' => TenantImprovementRequest::where('status', 'reviewing')->count(),
                'adjusting' => TenantImprovementRequest::where('status', 'adjusting')->count(),
                'done' => TenantImprovementRequest::where('status', 'done')->count(),
            ],
            'statuses' => self::STATUSES,
        ]);
    }

    public function update(Request $request, TenantImprovementRequest $tenantImprovementRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:'.implode(',', self::STATUSES)],
            'admin_notes' => ['nullable', 'string', 'max:4000'],
        ]);

        $tenantImprovementRequest->loadMissing(['tenant:id,name,company,email', 'user:id,name,email']);

        $originalStatus = $tenantImprovementRequest->status;
        $originalNotes = (string) ($tenantImprovementRequest->admin_notes ?? '');

        $tenantImprovementRequest->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
            'reviewed_at' => now(),
        ]);

        $updatedNotes = (string) ($tenantImprovementRequest->admin_notes ?? '');
        $statusChanged = $originalStatus !== $tenantImprovementRequest->status;
        $notesChanged = $originalNotes !== $updatedNotes;

        $customerRecipients = collect([
            $tenantImprovementRequest->tenant?->email,
            $tenantImprovementRequest->user?->email,
        ])
            ->filter(fn ($email) => filter_var($email, FILTER_VALIDATE_EMAIL))
            ->unique()
            ->values()
            ->all();

        if (($statusChanged || $notesChanged) && ! empty($customerRecipients)) {
            Mail::to($customerRecipients)->send(new TenantImprovementRequestUpdatedMail($tenantImprovementRequest));
        }

        return back()->with('success', 'Solicitação atualizada com sucesso.');
    }
}
