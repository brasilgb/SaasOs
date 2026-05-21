<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required',
            'email' => ($this->getMethod() == 'POST') ? 'required|email|unique:users' : 'required|email|unique:users,email,'.$this->user->id,
            'tenant_id' => ! is_null(session('tenant_id')) ? 'required' : 'nullable',
            'roles' => ! is_null(session('tenant_id')) ? 'required' : 'nullable',
            'can_view_all_orders' => 'sometimes|boolean',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'password' => ($this->getMethod() == 'POST') ? ['required', 'min:8', 'confirmed', Rules\Password::defaults()] : ['nullable', 'min:8', 'confirmed', Rules\Password::defaults()],
            'password_confirmation' => ($this->getMethod() == 'POST') ? ['required', 'min:8'] : ['nullable', 'min:8'],
        ];
    }

    public function attributes(): array
    {
        return [
            'tenant_id' => 'empresa',
            'name' => 'nome',
            'email' => 'e-mail',
            'avatar' => 'imagem do perfil',
            'roles' => 'função',
            'can_view_all_orders' => 'técnico master',
            'password' => 'senha',
            'password_confirmation' => 'confirmar senha',
        ];
    }
}
