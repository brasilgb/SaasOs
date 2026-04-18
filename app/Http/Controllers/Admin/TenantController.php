<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TenantRequest;
use App\Models\Admin\Plan;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class TenantController extends Controller
{
    private function normalizePlanId(mixed $selectedPlan): ?int
    {
        if ($selectedPlan === 'trial' || $selectedPlan === null || $selectedPlan === '') {
            return null;
        }

        return (int) $selectedPlan;
    }

    private function resolveExpirationDate(mixed $selectedPlan): ?Carbon
    {
        if ($selectedPlan === 'trial') {
            return Carbon::now()->addDays(14);
        }

        $planId = $this->normalizePlanId($selectedPlan);
        if (! $planId) {
            return null;
        }

        $plan = Plan::query()->with('periods')->find($planId);
        if (! $plan) {
            return null;
        }

        if ($plan->isTrial()) {
            return Carbon::now()->addDays(14);
        }

        $billingMonths = $plan->billingMonths();
        if ($billingMonths > 0) {
            return Carbon::now()->addMonths($billingMonths);
        }

        return Carbon::now()->addDays(30);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $tenants = Tenant::with('user', 'plan')
            ->paginate(11)
            ->through(function ($tenant) {
                if (! $tenant->expires_at) {
                    $tenant->days_remaining = null;
                    $tenant->status_label = 'Sem vencimento definido';

                    return $tenant;
                }

                $expires = Carbon::parse($tenant->expires_at)->startOfDay();
                $daysRemaining = floor(now()->diffInDays($expires, false));

                if ($daysRemaining > 0) {
                    $status = "{$daysRemaining} dias restantes";
                } elseif ($daysRemaining === 0) {
                    $status = 'Expira hoje';
                } else {
                    $status = 'Expirado há '.abs($daysRemaining).' dias';
                }

                $tenant->days_remaining = $daysRemaining;
                $tenant->status_label = $status;

                return $tenant;
            });

        return Inertia::render('admin/tenants/index', [
            'tenants' => $tenants,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $plans = Plan::get();

        // Mail::to($request->email)->send(new UserRegisteredMail($user));
        return Inertia::render('admin/tenants/create-tenant', ['plans' => $plans]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(TenantRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();

        $selectedPlan = $data['plan_id'] ?? $data['plan'] ?? null;
        $data['plan_id'] = $this->normalizePlanId($selectedPlan);
        $data['expires_at'] = $this->resolveExpirationDate($selectedPlan);

        Tenant::create($data);

        return redirect()->route('admin.tenants.index')->with('success', 'Empresa cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Tenant $tenant)
    {
        $plans = Plan::get();

        return Inertia::render('admin/tenants/edit-tenant', ['tenant' => $tenant, 'plans' => $plans]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tenant $tenant)
    {
        return redirect()->route('admin.tenants.show', ['tenant' => $tenant->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(TenantRequest $request, Tenant $tenant): RedirectResponse
    {
        $data = $request->all();
        $request->validated();

        $selectedPlan = $data['plan_id'] ?? $data['plan'] ?? null;
        $data['plan_id'] = $this->normalizePlanId($selectedPlan);
        $data['expires_at'] = $this->resolveExpirationDate($selectedPlan);

        $tenant->update($data);

        return redirect()->route('admin.tenants.show', ['tenant' => $tenant->id])->with('success', 'Empresa atualizada com sucess!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->route('admin.tenants.index')->with('success', 'Empresa excluída com sucesso!');
    }
}
