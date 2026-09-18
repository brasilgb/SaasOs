<?php

namespace App\Support;

class WhatsAppPhone
{
    /**
     * Espelha `normalizeWhatsappPhone()` de resources/js/Utils/mask.tsx: mantém
     * apenas dígitos e garante o prefixo internacional do Brasil (55).
     */
    public static function normalize(?string $value): string
    {
        $digits = preg_replace('/\D+/', '', (string) $value);

        if ($digits === '') {
            return '';
        }

        if (! str_starts_with($digits, '55')) {
            $digits = '55'.$digits;
        }

        return $digits;
    }

    public static function isValid(?string $value): bool
    {
        return strlen(self::normalize($value)) >= 12;
    }
}
