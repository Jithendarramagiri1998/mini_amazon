import React, {useState} from "react";
import { apiClient } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await apiClient().post("/users/login", { email, password });
      // r.data.token expected
      localStorage.setItem("token", r.data.token);
      alert("Logged in");
      navigate("/");
    } catch (err) {
      alert("Login failed");
      console.error(err);
    }
  };

  return (
    <form onSubmit={submit}>
      <h3>Login</h3>
      <div><input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
      <div><input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
      <button type="submit">Login</button>
    </form>
  );
}
