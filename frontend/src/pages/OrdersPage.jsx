import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
    ShoppingBag, 
    ChevronRight, 
    Clock, 
    CheckCircle, 
    Truck, 
    AlertCircle,
    ArrowRight,
    Search,
    Package,
    Calendar,
    DollarSign,
    Box
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import useAuthStore from '../store/authStore';

const OrdersPage = () => {
    const { token } = useAuthStore();
    const navigate = useNavigate();

    const { data: ordersResp, isLoading } = useQuery({
        queryKey: ['myOrders'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/orders');
            return data;
        },
        enabled: !!token
    });

    const orders = ordersResp?.data || ordersResp || [];

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'delivered': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'processing': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-400 border-slate-100';
        }
    };


    if (isLoading) return (
        <div className="pt-40 min-h-screen text-center">
            <div className="inline-block w-12 h-12 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-8 font-black text-slate-400 uppercase tracking-widest text-[10px]">Retrieving Purchase History...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white pt-32 pb-40 font-manrope selection:bg-slate-950 selection:text-white">
            <main className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 border-b border-slate-50 pb-16">
                   <div className="space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 block italic">Order Registry</span>
                      <h1 className="text-7xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase italic leading-[0.8]">
                         Purchases
                      </h1>
                      <p className="text-slate-400 text-lg font-medium italic opacity-60">View and track your entire acquisition history.</p>
                   </div>
                   <div className="flex items-center gap-8">
                      <div className="px-10 py-5 bg-slate-50 rounded-2xl border border-slate-100 italic font-black uppercase tracking-widest text-[11px] text-slate-400 shadow-sm">
                         {orders.length} Total Orders
                      </div>
                   </div>
                </div>

                {orders.length > 0 ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                        {orders.map((order) => (
                            <div key={order.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-slate-950 transition-all duration-500 overflow-hidden relative">
                                <div className="p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12 relative z-10">
                                    
                                    {/* Order Meta */}
                                    <div className="flex items-center gap-8">
                                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                                            <Package className="w-10 h-10 text-slate-300 group-hover:text-slate-950 transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none group-hover:translate-x-1 transition-transform">#{order.order_number}</h3>
                                            <div className="flex items-center gap-4 text-slate-300">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Specifics */}
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-16 items-center flex-1 lg:max-w-2xl">
                                        <div className="space-y-2">
                                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block">Total Amount</span>
                                           <p className="text-2xl font-black text-slate-950 italic tracking-tighter tabular-nums">${parseFloat(order.total || 0).toFixed(2).toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-4">
                                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block">Fulfillment Status</span>
                                           <div className={`inline-flex items-center px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest italic ${getStatusStyles(order.status)}`}>
                                               {order.status}
                                           </div>
                                        </div>
                                        <div className="space-y-2 hidden lg:block">
                                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 block">Item Count</span>
                                           <p className="text-lg font-black text-slate-950 italic tracking-tighter">{parseInt(order.items_count || order.items?.length || 1)} Unit{ parseInt(order.items_count || order.items?.length || 1) !== 1 ? 's' : '' }</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <Link to={`/orders/${order.order_number}`} className="w-full lg:w-auto">
                                        <button className="w-full lg:w-auto px-10 py-5 bg-slate-950 text-white rounded-2xl flex items-center justify-center gap-4 group/btn hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-[0.2em] italic shadow-xl">
                                            View Details
                                            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform text-amber-400" />
                                        </button>
                                    </Link>
                                </div>
                                
                                {/* Background Decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-950 opacity-0 group-hover:opacity-[0.02] -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl transition-all duration-1000 pointer-events-none" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-40 space-y-12">
                       <div className="inline-flex items-center justify-center w-32 h-32 bg-slate-50 rounded-[3.5rem] text-slate-200 animate-bounce-slow border border-slate-100 shadow-inner">
                          <ShoppingBag className="w-16 h-16" />
                       </div>
                       <div className="space-y-6">
                          <h2 className="text-5xl font-black tracking-tighter uppercase italic text-slate-950">No orders placed yet.</h2>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed italic opacity-70">
                              Your purchase history is currently empty. Explore our latest acquisitions to start your shopping journey.
                          </p>
                       </div>
                       <Link to="/shop" className="inline-block mt-8">
                          <Button className="px-16 py-8 rounded-[2rem] bg-slate-950 text-white text-xl font-black uppercase italic shadow-3xl hover:bg-slate-800 hover:scale-[1.05] active:scale-[0.95] transition-all">
                             Browse Products <ArrowRight className="ml-4 w-7 h-7 text-amber-400" />
                          </Button>
                       </Link>
                    </div>
                )}

                {/* Footer Engagement Block */}
                {orders.length > 0 && (
                    <div className="pt-24 border-t border-slate-50">
                        <div className="bg-slate-50 p-12 lg:p-20 rounded-[4rem] border border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-16 relative overflow-hidden group">
                           <div className="space-y-8 relative z-10">
                              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-none text-slate-950">Return & Exchange Assistance</h2>
                              <p className="text-slate-400 text-lg font-medium italic max-w-lg">Need support regarding an existing purchase? Our specialized concierge team is available to assist with logistics, sizing, or product inquiries.</p>
                              <button className="px-12 py-5 bg-white border border-slate-950 text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-950 hover:text-white transition-all shadow-sm">
                                 Contact Concierge
                              </button>
                           </div>
                           <div className="relative z-10">
                               <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-2xl space-y-4 max-w-xs group-hover:scale-105 transition-transform duration-1000 underline decoration-amber-400 decoration-4 underline-offset-8">
                                   <div className="flex items-center gap-4 text-emerald-500 mb-6">
                                       <Box className="w-8 h-8" />
                                       <span className="text-xs font-black uppercase tracking-widest italic">Live Dispatch Tracking</span>
                                   </div>
                                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Most orders are processed and delivered within 3-5 business days across global regions.</p>
                               </div>
                           </div>
                           {/* Decorative Elements */}
                           <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500 opacity-0 group-hover:opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default OrdersPage;
