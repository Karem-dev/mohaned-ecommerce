import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
    Heart, ShoppingBag, ArrowRight, Trash2, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getWishlist, toggleWishlist } from '../services/wishlistService';
import ProductCard from '../components/ui/ProductCard';

// ── Bilingual Label ──────────────────────────────────────────────────────────
const BiText = ({ en, ar, className = '' }) => (
    <span className={className}>
        {en} <span style={{ fontFamily: "'Cairo', sans-serif" }}>· {ar}</span>
    </span>
);

const WishlistPage = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: wishlistResp, isLoading } = useQuery({
        queryKey: ['wishlist'],
        queryFn: getWishlist,
    });

    const items = wishlistResp?.data || [];

    const removeMutation = useMutation({
        mutationFn: (id) => toggleWishlist(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['wishlist'] });
            const previousWishlist = queryClient.getQueryData(['wishlist']);
            queryClient.setQueryData(['wishlist'], (old) => {
                const updated = old?.data ? { ...old } : { data: [] };
                updated.data = updated.data.filter(p => p.id !== id);
                return updated;
            });
            return { previousWishlist };
        },
        onSuccess: () => toast.success('تم الحذف من المفضلة · Removed from wishlist'),
        onError: (err, id, context) => {
            queryClient.setQueryData(['wishlist'], context.previousWishlist);
            toast.error('فشل الحذف · Failed to remove');
        },
        onSettled: () => queryClient.invalidateQueries(['wishlist']),
    });

    // ── Loading ──────────────────────────────────────────────────────────────
    if (isLoading) return (
        <div className="pt-40 min-h-screen flex flex-col items-center justify-center gap-4">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
            <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">
                جاري التحميل · Loading Wishlist...
            </p>
        </div>
    );

    return (
        <>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>

            <div className="min-h-screen bg-white pt-28 pb-20 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto space-y-12">

                    {/* ── Header ──────────────────────────────────────── */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-100">
                        <div>
                            <div className="flex items-baseline gap-3">
                                <h1 className="text-5xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase italic leading-none flex items-center gap-4">
                                    Wishlist
                                    <Heart className="w-10 h-10 text-rose-400 fill-rose-400 opacity-30" />
                                </h1>
                                <span className="text-3xl font-bold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                    · المفضلة
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-3 italic">
                                المنتجات المحفوظة · Your saved products
                            </p>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                            <div>
                                <p className="text-xl font-black text-slate-900 italic leading-none tabular-nums">{items.length}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                                    منتج محفوظ · Saved
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Items Grid ──────────────────────────────────── */}
                    {items.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {items.map((product) => (
                                    <div key={product.id} className="group relative">
                                        <ProductCard product={product} />

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => removeMutation.mutate(product.id)}
                                            disabled={removeMutation.isPending}
                                            className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-red-400 px-3 py-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white text-[9px] font-black uppercase tracking-widest border border-red-100 hover:border-red-500"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            <span>حذف · Remove</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* ── CTA Banner ───────────────────────────── */}
                            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl mt-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-0">

                                    {/* Text Side */}
                                    <div className="p-10 lg:p-14 space-y-6">
                                        <div>
                                            <div className="flex items-baseline gap-3 flex-wrap">
                                                <h2 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-tight">
                                                    Ready to Order?
                                                </h2>
                                                <span className="text-xl font-bold text-slate-500" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                                    · جاهز للشراء؟
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                                                Move your favorites to cart and complete your purchase.
                                            </p>
                                            <p className="text-slate-600 text-sm mt-1 font-medium" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                                أضف منتجاتك المفضلة للسلة وأكمل طلبك.
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => navigate('/shop')}
                                                className="flex items-center gap-2 bg-amber-400 text-slate-900 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-lg"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                                <span>تسوق الآن · Shop Now</span>
                                            </button>
                                            <button
                                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                                className="flex items-center gap-2 bg-white/10 text-white border border-white/10 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all"
                                            >
                                                <ArrowRight className="w-4 h-4 -rotate-90" />
                                                <span>للأعلى · Top</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Visual Side */}
                                    <div className="hidden lg:grid grid-cols-3 gap-4 p-10 opacity-20">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="aspect-[3/4] bg-white/5 rounded-xl border border-white/10" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* ── Empty State ─────────────────────────────── */
                        <div className="py-32 text-center space-y-8">
                            <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100 shadow-sm">
                                <Search className="w-10 h-10 text-slate-200" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black tracking-tighter uppercase italic text-slate-950">
                                    No saved items.
                                </h2>
                                <p className="font-bold text-slate-400 text-base" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                    قائمة المفضلة فارغة حالياً
                                </p>
                                <p className="text-sm text-slate-400 uppercase tracking-widest font-bold italic max-w-sm mx-auto opacity-70">
                                    Discover our latest collection and save your favorites.
                                </p>
                            </div>
                            <Link to="/shop">
                                <button className="mt-4 bg-slate-950 text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center gap-3 mx-auto hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl">
                                    <span>استكشف المنتجات · Explore Catalog</span>
                                    <ArrowRight className="w-4 h-4 text-amber-400" />
                                </button>
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default WishlistPage;