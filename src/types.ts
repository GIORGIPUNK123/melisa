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
export interface PublicProfileT {
  id: string;
  username: string;
  nickname: string;
  avatar_url?: string | null;
  status?: string;
}

// Friendship types
export interface FriendshipT {
  id: string;
  user_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  updated_at: string;
}

// Block types
export interface BlockT {
  id: string;
  blocker_id: string;
  blocked_user_id: string;
  created_at: string;
}

// Conversation types
export interface ConversationT {
  id: string;
  type: 'direct' | 'group';
  name?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Conversation member types
export interface ConversationMemberT {
  id: string;
  username: string;
  nickname: string;
  avatar_url?: string;
}

// Message types (with sender info)
export interface MessageT {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file';
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

// Notification types
export interface NotificationT {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  is_read: boolean;
  created_at: string;
}
