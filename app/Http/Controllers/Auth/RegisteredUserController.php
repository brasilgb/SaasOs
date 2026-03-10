<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\UserRegisteredMail;
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
    protected const SUPERUSER_COMPANY_CODE = 'super-company-megb-admin';
    protected const SUPERUSER_CNPJ_CODE = '0D82457BF990DE04D1F8F98AC7BFE7DC';

    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    public function store(Request $request): RedirectResponse
    {

        $isSuperUserRegistration =
            $request->company === self::SUPERUSER_COMPANY_CODE &&
            $request->cnpj === self::SUPERUSER_CNPJ_CODE;

        $superuserExists = User::whereNull('tenant_id')->exists();

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];

        if (!$isSuperUserRegistration) {
            $rules += [
                'company' => 'required|string|max:255|unique:tenants,company',
                'cnpj' => 'required|string|max:20|unique:tenants,cnpj',
                'phone' => 'required|string|max:20',
                'whatsapp' => 'required|string|max:20',
            ];
        }

        $request->validate($rules);

        /**
         * ======================================================
         * ROOT USER
         * ======================================================
         */

        if ($isSuperUserRegistration) {

            if ($superuserExists) {
                return back()->withErrors([
                    'company' => 'Já existe um usuário root no sistema.'
                ]);
            }

            $userNumber = (User::whereNull('tenant_id')->max('user_number') ?? 0) + 1;

            $user = User::create([
                'name' => $request->name,
                'user_number' => $userNumber,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'status' => 1,
                'roles' => 99,
                'tenant_id' => null,
            ]);

            event(new Registered($user));

            Auth::login($user);

            return redirect()->route('admin.dashboard');
        }

        /**
         * ======================================================
         * TENANT REGISTRATION (TRIAL)
         * ======================================================
         */

        $user = DB::transaction(function () use ($request) {

            $tenant = Tenant::create([
                'name' => $request->name,
                'company' => $request->company,
                'cnpj' => $request->cnpj,
                'email' => $request->email,
                'phone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'status' => 1,
                'plan_id' => 1,
                'subscription_status' => 'active',
                'expires_at' => now()->addDays(30),
            ]);

            Company::create([
                'tenant_id' => $tenant->id,
                'companyname' => $request->company,
                'cnpj' => $request->cnpj,
                'telephone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'email' => $request->email,
            ]);

            $userNumber = (User::where('tenant_id', $tenant->id)->max('user_number') ?? 0) + 1;

            return User::create([
                'name' => $request->name,
                'user_number' => $userNumber,
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

        /*
        Enviar email (recomendado usar queue)
        */

        Mail::to($user->email)->queue(new UserRegisteredMail($user));

        return redirect()
            ->route('app.dashboard')
            ->with(
                'message',
                'Conta criada com sucesso! Você possui 30 dias de acesso para testes.'
            );
    }
}