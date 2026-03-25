import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    User, 
    Settings, 
    ShoppingBag, 
    Heart, 
    LogOut, 
    ShieldCheck, 
    Camera, 
    Bell, 
    ChevronRight,
    Loader2,
    Calendar,
    Mail,
    Phone,
    MapPin,
    CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../services/axiosInstance';
import useAuthStore from '../store/authStore';

const ProfilePage = () => {
    const { user, token, setUser, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data) => axiosInstance.put('/profile', data),
        onSuccess: (res) => {
            setUser(res.data.user || res.data);
            setIsEditing(false);
            toast.success('Your profile has been updated.');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile.')
    });

    const avatarMutation = useMutation({
        mutationFn: (formData) => axiosInstance.post('/profile/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: (res) => {
            setUser(res.data.user || res.data);
            toast.success('Avatar updated successfully.');
        }
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const fd = new FormData();
            fd.append('avatar', file);
            avatarMutation.mutate(fd);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        toast.success('Logged out successfully');
    };


    return (
        <div className="min-h-screen bg-white pt-32 pb-40 font-manrope selection:bg-slate-950 selection:text-white">
            <main className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                {/* Left Sidebar Navigation */}
                <aside className="lg:col-span-3 space-y-12">
                    <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10 space-y-8 flex flex-col items-center text-center">
                            <div className="relative group/avatar">
                                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-white border-2 border-slate-100 shadow-xl shadow-slate-900/5 transition-transform group-hover/avatar:scale-105">
                                    <img 
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0f172a&color=fff`} 
                                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" 
                                        alt={user?.name} 
                                    />
                                </div>
                                <label className="absolute bottom-0 right-0 w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors shadow-2xl scale-0 group-hover/avatar:scale-100 transition-all">
                                    <Camera className="w-5 h-5" />
                                    <input type="file" className="hidden" onChange={handleAvatarChange} />
                                </label>
                            </div>
                            
                            <div>
                                <h2 className="text-3xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">{user?.name}</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2 opacity-60">Verified Member</p>
                            </div>
                        </div>
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-950 opacity-0 group-hover:opacity-5 -translate-y-1/2 translate-x-1/2 rounded-full blur-2xl transition-all duration-700" />
                    </div>

                    <nav className="space-y-2">
                        {[
                            { icon: User, label: 'Profile Settings', path: '/profile' },
                            { icon: ShoppingBag, label: 'My Orders', path: '/orders' },
                            { icon: Heart, label: 'My Wishlist', path: '/wishlist' },
                            { icon: CreditCard, label: 'Stored Payments', path: '/profile/billing' },
                            { icon: MapPin, label: 'Addresses', path: '/profile/address' },
                            { icon: Bell, label: 'Notifications', path: '/profile/notifications' },
                        ].map((item, i) => {
                            const isActive = location.pathname === item.path || (item.path === '/profile' && location.pathname === '/profile/');
                            return (
                                <Link 
                                    key={i} 
                                    to={item.path}
                                    className={`flex items-center gap-4 px-8 py-4 rounded-2xl transition-all group ${isActive ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20 translate-x-2' : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'italic' : ''}`}>{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto text-amber-400" />}
                                </Link>
                            );
                        })}
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-4 px-8 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all group mt-8"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">Sign Out Account</span>
                        </button>
                    </nav>
                </aside>

                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-16">
                    
                    {/* Welcome Banner */}
                    <div className="relative p-12 lg:p-20 bg-slate-950 rounded-[3rem] overflow-hidden text-white shadow-3xl">
                        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-12">
                            <div className="space-y-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400 italic">Member Dashboard</span>
                                <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]">Personal settings</h1>
                                <p className="text-slate-400 text-lg font-medium italic max-w-lg">Manage your account preferences, contact information and security details directly from this portal.</p>
                            </div>
                            <div className="flex -space-x-4 opacity-30 hover:opacity-100 transition-opacity duration-1000">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-16 h-16 rounded-full border-4 border-slate-950 bg-slate-900 shadow-xl" />
                                ))}
                            </div>
                        </div>
                        {/* Abstract Background Shapes */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
                    </div>

                    {/* Profile Information Block */}
                    <div className="bg-white p-10 lg:p-16 rounded-[3rem] border border-slate-100 shadow-sm space-y-16">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-950">Basic Information</h3>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Manage your core identity details here</p>
                            </div>
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-slate-950 text-white hover:bg-slate-800 shadow-xl'}`}
                            >
                                {isEditing ? 'Cancel Edit' : 'Edit Information'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Form Input Item */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">
                                    <User className="w-4 h-4" /> Full Display Name
                                </label>
                                <input 
                                    disabled={!isEditing}
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className={`w-full px-8 py-5 rounded-2xl text-sm font-bold tracking-tight outline-none border transition-all ${isEditing ? 'bg-white border-slate-200 focus:ring-4 focus:ring-slate-950/5 focus:border-slate-950 shadow-inner' : 'bg-slate-50 border-transparent text-slate-500 font-black italic'}`} 
                                    type="text" 
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">
                                    <Mail className="w-4 h-4" /> Registered Email Address
                                </label>
                                <input 
                                    disabled={!isEditing}
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className={`w-full px-8 py-5 rounded-2xl text-sm font-bold tracking-tight outline-none border transition-all ${isEditing ? 'bg-white border-slate-200 focus:ring-4 focus:ring-slate-950/5 focus:border-slate-950 shadow-inner' : 'bg-slate-50 border-transparent text-slate-500 font-black italic'}`} 
                                    type="email" 
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">
                                    <Phone className="w-4 h-4" /> Contact Phone Number
                                </label>
                                <input 
                                    disabled={!isEditing}
                                    value={formData.phone}
                                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    className={`w-full px-8 py-5 rounded-2xl text-sm font-bold tracking-tight outline-none border transition-all ${isEditing ? 'bg-white border-slate-200 focus:ring-4 focus:ring-slate-950/5 focus:border-slate-950 shadow-inner' : 'bg-slate-50 border-transparent text-slate-500 font-black italic'}`} 
                                    type="tel" 
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 italic ml-2">
                                    <Calendar className="w-4 h-4" /> Registry Date
                                </label>
                                <div className="w-full px-8 py-5 rounded-2xl bg-slate-50 text-slate-300 font-black italic text-sm border border-transparent">
                                    {new Date(user?.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="pt-12 border-t border-slate-50 flex justify-end">
                                <button 
                                    onClick={() => updateProfileMutation.mutate(formData)}
                                    disabled={updateProfileMutation.isPending}
                                    className="px-16 py-6 bg-slate-950 text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-3xl shadow-3xl hover:bg-slate-800 transition-all flex items-center gap-4 italic active:scale-95 disabled:opacity-50"
                                >
                                    {updateProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5 text-amber-400" />}
                                    Commit Changes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { label: 'Total Acquisitions', value: '12 Items', icon: ShoppingBag, color: 'text-indigo-500' },
                            { label: 'Observation List', value: '4 Saved', icon: Heart, color: 'text-rose-500' },
                            { label: 'Verified Status', value: 'Pro Tier', icon: ShieldCheck, color: 'text-emerald-500' },
                        ].map((stat, i) => (
                            <div key={i} className="p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] shadow-sm hover:translate-y-[-5px] transition-all group cursor-default">
                                <stat.icon className={`w-10 h-10 ${stat.color} mb-6 transition-transform group-hover:scale-110`} />
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">{stat.label}</span>
                                    <p className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Security Insight */}
                    <div className="p-12 bg-indigo-50 rounded-[3rem] border border-indigo-100 flex flex-col md:flex-row items-center gap-10">
                        <div className="w-20 h-20 bg-indigo-500 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl shadow-indigo-500/20">
                            <Settings className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1 space-y-2">
                             <h4 className="text-xl font-black text-indigo-950 uppercase italic tracking-tight">Security & Protocol</h4>
                             <p className="text-indigo-600/60 text-xs font-medium italic max-w-xl">Your account access is currently protected by standard encryption protocols. To enhance your security, we recommend regular password rotation and multi-factor authentication.</p>
                        </div>
                        <Link to="/profile/security">
                            <button className="whitespace-nowrap px-10 py-5 bg-white text-indigo-950 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                Change Password
                            </button>
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
