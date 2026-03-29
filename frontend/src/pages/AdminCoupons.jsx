import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus, Edit, Trash2, Ticket, X, Save,
    Clock, Target, ToggleLeft, ToggleRight, Tag, Percent, DollarSign, Users, Calendar,
    ChevronDown,
    Zap,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminCoupons, toggleCouponStatus } from '../services/adminService';
import axiosInstance from '../services/axiosInstance';

// ── Label ───────────────────────────────────────────────────
const Label = ({ en, required }) => (
    <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#351e24]/60">{en}{required && <span className="text-primary ml-1">*</span>}</span>
    </div>
);

// ── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ coupon }) => {
    const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
    if (!coupon.is_active) return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-500 border border-zinc-200">Inactive</span>;
    if (expired) return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-rose-100 text-rose-600 border border-rose-200">Expired</span>;
    return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">Active</span>;
};

const inputCls = "w-full bg-white border border-[#fde2e7] px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-[#351e24] focus:outline-none focus:ring-4 focus:ring-rose-50 focus:border-primary/40 transition-all placeholder:text-zinc-300";

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                min_order: data.min_order === '' ? 0 : data.min_order,
                max_discount: data.max_discount === '' ? null : data.max_discount,
                usage_limit: data.usage_limit === '' ? null : data.usage_limit,
                per_user_limit: data.per_user_limit === '' ? 1 : data.per_user_limit,
                expires_at: data.expires_at || null
            };
            return editingCoupon
                ? axiosInstance.patch(`/admin/coupons/${editingCoupon.id}`, payload)
                : axiosInstance.post('/admin/coupons', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCoupons']);
            toast.success(editingCoupon ? 'Coupon updated' : 'Coupon created');
            resetForm();
        },
        onError: (err) => {
            const msg = err.response?.data?.message || 'Update failed';
            toast.error(msg);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosInstance.delete(`/admin/coupons/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCoupons']);
            toast.success('Coupon deleted');
            setDeleteConfirm(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to remove')
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id) => toggleCouponStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminCoupons']);
            toast.success('Status updated');
        },
        onError: () => toast.error('Update failed')
    });

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center bg-[#fffbfb] min-h-screen">
            <div className="w-12 h-12 border-[3px] border-rose-50 border-t-primary rounded-full animate-spin mx-auto mb-8 shadow-sm"></div>
            <p className="font-bold text-primary/50 uppercase tracking-[0.2em] text-[10px] italic">Loading Coupons...</p>
        </div>
    );

    return (
        <div className="space-y-12 pb-24 font-['Plus_Jakarta_Sans'] antialiased">

            {/* Header */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b border-[#fde2e7]/30 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                        <Ticket className="w-4 h-4" />
                        Discounts Hub
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-[#351e24] tracking-tighter uppercase italic leading-none">
                        Coupon <span className="text-primary">Management</span>
                    </h1>
                </div>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-[#351e24] text-white px-10 py-5 rounded-[2rem] shadow-xl hover:bg-primary transition-all flex items-center gap-4 font-bold text-[10px] tracking-widest uppercase italic group"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                    <span>Create New Coupon</span>
                </button>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {[
                    { label: 'Total Coupons', value: coupons.length, icon: Ticket, color: 'text-primary' },
                    { label: 'Live Promotions', value: coupons.filter(c => c.is_active && (!c.expires_at || new Date(c.expires_at) > new Date())).length, icon: ToggleRight, color: 'text-emerald-500' },
                    { label: 'Disabled / Expired', value: coupons.filter(c => !c.is_active || (c.expires_at && new Date(c.expires_at) < new Date())).length, icon: ToggleLeft, color: 'text-rose-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white border border-[#fde2e7]/40 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-sm group hover:shadow-md transition-all duration-500">
                        <div className="w-14 h-14 bg-[#fffbfb] rounded-2xl flex items-center justify-center border border-[#fde2e7]/30 group-hover:scale-110 transition-transform duration-500">
                            <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-[#351e24] leading-none italic tracking-tighter tabular-nums">{value}</p>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#351e24]/40 mt-1 block italic">{label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                {/* Coupon List */}
                <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <section className="bg-white rounded-[3rem] border border-[#fde2e7]/40 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                    <tr className="text-[10px] font-bold text-[#351e24]/40 uppercase tracking-[0.2em] bg-[#fffbfb] border-b border-[#fde2e7]/30 italic">
                                        <th className="py-8 px-10">Coupon Code</th>
                                        <th className="py-8 px-10">Discount</th>
                                        <th className="py-8 px-10">Usage</th>
                                        <th className="py-8 px-10">Expiry</th>
                                        <th className="py-8 px-10">Status</th>
                                        <th className="py-8 px-10 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#fde2e7]/10">
                                    {coupons.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-40 text-center">
                                                <div className="flex flex-col items-center gap-6 opacity-20">
                                                    <Ticket className="w-16 h-16 text-zinc-300" />
                                                    <p className="text-xl font-bold uppercase tracking-widest italic leading-none text-zinc-400">No Coupons Found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : coupons.map((coupon) => (
                                        <tr key={coupon.id} className="hover:bg-rose-50/10 transition-all group/row">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#351e24] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-[#351e24]/10">
                                                        <Tag className="w-4 h-4 text-[#ffb2bf]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-bold text-[#351e24] tracking-wider italic uppercase leading-none group-hover/row:text-primary transition-colors">{coupon.code}</p>
                                                        <p className="text-[9px] text-[#351e24]/30 font-bold uppercase tracking-widest mt-2">ID: #{coupon.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 text-xl font-bold text-[#351e24] italic tabular-nums leading-none">
                                                        {coupon.type === 'percentage' ? <Percent className="w-4 h-4 text-primary" /> : <DollarSign className="w-4 h-4 text-primary" />}
                                                        {coupon.value}
                                                    </div>
                                                    <span className="text-[9px] font-bold text-[#351e24]/40 uppercase tracking-widest mt-1 italic">{coupon.type}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-bold text-[#351e24] italic tracking-tight">{coupon.uses_count || 0}</span>
                                                        <span className="text-[#351e24]/20 text-[10px] font-bold">/ {coupon.usage_limit || '∞'}</span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-[#351e24]/30 uppercase tracking-widest mt-1 italic">Uses</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                {coupon.expires_at ? (
                                                    <div className="flex items-center gap-3 text-[11px] font-bold text-[#351e24]/60 italic">
                                                        <Calendar className="w-3.5 h-3.5 text-primary/30" />
                                                        {new Date(coupon.expires_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-[#351e24]/20 uppercase tracking-widest italic">Permanent</span>
                                                )}
                                            </td>
                                            <td className="px-10 py-8">
                                                <button onClick={() => toggleStatusMutation.mutate(coupon.id)} className="transition-transform hover:scale-105">
                                                    <StatusBadge coupon={coupon} />
                                                </button>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-2 text-zinc-300">
                                                    <button onClick={() => handleEdit(coupon)} className="w-10 h-10 rounded-2xl flex items-center justify-center border border-[#fde2e7] hover:bg-[#351e24] hover:text-white transition-all">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(coupon)} className="w-10 h-10 rounded-2xl flex items-center justify-center border border-[#fde2e7] hover:bg-rose-500 hover:text-white transition-all">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Form Section */}
                <div className="lg:col-span-4 animate-in fade-in slide-in-from-right-8 duration-1000">
                    {showForm ? (
                        <div className="bg-white rounded-[3rem] border border-[#fde2e7] shadow-2xl overflow-hidden sticky top-32">
                            <div className="bg-[#351e24] p-8 flex justify-between items-center">
                                <div>
                                    <h3 className="text-[11px] font-bold text-primary uppercase tracking-[0.2em] italic">Coupon Settings</h3>
                                    <p className="text-xl font-bold text-white tracking-tighter uppercase italic mt-1">{editingCoupon ? 'Edit Details' : 'Create New'}</p>
                                </div>
                                <button onClick={resetForm} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="space-y-5">
                                    <div>
                                        <Label en="Coupon Code" required />
                                        <input
                                            className={inputCls}
                                            placeholder="E.G. SUMMER25"
                                            value={formData.code}
                                            onChange={e => set('code', e.target.value.toUpperCase())}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label en="Type" required />
                                            <div className="relative">
                                                <select className={inputCls + " pr-10 appearance-none"} value={formData.type} onChange={e => set('type', e.target.value)}>
                                                    <option value="percentage">Percentage</option>
                                                    <option value="fixed">Fixed</option>
                                                </select>
                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label en="Value" required />
                                            <input className={inputCls} type="number" placeholder="00" value={formData.value} onChange={e => set('value', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label en="Min Order" />
                                            <input className={inputCls} type="number" placeholder="0.00" value={formData.min_order} onChange={e => set('min_order', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label en="Usage Limit" />
                                            <input className={inputCls} type="number" placeholder="Optional" value={formData.usage_limit} onChange={e => set('usage_limit', e.target.value)} />
                                        </div>
                                    </div>

                                    <div>
                                        <Label en="Expiry Date" />
                                        <input className={inputCls} type="date" value={formData.expires_at} onChange={e => set('expires_at', e.target.value)} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-rose-50/30 rounded-2xl border border-[#fde2e7]/50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#351e24] italic">Active Status</span>
                                        <span className="text-[9px] text-[#351e24]/40 font-bold mt-0.5">Visible to customers</span>
                                    </div>
                                    <button type="button" onClick={() => set('is_active', !formData.is_active)} className={`w-12 h-7 rounded-full p-1 transition-all duration-500 ${formData.is_active ? 'bg-primary' : 'bg-zinc-200'}`}>
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-500 ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                <button
                                    onClick={() => saveMutation.mutate(formData)}
                                    disabled={saveMutation.isPending || !formData.code || !formData.value}
                                    className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-[#351e24] transition-all disabled:opacity-30 shadow-lg italic"
                                >
                                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingCoupon ? 'SAVE CHANGES' : 'CREATE COUPON'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full border-4 border-dashed border-[#fde2e7] rounded-[3rem] p-16 text-center hover:bg-rose-50/10 hover:border-primary transition-all group/cta"
                        >
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover/cta:bg-primary transition-all duration-500">
                                <Plus className="w-8 h-8 text-primary group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
                            </div>
                            <p className="font-bold uppercase tracking-[0.2em] text-[#351e24]/40 text-[10px] italic">Create New Promotion</p>
                        </button>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-[#351e24]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-2xl p-12 max-w-md w-full border border-rose-50 animate-in zoom-in duration-300 text-center space-y-8">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
                            <Trash2 className="w-10 h-10 text-rose-500" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-2xl font-bold uppercase italic tracking-tighter text-[#351e24]">Delete Coupon?</h4>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-relaxed px-4">Removing {deleteConfirm.code} is permanent and cannot be reversed.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-5 bg-zinc-50 text-zinc-400 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-zinc-100 transition-all italic">CANCEL</button>
                            <button onClick={() => deleteMutation.mutate(deleteConfirm.id)} disabled={deleteMutation.isPending} className="flex-1 py-5 bg-rose-500 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 italic">
                                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'CONFIRM'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;
