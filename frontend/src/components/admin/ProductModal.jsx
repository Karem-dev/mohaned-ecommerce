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

    // Reset when modal state changes
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
                        type: v.type, // 'size' or 'color'
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

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [product, isOpen]);

    const mutation = useMutation({
        mutationFn: (data) => {
            if (product) return updateAdminProduct({ id: product.id, formData: data });
            return createAdminProduct(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminProducts']);
            toast.success(product ? 'Product saved' : 'Product created');
            onClose();
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                toast.error('Check form errors');
            } else {
                toast.error(err.response?.data?.message || 'Server error');
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
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10">
            {/* Overlay */}
            <div className="absolute inset-0 bg-[#351e24]/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal Body */}
            <div className="relative w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#fde2e7] animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="p-8 border-b border-[#fde2e7] flex items-center justify-between bg-[#fffbfb]">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#351e24] tracking-tight">{product ? 'Update Product' : 'Add New Product'}</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]/40 italic">Catalog Management</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-rose-50 rounded-2xl transition-all text-[#351e24]/20 hover:text-primary">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    
                    {/* Error Alerts */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-5 bg-rose-50 border border-primary/10 rounded-2xl space-y-2">
                            <p className="text-[10px] font-black uppercase text-primary italic flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Please fix these details:
                            </p>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 list-disc list-inside">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i} className="text-[10px] font-bold text-primary italic uppercase">{err[0]}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* Left: Images & Media */}
                        <div className="lg:col-span-5 space-y-8">
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#351e24]/30 mb-5 italic">Product Media</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    {previews.map((src, i) => (
                                        <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#fde2e7] group">
                                            <img src={src} className="w-full h-full object-cover" alt="" />
                                            <button 
                                                type="button" 
                                                onClick={() => removeImage(i)}
                                                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 rounded-xl text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-[3/4] rounded-2xl border-2 border-dashed border-[#fde2e7] hover:border-primary/30 flex flex-col items-center justify-center text-[#351e24]/20 hover:text-primary transition-all bg-[#fffbfb]"
                                    >
                                        <Plus className="w-6 h-6" />
                                        <span className="text-[9px] font-bold uppercase mt-2 tracking-widest">Add Photo</span>
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" multiple />
                            </div>

                            <div className="pt-8 border-t border-[#fde2e7] space-y-4">
                                <h4 className="text-[11px] font-black uppercase tracking-widest text-[#351e24]/30 italic">Store Display</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    <label className="flex items-center justify-between p-5 bg-[#fffbfb] rounded-2xl border border-[#fde2e7] cursor-pointer">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#351e24]">Show in shop</span>
                                        <input type="checkbox" name="is_active" className="w-5 h-5 accent-primary" checked={formData.is_active === 1} onChange={handleInputChange} />
                                    </label>
                                    <label className="flex items-center justify-between p-5 bg-[#fffbfb] rounded-2xl border border-[#fde2e7] cursor-pointer">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#351e24]">Star choice (Featured)</span>
                                        <input type="checkbox" name="is_featured" className="w-5 h-5 accent-primary" checked={formData.is_featured === 1} onChange={handleInputChange} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right: Info Panels */}
                        <div className="lg:col-span-7 space-y-8">
                            
                            {/* Basic Info */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase text-[#351e24]/40 ml-2">Product Name</label>
                                    <input 
                                        name="name" type="text" placeholder="e.g. Silk Evening Dress"
                                        className="w-full p-5 rounded-2xl border border-[#fde2e7] focus:ring-4 focus:ring-rose-50 outline-none font-bold text-[#351e24] transition-all"
                                        value={formData.name} onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-black uppercase text-[#351e24]/40 ml-2">Collections</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories?.map(cat => (
                                            <button 
                                                key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                                                className={`px-4 py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${formData.category_ids.includes(cat.id) ? 'bg-[#351e24] text-white' : 'bg-white text-zinc-300 border-[#fde2e7]'}`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase text-[#351e24]/40 ml-2">Price ($)</label>
                                        <input name="price" type="number" className="w-full p-5 rounded-2xl border border-[#fde2e7] outline-none font-bold italic" value={formData.price} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase text-[#351e24]/40 ml-2">SKU Code</label>
                                        <input name="sku" type="text" className="w-full p-5 rounded-2xl border border-[#fde2e7] outline-none font-bold uppercase" value={formData.sku} onChange={handleInputChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black uppercase text-[#351e24]/40 ml-2">Total Stock</label>
                                        <input name="stock" type="number" className="w-full p-5 rounded-2xl border border-[#fde2e7] outline-none font-bold italic" value={formData.stock} onChange={handleInputChange} />
                                    </div>
                                </div>
                            </div>

                            {/* Variants Section - Simplified */}
                            <div className="pt-8 border-t border-[#fde2e7] space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-black uppercase tracking-widest text-[#351e24]/30 italic">Options (Sizes / Colors)</h4>
                                    <button 
                                        type="button" onClick={addVariant}
                                        className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase rounded-lg hover:bg-[#351e24] transition-all flex items-center gap-2"
                                    >
                                        <Plus className="w-3 h-3" /> Add Option
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.variants.map((v, i) => (
                                        <div key={i} className="flex flex-wrap items-end gap-3 p-5 bg-[#fffbfb] rounded-2xl border border-[#fde2e7] group relative">
                                            <div className="flex-1 min-w-[80px]">
                                                <label className="text-[8px] font-black uppercase text-[#351e24]/20 block mb-2">Type</label>
                                                <select value={v.type} onChange={(e) => handleVariantChange(i, 'type', e.target.value)} className="w-full p-3 rounded-lg border border-transparent bg-white text-[10px] font-bold uppercase outline-none">
                                                    <option value="size">Size</option>
                                                    <option value="color">Color</option>
                                                </select>
                                            </div>
                                            <div className="flex-1 min-w-[100px]">
                                                <label className="text-[8px] font-black uppercase text-[#351e24]/20 block mb-2">Value (e.g. Red, XL)</label>
                                                <input value={v.value} onChange={(e) => handleVariantChange(i, 'value', e.target.value)} className="w-full p-3 rounded-lg bg-white border border-transparent text-[10px] font-bold outline-none" placeholder="Enter value" />
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[8px] font-black uppercase text-[#351e24]/20 block mb-2">Price ($)</label>
                                                <input value={v.price_override} onChange={(e) => handleVariantChange(i, 'price_override', e.target.value)} className="w-full p-3 rounded-lg bg-white border border-transparent text-[10px] font-bold outline-none" placeholder="Extra costs" />
                                            </div>
                                            <div className="w-20">
                                                <label className="text-[8px] font-black uppercase text-[#351e24]/20 block mb-2">Stock</label>
                                                <input value={v.stock} onChange={(e) => handleVariantChange(i, 'stock', e.target.value)} className="w-full p-3 rounded-lg bg-white border border-transparent text-[10px] font-bold outline-none" />
                                            </div>
                                            <button 
                                                type="button" onClick={() => removeVariant(i)}
                                                className="w-10 h-10 flex items-center justify-center text-primary/30 hover:text-primary transition-all p-2"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.variants.length === 0 && (
                                        <p className="text-center py-6 text-[10px] text-[#351e24]/20 font-bold italic uppercase">No extra options added.</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase text-[#351e24]/40 ml-2">Description</label>
                                <textarea 
                                    name="description" rows="3" className="w-full p-5 rounded-2xl border border-[#fde2e7] outline-none font-medium text-sm leading-relaxed no-scrollbar"
                                    value={formData.description} onChange={handleInputChange} 
                                    placeholder="Tell the story of this product..."
                                />
                            </div>
                        </div>
                    </div>
                </form>

                {/* Actions */}
                <div className="p-8 bg-[#fffbfb] border-t border-[#fde2e7] flex items-center justify-end gap-5">
                    <button onClick={onClose} className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-[#351e24]/20 hover:text-primary transition-all">Cancel</button>
                    <button 
                        form="product-form" disabled={mutation.isPending}
                        className="bg-[#351e24] text-white px-12 py-5 rounded-2xl shadow-xl hover:bg-black transition-all flex items-center gap-3 font-bold uppercase text-[11px] italic"
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
