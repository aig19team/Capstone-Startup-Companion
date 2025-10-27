import React from 'react';
import { FileText, Palette, Shield, Users, Download, Eye, MessageSquare } from 'lucide-react';

interface Document {
  id: string;
  type: 'registration' | 'branding' | 'compliance' | 'hr';
  title: string;
  keyPoints: string[];
  pdfUrl?: string;
  status: 'generating' | 'completed' | 'failed';
}

interface DocumentDashboardProps {
  documents: Document[];
  onViewDocument: (document: Document) => void;
  onDownloadPdf: (document: Document) => void;
  onBackToChat?: () => void;
}

const DocumentDashboard: React.FC<DocumentDashboardProps> = ({
  documents,
  onViewDocument,
  onDownloadPdf,
  onBackToChat
}) => {
  const getDocumentIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      registration: FileText,
      branding: Palette,
      compliance: Shield,
      hr: Users
    };
    return iconMap[type] || FileText;
  };

  const getDocumentColor = (type: string) => {
    const colorMap: Record<string, string> = {
      registration: 'from-blue-600 to-blue-700',
      branding: 'from-purple-600 to-purple-700',
      compliance: 'from-green-600 to-green-700',
      hr: 'from-orange-600 to-orange-700'
    };
    return colorMap[type] || 'from-gray-600 to-gray-700';
  };

  return (
    <div className="p-6 space-y-6">
      {onBackToChat && (
        <div className="flex justify-start mb-4">
          <button
            onClick={onBackToChat}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 border border-gray-700 hover:border-gray-600"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Back to Chat</span>
          </button>
        </div>
      )}

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Your Business Documents</h2>
        <p className="text-gray-400">All your essential business guides are ready. Click to view or download.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => {
          const Icon = getDocumentIcon(doc.type);
          const colorGradient = getDocumentColor(doc.type);

          return (
            <div
              key={doc.id}
              className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200"
            >
              {/* Header with gradient */}
              <div className={`bg-gradient-to-r ${colorGradient} p-4 flex items-center space-x-3`}>
                <div className="bg-white/20 rounded-lg p-2">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{doc.title}</h3>
              </div>

              {/* Content */}
              <div className="p-4">
                {doc.status === 'generating' && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-white-400">Generating...</span>
                  </div>
                )}

                {doc.status === 'failed' && (
                  <div className="text-center py-8">
                    <p className="text-red-400">Failed to generate document</p>
                  </div>
                )}

                {doc.status === 'completed' && (
                  <>
                    {/* Key Points */}
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-semibold text-white-300 mb-2">Key Highlights:</h4>
                      <ul className="space-y-2">
                        {doc.keyPoints.slice(0, 5).map((point, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm text-white-400">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => onViewDocument(doc)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Full Document</span>
                      </button>

                      {doc.pdfUrl && (
                        <button
                          onClick={() => onDownloadPdf(doc)}
                          className="flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentDashboard;
