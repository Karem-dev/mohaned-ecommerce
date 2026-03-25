import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    Plus, 
    Edit, 
    Trash2, 
    Layers, 
    ChevronRight, 
    Search,
    Image as ImageIcon,
    Upload,
    X,
    Save,
    ChevronDown,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
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
            toast.success('Category removed successfully.');
            setDeleteId(null);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Delete operation failed.');
            setDeleteId(null);
        }
    });

    const confirmDelete = (id) => {
        setDeleteId(id);
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing Sectors...</p>
        </div>
    );

    if (isError) return (
        <div className="text-center py-32">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-900 uppercase italic">Connection Failure</h3>
            <p className="text-slate-400 mt-2 font-medium">Unable to retrieve category grid data.</p>
        </div>
    );

    return (
        <div className="space-y-12">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
               <div>
                  <h2 className="text-4xl font-black font-headline tracking-tighter text-slate-900 uppercase italic leading-none">Category Inventory</h2>
                  <p className="text-slate-400 font-body mt-2 text-sm uppercase tracking-widest font-black opacity-60">Architect your marketplace taxonomies.</p>
               </div>
               <button 
                  onClick={handleAdd}
                  className="bg-slate-900 text-white px-8 py-4 rounded-sm shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 font-headline font-black text-xs tracking-[0.2em] uppercase italic group shrink-0"
               >
                   <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> 
                   Add New Sector
               </button>
            </div>

            {/* Table Core Container */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-body min-w-[800px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">
                                <th className="py-6 px-10 w-16">
                                    <div className="w-4 h-4 rounded border-2 border-slate-200" />
                                </th>
                                <th className="py-6 px-4">Entity Identity</th>
                                <th className="py-6 px-4">Volume</th>
                                <th className="py-6 px-4">Status</th>
                                <th className="py-6 px-4">Tier</th>
                                <th className="py-6 px-8 text-right w-40">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {displayCategories.length > 0 ? displayCategories.map((cat) => (
                                <tr key={cat.id} className={`hover:bg-slate-50/50 transition-colors group ${cat.parent_id ? 'bg-slate-50/20' : ''}`}>
                                    <td className="py-6 px-10">
                                        <div className="w-4 h-4 rounded border border-slate-200 group-hover:border-slate-400 transition-colors" />
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group-hover:scale-105 transition-all duration-500 shadow-sm ${cat.parent_id ? 'ml-8 w-10 h-10' : ''}`}>
                                                <img src={cat.image_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-700" alt="" onError={(e) => e.target.src = 'https://via.placeholder.com/400?text=NO+IMAGE'} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-headline font-black text-slate-900 tracking-tighter truncate italic uppercase leading-tight ${cat.parent_id ? 'text-base' : 'text-lg'}`}>
                                                    {cat.name}
                                                </p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-60">CID: {cat.id} <span className="mx-1">•</span> SLUG: {cat.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className="text-[10px] font-black italic tracking-tighter tabular-nums px-3 py-1 bg-slate-100 rounded-full text-slate-600">{cat.products_count || 0} UNITS</span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${cat.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                            {cat.is_active ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="py-6 px-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest italic ${cat.parent_id ? 'text-slate-400' : 'text-slate-900'}`}>
                                            {cat.parent_id ? 'Subordinate' : 'Primary'}
                                        </span>
                                    </td>
                                    <td className="py-6 px-8 text-right">
                                        {deleteId === cat.id ? (
                                            <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
                                                <button 
                                                    onClick={() => deleteMutation.mutate(cat.id)}
                                                    className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded hover:bg-red-700 transition-colors"
                                                >
                                                    Confirm
                                                </button>
                                                <button 
                                                    onClick={() => setDeleteId(null)}
                                                    className="text-slate-400 text-[9px] font-black uppercase tracking-widest px-2 py-1.5 hover:text-slate-900"
                                                >
                                                    Abort
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(cat)}
                                                    className="w-9 h-9 flex items-center justify-center hover:bg-slate-900 hover:text-white rounded-lg text-slate-400 transition-all border border-slate-100 shadow-sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => confirmDelete(cat.id)}
                                                    className="w-9 h-9 flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-all border border-slate-100 shadow-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-slate-300 font-headline font-black uppercase italic text-2xl tracking-tighter">
                                        No Sectors Defined In Current Grid
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

