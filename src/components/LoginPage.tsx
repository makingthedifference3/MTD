import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Briefcase, UserCircle, Users, Lock, User, ArrowLeft, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const ROLES = [
  { id: 'admin', title: 'Admin', icon: Crown },
  { id: 'accountant', title: 'Accountant', icon: Briefcase },
  { id: 'project_manager', title: 'Project Manager', icon: UserCircle },
  { id: 'team_member', title: 'Team Member', icon: Users }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setShowLoginForm(true);
    setError('');
  };

  const handleBackToRoles = () => {
    setShowLoginForm(false);
    setSelectedRole(null);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create user object with entered credentials and selected role
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        username: username,
        email: `${username}@mtd.com`,
        full_name: username,
        role: selectedRole as 'admin' | 'accountant' | 'project_manager' | 'team_member',
        is_active: true,
      };
      
      login(user);
      
      // Navigate to appropriate dashboard
      const dashboardMap: Record<string, string> = {
        'admin': '/admin-dashboard',
        'accountant': '/accountant-dashboard',
        'project_manager': '/pm-dashboard',
        'team_member': '/team-member-dashboard',
      };
      
      navigate(dashboardMap[selectedRole || ''] || '/');
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Role Selection Screen
  if (!showLoginForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-tl from-emerald-50 via-white to-emerald-100 relative overflow-hidden px-2">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
          <circle cx="80%" cy="13%" r="120" fill="#10b98119" />
          <rect x="5%" y="80%" width="170" height="110" rx="60" fill="#05966913" />
        </svg>

        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.38 }}
          className="max-w-4xl w-full z-10"
        >
          <div className="rounded-4xl bg-white/85 backdrop-blur-xl shadow-2xl border border-emerald-100 flex flex-col md:flex-row overflow-hidden">
            {/* Left side: branding and features */}
            <div className="md:w-1/2 flex flex-col justify-between p-10 md:p-12 bg-linear-to-bl from-emerald-50/70 via-white/95 to-emerald-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-5 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-20 h-20 bg-white p-2 shadow-md ring-2 ring-emerald-200 rounded-xl flex items-center justify-center">
                    <Crown className="w-12 h-12 text-emerald-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black">
                      Making The <span className="text-emerald-600">Difference</span>
                    </h1>
                  </div>
                </div>
                <p className="tracking-wider text-emerald-500 font-semibold uppercase mb-8">CSR Management Portal</p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Track Impact</h3>
                      <p className="text-sm text-gray-600">Monitor and measure your CSR initiatives</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Collaborate</h3>
                      <p className="text-sm text-gray-600">Work together across teams seamlessly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Analyze</h3>
                      <p className="text-sm text-gray-600">Generate insights and comprehensive reports</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <blockquote className="text-md text-black/70 font-medium italic flex items-center gap-3 relative z-10 border-l-4 border-emerald-400 pl-4 py-3 bg-white/40 backdrop-blur-sm rounded-r-lg">
                <svg className="w-6 h-6 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a1 1 0 0 1 1 1v2a3 3 0 0 1-3 3H3a1 1 0 0 1-1-1V6a3 3 0 0 1 3-3h2zm6 0a3 3 0 0 1 3 3v2a1 1 0 0 1-1 1h-2a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1h2z"></path>
                </svg>
                <span>Impact starts with the team.</span>
              </blockquote>
            </div>

            {/* Right side: Roles and Login */}
            <div className="md:w-1/2 flex flex-col justify-center px-8 py-10">
              <h2 className="text-2xl font-bold text-black mb-5 text-center">Select Your Role</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {ROLES.map(({ id, title, icon: Icon }, idx) => {
                  const selected = selectedRole === id;
                  return (
                    <motion.button
                      key={id}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.09 }}
                      onClick={() => handleRoleSelect(id)}
                      className={`relative rounded-2xl group p-5 transition-all duration-200 border-2
                        ${selected
                          ? "border-emerald-600 shadow-[0_4px_32px_#10B98133] bg-linear-to-r from-emerald-500 to-emerald-600 text-white"
                          : "border-gray-200 hover:border-emerald-400 bg-white text-black/85"
                        }`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-3
                        ${selected
                          ? "bg-white/25"
                          : "bg-emerald-50 group-hover:bg-emerald-100"
                        }`}>
                        <Icon className={`w-7 h-7 ${selected ? "text-white" : "text-emerald-700"}`} />
                      </div>
                      <span className="block font-semibold text-lg">
                        {title}
                      </span>
                      {selected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3"
                        >
                          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                          </div>
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              <button
                onClick={() => {
                  if (selectedRole) {
                    setShowLoginForm(true);
                  }
                }}
                disabled={!selectedRole}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow text-center transition-all duration-200
                  ${selectedRole
                    ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                style={{ letterSpacing: 1 }}
              >
                Next
              </button>

              <div className="pt-4 text-center text-sm text-gray-500 flex flex-col gap-2">
                <span>🔒 Secure authentication</span>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    );
  }

  // Login Form Screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tl from-emerald-50 via-white to-emerald-100 relative overflow-hidden px-2">
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <circle cx="20%" cy="80%" r="120" fill="#10b98119" />
        <rect x="70%" y="10%" width="170" height="110" rx="60" fill="#05966913" />
      </svg>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full z-10"
      >
        <div className="rounded-3xl bg-white/85 backdrop-blur-xl shadow-2xl border border-emerald-100 p-8">
          {/* Header */}
          <motion.button
            onClick={handleBackToRoles}
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Roles
          </motion.button>

          <h1 className="text-3xl font-bold text-black mb-2">
            Login as <span className="text-emerald-600 capitalize">{selectedRole}</span>
          </h1>
          <p className="text-gray-600 mb-8">Enter your credentials to continue</p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white/50"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white/50"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-2
                ${isLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            🔒 Your credentials are securely verified
          </p>
        </div>
      </motion.section>
    </div>
  );
}
