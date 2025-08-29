<?php

namespace App\Http\Controllers\App;

use App\Models\App\Part;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PartController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $query = Part::orderBy('id', 'DESC');
        if ($search) {
            $query->where('name', 'like', '%' . $search . '%')
            ->orWhere('part_number', 'like', '%' . $search . '%');
        }
        $parts = $query->paginate(12);
        return Inertia::render('app/o', ['parts' => $parts]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Part $part)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Part $part)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Part $part)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Part $part)
    {
        //
    }
}
