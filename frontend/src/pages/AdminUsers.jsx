import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Search, 
    Filter, 
    ShieldAlert, 
    ShieldCheck, 
    UserX, 
    UserCheck, 
    ChevronLeft, 
    ChevronRight, 
    Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminUsers, toggleUserRole } from '../services/adminService';
import axiosInstance from '../services/axiosInstance';

const AdminUsers = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    const { data: usersResp, isLoading } = useQuery({
        queryKey: ['adminUsers', page, search],
        queryFn: () => getAdminUsers({ page, search }),
    });

    const users = usersResp?.data || [];
    const meta = usersResp?.meta;

    const toggleStatusMutation = useMutation({
        mutationFn: (user) => {
            const endpoint = user.is_banned
                ? `/admin/users/${user.id}/unban`
                : `/admin/users/${user.id}/ban`;
            return axiosInstance.post(endpoint);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            toast.success('User status updated.');
        },
        onError: () => toast.error('Failed to update status.')
    });

    const toggleRoleMutation = useMutation({
        mutationFn: (id) => toggleUserRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            toast.success('User role updated.');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update role.')
    });

    if (isLoading) return (
        <div className="text-center font-black text-slate-200 animate-pulse text-4xl py-32 uppercase italic tracking-tighter">
            LOADING USERS...
        </div>
    );

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-4xl font-black font-headline tracking-tighter text-slate-900 uppercase italic leading-none">
                        User Management
                    </h2>
                    <p className="text-slate-400 font-body mt-2 text-sm uppercase tracking-widest font-bold opacity-60">
                        Manage user roles and access permissions.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white border border-slate-100 px-6 py-4 rounded-xl shadow-sm">
                    <Users className="w-5 h-5 text-slate-400" />
                    <div>
                        <p className="text-xl font-black text-slate-900 italic leading-none">{meta?.total || 0}</p>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Total Users</p>
                    </div>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 group">
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full bg-slate-50 border border-slate-100 px-10 py-3 rounded-lg text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                </div>
                <button className="flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-50 hover:bg-slate-900 hover:text-white transition-all text-slate-500 font-black uppercase tracking-widest text-xs border border-slate-100">
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse font-body">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                            <th className="py-5 px-6 w-12">
                                <input type="checkbox" className="rounded-sm border-slate-300 w-4 h-4 cursor-pointer" />
                            </th>
                            <th className="py-5 px-4">User</th>
                            <th className="py-5 px-4">Email</th>
                            <th className="py-5 px-4">Role</th>
                            <th className="py-5 px-4">Status</th>
                            <th className="py-5 px-4">Joined</th>
                            <th className="py-5 px-6 text-right w-48">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-20 text-center text-slate-300 font-black uppercase italic tracking-widest text-sm">
                                    No users found.
                                </td>
                            </tr>
                        )}
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                                
                                {/* Checkbox */}
                                <td className="py-4 px-6">
                                    <input type="checkbox" className="rounded-sm border-slate-200 w-4 h-4 cursor-pointer" />
                                </td>

                                {/* User */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 shrink-0 grayscale group-hover:grayscale-0 transition-all duration-500">
                                            <img
                                                src={`https://i.pravatar.cc/100?u=${user.id}`}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        </div>
                                        <div>
                                            <p className="font-headline font-black text-slate-900 tracking-tighter italic uppercase text-sm leading-tight">
                                                {user.name}
                                            </p>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                                                ID: #{user.id}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Email */}
                                <td className="py-4 px-4">
                                    <span className="text-xs text-slate-500 font-medium">{user.email}</span>
                                </td>

                                {/* Role */}
                                <td className="py-4 px-4">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                        user.role === 'admin'
                                            ? 'bg-slate-900 text-white border-slate-900'
                                            : 'bg-slate-50 text-slate-500 border-slate-100'
                                    }`}>
                                        {user.role}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${
                                            user.is_banned
                                                ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                                                : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]'
                                        }`} />
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${
                                            user.is_banned ? 'text-red-400' : 'text-emerald-600'
                                        }`}>
                                            {user.is_banned ? 'Banned' : 'Active'}
                                        </span>
                                    </div>
                                </td>

                                {/* Joined */}
                                <td className="py-4 px-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                </td>

                                {/* Actions */}
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {/* Ban / Unban */}
                                        <button
                                            onClick={() => toggleStatusMutation.mutate(user)}
                                            disabled={toggleStatusMutation.isPending}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                user.is_banned
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                                                    : 'bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white'
                                            }`}
                                        >
                                            {user.is_banned
                                                ? <><UserCheck className="w-3 h-3" /> Restore</>
                                                : <><UserX className="w-3 h-3" /> Ban</>
                                            }
                                        </button>

                                        {/* Role Toggle */}
                                        <button
                                            onClick={() => toggleRoleMutation.mutate(user.id)}
                                            disabled={toggleRoleMutation.isPending}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                                user.role === 'admin'
                                                    ? 'bg-slate-900 text-white border-slate-900 hover:bg-white hover:text-slate-900'
                                                    : 'bg-white text-slate-900 border-slate-100 hover:bg-slate-900 hover:text-white'
                                            }`}
                                        >
                                            {user.role === 'admin'
                                                ? <><ShieldAlert className="w-3 h-3" /> Demote</>
                                                : <><ShieldCheck className="w-3 h-3" /> Promote</>
                                            }
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl px-8 py-5 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                    Showing {meta?.from || 0}–{meta?.to || 0} of {meta?.total || 0} users
                </p>
                <div className="flex items-center gap-3">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="flex items-center gap-2 px-5 py-3 bg-slate-50 rounded-lg text-slate-900 hover:bg-slate-950 hover:text-white disabled:opacity-20 transition-all font-black uppercase text-[10px] tracking-widest border border-slate-100"
                    >
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <span className="text-xs font-black text-slate-400 italic px-2">
                        {page} / {meta?.last_page || 1}
                    </span>
                    <button
                        disabled={page >= (meta?.last_page || 1)}
                        onClick={() => setPage(page + 1)}
                        className="flex items-center gap-2 px-5 py-3 bg-slate-50 rounded-lg text-slate-900 hover:bg-slate-950 hover:text-white disabled:opacity-20 transition-all font-black uppercase text-[10px] tracking-widest border border-slate-100"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

        </div>
    );
};

export default AdminUsers;