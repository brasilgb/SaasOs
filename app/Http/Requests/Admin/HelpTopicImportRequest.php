<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class HelpTopicImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'topics' => ['required', 'array', 'min:1'],
            'topics.*.slug' => ['required', 'string', 'max:255'],
            'topics.*.title' => ['required', 'string', 'max:255'],
            'topics.*.content' => ['required', 'string'],
            'topics.*.category' => ['nullable', 'string', 'max:255'],
            'topics.*.position' => ['nullable', 'integer'],
        ];
    }
}
