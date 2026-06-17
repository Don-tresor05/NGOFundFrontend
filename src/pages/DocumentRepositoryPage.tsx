import { useEffect, useState } from 'react';
import { FileText, Upload, Download, Search, Folder, Filter, Calendar } from 'lucide-react';
import { Button } from '../components/Button';
import { apiRequest } from '../lib/api';

interface Document {
  id: number;
  document_type: string;
  file: string;
  uploaded_by: number;
  uploaded_by_name?: string;
  related_entity_type: string;
  related_entity_id: number;
  uploaded_at: string;
}

export default function DocumentRepositoryPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, typeFilter, entityFilter]);

  const fetchDocuments = async () => {
    try {
      const data = await apiRequest('/documents/');
      const results = Array.isArray(data) ? data : data.results || [];
      setDocuments(results);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let result = [...documents];

    if (searchQuery) {
      result = result.filter(d =>
        d.document_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.related_entity_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== 'ALL') {
      result = result.filter(d => d.document_type === typeFilter);
    }

    if (entityFilter !== 'ALL') {
      result = result.filter(d => d.related_entity_type === entityFilter);
    }

    setFilteredDocs(result);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'GENERAL');
      formData.append('related_entity_type', 'PROJECT');
      formData.append('related_entity_id', '1');

      await apiRequest('/documents/', 'POST', formData);
      fetchDocuments();
      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (doc: Document) => {
    window.open(doc.file, '_blank');
  };

  const docTypes = [...new Set(documents.map(d => d.document_type))];
  const entityTypes = [...new Set(documents.map(d => d.related_entity_type))];

  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    const category = doc.related_entity_type;
    if (!acc[category]) acc[category] = [];
    acc[category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          <p className="text-gray-600 mt-1">Search and manage all documents</p>
        </div>
        <label className="cursor-pointer">
          <Button className="flex items-center gap-2" disabled={uploading}>
            <Upload size={18} /> {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
          <input type="file" onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <p className="text-sm text-gray-600">Total Documents</p>
          <p className="text-2xl font-bold">{documents.length}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow-sm p-4">
          <p className="text-sm text-blue-600">Categories</p>
          <p className="text-2xl font-bold text-blue-700">{Object.keys(groupedDocs).length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow-sm p-4">
          <p className="text-sm text-green-600">This Month</p>
          <p className="text-2xl font-bold text-green-700">
            {documents.filter(d => new Date(d.uploaded_at).getMonth() === new Date().getMonth()).length}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg shadow-sm p-4">
          <p className="text-sm text-purple-600">Filtered</p>
          <p className="text-2xl font-bold text-purple-700">{filteredDocs.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option key="ALL" value="ALL">All Types</option>
            {docTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option key="ALL" value="ALL">All Entities</option>
            {entityTypes.map(entity => <option key={entity} value={entity}>{entity}</option>)}
          </select>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter size={18} />
            <span>{filteredDocs.length} documents</span>
          </div>
        </div>
      </div>

      {/* Document Browser */}
      <div className="space-y-6">
        {Object.keys(groupedDocs).length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          Object.entries(groupedDocs).map(([category, docs]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Folder className="text-blue-500" size={24} />
                <h3 className="text-lg font-semibold">{category}</h3>
                <span className="text-sm text-gray-500">({docs.length} documents)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleDownload(doc)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <FileText className="text-gray-400" size={32} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(doc);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1 truncate">{doc.document_type}</h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {doc.related_entity_type} #{doc.related_entity_id}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} />
                      <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
