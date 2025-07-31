import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";

// Components
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Clientes from "./components/Clientes";
import Pedidos from "./components/Pedidos";
import Facturas from "./components/Facturas";
import Compras from "./components/Compras";
import Remitos from "./components/Remitos";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/facturas" element={<Facturas />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/remitos" element={<Remitos />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;