import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({p}){
  return (
    <div className="card product-card">
      <div style={{height:120, background:"#fafafa", display:"flex", alignItems:"center", justifyContent:"center"}}>Image</div>
      <h4 style={{margin:"10px 0 6px"}}>{p.title}</h4>
      <p className="small">{p.description ? p.description.slice(0,80) : ""}</p>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8}}>
        <strong>${p.price}</strong>
        <Link to={`/product/${p.id}`}>View</Link>
      </div>
    </div>
  );
}
