import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Edit, Trash2, Ticket, X, Save,
    Clock, Target, ToggleLeft, ToggleRight, Tag, Percent, DollarSign, Users, Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminCoupons, toggleCouponStatus } from '../services/adminService';
import axiosInstance from '../services/axiosInstance';

// ─── Bilingual Field Label ───────────────────────────────────────────────────
const BiLabel = ({ en, ar, required }) => (
    <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-black uppercase tracking-widest text-slate-500">{en}{required && <span className="text-red-400 ml-1">*</span>}</span>
        <span className="text-xs font-bold text-slate-400" style={{ fontFamily: "'Cairo', sans-serif", direction: 'rtl' }}>{ar}</span>
    </div>
);

// ─── Field Wrapper ────────────────────────────────────────────────────────────
const Field = ({ en, ar, required, children }) => (
    <div>
        <BiLabel en={en} ar={ar} required={required} />
        {children}
    </div>
);

const inputCls = "w-full bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-400 transition-all placeholder:text-slate-300";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ coupon }) => {
    const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
    if (!coupon.is_active) return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-400 border border-slate-200">غير فعال · Inactive</span>;
    if (expired) return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-400 border border-red-100">منتهي · Expired</span>;
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">فعال · Active</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminCoupons = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const emptyForm = {
        code: '', 
        type: 'percentage',
        value: '',
        min_order: 0,
        max_discount: '',
        usage_limit: '',
        per_user_limit: 1,
        expires_at: '', 
        is_active: true
    };
    const [formData, setFormData] = useState(emptyForm);
    const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));

    const { data: couponsResp, isLoading } = useQuery({
        queryKey: ['adminCoupons'],
        queryFn: getAdminCoupons,
    });
    const coupons = Array.isArray(couponsResp) ? couponsResp : (couponsResp?.data || []);

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            min_order: coupon.min_order || 0,
            max_discount: coupon.max_discount || '',
            usage_limit: coupon.usage_limit || '',
            per_user_limit: coupon.per_user_limit || 1,
            expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : '',
            is_active: coupon.is_active
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingCoupon(null);
        setShowForm(false);
    };

    const saveMutation = useMutation({
        mutationFn: (data) => {
            const payload = {
                ...data,
                // Ensure nulls for empty numeric fields
                min_order: data.min_order === '' ? 0 : data.min_order,
                max_discount: data.max_discount === '' ? null : data.max_discount,
                usage_limit: data.usage_limit === '' ? null : data.usage_limit,
                per_user_limit: data.per_user_limit === '' ? 1 : data.per_user_limit,
                expires_at: data.expires_at || null
            };
            return editingCoupon
                ? axiosInstance.put(`/admin/coupons/${editingCoupon.id}`, payload)
                : axiosInstance.post('/admin/coupons', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCoupons']);
            toast.success(editingCoupon ? 'تم تحديث الكوبون · Coupon updated' : 'تم إنشاء الكوبون · Coupon created');
            resetForm();
        },
        onError: (err) => {
            const msg = err.response?.data?.message || 'حدث خطأ · Operation failed';
            toast.error(msg);
            if (err.response?.data?.errors) {
                Object.values(err.response.data.errors).flat().forEach(e => toast.error(e));
            }
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosInstance.delete(`/admin/coupons/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCoupons']);
            toast.success('تم حذف الكوبون · Coupon deleted');
            setDeleteConfirm(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'فشل الحذف · Delete failed')
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id) => toggleCouponStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCoupons']);
            toast.success('تم تغيير الحالة · Status toggled');
        },
        onError: () => toast.error('فشل تغيير الحالة · Toggle failed')
    });

    if (isLoading) return (
        <div className="text-center font-black text-slate-200 animate-pulse text-4xl py-32 uppercase italic tracking-tighter">
            جاري التحميل... Loading
        </div>
    );

    return (
        <>
            {/* Cairo font for Arabic */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');`}</style>

            <div className="space-y-8">

                {/* ── Header ───────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">Coupons</h2>
                            <span className="text-2xl font-bold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>· الكوبونات</span>
                        </div>
                        <p className="text-slate-400 mt-1.5 text-xs uppercase tracking-widest font-bold opacity-70">
                            Manage discount codes · إدارة أكواد الخصم
                        </p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2.5 font-black text-sm tracking-widest uppercase"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إضافة · Add</span>
                    </button>
                </div>

                {/* ── Stats Row ─────────────────────────────────────── */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { en: 'Total Coupons', ar: 'إجمالي الكوبونات', value: coupons.length, icon: Ticket, color: 'text-slate-700' },
                        { en: 'Active', ar: 'فعالة', value: coupons.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())).length, icon: ToggleRight, color: 'text-emerald-600' },
                        { en: 'Expired / Inactive', ar: 'منتهية / غير فعالة', value: coupons.filter(c => !c.is_active || (c.expires_at && new Date(c.expires_at) < new Date())).length, icon: ToggleLeft, color: 'text-red-400' },
                    ].map(({ en, ar, value, icon: Icon, color }) => (
                        <div key={en} className="bg-white border border-slate-100 rounded-xl p-5 flex items-center gap-4 shadow-sm">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                                <Icon className={`w-5 h-5 ${color}`} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{en}</span>
                                    <span className="text-[9px] text-slate-300">·</span>
                                    <span className="text-[10px] text-slate-400 font-semibold" style={{ fontFamily: "'Cairo', sans-serif" }}>{ar}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* ── Coupons Table ──────────────────────────────── */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    {[
                                        { en: 'Code', ar: 'الكود' },
                                        { en: 'Discount', ar: 'الخصم' },
                                        { en: 'Usage', ar: 'الاستخدام' },
                                        { en: 'Expiry', ar: 'الانتهاء' },
                                        { en: 'Status', ar: 'الحالة' },
                                        { en: 'Actions', ar: 'الإجراءات' },
                                    ].map(({ en, ar }) => (
                                        <th key={en} className="py-4 px-5 text-left">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{en}</span>
                                                <span className="text-[10px] font-bold text-slate-300" style={{ fontFamily: "'Cairo', sans-serif" }}>{ar}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {coupons.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <p className="text-slate-300 font-black uppercase italic text-sm">لا توجد كوبونات · No coupons yet</p>
                                        </td>
                                    </tr>
                                )}
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-slate-50/60 transition-colors group">
                                        {/* Code */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                                                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 tracking-wider text-sm uppercase">{coupon.code}</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">#TOK-{coupon.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Discount */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-1.5">
                                                {coupon.type === 'percentage'
                                                    ? <Percent className="w-3.5 h-3.5 text-slate-400" />
                                                    : <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                                }
                                                <span className="font-black text-slate-900 text-sm">
                                                    {coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase">
                                                    {coupon.type === 'percentage' ? 'off · خصم' : 'flat · ثابت'}
                                                </span>
                                            </div>
                                            {coupon.min_order > 0 && (
                                                <p className="text-[9px] text-slate-400 mt-1">
                                                    Min: ${coupon.min_order} · أدنى طلب
                                                </p>
                                            )}
                                        </td>
                                        {/* Usage */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="font-black text-slate-800 text-sm tabular-nums">
                                                    {coupon.uses_count || 0}
                                                    <span className="text-slate-300 font-normal"> / </span>
                                                    {coupon.usage_limit || '∞'}
                                                </span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 mt-1">استخدامات · uses</p>
                                        </td>
                                        {/* Expiry */}
                                        <td className="py-4 px-5">
                                            {coupon.expires_at ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-600">
                                                        {new Date(coupon.expires_at).toLocaleDateString('en-GB')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-300 font-bold italic">لا ينتهي · No expiry</span>
                                            )}
                                        </td>
                                        {/* Status */}
                                        <td className="py-4 px-5">
                                            <button
                                                onClick={() => toggleStatusMutation.mutate(coupon.id)}
                                                className="transition-transform hover:scale-105 active:scale-95"
                                            >
                                                <StatusBadge coupon={coupon} />
                                            </button>
                                        </td>
                                        {/* Actions */}
                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all"
                                                    title="تعديل · Edit"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(coupon)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-100 text-slate-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                                                    title="حذف · Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Form Panel ─────────────────────────────────── */}
                    {showForm ? (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden sticky top-8">
                            {/* Form Header */}
                            <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-black uppercase italic tracking-tight text-lg leading-none">
                                        {editingCoupon ? 'Edit Coupon' : 'New Coupon'}
                                    </h3>
                                    <p className="text-slate-400 text-xs mt-1 font-bold" style={{ fontFamily: "'Cairo', sans-serif" }}>
                                        {editingCoupon ? 'تعديل كوبون' : 'إنشاء كوبون جديد'}
                                    </p>
                                </div>
                                <button onClick={resetForm} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-all">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-5">

                                {/* Code */}
                                <Field en="Coupon Code" ar="كود الكوبون" required>
                                    <input
                                        className={inputCls + " font-black tracking-widest uppercase"}
                                        placeholder="e.g. SAVE20"
                                        value={formData.code}
                                        onChange={e => set('code', e.target.value.toUpperCase())}
                                    />
                                </Field>

                                {/* Type + Value */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field en="Type" ar="النوع" required>
                                        <select
                                            className={inputCls}
                                            value={formData.type}
                                            onChange={e => set('type', e.target.value)}
                                        >
                                            <option value="percentage">% Percentage · نسبة</option>
                                            <option value="fixed">$ Fixed · ثابت</option>
                                        </select>
                                    </Field>
                                    <Field en="Value" ar="القيمة" required>
                                        <input
                                            className={inputCls}
                                            type="number"
                                            placeholder={formData.type === 'percentage' ? '20' : '50.00'}
                                            value={formData.value}
                                            onChange={e => set('value', e.target.value)}
                                        />
                                    </Field>
                                </div>

                                {/* Max Discount (Conditional) */}
                                {formData.type === 'percentage' && (
                                    <Field en="Max Discount Amount" ar="أقصى قيمة للخصم">
                                        <input
                                            className={inputCls}
                                            type="number"
                                            placeholder="Leave empty for no limit"
                                            value={formData.max_discount}
                                            onChange={e => set('max_discount', e.target.value)}
                                        />
                                    </Field>
                                )}

                                {/* Min Order + Max Uses */}
                                <div className="grid grid-cols-2 gap-6">
                                    <Field en="Min. Order" ar="أدنى طلب">
                                        <input
                                            className={inputCls}
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.min_order}
                                            onChange={e => set('min_order', e.target.value)}
                                        />
                                    </Field>
                                    <Field en="Usage Limit" ar="أقصى استخدام">
                                        <input
                                            className={inputCls}
                                            type="number"
                                            placeholder="∞"
                                            value={formData.usage_limit}
                                            onChange={e => set('usage_limit', e.target.value)}
                                        />
                                    </Field>
                                    <Field en="Per User Limit" ar="حد المستخدم">
                                        <input
                                            className={inputCls}
                                            type="number"
                                            placeholder="1"
                                            value={formData.per_user_limit}
                                            onChange={e => set('per_user_limit', e.target.value)}
                                        />
                                    </Field>
                                </div>

                                {/* Date Area */}
                                <div className="grid grid-cols-1 gap-4">
                                    <Field en="Expiry Date" ar="تاريخ الانتهاء">
                                        <input
                                            className={inputCls}
                                            type="date"
                                            value={formData.expires_at}
                                            onChange={e => set('expires_at', e.target.value)}
                                        />
                                    </Field>
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-slate-700">Active Status</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5" style={{ fontFamily: "'Cairo', sans-serif" }}>حالة التفعيل</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => set('is_active', !formData.is_active)}
                                        className={`w-12 h-6 rounded-full p-0.5 transition-all ${formData.is_active ? 'bg-slate-900' : 'bg-slate-200'}`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={() => saveMutation.mutate(formData)}
                                    disabled={saveMutation.isPending || !formData.code || !formData.value}
                                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 shadow-lg"
                                >
                                    {saveMutation.isPending ? (
                                        <span className="animate-pulse">جاري الحفظ... Saving</span>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {editingCoupon ? 'حفظ التعديلات · Save Changes' : 'إنشاء الكوبون · Create Coupon'}
                                        </>
                                    )}
                                </button>

                            </div>
                        </div>
                    ) : (
                        /* Empty State CTA */
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-slate-900 hover:bg-slate-50 transition-all group"
                        >
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-900 transition-colors">
                                <Plus className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                            </div>
                            <p className="font-black uppercase tracking-widest text-slate-400 text-xs">Add New Coupon</p>
                            <p className="text-slate-300 text-sm font-bold mt-1" style={{ fontFamily: "'Cairo', sans-serif" }}>إضافة كوبون جديد</p>
                        </button>
                    )}
                </div>
            </div>

            {/* ── Delete Confirmation Modal ───────────────────────── */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border border-slate-100">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Trash2 className="w-7 h-7 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight text-center">
                            Delete Coupon?
                        </h3>
                        <p className="text-center text-sm font-bold mt-1 text-slate-400" style={{ fontFamily: "'Cairo', sans-serif" }}>
                            حذف الكوبون؟
                        </p>
                        <p className="text-center text-slate-500 text-sm mt-3">
                            <span className="font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{deleteConfirm.code}</span>
                        </p>
                        <p className="text-center text-xs text-slate-400 mt-2">
                            This action cannot be undone · هذا الإجراء لا يمكن التراجع عنه
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 py-3 rounded-xl border border-slate-200 font-black uppercase text-xs tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                إلغاء · Cancel
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(deleteConfirm.id)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? '...' : 'حذف · Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminCoupons;