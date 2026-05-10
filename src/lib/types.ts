export interface Unit {
  id: string;
  sila_number: number;
  title: string;
  hook_question: string;
  color_accent: string;
}

export interface Reflection {
  id: string;
  unit_id: string;
  author_id: string | null;
  content: string;
  is_anonymous: boolean;
  author_name: string;
  status: 'pending' | 'verified' | 'rejected';
  ai_feedback: string | null;
  created_at: string;
}

export interface Discussion {
  id: string;
  unit_id: string;
  author_id: string | null;
  title: string;
  content: string;
  status: 'pending' | 'verified' | 'rejected';
  ai_feedback: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  discussion_id: string;
  author_id: string | null;
  author_name?: string | null;
  content: string;
  created_at: string;
}
