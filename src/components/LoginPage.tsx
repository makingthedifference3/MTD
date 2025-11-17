// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Crown, Briefcase, UserCircle, Users } from 'lucide-react';

// interface LoginPageProps {
//   onLogin: (role: 'admin' | 'accountant' | 'project-manager' | 'team-member') => void;
// }

// const LoginPage = ({ onLogin }: LoginPageProps) => {
//   const [selectedRole, setSelectedRole] = useState<string | null>(null);

//   const roles = [
//     {
//       id: 'admin',
//       title: 'Admin',
//       icon: Crown,
//       color: 'from-emerald-500 to-emerald-600',
//       hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
//     },
//     {
//       id: 'accountant',
//       title: 'Accountant',
//       icon: Briefcase,
//       color: 'from-emerald-500 to-emerald-600',
//       hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
//     },
//     {
//       id: 'project-manager',
//       title: 'Project Manager',
//       icon: UserCircle,
//       color: 'from-emerald-500 to-emerald-600',
//       hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
//     },
//     {
//       id: 'team-member',
//       title: 'Team Member',
//       icon: Users,
//       color: 'from-emerald-500 to-emerald-600',
//       hoverColor: 'hover:from-emerald-600 hover:to-emerald-700',
//     },
//   ];

//   const handleLogin = () => {
//     if (selectedRole) {
//       onLogin(selectedRole as 'admin' | 'accountant' | 'project-manager' | 'team-member');
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6 }}
//         className="w-full max-w-4xl"
//       >
//         {/* Main Card */}
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
//           {/* Title Section */}
//           <div className="text-center mb-12">
//             <motion.h1
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.2, duration: 0.6 }}
//               className="text-4xl md:text-5xl font-bold text-gray-900 mb-3"
//             >
//               Making The Difference
//             </motion.h1>
//             <motion.p
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.4, duration: 0.6 }}
//               className="text-xl text-emerald-600 font-medium"
//             >
//               CSR Management Portal
//             </motion.p>
//           </div>

//           {/* Role Selection Section */}
//           <div className="mb-10">
//             <motion.h2
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.5, duration: 0.6 }}
//               className="text-2xl font-semibold text-gray-800 text-center mb-8"
//             >
//               Select Your Role
//             </motion.h2>

//             {/* Role Buttons Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {roles.map((role, index) => {
//                 const Icon = role.icon;
//                 const isSelected = selectedRole === role.id;

//                 return (
//                   <motion.button
//                     key={role.id}
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
//                     whileHover={{ scale: 1.05, y: -5 }}
//                     whileTap={{ scale: 0.98 }}
//                     onClick={() => setSelectedRole(role.id)}
//                     className={`relative p-6 rounded-2xl transition-all duration-200 ${
//                       isSelected
//                         ? `bg-linear-to-r ${role.color} text-white shadow-lg border-2 border-emerald-500`
//                         : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
//                     }`}
//                   >
//                     <div className="flex items-center space-x-4">
//                       <div
//                         className={`p-3 rounded-xl ${
//                           isSelected ? 'bg-white bg-opacity-20' : 'bg-white'
//                         }`}
//                       >
//                         <Icon
//                           className={`w-8 h-8 ${
//                             isSelected ? 'text-white' : 'text-gray-700'
//                           }`}
//                         />
//                       </div>
//                       <div className="flex-1 text-left">
//                         <h3 className="text-xl font-bold">{role.title}</h3>
//                       </div>
//                     </div>

//                     {isSelected && (
//                       <motion.div
//                         initial={{ scale: 0 }}
//                         animate={{ scale: 1 }}
//                         className="absolute top-3 right-3"
//                       >
//                         <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
//                           <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                         </div>
//                       </motion.div>
//                     )}
//                   </motion.button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Login Button */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 1, duration: 0.6 }}
//             className="flex justify-center mb-6"
//           >
//             <button
//               onClick={handleLogin}
//               disabled={!selectedRole}
//               className={`px-12 py-4 rounded-lg text-lg font-semibold transition-all duration-200 ${
//                 selectedRole
//                   ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 shadow-sm hover:shadow-md'
//                   : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//               }`}
//             >
//               Login
//             </button>
//           </motion.div>

//           {/* Footer */}
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 1.2, duration: 0.6 }}
//             className="text-center text-sm text-gray-500"
//           >
//             🔒 Secure Google Sign-In coming soon
//           </motion.p>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default LoginPage;
// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import { Crown, Briefcase, UserCircle, Users } from 'lucide-react';

// interface LoginPageProps {
//   onLogin: (role: 'admin' | 'accountant' | 'project-manager' | 'team-member') => void;
// }

// const ROLES = [
//   { id: 'admin', title: 'Admin', icon: Crown },
//   { id: 'accountant', title: 'Accountant', icon: Briefcase },
//   { id: 'project-manager', title: 'Project Manager', icon: UserCircle },
//   { id: 'team-member', title: 'Team Member', icon: Users }
// ];

// export default function LoginPage({ onLogin }: LoginPageProps) {
//   const [selectedRole, setSelectedRole] = useState<string | null>(null);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-tl from-emerald-50 via-white to-emerald-100 px-2">
//       <motion.section
//         initial={{ opacity: 0, scale: 0.98 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.4 }}
//         className="max-w-4xl w-full"
//       >
//         {/* Bento Card */}
//         <div
//           className="rounded-3xl bg-white shadow-2xl border border-emerald-100 flex flex-col md:flex-row overflow-hidden"
//         >
//           {/* Left: Title + Quote */}
//           <div className="md:w-1/2 flex flex-col justify-between p-10 md:p-12 bg-gradient-to-bl from-emerald-50/70 via-white/95 to-emerald-100">
//             <div>
//               <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black mb-4">
//                 Making The <span className="text-emerald-600">Difference</span>
//               </h1>
//               <p className="text-lg text-emerald-600 font-semibold mb-6">CSR Management Portal</p>
//             </div>
//             <blockquote className="text-md text-black/60 font-medium italic mt-4 border-l-4 border-emerald-300 pl-4">
//               "Impact starts with the team."
//             </blockquote>
//           </div>

//           {/* Right: Roles + Actions */}
//           <div className="md:w-1/2 flex flex-col justify-center px-8 py-10">
//             <h2 className="text-2xl font-bold text-black mb-5 text-center">Select Your Role</h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
//               {ROLES.map(({ id, title, icon: Icon }, idx) => {
//                 const selected = selectedRole === id;
//                 return (
//                   <motion.button
//                     key={id}
//                     whileHover={{ scale: 1.04, y: -2 }}
//                     whileTap={{ scale: 0.97 }}
//                     initial={{ opacity: 0, y: 15 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.2 + idx * 0.09 }}
//                     onClick={() => setSelectedRole(id)}
//                     className={`relative rounded-2xl group p-5 transition-all duration-200 border-2
//                       ${selected
//                         ? "border-emerald-600 shadow-[0_4px_32px_#10B98133] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white"
//                         : "border-gray-200 hover:border-emerald-400 bg-white text-black/85"
//                       }`}
//                   >
//                     {/* Icon with emerald highlight */}
//                     <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-3
//                       ${selected
//                         ? "bg-white/25"
//                         : "bg-emerald-50 group-hover:bg-emerald-100"
//                       }`}>
//                       <Icon className={`w-7 h-7 ${selected ? "text-white" : "text-emerald-700"}`} />
//                     </div>
//                     <span className="block font-semibold text-lg">
//                       {title}
//                     </span>
//                     {/* Selected dot */}
//                     {selected && (
//                       <motion.div
//                         initial={{ scale: 0 }}
//                         animate={{ scale: 1 }}
//                         className="absolute top-3 right-3"
//                       >
//                         <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
//                           <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
//                         </div>
//                       </motion.div>
//                     )}
//                   </motion.button>
//                 )
//               })}
//             </div>

//             <button
//               onClick={() => selectedRole && onLogin(selectedRole as 'admin' | 'accountant' | 'project-manager' | 'team-member')}
//               disabled={!selectedRole}
//               className={`w-full py-4 rounded-xl font-bold text-lg shadow text-center transition-all duration-200
//                 ${selectedRole
//                   ? "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
//                   : "bg-gray-200 text-gray-400 cursor-not-allowed"
//                 }`}
//               style={{ letterSpacing: 1 }}
//             >
//               Login
//             </button>

//             <div className="pt-4 text-center text-sm text-gray-500 flex flex-col gap-2">
//               <span>🔒 Secure Google Sign-In coming soon</span>
              
//             </div>
//           </div>
//         </div>
//       </motion.section>
//     </div>
//   );
// }
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Briefcase, UserCircle, Users } from 'lucide-react';

// Define the props for login callback
interface LoginPageProps {
  onLogin: (role: 'admin' | 'accountant' | 'project-manager' | 'team-member') => void;
}

// Available roles
const ROLES = [
  // { id: 'admin', title: 'Admin', icon: Crown },
  { id: 'accountant', title: 'Accountant', icon: Briefcase },
  { id: 'project-manager', title: 'Project Manager', icon: UserCircle },
  // { id: 'team-member', title: 'Team Member', icon: Users }
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-tl from-emerald-50 via-white to-emerald-100 relative overflow-hidden px-2">
      {/* Decorative SVG background blobs for premium look */}
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
          {/* Left side: branding and quote */}
          <div className="md:w-1/2 flex flex-col justify-between p-10 md:p-12 bg-linear-to-bl from-emerald-50/70 via-white/95 to-emerald-100 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-5 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              {/* Logo */}
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src="https://img.logo.dev/mtdngo.com?token=pk_TWFfI7LzSyOkJp3PACHx6A" 
                  alt="MTD Logo" 
                  className="w-20 h-20 object-contain rounded-xl bg-white p-2 shadow-md ring-2 ring-emerald-200"
                  onError={(e) => {
                    // Fallback if logo fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black">
                    Making The <span className="text-emerald-600">Difference</span>
                  </h1>
                </div>
              </div>
              <p className="tracking-wider text-emerald-500 font-semibold uppercase mb-8">CSR Management Portal</p>
              
              {/* Feature highlights */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {ROLES.map(({ id, title, icon: Icon }, idx) => {
                const selected = selectedRole === id;
                return (
                  <motion.button
                    key={id}
                    whileHover={{ scale: 1.07, y: selected ? -2 : -1 }}
                    whileTap={{ scale: 0.96 }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.19 + idx * 0.09 }}
                    onClick={() => setSelectedRole(id)}
                    className={`relative rounded-2xl group p-6 transition-all duration-200 border-2
                      backdrop-blur-md flex flex-col items-center justify-center
                      ${selected
                        ? "border-emerald-600 shadow-[0_8px_40px_#10B98133] bg-linear-to-r from-emerald-500 to-emerald-600 text-white"
                        : "border-gray-200 hover:border-emerald-400 bg-white/85 text-black/85"
                      }`}
                    tabIndex={0}
                    aria-pressed={selected}
                  >
                    <motion.div
                      animate={selected ? { scale: [1, 1.13, 1] } : {}}
                      transition={{ repeat: selected ? Infinity : 0, duration: 1.1, repeatType: "reverse" }}
                      className={`w-12 h-12 flex items-center justify-center rounded-xl mb-3
                        ${selected
                          ? "bg-white/10 ring-2 ring-emerald-200 shadow-md"
                          : "bg-emerald-50 group-hover:bg-emerald-100"
                        }`}>
                      <Icon className={`w-8 h-8 ${selected ? "text-white" : "text-emerald-700"}`} />
                    </motion.div>
                    <span className="block font-semibold text-lg text-center">{title}</span>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3"
                      >
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        </div>
                      </motion.div>
                    )}
                  </motion.button>
                )
              })}
            </div>
            {/* Login Button */}
            <button
  onClick={() => selectedRole && onLogin(selectedRole as 'admin' | 'accountant' | 'project-manager' | 'team-member')}
  disabled={!selectedRole}
  className={`w-full py-4 rounded-xl font-bold text-lg text-center transition-all duration-200
    ${selectedRole
      ? "emerald-button"
      : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }`}
  style={{ letterSpacing: 1 }}
  tabIndex={0}
  aria-disabled={!selectedRole}
>
  Login
</button>
            <div className="pt-4 text-center text-[0.98em] text-gray-500 flex flex-col gap-2">
              {/* <span>🔒 Secure Google Sign-In coming soon</span> */}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
