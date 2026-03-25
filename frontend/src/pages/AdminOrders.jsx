import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Search, 
    Filter, 
    ChevronLeft, 
    ChevronRight, 
    Eye, 
    MoreVertical, 
    Download,
    ShoppingBag,
    Clock,
    RefreshCcw,
    Activity,
    Users,
    Package,
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
            toast.success('Order status updated.');
        },
        onError: () => toast.error('Status update failed.')
    });

    const getStatusStyles = (s) => {
        switch (s) {
            case 'pending': return "bg-amber-50 text-amber-600 border-amber-100";
            case 'processing': return "bg-blue-50 text-blue-600 border-blue-100";
            case 'shipped': return "bg-indigo-50 text-indigo-600 border-indigo-100";
            case 'delivered': return "bg-green-50 text-green-600 border-green-100";
            case 'completed': return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case 'cancelled': return "bg-red-50 text-red-500 border-red-100";
            default: return "bg-slate-50 text-slate-400 border-slate-100";
        }
    };

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-8 font-bold text-slate-400">Loading orders...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 font-manrope">
            {/* Header with Stats Summary */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
               <div className="space-y-2">
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Orders Management</h2>
                  <p className="text-slate-500 font-medium">Handle and track customer transactions seamlessly</p>
               </div>
               <div className="flex flex-wrap gap-4">
                  <button className="px-6 py-3 bg-white border border-slate-100 text-slate-900 text-[11px] font-bold uppercase rounded-lg hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
                      <Download className="w-4 h-4" /> Export Data
                  </button>
                  <button onClick={() => queryClient.invalidateQueries(['adminOrders'])} className="px-6 py-3 bg-slate-950 text-white text-[11px] font-bold uppercase rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10">
                      <RefreshCcw className="w-4 h-4" /> Refresh List
                  </button>
               </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
               <div className="relative flex-1 group w-full">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 pointer-events-none group-focus-within:text-slate-900 transition-colors" />
                   <input 
                       className="w-full bg-slate-50 border-none px-16 py-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-900 focus:bg-white transition-all outline-none italic placeholder:text-slate-300"
                       placeholder="Search by order # / name..."
                       value={search}
                       onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                   />
               </div>
               <div className="h-10 w-px bg-slate-100 hidden md:block" />
               <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
                    <Filter className="w-4 h-4 text-slate-300 ml-2" />
                    <select 
                        className="flex-1 md:flex-none appearance-none bg-slate-50 border-none px-12 py-6 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-slate-500 focus:bg-white transition-all outline-none cursor-pointer"
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    >
                        <option value="">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
               </div>
            </div>

            {/* Orders Table Section */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Order Reference</th>
                                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Customer Details</th>
                                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Amount</th>
                                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="px-10 py-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 uppercase italic">
                            {orders && orders.length > 0 ? orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50/80 transition-all group/row">
                                    <td className="px-10 py-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white border-2 border-slate-100 shadow-sm transition-transform">
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900 tracking-tighter leading-none">#{order.order_number}</p>
                                                <p className="text-[9px] font-bold text-slate-300 mt-2 tracking-widest leading-none flex items-center gap-2">
                                                    <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="max-w-xs">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center text-[9px] font-bold border border-slate-200">
                                                    {order.user?.name?.charAt(0) || 'G'}
                                                </div>
                                                <p className="text-xs font-bold text-slate-900 truncate">{order.user?.name || 'Guest User'}</p>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-300 tracking-widest truncate mt-3 ml-11 opacity-60">
                                                {order.shipping_address?.city || 'Global'}, {order.shipping_address?.country || 'Region'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">${order.total}</p>
                                        <p className="text-[9px] font-bold text-slate-300 mt-2 tracking-widest uppercase">{order.items?.length || 0} Products</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <select 
                                            className={`px-6 py-2 rounded-full border border-slate-100 font-bold text-[9px] uppercase tracking-widest outline-none cursor-pointer transition-all ${getStatusStyles(order.status)}`}
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
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button 
                                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                                            className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-20 grayscale">
                                            <ShoppingBag className="w-16 h-16" />
                                            <p className="text-xl font-black uppercase tracking-widest italic">Inventory Registry Empty</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Internal Pagination Meta */}
                {meta && (
                    <div className="px-12 py-10 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Showing {orders?.length || 0} of {meta.total} records</p>
                        <div className="flex gap-4">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-950 transition-all disabled:opacity-20"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button 
                                disabled={page === meta.last_page}
                                onClick={() => setPage(page + 1)}
                                className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-950 transition-all disabled:opacity-20"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
