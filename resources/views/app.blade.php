<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"
    class="{{ ($appearance ?? 'system') === 'dark' ? 'dark' : '' }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'SigmaOS') }} | Sistema de Ordem de Serviço para Assistência Técnica</title>

    <meta name="description"
        content="Sistema de ordem de serviço para assistência técnica de celulares, informática e eletrônica. Controle clientes, equipamentos, estoque e atendimentos com aplicativo para técnicos.">

    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="author" content="SigmaOS">
    <meta name="language" content="pt-BR">
    <meta name="app-appearance" content="{{ $appearance ?? 'system' }}">

    <link rel="canonical" href="{{ rtrim(config('app.url', url('/')), '/') }}">
    <link rel="alternate" hreflang="pt-BR" href="{{ rtrim(config('app.url', url('/')), '/') }}">

    <meta name="theme-color" content="#0f172a">

    <link rel="icon" type="image/png" href="{{ asset('logos/logo-light.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">

    {{-- Performance --}}
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link rel="dns-prefetch" href="//fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet">

    <link rel="preload" href="{{ asset('logos/logo-light.png') }}" as="image">

    {{-- Open Graph --}}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="SigmaOS">
    <meta property="og:locale" content="pt_BR">

    <meta property="og:title" content="SigmaOS - Sistema de Ordem de Serviço para Assistência Técnica">

    <meta property="og:description"
        content="Gerencie clientes, equipamentos, ordens de serviço e estoque em um único sistema. Ideal para assistência técnica e empresas de manutenção.">

    <meta property="og:url" content="{{ rtrim(config('app.url', url('/')), '/') }}">

    <meta property="og:image" content="{{ rtrim(config('app.url', url('/')), '/') . '/images/banner-social.jpg' }}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Banner do SigmaOS com destaque para o sistema de ordem de serviço.">

    {{-- Twitter --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="SigmaOS - Sistema de Ordem de Serviço">
    <meta name="twitter:description" content="Sistema completo para assistência técnica e empresas de manutenção.">
    <meta name="twitter:image" content="{{ rtrim(config('app.url', url('/')), '/') . '/images/banner-social.jpg' }}">
    <meta name="twitter:image:alt"
        content="Banner do SigmaOS com destaque para o sistema de ordem de serviço.">

    {{-- Dark mode detection --}}
    <script>
        (function() {
            
            const appearance = document
                .querySelector('meta[name="app-appearance"]')
                ?.getAttribute('content') ?? 'system';

            if (appearance === 'system') {

                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }

            }

        })();
    </script>

    {{-- Background color before CSS loads --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    {{-- Schema.org --}}
    @php
        $schemaData = [
            '@context' => 'https://schema.org',
            '@type' => 'SoftwareApplication',
            'name' => 'SigmaOS',
            'applicationCategory' => 'BusinessApplication',
            'operatingSystem' => 'Web, Android',
            'url' => rtrim(config('app.url', url('/')), '/'),
            'description' => 'Sistema de ordem de serviço para assistência técnica de celulares, informática e empresas de manutenção.',
            'offers' => [
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'BRL',
            ],
        ];
    @endphp
    <script type="application/ld+json">{!! json_encode($schemaData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) !!}</script>

    {{-- Laravel / Inertia --}}
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead

</head>

<body class="font-sans antialiased">

    @inertia

</body>

</html>
