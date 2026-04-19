<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TenantRequest extends FormRequest
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
        $tenantId = $this->route('tenant')?->id ?? $this->tenant?->id;

        return [
            'company' => 'required',
            'cnpj' => ($this->getMethod() == 'POST') ? 'required|cpf_ou_cnpj|unique:tenants' : 'required|cpf_ou_cnpj|unique:tenants,cnpj,'.$tenantId,
            'email' => 'required',
            'phone' => 'required',
            'plan_id' => 'required|exists:plans,id',
            'period_id' => [
                'nullable',
                Rule::exists('periods', 'id')->where(function ($query) {
                    $planId = $this->input('plan_id');

                    if ($planId !== null && $planId !== '') {
                        $query->where('plan_id', $planId);
                    }
                }),
            ],
            'status' => 'required',
        ];
    }

    public function attributes(): array
    {
        return [
            'company' => 'nome da empresa',
            'cnpj' => 'CNPJ',
            'email' => 'e-mail',
            'phone' => 'telefone',
            'status' => 'status',
            'plan_id' => 'plano',
            'period_id' => 'período',
        ];
    }
}
