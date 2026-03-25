import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
    ShoppingBag, Trash2, Plus, Minus, ArrowRight,
    ShieldCheck, Truck, X, Lock, Tag, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCart, updateCartItem, removeFromCart, applyCoupon, removeCoupon } from '../services/cartService';
import { getFeaturedProducts } from '../services/productService';
import ProductCard from '../components/ui/ProductCard';

// ── Bilingual Label ──────────────────────────────────────────────────────────
const BiLabel = ({ en, ar, className = '' }) => (
    <div className={`flex items-center justify-between ${className}`}>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{en}</span>
        <span className="text-[10px] font-bold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>{ar}</span>
    </div>
);

const CartPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');

    const { data: cartResp, isLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
    });

    const { data: featuredProducts } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: getFeaturedProducts,
    });

    const cart = cartResp;

    const updateMutation = useMutation({
        mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
        onSuccess: () => queryClient.invalidateQueries(['cart']),
    });

    const removeMutation = useMutation({
        mutationFn: (id) => removeFromCart(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('تم الحذف · Item removed');
        },
    });

    const applyMutation = useMutation({
        mutationFn: (code) => applyCoupon(code),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('تم تطبيق الكوبون · Coupon applied');
            setCouponCode('');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'كوبون غير صالح · Invalid coupon'),
    });

    const removeCouponMutation = useMutation({
        mutationFn: removeCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('تم إزالة الكوبون · Coupon removed');
        },
    });

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) return (
        <div className="pt-40 min-h-screen flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-14 h-14 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6">
                    جاري التحميل · Loading Cart...
                </p>
            </div>
        </div>
    );

    // ── Empty State ──────────────────────────────────────────────────────────
    if (!cart || cart.items?.length === 0) return (
        <div className="pt-40 pb-40 flex flex-col items-center justify-center space-y-10 bg-white">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>
            <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <ShoppingBag className="w-16 h-16 text-slate-200" />
            </div>
            <div className="text-center space-y-4">
                <h2 className="text-5xl font-black text-slate-950 tracking-tighter uppercase italic">Your cart is empty.</h2>
                <p className="text-slate-400 text-sm font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    لم تقم بإضافة أي منتجات بعد
                </p>
                <Link to="/shop">
                    <button className="mt-6 bg-slate-950 text-white px-12 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:-translate-y-0.5 transition-all shadow-xl">
                        تسوق الآن · Shop Now
                    </button>
                </Link>
            </div>
        </div>
    );

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>

            <div className="bg-white pt-28 pb-20 min-h-screen selection:bg-slate-950 selection:text-white">
                <main className="max-w-7xl mx-auto px-6 lg:px-12">

                    {/* ── Header ──────────────────────────────────────── */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-8 border-b border-slate-100 gap-6">
                        <div>
                            <div className="flex items-baseline gap-3">
                                <h1 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">
                                    Shopping Cart
                                </h1>
                                <span className="text-3xl font-bold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                    · سلة التسوق
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">
                                راجع منتجاتك قبل إتمام الدفع · Review your items before checkout
                            </p>
                        </div>
                        <div className="px-5 py-3 bg-slate-50 rounded-xl border border-slate-100 italic font-black uppercase tracking-widest text-[10px] text-slate-400 shadow-sm">
                            {cart.items.length} منتج · {cart.items.length} Item{cart.items.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        
                        {/* ── Left: Items ─────────────────────────────── */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="p-6 md:p-8 flex gap-6 md:gap-10 group transition-all">
                                            {/* Image */}
                                            <div className="w-24 h-32 md:w-32 md:h-40 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-inner group-hover:shadow-lg transition-all">
                                                <img 
                                                    src={item.product?.image_url} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                                    alt={item.product?.name} 
                                                />
                                            </div>

                                            {/* Data */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <Link to={`/products/${item.product?.slug}`}>
                                                            <h3 className="text-xl md:text-2xl font-black text-slate-950 tracking-tight uppercase italic hover:text-slate-600 transition-colors">
                                                                {item.product?.name}
                                                            </h3>
                                                        </Link>
                                                        <button 
                                                            onClick={() => removeMutation.mutate(item.id)}
                                                            className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">
                                                        <span>Product Ref: {item.product?.id?.toString().slice(-6)}</span>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                                        <span className="text-slate-300">In Stock</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row md:items-end justify-between mt-6 gap-6">
                                                    <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-inner">
                                                        <button 
                                                            onClick={() => updateMutation.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                                            className="px-4 py-3 hover:bg-slate-200 transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="px-6 text-sm font-black italic tabular-nums">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                                                            className="px-4 py-3 hover:bg-slate-200 transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">Subtotal</span>
                                                        <span className="text-2xl font-black text-slate-950 italic tabular-nums tracking-tighter shadow-slate-900/10">
                                                            ${parseFloat(item.total).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Summary ──────────────────────────── */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-28">
                            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative">
                                {/* Coupon Section */}
                                <div className="p-8 border-b border-white/10 bg-black/20">
                                    <BiLabel en="Promo Code" ar="كود الخصم" className="mb-4" />
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input 
                                                placeholder="MOHANED-20"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition-all"
                                                value={couponCode}
                                                onChange={e => setCouponCode(e.target.value)}
                                            />
                                        </div>
                                        <button 
                                            onClick={() => applyMutation.mutate(couponCode)}
                                            className="px-6 bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all active:scale-95"
                                        >
                                            تطبيق · Apply
                                        </button>
                                    </div>
                                </div>

                                {/* Detailed Totals */}
                                <div className="p-8 space-y-4">
                                    <div className="flex items-baseline gap-3 mb-6">
                                        <h3 className="text-xl font-black tracking-tighter italic uppercase text-white leading-none">Order Summary</h3>
                                        <span className="text-slate-500 font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>· ملخص الطلب</span>
                                    </div>

                                    {[
                                        { en: 'Subtotal', ar: 'المجموع الفردي', val: cart.totals?.subtotal },
                                        ...(cart.totals?.discount > 0 ? [{ en: 'Applied Discount', ar: 'الخصم المطبق', val: -cart.totals?.discount, isDiscount: true }] : []),
                                        { en: 'Express Shipping', ar: 'شحن سريع', val: cart.totals?.shipping },
                                        { en: 'Est. Regulatory Tax', ar: 'الضريبة التقديرية', val: cart.totals?.tax }
                                    ].map((row) => (
                                        <div key={row.en} className="flex justify-between items-center group">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic leading-none">{row.en}</span>
                                                <span className="text-[10px] font-bold text-slate-600 mt-1" style={{ fontFamily: "'Cairo', sans-serif" }}>{row.ar}</span>
                                            </div>
                                            <span className={`text-base font-black italic tabular-nums tracking-tighter shadow-inner ${row.isDiscount ? 'text-emerald-400' : 'text-slate-300'}`}>
                                                {row.val < 0 ? '-' : ''}${Math.abs(parseFloat(row.val || 0)).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Final Total */}
                                    <div className="pt-8 mt-8 border-t border-white/10 flex justify-between items-end">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Total Commitment</p>
                                            <p className="text-3xl font-black uppercase italic text-white tracking-widest">Total</p>
                                            <p className="text-slate-500 font-bold text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>الإجمالي النهائي</p>
                                        </div>
                                        <span className="text-5xl font-black text-amber-400 italic tracking-tighter leading-none tabular-nums animate-pulse">
                                            ${parseFloat(cart.totals?.total || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Checkout Interaction */}
                                    <button 
                                        onClick={() => navigate('/checkout')}
                                        className="w-full mt-10 py-5 bg-white text-slate-950 text-sm font-black uppercase tracking-[0.2em] italic rounded-xl hover:bg-amber-400 transition-all shadow-3xl flex items-center justify-center gap-4 group/btn active:scale-95"
                                    >
                                        إتمام الشراء · Checkout <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                                    </button>

                                    {/* Minimalist Trust */}
                                    <div className="flex items-center justify-center gap-6 pt-10 opacity-30">
                                        {[
                                            { Icon: ShieldCheck, label: 'آمن · Secure' },
                                            { Icon: Lock, label: 'مشفر · SSL' },
                                            { Icon: Truck, label: 'شحن · Shipping' },
                                        ].map(({ Icon, label }) => (
                                            <div key={label} className="flex flex-col items-center gap-1">
                                                <Icon className="w-5 h-5 text-slate-500" />
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* ── You May Also Like ─────────────────────────── */}
                    <section className="mt-24 pt-16 border-t border-slate-100">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tighter italic text-slate-950 leading-none">
                                    You May Also Like
                                    <span className="text-2xl font-bold text-slate-300 ml-4 italic" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                        · قد يعجبك أيضاً
                                    </span>
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">
                                    Curated selections just for you · اختيارات مخصصة لك
                                </p>
                            </div>
                            <Link
                                to="/shop"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 border-b border-slate-300 hover:border-slate-900 pb-0.5 transition-all"
                            >
                                عرض الكل · View All
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts?.slice(0, 4).map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                            {!featuredProducts && (
                                <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                    جاري تحميل المنتجات المقترحة · Loading Suggestions...
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
};

export default CartPage;