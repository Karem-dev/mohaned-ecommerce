import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronDown, 
  Search,
  ArrowRight
} from 'lucide-react';
import { getCategoryBySlug } from '../services/categoryService';
import ProductCard from '../components/ui/ProductCard';

const CategoryPage = () => {
    const { slug } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();

    // Filters from URL
    const sort = searchParams.get('sort_by') || 'newest';
    const minPrice = searchParams.get('min_price') || '';
    const maxPrice = searchParams.get('max_price') || '';
    const stockStatus = searchParams.get('stock_status') || '';

    const { data: categoryData, isLoading } = useQuery({
        queryKey: ['category', slug, sort, minPrice, maxPrice, stockStatus],
        queryFn: () => getCategoryBySlug(slug, {
            sort_by: sort,
            min_price: minPrice,
            max_price: maxPrice,
            stock_status: stockStatus
        }),
    });

    const category = categoryData?.category || categoryData?.data || categoryData;
    const products = categoryData?.products?.data || categoryData?.products || category?.products || [];
    const totalCount = categoryData?.products?.total || products.length;

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        setSearchParams(newParams);
    };

    const resetFilters = () => {
        setSearchParams({ sort_by: 'newest' });
    };

    if (isLoading) {
        return (
            <div className="pt-40 pb-40 text-center">
                <div className="inline-block w-12 h-12 border-4 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-8 font-bold text-slate-400">Loading collection...</p>
            </div>
        );
    }

    if (!category) return (
        <div className="pt-60 pb-60 text-center space-y-8">
            <h1 className="text-4xl font-black text-slate-900 uppercase italic">Collection Not Found</h1>
            <Link to="/shop" className="inline-block px-12 py-5 bg-slate-950 text-white font-black uppercase text-[11px] tracking-widest rounded-xl shadow-xl">Return to Shop</Link>
        </div>
    );

    return (
        <div className="bg-white min-h-screen font-manrope">
            
            {/* Header / Hero Section */}
            <header className="relative pt-32 pb-24 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <nav className="flex mb-10 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
                        <span className="mx-3 text-slate-200">/</span>
                        <Link to="/shop" className="hover:text-slate-900 transition-colors">Catalog</Link>
                        <span className="mx-3 text-slate-200">/</span>
                        <span className="text-slate-900">{category.name}</span>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                        <div className="flex-1 max-w-3xl space-y-6">
                            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">
                                {category.name}
                            </h1>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed">
                                {category.description || `Explore our curated selection of high-quality products within the ${category.name} category.`}
                            </p>
                        </div>
                        <div className="hidden md:flex flex-col items-end border-l border-slate-100 pl-10">
                            <span className="text-slate-900 font-black text-6xl leading-none italic">{totalCount}</span>
                            <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-3">Available Products</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
                
                {/* Subcategory Navigation & Simple Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                    {category.children?.length > 0 ? (
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                            <Link to={`/category/${category.slug}`} className="whitespace-nowrap px-6 py-3 bg-slate-950 text-white text-[10px] font-black tracking-[0.2em] uppercase rounded-full shadow-lg">ALL</Link>
                            {category.children.map((child) => (
                                <Link 
                                    key={child.id}
                                    to={`/category/${child.slug}`}
                                    className="whitespace-nowrap px-6 py-3 bg-slate-50 text-slate-500 text-[10px] font-bold tracking-[0.1em] uppercase rounded-full hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100"
                                >
                                    {child.name}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div></div>
                    )}

                    <div className="flex items-center gap-8 self-end md:self-auto">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Sort</span>
                            <select 
                                value={sort}
                                onChange={(e) => updateFilter('sort_by', e.target.value)}
                                className="bg-transparent text-[11px] font-black uppercase tracking-wider text-slate-950 border-none outline-none appearance-none cursor-pointer border-b-2 border-slate-100 pb-1 focus:border-slate-950 transition-colors"
                            >
                                <option value="newest">Newest</option>
                                <option value="price_asc">Price: Low - High</option>
                                <option value="price_desc">Price: High - Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Product Grid - Full Width */}
                <div className="min-h-[400px]">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-16">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-40 text-center space-y-8">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto opacity-50">
                                <Search className="w-8 h-8 text-slate-300" />
                            </div>
                            <div className="max-w-sm mx-auto">
                                <h2 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">Empty Collection</h2>
                                <p className="text-slate-400 mt-4 font-medium text-sm leading-relaxed">
                                    There are currently no items available in this category. Please check back later or explore other collections.
                                </p>
                            </div>
                            <Link to="/shop" className="inline-block px-12 py-5 bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                Explore Catalog
                            </Link>
                        </div>
                    )}

                    {/* Pagination */}
                    {products.length > 0 && categoryData?.products?.last_page > 1 && (
                        <div className="mt-32 pt-16 border-t border-slate-50 flex flex-col items-center">
                            <button className="group flex items-center gap-4 px-16 py-6 border-2 border-slate-950 font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-950 hover:text-white transition-all shadow-xl">
                                <span>NEXT COLLECTION PAGE</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CategoryPage;
