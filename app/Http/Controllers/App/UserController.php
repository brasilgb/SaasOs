<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use App\Support\TenantSequence;
use Inertia\Inertia;

class UserController extends Controller
{
    private function scopeUserListingByActor($query)
    {
        $authUser = Auth::user();
        if ($authUser instanceof User && $authUser->isOperator()) {
            $query->whereIn('roles', [User::ROLE_OPERATOR, User::ROLE_TECHNICIAN]);
        }

        return $query;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', User::class);

        $search = $request->search;
        $query = $this->scopeUserListingByActor(User::query())->orderBy('id', 'DESC');
        if ($search) {
            $query->where('name', 'like', '%'.$search.'%');
        }
        $users = $query->paginate(11)->withQueryString();
        $firstAdminId = User::where('roles', User::ROLE_ROOT_APP)->orderBy('id', 'asc')->value('id');

        return Inertia::render('app/users/index', ['users' => $users, 'firstAdminId' => $firstAdminId, 'search' => $search]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', User::class);

        return Inertia::render('app/users/create-user');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request): RedirectResponse
    {
        $this->authorize('create', User::class);

        $data = $request->all();
        $request->validated();
        Gate::authorize('assignRole', [User::class, $data['roles'] ?? null]);
        $data['password'] = Hash::make($request->password);
        $data['tenant_id'] = Auth::user()->tenant_id;
        $data['user_number'] = TenantSequence::next(User::class, 'user_number');
        Model::reguard();
        User::create($data);
        Model::unguard();

        return redirect()->route('app.users.index')->with('success', 'Usuário cadastrado com sucesso');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user, Request $request)
    {
        $this->authorize('view', $user);

        return Inertia::render('app/users/edit-user', [
            'user' => $user,
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user, Request $request)
    {
        $this->authorize('update', $user);

        return redirect()->route('app.users.show', [
            'user' => $user->id,
            'page' => $request->page,
            'search' => $request->search,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $this->authorize('update', $user);

        $data = $request->all();
        $request->validated();
        Gate::authorize('assignRole', [User::class, $data['roles'] ?? null]);
        $data['password'] = $request->password ? Hash::make($request->password) : $user->password;
        $data['tenant_id'] = $user->tenant_id;
        Model::reguard();
        $user->update($data);
        Model::unguard();

        return redirect()->route('app.users.show', ['user' => $user->id])->with('success', 'Usuário editado com sucesso');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $this->authorize('delete', $user);

        $user->delete();

        return redirect()->route('app.users.index')->with('success', 'Usuário excluido com sucesso!');
    }

    public function loginuser(Request $request)
    {
        $loginUserData = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|min:8',
        ]);
        $user = User::where('email', $loginUserData['email'])->first();
        if (! $user || ! Hash::check($loginUserData['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'result' => [],
            ], 401);
        }
        $token = $user->createToken($user->name.'-AuthToken')->plainTextToken;

        return response()->json([
            'success' => true,
            'access_token' => $token,
            'result' => $user,
        ]);
    }

    public function logoutuser()
    {
        Auth::user()->tokens()->delete();

        return response()->json([
            'message' => 'logged out',
        ]);
    }
}
