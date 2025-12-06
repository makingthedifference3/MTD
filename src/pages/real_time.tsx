import React, { useState } from 'react';
import ReportTable from '../components/ReportTable';
import PhotoEvidence from '../components/PhotoEvidence';
import ReportPageLayout from '../components/ReportPageLayout';
import { Upload, FileDown, X, Loader2 } from 'lucide-react';

// Default initial state
const INITIAL_DATA = {
  updateNo: '22',
  date: '24/09/2025',
  location: 'Padatola Village,\nGadchiroli, Maharashtra',
  day: 'Wednesday',
  tutor: 'Pooja Usandi',
  filledBy: 'Riyola Dsouza',
  residentCount: '3',
  residents: ['Bebi Pada', 'Sunita Velandi', 'Pinki Mattami', 'Anjali Narote', '', ''],
  activity: 'No activities were conducted as the sewing machine was also damaged.'
};

const App: React.FC = () => {
  const [reportData, setReportData] = useState(INITIAL_DATA);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Handlers for form inputs
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleResidentChange = (index: number, value: string) => {
    const newResidents = [...reportData.residents];
    newResidents[index] = value;
    setReportData(prev => ({ ...prev, residents: newResidents }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map((file, index) => {
        return {
          id: Date.now() + index,
          url: URL.createObjectURL(file)
        };
      });
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (id: number) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    
    // @ts-ignore
    if (!window.html2pdf) {
      alert("PDF library is still loading, please try again in a moment.");
      setIsGenerating(false);
      return;
    }

    window.focus();
    await new Promise(resolve => setTimeout(resolve, 500));

    const element = document.getElementById('report-content');
    const opt = {
      margin: 0,
      filename: `Naarishakti_Report_${reportData.date.replace(/\//g, '-')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        onclone: (clonedDoc: Document) => {
           const pages = clonedDoc.querySelectorAll('.report-page');
           pages.forEach(el => {
             el.classList.remove('shadow-2xl');
             el.classList.remove('mb-8');
           });
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore
      await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF Generation failed:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Pagination Logic
  const photosPage1 = photos.slice(0, 2);
  const remainingPhotos = photos.slice(2);
  const additionalPages = [];
  for (let i = 0; i < remainingPhotos.length; i += 4) {
    additionalPages.push(remainingPhotos.slice(i, i + 4));
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 print:p-0 print:bg-white">
      
      {/* --- CONTROLS / FORM (Hidden during print) --- */}
      <div className="w-full max-w-[210mm] mb-8 bg-white p-6 rounded-lg shadow-lg print:hidden space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Report Generator</h2>
          <button 
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <FileDown size={20} />}
            {isGenerating ? 'Generating PDF...' : 'Download / Print PDF'}
          </button>
        </div>

        {/* Text Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Update No</label>
            <input type="text" name="updateNo" value={reportData.updateNo} onChange={handleInputChange} className="w-full border p-2 rounded" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Date</label>
            <input type="text" name="date" value={reportData.date} onChange={handleInputChange} className="w-full border p-2 rounded" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Day</label>
            <input type="text" name="day" value={reportData.day} onChange={handleInputChange} className="w-full border p-2 rounded" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Resident Count</label>
            <input type="text" name="residentCount" value={reportData.residentCount} onChange={handleInputChange} className="w-full border p-2 rounded" />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Location</label>
            <textarea name="location" value={reportData.location} onChange={handleInputChange} className="w-full border p-2 rounded h-20" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Tutor</label>
            <input type="text" name="tutor" value={reportData.tutor} onChange={handleInputChange} className="w-full border p-2 rounded" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Filled By</label>
            <input type="text" name="filledBy" value={reportData.filledBy} onChange={handleInputChange} className="w-full border p-2 rounded" />
          </div>

          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Residents (Max 6)</label>
            <div className="grid grid-cols-2 gap-2">
              {reportData.residents.map((res, idx) => (
                <input 
                  key={idx}
                  type="text" 
                  placeholder={`Resident ${idx + 1}`}
                  value={res} 
                  onChange={(e) => handleResidentChange(idx, e.target.value)} 
                  className="w-full border p-2 rounded" 
                />
              ))}
            </div>
          </div>

          <div className="col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Activity</label>
            <textarea name="activity" value={reportData.activity} onChange={handleInputChange} className="w-full border p-2 rounded h-24" />
          </div>
          
          <div className="col-span-2 space-y-2 border-t pt-4">
            <label className="block text-sm font-semibold text-gray-700">Upload Photos</label>
            <div className="flex gap-4 items-start">
               <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
               </label>
               <div className="flex gap-2 flex-wrap">
                  {photos.map(p => (
                    <div key={p.id} className="relative w-24 h-24 border rounded overflow-hidden group">
                       <img src={p.url} alt="preview" className="w-full h-full object-cover" />
                       <button onClick={() => removePhoto(p.id)} className="absolute top-0 right-0 bg-red-500 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <X size={12} />
                       </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- REPORT PREVIEW --- */}
      <div id="report-content" className="print:w-full">
        
        {/* PAGE 1: Table + First 2 Photos */}
        <ReportPageLayout>
           <ReportTable data={reportData} />
           <PhotoEvidence photos={photosPage1} isFullPageGrid={false} />
        </ReportPageLayout>

        {/* ADDITIONAL PAGES: 4 Photos each */}
        {additionalPages.map((pagePhotos, index) => (
          <ReportPageLayout key={index}>
             <div className="grow flex flex-col h-full">
                <div className="font-bold text-center mb-2 border-b-2 border-black pb-1">Additional Evidence</div>
                <PhotoEvidence photos={pagePhotos} isFullPageGrid={true} />
             </div>
          </ReportPageLayout>
        ))}

      </div>
    </div>
  );
};

export default App;