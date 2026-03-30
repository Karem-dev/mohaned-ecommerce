import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Camera,
    Loader2,
    Lock,
    Shield
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../services/axiosInstance';
import useAuthStore from '../store/authStore';
import VerificationModal from '../components/ui/VerificationModal';

const ProfilePage = () => {
    const { user, token, setUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const { data: statsData } = useQuery({
        queryKey: ['userStats'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/profile/stats');
            return data;
        },
        enabled: !!token
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data) => axiosInstance.put('/profile', data),
        onSuccess: (res) => {
            const { user: updatedUser, requires_verification } = res.data;
            setUser(updatedUser || res.data);
            setIsEditing(false);
            if (requires_verification) {
                setShowVerificationModal(true);
            } else {
                toast.success('Profile updated successfully.');
            }
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Update failed.')
    });

    const avatarMutation = useMutation({
        mutationFn: (fd) => axiosInstance.post('/profile/avatar', fd, {
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

    return (
        <main className="space-y-12 min-w-0">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-outline-variant/20">
                <div>
                    <h1 className="text-4xl font-bold text-on-surface uppercase tracking-tight font-headline italic">My Profile</h1>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-60">Manage your personal information and account security.</p>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-10">
                {/* Information Layer */}
                <div className="lg:col-span-8 space-y-12">
                    
                    {/* Basic Info Module */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-outline-variant/10 shadow-sm relative group">
                        <div className="flex justify-between items-center mb-12">
                            <div>
                                <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] italic mb-1">Personal Information</h2>
                                <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">Your basic identity records</p>
                            </div>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-6 py-3 bg-surface-container-low text-primary text-[9px] font-bold uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all shadow-sm"
                            >
                                {isEditing ? 'Discard Changes' : 'Edit Profile'}
                            </button>
                        </div>

                        <div className="space-y-8">
                            {[
                                { label: "Full Name", key: "name", icon: <User className="w-4 h-4" /> },
                                { label: "Email Address", key: "email", icon: <Mail className="w-4 h-4" />, type: "email" },
                                { label: "Phone Number", key: "phone", icon: <Phone className="w-4 h-4" />, type: "tel" },
                            ].map((field) => (
                                <div key={field.key} className="flex flex-col md:flex-row md:items-center gap-6 md:gap-16 pb-8 border-b border-outline-variant/5 last:border-b-0 group/field">
                                    <div className="w-44 shrink-0 px-2">
                                        <div className="flex items-center gap-2.5 mb-1 text-on-surface-variant/40 group-hover/field:text-primary transition-colors">
                                            {field.icon}
                                            <span className="text-[9px] font-bold uppercase tracking-widest">{field.label}</span>
                                        </div>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type={field.type || 'text'}
                                            className="flex-1 bg-surface-container-low rounded-2xl px-6 py-4 text-[11px] font-bold text-on-surface border border-outline-variant/10 focus:border-primary/40 focus:bg-white transition-all tracking-wider"
                                            value={formData[field.key]}
                                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                            placeholder={`Enter ${field.label}`}
                                        />
                                    ) : (
                                        <p className="flex-1 text-[11px] font-bold text-on-surface tracking-wider pl-4">{formData[field.key] || 'Not provided'}</p>
                                    )}
                                </div>
                            ))}

                            {isEditing && (
                                <div className="pt-8 flex justify-end">
                                    <button
                                        onClick={() => updateProfileMutation.mutate(formData)}
                                        disabled={updateProfileMutation.isPending}
                                        className="flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 italic"
                                    >
                                        {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Security Hub Module */}
                    <section className="bg-white rounded-[2.5rem] p-10 border border-outline-variant/10 shadow-sm">
                        <div className="mb-12">
                            <h2 className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] italic mb-1">Security Settings</h2>
                            <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest opacity-40">Update your account credentials</p>
                        </div>

                        <div className="space-y-10">
                             <div className="grid md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                     <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 ml-2">New Password</label>
                                     <div className="relative group">
                                         <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
                                         <input 
                                            type="password" 
                                            placeholder="••••••••"
                                            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-bold focus:border-primary/40 focus:bg-white transition-all"
                                         />
                                     </div>
                                 </div>
                                 <div className="space-y-4">
                                     <label className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60 ml-2">Confirm Password</label>
                                     <div className="relative group">
                                         <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
                                         <input 
                                            type="password" 
                                            placeholder="••••••••"
                                            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 pl-14 pr-6 text-[11px] font-bold focus:border-primary/40 focus:bg-white transition-all"
                                         />
                                     </div>
                                 </div>
                             </div>
                             <div className="flex justify-end">
                                <button className="px-10 py-4 border-2 border-primary text-primary text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-primary hover:text-white transition-all italic">
                                    Update Password
                                </button>
                             </div>
                        </div>
                    </section>
                </div>

                {/* Vertical Visualizer */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-white rounded-[3rem] p-10 border border-outline-variant/10 shadow-sm text-center">
                        <div className="relative inline-block group mb-8">
                            <div className="w-40 h-40 rounded-[3.5rem] bg-surface-container-low border border-outline-variant/10 overflow-hidden p-1.5 shadow-inner">
                                <img
                                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                                    className="w-full h-full object-cover rounded-[3.2rem]"
                                    alt={user?.name}
                                    onError={(e) => {
                                        console.error('Profile Page Avatar failed to load:', user?.avatar);
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name)}&background=random&color=fff`;
                                    }}
                                />
                            </div>
                            <label className="absolute bottom-2 right-2 w-12 h-12 bg-white shadow-2xl rounded-2xl flex items-center justify-center text-primary cursor-pointer hover:rotate-12 hover:scale-110 active:scale-95 transition-all border border-outline-variant/10">
                                <Camera className="w-5 h-5" />
                                <input type="file" className="hidden" onChange={handleAvatarChange} />
                            </label>
                        </div>
                        <h3 className="text-xl font-bold text-on-surface tracking-tighter uppercase italic leading-none">{user?.name}</h3>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mt-3 italic opacity-60">Verified Identity</p>
                    </div>

                    <div className="bg-on-surface rounded-[3rem] p-10 border border-outline-variant/5 text-center space-y-8 relative overflow-hidden group shadow-2xl shadow-on-surface/20">
                         <div className="relative z-10 space-y-2">
                             <p className="text-5xl font-black text-primary tabular-nums tracking-tighter italic">{statsData?.orders_count || user?.stats?.orders_count || '0'}</p>
                             <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] italic">Confirmed Orders</p>
                         </div>
                         <div className="h-1 bg-white/5 rounded-full overflow-hidden relative z-10 mx-6">
                             <div className="h-full bg-primary w-2/3 shadow-glow animate-pulse" />
                         </div>
                         <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest leading-relaxed italic relative z-10 px-4">Top 10% of global shop activities documented this month.</p>
                         <Shield className="absolute -bottom-6 -left-6 w-32 h-32 text-primary opacity-5 group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                </div>
            </div>

            <VerificationModal
                isOpen={showVerificationModal}
                onClose={() => setShowVerificationModal(false)}
                email={formData.email}
            />
        </main>
    );
};

export default ProfilePage;
