import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { register as apiRegister } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import toast from 'react-hot-toast';

const AUTH_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&auto=format&q=80';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const passChecks = {
    length: form.password.length >= 6,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password),
  };
  const isPassValid = Object.values(passChecks).every(Boolean);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!isPassValid) {
      toast.error('Password must satisfy all complexity requirements');
      return;
    }
    setLoading(true);
    try {
      const res = await apiRegister({ name: form.name, email: form.email, password: form.password });
      login(res.data.user, res.data.token);
      toast.success(`Welcome to ScoutWay, ${res.data.user.name}! 🌍`);
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex bg-slate-50 text-slate-900 font-sans">
      {/* Left Image Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-950">
        <img src={AUTH_IMG} alt="Mountain travel" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <img src={logoImg} alt="ScoutWay Logo" className="w-12 h-12 object-contain drop-shadow-md" />
            <span className="text-3xl font-extrabold text-white tracking-tight font-outfit">
              ScoutWay
            </span>
          </div>
          <h3 className="text-white text-2xl font-extrabold leading-tight mb-2 font-outfit">
            Join the Adventure
          </h3>
          <p className="text-slate-300 max-w-xs text-sm leading-relaxed font-normal">
            Create an account and start preserving your travel memories. Every trip tells a story.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 h-full overflow-hidden">
        <div className="w-full max-w-md my-auto animate-fade-in space-y-4">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-4 lg:hidden justify-center">
            <img src={logoImg} alt="ScoutWay Logo" className="w-9 h-9 object-contain drop-shadow-xs" />
            <span className="text-xl font-extrabold text-slate-900 font-outfit">ScoutWay</span>
          </div>

          {/* Header */}

          <div className="mb-4 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight font-outfit">
              Create Account
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Join thousands of travel story enthusiasts</p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="form-group mb-0">
              <label htmlFor="register-name" className="text-xs font-bold mb-1 block">Full Name</label>

              <div className="relative">
                <User
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <input
                  id="register-name"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Your full name"
                  className="input-field !pl-10 !py-2 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="register-email" className="text-xs font-bold mb-1 block">Email Address</label>

              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />
                <input
                  id="register-email"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="input-field !pl-10 !py-2 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="register-password" className="text-xs font-bold mb-1 block">Password</label>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />

                <input
                  id="register-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="input-field !pl-10 !pr-10 !py-2 text-xs sm:text-sm"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 flex items-center justify-center"
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Complexity Checklist Pills */}
              {form.password.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${passChecks.length ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                    {passChecks.length ? '✓ 6+ Chars' : '• 6+ Chars'}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${passChecks.upper ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                    {passChecks.upper ? '✓ Upper A-Z' : '• Upper A-Z'}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${passChecks.lower ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                    {passChecks.lower ? '✓ Lower a-z' : '• Lower a-z'}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${passChecks.number ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                    {passChecks.number ? '✓ Number 0-9' : '• Number 0-9'}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${passChecks.special ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                    {passChecks.special ? '✓ Special (!@#)' : '• Special (!@#)'}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group mb-0">
              <label htmlFor="register-confirm" className="text-xs font-bold mb-1 block">Confirm Password</label>

              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />

                <input
                  id="register-confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  placeholder="Re-enter password"
                  className="input-field !pl-10 !py-2 text-xs sm:text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-2.5 mt-3 text-xs sm:text-sm font-extrabold"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating account...</span>
                </span>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Bottom link */}
          <p className="text-center text-xs text-slate-500 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-extrabold text-sky-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;




