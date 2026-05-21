<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        $users = User::paginate(10);
        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'roles' => 'nullable|array',
        ]);

        // ensure roles is an array
        $roles = $validated['roles'] ?? [];

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'roles' => $roles,
        ]);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        // Optional: prevent deleting self
        if (auth()->id() === $user->id) {
            return back()->with('error', 'Cannot delete yourself.');
        }

        $user->delete();
        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }

    public function storeBulk(Request $request)
    {
        $request->validate([
            'users' => 'required|array',
            'users.*.name' => 'required|string|max:255',
            'users.*.email' => 'required|email',
            'users.*.roles' => 'nullable|array',
        ]);

        $usersData = $request->input('users');
        $createdCount = 0;
        $skippedCount = 0;

        foreach ($usersData as $userData) {
            if (User::where('email', $userData['email'])->exists()) {
                $skippedCount++;
                continue;
            }

            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => bcrypt('password'), // default temporary password
                'roles' => $userData['roles'] ?? ['user'],
            ]);
            $createdCount++;
        }

        return redirect()->route('admin.users.index')->with('success', "Import complete: {$createdCount} new users created, {$skippedCount} skipped.");
    }

    public function export()
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=users_export.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $users = User::all();

        $callback = function() use ($users) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Name', 'Email', 'Roles', 'Created At']);

            foreach ($users as $user) {
                fputcsv($file, [
                    (string)$user->_id,
                    $user->name,
                    $user->email,
                    implode(', ', $user->roles ?? []),
                    $user->created_at ? $user->created_at->toDateTimeString() : ''
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
