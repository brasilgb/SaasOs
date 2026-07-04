<?php

namespace App\Support;

final class Ean13
{
    public static function fromNumber(int|string $value): string
    {
        $payload = substr(str_pad(preg_replace('/\D+/', '', (string) $value) ?: '0', 12, '0', STR_PAD_LEFT), -12);

        return $payload.self::checkDigit($payload);
    }

    public static function payload(string $value): ?string
    {
        if (! preg_match('/^\d{13}$/', $value)) {
            return null;
        }

        $payload = substr($value, 0, 12);

        return self::checkDigit($payload) === (int) $value[12] ? $payload : null;
    }

    public static function normalize(string $value): ?string
    {
        $digits = preg_replace('/\D+/', '', $value);

        if (! is_string($digits) || $digits === '' || strlen($digits) > 13) {
            return null;
        }

        $ean = str_pad($digits, 13, '0', STR_PAD_LEFT);

        return self::payload($ean) !== null ? $ean : null;
    }

    private static function checkDigit(string $payload): int
    {
        $sum = 0;

        foreach (str_split($payload) as $index => $digit) {
            $sum += (int) $digit * ($index % 2 === 0 ? 1 : 3);
        }

        return (10 - ($sum % 10)) % 10;
    }
}
