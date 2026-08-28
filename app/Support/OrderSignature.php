<?php

namespace App\Support;

use App\Models\App\Order;
use Illuminate\Support\Facades\File;

/**
 * Assinatura digital do cliente no recebimento do equipamento. Guarda o PNG em
 * storage/orders/{order_number}/signature.png, no mesmo padrão de pasta já usado
 * pelas fotos da OS (App\Http\Controllers\App\ImageController).
 */
final class OrderSignature
{
    private const FILENAME = 'signature.png';

    public static function store(Order $order, string $base64): bool
    {
        $image = base64_decode(preg_replace('#^data:image/\w+;base64,#', '', $base64), true);

        if ($image === false || $image === '') {
            return false;
        }

        $folder = self::folder($order);
        if (! file_exists($folder)) {
            mkdir($folder, 0777, true);
        }

        File::put($folder.DIRECTORY_SEPARATOR.self::FILENAME, $image);

        $order->forceFill(['customer_signature_captured_at' => now()])->save();

        return true;
    }

    public static function exists(Order $order): bool
    {
        return file_exists(self::path($order));
    }

    public static function url(Order $order): ?string
    {
        return self::exists($order) ? asset('storage/orders/'.$order->order_number.'/'.self::FILENAME) : null;
    }

    private static function folder(Order $order): string
    {
        return public_path('storage/orders/'.$order->order_number);
    }

    private static function path(Order $order): string
    {
        return self::folder($order).DIRECTORY_SEPARATOR.self::FILENAME;
    }
}
