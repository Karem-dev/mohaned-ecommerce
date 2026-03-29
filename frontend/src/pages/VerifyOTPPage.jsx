import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { verifyOTP, resendOTP } from '../services/authService';
import useAuthStore from '../store/authStore';

const VerifyOTPPage = () => {
    const { setUser, setToken } = useAuthStore();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const inputRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

    useEffect(() => {
        if (!email) {
            toast.error('Identity context missing. Redirecting...');
            navigate('/login');
        }
    }, [email, navigate]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Auto-focus next
        if (value && index < 5) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            toast.error('Please complete the verification protocol.');
            return;
        }

        setLoading(true);
        try {
            const data = await verifyOTP({ email, otp: code });

            // Critical Update: Refresh Auth Store with the newly verified identity
            if (data.user && data.token) {
                setUser(data.user);
                setToken(data.token);
            }

            toast.success('Identity validated successfully.');

            // Redirect based on previous intent if possible, otherwise to home
            const from = location.state?.from || '/';
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification protocol failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        setResending(true);
        try {
            await resendOTP(email);
            toast.success('New verification protocol dispatched.');
            setTimer(60);
        } catch (err) {
            toast.error('Dispatch failed. Please try again later.');
        } finally {
            setResending(false);
        }
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

                    <div className="max-w-md mx-auto w-full text-center">
                        <div className="mx-auto w-24 h-24 bg-primary-soft rounded-[2rem] flex items-center justify-center shadow-lg shadow-primary/10 rotate-3 mb-10">
                            <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>shield_person</span>
                        </div>

                        <header className="mb-10">
                            <h2 className="font-headline text-4xl font-bold text-on-surface mb-3 tracking-tight italic uppercase italic underline underline-offset-8 decoration-primary-soft">Identity Validation.</h2>
                            <p className="text-on-surface-variant text-base flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-lg opacity-50">mail</span>
                                Packet sent to <span className="text-on-surface font-bold underline underline-offset-2">{email}</span>
                            </p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="flex justify-between gap-3">
                                {otp.map((data, index) => (
                                    <input
                                        key={index}
                                        ref={inputRefs[index]}
                                        type="text"
                                        maxLength="1"
                                        value={data}
                                        onChange={e => handleChange(e, index)}
                                        onKeyDown={e => handleKeyDown(e, index)}
                                        className="w-full aspect-[2/3] text-center text-3xl font-black bg-white border-2 border-outline rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    />
                                ))}
                            </div>

                            <div className="space-y-6">
                                <button
                                    className="w-full py-5 bg-primary text-white font-headline text-sm font-bold uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Validating...' : 'Authenticate'}
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resending || timer > 0}
                                    className="flex items-center justify-center gap-2 mx-auto text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant hover:text-primary transition-all disabled:opacity-50"
                                >
                                    <span className={`material-symbols-outlined text-sm ${resending ? 'animate-spin' : ''}`}>sync</span>
                                    {timer > 0 ? `Wait for Protocol (${timer}s)` : 'Request New Packet'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-12 pt-10 border-t border-primary-soft">
                            <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.3em] leading-relaxed">
                                Secure Identity Protocol • Radiant Curation Services
                            </p>
                        </div>
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

export default VerifyOTPPage;
