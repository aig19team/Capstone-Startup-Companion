import { supabase } from './supabase';

export interface GeneratedDocument {
  id: string;
  user_id: string;
  session_id: string;
  document_type: 'registration' | 'branding' | 'compliance' | 'hr';
  document_title: string;
  key_points: string[] | string;
  full_content: string;
  pdf_url: string | null;
  pdf_file_name: string | null;
  generation_status: 'generating' | 'completed' | 'failed';
  service_type?: string;
  created_at: string;
  updated_at: string;
}

export async function getDocumentsBySession(sessionId: string): Promise<GeneratedDocument[]> {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching documents by session:', error);
      return [];
    }

    return (data || []).map(doc => ({
      ...doc,
      key_points: typeof doc.key_points === 'string' ? JSON.parse(doc.key_points) : doc.key_points
    }));
  } catch (error) {
    console.error('Unexpected error fetching documents by session:', error);
    return [];
  }
}

export async function getDocumentsByUser(userId: string): Promise<GeneratedDocument[]> {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents by user:', error);
      return [];
    }

    return (data || []).map(doc => ({
      ...doc,
      key_points: typeof doc.key_points === 'string' ? JSON.parse(doc.key_points) : doc.key_points
    }));
  } catch (error) {
    console.error('Unexpected error fetching documents by user:', error);
    return [];
  }
}

export async function getDocumentById(documentId: string): Promise<GeneratedDocument | null> {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('id', documentId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching document by ID:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      key_points: typeof data.key_points === 'string' ? JSON.parse(data.key_points) : data.key_points
    };
  } catch (error) {
    console.error('Unexpected error fetching document by ID:', error);
    return null;
  }
}

export async function getDocumentByTypeAndSession(
  sessionId: string,
  documentType: 'registration' | 'branding' | 'compliance' | 'hr'
): Promise<GeneratedDocument | null> {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('session_id', sessionId)
      .eq('document_type', documentType)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching document by type and session:', error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      key_points: typeof data.key_points === 'string' ? JSON.parse(data.key_points) : data.key_points
    };
  } catch (error) {
    console.error('Unexpected error fetching document by type and session:', error);
    return null;
  }
}

export async function getLatestDocumentsByUser(
  userId: string
): Promise<Map<string, GeneratedDocument>> {
  try {
    const { data, error } = await supabase
      .from('generated_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching latest documents:', error);
      return new Map();
    }

    if (!data) return new Map();

    const latestDocs = new Map<string, GeneratedDocument>();

    for (const doc of data) {
      if (!latestDocs.has(doc.document_type)) {
        const parsedDoc = {
          ...doc,
          key_points: typeof doc.key_points === 'string' ? JSON.parse(doc.key_points) : doc.key_points
        };
        latestDocs.set(doc.document_type, parsedDoc);
      }
    }

    return latestDocs;
  } catch (error) {
    console.error('Unexpected error fetching latest documents:', error);
    return new Map();
  }
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    const doc = await getDocumentById(documentId);

    if (doc && doc.pdf_file_name) {
      const { error: storageError } = await supabase.storage
        .from('business-documents')
        .remove([doc.pdf_file_name]);

      if (storageError) {
        console.error('Error deleting PDF from storage:', storageError);
      }
    }

    const { error } = await supabase
      .from('generated_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Error deleting document:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting document:', error);
    return false;
  }
}

export async function updateDocumentStatus(
  documentId: string,
  status: 'generating' | 'completed' | 'failed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('generated_documents')
      .update({ generation_status: status })
      .eq('id', documentId);

    if (error) {
      console.error('Error updating document status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error updating document status:', error);
    return false;
  }
}
