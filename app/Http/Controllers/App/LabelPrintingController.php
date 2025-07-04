<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LabelPrintingController extends Controller
{
    public function index() {
        $labels = Order::orderBy("id", "DESC")->first();
        if($labels){
            $labels = Order::orderBy("id", "DESC")->first();
        }else{
            $labels = ['id' => 0];
        }
        return Inertia::render('app/label-printing/index', ['labels' => $labels]);
    }

    
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $initial = $request->get('initialorder');
        $final = $request->get('finalorder');
        $pages = $request->get('pages');

        // $etiquetas = $request->all();
        // dd($inicial, $final);
        $company = Company::first();
        for ($i = $initial; $i <= $final; $i++) {
            $data[] = [
                'order' => $i,
                'telephone' => $company->telephone,
                'company' => $company->shortname,
            ];
        }
        return Inertia::render('label-printing/print-labels', ['data' => $data]);
    }
}
