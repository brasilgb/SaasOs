<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/app')->assertRedirect('/login');
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/app')->assertOk();
});
