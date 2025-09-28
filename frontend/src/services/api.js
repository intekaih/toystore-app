import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // trỏ tới backend NodeJS
});

export default API;
