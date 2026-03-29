import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Minus,
    AlertTriangle,
    RefreshCcw,
    Search,
    Package,
    SearchX,
    Zap,
    History,
    Save,
    LayoutDashboard,
    Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminProducts } from '../services/adminService';
import axiosInstance from '../services/axiosInstance';
import ProductModal from '../components/admin/ProductModal';

// ── Label ───────────────────────────────────────────────────
const Label = ({ en, required }) => (
    <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#351e24]/60">{en}{required && <span className="text-primary ml-1">*</span>}</span>
    </div>
);

const AdminInventory = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, low, out
    const [editingStock, setEditingStock] = useState({}); // { productId: value }
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { data: productsResp, isLoading, isError } = useQuery({
        queryKey: ['adminProducts'],
        queryFn: getAdminProducts,
    });

    const products = productsResp?.data || productsResp || [];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const inStock = (p.stock || 0) > 0;
        const isLow = (p.stock || 0) <= 5 && inStock;
        
        if (filter === 'low') return matchesSearch && isLow;
        if (filter === 'out') return matchesSearch && !inStock;
        return matchesSearch;
    });

    const updateStockMutation = useMutation({
        mutationFn: ({ id, stock }) => axiosInstance.put(`/admin/products/${id}/stock`, { stock }),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminProducts']);
            toast.success('Inventory updated');
            setEditingStock({});
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update stock.');
        }
    });

    const handleStockChange = (id, delta) => {
        const current = filteredProducts.find(p => p.id === id)?.stock || 0;
        const newVal = Math.max(0, current + delta);
        updateStockMutation.mutate({ id, stock: newVal });
    };

    const handleManualChange = (id, val) => {
        setEditingStock({ ...editingStock, [id]: val });
    };

    const handleSaveManual = (id) => {
        const val = parseInt(editingStock[id]);
        if (isNaN(val)) return;
        updateStockMutation.mutate({ id, stock: val });
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center bg-[#fffbfb] min-h-screen">
            <div className="w-12 h-12 border-[3px] border-rose-100 border-t-primary rounded-full animate-spin mx-auto mb-8 shadow-sm"></div>
            <p className="font-bold text-primary/50 uppercase tracking-[0.2em] text-[10px] italic">Loading Inventory...</p>
        </div>
    );

    const lowStockCount = products.filter(p => (p.stock || 0) <= 5 && (p.stock || 0) > 0).length;
    const outOfStockCount = products.filter(p => (p.stock || 0) <= 0).length;

    return (
        <div className="space-y-12 pb-24 font-['Plus_Jakarta_Sans'] antialiased">
            
            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[#fde2e7]/30 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                        <Package className="w-4 h-4" />
                        Stock Management
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-[#351e24] tracking-tighter uppercase italic leading-none">
                        Inventory <span className="text-primary">Control</span>
                    </h1>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="relative group/search">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#351e24]/20 group-focus-within/search:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name or SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-14 pr-8 py-5 bg-white border border-[#fde2e7] text-[#351e24] rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-rose-50 transition-all w-80 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => queryClient.invalidateQueries(['adminProducts'])}
                        className="px-8 py-5 bg-white border border-[#fde2e7] text-[#351e24] rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm flex items-center gap-3"
                    >
                        <RefreshCcw className="w-4 h-4" /> Sync
                    </button>
                </div>
            </header>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {[
                    { id: 'all', label: 'All Products', count: products.length, icon: Activity, color: 'primary' },
                    { id: 'low', label: 'Low Stock', count: lowStockCount, icon: AlertTriangle, color: 'amber-500' },
                    { id: 'out', label: 'Out of Stock', count: outOfStockCount, icon: Zap, color: 'rose-500' },
                ].map(({ id, label, count, icon: Icon, color }) => (
                    <button 
                        key={id}
                        onClick={() => setFilter(id)}
                        className={`p-8 rounded-[2.5rem] border text-left transition-all duration-500 relative overflow-hidden group ${
                            filter === id 
                            ? `bg-[#351e24] text-white border-transparent shadow-xl` 
                            : 'bg-white text-[#351e24] border-[#fde2e7]'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-4 rounded-2xl ${filter === id ? 'bg-white/10' : 'bg-[#fffbfb] border border-[#fde2e7]/30'}`}>
                                <Icon className={`w-5 h-5 ${filter === id ? 'text-white' : `text-${color}`}`} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest italic ${filter === id ? 'text-white/40' : 'text-[#351e24]/40'}`}>{label}</span>
                        </div>
                        <h3 className="text-4xl font-bold italic tracking-tighter leading-none tabular-nums">{count}</h3>
                        <p className={`text-[9px] font-bold uppercase tracking-widest mt-3 ${filter === id ? 'text-white/60' : 'text-[#351e24]/30'}`}>Active Items</p>
                    </button>
                ))}
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[3rem] border border-[#fde2e7]/40 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-bold text-[#351e24]/40 uppercase tracking-[0.2em] bg-[#fffbfb] border-b border-[#fde2e7]/30 italic text-center">
                                <th className="py-8 px-10 text-left">Product</th>
                                <th className="py-8 px-4">Current Stock</th>
                                <th className="py-8 px-4">Quick Adjust</th>
                                <th className="py-8 px-4">Manual Set</th>
                                <th className="py-8 px-4">Status</th>
                                <th className="py-8 px-10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#fde2e7]/10">
                            {filteredProducts.length > 0 ? filteredProducts.map((p) => {
                                const stock = p.stock || 0;
                                const isLow = stock <= 5 && stock > 0;
                                const isOut = stock <= 0;
                                
                                return (
                                    <tr 
                                        key={p.id} 
                                        className="hover:bg-rose-50/10 transition-all group cursor-pointer" 
                                        onClick={() => handleEditProduct(p)}
                                    >
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 bg-zinc-50 rounded-xl overflow-hidden border border-[#fde2e7]/50 group-hover:scale-105 transition-transform shrink-0">
                                                    <img src={p.image_url} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-lg font-bold text-[#351e24] tracking-tight italic uppercase truncate leading-none group-hover:text-primary transition-colors">{p.name}</p>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#351e24]/30 mt-2 italic">{p.sku || `ID: ${p.id}`}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-3xl font-bold italic tabular-nums leading-none tracking-tighter ${isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-[#351e24]'}`}>
                                                    {stock}
                                                </span>
                                                <span className="text-[8px] font-bold uppercase tracking-widest mt-2 text-[#351e24]/20">UNITS</span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-4">
                                            <div className="flex items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
                                                <button 
                                                    disabled={updateStockMutation.isPending}
                                                    onClick={() => handleStockChange(p.id, -1)}
                                                    className="w-10 h-10 rounded-xl bg-white border border-[#fde2e7] flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    disabled={updateStockMutation.isPending}
                                                    onClick={() => handleStockChange(p.id, 1)}
                                                    className="w-10 h-10 rounded-xl bg-white border border-[#fde2e7] flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm active:scale-90 disabled:opacity-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-8 px-4">
                                            <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="number"
                                                    value={editingStock[p.id] !== undefined ? editingStock[p.id] : ''}
                                                    placeholder="0"
                                                    onChange={(e) => handleManualChange(p.id, e.target.value)}
                                                    className="w-16 bg-zinc-50 border border-[#fde2e7] px-3 py-2.5 rounded-xl text-[11px] font-bold text-center focus:bg-white focus:ring-4 focus:ring-rose-50 transition-all outline-none"
                                                />
                                                {editingStock[p.id] !== undefined && (
                                                    <button 
                                                        disabled={updateStockMutation.isPending}
                                                        onClick={() => handleSaveManual(p.id)}
                                                        className="w-9 h-9 bg-[#351e24] text-white rounded-xl flex items-center justify-center hover:bg-primary transition-all shadow-lg"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-8 px-4 text-center">
                                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest italic ${
                                                isOut ? 'bg-rose-100 text-rose-600' : 
                                                isLow ? 'bg-amber-100 text-amber-600' : 
                                                'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                {isOut ? 'Depleted' : isLow ? 'Critical' : 'Healthy'}
                                            </span>
                                        </td>
                                        <td className="py-8 px-10 text-right">
                                            <button className="text-[#351e24]/20 hover:text-primary transition-colors p-2 hover:bg-rose-50 rounded-lg">
                                                <History className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className="py-32 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-20">
                                            <SearchX className="w-16 h-16 mb-4" />
                                            <p className="text-xl font-bold uppercase tracking-widest italic text-[#351e24]">No records found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Dashboard Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <section className="bg-white rounded-[3rem] p-10 border border-[#fde2e7] shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-widest mb-8">
                        <Zap className="w-4 h-4" />
                        Supply Analytics
                    </div>
                    <div className="space-y-10 relative z-10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]/40 italic">Overall Stock Health</span>
                                <span className="text-2xl font-bold italic tracking-tighter text-[#351e24]">78.2%</span>
                            </div>
                            <div className="h-4 w-full bg-rose-50 rounded-full overflow-hidden border border-[#fde2e7]/20">
                                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{width: '78%'}} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-[#fffbfb] rounded-3xl border border-[#fde2e7]/20">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]/40 mb-2 italic">Low Reserve</p>
                                <p className="text-3xl font-bold italic tracking-tighter text-[#351e24]">{lowStockCount} Items</p>
                            </div>
                            <div className="p-6 bg-[#fffbfb] rounded-3xl border border-[#fde2e7]/20">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]/40 mb-2 italic">Avg Turnover</p>
                                <p className="text-3xl font-bold italic tracking-tighter text-[#351e24]">14 Days</p>
                            </div>
                        </div>
                    </div>
                 </section>

                 <section className="bg-[#351e24] rounded-[3rem] p-10 text-white shadow-xl flex flex-col justify-between group">
                    <div className="flex items-center gap-3 text-primary font-bold text-[10px] uppercase tracking-widest">
                        <History className="w-4 h-4" />
                        System Logic
                    </div>
                    <div>
                        <h3 className="text-4xl font-bold tracking-tighter italic uppercase leading-tight">Automated <span className="text-primary">Sync</span></h3>
                        <p className="text-white/40 font-bold mt-4 text-[11px] leading-relaxed italic uppercase tracking-widest">Stock levels are automatically deducted upon checkout, providing 1:1 real-time inventory precision across all customer touchpoints.</p>
                    </div>
                    <button onClick={() => navigate('/admin/orders')} className="mt-8 w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest italic hover:bg-white hover:text-[#351e24] transition-all flex items-center justify-center gap-3">
                        <LayoutDashboard className="w-4 h-4" /> View Sales Activity
                    </button>
                 </section>
            </div>

            {/* Product Edit Modal */}
            <ProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
};

export default AdminInventory;
