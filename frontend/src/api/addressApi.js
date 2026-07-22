import client from "./client.js";

export const addressApi = {
  fetchAddresses: () => client.get("/addresses").then((res) => res.data),
  createAddress: (data) => client.post("/addresses", data).then((res) => res.data),
  updateAddress: (id, data) => client.put(`/addresses/${id}`, data).then((res) => res.data),
  deleteAddress: (id) => client.delete(`/addresses/${id}`).then((res) => res.data),
  setDefaultAddress: (id) => client.put(`/addresses/${id}/default`).then((res) => res.data),
};
