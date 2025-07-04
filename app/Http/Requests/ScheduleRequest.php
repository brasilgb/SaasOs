<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScheduleRequest extends FormRequest
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
            'customer_id' => 'required',
            'user_id' => 'required',
            'schedules' => 'required',
            'service' => 'required',
            'details' => 'required',
            'status' => 'required',
        ];
    }

    public function attributes(): array
    {
        return [
            'customer_id' => 'cliente',
            'user_id' => 'técnico',
            'schedules' => 'equipamento',
            'service' => 'serviço',
            'details' => 'detalhes',
        ];
    }
}
