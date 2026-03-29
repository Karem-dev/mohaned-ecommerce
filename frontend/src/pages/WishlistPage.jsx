import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Heart,
    ShoppingBag,
    Trash2,
    Search,
    History,
    User,
    Truck,
    Settings,
    LogOut,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getWishlist, toggleWishlist } from '../services/wishlistService';
import ProductCard from '../components/ui/ProductCard';
import useAuthStore from '../store/authStore';
import BiText from '../components/ui/BiText';

const WishlistPage = () => {
    const { user, logout } = useAuthStore();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();

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

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (isLoading) return (
        <div className="py-40 text-center bg-surface min-h-screen">
            <div className="w-10 h-10 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-8"></div>
            <p className="font-bold text-on-surface-variant uppercase tracking-[0.2em] text-[10px]">Loading Wishlist...</p>
        </div>
    );

    return (
        <main className="space-y-12 min-w-0">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-outline-variant/20">
                <div>
                    <h1 className="text-4xl font-bold text-on-surface uppercase tracking-tight font-headline italic">My Wishlist</h1>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-60">Review and manage items you've saved for later.</p>
                </div>
                <div className="flex items-center gap-4 px-6 py-4 bg-white rounded-3xl border border-outline-variant/10 shadow-sm self-start">
                    <Heart className="w-5 h-5 text-primary fill-primary/10" />
                    <div className="flex flex-col">
                        <p className="text-xl font-bold text-on-surface italic leading-none tabular-nums">{items.length}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Saved Items</p>
                    </div>
                </div>
            </header>

            {/* Items Grid */}
            {items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                    {items.map((product) => (
                        <div key={product.id} className="group relative bg-white rounded-[2.5rem] p-4 border border-outline-variant/10 transition-all hover:border-primary/30 hover:shadow-xl">
                            <ProductCard product={product} />

                            {/* Remove Action */}
                            <button
                                onClick={() => removeMutation.mutate(product.id)}
                                disabled={removeMutation.isPending}
                                className="absolute top-8 right-8 z-20 flex items-center gap-2 bg-white/90 backdrop-blur-md text-primary px-5 py-2.5 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white border border-outline-variant/10"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-[9px] font-bold uppercase tracking-widest italic">Remove</span>
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-32 text-center bg-white border border-dashed border-outline-variant/40 rounded-[3rem]">
                    <Heart className="w-12 h-12 text-on-surface-variant/10 mx-auto mb-4" />
                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest italic opacity-60">Your wishlist is empty</p>
                    <Link to="/products" className="mt-8 inline-block px-10 py-4 bg-primary text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:scale-105 transition-all italic shadow-lg shadow-primary/20">Start Exploring</Link>
                </div>
            )}

            {/* Engagement Module */}
            {items.length > 0 && (
                <div className="mt-20 bg-on-surface p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl shadow-on-surface/20">
                    <ShoppingBag className="absolute -bottom-10 -right-10 w-48 h-48 text-primary opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-4xl font-bold tracking-tighter uppercase italic leading-none font-headline">Ready to Buy?</h2>
                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-wide max-w-sm leading-relaxed italic">Transform your favorite items into confirmed orders. Move your saved pieces to the checkout today.</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="px-10 py-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl shadow-primary/20 italic"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default WishlistPage;
