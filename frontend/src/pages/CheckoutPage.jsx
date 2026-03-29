import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
    ShieldCheck, Truck, Lock, ArrowRight, CreditCard,
    MapPin, ChevronRight, Check, ArrowLeft, Package,
    Banknote, Wallet,
    Loader2, X, Plus, Minus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getCart } from '../services/cartService';
import { placeOrder } from '../services/orderService';

const CheckoutPage = () => {
    const { user, checkVerificationBeforeOrder } = useAuthStore();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip: '',
        country: 'Egypt',
        payment_method: 'cod',
        notes: ''
    });

    useEffect(() => {
        const verify = async () => {
            await checkVerificationBeforeOrder();
        };
        verify();
    }, [checkVerificationBeforeOrder]);

    const { data: cartResp, isLoading: cartLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
    });
    const cart = cartResp;

    const orderMutation = useMutation({
        mutationFn: (data) => placeOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Order placed successfully! Curation confirmed.');
            navigate('/orders');
        },
        onError: (err) => {
            const errors = err.response?.data?.errors;
            if (errors) Object.values(errors).forEach(e => toast.error(e[0]));
            else toast.error(err.response?.data?.message || 'Checkout protocol failed.');
        }
    });

    const setField = (key, val) => setFormData(p => ({ ...p, [key]: val }));

    const handlePlaceOrder = () => {
        orderMutation.mutate(formData);
    };

    if (cartLoading) {
        return (
            <div className="pt-40 min-h-screen flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Initializing Secure Checkout...</p>
            </div>
        );
    }

    if (!cart || cart.items?.length === 0) {
        navigate('/cart');
        return null;
    }

    const nextStep = () => setStep(s => Math.min(3, s + 1));
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    return (
        <div className="bg-[#fcf8f9] min-h-screen font-headline selection:bg-primary selection:text-white">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}</style>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">

                {/* Progress Indicator */}
                <div className="mb-16">
                    <div className="flex items-center justify-center space-x-4 max-w-md mx-auto">
                        {/* Step 1: Shipping */}
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step > 1 ? 'bg-primary-fixed-dim text-on-primary-fixed' : step === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                                {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step === 1 ? 'text-primary' : 'text-on-surface-variant'}`}>Shipping</span>
                        </div>

                        <div className={`h-[2px] w-12 transition-all ${step > 1 ? 'bg-primary' : 'bg-surface-container-highest'} mb-6`}></div>

                        {/* Step 2: Payment */}
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step > 2 ? 'bg-primary-fixed-dim text-on-primary-fixed' : step === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                                {step > 2 ? <Check className="w-5 h-5" /> : '2'}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step === 2 ? 'text-primary' : 'text-on-surface-variant'}`}>Payment</span>
                        </div>

                        <div className={`h-[2px] w-12 transition-all ${step > 2 ? 'bg-primary' : 'bg-surface-container-highest'} mb-6`}></div>

                        {/* Step 3: Review */}
                        <div className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step === 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                                3
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${step === 3 ? 'text-primary' : 'text-on-surface-variant'}`}>Review</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Section: Interaction */}
                    <div className="lg:col-span-7 space-y-12">
                        <header className="space-y-4 animate-in fade-in duration-700">
                            {step === 1 && (
                                <>
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface italic uppercase leading-tight">Where should we deliver?</h1>
                                    <span className="text-2xl font-bold text-zinc-300 block" style={{ fontFamily: "'Cairo', sans-serif" }}>أين نرسل مشترياتك؟</span>
                                    <p className="text-on-surface-variant text-sm font-medium italic opacity-60">Precision delivery requires exact coordinates. Enter your destination details below.</p>
                                </>
                            )}
                            {step === 2 && (
                                <>
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface italic uppercase leading-tight">Secure your order.</h1>
                                    <span className="text-2xl font-bold text-zinc-300 block" style={{ fontFamily: "'Cairo', sans-serif" }}>اختر طريقة الدفع الآمنة</span>
                                    <p className="text-on-surface-variant text-sm font-medium italic opacity-60">Choose your preferred financial protocol to finalize the transaction.</p>
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-on-surface italic uppercase leading-tight">Final Review.</h1>
                                    <span className="text-2xl font-bold text-zinc-300 block" style={{ fontFamily: "'Cairo', sans-serif" }}>مراجعة أخيرة لتأكيد طلبك</span>
                                    <p className="text-on-surface-variant text-sm font-medium italic opacity-60">Verify your curation details before the final dispatch of your order.</p>
                                </>
                            )}
                        </header>

                        <div className="bg-white/50 backdrop-blur-md p-10 rounded-[2rem] shadow-xl border border-outline-variant/10">

                            {/* STEP 1: SHIPPING INFORMATION */}
                            {step === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-4">Full Name</label>
                                            <input
                                                className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary shadow-sm text-sm font-bold placeholder:text-zinc-300 italic transition-all"
                                                placeholder="e.g. Rose Ahmed"
                                                value={formData.full_name}
                                                onChange={e => setField('full_name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-4">Contact Phone</label>
                                            <input
                                                className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary shadow-sm text-sm font-bold placeholder:text-zinc-300 italic transition-all"
                                                placeholder="+20 1XX XXX XXXX"
                                                value={formData.phone}
                                                onChange={e => setField('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-4">City</label>
                                            <input
                                                className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary shadow-sm text-sm font-bold placeholder:text-zinc-300 italic transition-all"
                                                placeholder="e.g. Cairo"
                                                value={formData.city}
                                                onChange={e => setField('city', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-4">State / Governorate *</label>
                                            <input
                                                className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary shadow-sm text-sm font-bold placeholder:text-zinc-300 italic transition-all"
                                                placeholder="e.g. Cairo / Cairo"
                                                value={formData.state}
                                                onChange={e => setField('state', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-4">Country *</label>
                                            <input
                                                className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary shadow-sm text-sm font-bold placeholder:text-zinc-300 italic transition-all"
                                                placeholder="Egypt"
                                                value={formData.country}
                                                onChange={e => setField('country', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-4">ZIP Code *</label>
                                            <input
                                                className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary shadow-sm text-sm font-bold placeholder:text-zinc-300 italic transition-all"
                                                placeholder="11511"
                                                value={formData.zip}
                                                onChange={e => setField('zip', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-4">Street Address</label>
                                            <input
                                                className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary shadow-sm text-sm font-bold placeholder:text-zinc-300 italic transition-all"
                                                placeholder="Building, Street Name, Area..."
                                                value={formData.address_line1}
                                                onChange={e => setField('address_line1', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-8">
                                        <button
                                            onClick={nextStep}
                                            disabled={!formData.full_name || !formData.address_line1 || !formData.city || !formData.state || !formData.phone || !formData.zip || !formData.country}
                                            className="bg-primary text-on-primary px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] italic hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                                        >
                                            Continue to Payment
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: PAYMENT METHODS */}
                            {step === 2 && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-4">Select Protocol</h3>
                                        <div className="space-y-4">
                                            {/* COD */}
                                            <label className="relative block cursor-pointer group">
                                                <input
                                                    type="radio" name="payment" value="cod" className="peer sr-only"
                                                    checked={formData.payment_method === 'cod'}
                                                    onChange={() => setField('payment_method', 'cod')}
                                                />
                                                <div className="p-8 rounded-[2rem] bg-white border-2 border-transparent peer-checked:border-primary peer-checked:shadow-2xl transition-all flex items-center justify-between group-hover:bg-slate-50">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center transition-transform group-hover:scale-110">
                                                            <Banknote className="w-8 h-8 text-primary" />
                                                        </div>
                                                        <div>
                                                            <span className="block font-black text-lg uppercase italic tracking-tighter text-on-surface">Cash On Delivery</span>
                                                            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest italic opacity-60">Pay upon physical arrival</span>
                                                        </div>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${formData.payment_method === 'cod' ? 'bg-primary border-primary' : 'border-outline-variant'}`}>
                                                        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                                    </div>
                                                </div>
                                            </label>

                                            {/* Card */}
                                            <label className="relative block cursor-pointer group">
                                                <input
                                                    type="radio" name="payment" value="card" className="peer sr-only"
                                                    checked={formData.payment_method === 'card'}
                                                    onChange={() => setField('payment_method', 'card')}
                                                />
                                                <div className="p-8 rounded-[2rem] bg-white border-2 border-transparent peer-checked:border-primary peer-checked:shadow-2xl transition-all flex items-center justify-between group-hover:bg-slate-50">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-2xl bg-primary-fixed flex items-center justify-center transition-transform group-hover:scale-110">
                                                            <CreditCard className="w-8 h-8 text-primary" />
                                                        </div>
                                                        <div>
                                                            <span className="block font-black text-lg uppercase italic tracking-tighter text-on-surface">Visa / Mastercard</span>
                                                            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest italic opacity-60">Secure digital transaction</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100">
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                                                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                                                    </div>
                                                </div>
                                            </label>

                                            {/* Wallet */}
                                            <label className="relative block cursor-pointer group">
                                                <input
                                                    type="radio" name="payment" value="vodafone" className="peer sr-only"
                                                    checked={formData.payment_method === 'vodafone'}
                                                    onChange={() => setField('payment_method', 'vodafone')}
                                                />
                                                <div className="p-8 rounded-[2rem] bg-white border-2 border-transparent peer-checked:border-primary peer-checked:shadow-2xl transition-all flex items-center justify-between group-hover:bg-slate-50">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-2xl bg-[#E60000]/10 flex items-center justify-center transition-transform group-hover:scale-110">
                                                            <Wallet className="w-8 h-8 text-[#E60000]" />
                                                        </div>
                                                        <div>
                                                            <span className="block font-black text-lg uppercase italic tracking-tighter text-on-surface">Vodafone Cash</span>
                                                            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest italic opacity-60">Wallet payment protocol</span>
                                                        </div>
                                                    </div>
                                                    <img src="https://logowik.com/content/uploads/images/vodafone-cash4454.jpg" className="h-10 grayscale group-hover:grayscale-0 transition-all" alt="Vodafone" />
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    {formData.payment_method === 'card' && (
                                        <div className="pt-10 border-t border-outline-variant/10 space-y-6 animate-in slide-in-from-top-4 duration-500">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic px-4">Card Credentials (Optional for Demo)</p>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="col-span-2">
                                                    <input className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary shadow-sm text-sm font-bold placeholder:text-zinc-200 italic" placeholder="0000 0000 0000 0000" />
                                                </div>
                                                <input className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary shadow-sm text-sm font-bold placeholder:text-zinc-200 italic" placeholder="MM / YY" />
                                                <input className="w-full bg-white border-none rounded-full px-8 py-5 focus:ring-2 focus:ring-primary shadow-sm text-sm font-bold placeholder:text-zinc-200 italic" placeholder="CVC" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-10">
                                        <button onClick={prevStep} className="flex items-center gap-3 text-on-surface-variant font-black text-[11px] uppercase tracking-widest hover:text-primary transition-all italic">
                                            <ArrowLeft className="w-4 h-4" />
                                            Destination Details
                                        </button>
                                        <button onClick={nextStep} className="bg-primary text-on-primary px-14 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] italic hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20">
                                            Review Curation
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: FINAL REVIEW */}
                            {step === 3 && (
                                <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic border-l-2 border-primary pl-4">Delivery Route</h4>
                                            <div className="bg-white p-6 rounded-3xl space-y-2">
                                                <p className="text-sm font-black text-on-surface uppercase italic tracking-tight">{formData.full_name}</p>
                                                <p className="text-xs font-medium text-on-surface-variant italic leading-relaxed">{formData.address_line1}, {formData.city}, {formData.country}</p>
                                                <p className="text-xs font-bold text-on-surface-variant italic">{formData.phone}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic border-l-2 border-primary pl-4">Financing</h4>
                                            <div className="bg-white p-6 rounded-3xl flex items-center gap-4">
                                                <div className="w-12 h-12 bg-primary-fixed rounded-2xl flex items-center justify-center">
                                                    {formData.payment_method === 'cod' ? <Banknote className="w-6 h-6 text-primary" /> : <CreditCard className="w-6 h-6 text-primary" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-on-surface uppercase italic tracking-tight">{formData.payment_method.toUpperCase()}</p>
                                                    <p className="text-[10px] font-bold text-on-surface-variant italic uppercase tracking-widest">Verified Selection</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic border-l-2 border-primary pl-4">Curation Notes</h4>
                                        <textarea
                                            className="w-full bg-white border-none rounded-[2rem] px-8 py-6 focus:ring-2 focus:ring-primary shadow-sm text-sm font-medium italic placeholder:text-zinc-200 resize-none h-32"
                                            placeholder="Special instructions for the courier..."
                                            value={formData.notes}
                                            onChange={e => setField('notes', e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-10 border-t border-outline-variant/10">
                                        <button onClick={prevStep} className="flex items-center gap-3 text-on-surface-variant font-black text-[11px] uppercase tracking-widest hover:text-primary transition-all italic">
                                            <ArrowLeft className="w-4 h-4" />
                                            Modify Protocol
                                        </button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={orderMutation.isPending || !formData.full_name || !formData.address_line1 || !formData.city || !formData.state || !formData.phone || !formData.zip || !formData.country}
                                            className="bg-primary text-on-primary px-16 py-6 rounded-full font-black text-xs uppercase tracking-[0.4em] italic hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center gap-4 disabled:opacity-50"
                                        >
                                            {orderMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                            Final Dispatch
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Right Sidebar: Summary */}
                    <aside className="lg:col-span-5 sticky top-40">
                        <div className="bg-primary-fixed p-10 md:p-14 rounded-[3rem] space-y-12 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                            <h2 className="text-3xl font-black italic tracking-tighter text-on-primary-fixed uppercase relative z-10 leading-none">Order Summary</h2>

                            <div className="space-y-8 relative z-10 max-h-[30vh] overflow-y-auto pr-4 scrollbar-hide">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex gap-6 group">
                                        <div className="w-20 h-24 rounded-[1.5rem] overflow-hidden flex-shrink-0 bg-white border border-primary/10 shadow-lg group-hover:scale-105 transition-all">
                                            <img className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" src={item.product?.image_url} alt="" />
                                        </div>
                                        <div className="flex flex-col justify-between py-2 flex-1">
                                            <div>
                                                <h4 className="font-black text-on-primary-fixed text-sm uppercase italic tracking-tighter leading-tight group-hover:text-primary transition-colors line-clamp-2">{item.product?.name}</h4>
                                                <p className="text-[10px] font-bold text-on-primary-fixed-variant uppercase tracking-widest mt-1 opacity-60 italic">{item.quantity} x ${item.price}</p>
                                            </div>
                                            <span className="font-black text-primary text-lg italic tracking-tighter tabular-nums">${item.total}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-10 border-t border-primary-container/40 space-y-4 relative z-10">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-primary-fixed-variant italic">
                                    <span>Subtotal Registry</span>
                                    <span className="text-sm italic">${parseFloat(cart.totals?.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">
                                    <span>Shipping (Standard)</span>
                                    <span className="text-sm italic">FREE</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-on-primary-fixed-variant italic">
                                    <span>Tax Allocation</span>
                                    <span className="text-sm italic">${parseFloat(cart.totals?.tax || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-3xl font-extrabold text-on-primary-fixed pt-6 italic tracking-tighter">
                                    <span>Total Value</span>
                                    <span className="text-primary">${parseFloat(cart.totals?.total || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2rem] flex items-start gap-4 relative z-10 border border-white/40">
                                <ShieldCheck className="w-6 h-6 text-primary mt-1" />
                                <div>
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-primary-fixed italic">Secure Protocol Activated</h5>
                                    <p className="text-[9px] text-on-primary-fixed-variant mt-2 leading-relaxed italic font-medium">Your data is protected by industry-standard encryption for an absolute curation experience.</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPage;