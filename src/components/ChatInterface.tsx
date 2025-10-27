import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Star, Phone, Mail, FileCheck } from 'lucide-react';
import { auth } from '../lib/auth';
import { submitRating, getMentorForService } from '../lib/rating';
import { createSession, saveChatMessage, updateSessionStatus } from '../lib/session';
import { supabase } from '../lib/supabase';
import { getDocumentsBySession, type GeneratedDocument } from '../lib/documentService';
import DocumentDashboard from './DocumentDashboard';
import DocumentViewer from './DocumentViewer';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  mentorCard?: {
    name: string;
    email: string;
    phone: string;
    expertise: string;
  };
  mentorCards?: Array<{
    name: string;
    email: string;
    phone: string;
    expertise: string;
    service: string;
  }>;
}

interface Document {
  id: string;
  type: 'registration' | 'branding' | 'compliance' | 'hr';
  title: string;
  keyPoints: string[];
  fullContent: string;
  pdfUrl?: string;
  status: 'generating' | 'completed' | 'failed';
}

interface ChatInterfaceProps {
  onNavigate?: (page: string) => void;
}

type ViewMode = 'chat' | 'dashboard' | 'document';
type FlowStage = 'initial' | 'questioning' | 'generating' | 'documents' | 'rating';

const QUESTIONS = [
  { id: 1, field: 'business_name', prompt: 'What is the company name or preferred company name?' },
  { id: 2, field: 'company_description', prompt: 'Please provide a brief description of the company or company website' },
  { id: 3, field: 'location', prompt: 'Which location will the business operate in?' },
  { id: 4, field: 'partners_info', prompt: 'Who will be the partners or directors? (How many and their roles?)' },
  { id: 5, field: 'color_preference', prompt: 'What color tone would you prefer for branding? (Earthy, Bright, Professional, etc.)' },
  { id: 6, field: 'style_preference', prompt: 'What style would you prefer? (Conservative/Classic, Modern/Contemporary, Expressive/Bold)' }
];

const ChatInterface = ({ onNavigate }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  // New state for sequential flow
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [flowStage, setFlowStage] = useState<FlowStage>('initial');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [businessProfile, setBusinessProfile] = useState<any>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [awaitingRating, setAwaitingRating] = useState(false);
  const [ratingFeedback, setRatingFeedback] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    initializeChat();
  }, []);


  useEffect(() => {
    if (currentSessionId && (viewMode === 'dashboard' || viewMode === 'document')) {
      loadDocumentsFromDatabase();
    }
  }, [currentSessionId, viewMode]);

  const initializeChat = async () => {
    try {
      const user = await auth.getCurrentUser();
      if (!user) {
        if (onNavigate) {
          onNavigate('login');
        }
        return;
      }

      setCurrentUser(user);

      // Show initial welcome message
      const welcomeMessage: Message = {
        id: '1',
        type: 'ai',
        content: 'Welcome to StartUP Companion! I\'m here to help you launch your business.\n\nPlease choose an option:\n\n1. Idea Tuning - My idea is not firmed up yet\n2. Confirmed Idea - I\'m ready to get my business documents\n\nJust type the number (1 or 2) to get started!',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      if (onNavigate) {
        onNavigate('login');
      }
    }
  };


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessageAndSave = async (message: Message) => {
    setMessages(prev => [...prev, message]);

    // Save to database if we have a session
    if (currentSessionId && currentUser) {
      await saveChatMessage(
        currentSessionId,
        currentUser.id,
        message.type,
        message.content
      );
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    await addMessageAndSave(userMessage);
    const userInput = inputText;
    setInputText('');

    // Handle different stages
    if (flowStage === 'initial') {
      await handleInitialChoice(userInput);
    } else if (flowStage === 'questioning') {
      await handleQuestionResponse(userInput);
    } else if (flowStage === 'rating') {
      await handleRatingResponse(userInput);
    }
  };

  const handleInitialChoice = async (userInput: string) => {
    const choice = userInput.trim();

    if (choice === '1') {
      // Idea Tuning - placeholder
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Idea Tuning service will be available soon! This feature will help you refine and validate your business concept.\n\nFor now, if you have a confirmed idea, please type "2" to proceed with document generation.',
        timestamp: new Date()
      };
      await addMessageAndSave(aiMessage);
    } else if (choice === '2') {
      // Confirmed Idea - start questioning flow
      // Always create a NEW session for each flow
      const session = await createSession(currentUser?.id, 'confirmed_idea_flow');
      if (session) {
        setCurrentSessionId(session);
        // Reset business profile state for new session
        setBusinessProfile({});
        setCurrentQuestionIndex(0);
      }

      setFlowStage('questioning');
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Great! I'll ask you 6 quick questions to gather the information we need.\n\nQuestion 1 of 6:\n${QUESTIONS[0].prompt}`,
        timestamp: new Date()
      };
      await addMessageAndSave(aiMessage);
    } else {
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Please type 1 for Idea Tuning or 2 for Confirmed Idea to proceed.',
        timestamp: new Date()
      };
      await addMessageAndSave(aiMessage);
    }
  };

  const handleQuestionResponse = async (userInput: string) => {
    const currentQuestion = QUESTIONS[currentQuestionIndex];

    // Store answer in business profile
    const updatedProfile = { ...businessProfile };

    if (currentQuestion.field === 'partners_info') {
      // Parse partners information
      updatedProfile[currentQuestion.field] = [{ info: userInput }];
    } else {
      updatedProfile[currentQuestion.field] = userInput;
    }

    setBusinessProfile(updatedProfile);

    // Save to database
    await updateBusinessProfile(updatedProfile);

    // Show confirmation and next question
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Got it!\n\nQuestion ${nextIndex + 1} of 6:\n${QUESTIONS[nextIndex].prompt}`,
        timestamp: new Date()
      };
      await addMessageAndSave(aiMessage);
    } else {
      // All questions answered - start generation
      setFlowStage('generating');
      const aiMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Perfect! I have all the information I need.\n\nProcessing your information and generating your business documents...\n\nThis may take a few moments. Please wait.',
        timestamp: new Date()
      };
      await addMessageAndSave(aiMessage);

      // Trigger document generation
      await generateAllDocuments();
    }
  };

  const updateBusinessProfile = async (profile: any) => {
    if (!currentUser || !currentSessionId) return;

    try {
      // Check if profile exists for this session
      const { data: existingProfile } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('session_id', currentSessionId)
        .maybeSingle();

      if (existingProfile) {
        // Merge new data with existing profile (partial update)
        const mergedProfile: any = { ...existingProfile };

        // Only update fields that have new values
        Object.keys(profile).forEach(key => {
          if (profile[key] !== undefined && profile[key] !== null && profile[key] !== '') {
            mergedProfile[key] = profile[key];
          }
        });

        // Update existing profile for this session
        await supabase
          .from('business_profiles')
          .update(mergedProfile)
          .eq('session_id', currentSessionId);
      } else {
        // Create new profile for this session
        await supabase
          .from('business_profiles')
          .insert({
            user_id: currentUser.id,
            session_id: currentSessionId,
            ...profile
          });
      }
    } catch (error) {
      console.error('Error updating business profile:', error);
    }
  };

  const loadDocumentsFromDatabase = async () => {
    if (!currentSessionId) return;

    try {
      const dbDocuments = await getDocumentsBySession(currentSessionId);

      const formattedDocs: Document[] = dbDocuments.map(doc => ({
        id: doc.id,
        type: doc.document_type,
        title: doc.document_title,
        keyPoints: Array.isArray(doc.key_points) ? doc.key_points : [],
        fullContent: doc.full_content || '',
        pdfUrl: doc.pdf_url || undefined,
        status: doc.generation_status
      }));

      setDocuments(formattedDocs);
    } catch (error) {
      console.error('Error loading documents from database:', error);
    }
  };

  const generateAllDocuments = async () => {
    const documentTypes = ['registration', 'branding', 'compliance', 'hr'];
    const initialDocs: Document[] = documentTypes.map(type => ({
      id: `${type}-${Date.now()}`,
      type: type as any,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Guide`,
      keyPoints: [],
      fullContent: '',
      status: 'generating' as const
    }));

    setDocuments(initialDocs);
    setFlowStage('documents');
    setViewMode('dashboard');

    // Call edge functions for each document type
    const promises = documentTypes.map(type => generateDocument(type));
    await Promise.allSettled(promises);

    // Load documents from database after generation
    await loadDocumentsFromDatabase();

    // Show completion message and ask for rating
    setTimeout(async () => {
      setFlowStage('rating');
      setViewMode('chat');

      const ratingMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: '🎉 All your business documents have been generated!\n\nYou can view them in the document dashboard.\n\nHow would you rate your experience?\n\nPlease type a number from 1-5:\n\n1 ⭐ - Poor\n2 ⭐⭐ - Fair\n3 ⭐⭐⭐ - Good\n4 ⭐⭐⭐⭐ - Very Good\n5 ⭐⭐⭐⭐⭐ - Excellent',
        timestamp: new Date()
      };
      await addMessageAndSave(ratingMessage);
      setAwaitingRating(true);
    }, 3000);
  };

  const generateDocument = async (type: string) => {
    try {
      let functionName = '';
      if (type === 'registration') functionName = 'registration-guide-guru';
      else if (type === 'branding') functionName = 'branding-guide-guru';
      else if (type === 'compliance') functionName = 'compliance-guide-guru';
      else if (type === 'hr') functionName = 'hr-guide-guru';

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: 'generate_document',
          sessionId: currentSessionId,
          userId: currentUser.id,
          businessProfile: businessProfile
        })
      });

      if (response.ok) {
        const result = await response.json();

        // Check if the response contains an error
        if (result.error || result.userMessage) {
          console.error(`Error from edge function for ${type}:`, result);
          setDocuments(prev => prev.map(doc =>
            doc.type === type ? { ...doc, status: 'failed' as const } : doc
          ));
          return;
        }

        // Validate that we have actual content
        const fullContent = result.fullContent || result.response || '';
        if (!fullContent || fullContent.length < 100) {
          console.error(`Invalid or empty content received for ${type} document`);
          setDocuments(prev => prev.map(doc =>
            doc.type === type ? { ...doc, status: 'failed' as const } : doc
          ));
          return;
        }

        // Update document status with valid content
        setDocuments(prev => prev.map(doc =>
          doc.type === type ? {
            ...doc,
            status: 'completed' as const,
            keyPoints: result.keyPoints || [],
            fullContent: fullContent,
            pdfUrl: result.pdfUrl
          } : doc
        ));
      } else {
        // Mark as failed for non-200 responses
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to generate ${type} document:`, errorData);
        setDocuments(prev => prev.map(doc =>
          doc.type === type ? { ...doc, status: 'failed' as const } : doc
        ));
      }
    } catch (error) {
      console.error(`Error generating ${type} document:`, error);
      setDocuments(prev => prev.map(doc =>
        doc.type === type ? { ...doc, status: 'failed' as const } : doc
      ));
    }
  };

  const handleRatingResponse = async (userInput: string) => {
    const rating = parseInt(userInput.trim());

    if (rating >= 1 && rating <= 5) {
      setAwaitingRating(false);

      // Store rating
      await submitRating({
        user_id: currentUser?.id,
        session_id: currentSessionId,
        service_type: 'confirmed_idea_flow',
        rating: rating
      });

      const thankYouMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: `Thank you for your ${rating}-star rating! ${rating >= 4 ? '🎉 We\'re glad you had a great experience!' : ''}`,
        timestamp: new Date()
      };
      await addMessageAndSave(thankYouMessage);

      if (rating <= 3) {
        setTimeout(async () => {
          const feedbackMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: 'We\'re sorry to hear that. Could you briefly tell us what went wrong or what we could improve? Your feedback helps us serve you better.',
            timestamp: new Date()
          };
          await addMessageAndSave(feedbackMessage);
          setRatingFeedback('awaiting');
        }, 1000);
      } else {
        setTimeout(async () => {
          const finalMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: 'All your documents are available in the document tab. You can view or download them anytime. Thank you for using StartUP Companion!',
            timestamp: new Date()
          };
          await addMessageAndSave(finalMessage);

          // Update session status to completed
          if (currentSessionId) {
            await updateSessionStatus(currentSessionId, 'completed');
          }
        }, 1500);
      }
    } else if (ratingFeedback === 'awaiting') {
      // Handle feedback
      setRatingFeedback('');

      const feedbackThankYou: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Thank you for your feedback. Let us connect you with our expert mentors who can provide personalized guidance for each area of your business.',
        timestamp: new Date()
      };
      await addMessageAndSave(feedbackThankYou);

      // Get mentors for each service type
      const serviceTypes = ['registration', 'branding', 'compliance', 'hr'];
      const mentorPromises = serviceTypes.map(type => getMentorForService(type));
      const mentors = await Promise.all(mentorPromises);

      const mentorCards = mentors
        .filter(mentor => mentor !== null)
        .map((mentor, index) => ({
          name: mentor!.name,
          email: mentor!.email,
          phone: mentor!.phone || '',
          expertise: mentor!.specialization.join(', '),
          service: serviceTypes[index].charAt(0).toUpperCase() + serviceTypes[index].slice(1)
        }));

      if (mentorCards.length > 0) {
        setTimeout(async () => {
          const mentorMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: '📞 Your Recommended Mentors',
            timestamp: new Date(),
            mentorCards: mentorCards
          };
          await addMessageAndSave(mentorMessage);

          // Update session status to completed
          if (currentSessionId) {
            await updateSessionStatus(currentSessionId, 'completed');
          }
        }, 1500);
      }
    } else {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: 'Please provide a valid rating between 1 and 5.',
        timestamp: new Date()
      };
      await addMessageAndSave(errorMessage);
    }
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setViewMode('document');
  };

  const handleDownloadPdf = (doc: Document) => {
    if (doc.pdfUrl) {
      window.open(doc.pdfUrl, '_blank');
    }
  };

  const handleBackToDashboard = () => {
    setSelectedDocument(null);
    setViewMode('dashboard');
  };


  const handleLogout = async () => {
    await auth.signOut();
    if (onNavigate) {
      onNavigate('home');
    }
  };

  const renderMainContent = () => {
    if (viewMode === 'dashboard') {
      return (
        <DocumentDashboard
          documents={documents}
          onViewDocument={handleViewDocument}
          onDownloadPdf={handleDownloadPdf}
          onBackToChat={() => setViewMode('chat')}
        />
      );
    }

    if (viewMode === 'document' && selectedDocument) {
      return (
        <DocumentViewer
          document={selectedDocument}
          onBack={handleBackToDashboard}
          onDownloadPdf={() => handleDownloadPdf(selectedDocument)}
        />
      );
    }

    // Chat view
    return (
      <div className="flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-3xl flex ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                }`}>
                  {message.type === 'user' ?
                    <User className="h-4 w-4" /> :
                    <Bot className="h-4 w-4" />
                  }
                </div>

                {/* Message Content */}
                <div className={`rounded-lg p-4 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  <p className="whitespace-pre-line">{message.content}</p>

                  {/* Single Mentor Card */}
                  {message.mentorCard && (
                    <div className="mt-3 bg-gray-700 rounded-lg p-3">
                      <h4 className="font-semibold text-white mb-2">Connect with Expert</h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">{message.mentorCard.name}</p>
                        <p className="text-gray-300">{message.mentorCard.expertise}</p>
                        <div className="flex items-center space-x-4">
                          <a href={`mailto:${message.mentorCard.email}`} className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                            <Mail className="h-4 w-4" />
                            <span>Email</span>
                          </a>
                          <a href={`tel:${message.mentorCard.phone}`} className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                            <Phone className="h-4 w-4" />
                            <span>Call</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multiple Mentor Cards */}
                  {message.mentorCards && message.mentorCards.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {message.mentorCards.map((mentor, index) => (
                        <div key={index} className="bg-gray-700 rounded-lg p-3">
                          <h4 className="font-semibold text-white mb-2">{mentor.service} Expert</h4>
                          <div className="space-y-2 text-sm">
                            <p className="font-medium">{mentor.name}</p>
                            <p className="text-gray-300">{mentor.expertise}</p>
                            <div className="flex items-center space-x-4">
                              <a href={`mailto:${mentor.email}`} className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                                <Mail className="h-4 w-4" />
                                <span>Email</span>
                              </a>
                              {mentor.phone && (
                                <a href={`tel:${mentor.phone}`} className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                                  <Phone className="h-4 w-4" />
                                  <span>Call</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg transition-colors duration-200"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img src="/Logo Gear.png" alt="StartUP Companion Logo" className="h-8 w-8" />
              <span className="text-xl font-bold text-white">StartUP Companion</span>
            </div>

            <div className="flex items-center space-x-4">
              {flowStage === 'documents' || flowStage === 'rating' ? (
                <button
                  onClick={() => setViewMode('dashboard')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <FileCheck className="h-5 w-5" />
                  <span>Documents</span>
                </button>
              ) : null}

              <button
                onClick={handleLogout}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {renderMainContent()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2">
            <img src="/Logo Gear.png" alt="StartUP Companion Logo" className="h-6 w-6" />
            <span className="text-lg font-bold text-white">StartUP Companion</span>
          </div>
          <p className="text-center text-gray-400 text-sm mt-2">
            Launch your business in personalized way in 30 minutes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
