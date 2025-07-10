<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PlanRequest extends FormRequest
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
            'name' => 'required',
            'description' => 'required',
            'price' => 'required',
            'periodo' => 'required',
            'resources' => 'required',
            'aditional' => 'required',
            'paiment_method' => 'required',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'description' => 'descrição',
            'price' => 'preço',
            'period' => 'período',
            'resources' => 'telefone',
            'aditional' => 'adicionais',
            'paiment_method' => 'método de pagamento',
        ];
    }
}
