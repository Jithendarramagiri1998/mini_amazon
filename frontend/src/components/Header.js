import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header(){
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const logout = () => { localStorage.removeItem("token"); navigate("/"); };

  return (
    <div style={{ display:"flex", gap:20, padding:10, borderBottom:"1px solid #ddd" }}>
      <Link to="/">Mini-Amazon</Link>
      <Link to="/">Products</Link>
      <Link to="/cart">Cart</Link>
      {token ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  );
}
