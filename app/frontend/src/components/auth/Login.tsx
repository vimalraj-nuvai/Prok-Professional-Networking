import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from './api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Regex: local@domain.tld — requires a real dot-separated TLD (min 2 chars)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Enter a valid email address (e.g. name@gmail.com)';
    }

    if (!password.trim()) newErrors.password = 'Password is required';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/profile');
      } else {
        setErrors({ general: data.message || 'Invalid credentials. Please try again.' });
      }
    } catch {
      setErrors({ general: 'Network error. Make sure the backend is running.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL: Branded side ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-700 to-blue-600 flex-col justify-between p-12">

        {/* Background decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-40 -right-10 w-60 h-60 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 left-20 w-96 h-96 bg-white/5 rounded-full" />

        {/* Logo / Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-indigo-700 font-black text-lg">P</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Prok</span>
          </div>
        </div>

        {/* Center tagline */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Your career,<br />
            <span className="text-blue-200">your network,</span><br />
            your story.
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
            Connect with professionals, discover opportunities, and grow your career with Prok.
          </p>
        </div>

        {/* Floating stat cards */}
        <div className="relative z-10 space-y-3">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4 w-64">
            <div className="w-10 h-10 bg-blue-400/30 rounded-xl flex items-center justify-center text-xl">🌐</div>
            <div>
              <p className="text-white font-semibold text-sm">10M+ Professionals</p>
              <p className="text-indigo-200 text-xs">Growing every day</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4 w-64 ml-8">
            <div className="w-10 h-10 bg-green-400/30 rounded-xl flex items-center justify-center text-xl">💼</div>
            <div>
              <p className="text-white font-semibold text-sm">500K+ Jobs Posted</p>
              <p className="text-indigo-200 text-xs">Find your next role</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4 w-64">
            <div className="w-10 h-10 bg-yellow-400/30 rounded-xl flex items-center justify-center text-xl">🤝</div>
            <div>
              <p className="text-white font-semibold text-sm">Real Connections</p>
              <p className="text-indigo-200 text-xs">Not just followers</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── RIGHT PANEL: Login form ── */}
      <div className="w-full lg:w-1/2 relative flex items-center justify-center px-6 py-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #f0fdf4 40%, #fdf4ff 70%, #eff6ff 100%)' }}
      >

        {/* Blurred background orbs — decorative depth */}
        <div className="absolute top-[-80px] right-[-60px] w-80 h-80 rounded-full opacity-50 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #a5b4fc, #818cf8)' }} />
        <div className="absolute bottom-[-60px] left-[-40px] w-72 h-72 rounded-full opacity-40 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6ee7b7, #3b82f6)' }} />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full opacity-30 blur-2xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f9a8d4, #c084fc)' }} />

        {/* Subtle dot-grid pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

        {/* Frosted glass card */}
        <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-indigo-100 px-8 py-10">

          {/* Mobile logo (only shows on small screens) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="text-indigo-700 text-xl font-bold">Prok</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Welcome back! Enter your details to continue.
          </p>

          {/* General error */}
          {errors.general && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white/80
                  ${errors.email
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300'
                    : 'border-white/60 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400'
                  }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password with show/hide toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all bg-white/80
                    ${errors.password
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300'
                      : 'border-white/60 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm select-none"
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-300"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center my-6 gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Create one free
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;
