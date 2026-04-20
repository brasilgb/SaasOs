<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TenantFeedback;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantFeedbackController extends Controller
{
    private const RECOVERY_STATUSES = [
        'pending',
        'in_progress',
        'resolved',
    ];

    private const TESTIMONIAL_STATUSES = [
        'pending',
        'approved',
        'rejected',
        'published',
    ];

    public function index(Request $request)
    {
        $search = trim((string) $request->string('search')->value());
        $status = trim((string) $request->string('status')->value());
        $recoveryStatus = trim((string) $request->string('recovery_status')->value());
        $source = trim((string) $request->string('source')->value());
        $rating = trim((string) $request->string('rating')->value());
        $testimonialStatus = trim((string) $request->string('testimonial_status')->value());

        $query = TenantFeedback::query()
            ->with(['tenant:id,name,company,email', 'recoveryAssignee:id,name'])
            ->when($search !== '', function ($builder) use ($search) {
                $builder->whereHas('tenant', function ($tenantQuery) use ($search) {
                    $tenantQuery->where(function ($subQuery) use ($search) {
                        $subQuery
                            ->where('company', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                });
            })
            ->when($status !== '', fn ($builder) => $builder->where('feedback_status', $status))
            ->when($source !== '', fn ($builder) => $builder->where('feedback_source', $source))
            ->when($recoveryStatus !== '', function ($builder) use ($recoveryStatus) {
                if ($recoveryStatus === 'without_recovery') {
                    $builder->whereNull('feedback_recovery_status');

                    return;
                }

                $builder->where('feedback_recovery_status', $recoveryStatus);
            })
            ->when($rating !== '', function ($builder) use ($rating) {
                if ($rating === 'low') {
                    $builder->whereNotNull('feedback_rating')->where('feedback_rating', '<=', 3);

                    return;
                }

                $builder->where('feedback_rating', (int) $rating);
            })
            ->when($testimonialStatus !== '', function ($builder) use ($testimonialStatus) {
                if ($testimonialStatus === 'without_testimonial') {
                    $builder->whereNull('testimonial_status');

                    return;
                }

                $builder->where('testimonial_status', $testimonialStatus);
            })
            ->latest('id');

        $feedbacks = $query->paginate(15)->withQueryString();

        $summaryQuery = TenantFeedback::query();

        return Inertia::render('admin/tenant-feedbacks/index', [
            'feedbacks' => $feedbacks,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'recovery_status' => $recoveryStatus,
                'source' => $source,
                'rating' => $rating,
                'testimonial_status' => $testimonialStatus,
            ],
            'summary' => [
                'total' => (clone $summaryQuery)->count(),
                'pending' => (clone $summaryQuery)->whereIn('feedback_status', ['pending', 'opened'])->count(),
                'submitted' => (clone $summaryQuery)->where('feedback_status', 'submitted')->count(),
                'low_rating' => (clone $summaryQuery)->whereNotNull('feedback_rating')->where('feedback_rating', '<=', 3)->count(),
                'testimonial_pending' => (clone $summaryQuery)->where('testimonial_status', 'pending')->count(),
                'testimonial_published' => (clone $summaryQuery)->where('testimonial_status', 'published')->count(),
            ],
            'users' => User::query()
                ->whereIn('roles', [User::ROLE_ROOT_SYSTEM, User::ROLE_ROOT_APP, User::ROLE_ADMIN, User::ROLE_OPERATOR])
                ->orderBy('name')
                ->get(['id', 'name']),
            'recoveryStatuses' => self::RECOVERY_STATUSES,
            'testimonialStatuses' => self::TESTIMONIAL_STATUSES,
        ]);
    }

    public function update(Request $request, TenantFeedback $tenantFeedback): RedirectResponse
    {
        $validated = $request->validate([
            'feedback_recovery_assigned_to' => ['nullable', 'exists:users,id'],
            'feedback_recovery_status' => ['nullable', 'in:'.implode(',', self::RECOVERY_STATUSES)],
            'feedback_recovery_notes' => ['nullable', 'string', 'max:2000'],
            'testimonial_status' => ['nullable', 'in:'.implode(',', self::TESTIMONIAL_STATUSES)],
            'testimonial_public_name' => ['nullable', 'string', 'max:120'],
            'testimonial_public_role' => ['nullable', 'string', 'max:120'],
            'testimonial_excerpt' => ['nullable', 'string', 'max:2000'],
        ]);

        $testimonialStatus = $validated['testimonial_status'] ?? null;

        $tenantFeedback->update([
            'feedback_recovery_assigned_to' => $validated['feedback_recovery_assigned_to'] ?? null,
            'feedback_recovery_status' => $validated['feedback_recovery_status'] ?? null,
            'feedback_recovery_notes' => $validated['feedback_recovery_notes'] ?? null,
            'feedback_recovery_updated_at' => now(),
            'testimonial_status' => $testimonialStatus,
            'testimonial_public_name' => $validated['testimonial_public_name'] ?? null,
            'testimonial_public_role' => $validated['testimonial_public_role'] ?? null,
            'testimonial_excerpt' => $validated['testimonial_excerpt'] ?? null,
            'testimonial_published_at' => $testimonialStatus === 'published' ? now() : null,
        ]);

        return back()->with('success', 'Tratativa do feedback atualizada com sucesso.');
    }
}
