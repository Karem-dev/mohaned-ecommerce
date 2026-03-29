import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    DollarSign,
    Package,
    Users,
    Activity,
    RefreshCcw,
    LayoutDashboard,
    ShoppingBag,
    TrendingUp,
    MoveUpRight,
    Layers,
    Tag,
    Settings,
    ArrowUpRight,
    ChevronRight,
    ShieldCheck,
    Truck,
    Star,
    BarChart2,
    PieChart as PieChartIcon,
    Zap,
    Clock,
    CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import { getAdminStats } from '../services/adminService';

const AdminDashboard = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { data: statsResp, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: getAdminStats,
    });

    const stats = statsResp?.data || statsResp;
    const summary = stats?.summary;

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center bg-[#fffbfb] min-h-screen">
            <div className="w-12 h-12 border-[3px] border-rose-100 border-t-primary rounded-full animate-spin mx-auto mb-8 shadow-sm"></div>
            <p className="font-bold text-primary/50 uppercase tracking-[0.2em] text-[10px] italic">Loading Intelligence...</p>
        </div>
    );

    const cards = [
        { 
            title: 'Revenue', 
            value: `$${parseFloat(summary?.total_sales || 0).toLocaleString()}`, 
            icon: DollarSign, 
            color: 'emerald-500',
            desc: 'Total lifetime earnings'
        },
        { 
            title: 'Total Orders', 
            value: (summary?.total_orders || 0).toLocaleString(), 
            icon: ShoppingBag, 
            color: 'primary',
            desc: 'Successfully processed'
        },
        { 
            title: 'Catalog Items', 
            value: (summary?.total_products || 0).toLocaleString(), 
            icon: Package, 
            color: 'violet-500',
            desc: 'Active in shop'
        },
        { 
            title: 'Customers', 
            value: (summary?.total_customers || 0).toLocaleString(), 
            icon: Users, 
            color: 'amber-500',
            desc: 'Registered accounts'
        },
        { 
            title: 'Feedback', 
            value: (summary?.total_reviews || 0).toLocaleString(), 
            icon: Star, 
            color: 'sky-500',
            desc: 'Average rating: 4.8'
        },
    ];

    const salesData = stats?.sales_chart && stats.sales_chart.length > 0 ? stats.sales_chart : [
        { date: 'Mon', total: 400 },
        { date: 'Tue', total: 600 },
        { date: 'Wed', total: 500 },
        { date: 'Thu', total: 900 },
        { date: 'Fri', total: 800 },
        { date: 'Sat', total: 1200 },
        { date: 'Sun', total: 1100 },
    ];
    
    const categoriesDataSource = summary?.products_by_category ? Object.entries(summary.products_by_category) : [];
    const categoriesData = categoriesDataSource.length > 0 ? categoriesDataSource.map(([name, count]) => ({
        name: name,
        count: count,
    })) : [{ name: 'Uncategorized', count: 0 }];

    const orderStatusDataSource = summary?.orders_by_status ? Object.entries(summary.orders_by_status) : [];
    const orderStatusData = orderStatusDataSource.length > 0 ? orderStatusDataSource.map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count
    })) : [{ name: 'Empty', value: 1 }];

    const PIE_COLORS = ['#351e24', '#f1144f', '#f59e0b', '#10b981', '#6366f1'];

    return (
        <div className="space-y-12 pb-24 font-['Plus_Jakarta_Sans'] antialiased">
            
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[#fde2e7]/30 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                        <LayoutDashboard className="w-4 h-4" />
                        Performance Hub
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-[#351e24] tracking-tighter uppercase italic leading-none">
                        Dashboard <span className="text-primary">Overview</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-6 py-4 bg-white border border-[#fde2e7] text-[#351e24] rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center gap-4 shadow-sm">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Status
                    </div>
                    <button 
                        onClick={() => {
                            queryClient.invalidateQueries(['adminStats']);
                            toast.success('Stats updated');
                        }}
                        className="p-4 bg-white border border-[#fde2e7] text-[#351e24] rounded-2xl hover:bg-rose-50 transition-all shadow-sm"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Performance High-level Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#fde2e7]/40 shadow-sm group hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 rounded-2xl bg-[#fffbfb] border border-[#fde2e7]/30 text-${card.color}`}>
                                <card.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]/20">{card.title}</span>
                        </div>
                        <h3 className="text-3xl font-bold italic tracking-tighter text-[#351e24] tabular-nums leading-none">{card.value}</h3>
                        <p className="text-[8px] font-bold uppercase tracking-widest mt-3 text-[#351e24]/30">{card.desc}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Revenue Chart Section */}
                <div className="lg:col-span-2 space-y-12">
                   <section className="bg-white rounded-[4rem] border border-[#fde2e7]/40 p-12 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary italic">Revenue Stream</p>
                                <h2 className="text-4xl font-bold text-[#351e24] tracking-tighter uppercase italic leading-none">Growth <span className="text-primary">Analytics</span></h2>
                            </div>
                            <div className="flex gap-4">
                                {['7D', '30D', '90D'].map(t => (
                                    <button key={t} className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${t === '30D' ? 'bg-[#351e24] text-white shadow-lg' : 'bg-rose-50/50 text-[#351e24]/40 hover:bg-rose-50'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[400px] w-full mt-8">
                             <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                   <defs>
                                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                         <stop offset="5%" stopColor="#f1144f" stopOpacity={0.1}/>
                                         <stop offset="95%" stopColor="#f1144f" stopOpacity={0}/>
                                      </linearGradient>
                                   </defs>
                                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fde2e7" />
                                   <XAxis 
                                      dataKey="date" 
                                      axisLine={false} 
                                      tickLine={false} 
                                      tick={{fill: '#351e2440', fontSize: 10, fontWeight: 700}}
                                   />
                                   <YAxis 
                                      axisLine={false} 
                                      tickLine={false} 
                                      tick={{fill: '#351e2440', fontSize: 10, fontWeight: 700}}
                                      tickFormatter={(v) => `$${v}`}
                                   />
                                   <Tooltip 
                                      contentStyle={{borderRadius: '1.25rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', padding: '16px'}}
                                      itemStyle={{fontSize: '11px', fontWeight: 800, textTransform: 'uppercase'}}
                                   />
                                   <Area 
                                      type="monotone" 
                                      dataKey="total" 
                                      stroke="#f1144f" 
                                      strokeWidth={3}
                                      fillOpacity={1} 
                                      fill="url(#colorSales)" 
                                   />
                                </AreaChart>
                             </ResponsiveContainer>
                        </div>
                   </section>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Categories Bar Chart */}
                        <section className="bg-white rounded-[3rem] p-10 border border-[#fde2e7] shadow-sm space-y-8">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]/40 italic">Inventory Mix</p>
                                    <h3 className="text-2xl font-bold text-[#351e24] tracking-tighter uppercase italic leading-none">Catalog <span className="text-primary">Split</span></h3>
                                </div>
                                <div className="p-3 bg-violet-50 rounded-2xl text-violet-500">
                                    <Package className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                   <BarChart data={categoriesData}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fde2e7" />
                                      <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                                      <Tooltip cursor={{fill: '#fde2e740'}} contentStyle={{borderRadius: '1rem', border: 'none'}} />
                                      <Bar dataKey="count" fill="#351e24" radius={[5, 5, 5, 5]} barSize={30} />
                                   </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </section>

                        {/* Order Distribution Pie Chart */}
                        <section className="bg-white rounded-[3rem] p-10 border border-[#fde2e7] shadow-sm space-y-8">
                             <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]/40 italic">Process Flow</p>
                                    <h3 className="text-2xl font-bold text-[#351e24] tracking-tighter uppercase italic leading-none">Order <span className="text-primary">Status</span></h3>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                                    <Truck className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="h-[250px] w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value" stroke="none">
                                            {orderStatusData.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[18px] font-bold text-[#351e24] italic tracking-tighter tabular-nums leading-none">{summary?.total_orders || 0}</span>
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-300">Total</span>
                                </div>
                            </div>
                        </section>
                   </div>
                </div>

                {/* Sidebar Navigation & High Priority */}
                <div className="space-y-12">
                     <section className="p-10 bg-white rounded-[3.5rem] border border-[#fde2e7] shadow-sm">
                        <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-widest mb-10 italic">
                            <MoveUpRight className="w-4 h-4" />
                            Operations Center
                        </div>
                        <div className="space-y-4">
                            {[
                                { name: 'Products', path: '/admin/products', icon: ShoppingBag, color: 'text-violet-500' },
                                { name: 'Order Management', path: '/admin/orders', icon: Truck, color: 'text-amber-500' },
                                { name: 'Category Setup', path: '/admin/categories', icon: Layers, color: 'text-sky-500' },
                                { name: 'Active Coupons', path: '/admin/coupons', icon: Tag, color: 'text-rose-500' },
                                { name: 'Site Settings', path: '/admin/settings', icon: Settings, color: 'text-zinc-500' },
                            ].map((link, i) => (
                                <Link 
                                    key={i} 
                                    to={link.path} 
                                    className="flex items-center justify-between p-6 rounded-2xl bg-[#fffbfb] border border-[#fde2e7]/30 hover:bg-white hover:shadow-lg transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <link.icon className={`w-5 h-5 ${link.color}`} />
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#351e24] italic">{link.name}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[#351e24]/10 group-hover:text-primary transition-colors" />
                                </Link>
                            ))}
                        </div>
                     </section>

                     <section className="bg-[#351e24] p-10 rounded-[3.5rem] text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:scale-110 transition-transform duration-[4s]">
                            <TrendingUp className="w-40 h-40" />
                        </div>
                        <div className="flex items-center gap-3 text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-8 italic">
                            <CheckCircle2 className="w-4 h-4" />
                            Quality Report
                        </div>
                        <div className="space-y-6 relative z-10">
                            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Inventory Health</span>
                                    <span className="text-emerald-400 font-bold italic text-sm">Optimal</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-3">
                                    <div className="h-full bg-emerald-400 w-[92%]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                 <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1">Low Items</p>
                                    <p className="text-2xl font-bold italic tracking-tighter text-white">{summary?.stock_alerts_count || 0}</p>
                                 </div>
                                 <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/30 mb-1">Unread Msg</p>
                                    <p className="text-2xl font-bold italic tracking-tighter text-white">0</p>
                                 </div>
                            </div>
                        </div>
                        <button onClick={() => navigate('/admin/inventory')} className="mt-8 w-full py-5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest italic transition-all">
                            View Details Record
                        </button>
                     </section>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
