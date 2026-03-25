import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, 
    Upload, 
    ChevronDown,
    Save,
    Trash,
    Layers,
    AlertCircle
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminCategory, updateAdminCategory } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const CategoryModal = ({ isOpen, onClose, category = null, allCategories = [] }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: '',
        parent_id: '',
        is_active: true,
        image: null,
        description: ''
    });
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setErrors({});
            if (category) {
                setFormData({
                    name: category.name || '',
                    parent_id: category.parent_id || '',
                    is_active: !!category.is_active,
                    image: null,
                    description: category.description || ''
                });
                setPreview(category.image_url);
            } else {
                setFormData({
                    name: '',
                    parent_id: '',
                    is_active: true,
                    image: null,
                    description: ''
                });
                setPreview(null);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [category, isOpen]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (category) {
                return updateAdminCategory({ id: category.id, formData: data });
            }
            return createAdminCategory(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCategories']);
            toast.success(category ? 'Sector metadata updated.' : 'New sector initialized.');
            onClose();
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
                toast.error('Validation failed. Check field protocols.');
            } else {
                toast.error(err.response?.data?.message || 'System transmission error.');
            }
        }
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const data = new FormData();
        data.append('name', formData.name);
        data.append('parent_id', formData.parent_id || '');
        data.append('is_active', formData.is_active ? '1' : '0');
        data.append('description', formData.description || '');

        if (formData.image instanceof File) {
            data.append('image', formData.image);
        }

        if (category) {
            data.append('_method', 'PUT');
        }

        mutation.mutate(data);
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-12 backdrop-blur-xl bg-slate-900/60 animate-fade-in font-manrope">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-full flex flex-col overflow-hidden relative border border-slate-100 scale-in transition-all duration-500">
                
                {/* Modal Header */}
                <header className="px-10 py-8 flex justify-between items-center bg-slate-50 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                            <Layers className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="font-headline text-2xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">
                                {category ? 'Configure Sector' : 'Initialize Sector'}
                            </h2>
                            <p className="text-slate-400 font-body text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-70">
                                {category ? `ENTITY_ID: ${category.id}` : 'NEW_ENTITY_STUB'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-all p-2 rounded-xl hover:bg-slate-100">
                        <X className="w-6 h-6" />
                    </button>
                </header>

                {/* Content */}
                <form id="category-form" onSubmit={handleSubmit} className="p-10 overflow-y-auto no-scrollbar space-y-8 flex-1">
                    
                    {/* Visual Interface */}
                    <div className="space-y-3">
                        <label className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block italic">Atmospheric Image</label>
                        <div className={`group relative w-full h-48 bg-slate-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed transition-all cursor-pointer overflow-hidden ${errors.image ? 'border-red-500 bg-red-50/10' : 'border-slate-100 hover:border-slate-900'}`}>
                            {preview ? (
                                <img src={preview} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                            ) : (
                                <div className="text-center">
                                    <Upload className="w-10 h-10 text-slate-300 mb-4 mx-auto group-hover:scale-110 transition-transform duration-300 group-hover:text-slate-900" />
                                    <p className="font-headline font-black text-slate-900 uppercase italic tracking-tighter">Upload Visual Data</p>
                                    <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-black">JPG / PNG / WEBP (5MB LIMIT)</p>
                                </div>
                            )}
                            <input 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setFormData({ ...formData, image: file });
                                        setPreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            {preview && (
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-white text-[10px] font-black uppercase tracking-[0.3em] font-headline italic">Update Imagery</span>
                                </div>
                            )}
                        </div>
                        {errors.image && <p className="text-red-500 text-[10px] font-black uppercase italic tracking-wider flex items-center gap-1.5 mt-2 transition-all"><AlertCircle className="w-3 h-3" /> {errors.image[0]}</p>}
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block italic">Sector Designation</label>
                                {errors.name && <p className="text-red-500 text-[9px] font-black uppercase italic tracking-wider flex items-center gap-1 animate-pulse">Error Deteceted</p>}
                            </div>
                            <input 
                                className={`w-full bg-white border-0 border-b py-3 px-0 font-headline font-black text-2xl placeholder:text-slate-200 text-slate-900 uppercase italic tracking-tight outline-none transition-all ${errors.name ? 'border-red-500' : 'border-slate-100 focus:border-slate-900'}`} 
                                placeholder="THE SUMMER GRID" 
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            {errors.name && <p className="text-red-500 text-[10px] font-black uppercase italic tracking-wider flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> {errors.name[0]}</p>}
                        </div>

                        <div className="space-y-3">
                            <label className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block italic">Hierarchy Level</label>
                            <div className="relative group">
                                <select 
                                    className="w-full bg-white border-0 border-b border-slate-100 focus:ring-0 focus:border-slate-900 py-3 px-0 font-headline font-black text-lg appearance-none cursor-pointer text-slate-900 uppercase italic tracking-tight outline-none"
                                    value={formData.parent_id}
                                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                                >
                                    <option value="">Root Level Protocol</option>
                                    {allCategories.filter(c => c.id !== category?.id && !c.parent_id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-0 top-3 pointer-events-none text-slate-300 w-5 h-5 group-hover:text-slate-900 transition-colors" />
                            </div>
                            {errors.parent_id && <p className="text-red-500 text-[10px] font-black uppercase italic tracking-wider flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> {errors.parent_id[0]}</p>}
                        </div>

                        <div className="space-y-3">
                                <label className="font-headline text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block italic">Sector Description</label>
                                <textarea 
                                    className="w-full bg-white border-b border-slate-100 focus:border-slate-900 py-3 font-body text-sm placeholder:text-slate-200 resize-none outline-none text-slate-600 font-medium transition-all" 
                                    placeholder="Enter technical details and sector purpose..." 
                                    rows="3"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-[10px] font-black uppercase italic tracking-wider flex items-center gap-1.5"><AlertCircle className="w-3 h-3" /> {errors.description[0]}</p>}
                        </div>

                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border border-slate-100 group">
                            <div className="space-y-0.5">
                                <p className="font-headline font-black text-slate-900 uppercase italic text-sm group-hover:translate-x-1 transition-transform">Visibility Signal</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">Should this sector be visible to users?</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={formData.is_active}
                                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-slate-900"></div>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <footer className="px-10 py-8 bg-white border-t border-slate-100 flex items-center justify-end gap-6 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.01)]">
                    <button 
                        onClick={onClose}
                        type="button"
                        className="font-headline font-black text-slate-400 hover:text-slate-900 px-6 py-2 transition-all uppercase italic text-xs tracking-[0.2em]" 
                    >
                        Abort
                    </button>
                    <button 
                        form="category-form"
                        disabled={mutation.isLoading}
                        className="bg-slate-900 text-white font-headline font-black italic tracking-[0.2em] uppercase px-12 py-5 rounded shadow-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 min-w-[200px] justify-center" 
                    >
                        {mutation.isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {category ? 'Update Grid' : 'Deploy Sector'}
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
};

export default CategoryModal;

