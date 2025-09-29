import React, { useEffect, useState } from "react";
import API from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({ email: "", phone: "", fullName: "" });

  useEffect(() => {
    API.get("/users/profile", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    }).then(res => setProfile(res.data));
  }, []);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async () => {
    await API.put("/users/profile", profile, {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    });
    alert("Cập nhật thành công!");
  };

  return (
    <div>
      <h2>Thông tin cá nhân</h2>
      <input name="fullName" value={profile.fullName} onChange={handleChange} />
      <input name="email" value={profile.email} onChange={handleChange} />
      <input name="phone" value={profile.phone} onChange={handleChange} />
      <button onClick={handleSave}>Lưu</button>
    </div>
  );
}
export default Profile;
