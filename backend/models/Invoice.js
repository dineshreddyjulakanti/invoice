import mongoose from 'mongoose';
import { v4 as uuid } from 'uuid';

const itemSchema = new mongoose.Schema({
  _id: { type: String, default: uuid },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0.01 },
  amount: { type: Number, required: true, min: 0.01 }
});

const sundrySchema = new mongoose.Schema({
  _id: { type: String, default: uuid },
  billSundryName: { type: String, required: true },
  amount: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema({
  _id: { type: String, default: uuid },
  date: { type: Date, required: true },
  invoiceNumber: { type: Number, required: true, unique: true },
  customerName: { type: String, required: true },
  billingAddress: { type: String, required: true },
  shippingAddress: { type: String, required: true },
  GSTIN: { type: String, required: true },
  items: { type: [itemSchema], validate: v => v.length > 0 },
  billSundrys: [sundrySchema],
  totalAmount: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
