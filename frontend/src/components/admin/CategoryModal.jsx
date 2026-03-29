import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    X,
    Upload,
    Save,
    Layers,
    AlertTriangle,
    Loader2,
    Image as ImageIcon,
    Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createAdminCategory, updateAdminCategory } from '../../services/adminService';

// ── Bilingual Helper ────────────────────────────────────────────────────────
const BiLabel = ({ en, ar, sub = false }) => (
    <div className="flex flex-col gap-0.5 mb-3">
        <span className={`${sub ? 'text-[8px]' : 'text-[9px]'} font-black uppercase tracking-[0.2em] italic text-[#b0004a]/40 group-focus-within:text-primary transition-colors`}>{en}</span>
        <span className={`${sub ? 'text-[9px]' : 'text-[11px]'} font-bold text-zinc-300 group-focus-within:text-zinc-600 transition-colors`} style={{ fontFamily: "'Cairo', sans-serif" }}>{ar}</span>
    </div>
);

const INITIAL_FORM = {
    name: '',
    slug: '',
    parent_id: '',
    is_active: true,
    image: null,
};

const CategoryModal = ({ isOpen, onClose, category, allCategories }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [previewUrl, setPreviewUrl] = useState('');

    // Reset form when modal opens or category changes
    useEffect(() => {
        if (isOpen) {
            if (category) {
                setFormData({
                    name: category.name || '',
                    slug: category.slug || '',
                    parent_id: category.parent_id || '',
                    is_active: category.is_active,
                    image: null,
                });
                setPreviewUrl(category.image_url || '');
            } else {
                // Clear all fields for new category
                setFormData({ ...INITIAL_FORM });
                setPreviewUrl('');
            }
        } else {
            // Also clear on close
            setFormData({ ...INITIAL_FORM });
            setPreviewUrl('');
        }
    }, [category, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Auto-generate slug from name if adding new
        if (name === 'name' && !category) {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
            }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const mutation = useMutation({
        mutationFn: (data) => {
            const fd = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'image' && data[key]) {
                    fd.append('image', data[key]);
                } else if (key === 'is_active') {
                    fd.append(key, data[key] ? '1' : '0');
                } else if (data[key] !== null) {
                    fd.append(key, data[key]);
                }
            });

            if (category) {
                fd.append('_method', 'PUT');
                return updateAdminCategory({ id: category.id, formData: fd });
            }
            return createAdminCategory(fd);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCategories']);
            toast.success(`Category ${category ? 'updated' : 'created'} · تم الحفظ`);
            onClose();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Something went wrong · حدث خطأ');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12 overflow-hidden selection:bg-primary/10 selection:text-primary">
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#351e24]/40 backdrop-blur-sm animate-in fade-in duration-500" onClick={onClose} />

            {/* Modal Content */}
            <div className={`relative w-full max-w-2xl bg-[#fffbfb] rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-full border border-white/50`}>

                {/* Header */}
                <div className="relative h-40 bg-[#fff9fa] border-b border-[#fde2e7] shrink-0 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-rose-50/30 opacity-50" />
                    <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-zinc-300 hover:text-primary hover:rotate-90 transition-all shadow-sm z-10 border border-[#fde2e7]">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-8 left-12 flex items-end gap-6">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-[#fde2e7]">
                            <Layers className="w-9 h-9" />
                        </div>
                        <div className="mb-2">
                            <h3 className="text-4xl font-black text-[#351e24] tracking-tighter italic uppercase leading-tight">{category ? 'Edit' : 'New'} <span className="text-primary">Category</span></h3>
                            <span className="text-lg font-bold text-zinc-300" style={{ fontFamily: "'Cairo', sans-serif" }}>{category ? 'تحديث القسم' : 'إضافة قسم جديد'}</span>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar p-12 space-y-10">

                    {/* Image Upload */}
                    <div className="space-y-6">
                        <BiLabel en="Category Image" ar="أيقونة أو صورة القسم" />
                        <div className="flex gap-10 items-center">
                            <div className="relative group/avatar">
                                <div className="w-32 h-32 bg-white rounded-[2.5rem] overflow-hidden border-2 border-[#fde2e7] shadow-inner group-hover/avatar:border-primary transition-colors duration-500 relative">
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all duration-1000" alt="Preview" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-200">
                                            <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary/20 hover:rotate-12">
                                    <Upload className="w-4 h-4" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                            <div className="max-w-xs space-y-2">
                                <p className="text-[10px] font-black italic text-[#351e24] uppercase tracking-wider leading-none">Image Guidelines</p>
                                <p className="text-zinc-400 text-[9px] font-medium leading-relaxed italic">Upload a high-quality image (1000×1000px recommended). JPG/PNG supported.</p>
                            </div>
                        </div>
                    </div>

                    {/* Name & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4 group">
                            <BiLabel en="Category Name" ar="اسم القسم" sub />
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Summer Collection"
                                className="w-full bg-[#fff9fa]/50 px-6 py-4 rounded-2xl border border-[#fde2e7] text-[11px] font-black italic uppercase tracking-wider text-[#351e24] focus:ring-4 focus:ring-rose-50 focus:border-primary/20 transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-4 group">
                            <BiLabel en="URL Slug" ar="معرف الرابط" sub />
                            <input
                                required
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="summer-collection"
                                className="w-full bg-[#fff9fa]/50 px-6 py-4 rounded-2xl border border-[#fde2e7] text-[11px] font-black italic uppercase tracking-wider text-primary focus:ring-4 focus:ring-rose-50 focus:border-primary/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Parent & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4 group">
                            <BiLabel en="Parent Category" ar="القسم الأب" sub />
                            <select
                                name="parent_id"
                                value={formData.parent_id}
                                onChange={handleChange}
                                className="w-full bg-[#fff9fa]/50 px-6 py-4 rounded-2xl border border-[#fde2e7] text-[11px] font-black italic uppercase tracking-wider text-zinc-500 focus:ring-4 focus:ring-rose-50 focus:border-primary/20 transition-all outline-none appearance-none"
                            >
                                <option value="">None (Top Level)</option>
                                {allCategories.filter(c => !c.parent_id && c.id !== category?.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-6">
                            <BiLabel en="Status" ar="تفعيل القسم" sub />
                            <label className="flex items-center gap-4 cursor-pointer group/toggle w-fit">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-zinc-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary transition-colors"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase italic tracking-widest text-[#351e24] group-hover/toggle:text-primary transition-colors">Visible Online</span>
                                    <span className="text-[8px] font-bold text-zinc-300 -mt-0.5">Active Status</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-10 bg-[#fff9fa] border-t border-[#fde2e7] flex items-center justify-between gap-8 shrink-0">
                    <button onClick={onClose} className="text-zinc-400 text-[10px] font-black uppercase tracking-widest italic hover:text-primary transition-colors hover:underline decoration-2 underline-offset-8">Cancel</button>
                    <button
                        disabled={mutation.isPending}
                        onClick={handleSubmit}
                        className="bg-[#351e24] text-white px-12 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest italic hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-2xl shadow-[#351e24]/20 flex items-center gap-3 group"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        )}
                        {category ? 'Save Changes' : 'Create Category'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;
