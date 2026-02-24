"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import Table from "@/components/Table";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "seller";
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers(prev => prev.filter(user => user._id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-600 text-lg font-semibold min-h-screen">
        Loading users...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Users Management</h1>

        <Table
          headers={["Name", "Email", "Role", "Actions"]}
          data={users}
          renderRow={(user, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-6 py-4">{user.name}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4 capitalize">{user.role}</td>
              <td className="px-6 py-4 space-x-2">
                <button
                  onClick={() => deleteUser(user._id)}
                  disabled={deletingId === user._id}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId === user._id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );
}