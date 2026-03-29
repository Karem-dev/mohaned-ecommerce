import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Package,
    Truck,
    CreditCard,
    User,
    MapPin,
    Clock,
    CheckCircle2,
    Calendar,
    Printer,
    Mail,
    Phone,
    FileText,
    ExternalLink,
    AlertCircle,
    ArrowRight,
    Zap,
    Check,
    Loader2,
    ShieldCheck,
    ChevronDown,
    ChevronRight,
    Tag,
    ShoppingBag,
    Layers,
    ArrowUpRight,
    Download
} from 'lucide-react';
import { getAdminOrder, addOrderTracking, updateAdminOrderStatus } from '../services/adminService';
import { toast } from 'react-hot-toast';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditingTracking, setIsEditingTracking] = useState(false);
    const [trackingData, setTrackingData] = useState({
        tracking_number: '',
        carrier_name: '',
        estimated_delivery: '',
        current_location_desc: ''
    });

    const { data: orderResp, isLoading, isError } = useQuery({
        queryKey: ['adminOrder', id],
        queryFn: () => getAdminOrder(id),
    });

    const order = orderResp?.data || orderResp;

    const statusMutation = useMutation({
        mutationFn: (newStatus) => updateAdminOrderStatus({ id, status: newStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminOrder', id]);
            toast.success('Order status updated');
        },
        onError: () => toast.error('Failed to update status')
    });

    const trackingMutation = useMutation({
        mutationFn: (data) => addOrderTracking(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminOrder', id]);
            setIsEditingTracking(false);
            toast.success('Tracking information updated');
        },
        onError: () => toast.error('Failed to save tracking details')
    });

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center bg-surface min-h-screen">
            <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-8"></div>
            <p className="font-bold text-on-surface-variant uppercase tracking-[0.2em] text-[10px] italic">Loading Order Summary...</p>
        </div>
    );

    if (isError || !order) return (
        <div className="pt-40 text-center py-40 bg-surface min-h-screen px-6">
            <div className="w-24 h-24 bg-surface-container-high rounded-[3rem] flex items-center justify-center mx-auto mb-10">
                <AlertCircle className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-4xl font-bold uppercase italic text-on-surface mb-4 tracking-tighter font-headline">Order Not Found</h2>
            <p className="text-sm text-on-surface-variant mb-12 italic max-w-sm mx-auto">The requested order could not be located in our system or an error occurred.</p>
            <button onClick={() => navigate('/admin/orders')} className="px-12 py-5 bg-on-surface text-white font-bold uppercase tracking-widest rounded-full shadow-xl hover:bg-primary transition-all italic text-[10px]">Back to Collection</button>
        </div>
    );

    const getStatusStyles = (s) => {
        switch (s?.toLowerCase()) {
            case 'pending': return "bg-amber-100 text-amber-700 border-amber-200";
            case 'processing': return "bg-sky-100 text-sky-700 border-sky-200";
            case 'shipped': return "bg-violet-100 text-violet-700 border-violet-200";
            case 'delivered': return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case 'completed': return "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm";
            case 'cancelled': return "bg-rose-100 text-rose-700 border-rose-200 opacity-60";
            default: return "bg-zinc-100 text-zinc-600 border-zinc-200";
        }
    };

    return (
        <div className="space-y-12 pb-24 font-body antialiased">

            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-outline-variant/20 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-6">
                    <button onClick={() => navigate('/admin/orders')} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all group italic">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Orders
                    </button>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl md:text-6xl font-bold text-on-surface tracking-tighter italic uppercase font-headline leading-none">Order <span className="text-primary">#{order.order_number}</span></h1>
                            <span className={`px-5 py-2 rounded-full border text-[9px] font-bold uppercase tracking-widest italic ${getStatusStyles(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 italic">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>Placed: {new Date(order.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 italic">
                                <Truck className="w-4 h-4 text-primary" />
                                <span>Priority Protocol</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-outline-variant/30 px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-widest outline-none transition-all cursor-pointer shadow-sm hover:border-primary/50 pr-16 italic text-on-surface"
                            value={order.status}
                            onChange={(e) => statusMutation.mutate(e.target.value)}
                        >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-4 h-4" />
                    </div>
                    <a
                        href={`${import.meta.env.VITE_API_URL}/admin/orders/${order.id}/invoice`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-12 h-12 bg-white rounded-2xl border border-outline-variant/30 text-on-surface hover:bg-on-surface hover:text-white transition-all shadow-sm flex items-center justify-center group"
                    >
                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </a>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Items Section */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="bg-white rounded-[2.5rem] border border-outline-variant/20 overflow-hidden shadow-sm group/items">
                        <div className="px-10 py-8 border-b border-outline-variant/5 flex items-center justify-between bg-surface-container-lowest/50">
                            <div className="space-y-1">
                                <h3 className="text-xl font-bold text-on-surface font-headline uppercase italic">Product Summary</h3>
                                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Customer acquisitions</p>
                            </div>
                            <div className="px-5 py-2 bg-white rounded-full border border-outline-variant/20 text-[10px] font-bold text-primary tracking-widest italic uppercase">
                                {order.items?.length || 0} Total Items
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {order.items?.map((item) => (
                                <div key={item.id} className="p-6 bg-surface-container-lowest rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-8 group/item hover:bg-surface-container-low transition-all border border-transparent hover:border-primary/5">
                                    <div className="flex items-center gap-8">
                                        <div className="w-24 h-32 bg-white rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm group-hover/item:scale-105 transition-transform duration-500">
                                            <img 
                                                src={item.product?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=f6f3f4&color=b0004a`} 
                                                className="w-full h-full object-cover" 
                                                alt={item.name} 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-2xl font-bold text-on-surface tracking-tighter italic uppercase underline decoration-primary/10 decoration-2 underline-offset-4 group-hover/item:text-primary transition-colors">{item.name}</h4>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">
                                                    <Tag className="w-3 h-3 text-primary" /> SKU: {item.product?.sku || 'N/A'}
                                                </div>
                                                <div className="h-3 w-px bg-outline-variant/30" />
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-widest italic">
                                                    <Layers className="w-3 h-3" /> {item.variant_label || 'Default'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className="text-[9px] font-bold text-on-surface-variant/30 uppercase tracking-widest italic">{item.quantity} x ${parseFloat(item.price).toFixed(2)}</span>
                                        <p className="text-3xl font-bold text-on-surface italic tracking-tighter tabular-nums leading-none group-hover/item:text-primary transition-colors">${parseFloat(item.total || 0).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Financials Summary */}
                        <div className="p-10 bg-surface-container-lowest border-t border-outline-variant/10">
                            <div className="space-y-6 max-w-xs ml-auto">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider italic">Subtotal</span>
                                        <span className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Net Value</span>
                                    </div>
                                    <span className="text-lg font-bold text-on-surface/60 italic tabular-nums">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider italic">Shipping</span>
                                        <span className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Delivery Fee</span>
                                    </div>
                                    <span className="text-lg font-bold text-on-surface/60 italic tabular-nums">${parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
                                </div>
                                {parseFloat(order.discount || 0) > 0 && (
                                    <div className="flex items-center justify-between text-emerald-600">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold uppercase tracking-wider italic">Discount</span>
                                            <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Promotion</span>
                                        </div>
                                        <span className="text-lg font-bold italic tabular-nums">-${parseFloat(order.discount || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-8 border-t border-outline-variant/30">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-on-surface uppercase tracking-widest italic">Order Total</span>
                                        <span className="text-[9px] font-bold text-on-surface-variant/30 uppercase tracking-widest italic">V.A.T Included</span>
                                    </div>
                                    <span className="text-5xl font-bold text-primary italic tracking-tighter tabular-nums leading-none group-hover/items:scale-105 transition-transform duration-700">${parseFloat(order.total || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-12">

                    {/* Shipping Address */}
                    <section className="bg-on-surface rounded-[3rem] p-10 text-white space-y-10 shadow-2xl relative overflow-hidden group/shipping transition-all hover:bg-[#252425]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 group-hover/shipping:scale-150 transition-transform duration-1000" />
                        
                        <div className="flex items-center gap-5 border-b border-white/5 pb-8 relative z-10">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 shadow-inner group-hover/shipping:rotate-6 transition-transform">
                                <MapPin className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold italic tracking-tighter uppercase font-headline">Shipping Log</h3>
                        </div>

                        <div className="space-y-10 relative z-10">
                            <div className="space-y-4">
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] italic">Recipient</span>
                                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group-hover/shipping:bg-white/10 transition-all">
                                    <p className="text-2xl font-bold italic tracking-tighter text-white leading-tight uppercase underline decoration-primary/30 decoration-2 underline-offset-4">{order.shipping_address?.full_name || 'Guest User'}</p>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-primary uppercase tracking-widest italic mt-4 bg-primary/10 w-fit px-4 py-1.5 rounded-full">
                                        <Phone className="w-3 h-3" /> {order.shipping_address?.phone || 'No Phone Registered'}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] italic">Destination</span>
                                <p className="text-[11px] font-bold leading-loose text-white/60 uppercase tracking-wider italic">
                                    <span className="block text-white mb-1">{order.shipping_address?.address_line1}</span>
                                    {order.shipping_address?.city}, {order.shipping_address?.country} {order.shipping_address?.zip}
                                </p>
                            </div>

                            {/* Tracking Controller */}
                            <div className="space-y-6 pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] italic">Tracking System</span>
                                    <button 
                                        onClick={() => {
                                            if (!isEditingTracking) {
                                                setTrackingData({
                                                    tracking_number: order.tracking_number || '',
                                                    carrier_name: order.carrier_name || '',
                                                    estimated_delivery: order.estimated_delivery?.split('T')[0] || '',
                                                    current_location_desc: order.current_location_desc || ''
                                                });
                                            }
                                            setIsEditingTracking(!isEditingTracking);
                                        }}
                                        className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline italic"
                                    >
                                        {isEditingTracking ? 'Cancel' : (order.tracking_number ? 'Update Info' : 'Add Tracking')}
                                    </button>
                                </div>

                                {!isEditingTracking ? (
                                    <div className="bg-primary/95 p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer group/track overflow-hidden relative" onClick={() => setIsEditingTracking(true)}>
                                        <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:rotate-45 transition-transform">
                                            <Truck className="w-12 h-12" />
                                        </div>
                                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.3em] italic mb-2 relative z-10">Carrier: {order.carrier_name || 'PENDING ASSIGNMENT'}</p>
                                        <p className="text-2xl font-bold text-white italic tracking-tighter leading-none relative z-10 truncate">{order.tracking_number || 'WAITING DISPATCH'}</p>
                                        {order.current_location_desc && (
                                            <p className="text-[9px] font-bold text-white/60 italic mt-4 relative z-10 flex items-center gap-2">
                                                <Clock className="w-3 h-3" /> {order.current_location_desc}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in zoom-in-95 duration-300">
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[11px] text-white outline-none focus:ring-4 focus:ring-primary/20 italic font-bold placeholder:text-white/10"
                                            value={trackingData.tracking_number}
                                            onChange={(e) => setTrackingData(prev => ({ ...prev, tracking_number: e.target.value }))}
                                            placeholder="Tracking Number"
                                        />
                                        <input
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-[11px] text-white outline-none focus:ring-4 focus:ring-primary/20 italic font-bold placeholder:text-white/10"
                                            value={trackingData.carrier_name}
                                            onChange={(e) => setTrackingData(prev => ({ ...prev, carrier_name: e.target.value }))}
                                            placeholder="Carrier (e.g. UPS, Fedex)"
                                        />
                                        <button
                                            onClick={() => trackingMutation.mutate(trackingData)}
                                            disabled={trackingMutation.isPending}
                                            className="w-full py-4 bg-primary text-white rounded-full font-bold text-[11px] uppercase tracking-widest italic hover:bg-primary-container transition-all shadow-xl shadow-primary/30 disabled:opacity-50"
                                        >
                                            {trackingMutation.isPending ? 'Syncing...' : 'Update Logistics'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Transaction Security */}
                    <section className="bg-white rounded-[3rem] p-10 border border-outline-variant/20 shadow-sm space-y-10 group/secure">
                        <div className="flex items-center gap-5 border-b border-outline-variant/5 pb-8">
                            <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary border border-outline-variant/10 shadow-sm group-hover/secure:scale-110 transition-transform">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold italic tracking-tighter uppercase font-headline text-on-surface">Payment Audit</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">Method</span>
                                <span className="text-[11px] font-bold text-on-surface uppercase italic underline decoration-primary/10 decoration-2">{order.payment_method?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">Auth Email</span>
                                <span className="text-[11px] font-bold text-on-surface-variant/70 italic truncate max-w-[150px]">{order.user?.email}</span>
                            </div>
                            <div className={`mt-8 py-8 rounded-[2rem] flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest italic shadow-inner ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                                {order.payment_status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                                Verification: {order.payment_status}
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
