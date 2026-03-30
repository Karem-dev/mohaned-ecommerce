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

// ── Simplified Label ────────────────────────────────────────────────────────
const SimpleLabel = ({ label, hint }) => (
    <div className="flex flex-col gap-0.5 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]">{label}</span>
        {hint && <span className="text-[8px] font-medium text-primary/40 italic">{hint}</span>}
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
                setFormData({ ...INITIAL_FORM });
                setPreviewUrl('');
            }
        }
    }, [category, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

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
            toast.success(`Category saved successfully.`);
            onClose();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Error occurred.');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-12 overflow-hidden selection:bg-primary/10">
            <div className="absolute inset-0 bg-[#1a1410]/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_80px_rgba(0,0,0,0.25)] overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-full border border-white/20">

                {/* Modern Header */}
                <div className="p-8 pb-4 flex items-center justify-between border-b border-outline-variant/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#1a1410] tracking-tight">{category ? 'Update' : 'New'} Category</h3>
                            <p className="text-[10px] uppercase tracking-widest text-[#1a1410]/40 font-bold">Category Details & Information</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-surface-container-low rounded-xl text-on-surface-variant hover:text-primary transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                    {/* Image Section */}
                    <div className="flex flex-col md:flex-row gap-8 items-center bg-surface-container-low/30 p-6 rounded-3xl border border-outline-variant/5">
                        <div className="relative group/img">
                            <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-2 border-dashed border-primary/20 bg-white shadow-inner flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700" alt="Preview" />
                                ) : (
                                    <div className="text-center opacity-20">
                                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                        <span className="text-[8px] font-black uppercase">No Image</span>
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center cursor-pointer hover:rotate-12 transition-all shadow-xl shadow-primary/20">
                                <Upload className="w-4 h-4" />
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <div className="flex-1 space-y-2">
                            <h4 className="text-[10px] font-bold text-[#1a1410] uppercase tracking-widest">Display Picture</h4>
                            <p className="text-[9px] text-[#1a1410]/40 font-medium leading-relaxed italic">Upload a clear square image to represent this category in the shop.</p>
                        </div>
                    </div>

                    {/* Name & Slug Block */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <SimpleLabel label="Category Name" hint="How customers see this in the menu" />
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Summer Collection"
                                className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant/10 text-sm font-bold text-[#1a1410] focus:border-primary/40 focus:bg-white transition-all outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <SimpleLabel label="URL Slug" hint="Unique link for this category" />
                            <input
                                required
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="summer-collection"
                                className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant/10 text-sm font-bold text-primary focus:border-primary/40 focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Parent & Status Block */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <SimpleLabel label="Parent Category" hint="Optional: nest under another category" />
                            <select
                                name="parent_id"
                                value={formData.parent_id}
                                onChange={handleChange}
                                className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant/10 text-sm font-bold text-on-surface-variant focus:border-primary/40 focus:bg-white transition-all outline-none appearance-none"
                            >
                                <option value="">Root Category (Top Level)</option>
                                {allCategories.filter(c => !c.parent_id && c.id !== category?.id).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <SimpleLabel label="Product Visibility" hint="Turn on to show in the storefront" />
                            <label className="flex items-center gap-4 cursor-pointer group/toggle w-fit">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-12 h-7 bg-surface-container-high rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[19px] after:w-[19px] after:transition-all peer-checked:after:translate-x-full"></div>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">{formData.is_active ? 'Public' : 'Hidden'}</span>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Action Footer */}
                <div className="p-8 border-t border-outline-variant/10 bg-surface-container-low flex items-center justify-end gap-6 shrink-0">
                    <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors">Discard</button>
                    <button
                        disabled={mutation.isPending}
                        onClick={handleSubmit}
                        className="bg-on-surface text-white px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-on-surface/10 disabled:opacity-50"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {category ? 'Save Changes' : 'Create Category'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryModal;
