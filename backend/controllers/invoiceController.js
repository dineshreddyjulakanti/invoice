import Invoice from '../models/Invoice.js';

/* ---------- helpers ---------- */
const totals = ({ items, billSundrys }) => ({
  itemsTotal: items.reduce((t, i) => t + i.quantity * i.price, 0),
  sundryTotal: billSundrys.reduce((t, b) => t + b.amount, 0)
});

const validate = body => {
  const errors = [];
  /* date not in past */
  if (!body.date || new Date(body.date) < new Date().setHours(0, 0, 0, 0))
    errors.push('Date must be today or a future date.');

  /* at least one item & positive price */
  if (!body.items?.length) errors.push('At least one item is required.');
  body.items?.forEach((it, i) => {
    if (it.price <= 0) errors.push(`Item ${i + 1}: price must be > 0`);
    if (it.quantity <= 0) errors.push(`Item ${i + 1}: quantity must be > 0`);
  });

  /* total check */
  const { itemsTotal, sundryTotal } = totals(body);
  const calcTotal = itemsTotal + sundryTotal;
  if (body.totalAmount !== calcTotal)
    errors.push(`totalAmount (${body.totalAmount}) ≠ items+ sundry (${calcTotal})`);

  return errors;
};

/* ---------- CRUD ---------- */
export const createInvoice = async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const last = await Invoice.findOne().sort({ invoiceNumber: -1 });
  const next = last ? last.invoiceNumber + 1 : 1;

  const invoice = new Invoice({ ...req.body, invoiceNumber: next });
  await invoice.save();
  res.status(201).json(invoice);
};

export const getInvoices = async (_, res) => {
  const data = await Invoice.find().sort({ createdAt: -1 });
  res.json(data);
};

export const getInvoiceById = async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ message: 'Not found' });
  res.json(inv);
};

export const updateInvoice = async (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  const inv = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!inv) return res.status(404).json({ message: 'Not found' });
  res.json(inv);
};

export const deleteInvoice = async (req, res) => {
  const inv = await Invoice.findByIdAndDelete(req.params.id);
  if (!inv) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
};
