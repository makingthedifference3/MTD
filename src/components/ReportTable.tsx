import React from 'react';

interface ReportTableProps {
  data: {
    updateNo: string;
    date: string;
    location: string;
    day: string;
    tutor: string;
    filledBy: string;
    residentCount: string;
    residents: string[];
    activity: string;
  };
}

const ReportTable: React.FC<ReportTableProps> = ({ data }) => {
  // Common classes for all cells to ensure uniform borders in PDF
  const cellClass = "border-2 border-black p-3 text-center text-black";
  const headerClass = "bg-gray-100 font-extrabold print:text-black";

  return (
    <div className="rounded-sm overflow-hidden text-sm font-bold text-black shrink-0">
      <table className="w-full border-collapse">
        <tbody>
          {/* Row 1 */}
          <tr>
            <th className={`${cellClass} ${headerClass} w-[20%]`}>Update No:</th>
            <td className={`${cellClass} w-[30%]`}>{data.updateNo}</td>
            <th className={`${cellClass} ${headerClass} w-[20%]`}>Date:</th>
            <td className={`${cellClass} w-[30%]`}>{data.date}</td>
          </tr>

          {/* Row 2 - Location & Day */}
          <tr>
            <th className={`${cellClass} ${headerClass} align-middle`}>Location:</th>
            <td className={`${cellClass} align-middle leading-snug whitespace-pre-line`}>
              {data.location}
            </td>
            <th className={`${cellClass} ${headerClass} align-middle`}>Day:</th>
            <td className={`${cellClass} align-middle`}>{data.day}</td>
          </tr>

          {/* Row 3 - Tutor & Filled By */}
          <tr>
            <th className={`${cellClass} ${headerClass}`}>Tutor:</th>
            <td className={`${cellClass}`}>{data.tutor}</td>
            <th className={`${cellClass} ${headerClass}`}>Filled By:</th>
            <td className={`${cellClass}`}>{data.filledBy}</td>
          </tr>

          {/* Row 4 - No of Residents */}
          <tr>
            <th className={`${cellClass} ${headerClass}`} colSpan={2}>No. of Residents:</th>
            <td className={`${cellClass}`} colSpan={2}>{data.residentCount}</td>
          </tr>

          {/* Row 5 - Header for Residents (Slot 1 & 2) */}
          <tr>
            <th className={`${cellClass} ${headerClass}`} colSpan={2}>Name of the Residents:</th>
            <td className={`${cellClass}`}>{data.residents[0] || '-'}</td>
            <td className={`${cellClass}`}>{data.residents[1] || '-'}</td>
          </tr>

          {/* Row 6 - Residents List Continued (Slot 3, 4, 5, 6) */}
          <tr>
            <td className={`${cellClass} w-1/4`}>{data.residents[2] || '-'}</td>
            <td className={`${cellClass} w-1/4`}>{data.residents[3] || '-'}</td>
            <td className={`${cellClass} w-1/4`}>{data.residents[4] || '-'}</td>
            <td className={`${cellClass} w-1/4`}>{data.residents[5] || '-'}</td>
          </tr>

          {/* Row 7 - Activity */}
          <tr>
            <th className={`${cellClass} ${headerClass} p-5 align-middle`}>Activity:</th>
            <td className={`${cellClass} p-5 text-left align-middle leading-relaxed`} colSpan={3}>
              {data.activity}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;