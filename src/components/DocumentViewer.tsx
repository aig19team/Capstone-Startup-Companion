import React from 'react';
import { ArrowLeft, Download, FileText, Palette, Shield, Users } from 'lucide-react';

interface Document {
  id: string;
  type: 'registration' | 'branding' | 'compliance' | 'hr';
  title: string;
  keyPoints: string[];
  fullContent: string;
  pdfUrl?: string;
  status: 'generating' | 'completed' | 'failed';
}

interface DocumentViewerProps {
  document: Document;
  onBack: () => void;
  onDownloadPdf: () => void;
}

const formatMarkdownContent = (content: string) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let currentList: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let key = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag key={`list-${key++}`} className="list-disc list-inside space-y-1 mb-4 ml-4">
          {currentList.map((item, idx) => (
            <li key={idx} className="text-gray-300" dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ListTag>
      );
      currentList = [];
      listType = null;
    }
  };

  const processInlineFormatting = (text: string): string => {
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
    // Italic
    text = text.replace(/\*(.+?)\*/g, '<em class="italic">$1</em>');
    // Links
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
    return text;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) {
      flushList();
      return;
    }

    // Headers (# ## ### etc.)
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushList();
      const level = headerMatch[1].length;
      const text = processInlineFormatting(headerMatch[2]);
      const sizeClasses = {
        1: 'text-3xl font-bold text-white mt-6 mb-3',
        2: 'text-2xl font-bold text-white mt-5 mb-3',
        3: 'text-xl font-semibold text-white mt-4 mb-2',
        4: 'text-lg font-semibold text-white mt-3 mb-2',
        5: 'text-base font-semibold text-white mt-2 mb-2',
        6: 'text-sm font-semibold text-white mt-2 mb-1'
      };
      const Tag = `h${level}` as keyof JSX.IntrinsicElements;
      elements.push(
        React.createElement(Tag, {
          key: `heading-${key++}`,
          className: sizeClasses[level as keyof typeof sizeClasses],
          dangerouslySetInnerHTML: { __html: text }
        })
      );
      return;
    }

    // Unordered list items (- or *)
    const ulMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      currentList.push(processInlineFormatting(ulMatch[1]));
      return;
    }

    // Ordered list items (1. 2. 3. etc.)
    const olMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      currentList.push(processInlineFormatting(olMatch[1]));
      return;
    }

    // Regular paragraph
    flushList();
    const processedText = processInlineFormatting(trimmedLine);
    elements.push(
      <p
        key={`para-${key++}`}
        className="text-gray-300 mb-3 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    );
  });

  flushList();
  return <>{elements}</>;
};

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onBack,
  onDownloadPdf
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

  const Icon = getDocumentIcon(document.type);
  const colorGradient = getDocumentColor(document.type);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`bg-gradient-to-r ${colorGradient} p-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="bg-white/20 rounded-lg p-2">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-white">{document.title}</h2>
        </div>

        {document.pdfUrl && (
          <button
            onClick={onDownloadPdf}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Download className="h-5 w-5" />
            <span>Download PDF</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-8">
          <div className="prose prose-invert prose-blue max-w-none">
            {formatMarkdownContent(document.fullContent)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
