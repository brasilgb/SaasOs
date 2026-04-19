<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('sigmaos:send-payment-followups')
    ->dailyAt('09:00')
    ->withoutOverlapping();

Schedule::command('sigmaos:send-budget-followups')
    ->dailyAt('10:00')
    ->withoutOverlapping();

Schedule::command('sigmaos:send-subscription-status-notifications')
    ->dailyAt('08:00')
    ->withoutOverlapping();
