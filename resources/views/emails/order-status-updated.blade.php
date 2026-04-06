<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Atualização da Ordem de Serviço</title>
</head>

<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        A ordem #{{ $order->order_number }} foi atualizada para {{ $statusLabel }}.
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;padding:40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" role="presentation"
                    style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.06);">

                    <tr>
                        <td align="center" style="background:#0f172a;padding:30px 20px;">
                            @if (!empty($logoUrl))
                            <img src="{{ $logoUrl }}" alt="Logo da empresa"
                                style="display:block;margin:0 auto 14px auto;max-width:130px;max-height:52px;height:auto;width:auto;">
                            @endif

                            <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:1px;">
                                {{ $order->tenant?->company ?? 'SigmaOS' }}
                            </h1>
                            <p style="margin:6px 0 0 0;color:#cbd5f5;font-size:13px;">
                                Atualização da sua ordem de serviço
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:36px;color:#374151;">
                            <h2 style="margin-top:0;font-size:20px;color:#111827;">
                                Olá, {{ $order->customer?->name ?? 'cliente' }}.
                            </h2>

                            <p style="font-size:15px;line-height:1.6;margin:14px 0;">
                                Sua ordem de serviço foi atualizada com sucesso.
                            </p>

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f9fafb;border-radius:8px;padding:18px;margin:24px 0;font-size:14px;">
                                <tr>
                                    <td style="padding:4px 0;"><strong>Ordem:</strong> #{{ $order->order_number }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:4px 0;"><strong>Status atual:</strong> {{ $statusLabel }}</td>
                                </tr>
                                @if (!empty($order->tracking_token))
                                <tr>
                                    <td style="padding:4px 0;">
                                        <strong>Acompanhamento:</strong>
                                        <a href="{{ route('os.token', ['token' => $order->tracking_token]) }}"
                                            style="color:#2563eb;text-decoration:none;">
                                            Clique para acompanhar sua ordem
                                        </a>
                                    </td>
                                </tr>
                                @endif
                                @if (!empty($note))
                                <tr>
                                    <td style="padding:4px 0;"><strong>Observação:</strong> {{ $note }}</td>
                                </tr>
                                @endif
                                <tr>
                                    <td style="padding:4px 0;"><strong>Atualizado em:</strong> {{ now()->format('d/m/Y H:i') }}</td>
                                </tr>
                            </table>

                            <p style="font-size:15px;line-height:1.6;">
                                Se tiver dúvidas, entre em contato com nossa equipe pelo sistema.
                            </p>

                            @if (!empty($order->tracking_token))
                            <p style="margin-top:8px;">
                                <a href="{{ route('os.token', ['token' => $order->tracking_token]) }}"
                                    style="background:#0f766e;border-radius:6px;color:#ffffff;display:inline-block;font-size:14px;font-weight:bold;padding:12px 22px;text-decoration:none;">
                                    Acompanhar minha ordem
                                </a>
                            </p>
                            @endif

                            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:30px 0;">
                                <tr>
                                    <td align="center">
                                        <!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml"
href="{{ config('app.url') }}"
style="height:45px;v-text-anchor:middle;width:220px;"
arcsize="10%"
stroke="f"
fillcolor="#2563eb">
<w:anchorlock/>
<center style="color:#ffffff;font-family:Arial;font-size:16px;font-weight:bold;">
Acessar o sistema
</center>
</v:roundrect>
<![endif]-->
                                        <!--[if !mso]> -->
                                        <a href="{{ config('app.url') }}"
                                            style="background:#2563eb;border-radius:6px;color:#ffffff;display:inline-block;font-size:15px;font-weight:bold;padding:14px 28px;text-decoration:none;">
                                            Acessar o sistema
                                        </a>
                                        <!--<![endif]-->
                                    </td>
                                </tr>
                            </table>
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