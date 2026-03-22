"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/api";
import { ArrowLeft, Plus, Trash2, Edit2, Loader2, Check } from "lucide-react";

export default function SettingsClient() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [savedQueries, setSavedQueries] = useState<any[]>([]);
    
    // New User State
    const [showUserModal, setShowUserModal] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingUser, setSavingUser] = useState(false);

    // Assignment state
    const [showAssignModal, setShowAssignModal] = useState<any>(null); // holds the active saved query
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [savingAssign, setSavingAssign] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const current = await fetchWithAuth("/users/me");
            if (!current.is_admin) {
                router.push("/dashboard");
                return;
            }

            const [uData, qData] = await Promise.all([
                fetchWithAuth("/users/"),
                fetchWithAuth("/saved-queries/")
            ]);
            setUsers(uData);
            setSavedQueries(qData);
        } catch (err) {
            console.log(err);
            router.push("/login");
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingUser(true);
        try {
            const resp = await fetchWithAuth("/users/", {
                method: "POST",
                body: JSON.stringify({ email: newEmail, password: newPassword })
            });
            setUsers([...users, resp]);
            setShowUserModal(false);
            setNewEmail("");
            setNewPassword("");
        } catch (err) {
            alert("Failed to create user");
        } finally {
            setSavingUser(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await fetchWithAuth(`/users/${id}`, { method: "DELETE" });
            setUsers(users.filter(u => (u._id || u.id) !== id));
        } catch (err) {
            alert("Failed to delete user");
        }
    };

    const openAssignModal = (query: any) => {
        setShowAssignModal(query);
        setSelectedUsers(query.assigned_users || []);
    };

    const toggleUserAssign = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSaveAssignments = async () => {
        if (!showAssignModal) return;
        setSavingAssign(true);
        try {
            const qId = showAssignModal._id || showAssignModal.id;
            const updated = await fetchWithAuth(`/saved-queries/${qId}/assign`, {
                method: "PUT",
                body: JSON.stringify({ assigned_users: selectedUsers })
            });
            setSavedQueries(savedQueries.map(q => (q._id || q.id) === qId ? updated : q));
            setShowAssignModal(null);
        } catch (err) {
            alert("Failed to assign");
        } finally {
            setSavingAssign(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b1120] text-foreground p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                
                <header className="flex items-center gap-4">
                    <button onClick={() => router.push("/dashboard")} className="p-2 hover:bg-secondary rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-3xl font-bold">Admin Settings</h1>
                </header>

                {/* Users Section */}
                <section className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Standard Users</h2>
                        <button onClick={() => setShowUserModal(true)} className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add User
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-secondary-foreground border-b border-border">
                                <tr>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id || u.id} className="border-b border-border/50">
                                        <td className="py-3 px-4">{u.email}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${u.is_admin ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                                                {u.is_admin ? "Admin" : "Standard"}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {!u.is_admin && (
                                                <button onClick={() => handleDeleteUser(u._id || u.id)} className="text-destructive hover:opacity-80 p-1">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-6 text-secondary-foreground">No users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Saved Queries Routing Settings */}
                <section className="bg-card border border-border rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-6">Dashboard Access Routing</h2>
                    <p className="text-secondary-foreground text-sm mb-4">Assign saved queries to standard users, which curates their dashboard.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedQueries.map(q => (
                            <div key={q._id || q.id} className="border border-border rounded-lg p-4 flex flex-col items-start justify-between">
                                <span className="font-semibold">{q.name}</span>
                                <span className="text-xs text-secondary-foreground mt-1 bg-secondary/30 px-2 py-1 rounded">Visual: {q.visualization_type}</span>
                                <div className="mt-4 flex items-center justify-between w-full">
                                    <span className="text-xs text-primary">{q.assigned_users?.length || 0} user(s) assigned</span>
                                    <button onClick={() => openAssignModal(q)} className="text-xs bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded transition">
                                        Manage Access
                                    </button>
                                </div>
                            </div>
                        ))}
                        {savedQueries.length === 0 && (
                            <p className="text-secondary-foreground">No saved queries yet.</p>
                        )}
                    </div>
                </section>

            </div>

            {/* Modals */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-sm rounded-xl border border-border p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4">Create Standard User</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <input required type="email" placeholder="Email" className="input-field" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                            <input required minLength={6} type="password" placeholder="Password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setShowUserModal(false)} className="px-4 py-2 text-secondary-foreground hover:bg-secondary rounded">Cancel</button>
                                <button type="submit" disabled={savingUser} className="btn-primary">
                                    {savingUser ? "Saving..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showAssignModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-xl border border-border p-6 shadow-xl">
                        <h2 className="text-lg font-bold mb-4">Assign "{showAssignModal.name}"</h2>
                        <div className="space-y-2 mb-6 max-h-[40vh] overflow-y-auto">
                            {users.filter(u => !u.is_admin).map(u => (
                                <button
                                    key={u._id || u.id}
                                    onClick={() => toggleUserAssign(u._id || u.id)}
                                    className={`w-full text-left p-3 rounded border flex items-center justify-between transition ${selectedUsers.includes(u._id || u.id) ? 'border-primary bg-primary/10' : 'border-border hover:bg-secondary'}`}
                                >
                                    <span>{u.email}</span>
                                    {selectedUsers.includes(u._id || u.id) && <Check className="text-primary w-4 h-4" />}
                                </button>
                            ))}
                            {users.filter(u => !u.is_admin).length === 0 && (
                                <p className="text-secondary-foreground">No standard users exist yet.</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 border-t border-border pt-4">
                            <button type="button" onClick={() => setShowAssignModal(null)} className="px-4 py-2 text-secondary-foreground hover:bg-secondary rounded">Cancel</button>
                            <button type="button" onClick={handleSaveAssignments} disabled={savingAssign} className="btn-primary">
                                {savingAssign ? "Saving..." : "Save Route"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
