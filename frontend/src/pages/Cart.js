import React, {useEffect, useState} from "react";
import { client } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Cart(){
  const [cart, setCart] = useState({ items: [] });
  const navigate = useNavigate();

  useEffect(()=>{
    // demo user approach: you should decode user id from token
    const userId = "demo-user";
    client().get(`/cart/${userId}`)
      .then(r => setCart(r.data || { items: [] }))
      .catch(e => console.error(e));
  }, []);

  const checkout = () => navigate("/checkout");

  return (
    <div>
      <h3>Your Cart</h3>
      {cart.items && cart.items.length ? (
        <>
          <ul className="cart-list">
            {cart.items.map((it, idx) => (
              <li key={idx}>
                {it.productId} x {it.qty}
              </li>
            ))}
          </ul>
          <button className="btn" onClick={checkout}>Checkout</button>
        </>
      ) : <div className="small">Your cart is empty</div>}
    </div>
  );
}
