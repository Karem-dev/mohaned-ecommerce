import React, { memo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    ShoppingBag, 
    User, 
    Heart, 
    Shield, 
    Menu, 
    X, 
    ArrowRight, 
    Search, 
    LayoutDashboard,
    LogOut,
    Package
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import { getCart } from '../../services/cartService';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const location = useLocation();

    const { data: cartResp } = useQuery({
        queryKey: ['cart'],
        queryFn: getCart,
        enabled: !!user
    });

    const cartCount = cartResp?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

    // Close menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    // Disable scroll when menu is open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
    }, [isOpen]);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: 'Categories', path: '/categories' },
    ];

    return (
        <nav className="fixed top-0 w-full z-[100] bg-white border-b border-outline-variant/10 shadow-sm transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between font-body antialiased">
                
                {/* Brand & Desktop Links */}
                <div className="flex items-center gap-10">
                    <Link to="/" className="text-2xl font-bold tracking-tighter text-on-surface uppercase font-headline italic leading-none group">
                        Rose <span className="text-primary group-hover:italic transition-all">Store</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-on-surface-variant'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Global Actions */}
                <div className="flex items-center gap-4 md:gap-6">
                    
                    {/* Search Focus */}
                    <Link to="/search" className="p-3 text-on-surface-variant/40 hover:text-primary transition-colors hidden sm:block">
                        <Search className="w-5 h-5" />
                    </Link>

                    <div className="flex items-center gap-1 md:gap-3">
                        <Link to="/profile/wishlist" className="p-3 text-on-surface-variant/40 hover:text-primary transition-colors hover:bg-surface-container-low rounded-full">
                            <Heart className="w-5 h-5" />
                        </Link>

                        <Link to="/cart" className="relative p-3 text-on-surface-variant/40 hover:text-primary transition-colors hover:bg-surface-container-low rounded-full shrink-0">
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 bg-primary text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg shadow-primary/20">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                    <div className="h-6 w-px bg-outline-variant/10 hidden md:block" />

                    {/* Desktop User Hub */}
                    <div className="hidden lg:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="p-3 text-on-surface-variant/40 hover:text-primary transition-colors">
                                        <Shield className="w-5 h-5" />
                                    </Link>
                                )}
                                <Link to="/profile" className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 group-hover:border-primary/40 transition-all">
                                        <img
                                            src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                            className="w-full h-full object-cover"
                                            alt={user.name}
                                            onError={(e) => {
                                                console.error('Avatar failed to load:', user.avatar);
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`;
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-[10px] font-bold text-on-surface leading-tight uppercase tracking-tight">{user.name.split(' ')[0]}</span>
                                        <span className="text-[8px] font-bold text-primary uppercase tracking-widest italic opacity-60">Verified</span>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <Link to="/login" className="px-6 py-2.5 bg-on-surface text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-on-surface/10">
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsOpen(true)} className="lg:hidden p-3 bg-surface-container-low rounded-2xl text-primary shadow-sm hover:scale-110 active:scale-95 transition-all">
                        <Menu className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Professional Drawer */}
            <div className={`fixed inset-0 z-[201] lg:hidden transition-all duration-500 overflow-hidden ${isOpen ? 'visible' : 'invisible'}`}>
                {/* Backdrop Layer */}
                <div
                    className={`absolute inset-0 bg-on-surface/80 backdrop-blur-xl transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsOpen(false)}
                />

                {/* Drawer Menu */}
                <div className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-3xl transition-transform duration-500 ease-out border-l border-outline-variant/20 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 h-full flex flex-col pt-12">
                        
                        <div className="flex justify-between items-center mb-16">
                             <Link to="/" className="text-xl font-bold tracking-tighter text-on-surface uppercase font-headline italic">
                                Rose <span className="text-primary">Store</span>
                             </Link>
                             <button onClick={() => setIsOpen(false)} className="p-3 bg-surface-container-low text-primary rounded-2xl shadow-sm">
                                <X className="w-6 h-6" />
                             </button>
                        </div>

                        {/* Mobile Navigation Hub */}
                        <div className="flex-1 space-y-2">
                             <p className="text-[8px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] mb-6 italic">Store Navigation</p>
                             {navLinks.map((link) => (
                                <Link 
                                    key={link.path} 
                                    to={link.path} 
                                    className={`flex items-center justify-between p-6 rounded-3xl border transition-all ${location.pathname === link.path ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20' : 'bg-white border-outline-variant/10 text-on-surface hover:border-primary/20'}`}
                                >
                                    <span className="text-2xl font-bold tracking-tight uppercase font-headline italic">{link.name}</span>
                                    <ArrowRight className="w-5 h-5 opacity-40" />
                                </Link>
                             ))}
                        </div>

                        {/* Mobile Account Hub */}
                        <div className="mt-auto pt-8 border-t border-outline-variant/10 space-y-4">
                             {user ? (
                                <div className="space-y-4">
                                     <Link to="/profile" className="flex items-center gap-4 p-4 bg-surface-container-low rounded-3xl border border-outline-variant/5">
                                         <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/20 bg-white">
                                             <img
                                                 src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                                 className="w-full h-full object-cover"
                                                 alt={user.name}
                                                 onError={(e) => {
                                                     console.error('Mobile Avatar failed to load:', user.avatar);
                                                     e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`;
                                                 }}
                                             />
                                         </div>
                                         <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-on-surface truncate">{user.name}</p>
                                            <p className="text-[9px] font-bold text-primary uppercase tracking-widest italic opacity-60">Control Panel</p>
                                         </div>
                                         <LayoutDashboard className="w-5 h-5 text-on-surface-variant/30" />
                                     </Link>
                                     <button 
                                        onClick={() => { logout(); setIsOpen(false); }} 
                                        className="w-full py-5 rounded-3xl border border-outline-variant/20 flex items-center justify-center gap-3 text-on-surface-variant hover:text-primary transition-all font-bold text-[10px] uppercase tracking-widest italic"
                                     >
                                         <LogOut className="w-4 h-4" /> Terminate Session
                                     </button>
                                </div>
                             ) : (
                                <Link to="/login" className="w-full py-6 bg-primary text-white rounded-3xl flex items-center justify-center gap-4 font-bold uppercase text-[11px] tracking-widest shadow-2xl shadow-primary/25">
                                    Access Identity Registry <ArrowRight className="w-4 h-4" />
                                </Link>
                             )}
                        </div>

                    </div>
                </div>
            </div>
        </nav>
    );
};

export default memo(Navbar);
