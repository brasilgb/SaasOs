<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BudgetsRequest extends FormRequest
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
            'category' => 'required',
            'service' => 'required',
            'description' => 'required',
            'estimated_time' => 'required',
            'labor_value' => 'required',
            'total_value' => 'required',
            'warranty' => 'required' // Garantia
        ];
    }

    public function attributes(): array
    {
        return [
            'category' =>       'categoria',
            'service' =>        'serviço',
            'description' =>    'descrição',
            'estimated_time' => 'tempo estimado',
            'labor_value' =>    'valor mão de obra',
            'total_value' =>    'valor total',
            'warranty' =>       'garantia'
        ];
    }
}
