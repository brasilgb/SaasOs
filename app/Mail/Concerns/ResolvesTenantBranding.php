<?php

namespace App\Mail\Concerns;

use App\Models\App\Company;

trait ResolvesTenantBranding
{
    public string $companyName;

    public ?string $companyLogoUrl;

    public ?string $companySite;

    protected function resolveTenantBranding(?int $tenantId): void
    {
        $company = $tenantId
            ? Company::withoutGlobalScopes()
                ->where('tenant_id', $tenantId)
                ->first(['shortname', 'companyname', 'logo', 'site'])
            : null;

        $this->companyName = trim((string) ($company?->shortname ?: $company?->companyname ?: 'Empresa'));
        $this->companyLogoUrl = $this->resolveCompanyLogoUrl($company);
        $this->companySite = filled($company?->site) ? (string) $company->site : null;
    }

    private function resolveCompanyLogoUrl(?Company $company): ?string
    {
        if (! $company?->logo) {
            return null;
        }

        $logoPath = public_path('storage/logos/'.$company->logo);

        return file_exists($logoPath)
            ? asset('storage/logos/'.$company->logo)
            : null;
    }

    protected function tenantBrandingViewData(): array
    {
        return [
            'companyName' => $this->companyName,
            'companyLogoUrl' => $this->companyLogoUrl,
            'companySite' => $this->companySite,
        ];
    }
}
