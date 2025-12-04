import React, {useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../api";

export default function Product(){
  const { id } = useParams();
  const [product,setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(()=> {
    apiClient().get(`/products/${id}`).then(r => setProduct(r.data)).catch(e => console.error(e));
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if(!token){ navigate("/login"); return; }
    await apiClient().post(`/cart/${JSON.parse(atob(token.split('.')[1] || ''))?.id || 'me'}/add`, { productId: id, qty: 1 })
      .then(()=> alert("Added to cart"))
      .catch(e => console.error(e));
  };

  if(!product) return <div>Loading...</div>;
  return (
    <div>
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p><strong>${product.price}</strong></p>
      <button onClick={addToCart}>Add to cart</button>
    </div>
  );
}
