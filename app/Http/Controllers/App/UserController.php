<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    private function authorizeUsersViewAccess(): void
    {
        $authUser = Auth::user();
        abort_unless($authUser?->hasPermission('users') || $authUser?->hasPermission('users.view'), 403);
    }

    private function authorizeUsersCreateAccess(): void
    {
        $authUser = Auth::user();
        abort_unless($authUser?->hasPermission('users') || $authUser?->hasPermission('users.create'), 403);
    }

    private function authorizeUsersUpdateAccess(): void
    {
        $authUser = Auth::user();
        abort_unless($authUser?->hasPermission('users') || $authUser?->hasPermission('users.update'), 403);
    }

    private function authorizeUsersDeleteAccess(): void
    {
        $authUser = Auth::user();
        abort_unless($authUser?->hasPermission('users') || $authUser?->hasPermission('users.delete'), 403);
    }

    private function canOperatorManageRole(mixed $role): bool
    {
        return in_array((int) $role, [User::ROLE_OPERATOR, User::ROLE_TECHNICIAN], true);
    }

    private function canManageTargetUser(User $target): bool
    {
        $authUser = Auth::user();
        if (! $authUser instanceof User) {
            return false;
        }

        if ($authUser->isRoot() || $authUser->isAdministrator()) {
            return true;
        }

        if ($authUser->isOperator()) {
            return $this->canOperatorManageRole($target->roles);
        }

        return false;
    }

    private function assertCreateRoleAllowed(mixed $role): void
    {
        $authUser = Auth::user();
        if ($authUser instanceof User && $authUser->isOperator()) {
            abort_unless($this->canOperatorManageRole($role), 403);
        }
    }

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
        $this->authorizeUsersViewAccess();

        $search = $request->search;
        $query = $this->scopeUserListingByActor(User::query())->orderBy('id', 'DESC');
        if ($search) {
            $query->where('name', 'like', '%'.$search.'%');
        }
        $users = $query->paginate(11)->withQueryString();
        $firstAdminId = User::where('roles', 9)->orderBy('id', 'asc')->value('id');

        return Inertia::render('app/users/index', ['users' => $users, 'firstAdminId' => $firstAdminId, 'search' => $search]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorizeUsersCreateAccess();

        return Inertia::render('app/users/create-user');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request): RedirectResponse
    {
        $this->authorizeUsersCreateAccess();

        $data = $request->all();
        $request->validated();
        $this->assertCreateRoleAllowed($data['roles'] ?? null);
        $data['password'] = Hash::make($request->password);
        $data['user_number'] = User::exists() ? User::latest()->first()->user_number + 1 : 1;
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
        $this->authorizeUsersViewAccess();
        abort_unless($this->canManageTargetUser($user), 403);

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
        $this->authorizeUsersUpdateAccess();
        abort_unless($this->canManageTargetUser($user), 403);

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
        $this->authorizeUsersUpdateAccess();
        abort_unless($this->canManageTargetUser($user), 403);

        $data = $request->all();
        $request->validated();
        $this->assertCreateRoleAllowed($data['roles'] ?? null);
        $data['password'] = $request->password ? Hash::make($request->password) : $user->password;
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
        $this->authorizeUsersDeleteAccess();
        abort_unless($this->canManageTargetUser($user), 403);

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
