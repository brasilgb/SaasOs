<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_id' => 'nullable',
            'equipment_id' => 'required',
            'defect' => 'required',
            'responsible_technician'   => ($this->getMethod() == 'POST') ? '' : 'required',
        ];
    }

    public function attributes(): array
    {
        return [
            'customer_id' => 'cliente',
            'equipment_id' => 'equipamento',
            'defect' => 'defeito',
            'responsible_technician' => 'técnico',
        ];
    }
}
