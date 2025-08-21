import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import "./App.css";

// Components
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Ventas from "./components/Ventas";
import Articulos from "./components/Articulos";
import Clientes from "./components/Clientes";
import Pedidos from "./components/Pedidos";
import Facturas from "./components/Facturas";
import Compras from "./components/Compras";
import Remitos from "./components/Remitos";
import ReporteFinanciero from "./components/ReporteFinanciero";
import ReporteVentas from "./components/ReporteVentas";
import ReporteCompras from "./components/ReporteCompras";
import Configuracion from "./components/Configuracion";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ventas" element={<Ventas />} />
            <Route path="/articulos" element={<Articulos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/facturas" element={<Facturas />} />
            <Route path="/compras" element={<Compras />} />
            <Route path="/remitos" element={<Remitos />} />
            <Route path="/reportes/financiero" element={<ReporteFinanciero />} />
            <Route path="/reportes/ventas" element={<ReporteVentas />} />
            <Route path="/reportes/compras" element={<ReporteCompras />} />
            <Route path="/configuracion" element={<Configuracion />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </div>
  );
}

export default App;