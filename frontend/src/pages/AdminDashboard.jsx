import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
    DollarSign, 
    ShoppingCart, 
    Package, 
    Users,
    TrendingUp, 
    TrendingDown, 
    AlertTriangle, 
    Ticket,
    Settings,
    ArrowUpRight,
    Search,
    ShoppingBag,
    Plus,
    Layers,
    BarChart3,
    Activity,
    RefreshCcw,
    FileText,
    Download
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
    Legend
} from 'recharts';
import { getAdminStats } from '../services/adminService';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: statsResp, isLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: getAdminStats,
    });

    const stats = statsResp?.data || statsResp;
    const summary = stats?.summary;

    const cards = [
        { 
            title: 'Gross Revenue', 
            val: `$${parseFloat(summary?.total_sales || 0).toLocaleString()}`, 
            icon: DollarSign, 
            label: 'Total Lifetime Sales',
            color: 'text-emerald-600 bg-emerald-50'
        },
        { 
            title: 'Total Orders', 
            val: (summary?.total_orders || 0).toLocaleString(), 
            icon: ShoppingBag, 
            label: 'Customer Transactions',
            color: 'text-indigo-600 bg-indigo-50'
        },
        { 
            title: 'Total Products', 
            val: (summary?.total_products || 0).toLocaleString(), 
            icon: Package, 
            label: 'Active Inventory',
            color: 'text-amber-600 bg-amber-50'
        },
        { 
            title: 'Total Customers', 
            val: (summary?.total_customers || 0).toLocaleString(), 
            icon: Users, 
            label: 'Registered Base',
            color: 'text-blue-600 bg-blue-50'
        },
    ];

    const pieData = summary?.orders_by_status ? Object.entries(summary.orders_by_status).map(([name, value]) => ({
        name: name.toUpperCase(),
        value: parseInt(value)
    })) : [
        { name: 'DELIVERED', value: 70 },
        { name: 'PROCESSING', value: 20 },
        { name: 'CANCELLED', value: 10 }
    ];

    const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center">
            <div className="inline-block w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-8 font-bold text-slate-400">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-20 font-manrope">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h2>
                    <p className="text-slate-500 font-medium mt-2">Live insights into your business metrics</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => {
                             queryClient.invalidateQueries(['adminStats']);
                             toast.success('Stats refreshed.');
                        }}
                        className="px-6 py-3 bg-white border border-slate-100 text-slate-900 text-[11px] font-bold uppercase rounded-lg hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" /> Refresh Stats
                    </button>
                    <button 
                        onClick={() => toast.success('Exporting data as CSV...')}
                        className="px-6 py-3 bg-white border border-slate-100 text-slate-900 text-[11px] font-bold uppercase rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" /> Export Data
                    </button>
                    <Link to="/admin/products/" className="px-6 py-3 bg-slate-950 text-white text-[11px] font-bold uppercase rounded-lg shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Add Product
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-10">
                            <div className={`p-3 rounded-xl ${card.color}`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] uppercase font-bold text-slate-300">Live Delta</span>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{card.title}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{card.val}</h3>
                        <p className="text-[10px] font-medium text-slate-400">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Key Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Evolution */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-4">
                            <BarChart3 className="w-6 h-6 text-slate-400" />
                            <h4 className="text-lg font-bold text-slate-900">Revenue Evolution</h4>
                        </div>
                        <div className="flex gap-2">
                            {['7D', '30D', '6M'].map(t => (
                                <button key={t} className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all ${t === '30D' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-900'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="h-80 w-full min-h-[320px]">
                        <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={stats?.chart_data || []}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}}
                                    dy={10}
                                    tickFormatter={(str) => {
                                        const date = new Date(str);
                                        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                                    }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#94a3b8'}} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Composition */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                    <h4 className="text-lg font-bold text-slate-900 mb-10">Sales Status Composition</h4>
                    <div className="h-64 w-full relative min-h-[256px]">
                        <ResponsiveContainer width="99%" height="100%" minWidth={0} minHeight={0}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-slate-900 leading-none">{summary?.total_orders || 0}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">Orders</span>
                        </div>
                    </div>
                    <div className="mt-auto space-y-4 pt-8 border-t border-slate-50">
                        {pieData.slice(0, 3).map((d, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px] font-bold">
                                <div className="flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                                    <span className="text-slate-500 uppercase">{d.name}</span>
                                </div>
                                <span className="text-slate-900">{d.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tables & Lists */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Recent Orders Overview */}
                <div className="xl:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <h4 className="text-lg font-bold text-slate-900">Recent Customer Orders</h4>
                        </div>
                        <Link to="/admin/orders" className="text-xs font-bold text-slate-400 hover:text-slate-900 underline underline-offset-4 decoration-slate-200">View Full Archive</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <th className="px-10 py-6">Order Reference</th>
                                    <th className="px-10 py-6">Customer</th>
                                    <th className="px-10 py-6">Value</th>
                                    <th className="px-10 py-6">State</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {stats?.recent_orders?.slice(0, 5).map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                        <td className="px-10 py-6 font-bold text-sm text-slate-900">#{order.order_number}</td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                                                    {order.user?.name?.charAt(0) || 'G'}
                                                </div>
                                                <span className="text-xs font-bold text-slate-600">{order.user?.name || 'Guest'}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-sm font-bold text-slate-900">${order.total}</td>
                                        <td className="px-10 py-6">
                                            <span className="px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Best Selling Products */}
                <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
                    <h4 className="text-lg font-bold text-slate-900 mb-8 pb-6 border-b border-slate-50 flex items-center gap-4">
                        <TrendingUp className="w-5 h-5 text-emerald-500" /> Top Sales Velocity
                    </h4>
                    <div className="space-y-8">
                        {stats?.top_products?.slice(0, 4).map((product) => (
                            <div key={product.id} className="flex gap-5 group cursor-pointer" >
                                <div className="w-16 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 border border-slate-100 group-hover:border-slate-300 transition-colors">
                                    <img className="w-full h-full object-cover" src={product.image_url} alt={product.name} />
                                </div>
                                <div className="flex flex-col justify-center gap-1">
                                    <p className="text-sm font-bold text-slate-900 truncate leading-tight group-hover:text-amber-600 transition-colors">{product.name}</p>
                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">{product.total_sold || 0} Units Sold</p>
                                    <span className="text-lg font-black text-slate-900 mt-1">${product.price}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Management Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { name: 'Add Product', path: '/admin/products/new', icon: Plus, desc: 'Update Inventory' },
                    { name: 'Categories', path: '/admin/categories', icon: Layers, desc: 'Manage Catalog' },
                    { name: 'Coupons', path: '/admin/coupons', icon: Ticket, desc: 'Manage Promotions' },
                    { name: 'Settings', path: '/admin/settings', icon: Settings, desc: 'Core Preferences' },
                ].map((action, i) => (
                    <Link key={i} to={action.path} className="p-10 bg-white rounded-[2.5rem] border border-slate-100 hover:border-slate-900 transition-all text-left flex flex-col gap-6 group shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-white group-hover:rotate-6 transition-transform shadow-lg">
                            <action.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xl font-bold text-slate-900 tracking-tight">{action.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-1">{action.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
