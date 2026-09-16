<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SupplierRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => $this->has('status')
                ? filter_var($this->input('status'), FILTER_VALIDATE_BOOLEAN)
                : true,
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'document' => 'nullable|string|max:32',
            'phone' => 'nullable|string|max:32',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string|max:500',
            'status' => 'required|boolean',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'document' => 'CNPJ/CPF',
            'phone' => 'telefone',
            'email' => 'e-mail',
            'notes' => 'observações',
            'status' => 'status',
        ];
    }
}
