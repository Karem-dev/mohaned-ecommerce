import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    AlertTriangle,
    RefreshCcw,
    Package,
    SearchX,
    LayoutGrid,
    ChevronRight,
    Eye,
    EyeOff
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminProducts, deleteAdminProduct, getAdminCategories } from '../services/adminService';
import ProductModal from '../components/admin/ProductModal';

const AdminProducts = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const { data: productsResp, isLoading, isError } = useQuery({
        queryKey: ['adminProducts'],
        queryFn: getAdminProducts,
    });

    const { data: categoriesResp } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: getAdminCategories,
    });

    const products = productsResp?.data || productsResp || [];
    const categories = categoriesResp?.data || [];

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const deleteMutation = useMutation({
        mutationFn: deleteAdminProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(['adminProducts']);
            toast.success('Product deleted');
            setDeleteId(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Delete failed.');
            setDeleteId(null);
        }
    });

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center bg-[#fffbfb] min-h-screen">
            <div className="w-12 h-12 border-[3px] border-rose-100 border-t-primary rounded-full animate-spin mx-auto mb-8 shadow-sm"></div>
            <p className="font-bold text-primary/50 uppercase tracking-[0.2em] text-[10px] italic">Loading Products...</p>
        </div>
    );

    if (isError) return (
        <div className="text-center py-40 bg-white rounded-[3rem] border border-[#fde2e7] shadow-sm mx-6">
            <AlertTriangle className="w-16 h-16 text-rose-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-[#351e24] uppercase italic tracking-tighter">Connection Error</h3>
            <p className="text-[#351e24]/40 mt-4 font-bold uppercase tracking-widest text-[10px]">Unable to load products from server.</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-24 font-['Plus_Jakarta_Sans'] antialiased">

            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[#fde2e7]/30 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                        <Package className="w-4 h-4" />
                        Product Catalog
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-[#351e24] tracking-tighter uppercase italic leading-none">
                        Products <span className="text-primary">& Listing</span>
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
                        <RefreshCcw className="w-4 h-4" /> Refresh
                    </button>
                    <button
                        onClick={handleAdd}
                        className="px-12 py-5 bg-[#351e24] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-[#351e24]/10 flex items-center gap-3"
                    >
                        <Plus className="w-4 h-4" /> Add Product
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {[
                    { label: 'Total Products', value: products.length, icon: Package, color: 'primary' },
                    { label: 'Active Catalog', value: products.filter(p => p.is_active).length, icon: LayoutGrid, color: 'emerald-500' },
                    { label: 'Low Stock', value: products.filter(p => p.quantity < 5 && p.quantity > 0).length, icon: AlertTriangle, color: 'amber-500' },
                    { label: 'Hidden Items', value: products.filter(p => !p.is_active).length, icon: EyeOff, color: 'rose-500' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white p-6 rounded-3xl border border-[#fde2e7]/40 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-[#fffbfb] rounded-xl border border-[#fde2e7]/30">
                                <Icon className={`w-4 h-4 text-${color}`} />
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-[#351e24]/30">{label}</span>
                        </div>
                        <h3 className="text-3xl font-bold italic tracking-tighter text-[#351e24] tabular-nums leading-none">{value}</h3>
                    </div>
                ))}
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-[3rem] border border-[#fde2e7]/40 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-bold text-[#351e24]/40 uppercase tracking-[0.2em] bg-[#fffbfb] border-b border-[#fde2e7]/30 italic">
                                <th className="py-8 px-10">Product Details</th>
                                <th className="py-8 px-4 text-center">Category</th>
                                <th className="py-8 px-4 text-center">Price</th>
                                <th className="py-8 px-4 text-center">Inventory</th>
                                <th className="py-8 px-4 text-center">Status</th>
                                <th className="py-8 px-10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#fde2e7]/10">
                            {filteredProducts.length > 0 ? filteredProducts.map((p) => {
                                const inStock = (p.quantity || 0) > 0;
                                const isLowStock = p.quantity < 5 && inStock;

                                return (
                                    <tr key={p.id} className="hover:bg-rose-50/10 transition-all group cursor-pointer" onClick={() => handleEdit(p)}>
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-20 rounded-2xl bg-zinc-50 overflow-hidden shrink-0 border border-[#fde2e7]/30 group-hover:scale-105 transition-transform duration-700 shadow-sm">
                                                    <img src={p.image_url} className="w-full h-full object-cover" alt="" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=P&background=eee&color=999'} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-lg font-bold text-[#351e24] tracking-tight uppercase italic leading-tight group-hover:text-primary transition-colors">{p.name}</p>
                                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#351e24]/30 mt-2 italic">{p.sku || `ID: ${p.id}`}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-4 text-center">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]/60 bg-rose-50/50 px-4 py-1.5 rounded-lg border border-[#fde2e7]/30">
                                                {p.category?.name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="py-8 px-4 text-center">
                                            <span className="text-2xl font-bold italic tracking-tighter text-primary tabular-nums">${parseFloat(p.price).toLocaleString()}</span>
                                        </td>
                                        <td className="py-8 px-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`text-xl font-bold italic tabular-nums leading-none ${!inStock ? 'text-rose-500' : isLowStock ? 'text-amber-500' : 'text-[#351e24]'}`}>
                                                    {p.quantity || 0}
                                                </span>
                                                <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${isLowStock ? 'text-amber-500' : 'text-[#351e24]/20'}`}>
                                                    {isLowStock ? 'Low Stock' : 'Units'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                 <div className={`w-2 h-2 rounded-full ${p.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-[#351e24]/20'}`} />
                                                 <span className={`text-[9px] font-bold uppercase tracking-widest italic ${p.is_active ? 'text-emerald-600' : 'text-[#351e24]/30'}`}>
                                                    {p.is_active ? 'Live' : 'Hidden'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10 text-right">
                                            {deleteId === p.id ? (
                                                <div className="flex items-center justify-end gap-3 animate-in fade-in slide-in-from-right-4" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => deleteMutation.mutate(p.id)}
                                                        className="bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-rose-600"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(null)}
                                                        className="text-[#351e24]/40 text-[9px] font-bold uppercase tracking-widest px-2 py-2 hover:text-primary"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleEdit(p)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white hover:bg-[#351e24] border border-[#fde2e7] rounded-xl text-[#351e24]/40 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteId(p.id)}
                                                        className="w-10 h-10 flex items-center justify-center bg-white hover:bg-rose-50 border border-[#fde2e7] rounded-xl text-[#351e24]/40 hover:text-primary transition-all shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className="py-40 text-center">
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

            {/* Product Modal (Add/Edit) */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }}
                product={selectedProduct}
                categories={categories}
            />
        </div>
    );
};

export default AdminProducts;
