import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import InvoiceList from './components/InvoiceList';
import InvoiceDetail from './components/InvoiceDetail';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/invoices" replace />} />
        <Route path="/invoices"    element={<InvoiceList />} />
        <Route path="/invoices/new"       element={<InvoiceDetail mode="create" />} />
        <Route path="/invoices/:id"       element={<InvoiceDetail mode="update" />} />
      </Routes>
    </Layout>
  );
}

export default App;
