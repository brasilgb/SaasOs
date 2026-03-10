<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateRootUser extends Command
{
    protected $signature = 'sigmaos:create-root';

    protected $description = 'Create root system user';

    public function handle()
    {

        if (User::whereNull('tenant_id')->exists()) {

            $this->error('Root user already exists.');

            return;
        }

        $name = $this->ask('Name');
        $email = $this->ask('Email');
        $password = $this->secret('Password');

        $user = User::create([
            'name' => $name,
            'user_number' => 1,
            'email' => $email,
            'password' => Hash::make($password),
            'status' => 1,
            'roles' => 99,
            'tenant_id' => null
        ]);

        $this->info('Root user created successfully.');

    }
}