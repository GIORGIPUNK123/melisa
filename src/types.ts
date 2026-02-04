// User types
export interface UserT {
  id: string;
  email: string;
  username: string;
  nickname: string;
  avatar_url?: string | null;
  status?: string;
  created_at?: string;
}

// Public user profile (without email)
export interface PublicProfile {
  id: string;
  username: string;
  nickname: string;
  avatar_url?: string | null;
  status?: string;
}

// Friendship types
export interface Friendship {
  id: string;
  user_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  updated_at: string;
}

// Block types
export interface Block {
  id: string;
  blocker_id: string;
  blocked_user_id: string;
  created_at: string;
}

// Conversation types
export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Conversation member types
export interface ConversationMember {
  id: string;
  username: string;
  nickname: string;
  avatar_url?: string;
}

// Message types (with sender info)
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  created_at: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}
