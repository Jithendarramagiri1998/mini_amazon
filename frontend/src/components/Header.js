import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header(){
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="header">
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <div className="brand"><Link to="/">Mini-Amazon</Link></div>
        <nav>
          <Link to="/">Products</Link>
          <Link to="/cart" style={{marginLeft:12}}>Cart</Link>
        </nav>
      </div>
      <div>
        {token ? (
          <>
            <button className="btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn">Login</Link>
        )}
      </div>
    </div>
  );
}
