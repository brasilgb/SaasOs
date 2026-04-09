<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Company;
use App\Models\App\Other;
use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Auth;
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

        return Inertia::render('app/others/index', ['othersettings' => $othersettings, 'company' => $company, 'time_remaining' => $time_remaining, 'mailSettings' => $mailSettings]);
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
        ]);

        $data['mail_mailer'] = isset($data['mail_mailer']) ? trim((string) $data['mail_mailer']) : null;
        $data['mail_host'] = isset($data['mail_host']) ? trim((string) $data['mail_host']) : null;
        $data['mail_username'] = isset($data['mail_username']) ? trim((string) $data['mail_username']) : null;
        $data['mail_encryption'] = isset($data['mail_encryption']) ? trim((string) $data['mail_encryption']) : null;
        $data['mail_from_address'] = isset($data['mail_from_address']) ? trim((string) $data['mail_from_address']) : null;
        $data['mail_from_name'] = isset($data['mail_from_name']) ? trim((string) $data['mail_from_name']) : null;

        $newPassword = trim((string) ($data['mail_password'] ?? ''));
        if ($newPassword !== '') {
            $data['mail_password'] = Crypt::encryptString($newPassword);
        } else {
            unset($data['mail_password']);
        }

        $other->update($data);

        return redirect()->route('app.other-settings.index', ['other' => $other->id])->with('success', 'Configurações alteradas com sucesso');
    }
}
