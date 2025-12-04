import React, {useEffect, useState} from "react";
import { apiClient } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Cart(){
  const [cart, setCart] = useState({ items: [] });
  const navigate = useNavigate();

  useEffect(()=> {
    const userId = "demo-user"; // adapt for your flow; or extract from token
    apiClient().get(`/cart/${userId}`).then(r => setCart(r.data)).catch(e => console.error(e));
  }, []);

  const checkout = () => navigate("/checkout");

  return (
    <div>
      <h3>Your Cart</h3>
      {cart.items && cart.items.length ? (
        <>
          <ul>
            {cart.items.map((it, idx) => <li key={idx}>{it.productId} x {it.qty}</li>)}
          </ul>
          <button onClick={checkout}>Checkout</button>
        </>
      ) : <div>Your cart is empty</div>}
    </div>
  );
}
