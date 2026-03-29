import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3X3, List, ChevronDown, X, Star, Filter } from 'lucide-react';
import { getProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import ProductCard from '../components/ui/ProductCard';
import BiText from '../components/ui/BiText';
 
const ShopPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Filters State from URL
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('min_price') || '0';
    const maxPrice = searchParams.get('max_price') || '5000';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
 
    const { data, isLoading } = useQuery({
        queryKey: ['products', category, sort, minPrice, maxPrice, search, page],
        queryFn: () => getProducts({
            category_slug: category,
            sort_by: sort,
            min_price: minPrice,
            max_price: maxPrice,
            search: search,
            page: page
        }),
    });
 
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });
 
    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        
        if (key !== 'page') newParams.delete('page');
        setSearchParams(newParams);
    };
 
    const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
 
    const clearFilters = () => {
        setSearchParams(new URLSearchParams());
        setLocalMaxPrice('5000');
    };
 
    return (
        <div className="bg-[#fcf8f9] min-h-screen pt-32 pb-40 selection:bg-primary/20 transition-all duration-1000">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Cairo:wght@400;600;700;900&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
 
            <main className="max-w-[1400px] mx-auto px-6 lg:px-12">
                
                {/* ── Minimalist Header ───────────────────────────── */}
                <header className="mb-24 text-center space-y-8 animate-in fade-in slide-in-from-top-10 duration-1000">
                    <div className="flex justify-center items-center gap-4 text-primary">
                        <div className="h-px w-8 bg-current opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Established Selection</span>
                        <div className="h-px w-8 bg-current opacity-20" />
                    </div>
                    
                    <div className="space-y-2">
                        <h1 className="text-5xl lg:text-7xl font-black text-[#351e24] tracking-tighter uppercase italic leading-none">The Collections</h1>
                        <span className="text-2xl font-bold text-zinc-300 block" style={{ fontFamily: "'Cairo', sans-serif" }}>اختياراتنا الفاخرة</span>
                    </div>
                    
                    <p className="text-zinc-400 text-sm font-medium italic max-w-lg mx-auto leading-relaxed">
                        A formal curation of aesthetic excellence. Every piece is selected to maintain our standard of quality and timeless design.
                    </p>
                </header>
 
                {/* ── Top Navigation / Control Bar ────────────────── */}
                <div className="sticky top-24 z-30 mb-20 bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-4 lg:p-6 shadow-2xl shadow-[#b0004a]/5 flex items-center justify-between gap-6 animate-in zoom-in-95 duration-1000">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Refine View
                        </button>
 
                        <div className="hidden lg:flex items-center border-l border-zinc-100 pl-6 gap-2">
                            {category && (
                                <button 
                                    onClick={() => updateFilter('category', '')}
                                    className="bg-zinc-50 text-primary px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#fff0f3] transition-all"
                                >
                                    {category} <X className="w-3 h-3" />
                                </button>
                            )}
                            {search && (
                                <button 
                                    onClick={() => updateFilter('search', '')}
                                    className="bg-zinc-50 text-primary px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#fff0f3] transition-all"
                                >
                                    "{search}" <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
 
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100/50">
                            <button className="w-10 h-10 flex items-center justify-center bg-white text-primary rounded-xl shadow-sm"><Grid3X3 className="w-4 h-4" /></button>
                            <button className="w-10 h-10 flex items-center justify-center text-zinc-300 hover:text-primary transition-colors"><List className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="h-10 w-px bg-zinc-100" />
 
                        <div className="relative group">
                            <select 
                                value={sort}
                                onChange={(e) => updateFilter('sort', e.target.value)}
                                className="bg-transparent border-none text-[10px] font-black text-[#351e24] uppercase tracking-[0.2em] outline-none pr-8 cursor-pointer focus:ring-0 italic appearance-none"
                            >
                                <option value="newest">Sort by Latest Arrival</option>
                                <option value="price_asc">Price: Lowest to Highest</option>
                                <option value="price_desc">Price: Highest to Lowest</option>
                                <option value="rating">Most Highly Recommended</option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </div>
 
                <div className="flex gap-12">
                     {/* ── Collapsible Subtle Sidebar ──────────────────── */}
                     {isSidebarOpen && (
                        <div className="fixed inset-0 z-[100] bg-black/5 backdrop-blur-sm animate-in fade-in duration-500 flex justify-end">
                            <div className="w-full max-w-sm bg-white h-screen shadow-2xl animate-in slide-in-from-right duration-500 overflow-y-auto hide-scrollbar">
                                <div className="p-12 space-y-12">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-black italic uppercase tracking-widest text-[#351e24]">Refinement</h2>
                                        <button onClick={() => setIsSidebarOpen(false)} className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-zinc-100 transition-colors">
                                           <X className="w-5 h-5" />
                                        </button>
                                    </div>
 
                                    <div className="space-y-16">
                                        {/* Search Filter */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 italic">Quick Search</label>
                                            <div className="relative">
                                                <input 
                                                    className="w-full bg-[#fcf8f9] border border-transparent rounded-[1.5rem] px-12 py-5 text-sm font-semibold focus:ring-0 focus:bg-[#fff0f3]/30 transition-all placeholder:text-zinc-200" 
                                                    placeholder="Search our catalog..." 
                                                    type="text"
                                                    value={search}
                                                    onChange={(e) => updateFilter('search', e.target.value)}
                                                />
                                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-300 w-4 h-4" />
                                            </div>
                                        </div>
 
                                        {/* Category Browser */}
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 italic">Browse Categories</label>
                                            <div className="space-y-2">
                                                <button 
                                                   onClick={() => updateFilter('category', '')}
                                                   className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${!category ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-[#fcf8f9] hover:bg-white border border-transparent hover:border-[#fde2e7]'}`}
                                                >
                                                   <BiText en="View All Collections" ar="جميع المجموعات" sub colorClass={!category ? 'text-white italic' : ''} />
                                                   {!category && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </button>
                                                {categories?.map((cat) => (
                                                    <button 
                                                        key={cat.id}
                                                        onClick={() => updateFilter('category', cat.slug)}
                                                        className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${category === cat.slug ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-[#fcf8f9] hover:bg-white border border-transparent hover:border-[#fde2e7]'}`}
                                                    >
                                                        <BiText en={cat.name} ar={cat.name_ar || cat.name} sub colorClass={category === cat.slug ? 'text-white italic' : ''} />
                                                        <span className={`text-[10px] font-black italic tabular-nums ${category === cat.slug ? 'opacity-40' : 'text-zinc-300'}`}>00</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
 
                                        {/* Price Engineering */}
                                        <div className="space-y-6 text-black">
                                            <div className="flex justify-between items-center">
                                               <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 italic">Price Range</label>
                                               <span className="text-xl font-black text-primary italic tabular-nums">${localMaxPrice}</span>
                                            </div>
                                            <div className="p-8 bg-[#fcf8f9] rounded-[2rem] text-black border border-[#fde2e7]/30">
                                                <input 
                                                    className="w-full h-1 bg-gray-300 w-full rounded-full appearance-none cursor-pointer accent-primary text-primary" 
                                                    max="5000" 
                                                    min="0" 
                                                    step="10"
                                                    type="range" 
                                                    value={localMaxPrice}
                                                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                                                    onMouseUp={() => updateFilter('max_price', localMaxPrice)}
                                                    onTouchEnd={() => updateFilter('max_price', localMaxPrice)}
                                                />
                                                <div className="flex justify-between mt-4 text-[9px] font-black text-zinc-200 uppercase tracking-widest italic">
                                                    <span className="text-primary">$0</span>
                                                    <span className="text-primary">$5,000</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
 
                                    <div className="pt-12 border-t border-zinc-100 flex gap-4">
                                        <button 
                                            onClick={clearFilters}
                                            className="flex-1 py-5 rounded-full border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:bg-zinc-50 transition-all italic"
                                        >
                                            Reset
                                        </button>
                                        <button 
                                            onClick={() => setIsSidebarOpen(false)}
                                            className="flex-1 py-5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/10 hover:scale-105 active:scale-95 transition-all italic"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                     )}
 
                    {/* ── Product Grid ────────────────────────────────── */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] bg-white rounded-[3rem] animate-pulse border border-[#fde2e7]/40 shadow-sm" />
                                ))}
                            </div>
                        ) : (
                            <>
                                {data?.data?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
                                        {data.data.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-48 text-center space-y-12 animate-in slide-in-from-bottom-8 duration-700">
                                        <div className="w-40 h-40 bg-[#fcf8f9] rounded-full flex items-center justify-center mx-auto mb-8 border border-[#fde2e7]/40 shadow-inner">
                                            <Search className="w-16 h-16 text-zinc-200" />
                                        </div>
                                        <div className="space-y-4">
                                           <h3 className="text-5xl font-black text-[#351e24] tracking-tighter uppercase italic leading-none">No Results Found</h3>
                                           <span className="text-2xl font-bold text-zinc-300 block" style={{ fontFamily: "'Cairo', sans-serif" }}>لا توجد نتائج مطابقة لطلبك</span>
                                        </div>
                                        <p className="text-zinc-400 font-medium italic max-w-sm mx-auto opacity-70">Adjust your refinements or search criteria to discover our selection.</p>
                                        <button 
                                            onClick={clearFilters}
                                            className="px-16 py-6 bg-primary text-white rounded-full transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 italic text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                )}
 
                                {/* ── Sophisticated Pagination ────────────────── */}
                                {data?.meta && data.meta.last_page > 1 && (
                                    <nav className="flex justify-center items-center mt-60 gap-8">
                                        <button 
                                            disabled={page === 1}
                                            onClick={() => updateFilter('page', page - 1)}
                                            className="h-14 w-14 rounded-2xl flex items-center justify-center border border-zinc-100 text-zinc-300 hover:text-primary hover:bg-white hover:shadow-xl transition-all disabled:opacity-30 disabled:hover:shadow-none"
                                        >
                                            <ChevronDown className="w-5 h-5 rotate-90" />
                                        </button>
                                        
                                        <div className="flex items-center gap-3">
                                            {[...Array(data.meta.last_page)].map((_, i) => {
                                                const p = i + 1;
                                                const isCurrent = page === p;
                                                if (p === 1 || p === data.meta.last_page || (p >= page - 1 && p <= page + 1)) {
                                                    return (
                                                        <button 
                                                            key={p}
                                                            onClick={() => updateFilter('page', p)}
                                                            className={`h-14 w-14 rounded-2xl font-black text-[10px] transition-all italic tracking-tighter shadow-sm flex flex-col items-center justify-center ${isCurrent ? 'bg-primary text-white shadow-primary/30 scale-110 z-10' : 'bg-white border border-zinc-100 text-zinc-400 hover:text-primary'}`}
                                                        >
                                                            <span>{p < 10 ? `0${p}` : p}</span>
                                                        </button>
                                                    );
                                                }
                                                if (p === page - 2 || p === page + 2) return <span key={p} className="text-zinc-200">/</span>;
                                                return null;
                                            })}
                                        </div>
 
                                        <button 
                                            disabled={page === data.meta.last_page}
                                            onClick={() => updateFilter('page', page + 1)}
                                            className="h-14 w-14 rounded-2xl flex items-center justify-center border border-zinc-100 text-zinc-300 hover:text-primary hover:bg-white hover:shadow-xl transition-all disabled:opacity-30 disabled:hover:shadow-none"
                                        >
                                            <ChevronDown className="w-5 h-5 -rotate-90" />
                                        </button>
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </div>
 
              
            </main>
        </div>
    );
};
 
export default ShopPage;
