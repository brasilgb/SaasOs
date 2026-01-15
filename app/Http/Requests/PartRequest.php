<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PartRequest extends FormRequest
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
            'reference_number' => 'required',
            'name' => 'required',
            'description' => 'required',
            'manufacturer' => 'required',
            'cost_price' => 'required',
            'sale_price' => 'required',
            'quantity' => 'required',
            'minimum_stock_level' => 'required'
        ];
    }

    public function attributes(): array
    {
        return [
            'reference_number' => 'núm. de referencia',
            'name' => 'nome',
            'description' => 'descrição',
            'manufacturer' => 'Fabricante',
            'cost_price' => 'Preço de custo',
            'sale_price' => 'Preço de venda',
            'quantity' => 'Quantidade em estoque',
            'minimum_stock_level' => 'Quantidade mínima em estoque',
        ];
    }
}
