<?php

namespace App\Http\Requests;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name'  => 'required',
            'cpf'   => ($this->getMethod() == 'POST') ? 'required|cpf_ou_cnpj|unique:customers' : 'required|cpf_ou_cnpj|unique:customers,cpf,' . $this->customer->id,
            // 'email'  => ($this->getMethod() == 'POST') ? 'required|unique:customers' : 'required|unique:customers,email,' . $this->customer->id,
            'phone' => 'required'
        ];
    }
    
    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'phone' => 'telefone',
            // 'email' => 'e-mail',
        ];
    }
}
