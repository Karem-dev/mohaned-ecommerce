import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Truck,
    CheckCircle,
    Clock,
    Archive,
    Search,
    Package,
    MapPin,
    ArrowRight,
    Loader2,
    ChevronLeft,
    Phone,
    MessageSquare,
    Home,
    Map,
    ShoppingBasket
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import useAuthStore from '../store/authStore';

// ── Bilingual Helper ────────────────────────────────────────────────────────
const BiText = ({ en, ar, className = "", sub = false }) => (
    <div className={`flex flex-col ${className}`}>
        <span className={`${sub ? 'text-[9px]' : 'text-xs'} font-black uppercase tracking-widest text-on-surface-variant italic`}>{en}</span>
        <span className={`${sub ? 'text-[10px]' : 'text-sm'} font-bold text-on-surface`} style={{ fontFamily: "'Cairo', sans-serif" }}>{ar}</span>
    </div>
);

const OrderTrackingPage = () => {
    const { orderNumber } = useParams();
    const { token } = useAuthStore();
    const navigate = useNavigate();

    const { data: orderResp, isLoading } = useQuery({
        queryKey: ['orderTracking', orderNumber],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/orders/${orderNumber}`);
            return data;
        },
        enabled: !!token && !!orderNumber
    });

    const order = orderResp?.data || orderResp;

    const steps = [
        { key: 'pending', en: 'Order Placed', ar: 'تم استلام الطلب', icon: Archive },
        { key: 'processing', en: 'Processing', ar: 'جاري التجهيز', icon: Loader2 },
        { key: 'shipped', en: 'Shipped', ar: 'تم الشحن', icon: Truck },
        { key: 'delivered', en: 'Out for Delivery', ar: 'خارج للتوصيل', icon: MapPin },
        { key: 'completed', en: 'Delivered', ar: 'تم الاستلام بنجاح', icon: Home }
    ];

    const getActiveStep = () => {
        const orderStatus = order?.status?.toLowerCase();
        if (orderStatus === 'cancelled') return -1;
        const index = steps.findIndex(s => s.key === orderStatus);
        return index !== -1 ? index : 1; // Default to processing if unusual status
    };

    const activeIndex = getActiveStep();

    if (isLoading) return (
        <div className="pt-40 min-h-screen text-center bg-[#fcf8f9]">
            <Loader2 className="inline-block w-12 h-12 text-primary animate-spin" />
            <p className="mt-8 font-black text-slate-400 uppercase tracking-widest text-[10px] italic">Locating Shipment · جاري تتبع الشحنة...</p>
        </div>
    );

    if (!order) return (
        <div className="pt-40 text-center py-40 bg-[#fcf8f9] min-h-screen px-6">
            <h2 className="text-4xl font-black uppercase italic text-on-surface mb-8">Shipment Not Indexed · تتبع غير متوفر</h2>
            <Link to="/orders" className="px-10 py-5 bg-primary text-white font-bold uppercase tracking-widest rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95">View Registry · العودة للسجل</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#fcf8f9] pt-32 pb-40 font-manrope selection:bg-primary selection:text-white antialiased">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Cairo:wght@400;600;700;900&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}</style>

            <main className="max-w-7xl mx-auto px-6 lg:ml-72">

                {/* Header Section */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-12">
                    <div>
                        <nav className="flex items-center gap-2 mb-6">
                            <Link to="/orders" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors italic">
                                <ChevronLeft className="w-3 h-3" />
                                Orders · الطلبات
                            </Link>
                            <span className="text-zinc-300">/</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Tracking · تتبع</span>
                        </nav>
                        <h1 className="text-5xl font-black tracking-tighter text-on-surface italic uppercase leading-none mb-3">Order Tracking</h1>
                        <p className="text-primary font-bold italic text-sm tracking-widest flex items-center gap-2 uppercase">
                            Registry: <span className="text-on-surface">RG-{order.order_number.slice(-8)}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <BiText en="Tracking ID" ar={`رقم التتبع: ${order.tracking_number || 'ST-' + order.id}`} sub className="items-end" />
                        <p className="text-2xl font-black text-on-surface italic tracking-tight mt-1">{order.tracking_number || 'PENDING DISPATCH'}</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Tracking Content */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Visual Tracker */}
                        <section className="bg-white p-10 rounded-[3rem] shadow-xl border border-outline-variant/10 relative overflow-hidden group">
                            <div className="flex justify-between items-end mb-16 relative z-10">
                                <div>
                                    <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-2 italic">Estimated Handover</h2>
                                    <p className="text-4xl font-black text-primary italic tracking-tighter uppercase leading-none">
                                        {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Pending Dispatch'}
                                    </p>
                                    <span className="text-lg font-bold text-zinc-400 block mt-2" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                        {order.estimated_delivery ? `موعد التسليم المتوقع: ${new Date(order.estimated_delivery).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' })}` : 'بانتظار تحديد موعد الشحن'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-zinc-300 uppercase tracking-[0.3em] font-black mb-2 italic">Carrier Protocol</p>
                                    <p className="font-black italic uppercase tracking-tighter text-on-surface">
                                        {order.carrier_name || 'Rose Galerie Express'}
                                    </p>
                                </div>
                            </div>

                            {/* Logistic Stepper */}
                            <div className="relative pt-8 pb-12">
                                {/* Background Path */}
                                <div className="absolute top-12 left-[5%] right-[5%] h-1 bg-[#fcf8f9] rounded-full" />
                                {/* Active Path */}
                                <div
                                    className="absolute top-12 left-[5%] h-1 bg-primary rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.max(0, (activeIndex / (steps.length - 1)) * 90)}%` }}
                                />

                                <div className="relative flex justify-between px-2">
                                    {steps.map((step, idx) => {
                                        const isCompleted = idx < activeIndex;
                                        const isActive = idx === activeIndex;
                                        const isFuture = idx > activeIndex;

                                        return (
                                            <div key={idx} className="flex flex-col items-center text-center max-w-[120px] group/step">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 shadow-2xl transition-all duration-700 ${isCompleted ? 'bg-primary text-white scale-90 opacity-70' : isActive ? 'bg-primary text-white ring-8 ring-primary/10 scale-110' : 'bg-[#fcf8f9] text-zinc-300'}`}>
                                                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <step.icon className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />}
                                                </div>
                                                <div className="mt-8 space-y-1">
                                                    <h4 className={`text-[9px] font-black uppercase tracking-tighter transition-colors ${isActive ? 'text-primary' : 'text-zinc-400'}`}>{step.en}</h4>
                                                    <p className={`text-[10px] font-bold ${isActive ? 'text-on-surface' : 'text-zinc-300'}`} style={{ fontFamily: "'Cairo', sans-serif" }}>{step.ar}</p>
                                                    {isActive && (
                                                        <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-2 animate-ping" />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Cartographic Visualization */}
                        <div className="relative h-80 rounded-[3rem] overflow-hidden shadow-2xl border border-outline-variant/10 group cursor-crosshair">
                            <div className="absolute inset-0 bg-slate-900 overflow-hidden">
                                <Map className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-110 transition-transform duration-[10s]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                            </div>

                            {/* Live Tracking Marker */}
                            <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-3xl ring-8 ring-primary/10 animate-pulse z-10">
                                <Truck className="w-8 h-8" />
                            </div>

                            <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/20 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                                        <MapPin className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <BiText en="Geographic Status" ar={order.current_location_desc ? "الحالة اللوجستية" : "الموقع التقريبي"} sub className="text-white opacity-80" />
                                        <p className="text-lg font-black text-white italic tracking-tighter">
                                            {order.current_location_desc || (getActiveStep() >= 2 ? "Approx. 2.4 Kilometers from Destination" : "Pending Handover to Logistics")}
                                        </p>
                                    </div>
                                </div>
                                <button className="bg-white text-on-surface px-8 py-4 rounded-full font-black text-[9px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl">
                                    Digital Concierge
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Details */}
                    <div className="lg:col-span-1 space-y-12">

                        {/* Order Snapshot */}
                        <section className="bg-white p-8 rounded-[3rem] border border-outline-variant/10 shadow-sm space-y-8">
                            <div className="flex items-center gap-4 mb-4">
                                <ShoppingBasket className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-black italic uppercase tracking-tighter">Manifest Summary</h3>
                            </div>
                            <div className="space-y-6">
                                {order.items?.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-20 h-24 bg-[#fcf8f9] rounded-2xl overflow-hidden shrink-0 border border-primary/5">
                                            <img src={item.product?.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="" />
                                        </div>
                                        <div className="flex flex-col justify-center gap-1">
                                            <h4 className="text-xs font-black uppercase tracking-tighter line-clamp-1">{item.name}</h4>
                                            <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest italic">{item.variant_label || 'Standard Collection'}</p>
                                            <p className="text-sm font-black text-primary italic tracking-tighter mt-1">${parseFloat(item.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-8 border-t border-outline-variant/10 space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                                    <span>Base Value</span>
                                    <span className="text-on-surface tabular-nums">${parseFloat(order.subtotal).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                                    <span>Loyalty Protocol</span>
                                    <span>-${parseFloat(order.discount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <BiText en="Total Commitment" ar="المجموع الكلي" sub />
                                    <span className="text-3xl font-black text-primary italic tracking-tighter">${parseFloat(order.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </section>

                        {/* Logistics Coordinates */}
                        <section className="bg-[#1c1b1c] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                            <MapPin className="absolute -top-4 -right-4 w-24 h-24 opacity-5 rotate-12" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 italic">Delivery Coordinates</h3>
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Package className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Authenticated Recipient</p>
                                        <p className="text-sm font-black italic uppercase tracking-tighter">{order.shipping_address?.full_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                        <Home className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Destination</p>
                                        <p className="text-xs font-bold text-zinc-300 leading-relaxed uppercase tracking-widest">{order.shipping_address?.address_line1}</p>
                                        <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">{order.shipping_address?.city}, {order.shipping_address?.country}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Logistics Support */}
                        <div className="bg-primary/5 p-8 rounded-[3rem] border border-primary/10 space-y-6">
                            <div className="flex items-center gap-4">
                                <Phone className="w-5 h-5 text-primary" />
                                <h3 className="text-xs font-black uppercase tracking-widest italic">Logistic Aid</h3>
                            </div>
                            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">Our logistics protocol ensures maximum speed. Contact our curators if any deviation occurs from the estimated schedule.</p>
                            <button className="w-full py-4 bg-white border border-outline-variant/10 text-primary font-bold rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-xl">
                                Curatorial Support · مساعدة لخدمات التتبع
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderTrackingPage;
