import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getFeaturedProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import ProductCard from '../components/ui/ProductCard';

// ✅ Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const HomePage = () => {
    const { data: featuredProducts, isLoading: productsLoading } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: getFeaturedProducts,
    });

    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    // Flash Sale Timer Logic
    const [timeLeft, setTimeLeft] = useState({ h: 8, m: 42, s: 15 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { h, m, s } = prev;
                if (s > 0) s--;
                else if (m > 0) { m--; s = 59; }
                else if (h > 0) { h--; m = 59; s = 59; }
                return { h, m, s };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <main className="pt-24 overflow-hidden bg-surface text-on-surface font-body">

            {/* Hero Section */}
            <section className="relative px-4 md:px-8 py-12 max-w-7xl mx-auto">
                <div className="bg-primary-fixed rounded-xl md:rounded-lg overflow-hidden flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-1/2 p-8 md:p-20 z-10">
                        <span className="bg-secondary-fixed text-on-secondary-fixed px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 inline-block">
                            New Season Collection
                        </span>
                        <h1 className="text-4xl md:text-7xl font-extrabold text-primary leading-[1.1] tracking-tighter mb-6">
                            Redefine Your Editorial <span className="italic font-light">Elegance</span>.
                        </h1>
                        <p className="text-on-surface-variant text-base md:text-lg mb-10 max-w-md font-medium leading-relaxed">
                            Curated aesthetics for the modern visionary. Discover high-end essentials that bridge the gap between luxury and lifestyle.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link to="/shop">
                                <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                    Shop Now
                                </button>
                            </Link>
                            <a href="#categories">
                                <button className="bg-surface-container-lowest text-primary px-8 py-4 rounded-full font-bold hover:bg-white transition-all">
                                    View Categories
                                </button>
                            </a>
                        </div>
                    </div>
                    <div className="w-full md:w-1/2 h-[400px] md:h-[700px] relative">
                        <img
                            className="w-full h-full object-cover"
                            alt="Fashion model"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlUfFyrxl9gyNfQ6O6jNkUYE_BaMBuyB5SQODlQIn2OZsbbcQ6uDSmJZe2ct8pTnofzBJfasVLCUJ6qdBY5xduhqdLLvn0AGKFVpMbaHURkXfFJz60JbRdzMGo4rrXVokFph6rKOEvIJtnCn1YkJLeES33NbuvgLcDqWQBCCcNMyLuKyrbOYce8cufF24cVm99d5kA9_D9M0Zj3_tCapdDfYW6rIZTDmpeTNZGfJvX7zl_1IkDS9kOFn6lUFBAxzUKWTmCp-S-3ndp"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Categories */}
            <section id="categories" className="py-20 px-8 max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-primary">Explore Categories</h2>
                        <p className="text-on-surface-variant mt-2 font-medium">Find your next signature piece.</p>
                    </div>

                    {/* ✅ Buttons linked to slider */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.categorySwiper?.slidePrev()}
                            className="p-2 border border-outline-variant/30 rounded-full hover:bg-primary-fixed transition-colors"
                        >
                            <span className="material-symbols-outlined text-primary">chevron_left</span>
                        </button>

                        <button
                            onClick={() => window.categorySwiper?.slideNext()}
                            className="p-2 border border-outline-variant/30 rounded-full hover:bg-primary-fixed transition-colors"
                        >
                            <span className="material-symbols-outlined text-primary">chevron_right</span>
                        </button>
                    </div>
                </div>

                {/* ✅ SWIPER بدل scroll */}
                <Swiper
                    spaceBetween={16}
                    slidesPerView="auto"
                    onSwiper={(swiper) => (window.categorySwiper = swiper)}
                    className="-mx-8 px-8"
                >
                    {categoriesLoading ? (
                        [...Array(5)].map((_, i) => (
                            <SwiperSlide key={i} className="!w-48">
                                <div className="w-48 aspect-[4/5] bg-surface-container-high rounded-lg animate-pulse" />
                            </SwiperSlide>
                        ))
                    ) : (
                        categories.map((cat) => (
                            <SwiperSlide key={cat.id} className="!w-48">
                                <Link to={`/category/${cat.slug}`} className="w-48 group cursor-pointer block">
                                    <div className="aspect-[4/5] bg-surface-container-high rounded-lg overflow-hidden mb-4 relative">
                                        <img
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            alt={cat.name}
                                            src={cat.image_url || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800'}
                                        />
                                    </div>
                                    <h3 className="font-bold text-primary">{cat.name}</h3>
                                    <p className="text-[10px] text-secondary font-medium uppercase tracking-widest">
                                        {cat.products_count || 0} Products
                                    </p>
                                </Link>
                            </SwiperSlide>
                        ))
                    )}
                </Swiper>
            </section>

            {/* Featured Products Grid */}
            <section className="py-20 px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-primary tracking-tighter mb-4">Curated Favorites</h2>
                    <div className="h-1 w-12 bg-primary mx-auto rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {productsLoading ? (
                        [...Array(8)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-surface-container-low rounded-lg animate-pulse" />
                        ))
                    ) : (
                        featuredProducts?.slice(0, 8).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>
                <div className="mt-20 text-center">
                    <Link to="/shop">
                        <button className="border-b-2 border-primary text-primary font-bold tracking-widest uppercase text-sm pb-1 hover:text-secondary hover:border-secondary transition-all">
                            Explore All Products
                        </button>
                    </Link>
                </div>
            </section>

            {/* Promotional Banner */}
            <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
                <div className="relative rounded-lg overflow-hidden bg-primary p-12 md:p-24 text-center">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-container opacity-20 -skew-x-12 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-secondary opacity-10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-5xl md:text-7xl font-extrabold text-primary-fixed tracking-tighter mb-8 italic">The Flash Sale</h2>
                        <p className="text-primary-fixed text-xl md:text-2xl font-medium mb-12 opacity-90">Unlock 50% OFF your first curated collection. Limited time editorial exclusive.</p>
                        <div className="flex justify-center gap-4 md:gap-8 mb-12">
                            {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur w-20 h-24 rounded-lg flex flex-col items-center justify-center border border-white/20">
                                    <span className="text-3xl font-extrabold text-white">{val.toString().padStart(2, '0')}</span>
                                    <span className="text-[10px] uppercase tracking-widest text-white/70 font-bold">
                                        {['Hours', 'Mins', 'Secs'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Link to="/shop">
                            <button className="bg-white text-primary px-12 py-5 rounded-full font-extrabold text-lg shadow-2xl hover:scale-105 transition-transform">
                                Claim My Discount
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

        </main>
    );
};

export default HomePage;