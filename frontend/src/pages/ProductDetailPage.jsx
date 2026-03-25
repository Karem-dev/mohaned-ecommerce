import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, ChevronRight, Share2, Plus, Minus, Link as LinkIcon, MessageCircle, Package, Lock, Undo2, Headphones, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { getProductBySlug, getFeaturedProducts } from '../services/productService';
import ProductCard from '../components/ui/ProductCard';
import { addToCart } from '../services/cartService';
import { toggleWishlist } from '../services/wishlistService';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { token } = useAuthStore();
    
    const [quantity, setQuantity] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedVariants, setSelectedVariants] = useState({});

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', slug],
        queryFn: () => getProductBySlug(slug),
    });

    const { data: featuredProducts } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: getFeaturedProducts,
    });

    const addToCartMutation = useMutation({
        mutationFn: (payload) => addToCart(payload),
        onMutate: async () => {
             // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
             await queryClient.cancelQueries({ queryKey: ['cart'] });

             // Snapshot the previous value
             const previousCart = queryClient.getQueryData(['cart']);

             // Optimistically update to the new value
             queryClient.setQueryData(['cart'], (old) => {
                 const updated = old ? { ...old } : { items: [] };
                 // Add a dummy item to increment count instantly
                 return { ...updated, items: [...(updated.items || []), { id: 'temp-' + Date.now() }] };
             });

             // Return a context object with the snapshotted value
             return { previousCart };
        },
        onSuccess: () => {
            toast.success('Added to cart');
            queryClient.invalidateQueries(['cart']);
        },
        onError: (error, variables, context) => {
            // Roll back if failed
            queryClient.setQueryData(['cart'], context.previousCart);
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        },
        onSettled: () => {
            queryClient.invalidateQueries(['cart']);
        }
    });

    const wishlistMutation = useMutation({
        mutationFn: (id) => toggleWishlist(id),
        onMutate: async (id) => {
             await queryClient.cancelQueries({ queryKey: ['wishlist'] });
             const previousWishlist = queryClient.getQueryData(['wishlist']);
             queryClient.setQueryData(['wishlist'], (old) => {
                 const updated = old?.data ? { ...old } : { data: [] };
                 const exists = updated.data.some(p => p.id === id);
                 if (exists) {
                     updated.data = updated.data.filter(p => p.id !== id);
                 } else {
                     updated.data = [...updated.data, product];
                 }
                 return updated;
             });
             return { previousWishlist };
        },
        onSuccess: (data) => {
            toast.success(data.message);
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['wishlist'], context.previousWishlist);
            toast.error(err.response?.data?.message || 'Wishlist operation failed');
        },
        onSettled: () => {
            queryClient.invalidateQueries(['wishlist']);
            queryClient.invalidateQueries(['product', slug]);
        }
    });

    // Initialize selections when product data loads
    useEffect(() => {
        if (product && product.variants) {
            const variantsByType = product.variants.reduce((acc, variant) => {
                if (!acc[variant.type]) acc[variant.type] = [];
                acc[variant.type].push(variant);
                return acc;
            }, {});

            const initial = {};
            Object.entries(variantsByType).forEach(([type, items]) => {
                if (items.length > 0) initial[type] = items[0];
            });
            setSelectedVariants(initial);
        }
    }, [product]);

    if (isLoading) {
        return (
            <div className="pt-40 min-h-screen text-center">
                <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-8 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Loading Product Details...</p>
            </div>
        );
    }

    if (!product) return (
        <div className="pt-40 text-center py-40">
            <h2 className="text-4xl font-black uppercase italic italic">Product Not Found</h2>
            <Link to="/shop" className="mt-8 inline-block px-10 py-4 bg-slate-950 text-white font-bold uppercase tracking-widest rounded-xl">Back to Shop</Link>
        </div>
    );

    const images = product.images?.length > 0 ? product.images : [{ image_path: product.image_url }];

    const variantsByType = product.variants?.reduce((acc, variant) => {
        if (!acc[variant.type]) acc[variant.type] = [];
        acc[variant.type].push(variant);
        return acc;
    }, {}) || {};

    const toggleVariant = (type, variant) => {
        setSelectedVariants(prev => ({
            ...prev,
            [type]: variant
        }));
    };

    const currentPrice = () => {
        let price = parseFloat(product.sale_price || product.price);
        Object.values(selectedVariants).forEach(v => {
            if (v.price_override) price = parseFloat(v.price_override);
        });
        return price;
    };

    const handleAddToCart = (redirect = false) => {
        if (!token) {
            toast.error('Please login to continue');
            navigate('/login');
            return;
        }

        const variantId = Object.values(selectedVariants).find(v => v.id)?.id;
        
        addToCartMutation.mutate({
            product_id: product.id,
            variant_id: variantId,
            quantity
        });

        if (redirect) navigate('/cart');
    };

    const handleToggleWishlist = () => {
        if (!token) {
            toast.error('Please login first');
            navigate('/login');
            return;
        }
        wishlistMutation.mutate(product.id);
    };

    return (
        <div className="bg-white min-h-screen font-manrope selection:bg-slate-950 selection:text-white">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>
            
            <main className="pt-32 pb-32 max-w-7xl mx-auto px-6 lg:px-12">
                
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-16">
                    <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/shop" className="hover:text-slate-900 transition-colors">Catalog</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-900">{product.name}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-20">
                    
                    {/* Image Section */}
                    <div className="w-full lg:w-[60%] space-y-8">
                        <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden shadow-2xl rounded-sm">
                            <img 
                              src={images[activeImageIndex].image_path || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200'} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-[2s] hover:scale-105"
                            />
                            
                            {/* Badges */}
                            {product.is_featured && (
                                <div className="absolute top-8 left-8 bg-slate-950 text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest italic shadow-xl">
                                    Exclusive Piece
                                </div>
                            )}

                            {/* Wishlist Button */}
                            <button 
                                onClick={handleToggleWishlist}
                                disabled={wishlistMutation.isPending}
                                className={`absolute top-8 right-8 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl ${product.is_wishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white'} transform hover:-translate-y-1`}
                            >
                                <Heart className={`w-6 h-6 ${product.is_wishlisted ? 'fill-current' : ''}`} />
                            </button>

                            {/* Gallery Navigation */}
                            {images.length > 1 && (
                                <>
                                    <button 
                                        onClick={() => setActiveImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                                        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md flex items-center justify-center rounded-full hover:bg-white transition-all shadow-lg"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => setActiveImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-md flex items-center justify-center rounded-full hover:bg-white transition-all shadow-lg"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="grid grid-cols-5 gap-4">
                                {images.map((img, i) => (
                                    <button 
                                      key={i}
                                      onClick={() => setActiveImageIndex(i)}
                                      className={`aspect-[4/5] bg-slate-50 transition-all overflow-hidden border-2 ${activeImageIndex === i ? 'border-slate-950 opacity-100 scale-95 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                                    >
                                        <img src={img.image_path} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="w-full lg:w-[40%] flex flex-col pt-4">
                        <div className="mb-6">
                            <span className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 border-l-2 border-slate-950 pl-4 mb-4">
                                {product.category?.name || 'Mohaned Selection'}
                            </span>
                            <h1 className="text-6xl md:text-7xl font-black text-slate-950 leading-none tracking-tighter uppercase italic mb-8">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8">
                                <div className="flex text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4" fill={i < 4 ? "currentColor" : "none"} />
                                    ))}
                                </div>
                                <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                                    Professional Quality Guaranteed
                                </span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-6 mb-12">
                            <span className="text-5xl font-black text-slate-950 tracking-tighter italic">${currentPrice()}</span>
                            {product.sale_price && (
                                <span className="text-2xl text-slate-200 line-through font-bold">${product.price}</span>
                            )}
                        </div>

                        <p className="text-slate-500 text-lg font-medium leading-relaxed mb-16 italic">
                            {product.description || "Every detail of this piece has been meticulously refined to offer a professional and sophisticated appearance, ensuring you look your best in any environment."}
                        </p>

                        {/* Variants */}
                        <div className="space-y-12 mb-16">
                            {Object.entries(variantsByType).map(([type, items]) => (
                                <div key={type} className="space-y-4">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                                        <span>Select {type}: {selectedVariants[type]?.value}</span>
                                        {type === 'size' && <button className="border-b border-slate-100 hover:border-slate-950">Size Guide</button>}
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {items.map((v, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => toggleVariant(type, v)}
                                                className={`px-8 py-3.5 border-2 text-[11px] font-bold uppercase tracking-widest transition-all ${selectedVariants[type]?.value === v.value ? 'bg-slate-950 text-white border-slate-950 shadow-xl scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                            >
                                                {v.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="space-y-6 pt-12 border-t border-slate-50 mb-16">
                            <div className="flex items-center gap-8">
                                <div className="flex items-center bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-8 text-xl font-black italic tabular-nums">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                        In Stock — Immediate Delivery
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Available for local pickup</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button 
                                    onClick={() => handleAddToCart(false)}
                                    disabled={addToCartMutation.isPending}
                                    className="flex-[2] bg-slate-950 text-white py-6 text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 italic"
                                >
                                    {addToCartMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                                    Add to Shopping Cart
                                </button>
                                <button 
                                    onClick={() => handleAddToCart(true)}
                                    className="flex-1 bg-white border-2 border-slate-950 text-slate-950 py-6 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-slate-950 hover:text-white transition-all active:scale-95 italic"
                                >
                                    Checkout Now
                                </button>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-6 opacity-30 group">
                            {[
                                { icon: ShieldCheck, text: 'Secure Payment' },
                                { icon: Truck, text: 'Fast Logistics' },
                                { icon: RotateCcw, text: '30 Days Return' }
                            ].map((badge, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-2">
                                    <badge.icon className="w-5 h-5" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest">{badge.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Technical Tabs */}
                <div className="py-32">
                    <div className="flex justify-center border-b border-slate-50 mb-20 gap-16">
                        {['description', 'specifications', 'delivery'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-8 text-[11px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === tab ? 'text-slate-950' : 'text-slate-300 hover:text-slate-950'}`}
                            >
                                {tab}
                                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-950" />}
                            </button>
                        ))}
                    </div>

                    <div className="max-w-4xl mx-auto">
                        {activeTab === 'description' && (
                            <div className="space-y-12 animate-in fade-in duration-700">
                                <h3 className="text-4xl font-black uppercase italic tracking-tighter text-center">Quality & craftsmanship</h3>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed italic text-center mx-auto max-w-2xl">
                                    Our collection represents the pinnacle of modern design, combining high-quality materials with meticulous craftsmanship to create pieces that are both elegant and durable.
                                </p>
                                <div className="grid md:grid-cols-2 gap-12 mt-20">
                                    <div className="bg-slate-50 p-12 rounded-3xl border border-slate-100">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-950 mb-8 italic">Key Features</h4>
                                        <ul className="space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                            <li className="flex items-center gap-4"><Plus className="w-3 h-3 text-slate-950" /> Premium Grade Materials</li>
                                            <li className="flex items-center gap-4"><Plus className="w-3 h-3 text-slate-950" /> Reinforced Structural Integrity</li>
                                            <li className="flex items-center gap-4"><Plus className="w-3 h-3 text-slate-950" /> Ergonomic Professional Fit</li>
                                            <li className="flex items-center gap-4"><Plus className="w-3 h-3 text-slate-950" /> Timeless Aesthetic Design</li>
                                        </ul>
                                    </div>
                                    <div className="space-y-8">
                                        <div className="flex items-start gap-6">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                                                <Package className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black uppercase italic tracking-tighter">Premium Packaging</h5>
                                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-2 uppercase tracking-widest">Delivered in our signature protective casing to ensure absolute safety.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-6">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                                                <Lock className="w-6 h-6 text-slate-300" />
                                            </div>
                                            <div>
                                                <h5 className="text-sm font-black uppercase italic tracking-tighter">Verified Authentic</h5>
                                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed mt-2 uppercase tracking-widest">Each unit includes a digital certificate of authenticity and quality control seal.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Summary tabs for specs and delivery */}
                        {activeTab === 'specifications' && (
                             <div className="py-20 text-center text-slate-300 uppercase font-black tracking-widest text-[10px]">Data currently being indexed in the catalog.</div>
                        )}
                        {activeTab === 'delivery' && (
                             <div className="py-20 text-center text-slate-300 uppercase font-black tracking-widest text-[10px]">Shipping information updated per region at checkout.</div>
                        )}
                    </div>
                </div>

                {/* ── Suggestions Section ─────────────────────────── */}
                <section className="mt-40 pt-24 border-t border-slate-100">
                    <div className="flex items-end justify-between mb-16">
                        <div>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-5xl font-black uppercase tracking-tighter italic text-slate-950 leading-none">
                                    You May Also Like
                                </h2>
                                <span className="text-3xl font-bold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                    · قد يعجبك أيضاً
                                </span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4 italic">
                                Elevate your collection with these selected pieces · اختيارات مخصصة لتكمل مجموعتك
                            </p>
                        </div>
                        <Link 
                            to="/shop"
                            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 border-b border-slate-300 hover:border-slate-900 pb-1 transition-all"
                        >
                            شاهد الكل · Browse Catalog
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {featuredProducts?.slice(0, 4).map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                        {!featuredProducts && (
                            <div className="col-span-full py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">
                                جاري تحميل المزيد من المنتجات · Updating dynamic selections...
                            </div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
};

export default ProductDetailPage;
