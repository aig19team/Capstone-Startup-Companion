import { supabase } from './supabase';

export interface Mentor {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  specialization: string[];
  bio: string;
  availability_status: string;
}

export interface ServiceRating {
  user_id: string;
  session_id: string;
  service_type: string;
  rating: number;
  feedback_reason?: string;
  mentor_assigned?: boolean;
  mentor_id?: string;
}

export async function submitRating(ratingData: ServiceRating): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('service_ratings')
      .insert([ratingData]);

    if (error) {
      console.error('Error submitting rating:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error submitting rating:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getMentorForService(serviceType: string): Promise<Mentor | null> {
  try {
    const { data, error } = await supabase
      .from('mentors')
      .select('*')
      .contains('specialization', [serviceType])
      .eq('availability_status', 'active')
      .order('average_rating', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching mentor:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error fetching mentor:', err);
    return null;
  }
}

export function getServiceTypeFromName(serviceName: string): string {
  const serviceMap: Record<string, string> = {
    'registration': 'registration',
    'idea_tuning': 'idea_tuning',
    'compliance': 'compliance',
    'branding': 'branding',
    'hr_setup': 'hr_setup',
    'financial_planning': 'financial_planning'
  };

  return serviceMap[serviceName.toLowerCase()] || serviceName.toLowerCase();
}
