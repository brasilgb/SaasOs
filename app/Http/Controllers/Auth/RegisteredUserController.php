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
use Illuminate\Support\Facades\Mail;
use App\Mail\UserRegisteredMail;

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

            $user = new User([
                'name' => $request->name,
                'user_number' => User::where('tenant_id', null)->exists() ? User::latest()->first()->user_number + 1 : 1,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'status' => 1,
                'roles' => 99, // ROOT
            ]);
            $user->tenant_id = null;
            User::withoutEvents(function () use ($user) {
                $user->save();
            });

            event(new Registered($user));
            Auth::login($user);

            return redirect()->route('admin.dashboard');
        } else {

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
                    'expires_at' => Carbon::now()->addDays(7),
                ]);

                Company::create([
                    'tenant_id' => $tenant->id,
                    'companyname' => $request->company,
                    'cnpj' => $request->cnpj,
                    'telephone' => $request->phone,
                    'whatsapp' => $request->whatsapp,
                    'email' => $request->email,
                ]);

                $user = new User([
                    'name' => $request->name,
                    'user_number' => User::where('tenant_id', $tenant->id)->exists() ? User::latest()->first()->user_number + 1 : 1,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'telephone' => $request->phone,
                    'whatsapp' => $request->whatsapp,
                    'status' => 1,
                    'roles' => 9,
                ]);
                $user->tenant_id = $tenant->id;
                $user->save();
                Mail::to($user->email)->send(new UserRegisteredMail($user));
            });

            event(new Registered($user));
            Auth::login($user);

            return redirect()->route('app.dashboard')->with('success', 'Seja bem-vindo! Sua conta foi criada com sucesso com 7 dias de acesso cortesia!');
        }
    }
}
