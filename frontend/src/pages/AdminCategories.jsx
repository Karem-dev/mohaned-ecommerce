import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Edit,
    Trash2,
    Layers,
    ChevronRight,
    Search,
    AlertTriangle,
    RefreshCcw,
    FolderTree,
    LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { getAdminCategories, deleteAdminCategory } from '../services/adminService';
import CategoryModal from '../components/admin/CategoryModal';

const AdminCategories = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    const { data: categoriesResp, isLoading, isError } = useQuery({
        queryKey: ['adminCategories'],
        queryFn: getAdminCategories,
    });

    const allCategories = categoriesResp?.data || [];

    // Group children under parents for better visibility
    const displayCategories = [];
    const parentCategories = allCategories
        .filter(cat => !cat.parent_id)
        .sort((a, b) => b.id - a.id);

    parentCategories.forEach(parent => {
        displayCategories.push(parent);
        const children = allCategories
            .filter(child => child.parent_id === parent.id)
            .sort((a, b) => b.id - a.id);
        displayCategories.push(...children);
    });

    const handleEdit = (cat) => {
        setSelectedCategory(cat);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const deleteMutation = useMutation({
        mutationFn: deleteAdminCategory,
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCategories']);
            toast.success('Category removed');
            setDeleteId(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to delete category.');
            setDeleteId(null);
        }
    });

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center bg-[#fffbfb] min-h-screen">
            <div className="w-12 h-12 border-[3px] border-rose-100 border-t-primary rounded-full animate-spin mx-auto mb-8 shadow-sm"></div>
            <p className="font-bold text-primary/50 uppercase tracking-[0.2em] text-[10px] italic">Loading Catalog...</p>
        </div>
    );

    if (isError) return (
        <div className="text-center py-40 bg-white rounded-[3rem] border border-[#fde2e7] shadow-sm animate-in fade-in duration-700">
            <AlertTriangle className="w-16 h-16 text-rose-300 mx-auto mb-8" />
            <h3 className="text-3xl font-bold text-[#351e24] uppercase italic tracking-tighter">Connection Error</h3>
            <p className="text-[#351e24]/40 mt-4 font-bold uppercase tracking-widest text-[10px]">Unable to load data from server.</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-24 font-['Plus_Jakarta_Sans'] antialiased">

            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[#fde2e7]/30 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                        <FolderTree className="w-4 h-4" />
                        Hierarchy Setup
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-[#351e24] tracking-tighter uppercase italic leading-none">
                        Category <span className="text-primary">Management</span>
                    </h1>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => {
                            queryClient.invalidateQueries(['adminCategories']);
                            toast.success('List synced');
                        }}
                        className="px-8 py-5 bg-white border border-[#fde2e7] text-[#351e24] rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm flex items-center gap-3 group"
                    >
                        <RefreshCcw className="w-4 h-4" /> Sync
                    </button>
                    <button
                        onClick={handleAdd}
                        className="px-12 py-5 bg-[#351e24] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-[#351e24]/10 flex items-center gap-3"
                    >
                        <Plus className="w-4 h-4" /> New Category
                    </button>
                </div>
            </header>

            {/* Matrix Display Table */}
            <div className="bg-white rounded-[3rem] border border-[#fde2e7]/40 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="text-[10px] font-bold text-[#351e24]/40 uppercase tracking-[0.2em] bg-[#fffbfb] border-b border-[#fde2e7]/30 italic">
                                <th className="py-8 px-10">Collection Details</th>
                                <th className="py-8 px-4 text-center">Items</th>
                                <th className="py-8 px-4 text-center">Status</th>
                                <th className="py-8 px-4 text-center">Structure</th>
                                <th className="py-8 px-10 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#fde2e7]/10">
                            {displayCategories.length > 0 ? displayCategories.map((cat) => (
                                <tr key={cat.id} className={`hover:bg-rose-50/10 transition-all group cursor-pointer ${cat.parent_id ? 'bg-[#fffbfb]/50' : ''}`} onClick={() => handleEdit(cat)}>
                                    <td className="py-8 px-10">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-2xl bg-zinc-50 overflow-hidden shrink-0 border border-[#fde2e7]/30 group-hover:scale-105 transition-transform duration-700 shadow-sm ${cat.parent_id ? 'ml-12 w-12 h-12' : ''}`}>
                                                <img src={cat.image_url} className="w-full h-full object-cover" alt="" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=C&background=eee&color=333'} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-bold text-[#351e24] tracking-tight uppercase italic leading-tight group-hover:text-primary transition-colors ${cat.parent_id ? 'text-lg' : 'text-xl'}`}>
                                                    {cat.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[9px] font-bold text-[#351e24]/20 uppercase tracking-widest italic">{cat.slug}</span>
                                                    {cat.parent_id && <span className="text-[8px] font-bold text-primary/40 uppercase tracking-[0.2em]">Sub-Category</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-8 px-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-2xl font-bold italic tracking-tighter text-[#351e24] tabular-nums leading-none">{cat.products_count || 0}</span>
                                            <span className="text-[8px] font-bold uppercase tracking-widest mt-1 text-[#351e24]/20 italic">Products</span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                             <div className={`w-2 h-2 rounded-full ${cat.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-[#351e24]/20'}`} />
                                             <span className={`text-[9px] font-bold uppercase tracking-widest italic ${cat.is_active ? 'text-emerald-600' : 'text-[#351e24]/30'}`}>
                                                {cat.is_active ? 'Active' : 'Private'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-8 px-4 text-center">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest italic ${cat.parent_id ? 'text-[#351e24]/30' : 'text-primary'}`}>
                                            {cat.parent_id ? 'Nested' : 'Primary'}
                                        </span>
                                    </td>
                                    <td className="py-8 px-10 text-right">
                                        {deleteId === cat.id ? (
                                            <div className="flex items-center justify-end gap-3 animate-in fade-in slide-in-from-right-4" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => deleteMutation.mutate(cat.id)}
                                                    className="bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-rose-600 shadow-lg shadow-primary/20"
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
                                                    onClick={() => handleEdit(cat)}
                                                    className="w-10 h-10 flex items-center justify-center bg-white hover:bg-[#351e24] border border-[#fde2e7] rounded-xl text-[#351e24]/40 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(cat.id)}
                                                    className="w-10 h-10 flex items-center justify-center bg-white hover:bg-rose-50 border border-[#fde2e7] rounded-xl text-[#351e24]/40 hover:text-primary transition-all shadow-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-40 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-20">
                                            <LayoutGrid className="w-16 h-16 mb-4" />
                                            <p className="text-xl font-bold uppercase tracking-widest italic text-[#351e24]">No categories found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                category={selectedCategory}
                allCategories={allCategories}
            />
        </div>
    );
};

export default AdminCategories;
