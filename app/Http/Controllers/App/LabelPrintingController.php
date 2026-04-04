<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\App\Company;
use App\Models\App\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabelPrintingController extends Controller
{
    private function buildLabelsData(int $initial, int $pages): array
    {
        $company = Company::first();
        $totalLabels = max(1, $pages) * 96;
        $final = $initial + $totalLabels - 1;
        $data = [];

        for ($i = $initial; $i <= $final; $i++) {
            $data[] = [
                'order' => $i,
                'telephone' => $company?->telephone ?? '',
                'company' => $company?->shortname ?? '',
            ];
        }

        return $data;
    }

    public function index()
    {
        $labels = Order::orderBy('id', 'DESC')->first();
        if ($labels) {
            $labels = Order::orderBy('id', 'DESC')->first();
        } else {
            $labels = ['id' => 0];
        }

        return Inertia::render('app/label-printing/index', ['labels' => $labels]);
    }

    public function print(Request $request)
    {
        $validated = $request->validate([
            'initialorder' => ['required', 'integer', 'min:1'],
            'pages' => ['required', 'integer', 'min:1'],
        ]);

        $data = $this->buildLabelsData((int) $validated['initialorder'], (int) $validated['pages']);

        return Inertia::render('app/label-printing/print-labels', [
            'data' => $data,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        return $this->print($request);
    }
}
