import { api } from './instance';

export const getPersonById = async (id: number) =>
  await api
    .get(`/userinfo/${id}`)
    .then((res) => {
      // console.log(res.data);
      return res.data.result;
    })
    .catch((err) => {
      console.log(err);
    });
