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
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8 font-body bg-surface text-on-surface antialiased">
      <div className="w-full max-w-5xl bg-surface-container-lowest editorial-shadow rounded-lg overflow-hidden flex min-h-[700px]">
        {/* Left Panel */}
        <div className="hidden md:flex md:w-1/2 relative bg-surface-container-highest overflow-hidden">
          <img
            alt="High-end fashion editorial"
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMspgQDbmkTIEMJ7R9BVfIqJUJCVEvcyeaqRTBQUqUP_5Zr3NjsaUgksOAHaNofuAU-v-ap8Yz6rzJwM0mPf56QW0aGWa9myY6Yz1se6crOTxUThQqahfLKAKz7NGPfyr0QQvcFg9QWrCwd43XrACtdzVT9Zt4kDidU07A4FT2kQG04IgDQ7HgRF1BjnDbC-ZSBuez9GRZar7vNcxglQxVow_zx4PgXWe3N9T4cF2KU7ENsN2snCCyIrBVtLxrT2Ba1JCa6kz9auL2"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/60 to-transparent flex flex-col justify-end p-12">
            <h1 className="font-headline text-5xl font-extrabold text-surface-container-lowest tracking-tighter mb-4">
              MOHANED
            </h1>
            <p className="font-label text-surface-container-lowest/80 text-sm uppercase tracking-[0.2em]">
              Kinetic Minimalism • Editorial Merchant
            </p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <div className="md:hidden mb-8">
            <span className="font-headline text-2xl font-extrabold tracking-tighter text-on-background">
              MOHANED
            </span>
          </div>

          <div className="flex gap-8 mb-10 border-b border-surface-container">
            <button className="pb-4 font-headline text-sm font-bold tracking-widest uppercase border-b-2 border-primary text-primary transition-colors">
              Login
            </button>
            <Link
              to="/register"
              className="pb-4 font-headline text-sm font-medium tracking-widest uppercase border-b-2 border-transparent text-secondary hover:text-on-surface transition-colors"
            >
              Register
            </Link>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full space-y-6">
            <header className="mb-8">
              <h2 className="font-headline text-3xl font-bold text-on-background mb-2 tracking-tight uppercase italic">
                Welcome Back.
              </h2>
              <p className="text-secondary text-sm">
                Please enter your details to access your collection.
              </p>
            </header>

            {/* Email */}
            <div className="relative group">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-transparent py-3 pr-10 form-input-underline font-body text-on-background border-t-0 border-x-0 rounded-none px-0"
                required
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-transparent py-3 pr-10 form-input-underline font-body text-on-background border-t-0 border-x-0 rounded-none px-0"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">{showPassword ? 'visibility' : 'visibility_off'}</span>
              </button>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded-sm border-outline text-primary focus:ring-primary/20"
                />
                <span className="ml-2 text-xs font-medium text-secondary group-hover:text-on-surface transition-colors">
                  Remember Me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-bold text-primary hover:text-on-primary-fixed-variant transition-colors uppercase tracking-wider"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline text-sm font-bold uppercase tracking-widest rounded-lg editorial-shadow hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button className="flex items-center justify-center gap-2 py-3 border border-outline-variant hover:bg-surface-container-low transition-colors rounded-lg group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdhRYsHwMTyDVDpVrNnEa02drXSTQIzoo8W4NFWf2-DLat_2n9KNbLADT7HjKaWIYLIWHtvfpt8BeW6GJc-BCuKKjw3nZClX3kLY_oD7-V_DPltPoNJ88mrHErXy_CfFFrTXoupiMctC-fmzidO0Uc0I2b1_Fz8W9ByMP-k1H3h7Fq-l_PtvAJ7ga2vl979u2cIjmU5wWYqTQJAR8caH5NYPEE0hdgRasJ2KUeNVGBXfRqi0IyxJFHP7WFzgTQxJCt1-Jh_phkflVf"
                alt="Google"
                className="w-4 h-4"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Google
              </span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3 border border-outline-variant hover:bg-surface-container-low transition-colors rounded-lg group">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBoG6BpPxRJnpWcZMVRkP-rWicvAwuGwfaDkI_g3QnjB8-X4H6-6I5xmI452ZQ5wCNhGp6PKz0jZslwHL5oBLUWNI4M5h0pOgjvM257c36kxsKkw9P3nmGYY0_XtpHTmdRwznVsGVgegtFzNyiqIuad1l-9y66_7OG0d2sFbaBZ6iaas88Cptm0hThyNx657h3LIOYn7ZLo3I0NDx8r9B-23RGMKWa_3RKK0bDF79htxxyYcmdcTKl9SiobM6u0s_OVEL6UUuHwhykf"
                alt="Facebook"
                className="w-4 h-4"
              />
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface">
                Facebook
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;