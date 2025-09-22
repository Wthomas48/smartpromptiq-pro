/**
 * Safe User Component Patterns - Implements recommended patterns for handling user data
 *
 * These components demonstrate safe handling of user roles and permissions
 * following the pattern provided by the user to prevent map crashes.
 */

import React from 'react';

interface User {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string | { name?: string };
  roles?: Array<string | { id?: string; name?: string }>;
  permissions?: Array<string | { id?: string; name?: string }>;
}

interface UserProfileProps {
  user?: User | null;
}

// ✅ SAFE USER PROFILE: As requested by user - demonstrates safe array handling
export const SafeUserProfile: React.FC<UserProfileProps> = ({ user }) => {
  // Safe array extraction with fallback to empty arrays
  const roles = user?.roles || [];
  const permissions = user?.permissions || [];

  if (!user) {
    return (
      <div className="text-gray-500">
        No user data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">User Profile</h2>
        <p className="text-gray-600">
          {user.firstName} {user.lastName} ({user.email})
        </p>
      </div>

      {/* Safe single role display */}
      {user.role && (
        <div>
          <h3 className="font-medium">Primary Role:</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
            {typeof user.role === 'string' ? user.role : user.role.name || 'Unknown'}
          </span>
        </div>
      )}

      {/* Safe roles array handling - exactly as user requested */}
      {roles.length > 0 && (
        <div>
          <h3 className="font-medium">Roles:</h3>
          <div className="flex flex-wrap gap-2">
            {roles.map((role, index) => (
              <span
                key={role?.id || role?.name || role || index}
                className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
              >
                {typeof role === 'string' ? role : role?.name || 'Unknown Role'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Safe permissions array handling - exactly as user requested */}
      {permissions.length > 0 && (
        <div>
          <h3 className="font-medium">Permissions:</h3>
          <div className="flex flex-wrap gap-2">
            {permissions.map((permission, index) => (
              <span
                key={permission?.id || permission?.name || permission || index}
                className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm"
              >
                {typeof permission === 'string' ? permission : permission?.name || 'Unknown Permission'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Show empty state when no roles or permissions */}
      {roles.length === 0 && permissions.length === 0 && !user.role && (
        <div className="text-gray-500 text-sm">
          No roles or permissions assigned
        </div>
      )}
    </div>
  );
};

// ✅ SAFE ADMIN BADGE: Demonstrates safe admin checking
export const SafeAdminBadge: React.FC<UserProfileProps> = ({ user }) => {
  const isUserAdmin = () => {
    if (!user) return false;

    // Safe single role check
    if (user.role) {
      return user.role === 'admin' || user.role === 'ADMIN' || user.role?.name === 'admin';
    }

    // Safe multiple roles check
    const roles = user.roles || [];
    return roles.some(role => {
      if (typeof role === 'string') return role === 'admin' || role === 'ADMIN';
      if (role && typeof role === 'object') return role.name === 'admin' || role.name === 'ADMIN';
      return false;
    });
  };

  if (!isUserAdmin()) return null;

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
      🛡️ Admin
    </span>
  );
};

// ✅ SAFE PERMISSIONS CHECK: Component that safely checks for specific permissions
interface PermissionGuardProps {
  user?: User | null;
  requiredPermission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SafePermissionGuard: React.FC<PermissionGuardProps> = ({
  user,
  requiredPermission,
  children,
  fallback = null
}) => {
  const hasPermission = () => {
    if (!user) return false;

    const permissions = user.permissions || [];
    return permissions.some(permission => {
      if (typeof permission === 'string') {
        return permission === requiredPermission;
      }
      if (permission && typeof permission === 'object') {
        return permission.name === requiredPermission;
      }
      return false;
    });
  };

  return hasPermission() ? <>{children}</> : <>{fallback}</>;
};

// ✅ SAFE ROLE GUARD: Component that safely checks for specific roles
interface RoleGuardProps {
  user?: User | null;
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SafeRoleGuard: React.FC<RoleGuardProps> = ({
  user,
  allowedRoles,
  children,
  fallback = null
}) => {
  const hasAllowedRole = () => {
    if (!user) return false;

    // Check single role
    if (user.role) {
      const roleValue = typeof user.role === 'string' ? user.role : user.role?.name;
      if (roleValue && allowedRoles.includes(roleValue)) return true;
    }

    // Check roles array
    const roles = user.roles || [];
    return roles.some(role => {
      const roleValue = typeof role === 'string' ? role : role?.name;
      return roleValue && allowedRoles.includes(roleValue);
    });
  };

  return hasAllowedRole() ? <>{children}</> : <>{fallback}</>;
};

// ✅ EXAMPLE USAGE COMPONENT: Shows how to use all safe patterns together
export const ExampleSafeUserPage: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">User Dashboard</h1>
        <SafeAdminBadge user={user} />
      </div>

      <SafeUserProfile user={user} />

      <SafeRoleGuard
        user={user}
        allowedRoles={['admin', 'ADMIN', 'moderator']}
        fallback={<div className="text-gray-500">You do not have administrative access.</div>}
      >
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-medium text-yellow-800">Admin Panel Access</h3>
          <p className="text-yellow-700">You have administrative privileges.</p>
        </div>
      </SafeRoleGuard>

      <SafePermissionGuard
        user={user}
        requiredPermission="create_user"
        fallback={<div className="text-gray-500">User creation not permitted.</div>}
      >
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Create New User
        </button>
      </SafePermissionGuard>
    </div>
  );
};

export default {
  SafeUserProfile,
  SafeAdminBadge,
  SafePermissionGuard,
  SafeRoleGuard,
  ExampleSafeUserPage
};