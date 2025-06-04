import { Router } from 'express';
import {
  createInvoice, getInvoices, getInvoiceById,
  updateInvoice, deleteInvoice
} from '../controllers/invoiceController.js';

const router = Router();
router.route('/').post(createInvoice).get(getInvoices);
router.route('/:id').get(getInvoiceById).put(updateInvoice).delete(deleteInvoice);
export default router;
