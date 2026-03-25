import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { register } from '../services/authService';
import useAuthStore from '../store/authStore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    password_confirmation: '' 
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success(`Verification protocol dispatched to ${formData.email}`);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        Object.values(errors).forEach(e => toast.error(e[0]));
      } else {
        toast.error(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8 font-body bg-surface text-on-surface antialiased">
      <div className="w-full max-w-5xl bg-surface-container-lowest editorial-shadow rounded-lg overflow-hidden flex min-h-[700px]">
        
        {/* Left Panel - Image */}
        <div className="hidden md:flex md:w-1/2 relative bg-surface-container-highest overflow-hidden">
          <img
            alt="High-end fashion editorial"
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent flex flex-col justify-end p-12">
            <h1 className="font-headline text-5xl font-extrabold text-surface-container-lowest tracking-tighter mb-4">
              MOHANED
            </h1>
            <p className="font-label text-surface-container-lowest/80 text-sm uppercase tracking-[0.2em]">
              The Future of Curated Style • Join Us
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="md:hidden mb-8">
            <span className="font-headline text-2xl font-extrabold tracking-tighter text-on-background">
              MOHANED
            </span>
          </div>

          <div className="flex gap-8 mb-10 border-b border-surface-container">
            <Link
              to="/login"
              className="pb-4 font-headline text-sm font-medium tracking-widest uppercase border-b-2 border-transparent text-secondary hover:text-on-surface transition-colors"
            >
              Login
            </Link>
            <button className="pb-4 font-headline text-sm font-bold tracking-widest uppercase border-b-2 border-primary text-primary transition-colors">
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
            <header className="mb-4">
              <h2 className="font-headline text-3xl font-bold text-on-background mb-2 tracking-tight uppercase italic">
                Create Account.
              </h2>
              <p className="text-secondary text-sm">
                Join our exclusive editorial collection.
              </p>
            </header>

            {/* Name */}
            <div className="relative group">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-transparent py-3 font-body text-on-background border-b-2 border-slate-100 focus:border-slate-900 outline-none transition-all px-0"
                required
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent py-3 font-body text-on-background border-b-2 border-slate-100 focus:border-slate-900 outline-none transition-all px-0"
                required
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50 mb-1">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-transparent py-3 pr-10 font-body text-on-background border-b-2 border-slate-100 focus:border-slate-900 outline-none transition-all px-0"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 translate-y-2 text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-sm">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative group">
              <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-secondary/50 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password_confirmation}
                onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                className="w-full bg-transparent py-3 font-body text-on-background border-b-2 border-slate-100 focus:border-slate-900 outline-none transition-all px-0"
                required
              />
            </div>

            {/* Terms */}
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              By registering, you agree to our <span className="text-slate-900 underline">Terms of Service</span> and <span className="text-slate-900 underline">Elite Privacy Protocols</span>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-on-background text-white font-headline text-xs font-black uppercase tracking-[0.3em] rounded-sm shadow-2xl hover:bg-primary-vibrant active:scale-[0.98] transition-all mt-4"
            >
              {loading ? 'Creating Account...' : 'Initialize Access'}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
