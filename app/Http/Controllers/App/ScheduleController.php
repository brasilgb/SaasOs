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
        $status = $request->get('status');
        $search = $request->search;
        $sdate = $request->get('dt');

        $query = Schedule::orderBy('id', 'DESC');

        if ($status) {
            $query->where('status', $status);
        }

        if ($sdate) {
            $query->whereDate('schedules', $sdate);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('service', 'like', '%' . $search . '%')
                    ->orWhereHas('customer', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%$search%")
                            ->orWhere('cpfcnpj', 'like', '%' . $search . '%');
                    });
            });
        }
        $schedules = $query->with('user', 'customer')->paginate(11)->withQueryString();

        return Inertia::render('app/schedules/index', [
            'schedules' => $schedules,
            'search' => $search
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $customers = Customer::get();
        $technicals = User::where('roles', 3)->orWhere('roles', 1)->where('status', 1)->get();
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
    public function show(Schedule $schedule, Request $request)
    {
        $customers = Customer::get();
        $technicals = User::where('roles', 3)->orWhere('roles', 1)->where('status', 1)->get();
        return Inertia::render('app/schedules/edit-schedule', [
            'schedule' => $schedule,
            'customers' => $customers,
            'technicals' => $technicals,
            'page' => $request->page,
            'search' => $request->search
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Schedule $schedule, Request $request)
    {
        return redirect()->route('app.schedules.show', [
            'schedule' => $schedule->id,
            'page' => $request->page,
            'search' => $request->search
        ]);
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
