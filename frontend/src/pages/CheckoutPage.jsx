import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import {
    ShieldCheck, Truck, Lock, ArrowRight, CreditCard,
    Banknote, Building, Zap, MapPin, Info, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCart } from '../services/cartService';
import { placeOrder } from '../services/orderService';

// ── Bilingual Label ──────────────────────────────────────────────────────────
const BiLabel = ({ en, ar, required }) => (
    <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            {en}{required && <span className="text-red-400 ml-1">*</span>}
        </span>
        <span className="text-[10px] font-bold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {ar}{required && <span className="text-red-300 mr-1"> *</span>}
        </span>
    </div>
);

const inputCls = "w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all placeholder:text-slate-300";

// ── Section Block ────────────────────────────────────────────────────────────
const Section = ({ icon: Icon, en, ar, children }) => (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 px-7 py-5 border-b border-slate-100 bg-slate-50">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <div className="flex items-baseline gap-2">
                    <h3 className="font-black uppercase tracking-tighter italic text-slate-900 text-lg leading-none">{en}</h3>
                    <span className="text-slate-400 font-bold text-base" style={{ fontFamily: "'Cairo', sans-serif" }}>· {ar}</span>
                </div>
            </div>
        </div>
        <div className="p-7">{children}</div>
    </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────
const CheckoutPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        full_name: '', phone: '', address_line1: '', address_line2: '',
        city: '', state: '', zip: '', country: 'Egypt',
        payment_method: 'cod', notes: ''
    });
    const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

    const { data: cartResp, isLoading: cartLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
    });
    const cart = cartResp;

    const orderMutation = useMutation({
        mutationFn: (data) => placeOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('تم تأكيد الطلب · Order placed successfully!');
            navigate('/orders');
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) Object.values(errors).forEach(e => toast.error(e[0]));
            else toast.error(err.response?.data?.message || 'فشل الطلب · Checkout failed');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        orderMutation.mutate(formData);
    };

    if (cartLoading) return (
        <div className="pt-40 min-h-screen flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                جاري التحميل · Preparing Checkout...
            </p>
        </div>
    );

    if (!cart || cart.items?.length === 0) {
        navigate('/cart');
        return null;
    }

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>

            <div className="bg-white pt-28 pb-20 min-h-screen">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">

                    {/* ── Header ──────────────────────────────────────── */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-8 border-b border-slate-100 gap-6">
                        <div>
                            <div className="flex items-baseline gap-3">
                                <h1 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">
                                    Checkout
                                </h1>
                                <span className="text-3xl font-bold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                    · إتمام الطلب
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">
                                أكمل بياناتك لتأكيد طلبك · Complete your details to confirm your order
                            </p>
                        </div>
                        <div className="flex items-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 font-black uppercase tracking-widest text-[10px]">
                            <ShieldCheck className="w-4 h-4" />
                            <span>آمن ومشفر · Secure Checkout</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                            {/* ── Left: Form ──────────────────────────── */}
                            <div className="lg:col-span-7 space-y-6">

                                {/* Shipping Address */}
                                <Section icon={MapPin} en="Shipping Address" ar="عنوان الشحن">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                        <div>
                                            <BiLabel en="Full Name" ar="الاسم الكامل" required />
                                            <input
                                                className={inputCls}
                                                placeholder="Ahmed Mohamed"
                                                required
                                                value={formData.full_name}
                                                onChange={e => set('full_name', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <BiLabel en="Phone Number" ar="رقم الهاتف" required />
                                            <input
                                                className={inputCls}
                                                placeholder="+20 1XX XXX XXXX"
                                                required
                                                value={formData.phone}
                                                onChange={e => set('phone', e.target.value)}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <BiLabel en="Street Address" ar="عنوان الشارع" required />
                                            <input
                                                className={inputCls}
                                                placeholder="123 شارع التحرير، القاهرة"
                                                required
                                                value={formData.address_line1}
                                                onChange={e => set('address_line1', e.target.value)}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <BiLabel en="Apartment / Floor (Optional)" ar="شقة / دور (اختياري)" />
                                            <input
                                                className={inputCls}
                                                placeholder="Apt 4B · الدور الرابع"
                                                value={formData.address_line2}
                                                onChange={e => set('address_line2', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <BiLabel en="City" ar="المدينة" required />
                                            <input
                                                className={inputCls}
                                                placeholder="القاهرة · Cairo"
                                                required
                                                value={formData.city}
                                                onChange={e => set('city', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <BiLabel en="State / Governorate" ar="المحافظة" required />
                                            <input
                                                className={inputCls}
                                                placeholder="القاهرة · Cairo"
                                                required
                                                value={formData.state}
                                                onChange={e => set('state', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <BiLabel en="ZIP / Postal Code" ar="الرمز البريدي" />
                                            <input
                                                className={inputCls}
                                                placeholder="11511"
                                                value={formData.zip}
                                                onChange={e => set('zip', e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <BiLabel en="Country" ar="الدولة" required />
                                            <input
                                                className={inputCls}
                                                placeholder="Egypt · مصر"
                                                required
                                                value={formData.country}
                                                onChange={e => set('country', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </Section>

                                {/* Payment Method */}
                                <Section icon={CreditCard} en="Payment Method" ar="طريقة الدفع">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { id: 'cod', icon: Banknote, en: 'Cash on Delivery', ar: 'الدفع عند الاستلام', desc_en: 'Pay when you receive', desc_ar: 'ادفع عند وصول طلبك' },
                                            { id: 'bank', icon: Building, en: 'Bank Transfer', ar: 'تحويل بنكي', desc_en: 'Direct wire transfer', desc_ar: 'تحويل إلكتروني مباشر' },
                                        ].map((method) => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => set('payment_method', method.id)}
                                                className={`p-5 rounded-xl border-2 text-left transition-all flex items-start gap-4 ${
                                                    formData.payment_method === method.id
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                                                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
                                                }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${formData.payment_method === method.id ? 'bg-white/10' : 'bg-white border border-slate-100'}`}>
                                                    <method.icon className={`w-5 h-5 ${formData.payment_method === method.id ? 'text-amber-400' : 'text-slate-400'}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-baseline gap-2 flex-wrap">
                                                        <h5 className={`font-black uppercase tracking-tighter italic text-base leading-none ${formData.payment_method === method.id ? 'text-white' : 'text-slate-800'}`}>
                                                            {method.en}
                                                        </h5>
                                                        <span className={`text-xs font-bold ${formData.payment_method === method.id ? 'text-slate-400' : 'text-slate-300'}`} style={{ fontFamily: "'Cairo', sans-serif" }}>
                                                            · {method.ar}
                                                        </span>
                                                    </div>
                                                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${formData.payment_method === method.id ? 'text-slate-400' : 'text-slate-300'}`}>
                                                        {method.desc_en} · {method.desc_ar}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </Section>

                                {/* Order Notes */}
                                <Section icon={Info} en="Order Notes" ar="ملاحظات الطلب">
                                    <BiLabel en="Additional Instructions (Optional)" ar="تعليمات إضافية (اختياري)" />
                                    <textarea
                                        className={inputCls + " min-h-[100px] resize-none"}
                                        placeholder="ملاحظات خاصة بالتوصيل · Special delivery instructions..."
                                        value={formData.notes}
                                        onChange={e => set('notes', e.target.value)}
                                    />
                                </Section>

                                {/* Mobile Submit */}
                                <button
                                    type="submit"
                                    disabled={orderMutation.isPending}
                                    className="lg:hidden w-full py-4 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 shadow-xl"
                                >
                                    {orderMutation.isPending
                                        ? <span className="animate-pulse">جاري التأكيد...</span>
                                        : <><span>تأكيد الطلب · Confirm Order</span><ArrowRight className="w-4 h-4" /></>
                                    }
                                </button>
                            </div>

                            {/* ── Right: Summary ──────────────────────── */}
                            <aside className="lg:col-span-5 lg:sticky lg:top-28">
                                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">

                                    {/* Summary Header */}
                                    <div className="px-8 py-6 border-b border-white/10">
                                        <div className="flex items-baseline gap-3">
                                            <h3 className="text-2xl font-black tracking-tighter italic uppercase text-white">Order Summary</h3>
                                            <span className="text-slate-500 font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>· ملخص الطلب</span>
                                        </div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                            {cart.items.length} منتج · {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>

                                    {/* Items List */}
                                    <div className="px-8 py-5 space-y-4 max-h-64 overflow-y-auto">
                                        {cart.items.map((item) => (
                                            <div key={item.id} className="flex gap-4 group">
                                                <div className="w-14 h-16 bg-white/5 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                                    <img
                                                        src={item.product?.image_url}
                                                        className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                                        alt=""
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center min-w-0">
                                                    <h4 className="font-black uppercase tracking-tighter text-sm italic text-white truncate leading-tight">
                                                        {item.product?.name}
                                                    </h4>
                                                    <div className="flex justify-between items-center mt-1">
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                            {item.quantity}x · ${item.price}
                                                        </span>
                                                        <span className="font-black text-amber-400 text-sm italic tabular-nums">
                                                            ${item.total}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div className="px-8 py-6 border-t border-white/10 space-y-3">
                                        {[
                                            { en: 'Subtotal', ar: 'المجموع', value: `$${parseFloat(cart.totals?.subtotal || 0).toFixed(2)}`, color: 'text-slate-400' },
                                            ...(cart.totals?.discount > 0 ? [{
                                                en: 'Discount', ar: 'الخصم',
                                                value: `-$${parseFloat(cart.totals?.discount || 0).toFixed(2)}`, color: 'text-emerald-400'
                                            }] : []),
                                            { en: 'Shipping', ar: 'الشحن', value: parseFloat(cart.totals?.shipping) === 0 ? 'مجاني · FREE' : `$${cart.totals?.shipping}`, color: parseFloat(cart.totals?.shipping) === 0 ? 'text-emerald-400' : 'text-slate-400' },
                                            { en: 'Tax', ar: 'الضريبة', value: `$${parseFloat(cart.totals?.tax || 0).toFixed(2)}`, color: 'text-slate-400' },
                                        ].map(({ en, ar, value, color }) => (
                                            <div key={en} className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{en}</span>
                                                    <span className="text-[9px] text-slate-600 font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>· {ar}</span>
                                                </div>
                                                <span className={`font-black text-sm italic tabular-nums ${color}`}>{value}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Grand Total */}
                                    <div className="px-8 py-5 bg-black/20 flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-black uppercase tracking-tighter italic text-lg">Total</p>
                                            <p className="text-slate-500 text-sm font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>الإجمالي</p>
                                        </div>
                                        <span className="text-4xl font-black text-amber-400 italic tracking-tighter tabular-nums">
                                            ${parseFloat(cart.totals?.total || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    {/* CTA */}
                                    <div className="p-6">
                                        <button
                                            type="submit"
                                            disabled={orderMutation.isPending}
                                            className="w-full py-4 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-amber-400 transition-all disabled:opacity-50 shadow-lg active:scale-[0.99]"
                                        >
                                            {orderMutation.isPending ? (
                                                <span className="animate-pulse">جاري التأكيد · Confirming...</span>
                                            ) : (
                                                <>
                                                    <span>تأكيد الطلب · Confirm Order</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </button>

                                        {/* Trust */}
                                        <div className="flex items-center justify-center gap-6 mt-5 opacity-30">
                                            {[
                                                { Icon: ShieldCheck, label: 'آمن · Secure' },
                                                { Icon: Lock, label: 'مشفر · Encrypted' },
                                                { Icon: Truck, label: 'شحن · Shipping' },
                                            ].map(({ Icon, label }) => (
                                                <div key={label} className="flex flex-col items-center gap-1">
                                                    <Icon className="w-4 h-4 text-white" />
                                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Back to Cart */}
                                <Link
                                    to="/cart"
                                    className="flex items-center justify-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                                    العودة للسلة · Back to Cart
                                </Link>
                            </aside>

                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;