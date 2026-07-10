@php
    $accessKeyRequired = \App\Models\App\Other::withoutGlobalScopes()
        ->where('tenant_id', $order->tenant_id)
        ->value('public_order_access_key_required');
@endphp

@if ($accessKeyRequired && !empty($order->public_access_key))
    <div style="margin:18px 0;padding:14px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;color:#0f172a;">
        <div style="font-size:13px;color:#475569;">Chave para acessar a página da OS</div>
        <div style="margin-top:6px;font-family:monospace;font-size:22px;font-weight:bold;letter-spacing:4px;">{{ $order->public_access_key }}</div>
    </div>
@endif
