<?php

namespace App\Http\Requests;

use App\Models\App\FiscalSetting;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PartRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_sellable' => filter_var($this->input('is_sellable', false), FILTER_VALIDATE_BOOLEAN),
            'status' => $this->has('status')
                ? filter_var($this->input('status'), FILTER_VALIDATE_BOOLEAN)
                : true,
        ]);
    }

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
        $fiscalNfeEnabled = FiscalSetting::query()
            ->where('enabled', true)
            ->where('nfe_enabled', true)
            ->exists();

        return [
            'reference_number' => 'required',
            'type' => 'required',
            'is_sellable' => 'required|boolean',
            'category' => 'required',
            'name' => 'required',
            'description' => 'required|string|max:500',
            'ncm' => [Rule::requiredIf($fiscalNfeEnabled), 'nullable', 'regex:/^\d{8}$/'],
            'cfop' => [Rule::requiredIf($fiscalNfeEnabled), 'nullable', 'regex:/^\d{4}$/'],
            'manufacturer' => 'required',
            'model_compatibility' => 'nullable|string|max:500',
            'cost_price' => 'required',
            'sale_price' => 'required',
            'quantity' => 'required',
            'minimum_stock_level' => 'required',
            'location' => 'nullable',
            'status' => 'required|boolean',
        ];
    }

    public function attributes(): array
    {
        return [
            'reference_number' => 'núm. de referencia',
            'type' => 'tpo de registro',
            'is_sellable' => 'disponível para venda',
            'category' => 'categoria',
            'name' => 'nome',
            'description' => 'descrição',
            'ncm' => 'NCM',
            'cfop' => 'CFOP',
            'manufacturer' => 'Fabricante',
            'cost_price' => 'Preço de custo',
            'sale_price' => 'Preço de venda',
            'quantity' => 'Quantidade em estoque',
            'minimum_stock_level' => 'Quantidade mínima em estoque',
            'status' => 'status',
        ];
    }
}
