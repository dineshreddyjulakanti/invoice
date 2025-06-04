import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getInvoices } from '../api/invoices';

export default function InvoiceList() {
  const [rows, setRows] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    getInvoices().then(({ data }) =>
      setRows(data.map(r => ({ id: r._id, ...r })))
    );
  }, []);

  const cols = [
    { field: 'invoiceNumber', headerName: 'Invoice #', width: 120 },
    { field: 'date', headerName: 'Date', width: 120,
      valueGetter: v => new Date(v).toLocaleDateString() },
    { field: 'customerName', headerName: 'Customer', width: 200 },
    { field: 'totalAmount', headerName: 'Total', width: 120 }
  ];

  return (
    <Stack spacing={2}>
      <Button variant="contained"
              sx={{ alignSelf: 'flex-end' }}
              onClick={() => nav('/invoices/new')}>
        Add Invoice
      </Button>

      <div style={{ height: 500, width: '100%' }}>
        <DataGrid rows={rows} columns={cols} pageSize={10}
                  onRowClick={({ id }) => nav(`/invoices/${id}`)} />
      </div>
    </Stack>
  );
}
