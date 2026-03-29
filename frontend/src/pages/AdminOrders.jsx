import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    Download,
    ShoppingBag,
    Clock,
    RefreshCcw,
    Loader2,
    Check,
    ChevronDown,
    User,
    ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/axiosInstance';
import { getAdminOrders } from '../services/adminService';
import { toast } from 'react-hot-toast';

const AdminOrders = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');

    const { data: ordersResp, isLoading } = useQuery({
        queryKey: ['adminOrders', page, status, search],
        queryFn: () => getAdminOrders({ page, status, search }),
    });

    const orders = ordersResp?.data;
    const meta = ordersResp?.meta;

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => axiosInstance.patch(`/admin/orders/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminOrders']);
            toast.success('Order status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    const getStatusStyles = (s) => {
        switch (s?.toLowerCase()) {
            case 'pending': return "bg-amber-100 text-amber-700 border-amber-200";
            case 'processing': return "bg-sky-100 text-sky-700 border-sky-200";
            case 'shipped': return "bg-violet-100 text-violet-700 border-violet-200";
            case 'delivered': return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case 'completed': return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case 'cancelled': return "bg-rose-100 text-rose-700 border-rose-200 opacity-60";
            default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
        }
    };

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center bg-surface min-h-screen">
            <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-8"></div>
            <p className="font-bold text-on-surface-variant uppercase tracking-[0.2em] text-[10px] italic">Loading Orders...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-24 font-body antialiased">

            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-outline-variant/20 pb-12">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                        <ShoppingBag className="w-4 h-4" />
                        Admin Console
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-on-surface tracking-tighter uppercase font-headline italic">
                        Order <span className="text-primary">Management</span>
                    </h1>
                    <p className="text-on-surface-variant text-sm font-medium italic opacity-70">Oversee and coordinate all customer transactions and delivery states.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button className="px-8 py-4 bg-white border border-outline-variant/30 text-on-surface rounded-full font-bold text-[10px] uppercase tracking-widest italic hover:bg-surface-container-low transition-all shadow-sm flex items-center gap-3">
                        <Download className="w-4 h-4" /> Export Data
                    </button>
                    <button 
                        onClick={() => queryClient.invalidateQueries(['adminOrders'])} 
                        className="px-10 py-4 bg-on-surface text-white rounded-full font-bold text-[10px] uppercase tracking-widest italic hover:bg-primary transition-all shadow-xl shadow-on-surface/10 flex items-center gap-3"
                    >
                        <RefreshCcw className="w-4 h-4" /> Sync List
                    </button>
                </div>
            </header>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 relative">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-5 h-5 pointer-events-none" />
                    <input
                        className="w-full bg-white border border-outline-variant/30 px-16 py-6 rounded-full text-[11px] font-bold uppercase tracking-widest italic placeholder:text-on-surface-variant/20 shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-on-surface"
                        placeholder="Search by ID, name, or city..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
                <div className="lg:col-span-4 relative">
                    <Filter className="absolute left-8 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-4 h-4 pointer-events-none" />
                    <select
                        className="w-full appearance-none bg-white border border-outline-variant/30 px-16 py-6 rounded-full text-[10px] font-bold uppercase tracking-widest text-on-surface shadow-sm focus:ring-4 focus:ring-primary/5 outline-none cursor-pointer italic"
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Orders Table Container */}
            <div className="bg-white rounded-[2.5rem] border border-outline-variant/20 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] bg-surface-container-lowest border-b border-outline-variant/10 italic">
                                <th className="py-8 px-10">Purchase Details</th>
                                <th className="py-8 px-10">Client</th>
                                <th className="py-8 px-10">Investment</th>
                                <th className="py-8 px-10">Status State</th>
                                <th className="py-8 px-10 text-right">Inspection</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/5">
                            {orders && orders.length > 0 ? orders.map((order) => (
                                <tr key={order.id} className="hover:bg-surface-container-lowest transition-all group/row cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-surface-container-low rounded-3xl flex items-center justify-center border border-outline-variant/10 text-primary group-hover/row:bg-primary group-hover/row:text-white transition-all duration-500">
                                                <ShoppingBag className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-xl font-bold text-on-surface tracking-tighter uppercase italic leading-none">#{order.order_number}</p>
                                                <div className="flex items-center gap-2 mt-2 text-on-surface-variant/50">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-[9px] font-bold uppercase tracking-widest italic">{new Date(order.created_at).toLocaleDateString('en-GB')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center text-[10px] font-bold border border-outline-variant/10 shadow-sm">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <p className="text-sm font-bold text-on-surface uppercase italic truncate group-hover/row:text-primary transition-colors">{order.user?.name || 'Guest User'}</p>
                                                <span className="text-[9px] font-bold text-on-surface-variant/40 italic uppercase tracking-wider truncate">{order.shipping_address?.city || 'No Location'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold text-primary italic tabular-nums leading-none tracking-tighter">${parseFloat(order.total).toFixed(2)}</span>
                                            <span className="text-[9px] font-bold text-on-surface-variant/30 mt-1.5 uppercase italic">{order.items?.length || 0} Products</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="relative w-fit" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                className={`px-5 py-2.5 rounded-full border font-bold text-[9px] uppercase tracking-wider italic outline-none cursor-pointer transition-all pr-10 appearance-none ${getStatusStyles(order.status)}`}
                                                value={order.status}
                                                onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                                                <ChevronDown className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/admin/orders/${order.id}`); }}
                                            className="w-12 h-12 bg-white border border-outline-variant/30 text-on-surface-variant hover:text-white hover:bg-on-surface rounded-2xl transition-all shadow-sm flex items-center justify-center ml-auto group/inspect"
                                        >
                                            <ArrowUpRight className="w-5 h-5 group-hover/inspect:scale-125 transition-transform" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-48 text-center text-on-surface-variant/10">
                                        <div className="flex flex-col items-center gap-6">
                                            <ShoppingBag className="w-24 h-24" />
                                            <p className="text-2xl font-bold uppercase tracking-[0.3em] italic">No Transactions Logged</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && (
                    <footer className="px-10 py-8 bg-surface-container-lowest border-t border-outline-variant/10 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant/40 italic">Registry Status</span>
                            <p className="text-[11px] font-bold text-on-surface-variant/60 italic mt-0.5">Displaying {meta.from || 0} — {meta.to || 0} of {meta.total} orders</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="w-12 h-12 rounded-full border border-outline-variant/30 text-on-surface-variant hover:bg-primary hover:text-white transition-all disabled:opacity-20 flex items-center justify-center"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <div className="w-12 h-12 rounded-full bg-on-surface text-white flex items-center justify-center text-xs font-bold shadow-lg italic">
                                {page}
                            </div>
                            <button
                                disabled={page === meta.last_page}
                                onClick={() => setPage(page + 1)}
                                className="w-12 h-12 rounded-full border border-outline-variant/30 text-on-surface-variant hover:bg-primary hover:text-white transition-all disabled:opacity-20 flex items-center justify-center"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </footer>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
