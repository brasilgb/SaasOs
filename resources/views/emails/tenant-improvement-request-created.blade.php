<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nova solicitacao de ajuste no SigmaOS</title>
</head>

<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    @php
        $registeredLogoPath = public_path('logos/sigmaos-horizontal-dark.png');
        $registeredLogoUrl = file_exists($registeredLogoPath) ? asset('logos/sigmaos-horizontal-dark.png') : null;
    @endphp

    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Uma nova solicitacao de melhoria ou ajuste foi enviada por um cliente do SigmaOS.
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.06);">
                    <tr>
                        <td align="center" style="background:#020817;padding:30px 20px;">
                            @if (!empty($registeredLogoUrl))
                                <img src="{{ $registeredLogoUrl }}" alt="SigmaOS" style="display:block;margin:0 auto 14px auto;max-width:220px;height:auto;">
                            @else
                                <p style="margin:0 0 14px 0;color:#ffffff;font-size:24px;font-weight:bold;letter-spacing:1px;">SigmaOS</p>
                            @endif
                            <p style="margin:6px 0 0 0;color:#cbd5f5;font-size:13px;">Nova solicitacao recebida</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px;color:#374151;">
                            <h2 style="margin-top:0;font-size:20px;color:#111827;">Um cliente enviou uma nova solicitacao</h2>

                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;padding:18px;margin:24px 0;font-size:14px;">
                                <tr>
                                    <td style="padding:4px 0;"><strong>Empresa:</strong> {{ $requestItem->tenant?->company ?: $requestItem->tenant?->name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 0;"><strong>Solicitante:</strong> {{ $requestItem->user?->name ?? 'Nao informado' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 0;"><strong>Tipo:</strong> {{ $requestItem->typeLabel() }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 0;"><strong>Titulo:</strong> {{ $requestItem->title }}</td>
                                </tr>
                            </table>

                            <p style="font-size:15px;line-height:1.7;margin:14px 0;"><strong>Detalhes da solicitacao</strong></p>
                            <p style="font-size:14px;line-height:1.7;margin:0;">{{ $requestItem->description }}</p>
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
