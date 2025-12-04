import React, {useState} from "react";
import { client } from "../api";
import { useNavigate } from "react-router-dom";

export default function Checkout(){
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  const placeOrder = async () => {
    setLoading(true);
    try {
      const userId = "demo-user";
      // In real flow fetch cart items and calculate total
      const items = [{ productId: "sample", qty: 1 }];
      const total = 10;
      const orderRes = await client().post("/orders", { userId, items, total });
      const payRes = await client().post("/pay", { orderId: orderRes.data.id, userId, amount: total });
      alert(`Order placed — payment ${payRes.data.status}`);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{maxWidth:420}}>
      <h3>Checkout</h3>
      <button className="btn" onClick={placeOrder} disabled={loading}>{loading ? "Processing..." : "Place order"}</button>
    </div>
  );
}
