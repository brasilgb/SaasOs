<?php

namespace App\Http\Requests;

use App\Models\App\FiscalSetting;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CustomerRequest extends FormRequest
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
        $nfeEnabled = (bool) FiscalSetting::query()
            ->where('enabled', true)
            ->where('nfe_enabled', true)
            ->exists();

        return [
            'name' => ['required', 'string', 'max:255'],
            'cpfcnpj' => ['required', 'string', 'max:18'],
            // 'email'  => ($this->getMethod() == 'POST') ? 'required|unique:customers' : 'required|unique:customers,email,' . $this->customer->id,
            'phone' => ['required', 'string', 'max:20'],
            'zipcode' => [Rule::requiredIf($nfeEnabled), 'nullable', 'string', 'max:20'],
            'state' => [Rule::requiredIf($nfeEnabled), 'nullable', 'string', 'size:2'],
            'city' => [Rule::requiredIf($nfeEnabled), 'nullable', 'string', 'max:50'],
            'district' => [Rule::requiredIf($nfeEnabled), 'nullable', 'string', 'max:50'],
            'street' => [Rule::requiredIf($nfeEnabled), 'nullable', 'string', 'max:80'],
            'number' => [Rule::requiredIf($nfeEnabled), 'nullable', 'string', 'max:20'],
            'observations' => 'nullable|string|max:500',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nome',
            'phone' => 'telefone',
            'cpfcnpj' => 'CPF/CNPJ',
            'zipcode' => 'CEP',
            'state' => 'UF',
            'city' => 'cidade',
            'district' => 'bairro',
            'street' => 'logradouro',
            'number' => 'número',
            'observations' => 'observações',
        ];
    }
}
