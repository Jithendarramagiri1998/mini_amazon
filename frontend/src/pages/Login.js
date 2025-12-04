import React, {useState} from "react";
import { client } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      const r = await client().post("/users/login", { email, password });
      // Expecting { token: "..." }
      if (r.data && r.data.token) {
        localStorage.setItem("token", r.data.token);
        alert("Logged in");
        navigate("/");
      } else {
        alert("Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Login error");
    }
  };

  return (
    <div className="card" style={{maxWidth:420}}>
      <h3>Login</h3>
      <form className="form" onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  );
}
