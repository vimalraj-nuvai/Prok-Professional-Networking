import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from './api';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  // Same email regex as Login — must have real TLD
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

  // Password strength: min 8 chars, 1 uppercase, 1 number
  const passwordStrength = (pwd: string) => {
    if (pwd.length < 8) return { level: 0, label: 'Too short', color: 'bg-red-400' };
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { level: 1, label: 'Weak', color: 'bg-orange-400' };
    if (!/[^A-Za-z0-9]/.test(pwd)) return { level: 2, label: 'Fair', color: 'bg-yellow-400' };
    return { level: 3, label: 'Strong', color: 'bg-green-500' };
  };

  const strength = passwordStrength(password);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Enter a valid email address (e.g. name@gmail.com)';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

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
      const data = await authApi.signup({ name: name.trim(), email: email.trim(), password });
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/profile');
      } else {
        setErrors({ general: data.message || 'Signup failed. Please try again.' });
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
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-violet-900 via-indigo-700 to-blue-600 flex-col justify-between p-12">

        {/* Decorative background circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute top-40 -right-10 w-60 h-60 bg-white/5 rounded-full" />
        <div className="absolute -bottom-10 left-20 w-96 h-96 bg-white/5 rounded-full" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-indigo-700 font-black text-lg">P</span>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">Prok</span>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Join thousands of<br />
            <span className="text-blue-200">professionals</span><br />
            already growing.
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed max-w-sm">
            Build your profile, showcase your skills, and land your next opportunity — all in one place.
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

      {/* ── RIGHT PANEL: Signup form with mesh background ── */}
      <div
        className="w-full lg:w-1/2 relative flex items-center justify-center px-6 py-12 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #f0fdf4 40%, #fdf4ff 70%, #eff6ff 100%)' }}
      >

        {/* Blurred orbs */}
        <div className="absolute top-[-80px] right-[-60px] w-80 h-80 rounded-full opacity-50 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #c4b5fd, #818cf8)' }} />
        <div className="absolute bottom-[-60px] left-[-40px] w-72 h-72 rounded-full opacity-40 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6ee7b7, #3b82f6)' }} />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full opacity-30 blur-2xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f9a8d4, #a78bfa)' }} />

        {/* Dot-grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />

        {/* Frosted glass card */}
        <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl shadow-2xl shadow-indigo-100 px-8 py-10">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">P</span>
            </div>
            <span className="text-indigo-700 text-xl font-bold">Prok</span>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-1">Create account</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Start your professional journey today.
          </p>

          {/* General error */}
          {errors.general && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="mt-0.5">⚠️</span>
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all bg-white/80
                  ${errors.name
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300'
                    : 'border-white/60 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400'
                  }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

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
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
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

              {/* Password strength bar — only shows when user starts typing */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300
                          ${i < strength.level ? strength.color : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.level === 0 ? 'text-red-500'
                    : strength.level === 1 ? 'text-orange-500'
                    : strength.level === 2 ? 'text-yellow-600'
                    : 'text-green-600'
                  }`}>
                    {strength.label}
                  </p>
                </div>
              )}

              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-all bg-white/80
                    ${errors.confirmPassword
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-300'
                      : confirmPassword && confirmPassword === password
                        ? 'border-green-400 focus:ring-2 focus:ring-green-300'
                        : 'border-white/60 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm select-none"
                  tabIndex={-1}
                >
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Live match indicator */}
              {confirmPassword && confirmPassword === password && (
                <p className="mt-1 text-xs text-green-600 font-medium">✓ Passwords match</p>
              )}
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-300 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create account'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center my-5 gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800">
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Signup;
