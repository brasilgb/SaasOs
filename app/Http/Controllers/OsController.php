<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\App\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OsController extends Controller
{
    public function index($token)
    {
        $order = Order::where('tracking_token', $token)->with('equipment')->with('customer')->firstOrFail();
        return Inertia::render('app/serviceorders/index', ['order' => $order]);
    }
}
