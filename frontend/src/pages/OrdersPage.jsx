import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    ShoppingBag,
    ChevronRight,
    User,
    Heart,
    LogOut,
    CheckCircle2,
    Clock,
    Package,
    ArrowRight,
    Calendar,
    MapPin,
    CreditCard
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import useAuthStore from '../store/authStore';

const OrdersPage = () => {
    const { token } = useAuthStore();

    const { data: ordersResp, isLoading } = useQuery({
        queryKey: ['myOrders'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/orders');
            return data;
        },
        enabled: !!token
    });

    const orders = ordersResp?.data || ordersResp || [];

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'delivered': return "bg-emerald-50 text-emerald-700 border-emerald-100";
            case 'processing': return "bg-amber-50 text-amber-700 border-amber-100";
            case 'shipped': return "bg-sky-50 text-sky-700 border-sky-100";
            case 'cancelled': return "bg-rose-50 text-primary border-rose-100";
            default: return "bg-zinc-50 text-zinc-600 border-zinc-100";
        }
    };

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center bg-surface min-h-screen">
            <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-8"></div>
            <p className="font-bold text-on-surface-variant uppercase tracking-[0.2em] text-[10px]">Loading Orders...</p>
        </div>
    );

    return (
        <main className="space-y-8 min-w-0">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-outline-variant/20">
                <div>
                    <h1 className="text-4xl font-bold text-on-surface uppercase tracking-tight font-headline italic">Order History</h1>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-60">Manage your recent orders and track deliveries.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-white border border-outline-variant/30 rounded-full text-[9px] font-bold text-on-surface-variant uppercase tracking-widest shadow-sm italic">
                        {orders.length} Total Orders
                    </span>
                </div>
            </header>

            {/* Order List: Formal Rows */}
            <div className="space-y-4">
                            {orders.length > 0 ? (
                                orders.map((order) => (
                                    <div key={order.id} className="bg-white border border-outline-variant/20 rounded-2xl p-6 transition-all hover:border-primary/30 hover:shadow-md group">
                                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                            
                                            <div className="flex items-center gap-6 w-full md:w-auto">
                                                <div className="w-16 h-16 bg-surface-container-low rounded-xl overflow-hidden shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-500 border border-outline-variant/10">
                                                    <img 
                                                        src={order.items?.[0]?.product?.image_url || `https://ui-avatars.com/api/?name=${order.order_number}&background=f6f3f4&color=b0004a`} 
                                                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                                                        alt="order item"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">Order #{order.order_number}</p>
                                                    <div className="flex items-center gap-3 mt-1.5 text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">
                                                        <Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString('en-GB')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 w-full md:w-auto">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Payment Status</span>
                                                    <span className="text-[10px] font-bold text-on-surface uppercase italic flex items-center gap-2">
                                                        <CreditCard className="w-3 h-3 text-primary/40" />
                                                        {order.payment_status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Order Status</span>
                                                    <span className={`w-fit px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest italic border ${getStatusStyle(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1 text-right md:text-left">
                                                    <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">Order Total</span>
                                                    <span className="text-lg font-bold text-primary italic tabular-nums">${parseFloat(order.total).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="w-full md:w-auto">
                                                <Link 
                                                    to={`/orders/${order.order_number}`}
                                                    className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-on-surface text-white rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95 italic w-full md:w-auto"
                                                >
                                                    View Details
                                                    <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>

                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-24 text-center bg-white border border-dashed border-outline-variant/40 rounded-[2.5rem]">
                                    <ShoppingBag className="w-12 h-12 text-on-surface-variant/10 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest italic opacity-60">You haven't placed any orders yet.</p>
                                    <Link to="/products" className="inline-block mt-8 px-10 py-4 bg-primary text-white rounded-full text-[10px] font-bold uppercase tracking-widest italic hover:scale-105 transition-all">
                                        Start Shopping
                                    </Link>
                                </div>
                            )}
                        </div>
                    </main>
    );
};

export default OrdersPage;
