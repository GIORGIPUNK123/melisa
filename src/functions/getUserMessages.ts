import { api } from './instance';

export const getUserMessages = async (fromId: number, toId: number) =>
  await api
    .get(`/personmessages/${fromId}/${toId}`)
    .then((res) => {
      // console.log('res.data.result: ', res.data.result);
      return res.data.result;
    })
    .catch((err) => {
      console.log(err);
    });
