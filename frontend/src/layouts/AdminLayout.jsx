import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    LayoutDashboard,
    Package,
    Layers,
    Users,
    Ticket,
    Settings,
    LogOut,
    Search,
    Bell,
    Menu,
    X,
    ChevronRight,
    ShoppingBag,
    Sparkles,
    CheckCircle2,
    Clock,
    UserPlus,
    Trash2
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import axiosInstance from '../services/axiosInstance';
import { toast } from 'react-hot-toast';

const AdminLayout = () => {
    const { user, logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: notifyData, isLoading: isNotifyLoading } = useQuery({
        queryKey: ['adminNotifications'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/admin/notifications');
            return data;
        },
        refetchInterval: 30000 // Refetch every 30 seconds
    });

    const markReadMutation = useMutation({
        mutationFn: (id) => axiosInstance.post(`/admin/notifications/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries(['adminNotifications'])
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => axiosInstance.post('/admin/notifications/read-all'),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminNotifications']);
            toast.success('All notifications marked as read');
        }
    });

    const deleteNotificationMutation = useMutation({
        mutationFn: (id) => axiosInstance.delete(`/admin/notifications/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['adminNotifications'])
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const notifications = notifyData?.notifications || [];
    const unreadCount = notifyData?.unread_count || 0;

    const getNotifyIcon = (type) => {
        switch(type) {
            case 'new_order': return <ShoppingBag className="w-4 h-4 text-primary" />;
            case 'new_user': return <UserPlus className="w-4 h-4 text-emerald-500" />;
            default: return <Bell className="w-4 h-4 text-zinc-400" />;
        }
    };

    const menuItems = [
        { name: 'Dashboard', ar: 'لوحة التحكم', icon: LayoutDashboard, path: '/admin' },
        { name: 'Products', ar: 'المنتجات', icon: Package, path: '/admin/products' },
        { name: 'Orders', ar: 'الطلبات', icon: ShoppingBag, path: '/admin/orders' },
        { name: 'Inventory', ar: 'المخزون', icon: Package, path: '/admin/inventory' },
        { name: 'Categories', ar: 'الأقسام', icon: Layers, path: '/admin/categories' },
        { name: 'Coupons', ar: 'الكوبونات', icon: Ticket, path: '/admin/coupons' },
        { name: 'Customers', ar: 'العملاء', icon: Users, path: '/admin/customers' },
        { name: 'Settings', ar: 'الإعدادات', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-[#fffbfb] select-none overflow-hidden font-['Plus_Jakarta_Sans']">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Cairo:wght@400;600;700;900&display=swap');
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #fde2e7; border-radius: 10px; }
            `}</style>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-[#351e24]/40 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Redesigned Rose Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 h-full w-72 bg-white border-r border-[#fde2e7]/40 flex flex-col py-8 z-[70] transition-transform duration-500 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-8 mb-12 flex justify-between items-center">
                    <Link to="/admin" className="group">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform" />
                            <h1 className="text-2xl font-black tracking-tighter text-[#351e24] italic uppercase leading-none">Rose</h1>
                        </div>
                        <p className="text-[#b0004a]/40 text-[9px] font-black tracking-[0.3em] uppercase mt-1 px-0.5">Admin Dashboard</p>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-zinc-300 hover:text-primary transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 flex flex-col space-y-1 overflow-y-auto no-scrollbar px-5 custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
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
                    <div className="bg-white rounded-[2.5rem] p-2 space-y-1 shadow-sm border border-zinc-50">
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
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-20 bg-white/60 backdrop-blur-xl flex justify-between items-center px-6 lg:px-12 z-40 border-b border-[#fde2e7]/30 shrink-0">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#351e24] hover:bg-[#fff0f3] rounded-2xl transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden md:flex items-center w-80 lg:w-[450px] bg-[#fffbfb] rounded-3xl px-6 py-2.5 border border-[#fde2e7]/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-[#fff0f3] transition-all group">
                            <Search className="text-zinc-300 w-4 h-4 mr-4 group-focus-within:text-primary" />
                            <input
                                className="bg-transparent border-none focus:ring-0 text-[10px] w-full font-black placeholder-zinc-200 uppercase tracking-[0.2em] italic text-[#351e24]"
                                placeholder="Search for anything..."
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-6 relative">
                        <div className="hidden xl:flex flex-col items-end mr-2">
                            <span className="text-[10px] font-black text-[#351e24] uppercase tracking-wider leading-none">System Status</span>
                            <span className="text-[8px] font-bold text-primary animate-pulse uppercase tracking-widest mt-1">ONLINE</span>
                        </div>
                        
                        <div className="relative">
                            <button 
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className={`relative p-3 transition-all group rounded-2xl ${isNotificationsOpen ? 'bg-[#fff0f3] text-primary' : 'text-zinc-400 hover:text-primary hover:bg-[#fff0f3]'}`}
                            >
                                <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-5 h-5 bg-primary text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsNotificationsOpen(false)} />
                                    <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-[#fde2e7]/50 z-20 overflow-hidden animate-in slide-in-from-top-4 duration-300">
                                        <div className="p-6 border-b border-[#fde2e7]/30 flex justify-between items-center bg-[#fffbfb]">
                                            <h3 className="text-[10px] font-black text-[#351e24] uppercase tracking-[0.2em] italic">Alerts Registry</h3>
                                            <button 
                                                onClick={() => markAllReadMutation.mutate()}
                                                className="text-[8px] font-bold text-primary uppercase tracking-widest hover:underline decoration-2"
                                            >
                                                Mark all read
                                            </button>
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                                            {notifications.length > 0 ? (
                                                notifications.map((n) => (
                                                    <div 
                                                        key={n.id} 
                                                        onClick={() => markReadMutation.mutate(n.id)}
                                                        className={`p-4 rounded-3xl mb-1 transition-all group cursor-pointer relative overflow-hidden ${n.is_read ? 'opacity-40 hover:opacity-100 bg-white' : 'bg-[#fff9fa]'}`}
                                                    >
                                                        {!n.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                                                        <div className="flex gap-4">
                                                            <div className="w-10 h-10 rounded-2xl bg-white border border-[#fde2e7]/40 flex items-center justify-center shrink-0">
                                                                {getNotifyIcon(n.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[10px] font-black text-[#351e24] uppercase tracking-tighter italic">{n.title}</p>
                                                                <p className="text-[10px] text-zinc-400 font-bold mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                                                                <p className="text-[8px] text-primary/40 font-black uppercase tracking-widest mt-2 italic flex items-center gap-1">
                                                                    <Clock className="w-2.5 h-2.5" />
                                                                    {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                            <button 
                                                                onClick={(e) => { e.stopPropagation(); deleteNotificationMutation.mutate(n.id); }}
                                                                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-200 hover:text-primary transition-all"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-20 text-center">
                                                    <Bell className="w-8 h-8 text-[#fde2e7] mx-auto mb-4" />
                                                    <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest italic">No alerts documented</p>
                                                </div>
                                            )}
                                        </div>
                                        <Link 
                                            to="/admin/settings" 
                                            onClick={() => setIsNotificationsOpen(false)}
                                            className="block p-4 bg-[#ffffb] text-center text-[9px] font-black text-primary uppercase tracking-widest border-t border-[#fde2e7]/30 hover:bg-[#fff0f3] transition-all italic"
                                        >
                                            View Audit Log
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="h-6 w-px bg-[#fde2e7]/50 mx-1 hidden lg:block" />
                        <button onClick={() => navigate('/admin/settings')} className="p-3 text-zinc-400 hover:text-primary hover:bg-[#fff0f3] rounded-2xl transition-all group">
                            <Settings className="w-5 h-5 group-hover:rotate-90 duration-500 transition-transform" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth custom-scrollbar">
                    <div className="max-w-[1500px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
