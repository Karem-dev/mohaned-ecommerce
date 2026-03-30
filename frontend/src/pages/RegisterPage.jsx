import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { register } from '../services/authService';
import useAuthStore from '../store/authStore';

const RegisterPage = () => {
    const { setUser: setAuth, setToken } = useAuthStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await register(formData);
            const data = res.data || res;
            setAuth(data.user);
            setToken(data.token);
            toast.success(`Welcome to the gallery, ${formData.name}`);
            navigate('/');
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
        <>
            <style>{`
                .rg-root {
                    min-height: 100svh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                    background: var(--color-surface, #faf7f4);
                    font-family: var(--font-body, 'DM Sans', sans-serif);
                    -webkit-font-smoothing: antialiased;
                    box-sizing: border-box;
                }

                .rg-card {
                    width: 100%;
                    max-width: 960px;
                    background: #fff;
                    border-radius: 20px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 8px 48px rgba(0,0,0,0.10);
                }

                /* ── Left panel ── */
                .rg-left {
                    display: none;
                    position: relative;
                    overflow: hidden;
                    min-height: 320px;
                }

                .rg-left img {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 1s ease;
                }

                .rg-left:hover img { transform: scale(1.06); }

                .rg-left-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to top, rgba(150,30,60,0.82) 0%, transparent 55%);
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                    padding: 48px 44px;
                }

                .rg-brand-title {
                    font-size: 40px;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.02em;
                    text-transform: uppercase;
                    line-height: 1;
                    margin: 0 0 12px;
                }

                .rg-brand-line {
                    width: 40px;
                    height: 3px;
                    background: #fff;
                    border-radius: 2px;
                    margin-bottom: 16px;
                }

                .rg-brand-sub {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.28em;
                    text-transform: uppercase;
                    color: rgba(255,255,255,0.88);
                }

                /* ── Right panel ── */
                .rg-right {
                    width: 100%;
                    padding: 32px 24px 28px;
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;
                }

                /* mobile logo */
                .rg-mobile-logo {
                    text-align: center;
                    margin-bottom: 28px;
                    font-size: 26px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    text-transform: uppercase;
                    color: var(--color-primary, #c0395a);
                }

                /* tabs */
                .rg-tabs {
                    display: flex;
                    gap: 32px;
                    border-bottom: 1px solid rgba(0,0,0,0.08);
                    margin-bottom: 28px;
                    flex-shrink: 0;
                }

                .rg-tab {
                    padding-bottom: 14px;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    border: none;
                    background: none;
                    cursor: pointer;
                    text-decoration: none;
                    border-bottom: 2px solid transparent;
                    color: #888;
                    transition: all 0.2s;
                    margin-bottom: -1px;
                }

                .rg-tab:hover { color: var(--color-primary, #c0395a); }

                .rg-tab.active {
                    color: var(--color-primary, #c0395a);
                    border-bottom-color: var(--color-primary, #c0395a);
                }

                /* header */
                .rg-form-header {
                    margin-bottom: 20px;
                }

                .rg-form-header h2 {
                    font-size: 28px;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    color: #1a1410;
                    margin: 0 0 4px;
                    line-height: 1.1;
                }

                .rg-form-header p {
                    font-size: 13px;
                    color: #888;
                    margin: 0;
                }

                /* form */
                .rg-form { display: flex; flex-direction: column; gap: 12px; }

                .rg-field { display: flex; flex-direction: column; gap: 5px; }

                .rg-label {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.14em;
                    text-transform: uppercase;
                    color: #888;
                    padding-left: 4px;
                }

                .rg-input {
                    width: 100%;
                    padding: 13px 20px;
                    border-radius: 50px;
                    border: 1.5px solid rgba(0,0,0,0.1);
                    background: #fff;
                    font-size: 14px;
                    color: #1a1410;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                    font-family: inherit;
                }

                .rg-input:focus {
                    border-color: var(--color-primary, #c0395a);
                    box-shadow: 0 0 0 4px rgba(192,57,90,0.08);
                }

                .rg-input-wrap { position: relative; }

                .rg-eye {
                    position: absolute;
                    right: 18px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #aaa;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    transition: color 0.2s;
                }

                .rg-eye:hover { color: var(--color-primary, #c0395a); }

                .rg-eye .material-symbols-outlined { font-size: 18px; }

                .rg-terms {
                    font-size: 10px;
                    color: #aaa;
                    font-weight: 500;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    line-height: 1.6;
                    padding: 0 4px;
                }

                .rg-terms span {
                    color: var(--color-primary, #c0395a);
                    font-weight: 700;
                }

                .rg-submit {
                    width: 100%;
                    padding: 15px;
                    background: var(--color-primary, #c0395a);
                    color: #fff;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                    border: none;
                    border-radius: 50px;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(192,57,90,0.25);
                    transition: background 0.2s, transform 0.15s, opacity 0.2s;
                    font-family: inherit;
                    margin-top: 4px;
                }

                .rg-submit:hover { background: #a52d4c; }
                .rg-submit:active { transform: scale(0.98); }
                .rg-submit:disabled { opacity: 0.5; cursor: not-allowed; }

                .rg-footer {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: #bbb;
                }

                /* ── Tablet+ ── */
                @media (min-width: 640px) {
                    .rg-root { padding: 24px; }

                    .rg-right {
                        padding: 40px 40px 32px;
                    }

                    .rg-form-header h2 { font-size: 32px; }
                }

                /* ── Desktop ── */
                @media (min-width: 768px) {
                    .rg-root { padding: 32px; }

                    .rg-card {
                        flex-direction: row;
                        min-height: 680px;
                        border-radius: 24px;
                    }

                    .rg-left {
                        display: flex;
                        width: 44%;
                        flex-shrink: 0;
                        min-height: unset;
                    }

                    .rg-right {
                        width: 56%;
                        padding: 48px 52px 40px;
                        overflow-y: auto;
                    }

                    .rg-mobile-logo { display: none; }

                    .rg-form-header { margin-bottom: 24px; }
                    .rg-form-header h2 { font-size: 36px; }

                    .rg-tabs { margin-bottom: 32px; }

                    .rg-form { gap: 14px; }
                }
            `}</style>

            <main className="rg-root">
                <div className="rg-card">

                    {/* ── Left panel ── */}
                    <div className="rg-left">
                        <img
                            alt="High-end fashion editorial"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCa_fIKdvcZ7S9AR_zNyzUrKd7T4HN5TOOJnl2fvIZ-czPrG_OtB-kMLg7DO7TMItE872nbVgmYeepl7yauhyAD_4yXIcVhceYqAWwnCTiJd6AVlARI5kLwOuiPBKxGiUISMZUJFyZTEumcjCEaVxRJ0kx2QqmiSn1lriqMXSlvoZUoXgKclKfMcxtxODgaFv05-9S5KyHVBPuXT7vwT-Jgw59d9g1LmmApBQdJ-KZdQ1mTqS_bh7VxXOD6uYwKDMixzp182QES5XHl"
                        />
                        <div className="rg-left-overlay">
                            <h1 className="rg-brand-title">Rose GALERIE</h1>
                            <div className="rg-brand-line" />
                            <p className="rg-brand-sub">The Digital Curator · High-End Editorial</p>
                        </div>
                    </div>

                    {/* ── Right panel ── */}
                    <div className="rg-right">

                        {/* Mobile logo */}
                        <div className="rg-mobile-logo">Rose GALERIE</div>

                        {/* Tabs */}
                        <div className="rg-tabs">
                            <Link to="/login" className="rg-tab">Login</Link>
                            <button className="rg-tab active">Register</button>
                        </div>

                        {/* Header */}
                        <div className="rg-form-header">
                            <h2>Create Profile.</h2>
                            <p>Join our exclusive curation gallery.</p>
                        </div>

                        {/* Form */}
                        <form className="rg-form" onSubmit={handleSubmit}>

                            <div className="rg-field">
                                <label className="rg-label">Full Name</label>
                                <input
                                    className="rg-input"
                                    placeholder="Alexander Bloom"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="rg-field">
                                <label className="rg-label">Email Address</label>
                                <input
                                    className="rg-input"
                                    placeholder="curator@rosegalerie.com"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="rg-field">
                                <label className="rg-label">Password</label>
                                <div className="rg-input-wrap">
                                    <input
                                        className="rg-input"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        style={{ paddingRight: '48px' }}
                                    />
                                    <button
                                        type="button"
                                        className="rg-eye"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <span className="material-symbols-outlined">
                                            {showPassword ? 'visibility' : 'visibility_off'}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="rg-field">
                                <label className="rg-label">Confirm Password</label>
                                <input
                                    className="rg-input"
                                    placeholder="••••••••"
                                    type="password"
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    required
                                />
                            </div>

                            <p className="rg-terms">
                                By joining, you authorize our <span>Privacy Protocols</span> and <span>Terms of Curation</span>.
                            </p>

                            <button
                                className="rg-submit"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Initializing...' : 'Join Gallery'}
                            </button>

                        </form>

                        <footer className="rg-footer">
                            © 2026 Rose GALERIE. Radiant Editorial.
                        </footer>

                    </div>
                </div>
            </main>
        </>
    );
};

export default RegisterPage;