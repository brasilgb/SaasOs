<?php

namespace App\Http\Controllers\Site;

use App\Http\Controllers\Controller;
use App\Models\PlanLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('site/plans/index', [
            'showPlans' => (bool) $request->session()->get('plans_unlocked', false),
            'lead' => $request->session()->get('plan_lead'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'whatsapp' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
        ]);

        PlanLead::query()->create($validated);

        $request->session()->put('plans_unlocked', true);
        $request->session()->put('plan_lead', $validated);

        return redirect()->route('plans.index');
    }
}
