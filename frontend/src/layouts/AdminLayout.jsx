import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  ShoppingBag
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const AdminLayout = () => {
    const { user, logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
        { name: 'Products', icon: Package, path: '/admin/products' },
        { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
        { name: 'Categories', icon: Layers, path: '/admin/categories' },
        { name: 'Coupons', icon: Ticket, path: '/admin/coupons' },
        { name: 'Customers', icon: Users, path: '/admin/customers' },
        { name: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-slate-50 select-none overflow-hidden font-manrope">
            
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 h-full w-72 bg-white border-r border-slate-100 flex flex-col py-8 z-[70] transition-transform duration-500 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="px-10 mb-12 flex justify-between items-center">
                    <Link to="/admin" className="block">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 italic uppercase">Mohaned</h1>
                        <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">Management Portal</p>
                    </Link>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 flex flex-col space-y-1 overflow-y-auto no-scrollbar px-4">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link 
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-6 py-4 transition-all rounded-2xl group ${isActive ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20 translate-x-1' : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'}`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-slate-950'}`} />
                                <span className="text-sm font-bold">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto px-6 space-y-6">
                    {/* User Profile Summary */}
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4 group cursor-pointer hover:border-slate-200 transition-colors" onClick={() => navigate('/account/profile')}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                            <img className="w-full h-full object-cover" src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`} alt={user?.name} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-slate-900 text-xs font-black truncate uppercase italic">{user?.name}</p>
                            <p className="text-slate-400 text-[9px] font-bold tracking-widest uppercase mt-0.5">Administrator</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-slate-950 transition-colors text-xs font-bold uppercase tracking-widest">
                            <ChevronRight className="w-4 h-4" /> View Storefront
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-6 py-3 text-red-400 hover:text-red-600 transition-colors text-xs font-bold uppercase tracking-widest group"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="h-20 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 lg:px-12 z-40 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="hidden md:flex items-center w-80 lg:w-[400px] bg-slate-50 rounded-2xl px-5 py-2.5 border border-slate-100/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-100 transition-all">
                            <Search className="text-slate-300 w-4 h-4 mr-3" />
                            <input className="bg-transparent border-none focus:ring-0 text-xs w-full font-manrope placeholder-slate-300 font-bold uppercase tracking-widest" placeholder="Quick Search..." type="text"/>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 lg:gap-8">
                        <button className="relative p-2.5 text-slate-400 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white ring-2 ring-indigo-500/20"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-100 mx-2 hidden lg:block" />
                        <button onClick={() => navigate('/admin/settings')} className="p-2.5 text-slate-400 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth">
                    <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
