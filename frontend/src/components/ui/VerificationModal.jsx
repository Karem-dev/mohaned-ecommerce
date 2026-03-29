import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ShieldAlert, Send, ArrowRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { resendOTP } from '../../services/authService';

const VerificationModal = ({ isOpen, onClose, email }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const resendMutation = useMutation({
        mutationFn: () => resendOTP(email),
        onSuccess: () => {
            toast.success('Security protocol dispatched to your email.');
            // Pass the current location so we can return here after verification
            navigate('/verify-otp', { state: { email, from: location.pathname } });
            onClose();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to dispatch security protocol.');
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-0">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-outline-variant/10 animate-in fade-in zoom-in duration-300">
                
                {/* Visual Header */}
                <div className="bg-primary/5 h-32 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary rounded-full blur-3xl -ml-16 -mb-16" />
                    </div>
                    
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center relative z-10 border border-primary/10">
                        <ShieldAlert className="w-8 h-8 text-primary" />
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/50 hover:bg-white text-on-surface-variant transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-10 space-y-8">
                    <div className="text-center space-y-3">
                        <h3 className="text-2xl font-black tracking-tight text-on-surface uppercase italic leading-none">
                            Identity Validation Required
                        </h3>
                        <p className="text-sm font-medium text-on-surface-variant italic leading-relaxed">
                            To ensure the security of your account, please verify your email address before proceeding with your curation.
                        </p>
                    </div>

                    <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/10 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                            <span className="material-symbols-outlined text-primary text-xl">alternate_email</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">Packet destination:</p>
                            <p className="text-xs font-bold text-on-surface truncate">{email}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={() => resendMutation.mutate()}
                            disabled={resendMutation.isPending}
                            className="w-full py-5 bg-primary text-white rounded-full text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {resendMutation.isPending ? (
                                <span className="animate-pulse">Dispatching...</span>
                            ) : (
                                <>
                                    <span>Initialize Verification</span>
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant hover:text-primary transition-colors italic"
                        >
                            Review Curations
                        </button>
                    </div>
                </div>

                {/* Footer Decal */}
                <div className="p-4 bg-surface-container-low border-t border-outline-variant/5 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-300 italic">
                        Radiant Curation Security Protocol · Alpha-9
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
