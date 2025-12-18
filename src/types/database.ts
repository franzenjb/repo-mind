export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          github_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          github_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          github_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          repository_url: string | null;
          repository_name: string | null;
          status: 'active' | 'archived' | 'completed';
          ai_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          repository_url?: string | null;
          repository_name?: string | null;
          status?: 'active' | 'archived' | 'completed';
          ai_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          repository_url?: string | null;
          repository_name?: string | null;
          status?: 'active' | 'archived' | 'completed';
          ai_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          session_id: string | null;
          user_id: string;
          title: string;
          content: string;
          content_html: string | null;
          ai_summary: string | null;
          file_path: string | null;
          line_start: number | null;
          line_end: number | null;
          word_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          user_id: string;
          title: string;
          content: string;
          content_html?: string | null;
          ai_summary?: string | null;
          file_path?: string | null;
          line_start?: number | null;
          line_end?: number | null;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          user_id?: string;
          title?: string;
          content?: string;
          content_html?: string | null;
          ai_summary?: string | null;
          file_path?: string | null;
          line_start?: number | null;
          line_end?: number | null;
          word_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      qa_cards: {
        Row: {
          id: string;
          session_id: string | null;
          user_id: string;
          question: string;
          answer: string;
          difficulty: string | null;
          ai_generated: boolean;
          source_note_id: string | null;
          times_reviewed: number;
          times_correct: number;
          last_reviewed: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          session_id?: string | null;
          user_id: string;
          question: string;
          answer: string;
          difficulty?: string | null;
          ai_generated?: boolean;
          source_note_id?: string | null;
          times_reviewed?: number;
          times_correct?: number;
          last_reviewed?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string | null;
          user_id?: string;
          question?: string;
          answer?: string;
          difficulty?: string | null;
          ai_generated?: boolean;
          source_note_id?: string | null;
          times_reviewed?: number;
          times_correct?: number;
          last_reviewed?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      screenshots: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          note_id: string | null;
          file_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          annotations: Json;
          alt_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          note_id?: string | null;
          file_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          annotations?: Json;
          alt_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          note_id?: string | null;
          file_path?: string;
          file_name?: string;
          file_size?: number;
          mime_type?: string;
          annotations?: Json;
          alt_text?: string | null;
          created_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      session_tags: {
        Row: {
          session_id: string;
          tag_id: string;
        };
        Insert: {
          session_id: string;
          tag_id: string;
        };
        Update: {
          session_id?: string;
          tag_id?: string;
        };
      };
      note_tags: {
        Row: {
          note_id: string;
          tag_id: string;
        };
        Insert: {
          note_id: string;
          tag_id: string;
        };
        Update: {
          note_id?: string;
          tag_id?: string;
        };
      };
      qa_card_tags: {
        Row: {
          qa_card_id: string;
          tag_id: string;
        };
        Insert: {
          qa_card_id: string;
          tag_id: string;
        };
        Update: {
          qa_card_id?: string;
          tag_id?: string;
        };
      };
    };
    Functions: {
      search_all_content: {
        Args: {
          search_query: string;
          p_user_id: string;
        };
        Returns: {
          result_type: string;
          result_id: string;
          title: string;
          snippet: string;
          rank: number;
        }[];
      };
    };
  };
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type StudySession = Database['public']['Tables']['study_sessions']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type QACard = Database['public']['Tables']['qa_cards']['Row'];
export type Screenshot = Database['public']['Tables']['screenshots']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type StudySessionInsert = Database['public']['Tables']['study_sessions']['Insert'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];
export type QACardInsert = Database['public']['Tables']['qa_cards']['Insert'];
export type ScreenshotInsert = Database['public']['Tables']['screenshots']['Insert'];
export type TagInsert = Database['public']['Tables']['tags']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type StudySessionUpdate = Database['public']['Tables']['study_sessions']['Update'];
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];
export type QACardUpdate = Database['public']['Tables']['qa_cards']['Update'];
export type ScreenshotUpdate = Database['public']['Tables']['screenshots']['Update'];
export type TagUpdate = Database['public']['Tables']['tags']['Update'];

// Extended types with relations
export type StudySessionWithTags = StudySession & {
  tags: Tag[];
};

export type NoteWithTags = Note & {
  tags: Tag[];
};

export type QACardWithTags = QACard & {
  tags: Tag[];
};

export type StudySessionWithDetails = StudySession & {
  tags: Tag[];
  notes: Note[];
  qa_cards: QACard[];
  screenshots: Screenshot[];
};
