"use client";

import React, { useState } from "react";
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  X,
} from "lucide-react";
import { useUsersStore } from "@/lib/user-store";
import { addAuditLog } from "@/lib/audit-store";
import type { User, UserRole, UserInput } from "@/types/user";

export default function UsersTab() {
  const {
    users,
    activeUser,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    setActiveUser,
  } = useUsersStore();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState<UserInput>({
    name: "",
    email: "",
    phone: "",
    role: "Cashier",
    active: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "Cashier",
      active: true,
    });
    setFormError(null);
    setModalMode("add");
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      active: user.active,
    });
    setFormError(null);
    setModalMode("edit");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingUser(null);
    setFormError(null);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("A valid email address is required.");
      return;
    }

    if (modalMode === "add") {
      const created = addUser(formData);
      addAuditLog({
        actor: `${activeUser.role} (${activeUser.name})`,
        action: "User Created",
        target: `User: ${created.name}`,
        details: `Assigned role ${created.role} (${created.email})`,
      });
    } else if (modalMode === "edit" && editingUser) {
      updateUser(editingUser.id, formData);
      addAuditLog({
        actor: `${activeUser.role} (${activeUser.name})`,
        action: "User Updated",
        target: `User: ${formData.name}`,
        details: `Updated role to ${formData.role}, active: ${formData.active}`,
      });
    }

    handleCloseModal();
  };

  const handleToggleStatus = (user: User) => {
    toggleUserStatus(user.id);
    addAuditLog({
      actor: `${activeUser.role} (${activeUser.name})`,
      action: user.active ? "User Deactivated" : "User Activated",
      target: `User: ${user.name}`,
      details: `Changed status to ${user.active ? "Inactive" : "Active"}`,
    });
  };

  const handleDelete = (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      const result = deleteUser(user.id);
      if (!result.success) {
        alert(result.reason);
        return;
      }
      addAuditLog({
        actor: `${activeUser.role} (${activeUser.name})`,
        action: "User Deleted",
        target: `User: ${user.name}`,
        details: `Removed account ID: ${user.id}`,
      });
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "Admin":
        return "bg-[#f5eefb] text-[#7a48a3] border-[#e4d4f3]";
      case "Manager":
        return "bg-[#edf2f7] text-[#3b6088] border-[#d0dbe6]";
      case "Cashier":
        return "bg-[#edf6ee] text-[#3f7a4e] border-[#d1e7d4]";
      case "Staff":
        return "bg-[#fcf0e4] text-[#b26829] border-[#f5deca]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#2b1b12]">
            User & Role Management
          </h3>
          <p className="mt-1 text-xs text-[#8c7a6c]">
            Administer staff profiles, role privileges (Admin, Manager, Cashier, Staff), and credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl bg-[#2b1b12] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#432d20]"
        >
          <UserPlus size={15} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Role Hierarchy Overview Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#e4d4f3] bg-[#fbf8fe] p-3">
          <p className="text-xs font-bold text-[#7a48a3]">Admin</p>
          <p className="text-[10px] text-[#8c7a6c]">Full system & user access</p>
        </div>
        <div className="rounded-xl border border-[#d0dbe6] bg-[#f7f9fb] p-3">
          <p className="text-xs font-bold text-[#3b6088]">Manager</p>
          <p className="text-[10px] text-[#8c7a6c]">Store, menu, inventory, reports</p>
        </div>
        <div className="rounded-xl border border-[#d1e7d4] bg-[#f8fbf8] p-3">
          <p className="text-xs font-bold text-[#3f7a4e]">Cashier</p>
          <p className="text-[10px] text-[#8c7a6c]">POS sales, orders & receipts</p>
        </div>
        <div className="rounded-xl border border-[#f5deca] bg-[#fdfaf7] p-3">
          <p className="text-xs font-bold text-[#b26829]">Staff</p>
          <p className="text-[10px] text-[#8c7a6c]">Basic register order view</p>
        </div>
      </div>

      {/* Search & Role Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b897b]"
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] pl-10 pr-4 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3 text-xs font-semibold text-[#2b1b12] outline-none transition focus:border-[#c98b5b]"
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Cashier">Cashier</option>
          <option value="Staff">Staff</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e8dfd4] bg-white shadow-[0_4px_20px_rgba(72,48,32,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#f0e8df] bg-[#faf7f3] text-[#8c7a6c]">
                <th className="py-3.5 pl-4 font-semibold">User Details</th>
                <th className="py-3.5 font-semibold">Role</th>
                <th className="py-3.5 font-semibold">Status</th>
                <th className="py-3.5 font-semibold">Created</th>
                <th className="py-3.5 font-semibold">Last Active</th>
                <th className="py-3.5 pr-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5efe9]">
              {filteredUsers.map((user) => {
                const isCurrentActive = activeUser.id === user.id;

                return (
                  <tr
                    key={user.id}
                    className="group transition hover:bg-[#faf7f3]"
                  >
                    <td className="py-3.5 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ead8c7] text-xs font-bold text-[#6d4730]">
                          {user.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#2b1b12]">{user.name}</p>
                            {isCurrentActive && (
                              <span className="rounded-full bg-[#2b1b12] px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#8c7a6c]">
                            {user.email} • {user.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span
                        className={`inline-block rounded-lg border px-2.5 py-1 text-[11px] font-bold ${getRoleBadge(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition ${
                          user.active
                            ? "bg-[#edf6ee] text-[#3f7a4e] hover:bg-[#d8eedb]"
                            : "bg-[#fbeaea] text-[#c23b3b] hover:bg-[#f6d5d5]"
                        }`}
                        title="Click to toggle active/inactive"
                      >
                        {user.active ? (
                          <>
                            <CheckCircle size={11} />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={11} />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 text-[#8c7a6c]">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 text-[#8c7a6c]">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-[#c98b5b]" />
                        <span>
                          {new Date(user.lastActiveAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isCurrentActive && (
                          <button
                            type="button"
                            onClick={() => setActiveUser(user)}
                            className="rounded-lg border border-[#e5dbd0] px-2 py-1 text-[11px] font-medium text-[#6d5b4e] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
                            title="Switch demo active session to this user"
                          >
                            Switch To
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(user)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8c7a6c] transition hover:bg-[#efe2d5] hover:text-[#2b1b12]"
                          title="Edit user"
                        >
                          <Edit2 size={13} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8c7a6c] transition hover:bg-[#fbeaea] hover:text-[#c23b3b]"
                          title="Delete user"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[#e8dfd4] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#f0e8df] pb-3">
              <h4 className="text-base font-bold text-[#2b1b12]">
                {modalMode === "add" ? "Add New Staff User" : "Edit Staff User"}
              </h4>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-[#8c7a6c] hover:bg-[#faf7f3] hover:text-[#2b1b12]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-xl bg-[#fbeaea] p-3 text-xs font-semibold text-[#c23b3b]">
                  {formError}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#2b1b12]">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Nusrat Jahan"
                  className="mt-1 h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#2b1b12]">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="e.g. nusrat@brewpos.com"
                  className="mt-1 h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#2b1b12]">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="e.g. +880 1913-000003"
                  className="mt-1 h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#2b1b12]">
                  Assigned System Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserRole,
                    })
                  }
                  className="mt-1 h-10 w-full rounded-xl border border-[#e5dbd0] bg-[#faf7f3] px-3.5 text-xs font-semibold text-[#2b1b12] outline-none transition focus:border-[#c98b5b] focus:bg-white"
                >
                  <option value="Admin">Admin (Full System Access)</option>
                  <option value="Manager">Manager (Operations, Inventory, Reports)</option>
                  <option value="Cashier">Cashier (POS Register & Orders)</option>
                  <option value="Staff">Staff (View Only Register)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="user-active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData({ ...formData, active: e.target.checked })
                  }
                  className="h-4 w-4 rounded accent-[#c98b5b]"
                />
                <label
                  htmlFor="user-active"
                  className="text-xs font-medium text-[#2b1b12]"
                >
                  Account is active and permitted to log in
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0e8df]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-[#e5dbd0] px-4 py-2 text-xs font-semibold text-[#66574d] hover:bg-[#faf7f3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#2b1b12] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#432d20]"
                >
                  {modalMode === "add" ? "Create User" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
