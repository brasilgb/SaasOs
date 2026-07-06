<?php

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $response = $this->post('/register', [
        'name' => 'Test User',
        'company' => 'Empresa Teste LTDA',
        'cnpj' => '12.345.678/0001-90',
        'phone' => '11999999999',
        'whatsapp' => '11999999999',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'accepted_terms' => true,
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('app.dashboard', absolute: false));
});

test('users must accept the terms to register', function () {
    $response = $this->from('/register')->post('/register', [
        'name' => 'Test User',
        'company' => 'Empresa Teste LTDA',
        'cnpj' => '12.345.678/0001-90',
        'phone' => '11999999999',
        'whatsapp' => '11999999999',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'accepted_terms' => false,
    ]);

    $response->assertRedirect('/register')->assertSessionHasErrors('accepted_terms');
    $this->assertGuest();
});
