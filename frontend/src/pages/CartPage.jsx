import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getCart, updateCartItem, removeFromCart, applyCoupon, removeCoupon } from '../services/cartService';
import { getFeaturedProducts } from '../services/productService';
import ProductCard from '../components/ui/ProductCard';
import useAuthStore from '../store/authStore';

const CartPage = () => {
    const { user, checkVerificationBeforeOrder } = useAuthStore();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    const { data: cart, isLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
    });

    const { data: featuredProducts } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: getFeaturedProducts,
    });

    const updateMutation = useMutation({
        mutationFn: ({ itemId, quantity }) => updateCartItem(itemId, quantity),
        onSuccess: () => queryClient.invalidateQueries(['cart']),
    });

    const removeMutation = useMutation({
        mutationFn: (id) => removeFromCart(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Removed from collection.');
        },
    });

    const applyMutation = useMutation({
        mutationFn: (code) => applyCoupon(code),
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Promo protocol applied.');
            setCouponCode('');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Invalid promo code.'),
    });

    const removeCouponMutation = useMutation({
        mutationFn: removeCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Promo removed.');
        },
    });

    if (isLoading) return (
        <div className="pt-40 min-h-screen bg-surface px-6 md:px-12">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="h-20 w-64 bg-white/50 rounded-3xl animate-pulse" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    <div className="lg:col-span-7 space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-44 bg-white/50 rounded-[2rem] animate-pulse" />
                        ))}
                    </div>
                    <div className="lg:col-span-5 h-[500px] bg-white/50 rounded-[2.5rem] animate-pulse" />
                </div>
            </div>
        </div>
    );

    if (!cart || cart.items?.length === 0) return (
        <div className="pt-40 pb-40 flex flex-col items-center justify-center space-y-12 bg-surface">
            <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center editorial-shadow">
                <span className="material-symbols-outlined text-6xl text-primary/20" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
            </div>
            <div className="text-center space-y-6">
                <h2 className="text-5xl font-extrabold text-on-surface tracking-tighter uppercase italic">Your Cart is Empty.</h2>
                <p className="text-on-surface-variant text-base italic">The collection awaits your discovery.</p>
                <Link to="/shop">
                    <button className="mt-8 px-16 py-5 bg-primary text-white rounded-full font-bold uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20">
                        Explore Shop
                    </button>
                </Link>
            </div>
        </div>
    );


    return (
        <div className="bg-surface pt-20 pb-24 min-h-screen antialiased">
            <main className="max-w-7xl mx-auto px-6 lg:px-12 pt-16">
                {/* Welcome Header */}
                <header className="mb-16">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-on-surface mb-3 uppercase italic">Your Cart.</h1>
                    <p className="text-on-surface-variant text-lg italic">Review your editorial selections before transitioning.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    {/* Left Column: Cart Items (60%) */}
                    <section className="lg:col-span-7 space-y-8">
                        {cart.items.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-2xl flex flex-col md:flex-row gap-8 items-center group transition-all editorial-shadow border border-outline-variant/10">
                                <div className="w-32 h-44 bg-surface-container-high rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                                    <img 
                                        src={item.product?.image_url} 
                                        alt={item.product?.name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                    />
                                </div>
                                <div className="flex-grow space-y-4 w-full">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Link to={`/products/${item.product?.slug}`}>
                                                <h3 className="text-2xl font-bold text-on-surface hover:text-primary transition-colors tracking-tight">{item.product?.name}</h3>
                                            </Link>
                                            {item.variant_label && (
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1 italic">{item.variant_label}</p>
                                            )}
                                            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold mt-1">Ref: {item.product?.id?.toString().slice(-6)}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-primary italic tracking-tighter">${parseFloat(item.total).toFixed(2)}</span>
                                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">${parseFloat(item.product?.price).toFixed(2)} / UNIT</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4">
                                        <div className="flex items-center bg-surface rounded-full p-1 border border-outline-variant/30 min-w-32 justify-between">
                                            {updateMutation.isPending && updateMutation.variables?.itemId === item.id ? (
                                                <div className="w-full h-10 flex items-center justify-center">
                                                    <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                </div>
                                            ) : (
                                                <>
                                                    <button 
                                                        onClick={() => updateMutation.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                                                        disabled={updateMutation.isPending || removeMutation.isPending}
                                                        className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-white disabled:opacity-30"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">remove</span>
                                                    </button>
                                                    <span className="px-4 font-bold text-lg tabular-nums text-on-surface italic">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                                                        disabled={updateMutation.isPending || removeMutation.isPending}
                                                        className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all rounded-full hover:bg-white disabled:opacity-30"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">add</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => removeMutation.mutate(item.id)}
                                            disabled={updateMutation.isPending || (removeMutation.isPending && removeMutation.variables === item.id)}
                                            className="text-on-surface-variant hover:text-error transition-all p-3 hover:bg-error/5 rounded-full disabled:opacity-30"
                                        >
                                            <span className="material-symbols-outlined">
                                                {removeMutation.isPending && removeMutation.variables === item.id ? 'sync' : 'delete'}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Promo Code */}
                        <div className="pt-12">
                            <div className="flex gap-4">
                                <input 
                                    className="flex-grow bg-white border border-outline-variant/30 rounded-full px-8 py-4 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-body text-on-surface" 
                                    placeholder="Enter Promo Code" 
                                    type="text" 
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value)}
                                />
                                <button 
                                    onClick={() => applyMutation.mutate(couponCode)}
                                    className="px-10 py-4 rounded-full bg-secondary-container text-on-secondary-container font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-opacity whitespace-nowrap"
                                >
                                    Apply
                                </button>
                            </div>
                            {cart.totals?.discount > 0 && (
                                <button 
                                    onClick={() => removeCouponMutation.mutate()}
                                    className="mt-4 text-[10px] font-bold text-error uppercase tracking-widest ml-8 hover:underline"
                                >
                                    Remove Applied Discount
                                </button>
                            )}
                        </div>
                    </section>

                    {/* Right Column: Order Summary (40%) */}
                    <aside className="lg:col-span-5 bg-white p-10 rounded-[2.5rem] editorial-shadow border border-outline-variant/10 sticky top-32">
                        <h2 className="text-3xl font-extrabold mb-10 tracking-tighter uppercase italic text-on-surface">Order Summary</h2>
                        
                        <div className="space-y-5 mb-10">
                            <div className="flex justify-between items-center group">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Subtotal</span>
                                <span className="text-xl font-bold text-on-surface tabular-nums">${parseFloat(cart.totals?.subtotal).toFixed(2)}</span>
                            </div>
                            {cart.totals?.discount > 0 && (
                                <div className="flex justify-between items-center group">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">Applied Discount</span>
                                    <span className="text-xl font-bold text-emerald-600 tabular-nums">-${parseFloat(cart.totals?.discount).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center group">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Shipping</span>
                                <span className="text-xl font-bold text-primary uppercase italic tracking-tighter">{parseFloat(cart.totals?.shipping) === 0 ? 'FREE' : `$${parseFloat(cart.totals?.shipping).toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between items-center group">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">Estimated Tax</span>
                                <span className="text-xl font-bold text-on-surface tabular-nums">${parseFloat(cart.totals?.tax).toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="h-px bg-outline-variant/20 mb-8"></div>
                        
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant">Total Commitment</span>
                                <p className="text-2xl font-extrabold text-on-surface uppercase italic">Total</p>
                            </div>
                            <span className="text-5xl font-extrabold text-primary italic tracking-tighter tabular-nums">${parseFloat(cart.totals?.total).toFixed(2)}</span>
                        </div>

                        <button 
                            onClick={() => {
                                if (!user) {
                                    toast.error('Identity validation required. Please login.');
                                    navigate('/login');
                                    return;
                                }
                                navigate('/checkout');
                            }}
                            disabled={isVerifying}
                            className="w-full bg-primary text-white py-6 rounded-full text-sm font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mb-8 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isVerifying ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Validating...
                                </>
                            ) : (
                                <>
                                    Proceed to Checkout
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>

                        <div className="space-y-6">
                            <p className="text-center text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold">Express Curation</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="bg-surface py-4 rounded-full flex justify-center items-center hover:bg-surface-variant transition-colors border border-outline-variant/10 group">
                                    <span className="font-bold text-[11px] uppercase tracking-widest text-on-surface-variant group-hover:text-on-surface">Apple Pay</span>
                                </button>
                                <button className="bg-[#ffc439] text-[#003087] py-4 rounded-full flex justify-center items-center hover:opacity-90 transition-opacity">
                                    <span className="font-bold text-[11px] uppercase tracking-widest">PayPal</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-12 flex items-center gap-3 justify-center text-on-surface-variant pt-8 border-t border-outline-variant/10">
                            <span className="material-symbols-outlined text-base">lock</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Secure SSL Encrypted Checkout</span>
                        </div>
                    </aside>
                </div>

                {/* You Might Also Like Section */}
                <section className="mt-32 pt-20 border-t border-outline-variant/10">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="text-4xl font-extrabold tracking-tighter uppercase italic text-on-surface leading-none">The Curator's Choice.</h2>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] mt-4">Selected just for you</p>
                        </div>
                        <Link to="/shop" className="text-[11px] font-bold uppercase tracking-widest text-primary hover:underline underline-offset-8 transition-all px-4">View Collection</Link>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts?.slice(0, 4).map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CartPage;