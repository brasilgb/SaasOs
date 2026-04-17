<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CustomerRequest extends FormRequest
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
            'cpfcnpj' => 'required',
            // 'email'  => ($this->getMethod() == 'POST') ? 'required|unique:customers' : 'required|unique:customers,email,' . $this->customer->id,
            'phone' => 'required',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'phone' => 'telefone',
            'cpfcnpj' => 'CPF/CNPJ',
        ];
    }
}
