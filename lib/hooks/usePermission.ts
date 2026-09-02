// lib/hooks/usePermission.ts

import { useMemo } from "react";

/**
 * Validates whether the active admin profile contains the required authority token
 */
export function usePermission(userPermissions: string[] = [], isSuperAdmin: boolean = false) {
  return useMemo(() => {
    return {
      can: (requiredPermission: string): boolean => {
        if (isSuperAdmin) return true;
        if (!requiredPermission) return true;
        return userPermissions.includes(requiredPermission);
      },
      canAny: (requiredPermissions: string[]): boolean => {
        if (isSuperAdmin) return true;
        return requiredPermissions.some((perm) => userPermissions.includes(perm));
      },
    };
  }, [userPermissions, isSuperAdmin]);
}