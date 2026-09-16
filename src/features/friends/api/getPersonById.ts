import { api } from '../../../api/instance';

export const getPersonById = async (id: number) => {
  try {
    const res = await api.get(`/userinfo/${id}`);
    return res.data.result;
  } catch (err) {
    console.log(err);
    return null;
  }
};
