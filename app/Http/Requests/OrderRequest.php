<?php

namespace App\Http\Requests;

use App\Support\OrderStatus;
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
            'model' => 'nullable|string|max:50',
            'password' => 'nullable|string|max:50',
            'defect' => 'required|string|max:500',
            'state_conservation' => 'nullable|string|max:500',
            'accessories' => 'nullable|string|max:500',
            'service_status' => ['required', 'integer', Rule::in(OrderStatus::values())],
            'warranty_days' => 'nullable|integer|min:0|max:3650',

            'budget_description' => [
                Rule::requiredIf((int) $this->service_status === OrderStatus::BUDGET_GENERATED),
                'nullable',
                'string',
                'max:500',
            ],
            'services_performed' => 'nullable|string|max:500',
            'budget_value' => [
                Rule::requiredIf((int) $this->service_status === OrderStatus::BUDGET_GENERATED),
                function ($attribute, $value, $fail) {
                    // Remove pontos de milhar e troca vírgula por ponto para checar o número real
                    $numericValue = (float) str_replace(['.', ','], ['', '.'], $value);

                    if ((int) $this->service_status === OrderStatus::BUDGET_GENERATED && $numericValue <= 0) {
                        $fail('O valor do orçamento deve ser maior que 0,00 quando for "Orçamento gerado".');
                    }
                },
            ],

            'user_id' => $this->isMethod('post') ? 'nullable' : 'required',
            'delivery_date' => 'nullable|date',
            'delivery_forecast' => 'nullable|date',
            'observations' => 'nullable|string|max:500',
        ];
    }

    public function attributes(): array
    {
        return [
            'customer_id' => 'cliente',
            'budget_description' => 'descrição do orçamento',
            'budget_value' => 'valor do orçamento',
            'equipment_id' => 'equipamento',
            'model' => 'marca e modelo',
            'password' => 'senha',
            'defect' => 'defeito',
            'state_conservation' => 'estado de conservação',
            'accessories' => 'acessórios',
            'user_id' => 'técnico',
            'delivery_date' => 'data de entrega',
            'warranty_days' => 'garantia em dias',
            'delivery_forecast' => 'previsão de entrega',
            'observations' => 'observações',
        ];
    }
}
