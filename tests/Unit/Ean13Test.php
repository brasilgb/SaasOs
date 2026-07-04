<?php

namespace Tests\Unit;

use App\Support\Ean13;
use PHPUnit\Framework\TestCase;

class Ean13Test extends TestCase
{
    public function test_it_generates_a_valid_ean_13(): void
    {
        $ean = Ean13::fromNumber('789602016008');

        $this->assertSame('7896020160083', $ean);
        $this->assertSame('789602016008', Ean13::payload($ean));
    }

    public function test_it_rejects_an_invalid_check_digit(): void
    {
        $this->assertNull(Ean13::payload('7896020160084'));
    }

    public function test_it_restores_leading_zeroes_removed_by_a_scanner(): void
    {
        $this->assertSame('0000000000017', Ean13::normalize('00000000017'));
    }
}
