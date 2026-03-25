import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, 
    Package, 
    Truck, 
    CreditCard, 
    User, 
    MapPin, 
    Clock,
    CheckCircle2,
    Calendar,
    Printer,
    Mail,
    Phone,
    FileText,
    ExternalLink,
    AlertCircle,
    ArrowRight,
    Zap,
    Check
} from 'lucide-react';
import { getAdminOrder, addOrderTracking, updateAdminOrderStatus } from '../services/adminService';
import { toast } from 'react-hot-toast';

const AdminOrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isEditingTracking, setIsEditingTracking] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');

    const { data: orderResp, isLoading, isError } = useQuery({
        queryKey: ['adminOrder', id],
        queryFn: () => getAdminOrder(id),
    });

    const order = orderResp?.data || orderResp;

    const statusMutation = useMutation({
        mutationFn: (newStatus) => updateAdminOrderStatus({ id, status: newStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminOrder', id]);
            toast.success('Order status updated successfully.');
        },
        onError: () => toast.error('Failed to update status.')
    });

    const trackingMutation = useMutation({
        mutationFn: (num) => addOrderTracking(id, num),
        onSuccess: () => {
            queryClient.invalidateQueries(['adminOrder', id]);
            setIsEditingTracking(false);
            toast.success('Tracking number updated.');
        },
        onError: () => toast.error('Failed to update tracking.')
    });

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center py-40 gap-8 min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
            <p className="font-bold text-slate-400 text-sm">Loading order details...</p>
        </div>
    );

    if (isError || !order) return (
        <div className="text-center py-40 bg-white rounded-3xl border border-slate-100 shadow-sm mx-10">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-900">Order Not Found</h3>
            <Link to="/admin/orders" className="mt-8 inline-block px-10 py-4 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-lg">Return to Table</Link>
        </div>
    );

    const getStatusStyles = (s) => {
        switch (s?.toLowerCase()) {
            case 'pending': return "bg-amber-50 text-amber-600 border-amber-100";
            case 'processing': return "bg-blue-50 text-blue-600 border-blue-100";
            case 'shipped': return "bg-indigo-50 text-indigo-600 border-indigo-100";
            case 'delivered': return "bg-green-50 text-green-600 border-green-100";
            case 'completed': return "bg-emerald-50 text-emerald-600 border-emerald-100";
            case 'cancelled': return "bg-red-50 text-red-600 border-red-100";
            default: return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    return (
        <div className="space-y-12 pb-24 font-manrope">
            
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
               <div className="space-y-4">
                  <button onClick={() => navigate('/admin/orders')} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-all group">
                     <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Orders
                  </button>
                  <div className="flex flex-wrap items-center gap-6">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none italic uppercase">Order #{order.order_number}</h1>
                    <span className={`px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                        {order.status}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Placed on: {new Date(order.created_at).toLocaleString()}
                  </p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="relative group">
                    <select 
                        className="appearance-none px-8 py-3.5 rounded-xl border font-bold text-[11px] uppercase tracking-widest outline-none transition-all cursor-pointer bg-white shadow-sm hover:shadow-md pr-12"
                        value={order.status}
                        onChange={(e) => statusMutation.mutate(e.target.value)}
                    >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ArrowRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                  <a 
                    href={`${import.meta.env.VITE_API_URL}/admin/orders/${order.id}/invoice`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 bg-white rounded-xl border border-slate-100 text-slate-900 hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                  >
                     <Printer className="w-5 h-5" />
                  </a>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                
                {/* Order Items Table */}
                <div className="lg:col-span-2 space-y-12">
                   <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                      <div className="px-10 py-8 border-b border-slate-50 flex items-center gap-4">
                         <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100">
                            <Package className="w-5 h-5" />
                         </div>
                         <div>
                            <h3 className="text-lg font-bold text-slate-900">Order Items</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Products included in this transaction</p>
                         </div>
                      </div>
                      
                      <div className="divide-y divide-slate-50">
                         {order.items?.map((item) => (
                            <div key={item.id} className="p-10 flex flex-col sm:flex-row items-center justify-between gap-10 group hover:bg-slate-50/50 transition-all">
                               <div className="flex items-center gap-8">
                                   <div className="w-24 h-32 bg-white rounded-2xl overflow-hidden border border-slate-100 group-hover:scale-105 transition-transform duration-500 shadow-sm">
                                     <img src={item.product?.image_url} className="w-full h-full object-cover" alt="" />
                                  </div>
                                  <div className="space-y-3">
                                     <h4 className="text-xl font-black text-slate-900 tracking-tighter leading-tight">{item.name}</h4>
                                     <div className="flex flex-col gap-2 opacity-60">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <FileText className="w-3 h-3" /> SKU: {item.product?.sku || 'N/A'}
                                        </p>
                                        <div className="flex gap-2">
                                            {item.variant?.color && <span className="text-[9px] font-bold uppercase tracking-widest bg-slate-900 text-white px-3 py-1 rounded-md">{item.variant.color}</span>}
                                            {item.variant?.size && <span className="text-[9px] font-bold uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-md border border-slate-200">{item.variant.size}</span>}
                                        </div>
                                     </div>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 italic">{item.quantity} Units</p>
                                  <p className="text-3xl font-black text-slate-900 tabular-nums leading-none tracking-tighter">${parseFloat(item.total || 0).toFixed(2)}</p>
                               </div>
                            </div>
                         ))}
                      </div>

                      {/* Financial Detail Summary */}
                      <div className="p-10 bg-slate-50 border-t border-slate-100">
                         <div className="space-y-5 max-w-sm ml-auto">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 italic">
                                <span>Subtotal</span>
                                <span className="text-slate-900 font-black">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 italic">
                                <span>Shipping Fee</span>
                                <span className="text-slate-900 font-black">${parseFloat(order.shipping_cost || 0).toFixed(2)}</span>
                            </div>
                            {parseFloat(order.discount || 0) > 0 && (
                                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-600 italic">
                                    <span>Applied Discount</span>
                                    <span className="font-black">-${parseFloat(order.discount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-900 italic">Order Total</span>
                                <span className="text-5xl font-black text-slate-900 italic tracking-tighter tabular-nums leading-none">${parseFloat(order.total || 0).toFixed(2)}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-12">
                   
                   {/* Delivery & Shipping Info */}
                   <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-10 shadow-xl relative overflow-hidden group">
                      <Truck className="absolute -top-10 -right-10 w-40 h-40 text-white opacity-5 group-hover:rotate-12 transition-transform duration-1000" />
                      
                      <div className="flex items-center gap-4 border-b border-white/10 pb-8">
                         <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/10">
                            <Truck className="w-5 h-5" />
                         </div>
                         <h3 className="text-lg font-bold tracking-tight uppercase italic text-white">Shipping Log</h3>
                      </div>

                      <div className="space-y-10 relative z-10">
                         <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                                <User className="w-3 h-3" /> Consignee
                            </p>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                                <p className="text-lg font-black uppercase italic tracking-tighter text-white">{order.shipping_address?.full_name || 'GUEST'}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                    <Phone className="w-3 h-3" /> {order.shipping_address?.phone || 'NOT_PROVIDED'}
                                </p>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                                <MapPin className="w-3 h-3" /> Delivery Address
                            </p>
                            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-xs leading-relaxed text-slate-300 font-bold uppercase tracking-widest">
                                {order.shipping_address?.address_line1},<br />
                                {order.shipping_address?.city}, {order.shipping_address?.state}<br />
                                {order.shipping_address?.country} [{order.shipping_address?.zip}]
                            </div>
                         </div>

                         <div className="space-y-4 pt-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 italic">
                                <Zap className="w-3 h-3 text-amber-500" /> Tracking Information
                            </p>
                            {!isEditingTracking ? (
                                <div className="flex items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group/trk" onClick={() => { setTrackingNumber(order.tracking_number || ''); setIsEditingTracking(true); }}>
                                    <p className="text-lg font-black text-white italic tracking-tighter leading-none">{order.tracking_number || 'STILL_OFFLINE'}</p>
                                    <button className="text-[9px] font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
                                        Record Tracking <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input 
                                        autoFocus
                                        className="bg-white/10 border border-white/20 rounded-xl px-5 py-3 text-xs text-white outline-none w-full focus:ring-1 focus:ring-white/30 italic"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter Tracking ID..."
                                    />
                                    <button 
                                        onClick={() => trackingMutation.mutate(trackingNumber)}
                                        className="px-5 bg-white text-slate-900 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                         </div>
                      </div>
                   </div>

                   {/* Payment Status Info */}
                   <div className="bg-white rounded-[3rem] p-10 border border-slate-100 space-y-10 shadow-sm relative group hover:shadow-md transition-all">
                      <CreditCard className="absolute -bottom-10 -left-10 w-40 h-40 text-slate-50 group-hover:-rotate-6 transition-transform duration-1000" />
                      
                      <div className="flex items-center gap-4 border-b border-slate-50 pb-8">
                         <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-900 border border-slate-100">
                            <CreditCard className="w-5 h-5" />
                         </div>
                         <h3 className="text-lg font-bold text-slate-900 tracking-tight uppercase italic">Payment Intel</h3>
                      </div>

                      <div className="space-y-6 relative z-10">
                         <div className="flex items-center justify-between py-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Method</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">{order.payment_method?.replace('_',' ')}</span>
                         </div>
                         <div className="flex items-center justify-between py-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Customer Email</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 truncate max-w-[150px]">{order.user?.email}</span>
                         </div>
                         <div className={`mt-8 p-6 rounded-2xl flex items-center justify-center gap-3 border text-[10px] font-black uppercase tracking-widest italic transition-all ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                            {order.payment_status === 'paid' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            Status: {order.payment_status}
                         </div>
                      </div>
                   </div>

                </div>

            </div>
        </div>
    );
};

export default AdminOrderDetail;
