<?php

namespace App\Support;

use Illuminate\Http\Request;

final class Pagination
{
    private const ALLOWED_PER_PAGE = [20, 35, 50];

    public static function perPage(Request $request): int
    {
        $perPage = $request->integer('per_page', 20);

        return in_array($perPage, self::ALLOWED_PER_PAGE, true) ? $perPage : 20;
    }
}
