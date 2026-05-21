<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('app/profile/index');
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'avatar' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'current_password' => ['nullable', 'required_with:password', 'current_password'],
            'password' => ['nullable', Password::defaults(), 'confirmed'],
        ], [], [
            'name' => 'nome',
            'current_password' => 'senha atual',
            'password' => 'nova senha',
        ]);

        $user = $request->user();
        $user->name = $validated['name'];

        if ($request->hasFile('avatar')) {
            $disk = Storage::disk('public');
            if (! $disk->directoryExists('avatars')) {
                $disk->makeDirectory('avatars');
            }

            if ($user->avatar) {
                $disk->delete(str_replace('/storage/', '', $user->avatar));
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = '/storage/'.$path;
        }

        if (! empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();
        Auth::setUser($user->fresh());

        return back()->with('success', 'Perfil atualizado com sucesso.');
    }
}
