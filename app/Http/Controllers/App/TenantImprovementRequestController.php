<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Mail\TenantImprovementRequestCreatedMail;
use App\Models\TenantFeedback;
use App\Models\TenantImprovementRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
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

        $feedbacks = TenantFeedback::query()
            ->where('tenant_id', $user?->tenant_id)
            ->where('feedback_status', 'submitted')
            ->latest('id')
            ->limit(6)
            ->get([
                'id',
                'feedback_rating',
                'feedback_comment',
                'feedback_submitted_at',
                'testimonial_consent_at',
                'testimonial_status',
                'testimonial_public_name',
                'testimonial_public_role',
            ]);

        return Inertia::render('app/tenant-improvement-requests/index', [
            'requests' => $requests,
            'feedbacks' => $feedbacks,
            'requestTypes' => self::REQUEST_TYPES,
        ]);
    }

    public function store(): RedirectResponse
    {
        $user = auth()->user();

        $validated = request()->validate([
            'request_type' => ['required', 'in:'.implode(',', self::REQUEST_TYPES)],
            'title' => ['required', 'string', 'max:160'],
            'description' => ['required', 'string', 'max:500'],
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

    public function storeFeedback(): RedirectResponse
    {
        $user = auth()->user();

        $validated = request()->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:500'],
            'allow_testimonial' => ['nullable', 'boolean'],
            'testimonial_public_name' => ['nullable', 'string', 'max:120'],
            'testimonial_public_role' => ['nullable', 'string', 'max:120'],
        ]);

        $now = now();
        $rating = (int) $validated['rating'];
        $comment = trim((string) ($validated['comment'] ?? ''));
        $allowTestimonial = $rating >= 4 && (bool) ($validated['allow_testimonial'] ?? false);
        $testimonialName = trim((string) ($validated['testimonial_public_name'] ?? ''));
        $testimonialRole = trim((string) ($validated['testimonial_public_role'] ?? ''));

        TenantFeedback::query()->create([
            'tenant_id' => $user->tenant_id,
            'feedback_token' => (string) Str::uuid(),
            'feedback_source' => 'app_manual',
            'feedback_status' => 'submitted',
            'feedback_rating' => $rating,
            'feedback_comment' => $comment !== '' ? $comment : null,
            'feedback_opened_at' => $now,
            'feedback_submitted_at' => $now,
            'feedback_recovery_status' => $rating <= 3 ? 'pending' : null,
            'feedback_recovery_updated_at' => $rating <= 3 ? $now : null,
            'testimonial_consent_at' => $allowTestimonial ? $now : null,
            'testimonial_status' => $allowTestimonial ? 'pending' : null,
            'testimonial_public_name' => $allowTestimonial ? ($testimonialName !== '' ? $testimonialName : ($user->tenant?->name ?? null)) : null,
            'testimonial_public_role' => $allowTestimonial ? ($testimonialRole !== '' ? $testimonialRole : null) : null,
            'testimonial_excerpt' => $allowTestimonial && $comment !== '' ? $comment : null,
            'testimonial_published_at' => null,
        ]);

        return back()->with('message', 'Avaliação registrada com sucesso.');
    }
}
