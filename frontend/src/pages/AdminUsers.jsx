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
    Users,
    RefreshCcw,
    Mail,
    Calendar,
    ChevronDown,
    Activity,
    ArrowUpRight,
    Lock,
    Unlock,
    UserPlus,
    CheckCircle2,
    Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminUsers, toggleUserRole } from '../services/adminService';
import axiosInstance from '../services/axiosInstance';

const AdminUsers = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    const { data: usersResp, isLoading, isError } = useQuery({
        queryKey: ['adminUsers', page, search, roleFilter],
        queryFn: () => getAdminUsers({ page, search, role: roleFilter }),
    });

    const users = usersResp?.data || [];
    const meta = usersResp?.meta;

    // Mutate User Restriction (Ban/Unban)
    const toggleStatusMutation = useMutation({
        mutationFn: (user) => {
            const endpoint = user.is_banned
                ? `/admin/users/${user.id}/unban`
                : `/admin/users/${user.id}/ban`;
            return axiosInstance.post(endpoint);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            toast.success('Consumer visibility updated');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    });

    // Mutate Permissions (Admin/User)
    const toggleRoleMutation = useMutation({
        mutationFn: (id) => toggleUserRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminUsers']);
            toast.success('Permissions modified');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Access modification failed.')
    });

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center bg-[#fffbfb] min-h-screen">
            <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-8 shadow-sm"></div>
            <p className="font-bold text-primary/50 uppercase tracking-[0.2em] text-[10px] italic">Accessing Client Records...</p>
        </div>
    );

    if (isError) return (
        <div className="text-center py-40 bg-white rounded-[3rem] border border-[#fde2e7] shadow-sm mx-6">
            <ShieldAlert className="w-16 h-16 text-rose-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-[#351e24] uppercase italic tracking-tighter">Connection Failed</h3>
            <p className="text-[#351e24]/40 mt-4 font-bold uppercase tracking-widest text-[10px]">Registry unreachable at this time.</p>
        </div>
    );

    const activeUsers = users.filter(u => !u.is_banned).length;

    return (
        <div className="space-y-12 pb-24 font-['Plus_Jakarta_Sans'] antialiased">

            {/* Header Area */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-[#fde2e7]/40 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                        <Users className="w-4 h-4" />
                        Client Curation
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-black text-[#351e24] tracking-tighter uppercase italic leading-none">
                        Users <span className="text-primary">& Consumers</span>
                    </h1>
                    <p className="text-[#351e24]/60 text-sm font-bold italic opacity-70">Cataloging the exclusive members of the Rose Galerie.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="px-8 py-5 bg-white border border-[#fde2e7] rounded-[2rem] flex items-center gap-8 shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-[#351e24] leading-none tabular-nums italic">{meta?.total || 0}</span>
                            <span className="text-[8px] font-black text-[#351e24]/30 tracking-widest mt-1 uppercase">Total Members</span>
                        </div>
                        <div className="h-8 w-px bg-[#fde2e7]" />
                        <Users className="w-6 h-6 text-primary/20" />
                    </div>
                    <button 
                        onClick={() => queryClient.invalidateQueries(['adminUsers'])} 
                        className="px-12 py-5 bg-[#351e24] text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest italic hover:bg-black transition-all shadow-xl shadow-[#351e24]/10 flex items-center gap-4"
                    >
                        <RefreshCcw className="w-4 h-4" /> Refresh Registry
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white p-8 rounded-[3rem] border border-[#fde2e7]/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100 shadow-sm">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black text-[#351e24]/30 uppercase tracking-widest italic">Verification Status</span>
                    </div>
                    <h3 className="text-4xl font-black text-[#351e24] italic tracking-tighter uppercase leading-none">{activeUsers} Active</h3>
                    <p className="text-[10px] font-black text-[#351e24]/40 mt-3 uppercase tracking-widest italic">Live Consumer Connections</p>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-[#fde2e7]/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="p-4 rounded-2xl bg-rose-50 text-primary border border-primary/10 shadow-sm text-primary">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black text-[#351e24]/30 uppercase tracking-widest italic">Control Level</span>
                    </div>
                    <h3 className="text-4xl font-black text-[#351e24] italic tracking-tighter uppercase leading-none">{users.filter(u => u.role === 'admin').length} Admins</h3>
                    <p className="text-[10px] font-black text-[#351e24]/40 mt-3 uppercase tracking-widest italic">Elevated Access Status</p>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-[#fde2e7]/60 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                    <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-black text-[#351e24]/30 uppercase tracking-widest italic">Gallery Growth</span>
                    </div>
                    <h3 className="text-4xl font-black text-[#351e24] italic tracking-tighter uppercase leading-none">New Members</h3>
                    <p className="text-[10px] font-black text-[#351e24]/40 mt-3 uppercase tracking-widest italic">Recent Registrations</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-4 rounded-[2.5rem] border border-[#fde2e7]/40 shadow-sm">
                <div className="lg:col-span-8 relative">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-[#351e24]/20 w-5 h-5" />
                    <input
                        className="w-full bg-[#fffbfb] border border-[#fde2e7] px-16 py-6 rounded-full text-[11px] font-black uppercase tracking-widest italic shadow-sm focus:ring-8 focus:ring-rose-50/50 outline-none text-[#351e24]"
                        placeholder="Search by name, email or ID..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="lg:col-span-4 relative">
                    <Filter className="absolute left-8 top-1/2 -translate-y-1/2 text-[#351e24]/20 w-4 h-4" />
                    <select 
                        className="w-full appearance-none bg-[#fffbfb] border border-[#fde2e7] px-16 py-6 rounded-full text-[10px] font-black uppercase tracking-widest text-[#351e24] shadow-sm outline-none cursor-pointer italic"
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">All Account Types</option>
                        <option value="user">Customers</option>
                        <option value="admin">Administrators</option>
                    </select>
                    <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-[#351e24]/20" />
                </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-[4rem] border border-[#fde2e7]/40 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-black text-[#351e24]/30 uppercase tracking-[0.2em] bg-[#fffbfb] border-b border-[#fde2e7]/20 italic">
                                <th className="py-10 px-12">Customer Profile</th>
                                <th className="py-10 px-8">Contact Info</th>
                                <th className="py-10 px-8">Permissions</th>
                                <th className="py-10 px-8">Status</th>
                                <th className="py-10 px-12 text-right">Access Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#fde2e7]/10">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-48 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-10">
                                            <Users className="w-24 h-24 mb-6" />
                                            <p className="text-3xl font-black uppercase tracking-[0.4em] italic">No Records</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-rose-50/10 transition-all group/row">
                                    <td className="px-12 py-10">
                                        <div className="flex items-center gap-8">
                                            <div className="w-16 h-16 bg-[#fffbfb] rounded-[1.5rem] overflow-hidden border border-[#fde2e7] group-hover/row:scale-105 transition-transform duration-700 shadow-sm group-hover/row:border-primary/20">
                                                <img 
                                                    src={user.avatar 
                                                        ? (user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL}/storage/${user.avatar}`) 
                                                        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                                                    className="w-full h-full object-cover grayscale group-hover/row:grayscale-0 transition-all duration-700" 
                                                    alt={user.name} 
                                                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`; }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-[#351e24] tracking-tight italic uppercase leading-none group-hover/row:text-primary transition-colors">{user.name}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[#351e24]/30 mt-3 italic">Consumer ID: #{user.id.toString().padStart(4, '0')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-10">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-[#351e24] italic">
                                                <Mail className="w-3.5 h-3.5 text-primary/30" />
                                                {user.email}
                                            </div>
                                            {user.phone && <span className="text-[9px] font-black text-[#351e24]/30 uppercase tracking-widest mt-1 ml-5">{user.phone}</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-10">
                                        <div className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic border transition-all ${user.role === 'admin'
                                            ? 'bg-[#351e24] text-white border-[#351e24] shadow-xl shadow-[#351e24]/10 scale-105'
                                            : 'bg-white text-primary border-primary/10'
                                            }`}>
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-8 py-10">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ring-[6px] transition-all duration-1000 ${user.is_banned
                                                ? 'bg-rose-500 ring-rose-500/10'
                                                : 'bg-emerald-500 ring-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                                                }`} />
                                            <span className={`text-[10px] font-black uppercase tracking-widest italic ${user.is_banned ? 'text-rose-500' : 'text-emerald-600'}`}>
                                                {user.is_banned ? 'Restricted' : 'Authenticated'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-12 py-10 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => toggleStatusMutation.mutate(user)}
                                                disabled={toggleStatusMutation.isPending}
                                                className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all shadow-sm border ${user.is_banned
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white'
                                                    : 'bg-rose-50 text-primary border-primary/10 hover:bg-primary hover:text-white'
                                                    }`}
                                            >
                                                {user.is_banned ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => toggleRoleMutation.mutate(user.id)}
                                                disabled={toggleRoleMutation.isPending}
                                                className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-all shadow-sm border ${user.role === 'admin'
                                                    ? 'bg-[#351e24] text-white border-[#351e24] hover:bg-white hover:text-[#351e24]'
                                                    : 'bg-white text-[#351e24]/20 border-[#fde2e7] hover:border-primary/30 hover:text-primary'
                                                    }`}
                                            >
                                                {user.role === 'admin' ? <ShieldAlert className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && (
                    <footer className="px-12 py-10 bg-[#fffbfb] border-t border-[#fde2e7]/30 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#351e24]/20 italic leading-none">Registry Navigation</span>
                            <p className="text-[11px] font-black text-[#351e24]/40 italic mt-2">Documenting {meta.from || 0} — {meta.to || 0} of {meta.total} exclusive members</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="w-14 h-14 rounded-[1.5rem] border border-[#fde2e7] text-[#351e24]/30 hover:bg-primary hover:text-white transition-all disabled:opacity-20 flex items-center justify-center bg-white shadow-sm"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <div className="w-14 h-14 rounded-[1.5rem] bg-[#351e24] text-white flex items-center justify-center text-xs font-black shadow-xl italic tracking-tighter">
                                {page}
                            </div>
                            <button
                                disabled={page === meta.last_page}
                                onClick={() => setPage(page + 1)}
                                className="w-14 h-14 rounded-[1.5rem] border border-[#fde2e7] text-[#351e24]/30 hover:bg-primary hover:text-white transition-all disabled:opacity-20 flex items-center justify-center bg-white shadow-sm"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
