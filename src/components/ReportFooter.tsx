import React from 'react';
import { HeartHandshake } from 'lucide-react';

const ReportFooter: React.FC = () => {
  return (
    <div className="h-24 mt-2 shrink-0 relative flex items-center justify-between">
       {/* Left - Red Shape Decor */}
       <div className="absolute -bottom-8 -left-10 w-48 h-32 overflow-hidden pointer-events-none z-0">
         <svg viewBox="0 0 200 150" className="w-full h-full text-[#e66c6c]" fill="currentColor">
            <path d="M0,150 L0,50 Q40,20 80,60 T160,80 Q190,90 200,150 Z" />
         </svg>
       </div>

      {/* Logo Container */}
      <div className="w-full h-full flex items-center z-10 bg-transparent">
          
          {/* Logo 1: INTERISE */}
          <div className="flex-1 flex justify-center items-center h-12 border-r-2 border-gray-300">
             <h2 className="text-3xl font-extrabold text-[#2a4d7d] tracking-widest uppercase font-sans">
                INTERISE
             </h2>
          </div>

          {/* Logo 2: Making The Difference */}
          <div className="flex-1 flex justify-center items-center h-12 border-r-2 border-gray-300 gap-3 px-4">
             <div className="bg-green-600 rounded-full p-2 text-white shrink-0">
                <HeartHandshake size={28} />
             </div>
             <div className="flex flex-col leading-none justify-center">
                <span className="text-lg font-bold text-black tracking-tight">Making</span>
                <span className="text-lg font-light text-black tracking-tight">The Difference</span>
                <span className="text-[9px] text-black font-medium mt-0.5">Reg. No.: E9197/15/Thane</span>
             </div>
          </div>

          {/* Logo 3: Lajja */}
          <div className="flex-1 flex justify-center items-center h-12">
             <div className="relative">
                 <h2 className="text-5xl font-bold text-[#c0392b] font-serif tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
                    Lajja
                 </h2>
                 <div className="w-2 h-2 bg-[#c0392b] rounded-full absolute top-1 right-0"></div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default ReportFooter;