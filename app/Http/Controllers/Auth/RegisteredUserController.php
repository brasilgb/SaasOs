<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\App\Company;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class RegisteredUserController extends Controller
{
    // Códigos secretos
    protected const SUPERUSER_COMPANY_CODE = 'super-company-megb-admin';
    protected const SUPERUSER_CNPJ_CODE = '0D82457BF990DE04D1F8F98AC7BFE7DC';

    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $isSuperUserRegistration =
            $request->company === self::SUPERUSER_COMPANY_CODE &&
            $request->cnpj === self::SUPERUSER_CNPJ_CODE;

        $superuserExists = User::whereNull('tenant_id')->exists();

        // 🔐 Regras base
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ];

        // 🔐 Regras extras apenas para usuários normais
        if (!$isSuperUserRegistration) {
            $rules['company'] = 'required|string|max:255|unique:tenants,company';
            $rules['cnpj'] = 'required|string|cnpj|unique:tenants,cnpj';
            $rules['phone'] = 'required|string|max:255';
            $rules['whatsapp'] = 'required|string|max:255';
        }

        $request->validate($rules);

        /**
         * ======================================================
         * 👑 REGISTRO ROOT (SEM TENANT)
         * ======================================================
         */
        if ($isSuperUserRegistration) {

            if ($superuserExists) {
                return back()->withErrors([
                    'company' => 'Já existe um usuário root no sistema.'
                ]);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tenant_id' => null,
                'status' => 1,
                'roles' => 99, // ROOT
            ]);

            event(new Registered($user));
            Auth::login($user);

            return redirect()->route('admin.dashboard');
        }

        /**
         * ======================================================
         * 🏢 REGISTRO NORMAL (COM TENANT)
         * ======================================================
         */
        DB::transaction(function () use ($request, &$user) {

            $tenant = Tenant::create([
                'name' => $request->name,
                'company' => $request->company,
                'cnpj' => $request->cnpj,
                'email' => $request->email,
                'phone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'status' => 1,
                'plan' => 1,
                'expiration_date' => Carbon::now()->addDays(30),
            ]);

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tenant_id' => $tenant->id,
                'telephone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'status' => 1,
                'roles' => 9,
            ]);

            Company::create([
                'tenant_id' => $tenant->id,
                'companyname' => $request->company,
                'cnpj' => $request->cnpj,
                'telephone' => $request->phone,
                'whatsapp' => $request->whatsapp,
                'email' => $request->email,
            ]);
        });

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('app.dashboard');
    }
}
