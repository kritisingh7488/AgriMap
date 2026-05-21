<?php

namespace App\Traits;

trait HasRolesAndPermissions
{
    /**
     * Check if the user has a specific role.
     *
     * @param string|array $roles
     * @return bool
     */
    public function hasRole($roles)
    {
        if (is_string($roles)) {
            return in_array($roles, $this->roles ?? []);
        }

        if (is_array($roles)) {
            foreach ($roles as $role) {
                if ($this->hasRole($role)) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Assign a role to the user.
     *
     * @param string $role
     * @return $this
     */
    public function assignRole($role)
    {
        $roles = $this->roles ?? [];
        if (!in_array($role, $roles)) {
            $roles[] = $role;
            $this->roles = $roles;
            $this->save();
        }
        return $this;
    }

    /**
     * Check if the user has a specific permission.
     *
     * @param string $permission
     * @return bool
     */
    public function hasPermissionTo($permission)
    {
        return in_array($permission, $this->permissions ?? []);
    }

    /**
     * Give a permission to the user.
     *
     * @param string $permission
     * @return $this
     */
    public function givePermissionTo($permission)
    {
        $permissions = $this->permissions ?? [];
        if (!in_array($permission, $permissions)) {
            $permissions[] = $permission;
            $this->permissions = $permissions;
            $this->save();
        }
        return $this;
    }
}
