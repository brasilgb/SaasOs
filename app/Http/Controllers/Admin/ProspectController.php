<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlanLead;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProspectController extends Controller
{
    private const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost'];

    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search'));

        $prospects = PlanLead::query()
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', '%'.$search.'%')
                    ->orWhere('email', 'like', '%'.$search.'%')
                    ->orWhere('whatsapp', 'like', '%'.$search.'%');
            }))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/prospects/index', [
            'prospects' => $prospects,
            'statuses' => self::STATUSES,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        PlanLead::query()->create([
            ...$this->validated($request),
            'source' => 'manual',
        ]);

        return back()->with('success', 'Prospect cadastrado com sucesso!');
    }

    public function update(Request $request, PlanLead $prospect): RedirectResponse
    {
        $prospect->update($this->validated($request));

        return back()->with('success', 'Prospect atualizado com sucesso!');
    }

    public function contact(PlanLead $prospect): RedirectResponse
    {
        $prospect->update([
            'status' => $prospect->status === 'new' ? 'contacted' : $prospect->status,
            'last_contact_at' => now(),
        ]);

        return back()->with('success', 'Contato registrado com sucesso!');
    }

    public function destroy(PlanLead $prospect): RedirectResponse
    {
        $prospect->delete();

        return back()->with('success', 'Prospect excluído com sucesso!');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'whatsapp' => ['required', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255'],
            'status' => ['required', Rule::in(self::STATUSES)],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);
    }
}
