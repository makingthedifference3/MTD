import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, User, Loader, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authenticateUser } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Authenticate user against database using username and password
      const authenticatedUser = await authenticateUser(username.trim(), password);
      
      if (!authenticatedUser) {
        setError('Invalid username or password');
        setIsLoading(false);
        return;
      }
      
      // Login successful - store user info
      login(authenticatedUser);
      
      // Route based on role: admin goes to admin dashboard, accountant to accountant dashboard, data_manager goes to result analysis, others go to projects dashboard
      if (authenticatedUser.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (authenticatedUser.role === 'accountant') {
        navigate('/accountant-dashboard');
      } else if (authenticatedUser.role === 'data_manager') {
        navigate('/data-manager');
      } else {
        navigate('/projects-dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-tl from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4 relative overflow-hidden">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <circle cx="80%" cy="13%" r="120" fill="#10b98119" />
        <rect x="5%" y="80%" width="170" height="110" rx="60" fill="#05966913" />
      </svg>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <div className="w-20 h-20 bg-white p-2 shadow-md ring-2 ring-emerald-200 rounded-xl flex items-center justify-center">
              <Crown className="w-12 h-12 text-emerald-600" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Making The <span className="text-emerald-600">Difference</span>
          </h1>
          <p className="text-emerald-600 font-semibold uppercase tracking-wider text-sm mt-2">CSR Management Portal</p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl bg-white/85 backdrop-blur-xl shadow-2xl border border-emerald-100 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Sign In</h2>
          <p className="text-gray-600 mb-8 text-sm">Enter your credentials to continue</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white/50"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white/50"
                  disabled={isLoading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleLogin(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 hover:text-emerald-700 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2 text-white shadow-md hover:shadow-lg ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="mt-8 pt-8 border-t border-emerald-100">
            <p className="text-xs text-gray-600 text-center mb-3 font-semibold">Demo Credentials (Full Name / Password):</p>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center text-xs">👤</span>
                <span><span className="font-mono font-semibold">Suresh Menon</span> / <span className="font-mono">Admin@123</span> (Admin)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center text-xs">👤</span>
                <span><span className="font-mono font-semibold">Ravi Singh</span> / <span className="font-mono">Manager@123</span> (Project Manager)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center text-xs">👤</span>
                <span><span className="font-mono font-semibold">Meena Iyer</span> / <span className="font-mono">Account@123</span> (Accountant)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-emerald-100 flex items-center justify-center text-xs">👤</span>
                <span><span className="font-mono font-semibold">Priya Patil</span> / <span className="font-mono">Field@123</span> (Team Member)</span>
              </div>
            </div>
          </div> */}
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-emerald-700 text-sm font-medium">🔒 Secure authentication</p>
        </div>
      </motion.div>
    </div>
  );
}
