import React from 'react';
import { Users, Star, Sparkles } from 'lucide-react';

const ReportHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-start mb-4 shrink-0">
      {/* Logo Title Block */}
      <div className="relative pt-2 pl-2">
        {/* Decorative Stars/Sparkles */}
        <div className="absolute top-0 left-0 text-black transform -rotate-12">
           <Sparkles size={20} fill="black" />
        </div>
         <div className="absolute -bottom-1 right-0 text-black">
           <Star size={14} fill="black" className="text-black" />
        </div>

        {/* Main Red Pill */}
        <div className="bg-[#e66c6c] text-white px-8 py-2.5 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_#000000] relative z-10">
          <h1 className="text-xl font-extrabold tracking-wide">Naarishakti Niketan</h1>
        </div>
        
        {/* Sprout Decor */}
        <div className="absolute -top-4 right-6 text-black transform rotate-12">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <path d="M7 17C7 17 12 17 12 12C12 7 7 2 7 2" />
             <path d="M17 17C17 17 12 17 12 12" />
           </svg>
        </div>
      </div>

      {/* Right Icon Block */}
      <div className="text-[#e66c6c] flex flex-col items-center mt-2">
         <div className="flex space-x-0.5">
            {/* 5 women icons simulating the logo */}
            {[1,2,3,4,5].map((_, i) => (
                <Users key={i} size={28} className="text-[#d85c5c]" fill="currentColor" />
            ))}
         </div>
      </div>
    </div>
  );
};

export default ReportHeader;