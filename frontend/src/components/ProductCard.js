import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({p}){
  return (
    <div style={{border:"1px solid #eee", padding:10, width:220}}>
      <h4>{p.title}</h4>
      <p style={{fontSize:14}}>{p.description?.slice(0,80)}</p>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <strong>${p.price}</strong>
        <Link to={`/product/${p.id}`}>View</Link>
      </div>
    </div>
  );
}
