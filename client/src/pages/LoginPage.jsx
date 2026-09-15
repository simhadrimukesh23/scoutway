import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { login as apiLogin, guestLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import toast from 'react-hot-toast';

const AUTH_IMG = 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=900&auto=format&q=80';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiLogin(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setLoading(true);
    try {
      const res = await guestLogin();
      login(res.data.user, res.data.token);
      toast.success('Continuing as guest — sign up to post stories!');
      navigate('/home');
    } catch {
      toast.error('Guest login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Left Image Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-slate-950">
        <img src={AUTH_IMG} alt="Travel" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent">
          <div className="flex items-center gap-3 mb-8">
            <img src={logoImg} alt="ScoutWay Logo" className="w-12 h-12 object-contain drop-shadow-md" />
            <span className="text-3xl font-extrabold text-white tracking-tight font-outfit">
              ScoutWay
            </span>
          </div>
          <blockquote className="text-white text-2xl font-extrabold leading-relaxed max-w-sm font-outfit">
            "Where every trip becomes a story."
          </blockquote>
          <p className="text-slate-300 text-sm mt-3 max-w-xs leading-relaxed font-normal">
            Join thousands of travelers sharing their adventures across the globe.
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 overflow-y-auto">
        <div className="w-full max-w-md my-auto animate-fade-in">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden justify-center">
            <img src={logoImg} alt="ScoutWay Logo" className="w-10 h-10 object-contain drop-shadow-xs" />
            <span className="text-2xl font-extrabold text-slate-900 font-outfit">ScoutWay</span>
          </div>



          {/* Header */}
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight font-outfit">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm font-medium">Sign in to continue your journey</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Address</label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />

                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="input-field !pl-11"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
                />

                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="Enter your password"
                  className="input-field !pl-11 !pr-12"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 flex items-center justify-center"
                  title={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>


          {/* Divider */}
          <div className="auth-divider">
            <span>Or</span>
          </div>

          {/* Social / Alt logins */}
          <div className="flex flex-col gap-3">
            <Link to="/register" className="btn-secondary w-full">
              <span>Create Account</span>
            </Link>

            <button onClick={handleGuest} className="guest-btn">
              <span>Continue as Guest</span>
            </button>
          </div>


          {/* Bottom link */}
          <p className="text-center text-xs sm:text-sm text-slate-500 mt-8">
            New here?{' '}
            <Link to="/register" className="font-extrabold text-sky-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;



