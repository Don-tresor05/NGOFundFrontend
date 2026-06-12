import { useState } from 'react';
import { Upload, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface BulkImportProps {
  onImportComplete?: () => void;
}

export function DonorBulkImport({ onImportComplete }: BulkImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; total_rows: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a CSV file');
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/donors/bulk-import/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Import failed');

      const data = await response.json();
      setResult(data);
      setFile(null);
      onImportComplete?.();
    } catch (err) {
      setError('Failed to import donors. Please check the file format.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'organization_name,contact_person,contact_email,country,category,status,notes\nExample Org,John Doe,john@example.com,Rwanda,Corporate,active,Sample notes';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'donor_import_template.csv';
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Bulk Import Donors</h3>
        <button onClick={downloadTemplate} className="btn-secondary flex items-center gap-2">
          <Download size={16} />
          Download Template
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload" className="cursor-pointer">
          <Upload size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            {file ? file.name : 'Click to upload CSV file or drag and drop'}
          </p>
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
          <CheckCircle size={16} />
          <span>Successfully imported {result.imported} of {result.total_rows} donors</span>
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={!file || importing}
        className="btn-primary w-full"
      >
        {importing ? 'Importing...' : 'Import Donors'}
      </button>
    </div>
  );
}
