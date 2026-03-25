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
    Star
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { createAdminProduct, updateAdminProduct } from '../../services/adminService';

const ProductModal = ({ isOpen, onClose, product, categories }) => {
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: '',
        category_ids: [], // Changed to array
        price: '',
        sku: '',
        stock: '',
        description: '',
        is_active: 1,
        is_featured: 0,
        images: [],
        variants: []
    });

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
                setFormData({
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
                });
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
            if (product) {
                return updateAdminProduct({ id: product.id, formData: data });
            }
            return createAdminProduct(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminProducts']);
            queryClient.invalidateQueries(['adminStats']);
            toast.success(product ? 'تم تحديث المنتج بنجاح / Product updated' : 'تم إضافة المنتج بنجاح / Product added');
            onClose();
        },
        onError: (err) => {
            console.error('API Error:', err.response?.data);
            if (err.response?.status === 422) {
                const backendErrors = err.response.data.errors || {};
                setErrors(backendErrors);
                
                // Get the first error message to show in toast
                const firstError = Object.values(backendErrors)[0]?.[0];
                toast.error(firstError || 'خطأ في البيانات / Validation error');
            } else {
                toast.error(err.response?.data?.message || 'فشلت العملية / Operation failed');
            }
        }
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
            
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
            if (errors.images) setErrors(prev => ({ ...prev, images: null }));
        }
    };

    const removeImage = (index, isExisting = false) => {
        if (isExisting) {
            // Logic to delete existing image if needed, for now just UI remove
            setPreviews(prev => prev.filter((_, i) => i !== index));
        } else {
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
            setPreviews(prev => prev.filter((_, i) => i !== index));
        }
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
        setFormData(prev => ({
            ...prev,
            category_ids: prev.category_ids.includes(catId) 
                ? prev.category_ids.filter(id => id !== catId)
                : [...prev.category_ids, catId]
        }));
        if (errors.category_ids) {
            setErrors(prev => ({ ...prev, category_ids: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'images') {
                formData.images.forEach(file => {
                    data.append('images[]', file);
                });
            } else if (key === 'variants') {
                formData.variants.forEach((variant, index) => {
                    data.append(`variants[${index}][type]`, variant.type);
                    data.append(`variants[${index}][value]`, variant.value);
                    if (variant.price_override) {
                        data.append(`variants[${index}][price_override]`, variant.price_override);
                    }
                    data.append(`variants[${index}][stock]`, variant.stock);
                });
            } else if (key === 'category_ids') {
                formData.category_ids.forEach(id => {
                    data.append('category_ids[]', id);
                });
            } else {
                data.append(key, formData[key]);
            }
        });

        if (product) {
            data.append('_method', 'PUT');
        }

        mutation.mutate(data);
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />
            
            {/* Modal Body */}
            <div className="relative bg-white w-full max-w-5xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col font-sans">
                
                {/* Header - رأس النموذج */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            {product ? 'تعديل المنتج / Edit Product' : 'إضافة منتج جديد / Add New Product'}
                        </h3>
                        {product && (
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                                ID: {product.id}
                            </p>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-900 transition-all shadow-sm border border-slate-100"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form Content - محتوى النموذج */}
                <form id="product-form" onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-10 no-scrollbar">
                    
                    {/* Multi-Error Banner if validation fails */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                                <AlertCircle className="w-4 h-4" />
                                أخطاء في البيانات / Validation Errors
                            </div>
                            <ul className="list-disc list-inside space-y-1">
                                {Object.entries(errors).map(([field, msgs]) => (
                                    <li key={field} className="text-[10px] text-red-500 font-medium italic">
                                        <span className="font-bold underline uppercase">{field.replace('_', ' ')}</span>: {msgs[0]}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* Image Sector - قطاع الصورة */}
                        <div className="lg:col-span-4 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">صور المنتج / Product Images</label>
                                
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {previews.map((src, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-100">
                                            <img src={src} alt="Preview" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 flex flex-col items-center justify-center cursor-pointer transition-all"
                                    >
                                        <Upload className="w-5 h-5 text-slate-400" />
                                        <span className="text-[8px] font-bold text-slate-400 mt-1">إضافة / Add</span>
                                    </div>
                                </div>

                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    className="hidden" 
                                    accept="image/*"
                                    multiple
                                />
                                {errors.images && <p className="mt-2 text-[10px] font-bold text-red-500 uppercase flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.images[0]}</p>}
                            </div>

                            {/* Visibility Toggle */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900">حالة العرض / Active Status</span>
                                    <span className="text-[10px] text-slate-400">{formData.is_active ? 'المنتج متاح حالياً' : 'المنتج مخفي حالياً'}</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="is_active"
                                        className="sr-only peer"
                                        checked={formData.is_active === 1}
                                        onChange={handleInputChange}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-all duration-300 shadow-inner" />
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5 shadow-sm" />
                                </label>
                            </div>

                            {/* Featured Toggle */}
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Star className={`w-5 h-5 ${formData.is_featured ? 'text-amber-500 fill-amber-500' : 'text-amber-200'}`} />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-900">منتج مميز / Featured</span>
                                        <span className="text-[10px] text-amber-600/60 font-medium">يظهر في واجهة الصفحة الرئيسية</span>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        name="is_featured"
                                        className="sr-only peer"
                                        checked={formData.is_featured === 1}
                                        onChange={handleInputChange}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-amber-500 transition-all duration-300 shadow-inner" />
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5 shadow-sm" />
                                </label>
                            </div>
                        </div>

                        {/* Data Sector - قطاع البيانات */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Product Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">اسم المنتج / Product Name</label>
                                <div className="relative group">
                                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <input 
                                        type="text" 
                                        name="name"
                                        placeholder="اسم المنتج..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                {errors.name && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 px-1"><AlertCircle className="w-3 h-3" /> {errors.name[0]}</p>}
                            </div>

                            {/* Categories Selection */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 italic">التصنيفات / Categories</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories?.map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                                formData.category_ids.includes(cat.id)
                                                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-105'
                                                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                                {errors.category_ids && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 px-1"><AlertCircle className="w-3 h-3" /> {errors.category_ids[0]}</p>}
                            </div>

                            {/* Price / SKU / Stock Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">السعر / Price</label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <input 
                                            type="number" 
                                            name="price"
                                            placeholder="0.00"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            step="0.01"
                                        />
                                    </div>
                                    {errors.price && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 px-1"><AlertCircle className="w-3 h-3" /> {errors.price[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">كود المنتج / SKU</label>
                                    <div className="relative group">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <input 
                                            type="text" 
                                            name="sku"
                                            placeholder="مثال: MH-1001"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                                            value={formData.sku}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {errors.sku && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 px-1"><AlertCircle className="w-3 h-3" /> {errors.sku[0]}</p>}
                                </div>

                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">الكمية الإجمالية / Total Stock</label>
                                    <div className="relative group">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                        <input 
                                            type="number" 
                                            name="stock"
                                            placeholder="0"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none"
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    {errors.stock && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 px-1"><AlertCircle className="w-3 h-3" /> {errors.stock[0]}</p>}
                                </div>
                            </div>

                            {/* Variants Section - الألوان والأحجام */}
                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">خيارات المنتج (ألوان/مقاسات) / Variants</label>
                                    <button 
                                        type="button" 
                                        onClick={addVariant}
                                        className="text-[10px] bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors font-bold uppercase"
                                    >
                                        + إضافة خيار / Add Variant
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {formData.variants.map((variant, idx) => (
                                        <div key={idx} className="grid grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl items-end relative group border border-slate-100">
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-400">النوع / Type</label>
                                                <select 
                                                    value={variant.type} 
                                                    onChange={(e) => handleVariantChange(idx, 'type', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-2 text-[10px] font-bold outline-none italic"
                                                >
                                                    <option value="size">مقاس / Size</option>
                                                    <option value="color">لون / Color</option>
                                                </select>
                                            </div>
                                            <div className="col-span-3 space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-400">القيمة / Value</label>
                                                <input 
                                                    type="text" 
                                                    value={variant.value} 
                                                    onChange={(e) => handleVariantChange(idx, 'value', e.target.value)}
                                                    placeholder="مثال: الأحمر / XL"
                                                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[10px] font-bold outline-none italic"
                                                />
                                            </div>
                                            <div className="col-span-3 space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-400">تعديل السعر / Price Override</label>
                                                <input 
                                                    type="number" 
                                                    value={variant.price_override} 
                                                    onChange={(e) => handleVariantChange(idx, 'price_override', e.target.value)}
                                                    placeholder="السعر الخاص"
                                                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[10px] font-bold outline-none italic"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <label className="text-[8px] font-black uppercase text-slate-400">الكمية / Stock</label>
                                                <input 
                                                    type="number" 
                                                    value={variant.stock} 
                                                    onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-[10px] font-bold outline-none italic"
                                                />
                                            </div>
                                            <div className="col-span-2 flex justify-end">
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeVariant(idx)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.variants.length === 0 && (
                                        <p className="text-[10px] text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">لا توجد خيارات مضافة حالياً</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">وصف المنتج / Description</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                                    <textarea 
                                        name="description"
                                        rows="3" 
                                        placeholder="اكتب وصف المنتج هنا..."
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-12 pr-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-slate-900/5 transition-all outline-none resize-none"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                {errors.description && <p className="text-[10px] font-bold text-red-500 flex items-center gap-1 px-1"><AlertCircle className="w-3 h-3" /> {errors.description[0]}</p>}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer - الأزرار */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                    <button 
                        onClick={onClose}
                        className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors px-4"
                    >
                        إلغاء / Cancel
                    </button>
                    <button
                        form="product-form"
                        disabled={mutation.isPending}
                        className="bg-slate-900 text-white px-10 py-4 rounded-xl shadow-lg hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-3 font-bold text-sm"
                    >
                        {mutation.isPending ? (
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Check className="w-5 h-5" />
                        )}
                        {product ? 'حفظ التغييرات / Save' : 'إضافة المنتج / Add'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProductModal;

