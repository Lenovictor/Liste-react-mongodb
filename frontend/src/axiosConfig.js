import axios from "axios";

const api = axios.create({
  baseURL: "https://liste-react-mongodb.onrender.com/",
  withCredentials: true,
});

export default api;
