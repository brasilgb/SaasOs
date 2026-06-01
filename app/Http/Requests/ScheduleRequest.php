<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customer_id' => 'required',
            'order_id' => 'required',
            'user_id' => 'required',
            'schedules' => 'required',
            'service' => 'required|string|max:500',
            'details' => 'required|string|max:500',
            'observations' => 'nullable|string|max:500',
            'status' => 'required',
            'send_to_technician' => 'boolean',
        ];
    }

    public function attributes(): array
    {
        return [
            'customer_id' => 'cliente',
            'order_id' => 'ordem de serviço',
            'user_id' => 'técnico',
            'schedules' => 'horário da visita',
            'service' => 'serviço',
            'details' => 'detalhes',
            'status' => 'status do agendamento',
            'send_to_technician' => 'enviar ao técnico',
        ];
    }
}
