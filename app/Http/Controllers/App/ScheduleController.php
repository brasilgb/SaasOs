<?php

namespace App\Http\Controllers\App;

use App\Models\App\Schedule;
use App\Http\Controllers\Controller;
use App\Http\Requests\ScheduleRequest;
use App\Models\App\Customer;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->get('q');
        $sdate = $request->get('dt');
        $status = $request->get('st');
        $clid = $request->get('cl');

        $query = Schedule::orderBy('id', 'DESC');

        if ($sdate) {
            $query->whereDate('schedules', $sdate);
        }
        if ($status) {
            $query->where('status', 'like', "%$status%");
        }
        if ($clid) {
            $query->where('customer_id', 'like', "%$clid%");
        }
        if ($search) {
            $query = Schedule::where(function ($query) use ($search) {
                $query->where('id', 'like', "%$search%")
                    ->orWhere('service', 'like', "%$search%");
            })
                ->orWhereHas('customer', function ($query) use ($search) {
                    $query->where('name', 'like', "%$search%");
                })
                ->orWhereHas('user', function ($query) use ($search) {
                    $query->where('name', 'like', "%$search%");
                });
        }
        $schedules = $query->with('user')->with('customer')->paginate(12);

        return Inertia::render('app/schedules/index', [
            'schedules' => $schedules,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $customers = Customer::get();
        $technicals = User::where('roles', 3)->orWhere('roles', 1)->where('is_active', 1)->get();
        return Inertia::render('app/schedules/create-schedule', ['customers' => $customers, 'technicals' => $technicals]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ScheduleRequest $request): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $data['schedules_number'] = Schedule::exists() ? Schedule::latest()->first()->schedules_number + 1 : 1;
        Schedule::create($data);
        return redirect()->route('app.schedules.index')->with('success', 'Agenda cadastrada com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(Schedule $schedule)
    {
        $customers = Customer::get();
        $technicals = User::where('roles', 3)->orWhere('roles', 1)->where('is_active', 1)->get();
        return Inertia::render('app/schedules/edit-schedule', ['schedule' => $schedule, 'customers' => $customers, 'technicals' => $technicals]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Schedule $schedule)
    {
        return redirect()->route('app.schedules.show', ['schedule' => $schedule->id]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ScheduleRequest $request, Schedule $schedule): RedirectResponse
    {
        $data = $request->all();
        $request->validated();
        $schedule->update($data);
        return redirect()->route('app.schedules.show', ['schedule' => $schedule->id])->with('success', 'Agenda editada com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Schedule $schedule)
    {
        $schedule->delete();
        return redirect()->route('app.schedules.index')->with('success', 'Agenda excluida com sucesso');
    }
}
