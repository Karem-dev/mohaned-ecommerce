import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { login } from '../services/authService';
import useAuthStore from '../store/authStore';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setUser);
    const setToken = useAuthStore((state) => state.setToken);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(formData);
            setAuth(data.user);
            setToken(data.token);
            toast.success(`Welcome back, ${data.user.name}`);
            if (data.user.role === 'admin') navigate('/admin');
            else navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 md:p-8 font-body bg-surface text-on-surface antialiased overflow-y-auto py-10">
            <div className="w-full max-w-5xl bg-background editorial-shadow rounded-xl overflow-hidden flex min-h-fit md:min-h-[750px]">
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
                <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col">
                    {/* Mobile Logo */}
                    <div className="md:hidden mb-10 text-center">
                        <span className="font-headline text-3xl font-extrabold tracking-tight text-primary uppercase">Rose GALERIE</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-10 mb-12 border-b border-primary-soft">
                        <button className="pb-5 font-headline text-sm font-bold tracking-widest uppercase border-b-2 border-primary text-primary relative transition-all">
                            Login
                        </button>
                        <Link to="/register" className="pb-5 font-headline text-sm font-medium tracking-widest uppercase border-b-2 border-transparent text-on-surface-variant hover:text-primary transition-all">
                            Register
                        </Link>
                    </div>

                    {/* Login Form Content */}
                    <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
                        <header className="mb-10 text-center md:text-left">
                            <h2 className="font-headline text-4xl font-bold text-on-surface mb-3 tracking-tight">Welcome Back.</h2>
                            <p className="text-on-surface-variant text-base">Enter your curated credentials.</p>
                        </header>
                        <form onSubmit={handleSubmit} className="space-y-6 overflow-scroll">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-4">Email Address</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-white py-4 px-6 rounded-full border border-outline focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-body text-on-surface outline-none"
                                        placeholder="curator@Rosegalerie.com"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                    {formData.email && formData.email.includes('@') && (
                                        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                    )}
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-on-surface-variant ml-4">Password</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-white py-4 px-6 rounded-full border border-outline focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-body text-on-surface outline-none"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-all"
                                    >
                                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2">
                                <label className="flex items-center cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            className="w-5 h-5 rounded-full border-outline text-primary focus:ring-primary/20 cursor-pointer appearance-none border-2 checked:bg-primary checked:border-primary transition-all"
                                            type="checkbox"
                                        />
                                        <span className="material-symbols-outlined absolute text-[12px] text-white pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 checked:opacity-100">check</span>
                                    </div>
                                    <span className="ml-3 text-xs font-semibold text-on-surface-variant group-hover:text-primary transition-all">Remember Me</span>
                                </label>
                                <Link to="/forgot-password" size="sm" className="text-xs font-bold text-primary hover:text-primary-hover transition-all uppercase tracking-wider">Forgot Access?</Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                className="w-full py-5 bg-primary text-white font-headline text-sm font-bold uppercase tracking-[0.2em] rounded-full shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Authorizing...' : 'Sign In'}
                            </button>

                            {/* Divider */}
                      

                        </form>
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

export default LoginPage;