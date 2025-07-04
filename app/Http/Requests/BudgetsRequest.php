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
            'service_id' => 'required',
            'description' => 'required',
            'value' => 'required',
        ];
    }

    public function attributes(): array
    {
        return [
            'service_id' => 'serviço',
            'description' => 'descrição',
            'value' => 'valor',
        ];
    }
}
