<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $notice['subject'] ?? 'Atualização da assinatura' }}</title>
</head>

<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    @php
        $registeredLogoPath = public_path('logos/sigmaos-horizontal-dark.png');
        $registeredLogoUrl = file_exists($registeredLogoPath) ? asset('logos/sigmaos-horizontal-dark.png') : null;
    @endphp

    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        {{ $notice['preview'] ?? 'Atualização importante sobre a sua assinatura.' }}
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation"
                    style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.06);">

                    <tr>
                        <td align="center" style="background:#0f172a;padding:30px 20px;">
                            @if (!empty($registeredLogoUrl))
                                <img src="{{ $registeredLogoUrl }}" alt="SigmaOS"
                                    style="display:block;margin:0 auto 14px auto;max-width:220px;height:auto;">
                            @else
                                <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:0.5px;">
                                    SigmaOS
                                </h1>
                            @endif
                            <p style="margin:6px 0 0 0;color:#cbd5f5;font-size:13px;">
                                Comunicação de assinatura
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:36px;color:#374151;">
                            <h2 style="margin-top:0;font-size:20px;color:#111827;">
                                {{ $notice['headline'] ?? 'Olá!' }}
                            </h2>

                            <p style="font-size:15px;line-height:1.7;margin:14px 0;">
                                {{ $notice['message'] ?? 'Temos uma atualização importante sobre sua assinatura.' }}
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f9fafb;border-radius:8px;padding:18px;margin:24px 0;font-size:14px;">
                                <tr>
                                    <td style="padding:4px 0;"><strong>Empresa:</strong> {{ $tenant->company }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 0;"><strong>E-mail do tenant:</strong> {{ $tenant->email ?: 'Nao informado' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 0;"><strong>Plano:</strong> {{ $tenant->plan?->name ?? 'Sem plano definido' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 0;"><strong>Status:</strong> {{ $tenant->subscriptionLabel() }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 0;">
                                        <strong>Vencimento:</strong>
                                        {{ $tenant->expires_at?->format('d/m/Y') ?? 'Sem vencimento definido' }}
                                    </td>
                                </tr>
                            </table>

                            @if (!empty($notice['cta_url']))
                                <p style="margin:28px 0 12px 0;">
                                    <a href="{{ $notice['cta_url'] }}"
                                        style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:bold;">
                                        {{ $notice['cta_label'] ?? 'Regularizar assinatura' }}
                                    </a>
                                </p>
                            @endif

                            <p style="font-size:14px;line-height:1.7;color:#4b5563;margin:20px 0 0 0;">
                                {{ $notice['footer'] ?? 'Se precisar de ajuda, responda este e-mail e nosso time segue com você.' }}
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="background:#f9fafb;text-align:center;padding:24px;font-size:12px;color:#6b7280;">
                            <p style="margin:0;">© {{ date('Y') }} SigmaOS</p>
                            <p style="margin:6px 0;">Todos os direitos reservados</p>
                            <p style="margin:6px 0;">
                                <a href="{{ config('app.url') }}" style="color:#2563eb;text-decoration:none;">
                                    {{ config('app.url') }}
                                </a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
