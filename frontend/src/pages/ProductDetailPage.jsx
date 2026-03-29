import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, ShieldCheck, Truck, RotateCcw, ChevronRight, Share2, Plus, Minus, Package, Lock, Loader2, MessageSquareQuote, ArrowLeft, ArrowRight } from 'lucide-react';
import { getProductBySlug, getFeaturedProducts } from '../services/productService';
import { getProductReviews } from '../services/reviewService';
import ProductCard from '../components/ui/ProductCard';
import { addToCart } from '../services/cartService';
import { toggleWishlist } from '../services/wishlistService';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import BiText from '../components/ui/BiText';
 
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
 
    const { data: reviewsData } = useQuery({
        queryKey: ['reviews', product?.id],
        queryFn: () => getProductReviews(product.id),
        enabled: !!product?.id
    });
 
    const reviews = reviewsData?.data || [];
    const totalReviews = reviewsData?.total || 0;
 
    const addToCartMutation = useMutation({
        mutationFn: (payload) => addToCart(payload),
        onSuccess: () => {
            toast.success('Successfully added to bag');
            queryClient.invalidateQueries(['cart']);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    });
 
    const wishlistMutation = useMutation({
        mutationFn: (id) => toggleWishlist(id),
        onSuccess: (data) => {
            toast.success(data.message);
            queryClient.invalidateQueries(['wishlist']);
            queryClient.invalidateQueries(['product', slug]);
        }
    });
 
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
            <div className="pt-40 min-h-screen text-center bg-[#fcf8f9]">
                <div className="inline-block w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-8 font-bold text-zinc-300 uppercase tracking-widest text-[9px] italic">Organizing Details...</p>
            </div>
        );
    }
 
    if (!product) return (
        <div className="pt-40 text-center py-40 min-h-screen bg-[#fcf8f9]">
            <h2 className="text-4xl font-black uppercase italic">Selection Unavailable</h2>
            <Link to="/shop" className="mt-8 inline-block px-10 py-4 bg-primary text-white font-bold uppercase tracking-widest rounded-full text-[10px] italic">Return to Collections</Link>
        </div>
    );
 
    const images = product.images?.length > 0 ? product.images : [{ image_path: product.image_url }];
    const variantsByType = product.variants?.reduce((acc, variant) => {
        if (!acc[variant.type]) acc[variant.type] = [];
        acc[variant.type].push(variant);
        return acc;
    }, {}) || {};
 
    const toggleVariant = (type, variant) => {
        setSelectedVariants(prev => ({ ...prev, [type]: variant }));
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
            toast.error('Identity required');
            navigate('/login');
            return;
        }
        const variantIds = Object.values(selectedVariants).map(v => v.id).filter(id => !!id);
        addToCartMutation.mutate({ product_id: product.id, variant_ids: variantIds, quantity });
        if (redirect) navigate('/cart');
    };
 
    return (
        <div className="bg-[#fcf8f9] min-h-screen selection:bg-primary/20 transition-all duration-1000">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Cairo:wght@400;600;700;900&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}</style>
 
            <main className="pt-32 pb-40 max-w-7xl mx-auto px-6 lg:px-12">
 
                {/* ── Breadcrumb ─────────────────────────────────── */}
                <nav className="flex items-center space-x-3 mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <Link to="/" className="text-[10px] font-bold text-zinc-300 hover:text-primary transition-colors tracking-widest uppercase italic">Home</Link>
                    <ChevronRight className="w-3 h-3 text-zinc-200" />
                    <Link to="/shop" className="text-[10px] font-bold text-zinc-300 hover:text-primary transition-colors tracking-widest uppercase italic">Shop</Link>
                    <ChevronRight className="w-3 h-3 text-zinc-200" />
                    <span className="text-[10px] font-black text-primary tracking-widest uppercase italic">The Collection</span>
                </nav>
 
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
 
                    {/* ── Visual Presentation (Left) ──────────────────── */}
                    <div className="w-full lg:w-[55%] space-y-8 sticky top-24">
                        <div className="relative aspect-[4/5] bg-white overflow-hidden rounded-[3rem] border border-white shadow-2xl shadow-zinc-200/50 group">
                            <img
                                src={images[activeImageIndex].image_path}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-[4s] ease-out group-hover:scale-110"
                            />
                            
                            {/* Actions Overlay */}
                            <button
                                onClick={() => wishlistMutation.mutate(product.id)}
                                className={`absolute top-10 right-10 h-14 w-14 rounded-full backdrop-blur-xl flex items-center justify-center transition-all duration-500 shadow-2xl ${product.is_wishlisted ? 'bg-primary text-white scale-110' : 'bg-white/90 text-zinc-300 hover:text-primary'}`}
                            >
                                <Heart className={`w-6 h-6 ${product.is_wishlisted ? 'fill-current' : ''}`} />
                            </button>
 
                            {product.sale_price && (
                                <div className="absolute top-10 left-10">
                                    <span className="bg-primary/95 backdrop-blur-md text-white px-8 py-3 rounded-full text-[9px] font-black tracking-[0.3em] uppercase italic shadow-xl shadow-primary/20">Special Offer</span>
                                </div>
                            )}
 
                            {/* Gallery Navigation Controls (Subtle) */}
                            {images.length > 1 && (
                                <div className="absolute inset-x-10 bottom-10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <button onClick={() => setActiveImageIndex(prev => (prev - 1 + images.length) % images.length)} className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                                        <ArrowLeft className="w-4 h-4 text-zinc-400" />
                                    </button>
                                    <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full text-[10px] font-black tabular-nums tracking-widest text-zinc-400 italic">
                                        {activeImageIndex + 1} / {images.length}
                                    </div>
                                    <button onClick={() => setActiveImageIndex(prev => (prev + 1) % images.length)} className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                                        <ArrowRight className="w-4 h-4 text-zinc-400" />
                                    </button>
                                </div>
                            )}
                        </div>
 
                        {/* Thumbnails Browser */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto p-2 hide-scrollbar">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={`aspect-[4/5] w-24 rounded-2xl bg-white shrink-0 border-2 transition-all duration-700 overflow-hidden ${activeImageIndex === i ? 'border-primary scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img.image_path} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
 
                    {/* ── Information Narrative (Right) ────────────────── */}
                    <div className="w-full lg:w-[45%] lg:pt-8 space-y-16">
                        <section className="space-y-8">
                            <div className="space-y-4">
                               <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase italic border-l-2 border-primary pl-4">{product.category?.name || 'Exclusive Selection'}</span>
                               <h1 className="text-5xl lg:text-7xl font-black text-[#351e24] tracking-tighter uppercase italic leading-[1.1]">{product.name}</h1>
                               <span className="text-2xl font-bold text-zinc-300 block" style={{ fontFamily: "'Cairo', sans-serif" }}>{product.name_ar || product.name}</span>
                            </div>
 
                            <div className="flex items-center gap-10">
                                <div className="flex flex-col">
                                    <div className="flex text-amber-400 gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3.5 h-3.5" fill={i < Math.round(product.average_rating || 5) ? "currentColor" : "none"} />
                                        ))}
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mt-2">{totalReviews} Verified Opinions</span>
                                </div>
                                <div className="h-10 w-px bg-zinc-100" />
                                <div className="bg-white/50 px-5 py-2.5 rounded-full border border-white">
                                    <span className="text-emerald-500 text-[9px] font-black tracking-widest uppercase italic">In Stock · Ready for Delivery</span>
                                </div>
                            </div>
 
                            <div className="flex items-baseline gap-6 py-10 bg-white px-10 rounded-[2.5rem] border border-zinc-100/50 shadow-sm w-fit">
                                <span className="text-5xl font-black text-primary italic tracking-tight tabular-nums">${currentPrice()}</span>
                                {product.sale_price && (
                                    <span className="text-lg text-zinc-200 line-through font-bold">${product.price}</span>
                                )}
                            </div>
 
                            <p className="text-zinc-500 text-sm font-medium leading-[1.8] italic max-w-lg">
                                {product.description || "A formal manifestation of quality and craftsmanship. Designed for those who appreciate the subtle nuances of premium aesthetics and functional elegance."}
                            </p>
                        </section>
 
                        {/* Configuration Controls */}
                        <section className="space-y-12">
                            {Object.entries(variantsByType).map(([type, items]) => (
                                <div key={type} className="space-y-6">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-300 italic">
                                        <span>Select {type}: {selectedVariants[type]?.value}</span>
                                        {type === 'size' && <button className="hover:text-primary transition-colors border-b border-zinc-100">Reference Guide</button>}
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {items.map((v, i) => (
                                            <button
                                                key={i}
                                                onClick={() => toggleVariant(type, v)}
                                                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${selectedVariants[type]?.value === v.value ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-white text-zinc-400 border border-zinc-100 hover:border-zinc-200'}`}
                                            >
                                                {v.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
 
                            <div className="flex items-center gap-8 py-4">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-300 italic">Quantity Control</label>
                                <div className="flex items-center bg-white border border-zinc-100 rounded-2xl p-1 shadow-inner">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-10 w-10 flex items-center justify-center hover:bg-zinc-50 rounded-xl transition-colors"><Minus className="w-4 h-4" /></button>
                                    <span className="px-6 text-lg font-black italic tabular-nums">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="h-10 w-10 flex items-center justify-center hover:bg-zinc-50 rounded-xl transition-colors"><Plus className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </section>
 
                        {/* Transaction Decisions */}
                        <section className="flex flex-col sm:flex-row gap-5">
                            <button
                                onClick={() => handleAddToCart(false)}
                                disabled={addToCartMutation.isPending}
                                className="flex-[2] bg-primary text-white py-8 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4 italic"
                            >
                                {addToCartMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <ShoppingBag className="w-4 h-4 text-white" />}
                                <BiText en="Add to Bag" ar="إضافة للحقيبة" colorClass="text-white" align="items-center" />
                            </button>
                            <button
                                onClick={() => handleAddToCart(true)}
                                className="flex-1 bg-white border-2 border-zinc-100 text-[#351e24] py-8 rounded-full shadow-lg hover:border-primary hover:text-primary transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest italic"
                            >
                                <BiText en="Purchase Now" ar="شراء الآن" align="items-center" />
                            </button>
                        </section>
 
                        {/* Quality Assurance */}
                        <div className="grid grid-cols-3 gap-6 pt-12 opacity-30 group hover:opacity-60 transition-opacity duration-1000">
                            {[
                                { icon: ShieldCheck, text: 'Secure Origin' },
                                { icon: Truck, text: 'Global Logistics' },
                                { icon: RotateCcw, text: '30-Day Return' }
                            ].map((badge, i) => (
                                <div key={i} className="flex flex-col items-center text-center gap-2">
                                    <badge.icon className="w-4 h-4" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.4em] italic">{badge.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
 
                {/* ── Exploration Section ────────────────────────── */}
                <div className="mt-40 pt-24 border-t border-zinc-100 space-y-16">
                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-6">
                        {['description', 'reviews', 'specifications'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-4 transition-all relative group`}
                            >
                                <BiText
                                    en={tab === 'reviews' ? `Guest Reviews (${totalReviews})` : tab}
                                    ar={tab === 'reviews' ? `الآراء (${totalReviews})` : tab === 'description' ? 'التفاصيل' : 'المواصفات'}
                                    sub
                                    colorClass={activeTab === tab ? 'text-primary italic font-black' : 'text-zinc-300 group-hover:text-primary'}
                                />
                                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary animate-in fade-in duration-700" />}
                            </button>
                        ))}
                    </div>
 
                    <div className="max-w-4xl mx-auto py-12">
                        {activeTab === 'description' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000 text-center">
                                <h3 className="text-3xl font-black uppercase italic tracking-tighter text-[#351e24]">Quality & Refinement</h3>
                                <p className="text-sm text-zinc-500 font-medium leading-[2] italic mx-auto max-w-xl">
                                    This piece represents our commitment to modern aesthetic standards. Using only refined materials, we ensure every detail contributes to a cohesive experience of comfort and luxury.
                                </p>
                                <div className="grid md:grid-cols-2 gap-8 mt-16 text-left">
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-6 italic">Material Standards</h4>
                                        <ul className="space-y-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic leading-relaxed">
                                            <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Signature Grade Fabric</li>
                                            <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Professional Durability</li>
                                            <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Minimalist Structural Integrity</li>
                                        </ul>
                                    </div>
                                    <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-6 italic">Sustainability</h4>
                                        <ul className="space-y-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic leading-relaxed">
                                            <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Responsibly Sourced</li>
                                            <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Low Impact Processing</li>
                                            <li className="flex items-center gap-4"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Built for Longevity</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
 
                        {activeTab === 'reviews' && (
                            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                                {reviews.length > 0 ? (
                                    <div className="space-y-10">
                                        {reviews.map((r) => (
                                            <div key={r.id} className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm flex gap-8">
                                                <div className="w-14 h-14 bg-[#fcf8f9] rounded-2xl flex items-center justify-center shrink-0 border border-zinc-50 overflow-hidden">
                                                    {r.user?.avatar ? <img src={r.user.avatar} className="w-full h-full object-cover" /> : <span className="text-lg font-black italic">{r.user?.name?.charAt(0)}</span>}
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                           <h5 className="text-sm font-black italic uppercase tracking-tighter text-[#351e24]">{r.user?.name || 'Verified Guest'}</h5>
                                                           <p className="text-[8px] font-bold text-zinc-200 uppercase tracking-widest italic">{new Date(r.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="flex text-amber-400 gap-0.5">
                                                            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3" fill={i < r.rating ? "currentColor" : "none"} />)}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-zinc-500 font-medium leading-relaxed italic">{r.body}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-24 text-center space-y-8">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto border border-zinc-100 shadow-sm">
                                            <MessageSquareQuote className="w-8 h-8 text-zinc-100" />
                                        </div>
                                        <div className="space-y-2">
                                           <h4 className="text-xl font-black italic uppercase tracking-widest text-zinc-200">No Opinions Yet</h4>
                                           <span className="text-xs font-bold text-zinc-100 block italic uppercase">Be the first to share your experience</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {activeTab === 'specifications' && (
                           <div className="py-24 text-center text-[10px] font-black text-zinc-200 uppercase tracking-[0.4em] italic">Information currently being updated.</div>
                        )}
                    </div>
                </div>
 
                {/* ── Visual Context / Recommendations ───────────── */}
                <section className="mt-40 pt-32 border-t border-zinc-100">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl lg:text-6xl font-black text-[#351e24] tracking-tighter uppercase italic leading-none">Perspective Details</h2>
                            <span className="text-2xl font-bold text-zinc-300 block" style={{ fontFamily: "'Cairo', sans-serif" }}>اختيارات قد تناسبك</span>
                        </div>
                        <Link to="/shop" className="group flex items-center gap-4 bg-white px-10 py-5 rounded-full border border-zinc-100 shadow-sm hover:border-primary transition-all">
                            <BiText en="View Full Gallery" ar="عرض المجموعة الكاملة" sub colorClass="group-hover:text-primary italic font-black" />
                        </Link>
                    </div>
 
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {featuredProducts?.slice(0, 4).map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                </section>
 
            </main>
        </div>
    );
};
export default ProductDetailPage;
