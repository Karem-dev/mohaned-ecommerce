import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Settings,
    Globe,
    Mail,
    Palette,
    Bell,
    Save,
    RefreshCcw,
    Shield,
    Database,
    Zap,
    Lock,
    ShieldCheck,
    Truck,
    CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getAdminSettings, saveAdminSettings } from '../services/adminService';

const AdminSettings = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        site_name: '',
        contact_email: '',
        primary_color: '#b0004a',
        currency: 'USD',
        allow_registration: true,
        maintenance_mode: false,
        order_notifications: true,
        user_notifications: true,
        inventory_alerts: true
    });

    const { data: settingsResp, isLoading } = useQuery({
        queryKey: ['adminSettings'],
        queryFn: getAdminSettings,
        onSuccess: (data) => {
            if (data?.data) {
                setFormData(prev => ({ ...prev, ...data.data }));
            }
        }
    });

    useEffect(() => {
        if (settingsResp?.data) {
            setFormData(prev => ({ ...prev, ...settingsResp.data }));
        }
    }, [settingsResp]);

    const saveMutation = useMutation({
        mutationFn: saveAdminSettings,
        onSuccess: () => {
            queryClient.invalidateQueries(['adminSettings']);
            toast.success('System configuration updated');
            // Apply site name to document title
            document.title = `${formData.site_name} | Admin Panel`;
            // Apply Primary Color to root element
            document.documentElement.style.setProperty('--color-primary', formData.primary_color);
        },
        onError: () => toast.error('Failed to save configuration')
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    if (isLoading) return (
        <div className="pt-40 pb-40 text-center bg-surface min-h-screen">
            <div className="w-12 h-12 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-8 shadow-sm"></div>
            <p className="font-bold text-on-surface-variant uppercase tracking-[0.2em] text-[10px] italic">Loading Platform Config...</p>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-12 pb-24 font-body antialiased">
            
            {/* Header Area */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-outline-variant/20 pb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest">
                        <Settings className="w-4 h-4" />
                        Infrastructure Console
                    </div>
                    <h1 className="text-4xl lg:text-6xl font-bold text-on-surface tracking-tighter uppercase font-headline italic leading-none">
                        Platform <span className="text-primary italic">Settings</span>
                    </h1>
                    <p className="text-on-surface-variant text-base font-medium italic opacity-70">Oversee global data, styling preferences, and system behavior.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        type="submit" 
                        disabled={saveMutation.isPending}
                        className="px-12 py-5 bg-on-surface text-white rounded-full font-bold text-[10px] uppercase tracking-widest italic hover:bg-primary transition-all shadow-xl shadow-on-surface/10 flex items-center gap-3 group"
                    >
                        {saveMutation.isPending ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Persist Changes
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Core Configuration Side (2/3) */}
                <div className="lg:col-span-8 space-y-12">
                    
                    {/* General Settings Section */}
                    <section className="bg-white rounded-[3rem] p-10 border border-outline-variant/20 shadow-sm space-y-10 group/gen">
                        <div className="flex items-center gap-5 border-b border-outline-variant/5 pb-8">
                            <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary border border-outline-variant/10 shadow-sm group-hover/gen:scale-110 transition-transform">
                                <Globe className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold italic tracking-tighter uppercase font-headline text-on-surface">General Records</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">Identity Identifier (Site Name)</label>
                                <input
                                    name="site_name"
                                    value={formData.site_name}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl px-8 py-4 text-[11px] font-bold outline-none focus:ring-4 focus:ring-primary/5 italic"
                                    placeholder="Rose E-commerce"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">Primary Communication (Email)</label>
                                <input
                                    name="contact_email"
                                    value={formData.contact_email}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl px-8 py-4 text-[11px] font-bold outline-none focus:ring-4 focus:ring-primary/5 italic"
                                    placeholder="support@rose.com"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Aesthetic & Theming Section */}
                    <section className="bg-white rounded-[3rem] p-10 border border-outline-variant/20 shadow-sm space-y-10 group/style">
                        <div className="flex items-center gap-5 border-b border-outline-variant/5 pb-8">
                            <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary border border-outline-variant/10 shadow-sm group-hover/style:scale-110 transition-transform">
                                <Palette className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold italic tracking-tighter uppercase font-headline text-on-surface">Theme Orchestration</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="flex items-center gap-6 p-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/10">
                                <input
                                    type="color"
                                    name="primary_color"
                                    value={formData.primary_color}
                                    onChange={handleChange}
                                    className="w-16 h-16 rounded-full border-4 border-white shadow-xl cursor-pointer"
                                />
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-on-surface uppercase italic">Primary Tone</p>
                                    <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Global brand highlight</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">Operational Currency</label>
                                <select 
                                    name="currency"
                                    value={formData.currency}
                                    onChange={handleChange}
                                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl px-8 py-4 text-[11px] font-bold outline-none cursor-pointer italic"
                                >
                                    <option value="USD">USD - International</option>
                                    <option value="EUR">EUR - European</option>
                                    <option value="GBP">GBP - British</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Automation & Alerts Side (1/3) */}
                <div className="lg:col-span-4 space-y-12">
                    
                    {/* Notification Protocols */}
                    <section className="bg-on-surface rounded-[4rem] p-10 text-white space-y-10 shadow-3xl group/notif relative overflow-hidden">
                        <Bell className="absolute -bottom-8 -left-8 w-40 h-40 text-primary/10 group-hover/notif:scale-110 transition-transform duration-1000" />
                        
                        <div className="flex items-center gap-5 border-b border-white/5 pb-8 relative z-10">
                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-primary border border-white/10 shadow-inner group-hover/notif:rotate-12 transition-transform duration-500">
                                <Bell className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold italic tracking-tighter uppercase font-headline">Audit Alerts</h3>
                        </div>

                        <div className="space-y-8 relative z-10">
                            {[
                                { name: 'order_notifications', label: 'Order Acquisitions', icon: Truck },
                                { name: 'user_notifications', label: 'Identity Sign-ups', icon: UserPlus },
                                { name: 'review_notifications', label: 'Review Submissions', icon: Zap }
                            ].map((item) => (
                                <div key={item.name} className="flex items-center justify-between group/toggle">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-[11px] font-bold italic uppercase tracking-widest text-white/50 group-hover/toggle:text-white transition-colors">{item.label}</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            name={item.name}
                                            type="checkbox" 
                                            checked={formData[item.name]} 
                                            onChange={handleChange}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-10 h-6 bg-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Operational Guard Rails */}
                    <section className="bg-white rounded-[3rem] p-10 border border-outline-variant/20 shadow-sm space-y-10 group/ops overflow-hidden">
                        <div className="flex items-center gap-5 border-b border-outline-variant/5 pb-8">
                            <div className="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary border border-outline-variant/10 shadow-sm group-hover/ops:scale-110 transition-transform">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold italic tracking-tighter uppercase font-headline text-on-surface">Platform Logic</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-center justify-between p-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 group-hover/ops:bg-white transition-all">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-on-surface uppercase italic">Allow Registration</p>
                                    <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest italic">New identity intake</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        name="allow_registration"
                                        type="checkbox" 
                                        checked={formData.allow_registration} 
                                        onChange={handleChange}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-10 h-6 bg-surface-container-low peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 group-hover/ops:bg-white transition-all">
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-on-surface uppercase italic">Static Offline Mode</p>
                                    <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest italic">Immediate maintenance</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        name="maintenance_mode"
                                        type="checkbox" 
                                        checked={formData.maintenance_mode} 
                                        onChange={handleChange}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-10 h-6 bg-surface-container-low peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                                </label>
                            </div>
                        </div>
                    </section>
                    
                </div>
            </div>
        </form>
    );
};

// Dummy icon for user registrations
const UserPlus = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="16" y1="11" x2="22" y2="11" />
    </svg>
);

export default AdminSettings;
