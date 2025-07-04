<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MessageRequest extends FormRequest
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
            'recipient_id' => 'required',
            'title' => 'required',
            'message' => 'required',
            'status' => 'required',
        ];
    }

    public function attributes(): array
    {
        return [
            'recipient_id' => 'destinatário',
            'title' => 'título',
            'message' => 'mensagem',
            'status' => 'status',
        ];
    }
}
