import { api } from '../../../api/instance';

export const getUserMessages = async (fromId: number, toId: number) => {
  try {
    const res = await api.get(`/personmessages/${fromId}/${toId}`);
    return res.data.result;
  } catch (err) {
    console.log(err);
    return null;
  }
};
