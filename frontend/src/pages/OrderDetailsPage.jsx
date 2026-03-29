import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Truck,
    CheckCircle,
    Clock,
    ChevronLeft,
    MapPin,
    CreditCard,
    ShieldCheck,
    Loader2,
    X,
    Star,
    MessageSquareQuote,
    ChevronRight,
    ShoppingBasket,
    DownloadCloud
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import { submitReview } from '../services/reviewService';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// ── Bilingual Helper ────────────────────────────────────────────────────────
const BiText = ({ en, ar, className = "", sub = false, colorClass = "" }) => (
    <div className={`flex flex-col ${className}`}>
        <span className={`${sub ? 'text-[9px]' : 'text-xs'} font-black uppercase tracking-widest italic ${colorClass || 'text-on-surface-variant'}`}>{en}</span>
        <span className={`${sub ? 'text-[10px]' : 'text-sm'} font-bold ${colorClass || 'text-on-surface'}`} style={{ fontFamily: "'Cairo', sans-serif" }}>{ar}</span>
    </div>
);

const OrderDetailsPage = () => {
    const { orderNumber } = useParams();
    const { token } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: orderResp, isLoading } = useQuery({
        queryKey: ['order', orderNumber],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/orders/${orderNumber}`);
            return data;
        },
        enabled: !!token && !!orderNumber
    });

    const order = orderResp?.data || orderResp;

    const [reviewingProduct, setReviewingProduct] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });

    const cancelMutation = useMutation({
        mutationFn: () => axiosInstance.post(`/orders/${orderNumber}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries(['order', orderNumber]);
            toast.success('Order cancelled · تم إلغاء الطلب');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed · فشل الإلغاء')
    });

    const completeMutation = useMutation({
        mutationFn: () => axiosInstance.post(`/orders/${orderNumber}/complete`),
        onSuccess: () => {
            queryClient.invalidateQueries(['order', orderNumber]);
            toast.success('Confirmed · تم تأكيد الاستلام');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed · فشل التحديث')
    });

    const reviewMutation = useMutation({
        mutationFn: (data) => submitReview(reviewingProduct.id, data),
        onSuccess: () => {
            toast.success('Review submitted · تم إرسال التقييم');
            setReviewingProduct(null);
            setReviewForm({ rating: 5, title: '', body: '' });
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed · فشل الإرسال')
    });

    const openReviewModal = (product) => {
        setReviewingProduct(product);
        setReviewForm({ rating: 5, title: '', body: '' });
    };

    if (!token) {
        navigate('/login');
        return null;
    }

    if (isLoading) return (
        <div className="pt-40 min-h-screen text-center bg-[#fcf8f9]">
            <Loader2 className="inline-block w-12 h-12 text-primary animate-spin" />
            <p className="mt-8 font-black text-slate-400 uppercase tracking-widest text-[10px] italic">Loading Order · جاري التحميل...</p>
        </div>
    );

    if (!order) return (
        <div className="pt-40 text-center py-40 bg-[#fcf8f9] min-h-screen">
            <h2 className="text-4xl font-black uppercase italic text-on-surface">Order Not Found · طلب غير موجود</h2>
            <Link to="/orders" className="mt-8 inline-block px-10 py-4 bg-primary text-white font-bold uppercase tracking-widest rounded-full shadow-xl transition-transform hover:scale-105 active:scale-95">Go Back · عودة</Link>
        </div>
    );

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'Completed · مكتمل';
            case 'delivered': return 'Delivered · تم التوصيل';
            case 'processing': return 'Processing · جاري التنفيذ';
            case 'cancelled': return 'Cancelled · ملغي';
            default: return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-100 text-emerald-800';
            case 'delivered': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-amber-100 text-amber-800';
            case 'cancelled': return 'bg-rose-100 text-rose-800';
            default: return 'bg-zinc-100 text-zinc-800';
        }
    };

    return (
        <div className="bg-[#fcf8f9] text-on-surface antialiased min-h-screen font-headline selection:bg-primary selection:text-white pb-20">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Cairo:wght@400;600;700;900&display=swap');
                body { font-family: 'Plus Jakarta Sans', sans-serif; }
            `}</style>

            <main className="pt-28 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">

                    {/* Header Section */}
                    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div>
                            <nav className="flex items-center gap-2 mb-6">
                                <Link to="/orders" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors italic">
                                    <ChevronLeft className="w-3 h-3" />
                                    My Orders · سجل الطلبات
                                </Link>
                                <ChevronRight className="w-3 h-3 text-zinc-300" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">#{order.order_number}</span>
                            </nav>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex flex-col">
                                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-on-surface italic uppercase leading-none">Order #{order.order_number}</h1>
                                    <span className="text-xl font-bold text-zinc-300 mt-2" style={{ fontFamily: "'Cairo', sans-serif" }}>طلب رقم #{order.order_number}</span>
                                </div>
                                <span className={`px-5 py-2 rounded-full flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] italic shadow-sm border border-transparent ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                </span>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex gap-3 flex-wrap">
                            <Link to={`/orders/${order.order_number}/track`}>
                                <button className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full shadow-2xl shadow-primary/20 transition-transform active:scale-95 hover:scale-105">
                                    <Truck className="w-4 h-4" />
                                    <BiText en="Track Shipment" ar="تتبع الشحنة" sub colorClass="text-white" />
                                </button>
                            </Link>
                            <button className="flex items-center gap-3 px-6 py-4 bg-white/50 border border-outline-variant/10 text-on-surface-variant rounded-full hover:bg-white transition-all active:scale-95 shadow-sm">
                                <DownloadCloud className="w-4 h-4" />
                                <BiText en="Invoice" ar="الفاتورة" sub />
                            </button>
                            {['pending', 'processing'].includes(order.status?.toLowerCase()) && (
                                <button
                                    onClick={() => cancelMutation.mutate()}
                                    disabled={cancelMutation.isPending}
                                    className="flex items-center gap-3 px-8 py-4 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition-all active:scale-95 shadow-sm border border-rose-100"
                                >
                                    {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                    <BiText en="Cancel Order" ar="إلغاء الطلب" sub />
                                </button>
                            )}
                            {order.status?.toLowerCase() === 'delivered' && (
                                <button
                                    onClick={() => completeMutation.mutate()}
                                    disabled={completeMutation.isPending}
                                    className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full shadow-2xl shadow-primary/20 transition-transform active:scale-95"
                                >
                                    {completeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    <BiText en="Confirm Receipt" ar="تأكيد الاستلام" sub className="text-white" />
                                </button>
                            )}
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-12">

                            {/* Items List */}
                            <section className="bg-white/50 backdrop-blur-md p-10 rounded-[3rem] shadow-xl border border-outline-variant/10">
                                {order.status?.toLowerCase() === 'completed' && (
                                    <div className="mb-10 p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center gap-6 animate-in zoom-in-95 duration-500">
                                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-200">
                                            <Star className="w-8 h-8 fill-current" />
                                        </div>
                                        <div className="flex-1">
                                            <BiText en="We value your feedback!" ar="رأيك يهمنا!" />
                                            <p className="text-[10px] font-medium text-emerald-600 italic uppercase tracking-widest mt-1">Please rate the items you've received · يرجى تقييم المنتجات التي استلمتها</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 mb-10">
                                    <ShoppingBasket className="w-6 h-6 text-primary" />
                                    <div className="flex flex-col">
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-on-surface">Items in this Order</h3>
                                        <span className="text-sm font-bold text-zinc-300" style={{ fontFamily: "'Cairo', sans-serif" }}>محتويات الطلب</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {order.items?.map((item) => (
                                        <div key={item.id} className="bg-white p-6 rounded-[2rem] flex flex-col sm:flex-row gap-6 items-center border border-outline-variant/5 transition-all hover:shadow-2xl hover:scale-[1.01] group">
                                            <div className="w-28 h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-[#fcf8f9] shadow-inner border border-primary/5">
                                                <img src={item.product?.image_url} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt="" />
                                            </div>
                                            <div className="flex-grow w-full py-1">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-lg font-black text-on-surface uppercase italic tracking-tighter line-clamp-1">{item.product?.name}</h4>
                                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mt-1 italic">
                                                            {item.variant_label || item.variant?.value || 'Standard Edition'}
                                                        </p>
                                                    </div>
                                                    <p className="font-black text-lg text-primary italic tracking-tighter tabular-nums">${item.price}</p>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-outline-variant/5 pt-4">
                                                    <div className="px-4 py-2 bg-[#fcf8f9] rounded-2xl">
                                                        <BiText en="Quantity" ar={`الكمية: ${item.quantity}`} sub />
                                                    </div>
                                                    <div className="text-right">
                                                        <BiText en="Total" ar={`المجموع: $${item.total}`} sub className="items-end" />
                                                    </div>
                                                </div>
                                                {order.status?.toLowerCase() === 'completed' && (
                                                    <button
                                                        onClick={() => openReviewModal(item.product)}
                                                        className="mt-4 px-6 py-3 bg-primary/5 text-primary border border-primary/10 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary hover:text-white transition-all italic group/rev"
                                                    >
                                                        <MessageSquareQuote className="w-4 h-4" />
                                                        Leave a Review · قيم هذا المنتج
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Timeline */}
                            <section className="bg-primary-fixed p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                                <div className="flex items-center gap-4 mb-12 relative z-10">
                                    <div className="flex flex-col">
                                        <h3 className="text-2xl font-black italic tracking-tighter text-on-primary-fixed uppercase">Order Status</h3>
                                        <span className="text-sm font-bold text-on-primary-fixed-variant" style={{ fontFamily: "'Cairo', sans-serif" }}>حالة الطلب</span>
                                    </div>
                                </div>
                                <div className="space-y-12 relative z-10">
                                    {/* Point 1 */}
                                    <div className="flex gap-8 items-start relative">
                                        <div className="absolute left-[19px] top-10 bottom-[-48px] w-[2px] bg-primary/20" />
                                        <div className="z-10 w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 flex justify-between items-start">
                                            <BiText en="Order Placed" ar="تم الطلب" className="text-on-primary-fixed" />
                                            <span className="text-[9px] font-black text-on-primary-fixed-variant opacity-60 uppercase italic">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {/* Point 2 */}
                                    <div className="flex gap-8 items-start relative">
                                        <div className="absolute left-[19px] top-10 bottom-[-48px] w-[2px] bg-primary/20" />
                                        <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl transition-all ${['processing', 'shipped', 'delivered', 'completed'].includes(order.status?.toLowerCase()) ? 'bg-primary text-white' : 'bg-white/50 border border-primary/20 text-primary opacity-40'}`}>
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <BiText en="Processing" ar="جاري التجهيز" className={['processing', 'shipped', 'delivered', 'completed'].includes(order.status?.toLowerCase()) ? 'text-on-primary-fixed' : 'opacity-40'} />
                                        </div>
                                    </div>
                                    {/* Point 3 */}
                                    <div className="flex gap-8 items-start relative">
                                        <div className="absolute left-[19px] top-10 bottom-[-48px] w-[2px] bg-primary/20" />
                                        <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl transition-all ${['shipped', 'delivered', 'completed'].includes(order.status?.toLowerCase()) ? 'bg-primary text-white' : 'bg-white/50 border border-primary/20 text-primary opacity-40'}`}>
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <BiText en="Shipped" ar="تم الشحن" className={['shipped', 'delivered', 'completed'].includes(order.status?.toLowerCase()) ? 'text-on-primary-fixed' : 'opacity-40'} />
                                        </div>
                                    </div>
                                    {/* Point 4 */}
                                    <div className="flex gap-8 items-start">
                                        <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center shadow-xl transition-all ${['delivered', 'completed'].includes(order.status?.toLowerCase()) ? 'bg-primary text-white' : 'bg-white/50 border border-primary/20 text-primary opacity-40'}`}>
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <BiText en="Delivered" ar="تم التوصيل" className={['delivered', 'completed'].includes(order.status?.toLowerCase()) ? 'text-on-primary-fixed' : 'opacity-40'} />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-10 lg:sticky lg:top-40">

                            {/* Summary */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-outline-variant/10 space-y-8">
                                <div className="flex flex-col border-b border-outline-variant/5 pb-6">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Order Summary</h3>
                                    <span className="text-sm font-bold text-zinc-300" style={{ fontFamily: "'Cairo', sans-serif" }}>ملخص الحساب</span>
                                </div>
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center">
                                        <BiText en="Subtotal" ar="المجموع" sub />
                                        <span className="text-sm font-black italic tabular-nums">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <BiText en="Shipping" ar="الشحن" sub />
                                        <span className="text-sm font-black italic text-emerald-600 tabular-nums">${parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <BiText en="Tax" ar="الضريبة" sub />
                                        <span className="text-sm font-black italic tabular-nums">${parseFloat(order.tax || 0).toFixed(2)}</span>
                                    </div>
                                    {parseFloat(order.discount || 0) > 0 && (
                                        <div className="flex justify-between items-center text-rose-500">
                                            <BiText en="Discount" ar="الخصم" sub />
                                            <span className="text-sm font-black italic tabular-nums">-${parseFloat(order.discount || 0).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-end pt-8 border-t border-outline-variant/10">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black uppercase italic tracking-tighter leading-none">Total</span>
                                        <span className="text-sm font-bold text-zinc-300" style={{ fontFamily: "'Cairo', sans-serif" }}>الإجمالي</span>
                                    </div>
                                    <span className="text-4xl font-black text-primary italic tracking-tighter tabular-nums leading-none">${parseFloat(order.total || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-surface-container-high p-10 rounded-[3rem] space-y-6">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <MapPin className="w-5 h-5" />
                                    <BiText en="Delivery Address" ar="عنوان التوصيل" sub />
                                </div>
                                <div className="space-y-2">
                                    <p className="font-extrabold text-lg uppercase italic text-on-surface leading-tight">{order.shipping_address?.full_name}</p>
                                    <p className="text-xs font-medium text-on-surface-variant italic leading-relaxed">
                                        {order.shipping_address?.address_line1}<br />
                                        {order.shipping_address?.city}, {order.shipping_address?.state}<br />
                                        {order.shipping_address?.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Payment */}
                            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-outline-variant/10 space-y-6">
                                <div className="flex items-center gap-3 text-primary mb-2">
                                    <CreditCard className="w-5 h-5" />
                                    <BiText en="Payment Method" ar="طريقة الدفع" sub />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-on-surface rounded-2xl flex items-center justify-center">
                                        <ShieldCheck className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-xs uppercase italic tracking-widest text-on-surface">{order.payment_method}</span>
                                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest italic opacity-60">Verified · مؤكد</span>
                                    </div>
                                </div>
                            </div>

                            {/* Support */}
                            <button className="w-full p-8 border-2 border-dashed border-outline-variant rounded-[3rem] text-center hover:bg-white transition-all">
                                <BiText en="Need Help?" ar="تحتاج مساعدة؟" className="items-center" />
                                <span className="text-xs font-black text-primary italic block mt-3 uppercase tracking-widest">Contact Support · تواصل معنا</span>
                            </button>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Review Modal */}
            {reviewingProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-4xl overflow-hidden animate-in zoom-in-95 duration-500">
                        <div className="p-10 border-b border-outline-variant/10 flex justify-between items-center bg-[#fcf8f9]">
                            <BiText en="Write a Review" ar="اكتب تقييمك للمنتج" />
                            <button onClick={() => setReviewingProduct(null)} className="w-12 h-12 flex items-center justify-center bg-white rounded-full hover:bg-primary hover:text-white transition-all shadow-xl">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="flex items-center gap-6 bg-[#fcf8f9] p-6 rounded-[2rem]">
                                <img src={reviewingProduct.image_url} className="w-16 h-20 object-cover rounded-2xl shadow-lg" alt="" />
                                <h4 className="text-lg font-black uppercase italic text-on-surface">{reviewingProduct.name}</h4>
                            </div>

                            <div className="space-y-4">
                                <BiText en="Rating" ar="التقييم" />
                                <div className="flex gap-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}>
                                            <Star className={`w-10 h-10 ${reviewForm.rating >= star ? 'text-primary fill-primary' : 'text-zinc-100'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <BiText en="Review Title" ar="عنوان التقييم" sub />
                                <input
                                    className="w-full bg-[#fcf8f9] border-none rounded-full px-8 py-5 text-sm font-bold focus:ring-2 focus:ring-primary shadow-inner"
                                    placeholder="Summarize... ملخص التقييم"
                                    value={reviewForm.title}
                                    onChange={e => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-4">
                                <BiText en="Details" ar="التفاصيل" sub />
                                <textarea
                                    rows="4"
                                    className="w-full bg-[#fcf8f9] border-none rounded-[2rem] px-8 py-6 text-sm font-medium focus:ring-2 focus:ring-primary shadow-inner resize-none"
                                    placeholder="Your experience... تجربتك مع المنتج"
                                    value={reviewForm.body}
                                    onChange={e => setReviewForm(prev => ({ ...prev, body: e.target.value }))}
                                />
                            </div>

                            <button
                                onClick={() => reviewMutation.mutate(reviewForm)}
                                disabled={reviewMutation.isPending || !reviewForm.title || !reviewForm.body}
                                className="w-full bg-primary text-white py-6 rounded-full text-xs font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary/40 transition-all flex items-center justify-center gap-4 italic"
                            >
                                {reviewMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                Submit Review · إرسال التقييم
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetailsPage;
