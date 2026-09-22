// User types
export interface UserT extends PublicProfileT {
  email: string;
  iv: string;
  salt: string;
  encrypted_private_key: string;
  public_key: string;
  appear_offline: boolean;
}

// Public user profile (without email)
export interface PublicProfileT {
  id: string;
  username: string;
  nickname: string;
  avatar_url?: string;
  status: 'online' | 'offline' | 'away';
  created_at: string;
  updated_at: string;
  public_key: string;
  last_seen_at?: string | null;
  appear_offline?: boolean;
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
export interface FriendT {
  friendshipId: string;
  userId: string;
  username: string;
  nickname: string;
  avatarUrl?: string;
  status: 'online' | 'offline' | 'away';
  last_seen_at?: string | null;
  appear_offline?: boolean;
  conversationId?: string | null;
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
  type: string;
  name?: string;
  otherUserNickname: string;
  otherUserAvatar?: string;
  otherUserId: string;
  lastMessageTime?: string;
  muted: boolean;
}
export interface ConversationMemberT {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
  last_message_at: string;
  muted?: boolean;
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

export interface ReactionTypeT {
  uid: string;
  reaction: string;
  name: string;
}

export interface MessageReactionT {
  id: string;
  message_id: string;
  conversation_id: string;
  user_id: string;
  reaction_id: string;
  created_at: string;
  reaction?: ReactionTypeT | null;
}

export type ReactionChipT = {
  reactionId: string;
  emoji: string;
  name: string;
  count: number;
  reactedByMe: boolean;
};

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
