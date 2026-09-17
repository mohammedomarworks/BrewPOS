"use client";

import { useSyncExternalStore, useEffect } from "react";
import type { User, UserRole, Permission, UserInput } from "@/types/user";

const USERS_STORAGE_KEY = "brewpos_users_v1";
const ACTIVE_USER_STORAGE_KEY = "brewpos_active_user_v1";
const USERS_EVENT = "brewpos:users-updated";

// ----------------------------------------------------------------------
// Permissions Matrix
// ----------------------------------------------------------------------

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Admin: [
    "manage_settings",
    "manage_users",
    "view_reports",
    "manage_discounts",
    "manage_inventory",
    "manage_menu",
    "access_pos",
    "manage_orders",
  ],
  Manager: [
    "manage_settings",
    "view_reports",
    "manage_discounts",
    "manage_inventory",
    "manage_menu",
    "access_pos",
    "manage_orders",
  ],
  Cashier: ["access_pos", "manage_orders"],
  Staff: ["access_pos"],
};

/**
 * Check if a user or role has a specific permission.
 */
export function can(
  userOrRole: User | UserRole | undefined | null,
  permission: Permission
): boolean {
  if (!userOrRole) return false;
  const role: UserRole =
    typeof userOrRole === "string" ? userOrRole : userOrRole.role;

  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

// ----------------------------------------------------------------------
// Initial Seed Users
// ----------------------------------------------------------------------

export const initialUsers: User[] = [
  {
    id: "USR-001",
    name: "Mohammed Omar",
    email: "omar@brewpos.com",
    phone: "+880 1711-000001",
    role: "Admin",
    active: true,
    createdAt: "2026-08-01T08:00:00.000Z",
    lastActiveAt: "2026-09-17T18:30:00.000Z",
  },
  {
    id: "USR-002",
    name: "Sadid Ahmed",
    email: "sadid@brewpos.com",
    phone: "+880 1812-000002",
    role: "Manager",
    active: true,
    createdAt: "2026-08-10T08:00:00.000Z",
    lastActiveAt: "2026-09-17T16:45:00.000Z",
  },
  {
    id: "USR-003",
    name: "Nusrat Jahan",
    email: "nusrat@brewpos.com",
    phone: "+880 1913-000003",
    role: "Cashier",
    active: true,
    createdAt: "2026-08-15T08:00:00.000Z",
    lastActiveAt: "2026-09-17T20:10:00.000Z",
  },
  {
    id: "USR-004",
    name: "Shihab Hossain",
    email: "shihab@brewpos.com",
    phone: "+880 1614-000004",
    role: "Staff",
    active: true,
    createdAt: "2026-09-01T08:00:00.000Z",
    lastActiveAt: "2026-09-17T12:15:00.000Z",
  },
];

// ----------------------------------------------------------------------
// In-Memory Cached Snapshot & Hydration Safety
// ----------------------------------------------------------------------

let usersSnapshot: User[] = initialUsers;
let activeUserSnapshot: User = initialUsers[0];
let isUsersHydrated = false;
let lastSavedUsersRaw: string | null = null;
const userSubscribers = new Set<() => void>();
let hasAddedUserWindowListeners = false;

function notifyUserSubscribers(): void {
  userSubscribers.forEach((callback) => {
    try {
      callback();
    } catch (err) {
      console.error("Error in user subscriber callback:", err);
    }
  });
}

export function hydrateUsers(): void {
  if (typeof window === "undefined" || isUsersHydrated) return;
  isUsersHydrated = true;

  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      lastSavedUsersRaw = null;
      usersSnapshot = initialUsers;
    } else {
      lastSavedUsersRaw = raw;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        usersSnapshot = parsed;
      }
    }

    const activeRaw = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (activeRaw) {
      const activeParsed = JSON.parse(activeRaw);
      if (activeParsed?.id) {
        const found = usersSnapshot.find((u) => u.id === activeParsed.id);
        if (found) {
          activeUserSnapshot = found;
        }
      }
    } else {
      activeUserSnapshot = usersSnapshot[0] || initialUsers[0];
    }

    notifyUserSubscribers();
  } catch (error) {
    console.error("Failed to read users from localStorage:", error);
    usersSnapshot = initialUsers;
  }
}

function handleUsersSyncEvent(e?: StorageEvent | Event): void {
  if (typeof window === "undefined") return;
  if (e && "key" in e && e.key !== USERS_STORAGE_KEY && e.key !== ACTIVE_USER_STORAGE_KEY) {
    return;
  }

  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw && raw !== lastSavedUsersRaw) {
      lastSavedUsersRaw = raw;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        usersSnapshot = parsed;
        notifyUserSubscribers();
      }
    }
  } catch (err) {
    console.error("Failed to sync users from storage:", err);
  }
}

function ensureUserWindowListeners(): void {
  if (typeof window === "undefined" || hasAddedUserWindowListeners) return;
  window.addEventListener(USERS_EVENT, handleUsersSyncEvent);
  window.addEventListener("storage", handleUsersSyncEvent);
  hasAddedUserWindowListeners = true;
}

export function getUsers(): User[] {
  if (typeof window !== "undefined" && !isUsersHydrated) {
    hydrateUsers();
  }
  return usersSnapshot;
}

export function getActiveUser(): User {
  if (typeof window !== "undefined" && !isUsersHydrated) {
    hydrateUsers();
  }
  return activeUserSnapshot;
}

export function saveUsers(users: User[]): void {
  usersSnapshot = users;
  isUsersHydrated = true;

  if (typeof window !== "undefined") {
    try {
      const raw = JSON.stringify(users);
      lastSavedUsersRaw = raw;
      localStorage.setItem(USERS_STORAGE_KEY, raw);
      window.dispatchEvent(new CustomEvent(USERS_EVENT));
    } catch (error) {
      console.error("Failed to save users to localStorage:", error);
    }
  }

  notifyUserSubscribers();
}

export function setActiveUser(user: User): void {
  activeUserSnapshot = user;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(user));
      window.dispatchEvent(new CustomEvent(USERS_EVENT));
    } catch (error) {
      console.error("Failed to set active user:", error);
    }
  }
  notifyUserSubscribers();
}

export function addUser(data: UserInput): User {
  const current = getUsers();
  const nextSeq = current.length + 1;
  const id = `USR-${String(nextSeq).padStart(3, "0")}`;

  const newUser: User = {
    id,
    name: data.name.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    role: data.role,
    active: data.active ?? true,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  const updated = [...current, newUser];
  saveUsers(updated);
  return newUser;
}

export function updateUser(id: string, updates: Partial<UserInput>): boolean {
  const current = getUsers();
  let found = false;

  const updated = current.map((u) => {
    if (u.id === id) {
      found = true;
      return {
        ...u,
        ...updates,
        name: updates.name ? updates.name.trim() : u.name,
        email: updates.email ? updates.email.trim() : u.email,
        phone: updates.phone ? updates.phone.trim() : u.phone,
        role: updates.role ?? u.role,
        active: updates.active !== undefined ? updates.active : u.active,
      };
    }
    return u;
  });

  if (found) {
    saveUsers(updated);
    if (activeUserSnapshot.id === id) {
      const activeFound = updated.find((u) => u.id === id);
      if (activeFound) setActiveUser(activeFound);
    }
  }

  return found;
}

export function toggleUserStatus(id: string): boolean {
  const current = getUsers();
  let found = false;

  const updated = current.map((u) => {
    if (u.id === id) {
      found = true;
      return {
        ...u,
        active: !u.active,
      };
    }
    return u;
  });

  if (found) {
    saveUsers(updated);
  }
  return found;
}

export function deleteUser(id: string): { success: boolean; reason?: string } {
  const current = getUsers();
  const target = current.find((u) => u.id === id);

  if (!target) {
    return { success: false, reason: "User not found." };
  }

  // Prevent deleting the last Admin
  const adminCount = current.filter((u) => u.role === "Admin" && u.active).length;
  if (target.role === "Admin" && adminCount <= 1) {
    return {
      success: false,
      reason: "Cannot delete the last active administrator account.",
    };
  }

  const updated = current.filter((u) => u.id !== id);
  saveUsers(updated);

  if (activeUserSnapshot.id === id) {
    const nextActive = updated.find((u) => u.role === "Admin") || updated[0];
    if (nextActive) setActiveUser(nextActive);
  }

  return { success: true };
}

// ----------------------------------------------------------------------
// React useSyncExternalStore Hook for Users
// ----------------------------------------------------------------------

export function subscribeUsers(callback: () => void): () => void {
  userSubscribers.add(callback);
  ensureUserWindowListeners();
  queueMicrotask(() => {
    hydrateUsers();
  });

  return () => {
    userSubscribers.delete(callback);
  };
}

export function getUsersSnapshot(): User[] {
  return usersSnapshot;
}

export function getUsersServerSnapshot(): User[] {
  return initialUsers;
}

export function useUsersStore() {
  const users = useSyncExternalStore(
    subscribeUsers,
    getUsersSnapshot,
    getUsersServerSnapshot
  );

  useEffect(() => {
    hydrateUsers();
  }, []);

  return {
    users,
    activeUser: activeUserSnapshot,
    isLoaded: isUsersHydrated,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    setActiveUser,
    can: (permission: Permission) => can(activeUserSnapshot, permission),
  };
}
