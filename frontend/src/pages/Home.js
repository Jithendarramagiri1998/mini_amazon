import React, {useEffect, useState} from "react";
import { client } from "../api";
import ProductCard from "../components/ProductCard";

export default function Home(){
  const [products, setProducts] = useState([]);
  useEffect(()=>{
    client().get("/products")
      .then(r => setProducts(r.data || []))
      .catch(e => {
        console.error(e);
        // show empty
      });
  }, []);
  return (
    <div>
      <h2>Products</h2>
      <div className="grid">
        {products.length ? products.map(p => <ProductCard key={p.id} p={p} />) : <div className="center small">No products found</div>}
      </div>
    </div>
  );
}
