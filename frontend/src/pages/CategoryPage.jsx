import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link, useSearchParams } from 'react-router-dom';
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

    // Active filter tracking
    const activeFilters = [];
    if (minPrice || maxPrice) activeFilters.push({ key: 'price', label: `Price: $${minPrice || '0'}-$${maxPrice || '∞'}` });
    if (stockStatus) activeFilters.push({ key: 'stock', label: stockStatus === 'in_stock' ? 'In Stock' : stockStatus });

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

    const clearFilter = (key) => {
        const newParams = new URLSearchParams(searchParams);
        if (key === 'price') {
            newParams.delete('min_price');
            newParams.delete('max_price');
        } else if (key === 'stock') {
            newParams.delete('stock_status');
        }
        setSearchParams(newParams);
    };

    const clearAllFilters = () => {
        setSearchParams({});
    };

    // Sort label mapping
    const sortLabels = {
        'newest': 'Newest',
        'price_asc': 'Price: Low to High',
        'price_desc': 'Price: High to Low',
        'oldest': 'Oldest First',
    };

    if (isLoading) {
        return (
            <div className="pt-40 pb-40 text-center bg-surface min-h-screen">
                <div className="inline-block w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-8 font-semibold text-on-surface-variant uppercase tracking-widest text-xs">Loading Collection...</p>
            </div>
        );
    }

    if (!category) return (
        <div className="pt-60 pb-60 text-center space-y-8 bg-surface min-h-screen">
            <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
            </div>
            <h1 className="text-2xl font-bold text-on-surface font-headline">Category Not Found</h1>
            <p className="text-on-surface-variant max-w-md mx-auto">The category you're looking for doesn't exist or has been removed.</p>
            <Link to="/shop" className="inline-block px-10 py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/25 active:scale-95 transition-transform">
                Browse All Products
            </Link>
        </div>
    );

    return (
        <div className="bg-surface min-h-screen font-body antialiased">

            {/* Breadcrumb */}
            <nav className="px-6 py-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-on-surface-variant uppercase">
                    <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <Link to="/categories" className="hover:text-primary transition-colors">Categories</Link>
                    <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                    <span className="text-primary">{category.name}</span>
                </div>
            </nav>

            {/* Editorial Hero Banner */}
            <section className="px-6 mb-12 max-w-7xl mx-auto">
                <div className="relative h-[350px] md:h-[450px] w-full rounded-lg overflow-hidden flex items-center shadow-lg">
                    {category.image_url ? (
                        <img
                            className="absolute inset-0 w-full h-full object-cover"
                            src={category.image_url}
                            alt={category.name}
                        />
                    ) : (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/80 via-primary/60 to-secondary/40" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-on-background/60 via-on-background/20 to-transparent"></div>
                    <div className="relative z-10 px-8 md:px-12 max-w-2xl">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight font-headline">
                            {category.name}
                        </h1>
                        <p className="text-base md:text-lg text-white/90 font-light leading-relaxed max-w-lg">
                            {category.description || `Discover our exclusive collection of hand-picked items from the ${category.name} category. Quality and elegance in every piece.`}
                        </p>
                    </div>
                </div>
            </section>

            {/* Subcategory Pills */}
            {category.children?.length > 0 && (
                <section className="px-6 mb-10 max-w-7xl mx-auto overflow-hidden">
                    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-2">
                        <Link
                            to={`/category/${category.slug}`}
                            className="px-8 py-3 bg-primary text-white rounded-full text-sm font-semibold whitespace-nowrap active:scale-95 transition-all shadow-md shadow-primary/20"
                        >
                            All Collections
                        </Link>
                        {category.children.map((child) => (
                            <Link
                                key={child.id}
                                to={`/category/${child.slug}`}
                                className="px-8 py-3 bg-surface-container-low text-on-surface-variant hover:bg-secondary-fixed hover:text-on-secondary-fixed rounded-full text-sm font-semibold whitespace-nowrap active:scale-95 transition-all"
                            >
                                {child.name}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Filter & Sort Bar */}
            <section className="px-6 mb-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface-container-lowest rounded-xl shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mr-2">
                            {totalCount} {totalCount === 1 ? 'Product' : 'Products'}
                        </span>
                        {activeFilters.length > 0 && (
                            <>
                                <div className="w-px h-4 bg-outline-variant mx-2" />
                                {activeFilters.map((filter) => (
                                    <div key={filter.key} className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-fixed text-on-secondary-fixed-variant rounded-full text-xs font-medium">
                                        {filter.label}
                                        <button onClick={() => clearFilter(filter.key)} className="hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                        </button>
                                    </div>
                                ))}
                                <button onClick={clearAllFilters} className="text-xs text-primary font-bold hover:underline ml-2">
                                    Clear All
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative inline-block text-left">
                            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full text-sm font-medium text-on-surface">
                                <span className="text-xs text-on-surface-variant mr-1">Sort by:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => updateFilter('sort_by', e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm font-semibold text-on-surface cursor-pointer appearance-none pr-6"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                    <option value="oldest">Oldest First</option>
                                </select>
                                <span className="material-symbols-outlined text-sm pointer-events-none -ml-4">expand_more</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Product Grid */}
            <section className="px-6 max-w-7xl mx-auto">
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
                        </div>
                        <h2 className="text-2xl font-bold text-on-surface mb-2 font-headline">No products found</h2>
                        <p className="text-on-surface-variant mb-8 max-w-md">
                            We couldn't find any products matching your current filters. Try adjusting your search or explore our other collections.
                        </p>
                        <button
                            onClick={clearAllFilters}
                            className="px-10 py-4 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/25 active:scale-95 transition-transform"
                        >
                            Browse All Products
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {products.length > 0 && categoryData?.products?.last_page > 1 && (
                    <div className="mt-16 pt-8 border-t border-outline-variant/20 flex justify-center">
                        <div className="flex items-center gap-2">
                            {categoryData?.products?.current_page > 1 && (
                                <button
                                    onClick={() => updateFilter('page', String(categoryData.products.current_page - 1))}
                                    className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-secondary-fixed transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                </button>
                            )}
                            {Array.from({ length: Math.min(categoryData?.products?.last_page || 1, 5) }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => updateFilter('page', String(page))}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all active:scale-95 ${
                                        page === (categoryData?.products?.current_page || 1)
                                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                                            : 'bg-surface-container-low text-on-surface-variant hover:bg-secondary-fixed'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}
                            {(categoryData?.products?.current_page || 1) < (categoryData?.products?.last_page || 1) && (
                                <button
                                    onClick={() => updateFilter('page', String((categoryData?.products?.current_page || 1) + 1))}
                                    className="w-10 h-10 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center hover:bg-secondary-fixed transition-all active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* Bottom spacing for mobile nav */}
            <div className="h-24 md:h-16" />
        </div>
    );
};

export default CategoryPage;
