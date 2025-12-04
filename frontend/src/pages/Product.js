import React, {useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { client } from "../api";

export default function Product(){
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    client().get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(e => console.error(e));
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");
    // decode token or use demo-user
    const userId = JSON.parse(atob(token.split('.')[1] || 'eyJpZCI6ImRlbW8ifQ.')).id || "demo-user";
    await client().post(`/cart/${userId}/add`, { productId: id, qty: 1 })
      .then(() => alert("Added to cart"))
      .catch(e => alert("Add to cart failed"));
  };

  if (!product) return <div>Loading...</div>;
  return (
    <div>
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p><strong>${product.price}</strong></p>
      <button className="btn" onClick={addToCart}>Add to cart</button>
    </div>
  );
}
