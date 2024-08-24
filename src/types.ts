export interface MessageType {
  id: number;
  from_id: number;
  to_id: number;
  message: string;
  sent_datetime: string;
}
export interface UserType {
  id: number;
  first_name: string;
  last_name: string;
  nickname: string;
  email: string;
  number: number;
  password: string;
  verified: boolean;
  locked: boolean;
}
