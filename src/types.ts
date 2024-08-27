export interface MessageType {
  id: number;
  from_id: number;
  to_id: number;
  message: string;
  sent_datetime: string;
}
export interface UserType {
  user_auth_id: string;
  user_email: string;
  user_nickname: string;
  user_username: string;
}

export interface FriendType {
  sender_id: string;
  receiver_id: string;
  confirmed: boolean;
  created_at: number;
  confirmed_at: number;
}
