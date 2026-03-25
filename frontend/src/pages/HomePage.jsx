import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

import { getFeaturedProducts } from '../services/productService';
import { getCategories } from '../services/categoryService';
import Button from '../components/ui/Button';
import ProductCard from '../components/ui/ProductCard';

const HomePage = () => {
    const { data: featuredProducts, isLoading: productsLoading } = useQuery({
        queryKey: ['featuredProducts'],
        queryFn: getFeaturedProducts,
    });

const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });


    return (
        <div className="flex flex-col bg-white overflow-x-hidden min-h-screen pt-24 font-body">
            
            {/* --- HERO SECTION --- */}
        {/* --- HERO SECTION (UPDATED) --- */}
<section className="relative h-[921px] flex items-center overflow-hidden bg-surface">

    {/* Background Image */}
    <div className="absolute inset-0 z-0">
        <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuivAcfhEEMxpjFJW4XmSgl3BxClDVZ1_bpCSiRCxWKdZJC0r5qq_UNuPntXAZR-F4QfY3hmP0aht7YlZebPsVsOcZLTeLFgHZleUNoi0IXPgrKkDW4RzTy1rYwnH2JfMV5oDSmTFaz_FKxPamUZR91P6msnYNHo99cC3yLD9OO0i95bXhQMOny1j9RNb-3ywd9h6-USaGRUeswZhWvsLywIUVrk-cG5Ujgm4v2tWHofTDliD06Kk3Yy6nGYr5NxE-TwVVHIpKpKnN"
            alt="fashion"
            className="w-full h-full object-cover opacity-90 scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent"></div>
    </div>

    {/* Content */}
    <div className="container mx-auto px-6 relative z-10 max-w-screen-2xl">
        <div className="max-w-2xl">

            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-black mb-6 uppercase">
                Elevate <br /> Your Style
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 font-medium mb-10 max-w-lg leading-relaxed">
                Discover the latest trends in clothes trading. Curated pieces for the modern editorial wardrobe.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                
                <Link to="/shop">
                    <button className="bg-gradient-to-br from-primary to-primary/80 text-white px-10 py-5 rounded-lg font-bold text-sm tracking-widest uppercase transition-transform active:scale-95 shadow-xl">
                        Shop Now
                    </button>
                </Link>

                <a href="#categories">
                    <button className="bg-white text-black border border-gray-300 px-10 py-5 rounded-lg font-bold text-sm tracking-widest uppercase transition-all hover:bg-gray-100 active:scale-95">
                        View Categories
                    </button>
                </a>

            </div>

        </div>
    </div>
</section>

            {/* --- SHOP BY CATEGORY (REDESIGNED) --- */}
            <section id="categories" className="py-32 bg-surface overflow-hidden">
                <div className="max-w-[1440px] mx-auto px-8 md:px-20">
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-vibrant">Curated Selection</span>
                            <h2 className="text-5xl md:text-7xl font-black text-on-background tracking-tighter uppercase leading-[0.8] italic">
                                Shop By <br /> Category
                            </h2>
                        </div>
                        <Link to="/shop" className="group flex items-center gap-4 border-b-2 border-on-background pb-2 transition-all hover:border-primary-vibrant">
                            <span className="text-[11px] font-black uppercase tracking-widest group-hover:text-primary-vibrant transition-colors">VIEW ALL COLLECTIONS</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="flex gap-8 overflow-hidden">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="min-w-[300px] aspect-[4/5] bg-surface-container animate-pulse rounded-[4px]" />
                            ))}
                        </div>
                    ) : (
                        <div className="relative group/swiper">
                            <Swiper
                                modules={[Navigation, Autoplay, FreeMode]}
                                spaceBetween={30}
                                slidesPerView={1.2}
                                freeMode={true}
                                loop={categories.length > 4}
                                autoplay={{
                                    delay: 4000,
                                    disableOnInteraction: false,
                                    pauseOnMouseEnter: true
                                }}
                                navigation={{
                                    prevEl: '.swiper-button-prev-cat',
                                    nextEl: '.swiper-button-next-cat',
                                }}
                                breakpoints={{
                                    640: { slidesPerView: 2.2 },
                                    1024: { slidesPerView: 3.2 },
                                    1440: { slidesPerView: 4.2 },
                                }}
                                className="!overflow-visible"
                            >
                                {categories.map((cat) => (
                                    <SwiperSlide key={cat.id}>
                                        <Link 
                                            to={`/category/${cat.slug}`} 
                                            className="group relative block aspect-[4/5] overflow-hidden rounded-[4px] shadow-sm hover:shadow-2xl transition-all duration-700"
                                        >
                                            <div className="h-full w-full overflow-hidden">
                                                <img
                                                    src={cat.image_url || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                                                />
                                            </div>
                                            
                                            {/* Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                                            
                                            {/* Content */}
                                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                               <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.4em] mb-2">{cat.products_count || 0} ITEMS</span>
                                               <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none mb-6 group-hover:scale-110 origin-left transition-transform duration-500 italic">
                                                 {cat.name}
                                               </h3>
                                               <div className="w-12 h-1 bg-primary-vibrant group-hover:w-full transition-all duration-700" />
                                            </div>
                                        </Link>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Custom Navigation */}
                            <button className="swiper-button-prev-cat absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-12 z-20 w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center text-on-background opacity-0 group-hover/swiper:opacity-100 transition-all hover:bg-primary-vibrant hover:text-white disabled:hidden">
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button className="swiper-button-next-cat absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-12 z-20 w-14 h-14 rounded-full bg-white shadow-2xl flex items-center justify-center text-on-background opacity-0 group-hover/swiper:opacity-100 transition-all hover:bg-primary-vibrant hover:text-white disabled:hidden">
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    )}

                </div>
            </section>

            {/* --- NEW ARRIVALS --- */}
            <section className="py-24 md:py-32 bg-white flex flex-col items-center">
                <div className="text-center mb-24 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black text-on-background tracking-tighter uppercase italic leading-none">NEW ARRIVALS</h2>
                    <div className="w-24 h-1 bg-primary-vibrant mx-auto" />
                </div>

                <div className="max-w-[1440px] w-full mx-auto px-8 md:px-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-20">
                    {productsLoading ? (
                        [...Array(8)].map((_, i) => <div key={i} className="aspect-[3/4] bg-surface-low animate-pulse" />)
                    ) : (
                        featuredProducts?.slice(0, 8).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    )}
                </div>

                <Link to="/shop" className="group mt-32 flex flex-col items-center gap-2">
                   <span className="text-[11px] font-black text-on-background uppercase tracking-[0.4em] transition-colors group-hover:text-primary-vibrant border-b border-on-background pb-1">VIEW ALL NEW ARRIVALS</span>
                </Link>
            </section>

            {/* --- FLASH SALE BANNER --- */}
            <section className="bg-primary-vibrant py-32 mt-40 relative overflow-hidden">
               {/* Background Decorative Element */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-white/5 pointer-events-none select-none italic -rotate-12">MOHANED</div>
               
               <div className="max-w-[1440px] mx-auto px-8 md:px-20 flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10 text-white">
                  <div className="space-y-8 text-center lg:text-left">
                     <span className="bg-white text-on-background text-[10px] font-black uppercase px-6 py-2 rounded-sm inline-block">LIMITED OFFER</span>
                     <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">FLASH SALE:<br />UP TO 50% OFF</h2>
                     <Link to="/shop" className="inline-block">
                        <Button className="bg-white text-on-background px-16 py-6 font-black uppercase tracking-widest text-[11px] rounded-[4px] hover:bg-on-background hover:text-white transition-all shadow-xl">SHOP SALE</Button>
                     </Link>
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex flex-col items-center lg:items-end gap-6 border-l lg:border-l-0 lg:border-l border-white/20 pl-0 lg:pl-20">
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-4">OFFER ENDS IN</span>
                     <div className="flex gap-4 md:gap-10">
                        {[
                          { val: '02', label: 'DAYS' },
                          { val: '14', label: 'HOURS' },
                          { val: '35', label: 'MINS' },
                          { val: '08', label: 'SECS' }
                        ].map((timer, i) => (
                           <div key={i} className="flex gap-4 md:gap-10 items-center">
                              <div className="flex flex-col items-center">
                                 <span className="text-4xl md:text-7xl font-black italic leading-none">{timer.val}</span>
                                 <span className="text-[9px] font-black text-white/50 tracking-widest mt-2">{timer.label}</span>
                              </div>
                              {i < 3 && <span className="text-4xl md:text-6xl font-black text-white/30 italic">:</span>}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="pt-40 pb-20 bg-white border-t border-surface-container/20">
               <div className="max-w-[1440px] mx-auto px-12 md:px-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20">
                  
                  {/* Branding */}
                  <div className="space-y-12">
                     <div className="space-y-6">
                        <h4 className="text-2xl font-black text-on-background uppercase italic tracking-tighter">MOHANED</h4>
                        <p className="text-[11px] font-medium text-secondary/60 leading-relaxed uppercase tracking-wider italic italic max-w-xs">
                           Elevating the garment trade through curated editorial selections and modern digital-tailor experiences.
                        </p>
                     </div>
                     <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-low border border-surface-container flex items-center justify-center hover:bg-on-background hover:text-white transition-all cursor-pointer"><Star className="w-4 h-4 fill-current" /></div>
                        <div className="w-10 h-10 rounded-full bg-surface-low border border-surface-container flex items-center justify-center hover:bg-on-background hover:text-white transition-all cursor-pointer"><Star className="w-4 h-4 fill-current" /></div>
                     </div>
                  </div>

                  {/* Columns */}
                  {[
                    { title: 'LINKS', items: ['About', 'Contact', 'Privacy Policy', 'Terms'] },
                    { title: 'CUSTOMER SUPPORT', items: ['Shipping Info', 'Returns & Exchanges', 'Order Tracking', 'FAQ'] }
                  ].map((col, i) => (
                    <div key={i} className="space-y-10">
                       <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-on-background">{col.title}</h5>
                       <div className="flex flex-col gap-6">
                          {col.items.map(item => <p key={item} className="text-[10px] font-bold text-secondary/40 hover:text-primary-vibrant uppercase tracking-widest cursor-pointer transition-colors italic">{item}</p>)}
                       </div>
                    </div>
                  ))}

                  {/* Newsletter */}
                  <div className="space-y-10">
                     <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-on-background">NEWSLETTER</h5>
                     <div className="space-y-6">
                        <p className="text-[10px] font-black text-secondary/40 uppercase tracking-widest italic italic">Join for early access to sales and editorial stories.</p>
                        <div className="space-y-4">
                           <input type="email" placeholder="Email Address" className="w-full bg-surface-low p-5 text-[10px] uppercase font-black tracking-widest border-none outline-none italic placeholder:text-secondary/20" />
                           <button className="w-full bg-primary-vibrant py-5 text-white text-[10px] font-black uppercase tracking-widest italic rounded-[4px] hover:brightness-110 active:scale-[0.98] transition-all">SUBSCRIBE</button>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="max-w-[1440px] mx-auto px-12 md:px-20 mt-40 pt-10 border-t border-surface-container/20 flex flex-col md:flex-row items-center justify-between gap-8">
                  <p className="text-[10px] font-black text-secondary/30 uppercase tracking-widest italic">© 2026 mohaned. All Rights Reserved.</p>
                  <div className="flex gap-8 opacity-20 grayscale grayscale animate-pulse">
                     {[1,2,3].map(i => <div key={i} className="w-12 h-6 bg-secondary/20 rounded-sm" />)}
                  </div>
               </div>
            </footer>

        </div>
    );
};

export default HomePage;
