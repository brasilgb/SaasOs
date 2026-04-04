<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderRequest extends FormRequest
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
            'customer_id' => 'required',
            'equipment_id' => 'required',
            'defect' => 'required',

            'budget_description' => [
                Rule::requiredIf($this->service_status == 3),
            ],
            'budget_value' => [
                Rule::requiredIf($this->service_status == 3),
                function ($attribute, $value, $fail) {
                    // Remove pontos de milhar e troca vírgula por ponto para checar o número real
                    $numericValue = (float) str_replace(['.', ','], ['', '.'], $value);

                    if ($this->service_status == 3 && $numericValue <= 0) {
                        $fail('O valor do orçamento deve ser maior que 0,00 quando for "Orçamento gerado".');
                    }
                },
            ],

            'user_id' => $this->isMethod('post') ? 'nullable' : 'required',
        ];
    }

    public function attributes(): array
    {
        return [
            'customer_id' => 'cliente',
            'budget_description' => 'descrição do orçamento',
            'budget_value' => 'valor do orçamento',
            'equipment_id' => 'equipamento',
            'defect' => 'defeito',
            'user_id' => 'técnico',
        ];
    }
}
