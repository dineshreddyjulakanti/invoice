/* ---------- imports (all at top) ---------- */
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'; // plugin

import {
  Stack,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

import {
  createInvoice,
  getInvoice,
  updateInvoice,
  deleteInvoice
} from '../api/invoices';

/* ---------- plugin registration (first non-import line) ---------- */
dayjs.extend(isSameOrAfter);

/* ---------- yup schema ---------- */
const schema = yup
  .object({
    date: yup
      .string()
      .required()
      .test(
        'future',
        'Back-dated not allowed',
        v => dayjs(v).isSameOrAfter(dayjs(), 'day')
      ),
    customerName: yup.string().required(),
    billingAddress: yup.string().required(),
    shippingAddress: yup.string().required(),
    GSTIN: yup.string().required(),
    items: yup
      .array()
      .of(
        yup.object({
          itemName: yup.string().required(),
          quantity: yup.number().positive().required(),
          price: yup.number().positive().required()
        })
      )
      .min(1),
    billSundrys: yup.array().of(
      yup.object({
        billSundryName: yup.string().required(),
        amount: yup.number().required()
      })
    )
  })
  .required();

/* ---------- component ---------- */
export default function InvoiceDetail({ mode }) {
  const { id } = useParams();
  const nav = useNavigate();

  const { control, handleSubmit, reset, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      date: dayjs().format('YYYY-MM-DD'),
      customerName: '',
      billingAddress: '',
      shippingAddress: '',
      GSTIN: '',
      items: [{ itemName: '', quantity: 1, price: 0 }],
      billSundrys: []
    }
  });

  const {
    fields: items,
    append: addItem,
    remove: rmItem
  } = useFieldArray({ control, name: 'items' });

  const {
    fields: sundry,
    append: addSundry,
    remove: rmSundry
  } = useFieldArray({ control, name: 'billSundrys' });

  /* load existing invoice */
  useEffect(() => {
    if (mode === 'update') {
      getInvoice(id).then(({ data }) =>
        reset({
          ...data,
          date: dayjs(data.date).format('YYYY-MM-DD')
        })
      );
    }
  }, [id, mode, reset]);

  /* submit handler */
  const onSubmit = async d => {
    const itemsWithAmt = d.items.map(i => ({
      ...i,
      amount: i.quantity * i.price
    }));

    const total =
      itemsWithAmt.reduce((t, i) => t + i.amount, 0) +
      d.billSundrys.reduce((t, b) => t + (+b.amount || 0), 0);

    const payload = { ...d, items: itemsWithAmt, totalAmount: total };

    if (mode === 'create') {
      await createInvoice(payload);
    } else {
      await updateInvoice(id, payload);
    }
    nav('/invoices');
  };

  /* delete handler */
  const remove = async () => {
    await deleteInvoice(id);
    nav('/invoices');
  };

  /* live total for UI */
  const total =
    watch('items').reduce((t, i) => t + i.quantity * i.price, 0) +
    watch('billSundrys').reduce((t, b) => t + (+b.amount || 0), 0);

  /* ---------- UI ---------- */
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Typography variant="h6">
          {mode === 'create' ? 'Create Invoice' : 'Edit Invoice'}
        </Typography>

        {/* header fields */}
        {['date', 'customerName', 'billingAddress', 'shippingAddress', 'GSTIN'].map(
          name => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={name.replace(/([A-Z])/g, ' $1')}
                  type={name === 'date' ? 'date' : 'text'}
                  InputLabelProps={name === 'date' ? { shrink: true } : undefined}
                  required
                />
              )}
            />
          )
        )}

        {/* items table */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Items</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((it, i) => (
                <TableRow key={it.id}>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`items.${i}.itemName`}
                      render={({ field }) => (
                        <TextField {...field} variant="standard" />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`items.${i}.quantity`}
                      render={({ field }) => (
                        <TextField {...field} type="number" variant="standard" />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`items.${i}.price`}
                      render={({ field }) => (
                        <TextField {...field} type="number" variant="standard" />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    {(
                      watch(`items.${i}.quantity`) * watch(`items.${i}.price`)
                    ).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => rmItem(i)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            startIcon={<Add />}
            onClick={() => addItem({ itemName: '', quantity: 1, price: 0 })}
          >
            Add Item
          </Button>
        </Paper>

        {/* bill sundry */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1">Bill Sundry</Typography>
          {sundry.map((b, i) => (
            <Stack
              direction="row"
              spacing={1}
              key={b.id}
              alignItems="center"
            >
              <Controller
                control={control}
                name={`billSundrys.${i}.billSundryName`}
                render={({ field }) => (
                  <TextField {...field} label="Name" />
                )}
              />
              <Controller
                control={control}
                name={`billSundrys.${i}.amount`}
                render={({ field }) => (
                  <TextField {...field} label="Amount" type="number" />
                )}
              />
              <IconButton onClick={() => rmSundry(i)}>
                <Delete fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button
            startIcon={<Add />}
            onClick={() => addSundry({ billSundryName: '', amount: 0 })}
          >
            Add Sundry
          </Button>
        </Paper>

        <Typography variant="h6">Total ₹ {total.toFixed(2)}</Typography>

        {/* actions */}
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" onClick={() => nav('/invoices')}>
            Cancel
          </Button>
          {mode === 'update' && (
            <Button color="error" onClick={remove}>
              Delete
            </Button>
          )}
          <Button variant="contained" type="submit">
            Save
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
