import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../services/axiosInstance';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);

    const navigate = useNavigate();

    const forgotPasswordMutation = useMutation({
        mutationFn: (data) => axiosInstance.post('/auth/forgot-password', data),
        onSuccess: () => {
            toast.success('Recovery protocol dispatched.');
            setIsSent(true);
            setTimeout(() => {
                navigate('/verify-otp', { state: { email } });
            }, 3000);
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Transmission failure.')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        forgotPasswordMutation.mutate({ email });
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 md:p-8 font-body bg-surface text-on-surface antialiased">
            <div className="w-full max-w-5xl bg-background editorial-shadow rounded-xl overflow-hidden flex min-h-[750px]">
                {/* Left Panel: Branding & Editorial Image */}
                <div className="hidden md:flex md:w-1/2 relative bg-primary-soft overflow-hidden">
                    <img
                        alt="High-end fashion editorial"
                        className="absolute inset-0 w-full h-full object-cover opacity-95 transition-transform duration-1000 hover:scale-110"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa_fIKdvcZ7S9AR_zNyzUrKd7T4HN5TOOJnl2fvIZ-czPrG_OtB-kMLg7DO7TMItE872nbVgmYeepl7yauhyAD_4yXIcVhceYqAWwnCTiJd6AVlARI5kLwOuiPBKxGiUISMZUJFyZTEumcjCEaVxRJ0kx2QqmiSn1lriqMXSlvoZUoXgKclKfMcxtxODgaFv05-9S5KyHVBPuXT7vwT-Jgw59d9g1LmmApBQdJ-KZdQ1mTqS_bh7VxXOD6uYwKDMixzp182QES5XHl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex flex-col justify-end p-16">
                        <h1 className="font-headline text-5xl font-extrabold text-white tracking-tight mb-4 uppercase">Rose GALERIE</h1>
                        <div className="h-1 w-12 bg-white rounded-full mb-6"></div>
                        <p className="font-label text-white/90 text-[10px] uppercase tracking-[0.3em] font-bold">The Digital Curator • High-End Editorial</p>
                    </div>
                </div>

                {/* Right Panel: Form Panel */}
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
                    {/* Mobile Logo */}
                    <div className="md:hidden mb-10 text-center">
                        <span className="font-headline text-3xl font-extrabold tracking-tight text-primary uppercase">Rose GALERIE</span>
                    </div>

                    <div className="max-w-md mx-auto w-full">
                        {!isSent ? (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <header className="mb-10 text-center md:text-left">
                                    <h2 className="font-headline text-4xl font-bold text-on-surface mb-3 tracking-tight">Reset Access.</h2>
                                    <p className="text-on-surface-variant text-base">Enter your email for identity recovery.</p>
                                </header>

                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-4">Email Address</label>
                                    <input
                                        className="w-full bg-white py-4 px-6 rounded-full border border-outline focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-body text-on-surface outline-none"
                                        placeholder="curator@Rosegalerie.com"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-6">
                                    <button
                                        className="w-full py-5 bg-primary text-white font-headline text-sm font-bold uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50"
                                        type="submit"
                                        disabled={forgotPasswordMutation.isLoading}
                                    >
                                        {forgotPasswordMutation.isLoading ? 'Dispatching...' : 'Restore Access'}
                                    </button>

                                    <Link to="/login" className="block text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all">
                                        Return to Core Interface
                                    </Link>
                                </div>
                            </form>
                        ) : (
                            <div className="text-center space-y-10 animate-fade-in">
                                <div className="w-24 h-24 bg-primary-soft rounded-full flex items-center justify-center mx-auto editorial-shadow">
                                    <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>mark_email_read</span>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-bold text-on-surface tracking-tight">Link Dispatched.</h2>
                                    <p className="text-base text-on-surface-variant leading-relaxed">Check your curated inbox to authenticate and continue your transition.</p>
                                </div>
                                <div className="pt-6">
                                    <div className="w-12 h-1 bg-primary/20 rounded-full mx-auto overflow-hidden relative">
                                        <div className="absolute inset-0 bg-primary animate-progress"></div>
                                    </div>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary mt-4">Redirecting to Verification...</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Copyright */}
                    <footer className="mt-auto pt-10 flex justify-center items-center text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
                        <span>© 2026 Rose GALERIE. Radiant Editorial.</span>
                    </footer>
                </div>
            </div>
        </main>
    );
};

export default ForgotPasswordPage;
