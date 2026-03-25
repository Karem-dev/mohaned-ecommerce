import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Star, 
    AlertCircle, 
    ChevronRight, 
    ChevronLeft,
    Package,
    AlertTriangle,
    RotateCcw,
    DollarSign,
    Box
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminProducts, getAdminStats, getAdminCategories, deleteAdminProduct } from '../services/adminService';
import ProductModal from '../components/admin/ProductModal';

const AdminProducts = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [categoryId, setCategoryId] = useState('All Categories');
    const [status, setStatus] = useState('All Status');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const { data: productsResp, isLoading: isProductsLoading, isError } = useQuery({
        queryKey: ['adminProducts', page, search, categoryId, status, minPrice, maxPrice],
        queryFn: () => getAdminProducts({
            page,
            search,
            category_id: categoryId,
            is_active: status,
            min_price: minPrice,
            max_price: maxPrice
        }),
    });

    const { data: statsResp } = useQuery({
        queryKey: ['adminStats'],
        queryFn: getAdminStats,
    });

    const { data: categoriesResp } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: getAdminCategories,
    });

    const categories = categoriesResp?.data || [];
    const products = productsResp?.data || [];
    const meta = productsResp?.meta;
    const summary = statsResp?.data?.summary;

    const deleteMutation = useMutation({
        mutationFn: deleteAdminProduct,
        onSuccess: () => {
            queryClient.invalidateQueries(['adminProducts']);
            queryClient.invalidateQueries(['adminStats']);
            toast.success('Product deleted successfully.');
            setDeleteId(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete product.');
            setDeleteId(null);
        }
    });

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const resetFilters = () => {
        setSearch('');
        setCategoryId('All Categories');
        setStatus('All Status');
        setMinPrice('');
        setMaxPrice('');
        setPage(1);
    };

    if (isProductsLoading) return (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="font-bold text-slate-400 text-sm">Loading products...</p>
        </div>
    );

    if (isError) return (
        <div className="text-center py-40 bg-white rounded-3xl border border-slate-100 shadow-sm mx-10">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900">Inventory Sync Error</h3>
            <p className="text-slate-400 mt-3 text-sm">We couldn't fetch the product list. Please try again.</p>
            <button onClick={() => window.location.reload()} className="mt-8 px-10 py-4 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-lg">Retry</button>
        </div>
    );

    return (
        <div className="space-y-12 pb-24 font-manrope">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">Product Catalog</h2>
                   <p className="text-slate-500 font-medium mt-2">Manage your inventory, pricing, and availability</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="bg-slate-950 text-white px-8 py-4 rounded-xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 font-bold text-[11px] uppercase tracking-widest shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    Add New Product
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900 p-8 rounded-3xl shadow-xl relative overflow-hidden group">
                    <Box className="absolute -top-6 -right-6 w-32 h-32 text-white opacity-5 group-hover:scale-110 transition-transform duration-700" />
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-4">Total Products</p>
                    <h3 className="text-4xl font-black text-white italic tabular-nums">{summary?.total_products || 0}</h3>
                    <p className="text-[10px] text-slate-400 mt-4 font-medium italic">Active items in catalog</p>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-4">Inventory Value</p>
                    <h3 className="text-4xl font-black text-slate-900 italic tabular-nums">${Number(summary?.inventory_value || 0).toLocaleString()}</h3>
                    <p className="text-[10px] text-emerald-600 mt-4 font-bold uppercase tracking-widest italic flex items-center gap-2">
                        <DollarSign className="w-3 h-3" /> Total Stock Valuation
                    </p>
                </div>
                <div className={`p-8 rounded-3xl border transition-all ${summary?.stock_alerts_count > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-4">Stock Alerts</p>
                    <div className="flex items-end justify-between">
                        <h3 className={`text-4xl font-black italic ${summary?.stock_alerts_count > 0 ? 'text-red-600' : 'text-slate-900'}`}>{summary?.stock_alerts_count || 0}</h3>
                        <AlertCircle className={`w-8 h-8 mb-1 ${summary?.stock_alerts_count > 0 ? 'text-red-600' : 'text-slate-100'}`} />
                    </div>
                </div>
            </div>

            {/* Filter Controls */}
            <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col xl:flex-row items-end gap-6">
                <div className="flex-1 w-full relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search products by name or SKU..."
                        className="w-full bg-slate-50 border-none rounded-2xl py-4.5 pl-14 pr-6 text-[11px] font-bold uppercase tracking-widest focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all outline-none italic placeholder:text-slate-300"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>

                <div className="flex flex-col gap-2 w-full xl:w-auto min-w-[200px]">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-1 italic">Category</label>
                    <select 
                        className="bg-slate-50 border-none rounded-2xl py-4 px-6 text-[11px] font-bold uppercase tracking-widest focus:bg-white cursor-pointer outline-none transition-all italic"
                        value={categoryId}
                        onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                    >
                        <option value="All Categories">All Categories</option>
                        {categories?.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-2 w-full xl:w-auto min-w-[180px]">
                    <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-1 italic">Status</label>
                    <select 
                        className="bg-slate-50 border-none rounded-2xl py-4 px-6 text-[11px] font-bold uppercase tracking-widest focus:bg-white cursor-pointer outline-none transition-all italic"
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                    >
                        <option value="All Status">All Status</option>
                        <option value="Published">Online</option>
                        <option value="Draft">Draft</option>
                        <option value="Out of Stock">Out of Stock</option>
                    </select>
                </div>

                <button 
                    onClick={resetFilters}
                    className="h-14 px-6 text-[11px] font-bold text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest italic group border border-transparent hover:border-slate-100"
                >
                    <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform" /> Reset
                </button>
            </section>

            {/* Products Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-manrope">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50 italic">
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ref</th>
                                <th className="py-8 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Product Details</th>
                                <th className="py-8 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                                <th className="py-8 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Price</th>
                                <th className="py-8 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">In Stock</th>
                                <th className="py-8 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                <th className="py-8 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 uppercase italic">
                            {products.length > 0 ? products.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="py-6 px-10 font-bold text-slate-300 text-xs">
                                        #{product.id.toString().padStart(3, '0')}
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-20 rounded-xl bg-white overflow-hidden shrink-0 border border-slate-100 shadow-sm relative">
                                                <img 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                    src={product.image_url} 
                                                    onError={(e) => e.target.src = 'https://via.placeholder.com/800x1000?text=NO+IMAGE'}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black text-slate-900 tracking-tighter truncate text-lg leading-tight group-hover:text-primary transition-colors">{product.name}</p>
                                                    {product.is_featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1.5 opacity-60">SKU: {product.sku || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-md">{product.category?.name || 'General'}</span>
                                    </td>
                                    <td className="py-6 px-6 text-base font-black italic tracking-tighter tabular-nums text-slate-900">${product.price}</td>
                                    <td className="py-6 px-6">
                                        <div className="flex flex-col gap-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${product.stock <= 5 ? 'text-red-500' : 'text-slate-500'}`}>{product.stock} Units</span>
                                            <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-700 ${product.stock <= 5 ? 'bg-red-500' : 'bg-slate-900'}`} 
                                                    style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all ${product.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            {product.is_active ? 'Online' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        {deleteId === product.id ? (
                                            <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                                <button 
                                                    onClick={() => deleteMutation.mutate(product.id)}
                                                    className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                                                >
                                                    Delete
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteId(null)}
                                                    className="text-slate-400 text-[9px] font-bold uppercase tracking-widest px-3 py-2 hover:text-slate-900"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => handleEdit(product)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-950 hover:text-white rounded-xl text-slate-400 transition-all border border-slate-100 shadow-sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteId(product.id)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-red-600 hover:text-white rounded-xl text-slate-400 transition-all border border-slate-100 shadow-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className="py-32 text-center">
                                        <div className="opacity-10 mb-6 flex justify-center">
                                            <Package className="w-16 h-16" />
                                        </div>
                                        <p className="text-2xl font-black text-slate-300 uppercase tracking-tight">No products found</p>
                                        <button onClick={resetFilters} className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors">Clear Filters</button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta?.last_page > 1 && (
                    <div className="px-12 py-10 flex flex-col md:flex-row items-center justify-between border-t border-slate-50 bg-white gap-8 uppercase">
                        <p className="text-[10px] font-bold text-slate-400 tracking-widest">
                            Showing {meta?.from || 0} to {meta?.to || 0} of {meta?.total || 0} Products
                        </p>
                        <div className="flex items-center gap-4">
                            <button 
                                disabled={page === 1}
                                onClick={() => setPage(page - 1)}
                                className="w-10 h-10 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-950 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-[10px] font-black tracking-widest px-4 text-slate-400">Page {page} / {meta?.last_page}</span>
                            <button 
                                disabled={page >= meta?.last_page}
                                onClick={() => setPage(page + 1)}
                                className="w-10 h-10 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-950 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                categories={categories}
            />
        </div>
    );
};

export default AdminProducts;
