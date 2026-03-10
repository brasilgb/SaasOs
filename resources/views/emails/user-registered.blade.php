<!DOCTYPE html>

<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bem-vindo ao SigmaOS</title>
</head>

<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">

    <!-- PREHEADER -->

    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        Sua conta no SigmaOS foi criada com sucesso. Comece agora a gerenciar sua empresa.
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f3f4f6;padding:40px 0;">
        <tr>
            <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" role="presentation"
                    style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.06);">

                    <!-- HEADER -->

                    <tr>
                        <td align="center" style="background:#0f172a;padding:30px 20px;">

                            <h1 style="margin:0;color:#ffffff;font-size:24px;letter-spacing:1px;">
                                SigmaOS
                            </h1>

                            <p style="margin:6px 0 0 0;color:#cbd5f5;font-size:13px;">
                                Sistema inteligente de ordens de serviço
                            </p>

                        </td>
                    </tr>

                    <!-- CONTENT -->

                    <tr>
                        <td style="padding:36px;color:#374151;">

                            <h2 style="margin-top:0;font-size:20px;color:#111827;">
                                Olá, {{ $user->name }} 👋
                            </h2>

                            <p style="font-size:15px;line-height:1.6;margin:14px 0;">
                                Seu cadastro no <strong>SigmaOS</strong> foi realizado com sucesso.
                                Sua conta já está pronta para uso.
                            </p>

                            <!-- USER CARD -->

                            <table width="100%" cellpadding="0" cellspacing="0"
                                style="background:#f9fafb;border-radius:8px;padding:18px;margin:24px 0;font-size:14px;">

                                <tr>
                                    <td style="padding:4px 0;"><strong>Nome:</strong> {{ $user->name }}</td>
                                </tr>

                                <tr>
                                    <td style="padding:4px 0;"><strong>E-mail:</strong> {{ $user->email }}</td>
                                </tr>

                                <tr>
                                    <td style="padding:4px 0;">
                                        <strong>Perfil:</strong>
                                        @if ($user->tenant_id)
                                            RootApp
                                        @else
                                            RootSystem
                                        @endif
                                    </td>
                                </tr>

                            </table>

                            <p style="font-size:15px;line-height:1.6;">
                                Para começar rapidamente, recomendamos as seguintes ações:
                            </p>

                            <!-- ONBOARDING STEPS -->

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;font-size:14px;">

                                <tr>
                                    <td style="padding:8px 0;">✅ Cadastrar os dados de sua empresa</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;">✅ Adicionar um equipamento</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;">✅ Cadastrar seu primeiro cliente</td>
                                </tr>

                                <tr>
                                    <td style="padding:8px 0;">✅ Adicionar um equipamento</td>
                                </tr>

                                <tr>
                                    <td style="padding:8px 0;">✅ Criar sua primeira ordem de serviço</td>
                                </tr>

                            </table>

                            <!-- BUTTON OUTLOOK SAFE -->

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

                                        <!--[if !mso]><!-- -->

                                        <a href="{{ config('app.url') }}"
                                            style="background:#2563eb;border-radius:6px;color:#ffffff;display:inline-block;font-size:15px;font-weight:bold;padding:14px 28px;text-decoration:none;">
                                            Acessar o sistema </a>

                                        <!--<![endif]-->

                                    </td>
                                </tr>
                            </table>

                            <p style="font-size:14px;margin-top:10px;">
                               Baixe o aplicativo para envio de imagens:
                            </p>

                            <p style="margin-top:6px;">
                                <a href="{{ asset('apk/sigmaup-image-upload.apk') }}"
                                    download="sigmaup-image-upload.apk"
                                    style="color:#2563eb;font-size:14px;text-decoration:none;">
                                    Baixar aplicativo SigmaUp
                                </a>
                            </p>

                        </td>
                    </tr>

                    <!-- FOOTER -->

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
