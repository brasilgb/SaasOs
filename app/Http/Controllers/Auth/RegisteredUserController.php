<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\UserRegisteredMail;
use App\Models\Admin\Plan;
use App\Models\App\Company;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request): RedirectResponse
    {

        $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'required|string|max:255|unique:tenants,company',
            'cnpj' => 'required|string|max:20|unique:tenants,cnpj',
            'phone' => 'required|string|max:20',
            'whatsapp' => 'required|string|max:20',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = DB::transaction(function () use ($request) {

            $tenant = Tenant::create([
                'name' => $request->name,
                'company' => $request->company,
                'cnpj' => $request->cnpj,
                'email' => $request->email,
                'phone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'status' => 1,
                'plan_id' => Plan::query()->value('id'),
                'subscription_status' => 'active',
                'expires_at' => now()->addDays(14),
            ]);

            Company::create([
                'tenant_id' => $tenant->id,
                'companyname' => $request->company,
                'cnpj' => $request->cnpj,
                'telephone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'email' => $request->email,
            ]);

            return User::create([
                'name' => $request->name,
                'user_number' => 1,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'telephone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'status' => 1,
                'roles' => 9,
                'tenant_id' => $tenant->id,
            ]);
        });

        event(new Registered($user));

        Auth::login($user);

        Mail::to($user->email)->send(new UserRegisteredMail($user));

        return redirect()
            ->route('app.dashboard')
            ->with(
                'message',
                'Conta criada com sucesso! Você possui 14 dias de acesso grátis para testes.'
            );
    }
}
