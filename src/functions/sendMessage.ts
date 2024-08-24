import { socket } from '../socket';
import { api } from './instance';

export const sendPrivate = async (
  text: string,
  sender_id: number,
  reciever_id: number
) => {
  try {
    socket.emit('txt-message', { text, sender_id, reciever_id });

    // const response = await api.post('/sendprivate', {
    //   text,
    //   sender_id,
    //   reciever_id,
    // });
    // console.log('res.data.result:', response.data.result);
    // return response.data.result;
    return 'im testing for now';
  } catch (error) {
    console.error(error);
  }
};
