<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\ScheduleRequest;
use App\Models\App\Customer;
use App\Models\App\Schedule;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    private function authorizeSchedulesAccess(): void
    {
        abort_unless(Auth::user()?->hasPermission('schedules'), 403);
    }

    private function canManageSchedules(): bool
    {
        $user = Auth::user();

        return $user?->hasPermission('schedules') && ! $user->isTechnician();
    }

    private function canAccessSchedule(Schedule $schedule): bool
    {
        $user = Auth::user();

        if (! $user?->hasPermission('schedules')) {
            return false;
        }

        if (! $user->isTechnician()) {
            return true;
        }

        return (int) $schedule->user_id === (int) $user->id;
    }

    private function scopeSchedulesQuery($query)
    {
        $user = Auth::user();

        if ($user?->isTechnician()) {
            $query->where('user_id', $user->id);
        }

        return $query;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorizeSchedulesAccess();

        $status = $request->status;
        $search = $request->search;

        $query = $this->scopeSchedulesQuery(Schedule::query())->orderBy('id', 'DESC');

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('service', 'like', '%'.$search.'%')
                    ->orWhereHas('customer', function ($subQuery) use ($search) {
                        $subQuery->where('name', 'like', "%$search%")
                            ->orWhere('cpfcnpj', 'like', '%'.$search.'%');
                    });
            });
        }
        $schedules = $query->with('user', 'customer')->paginate(11)->withQueryString();

        return Inertia::render('app/schedules/index', [
            'schedules' => $schedules,
            'search' => $search,
            'status' => $status,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        abort_unless($this->canManageSchedules(), 403);

        $customers = Customer::get();
        $technicals = User::where('roles', 3)->orWhere('roles', 1)->where('status', 1)->get();

        return Inertia::render('app/schedules/create-schedule', ['customers' => $customers, 'technicals' => $technicals]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ScheduleRequest $request): RedirectResponse
    {
        abort_unless($this->canManageSchedules(), 403);

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
        abort_unless($this->canAccessSchedule($schedule), 403);

        $customers = Customer::get();
        $technicals = User::where('roles', 3)->orWhere('roles', 1)->where('status', 1)->get();

        return Inertia::render('app/schedules/edit-schedule', [
            'schedule' => $schedule,
            'customers' => $customers,
            'technicals' => $technicals,
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Schedule $schedule, Request $request)
    {
        abort_unless($this->canAccessSchedule($schedule), 403);

        return redirect()->route('app.schedules.show', [
            'schedule' => $schedule->id,
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ScheduleRequest $request, Schedule $schedule): RedirectResponse
    {
        abort_unless($this->canAccessSchedule($schedule), 403);

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
        abort_unless($this->canManageSchedules() && $this->canAccessSchedule($schedule), 403);

        $schedule->delete();

        return redirect()->route('app.schedules.index')->with('success', 'Agenda excluida com sucesso');
    }
}
