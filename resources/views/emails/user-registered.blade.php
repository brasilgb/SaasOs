<!DOCTYPE html>

<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <title>Bem-vindo ao SigmaOS</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, Helvetica, sans-serif;
            color: #333333;
        }

        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .header {
            background: #0f172a;
            padding: 24px;
            text-align: center;
        }

        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            letter-spacing: 1px;
        }

        .content {
            padding: 32px;
        }

        .content h2 {
            margin-top: 0;
            font-size: 20px;
            color: #0f172a;
        }

        .content p {
            font-size: 15px;
            line-height: 1.6;
            margin: 12px 0;
        }

        .card {
            background: #f9fafb;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
        }

        .card strong {
            display: inline-block;
            width: 90px;
        }

        .btn {
            display: inline-block;
            margin-top: 24px;
            padding: 14px 28px;
            background: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-size: 15px;
            font-weight: bold;
        }

        .footer {
            background: #f4f6f8;
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #6b7280;
        }

        .footer a {
            color: #2563eb;
            text-decoration: none;
        }
    </style>
    ```

</head>

<body>
    <div class="container">

        <div class="header">
            <h1>SigmaOS</h1>
        </div>

        <div class="content">
            <h2>Olá, {{ $user->name }} 👋</h2>

            <p>
                Seja bem-vindo ao <strong>SigmaOS</strong>!
                Seu cadastro foi realizado com sucesso e sua conta já está ativa.
            </p>

            <div class="card">
                <p><strong>Nome:</strong> {{ $user->name }}</p>
                <p><strong>E-mail:</strong> {{ $user->email }}</p>
                @if($user->tenant_id)
                <p><strong>Perfil:</strong> RootApp</p>
                @else
                <p><strong>Perfil:</strong> RootSystem</p>
                @endif
            </div>

            <p>
                Agora você já pode acessar o sistema e começar a gerenciar sua empresa
                de forma simples, rápida e segura.
            </p>

            <p>
            <a href="{{ config('app.url') }}" class="btn">
                Acessar o sistema
            </a>
        </p>
        <p>

            <a
    href="{{ asset('apk/sigmaup-image-upload.apk') }}"
    download="sigmaup-image-upload.apk"
    class="text-blue-600 hover:underline flex items-center gap-2"
>
    Baixar aplicativo para upload de imagens
</a>

        </p>
        </div>

        <div class="footer">
            <p>
                © {{ date('Y') }} SigmaOS · Todos os direitos reservados<br>
                <a href="{{ config('app.url') }}">{{ config('app.url') }}</a>
            </p>
        </div>

    </div>
</body>

</html>