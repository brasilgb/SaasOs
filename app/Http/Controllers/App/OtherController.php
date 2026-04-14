<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Company;
use App\Models\App\Other;
use App\Support\TenantMailConfig;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class OtherController extends Controller
{
    private function authorizeOtherSettingsAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('other_settings'), 403);
    }

    public function index()
    {
        $this->authorizeOtherSettingsAccess();

        if (Other::get()->isEmpty()) {
            Other::create();
        }
        $query = Other::orderBy('id', 'DESC')->first();
        $othersettings = Other::where('id', $query->id)->first();
        $company = Company::first();
        $expiresAt = Carbon::parse(Tenant::first()->expires_at);
        $diff = Carbon::now()->diff($expiresAt);
        $time_remaining = ',  '.$diff->days.' dias restantes';
        $mailSettings = [
            'mail_mailer' => $othersettings->mail_mailer ?? 'smtp',
            'mail_host' => $othersettings->mail_host ?? '',
            'mail_port' => $othersettings->mail_port ?? 587,
            'mail_username' => $othersettings->mail_username ?? '',
            'mail_password' => '',
            'mail_encryption' => $othersettings->mail_encryption ?? 'tls',
            'mail_from_address' => $othersettings->mail_from_address ?? '',
            'mail_from_name' => $othersettings->mail_from_name ?? config('app.name'),
            'mail_password_set' => ! empty($othersettings->mail_password),
        ];
        $businessMetrics = [
            'warranty_return_alert_threshold' => $othersettings->warranty_return_alert_threshold
                ?? config('business-metrics.warranty_return_alert_threshold', 10),
        ];

        return Inertia::render('app/others/index', [
            'othersettings' => $othersettings,
            'company' => $company,
            'time_remaining' => $time_remaining,
            'mailSettings' => $mailSettings,
            'businessMetrics' => $businessMetrics,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Other $other): RedirectResponse
    {
        $this->authorizeOtherSettingsAccess();

        $data = $request->validate([
            'navigation' => 'sometimes|boolean',
            'budget' => 'sometimes|boolean',
            'enableparts' => 'sometimes|boolean',
            'enablesales' => 'sometimes|boolean',
            'mail_mailer' => 'nullable|string|max:30',
            'mail_host' => 'nullable|string|max:255',
            'mail_port' => 'nullable|integer|min:1|max:65535',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'nullable|string|max:20',
            'mail_from_address' => 'nullable|email|max:255',
            'mail_from_name' => 'nullable|string|max:255',
            'warranty_return_alert_threshold' => 'nullable|numeric|min:0|max:100',
        ]);

        $data['mail_mailer'] = isset($data['mail_mailer']) ? trim((string) $data['mail_mailer']) : null;
        $data['mail_host'] = isset($data['mail_host']) ? trim((string) $data['mail_host']) : null;
        $data['mail_username'] = isset($data['mail_username']) ? trim((string) $data['mail_username']) : null;
        $data['mail_encryption'] = isset($data['mail_encryption']) ? trim((string) $data['mail_encryption']) : null;
        $data['mail_from_address'] = isset($data['mail_from_address']) ? trim((string) $data['mail_from_address']) : null;
        $data['mail_from_name'] = isset($data['mail_from_name']) ? trim((string) $data['mail_from_name']) : null;
        $data['warranty_return_alert_threshold'] = isset($data['warranty_return_alert_threshold'])
            ? round((float) $data['warranty_return_alert_threshold'], 2)
            : null;

        $newPassword = trim((string) ($data['mail_password'] ?? ''));
        if ($newPassword !== '') {
            $data['mail_password'] = Crypt::encryptString($newPassword);
        } else {
            unset($data['mail_password']);
        }

        $other->update($data);

        return redirect()->route('app.other-settings.index', ['other' => $other->id])->with('success', 'Configurações alteradas com sucesso');
    }

    public function sendTestMail(Other $other): RedirectResponse
    {
        $this->authorizeOtherSettingsAccess();

        $company = Company::query()->first();
        $targetEmail = trim((string) ($company?->email ?? ''));

        if ($targetEmail === '' || ! filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
            return back()->with('error', 'Cadastre um e-mail válido nos dados da empresa para enviar o teste SMTP.');
        }

        if (! TenantMailConfig::hasConfiguredForTenantId(Auth::user()?->tenant_id)) {
            return back()->with('error', 'Configure host, porta, usuário e senha SMTP antes de enviar o teste.');
        }

        try {
            TenantMailConfig::applyForTenantId(Auth::user()?->tenant_id);

            Mail::raw(
                "Este é um e-mail de teste da configuração SMTP do sistema.\n\nEmpresa: ".($company?->companyname ?? config('app.name'))."\nData/Hora: ".now()->format('d/m/Y H:i:s'),
                function ($message) use ($targetEmail, $company) {
                    $message->to($targetEmail)
                        ->subject('Teste de configuração SMTP - '.($company?->companyname ?? config('app.name')));
                }
            );

            return back()->with('message', "E-mail de teste enviado com sucesso para {$targetEmail}.");
        } catch (\Throwable $e) {
            report($e);

            return back()->with('error', 'Falha ao enviar e-mail de teste. Verifique host, porta, usuário, senha e criptografia SMTP.');
        }
    }
}
