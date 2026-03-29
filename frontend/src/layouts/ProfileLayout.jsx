import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    ShoppingBag,
    ChevronRight,
    User,
    Heart,
    LogOut,
    Sparkles,
    Settings,
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const ProfileLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { name: 'Profile',       ar: 'معلومات الحساب', icon: User,        path: '/profile' },
        { name: 'Orders',        ar: 'سجل الطلبيات',   icon: ShoppingBag, path: '/profile/orders' },
        { name: 'Wishlist',      ar: 'قائمة الأمنيات', icon: Heart,       path: '/profile/wishlist' },
        { name: 'Settings',      ar: 'الإعدادات',      icon: Settings,    path: '/profile/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen bg-[#fffbfb] select-none font-['Plus_Jakarta_Sans'] overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Cairo:wght@400;600;700;900&display=swap');
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #fde2e7; border-radius: 10px; }
            `}</style>

            {/* Same Sidebar UI as Dashboard */}
            <aside className="w-72 bg-white border-r border-[#fde2e7]/40 flex flex-col py-8 shrink-0 h-screen sticky top-0">
                <div className="px-8 mb-12 flex justify-between items-center">
                    <Link to="/" className="group">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
                            <h1 className="text-2xl font-black tracking-tighter text-[#351e24] italic uppercase leading-none">Rose</h1>
                        </div>
                        <p className="text-[#b0004a]/40 text-[9px] font-black tracking-[0.3em] uppercase mt-1 px-0.5">Customer Gallery</p>
                    </Link>
                </div>

                <nav className="flex-1 flex flex-col space-y-1 overflow-y-auto no-scrollbar px-5 custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-4 px-5 py-4 transition-all rounded-3xl group relative overflow-hidden ${isActive ? 'bg-[#fff0f3] text-primary shadow-sm shadow-primary/5' : 'text-zinc-400 hover:text-primary hover:bg-[#fff9fa]/50'}`}
                            >
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-full my-4" />}
                                <item.icon className="w-5 h-5 shrink-0" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "" }} />
                                <div className="flex flex-col">
                                    <span className={`text-[11px] font-black uppercase tracking-wider italic ${isActive ? 'text-primary' : ''}`}>{item.name}</span>
                                    <span className={`text-[10px] font-bold -mt-0.5 ${isActive ? 'text-primary/60' : 'text-zinc-300'}`} style={{ fontFamily: "'Cairo', sans-serif" }}>{item.ar}</span>
                                </div>
                                {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto px-5 pt-8 space-y-4">
                    <div className="bg-[#fffbfb] rounded-[2.5rem] p-4 border border-[#fde2e7]/40">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-white border border-[#fde2e7]/40 flex items-center justify-center shrink-0 shadow-sm">
                                <User className="w-5 h-5 text-primary/30" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-[#351e24] uppercase tracking-tight italic truncate">{user?.name || 'Guest'}</p>
                                <p className="text-[8px] font-bold text-[#b0004a]/40 uppercase tracking-widest mt-0.5">Verified Identity</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3 text-[#b0004a]/40 hover:text-primary hover:bg-rose-50 rounded-2xl transition-all text-[9px] font-black uppercase tracking-[0.2em] italic group"
                        >
                            <LogOut className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-12 scroll-smooth custom-scrollbar mt-[50px]">
                <div className="max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default ProfileLayout;