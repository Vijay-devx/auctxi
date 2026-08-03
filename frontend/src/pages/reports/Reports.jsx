import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { IconFileTypePdf, IconFileTypeCsv, IconDownload } from '@tabler/icons-react';
import { api } from '../../services/api';

const Reports = () => {
  const [playerFormat, setPlayerFormat] = useState('pdf');
  const [playerStatus, setPlayerStatus] = useState('');
  
  const [teamFormat, setTeamFormat] = useState('pdf');

  const downloadReport = async (type, params) => {
    try {
      // Create query string manually
      const query = new URLSearchParams(params).toString();
      const url = `/api/v1/reports/${type}?${query}`;
      
      const response = await api.get(url, { responseType: 'blob' });
      
      // Extract filename from header if possible, or use default
      let filename = `${type}_report.${params.format}`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h2>
        <p className="text-sm text-slate-500">Export dynamic PDFs and CSVs of the auction data.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Player Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary-600">Player Directory Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">Export a filtered list of all players currently in the system.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <Select label="Status Filter" value={playerStatus} onChange={e => setPlayerStatus(e.target.value)}>
                <option value="">All Players</option>
                <option value="UNSOLD">Unsold Only</option>
                <option value="SOLD">Sold Only</option>
              </Select>
              <Select label="Format" value={playerFormat} onChange={e => setPlayerFormat(e.target.value)}>
                <option value="pdf">PDF Document</option>
                <option value="csv">CSV Spreadsheet</option>
              </Select>
            </div>

            <Button 
              className="w-full gap-2 mt-4"
              onClick={() => downloadReport('players', { format: playerFormat, status: playerStatus || undefined })}
            >
              {playerFormat === 'pdf' ? <IconFileTypePdf size={18}/> : <IconFileTypeCsv size={18}/>}
              Download Player Report
            </Button>
          </CardContent>
        </Card>

        {/* Team Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-primary-600">Team Revenue Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600">Export a financial breakdown of all teams, showing total budget vs money spent.</p>
            
            <div className="grid grid-cols-1 gap-4">
              <Select label="Format" value={teamFormat} onChange={e => setTeamFormat(e.target.value)}>
                <option value="pdf">PDF Document</option>
                <option value="csv">CSV Spreadsheet</option>
              </Select>
            </div>

            <Button 
              className="w-full gap-2 mt-4"
              onClick={() => downloadReport('teams', { format: teamFormat })}
            >
              {teamFormat === 'pdf' ? <IconFileTypePdf size={18}/> : <IconFileTypeCsv size={18}/>}
              Download Revenue Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
