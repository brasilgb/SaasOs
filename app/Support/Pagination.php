<?php

namespace App\Support;

use App\Models\App\Other;

final class Pagination
{
    public const DEFAULT_PER_PAGE = Other::DEFAULT_RECORDS_PER_PAGE;

    public const ALLOWED_PER_PAGE = Other::ALLOWED_RECORDS_PER_PAGE;

    public static function perPage(): int
    {
        return Other::recordsPerPage();
    }
}
