<?php

namespace App\Http\Controllers;

use App\Models\TenantFeedback;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TenantFeedbackController extends Controller
{
    public function show(string $token): Response
    {
        $feedback = TenantFeedback::query()
            ->with('tenant:id,name,company,email,whatsapp')
            ->where('feedback_token', $token)
            ->firstOrFail();

        if (! $feedback->feedback_submitted_at && ! $feedback->feedback_opened_at) {
            $feedback->forceFill([
                'feedback_opened_at' => now(),
                'feedback_status' => 'opened',
            ])->save();
        }

        return Inertia::render('site/experience/index', [
            'feedback' => [
                'id' => $feedback->id,
                'feedback_token' => $feedback->feedback_token,
                'feedback_source' => $feedback->feedback_source,
                'feedback_status' => $feedback->feedback_status,
                'feedback_rating' => $feedback->feedback_rating,
                'feedback_comment' => $feedback->feedback_comment,
                'feedback_submitted_at' => $feedback->feedback_submitted_at?->toIso8601String(),
                'feedback_expires_at' => $feedback->feedback_expires_at?->toIso8601String(),
                'testimonial_consent_at' => $feedback->testimonial_consent_at?->toIso8601String(),
                'testimonial_public_name' => $feedback->testimonial_public_name,
                'testimonial_public_role' => $feedback->testimonial_public_role,
                'tenant' => [
                    'name' => $feedback->tenant?->name,
                    'company' => $feedback->tenant?->company,
                ],
            ],
        ]);
    }

    public function submit(Request $request, string $token)
    {
        $feedback = TenantFeedback::query()
            ->where('feedback_token', $token)
            ->firstOrFail();

        if ($feedback->feedback_submitted_at) {
            return back()->with('success', 'Seu feedback já foi registrado anteriormente.');
        }

        if ($feedback->feedback_expires_at && $feedback->feedback_expires_at->isPast()) {
            return back()->withErrors([
                'feedback' => 'Este link de avaliação expirou. Solicite um novo contato da equipe.',
            ]);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'allow_testimonial' => ['nullable', 'boolean'],
            'testimonial_public_name' => ['nullable', 'string', 'max:120'],
            'testimonial_public_role' => ['nullable', 'string', 'max:120'],
        ]);

        $now = now();
        $rating = (int) $validated['rating'];
        $allowTestimonial = $rating >= 4 && (bool) ($validated['allow_testimonial'] ?? false);
        $testimonialName = trim((string) ($validated['testimonial_public_name'] ?? ''));
        $testimonialRole = trim((string) ($validated['testimonial_public_role'] ?? ''));

        $feedback->update([
            'feedback_status' => 'submitted',
            'feedback_rating' => $rating,
            'feedback_comment' => $validated['comment'] ?? null,
            'feedback_opened_at' => $feedback->feedback_opened_at ?? $now,
            'feedback_submitted_at' => $now,
            'feedback_recovery_status' => $rating <= 3 ? 'pending' : null,
            'feedback_recovery_updated_at' => $rating <= 3 ? $now : null,
            'testimonial_consent_at' => $allowTestimonial ? $now : null,
            'testimonial_status' => $allowTestimonial ? 'pending' : null,
            'testimonial_public_name' => $allowTestimonial ? ($testimonialName !== '' ? $testimonialName : ($feedback->tenant?->name ?? null)) : null,
            'testimonial_public_role' => $allowTestimonial ? ($testimonialRole !== '' ? $testimonialRole : null) : null,
            'testimonial_excerpt' => $allowTestimonial ? ($validated['comment'] ?? null) : null,
            'testimonial_published_at' => null,
        ]);

        return back()->with('success', 'Obrigado! Seu feedback foi enviado com sucesso.');
    }
}
