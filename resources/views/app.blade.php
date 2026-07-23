@php
    $meta = $meta ?? [];
    $metaTitle = $meta['title'] ?? 'VetorOS - Sistema de Ordem de Serviço para Assistência Técnica';
    $metaDescription =
        $meta['description'] ??
        'Sistema de ordem de serviço para assistência técnica de celulares, informática e eletrônica. Controle clientes, equipamentos, estoque e atendimentos com aplicativo para técnicos.';
    $metaUrl = $meta['url'] ?? rtrim(config('app.url', url('/')), '/');
    $metaImage = $meta['image'] ?? rtrim(config('app.url', url('/')), '/') . '/images/banner-social.jpg';
    $metaImageAlt = $meta['imageAlt'] ?? 'Banner do VetorOS com destaque para o sistema de ordem de serviço.';
    $metaSiteName = $meta['siteName'] ?? 'VetorOS';
    $metaRobots = $meta['robots'] ?? 'index, follow, max-image-preview:large';
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ $metaTitle }}</title>

    <meta name="description" content="{{ $metaDescription }}">

    <meta name="robots" content="{{ $metaRobots }}">
    <meta name="author" content="{{ $metaSiteName }}">
    <meta name="language" content="pt-BR">

    <link rel="canonical" href="{{ $metaUrl }}">
    <link rel="alternate" hreflang="pt-BR" href="{{ rtrim(config('app.url', url('/')), '/') }}">

    <meta name="theme-color" content="#ffffff">

    <link rel="icon" type="image/png" href="{{ asset('images/vetor.png') }}" sizes="any">
    <link rel="icon" type="image/png" href="{{ asset('favicon-48x48.png') }}" sizes="48x48">
    <link rel="icon" type="image/png" href="{{ asset('favicon-96x96.png') }}" sizes="96x96">
    <link rel="icon" type="image/png" href="{{ asset('favicon-192x192.png') }}" sizes="192x192">
    <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">

    {{-- Performance --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@700&display=swap" rel="stylesheet">

    <link rel="preload" href="{{ asset('images/vetor.png') }}" as="image">

    {{-- Open Graph --}}
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ $metaSiteName }}">
    <meta property="og:locale" content="pt_BR">

    <meta property="og:title" content="{{ $metaTitle }}">

    <meta property="og:description" content="{{ $metaDescription }}">

    <meta property="og:url" content="{{ $metaUrl }}">

    <meta property="og:image" content="{{ $metaImage }}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{{ $metaImageAlt }}">

    {{-- Twitter --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $metaTitle }}">
    <meta name="twitter:description" content="{{ $metaDescription }}">
    <meta name="twitter:image" content="{{ $metaImage }}">
    <meta name="twitter:image:alt" content="{{ $metaImageAlt }}">

    {{-- Background color before CSS loads --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }
    </style>

    {{-- Schema.org --}}
    @php
        $schemaData = [
            '@context' => 'https://schema.org',
            '@type' => 'SoftwareApplication',
            'name' => 'VetorOS',
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
