import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
    X,
    Upload,
    Check,
    AlertCircle,
    Package,
    Tag,
    DollarSign,
    Hash,
    Layers,
    FileText,
    Image as ImageIcon,
    Star,
    Loader2,
    Sparkles,
    ChevronDown,
    Plus,
    Trash2
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createAdminProduct, updateAdminProduct } from '../../services/adminService';

// ── Simplified Label ────────────────────────────────────────────────────────
const SimpleLabel = ({ label, hint }) => (
    <div className="flex flex-col gap-0.5 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]">{label}</span>
        {hint && <span className="text-[8px] font-medium text-primary/40 italic">{hint}</span>}
    </div>
);

const INITIAL_FORM = {
    name: '',
    category_ids: [],
    price: '',
    sku: '',
    stock: '',
    description: '',
    is_active: 1,
    is_featured: 0,
    images: [],
    variants: []
};

const ProductModal = ({ isOpen, onClose, product, categories }) => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({ ...INITIAL_FORM });
    const [previews, setPreviews] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setErrors({});
            if (product) {
                setFormData({
                    name: product.name || '',
                    category_ids: product.categories?.map(c => c.id) || [product.category_id].filter(Boolean) || [],
                    price: product.price || '',
                    sku: product.sku || '',
                    stock: product.stock || '',
                    description: product.description || '',
                    is_active: product.is_active ? 1 : 0,
                    is_featured: product.is_featured ? 1 : 0,
                    images: [],
                    variants: product.variants?.map(v => ({
                        type: v.type,
                        value: v.value,
                        price_override: v.price_override || '',
                        stock: v.stock || 0
                    })) || []
                });
                setPreviews(product.images?.map(img => img.image_path) || []);
            } else {
                setFormData({ ...INITIAL_FORM });
                setPreviews([]);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [product, isOpen]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (product) return updateAdminProduct({ id: product.id, formData: data });
            return createAdminProduct(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminProducts']);
            toast.success(product ? 'Product updated.' : 'Product created.');
            onClose();
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                toast.error('Check form details.');
            } else {
                toast.error(err.response?.data?.message || 'Error occurred.');
            }
        }
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => setPreviews(prev => [...prev, reader.result]);
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { type: 'size', value: '', price_override: '', stock: 0 }]
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    const toggleCategory = (catId) => {
        const current = formData.category_ids;
        const next = current.includes(catId) ? current.filter(id => id !== catId) : [...current, catId];
        setFormData(prev => ({ ...prev, category_ids: next }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'images') formData.images.forEach(f => data.append('images[]', f));
            else if (key === 'variants') {
                formData.variants.forEach((v, i) => {
                    data.append(`variants[${i}][type]`, v.type);
                    data.append(`variants[${i}][value]`, v.value);
                    if (v.price_override) data.append(`variants[${i}][price_override]`, v.price_override);
                    data.append(`variants[${i}][stock]`, v.stock);
                });
            } else if (key === 'category_ids') formData.category_ids.forEach(id => data.append('category_ids[]', id));
            else data.append(key, formData[key]);
        });

        if (product) data.append('_method', 'PUT');
        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-[#1a1410]/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />

            <div className="relative w-full max-w-5xl bg-white rounded-[3rem] shadow-[0_32px_80px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[90vh] border border-white/20 animate-in zoom-in-95 duration-500">
                
                {/* Modern Header */}
                <div className="p-8 pb-4 flex items-center justify-between border-b border-outline-variant/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#1a1410] tracking-tight">{product ? 'Update' : 'New'} Product</h3>
                            <p className="text-[10px] uppercase tracking-widest text-[#1a1410]/40 font-bold">Catalog Item Specifications</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-surface-container-low rounded-xl text-on-surface-variant hover:text-primary transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    
                    {/* Error Alerts */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-5 bg-rose-50 border border-primary/10 rounded-2xl space-y-2">
                            <p className="text-[10px] font-black uppercase text-primary italic flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Required information missing:
                            </p>
                            <ul className="grid md:grid-cols-2 gap-x-6 list-disc list-inside">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i} className="text-[10px] font-bold text-primary italic uppercase">{err[0]}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid lg:grid-cols-12 gap-10">
                        
                        {/* Media Section */}
                        <div className="lg:col-span-4 space-y-8">
                            <div>
                                <SimpleLabel label="Product Media" hint="Showcase your item (multiple images)" />
                                <div className="grid grid-cols-2 gap-3">
                                    {previews.map((src, i) => (
                                        <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-outline-variant/10 group bg-surface-container-low">
                                            <img src={src} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                            <button 
                                                type="button" onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-xl text-primary opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        type="button" onClick={() => fileInputRef.current?.click()}
                                        className="aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/40 flex flex-col items-center justify-center text-primary/30 hover:text-primary transition-all bg-surface-container-low/30"
                                    >
                                        <Plus className="w-6 h-6" />
                                        <span className="text-[9px] font-bold uppercase mt-2">Add Photo</span>
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" multiple />
                            </div>

                            <div className="pt-8 border-t border-outline-variant/10 space-y-4">
                                <SimpleLabel label="Shop Visibility" hint="Control how it appears online" />
                                <div className="space-y-3">
                                    <label className="flex items-center justify-between p-4 bg-surface-container-low/40 rounded-2xl border border-outline-variant/5 cursor-pointer hover:bg-surface-container-low transition-colors">
                                        <span className="text-[10px] font-bold uppercase text-on-surface">Live Online</span>
                                        <div className="relative">
                                            <input type="checkbox" name="is_active" className="sr-only peer" checked={formData.is_active === 1} onChange={handleInputChange} />
                                            <div className="w-10 h-6 bg-surface-container-high rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-full"></div>
                                        </div>
                                    </label>
                                    <label className="flex items-center justify-between p-4 bg-surface-container-low/40 rounded-2xl border border-outline-variant/5 cursor-pointer hover:bg-surface-container-low transition-colors">
                                        <span className="text-[10px] font-bold uppercase text-on-surface">Mark as Featured</span>
                                        <div className="relative">
                                            <input type="checkbox" name="is_featured" className="sr-only peer" checked={formData.is_featured === 1} onChange={handleInputChange} />
                                            <div className="w-10 h-6 bg-surface-container-high rounded-full peer peer-checked:bg-emerald-500 transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:after:translate-x-full"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <SimpleLabel label="Product Name" hint="What customers will call it" />
                                    <input 
                                        name="name" type="text" placeholder="Silk evening dress..."
                                        className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant/10 text-sm font-bold text-[#1a1410] focus:bg-white focus:border-primary/40 transition-all outline-none"
                                        value={formData.name} onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <SimpleLabel label="Collections" hint="Must belong to at least one" />
                                    <div className="flex flex-wrap gap-2">
                                        {categories?.map(cat => (
                                            <button 
                                                key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                                                className={`px-4 py-2.5 rounded-lg text-[9px] font-bold uppercase transition-all border ${formData.category_ids.includes(cat.id) ? 'bg-on-surface text-white border-on-surface' : 'bg-white text-on-surface-variant border-outline-variant/20 hover:border-primary/40'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <SimpleLabel label="Price ($)" hint="Unit price" />
                                    <input name="price" type="number" className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant/10 text-sm font-bold text-primary outline-none" value={formData.price} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <SimpleLabel label="SKU" hint="Internal tracking code" />
                                    <input name="sku" type="text" className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant/10 text-sm font-bold uppercase outline-none" value={formData.sku} onChange={handleInputChange} />
                                </div>
                                <div className="space-y-2">
                                    <SimpleLabel label="Stock" hint="Total pieces available" />
                                    <input name="stock" type="number" className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant/10 text-sm font-bold outline-none" value={formData.stock} onChange={handleInputChange} />
                                </div>
                            </div>

                            {/* Options / Variants */}
                            <div className="pt-8 border-t border-outline-variant/10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <SimpleLabel label="Product Options" hint="Define sizes, colors, or styles" />
                                    <button 
                                        type="button" onClick={addVariant}
                                        className="px-4 py-2 bg-on-surface text-white text-[9px] font-bold uppercase rounded-xl hover:bg-primary transition-all flex items-center gap-2"
                                    >
                                        <Plus className="w-3 h-3" /> Add Option
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.variants.map((v, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/5">
                                            <select value={v.type} onChange={(e) => handleVariantChange(i, 'type', e.target.value)} className="bg-white px-4 py-2.5 rounded-lg border border-outline-variant/10 text-[10px] font-bold uppercase outline-none">
                                                <option value="size">Size</option>
                                                <option value="color">Color</option>
                                            </select>
                                            <input value={v.value} onChange={(e) => handleVariantChange(i, 'value', e.target.value)} className="flex-1 bg-white px-4 py-2.5 rounded-lg border border-outline-variant/10 text-[10px] font-bold outline-none" placeholder="Red, XL, etc." />
                                            <input value={v.price_override} onChange={(e) => handleVariantChange(i, 'price_override', e.target.value)} className="w-20 bg-white px-4 py-2.5 rounded-lg border border-outline-variant/10 text-[10px] font-bold outline-none text-primary" placeholder="+ $" />
                                            <input value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} className="w-16 bg-white px-4 py-2.5 rounded-lg border border-outline-variant/10 text-[10px] font-bold outline-none" placeholder="Qty" />
                                            <button type="button" onClick={() => removeVariant(i)} className="p-2 text-on-surface-variant/40 hover:text-primary transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    ))}
                                    {formData.variants.length === 0 && <p className="text-center py-4 text-[9px] font-medium text-on-surface-variant/30 uppercase italic">No extra options defined.</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <SimpleLabel label="Description" hint="Tell the story of this product" />
                                <textarea 
                                    name="description" rows="4" className="w-full bg-surface-container-low px-6 py-4 rounded-xl border border-outline-variant/10 text-sm font-medium leading-relaxed outline-none focus:bg-white transition-all no-scrollbar"
                                    value={formData.description} onChange={handleInputChange} 
                                    placeholder="Crafted from the finest materials..."
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-8 border-t border-outline-variant/10 bg-surface-container-low flex items-center justify-end gap-6 shrink-0">
                    <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant hover:text-primary transition-colors">Discard</button>
                    <button 
                        form="product-form" disabled={mutation.isPending}
                        className="bg-on-surface text-white px-10 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-on-surface/10 disabled:opacity-50"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        {product ? 'Save Changes' : 'Publish Product'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProductModal;
