import React from 'react';

interface Photo {
  id: number;
  url: string;
}

interface PhotoEvidenceProps {
  photos: Photo[];
  isFullPageGrid?: boolean;
}

const PhotoEvidence: React.FC<PhotoEvidenceProps> = ({ photos, isFullPageGrid = false }) => {
  // If no photos, render nothing
  if (photos.length === 0) return null;

  // Layout Logic:
  // - On Page 1 (isFullPageGrid=false), we typically have 1 row of 2 photos.
  // - On Page 2 (isFullPageGrid=true), we want a grid that fills the space.
  
  const gridClass = isFullPageGrid 
    ? "grid-cols-2 grid-rows-2" // Page 2: 2x2 grid filling the page
    : "grid-cols-2";            // Page 1: Side-by-side row

  return (
    <div className={`grid ${gridClass} gap-5 flex-grow min-h-0`}>
      {photos.map((photo) => (
        <div key={photo.id} className="border-2 border-black p-1 bg-white relative flex flex-col h-full min-h-0">
          <div className="w-full flex-grow relative overflow-hidden bg-gray-100 h-full">
              <img 
                  src={photo.url} 
                  alt={`Evidence ${photo.id}`} 
                  className="w-full h-full object-cover object-center"
              />
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoEvidence;