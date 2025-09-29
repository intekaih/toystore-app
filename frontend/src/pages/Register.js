import React, { useState } from "react";
import API from "../services/api";

function Register() {
  const [form, setForm] = useState({ username: "", password: "", email: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert("Đăng ký thành công!");
    } catch (err) {
      alert("Đăng ký thất bại!");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Đăng ký</h2>
      <input name="username" placeholder="Tên đăng nhập" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input type="password" name="password" placeholder="Mật khẩu" onChange={handleChange} />
      <button type="submit">Đăng ký</button>
    </form>
  );
}
export default Register;
