# routes/invoice_routes.py
from datetime import datetime as _dt
from flask import Blueprint, request, jsonify
from mongoengine.errors import DoesNotExist
from models import Invoice, Item, Sundry
from helpers import validate_invoice

bp = Blueprint("invoices", __name__, url_prefix="/api/invoices")

# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _as_date(val):
    """Accepts 'YYYY-MM-DD' | datetime | date  →  returns date object"""
    if isinstance(val, str):
        return _dt.fromisoformat(val).date()
    return val

def _coerce_id(rec: dict):
    """Allow front-end to send either '_id' or 'id' for embedded docs."""
    if "_id" in rec and "id" not in rec:
        rec["id"] = rec.pop("_id")
    return rec

def to_dict(doc):
    """Convert a MongoEngine document to a plain JSON-serialisable dict."""
    d = doc.to_mongo().to_dict()
    d["id"] = d.pop("_id")

    # always give the FE a string ISO date
    date_val = doc.date
    d["date"] = date_val.isoformat() if hasattr(date_val, "isoformat") else str(date_val)

    return d

# ---------------------------------------------------------------------------
# routes
# ---------------------------------------------------------------------------

@bp.post("/")
def create_invoice():
    data   = request.get_json(force=True)
    errors = validate_invoice(data)
    if errors:
        return jsonify({"errors": errors}), 400

    last = Invoice.objects.order_by("-invoiceNumber").first()
    next_number = last.invoiceNumber + 1 if last else 1

    items_data    = [_coerce_id(i) for i in data["items"]]
    sundry_data   = [_coerce_id(s) for s in data.get("billSundrys", [])]

    inv = Invoice(
        date           = _as_date(data["date"]),
        invoiceNumber  = next_number,
        customerName   = data["customerName"],
        billingAddress = data["billingAddress"],
        shippingAddress= data["shippingAddress"],
        GSTIN          = data["GSTIN"],
        items          = [Item(**i)   for i in items_data],
        billSundrys    = [Sundry(**s) for s in sundry_data],
        totalAmount    = data["totalAmount"]
    ).save()

    return jsonify(to_dict(inv)), 201

@bp.get("/")
def get_invoices():
    return jsonify([to_dict(i) for i in Invoice.objects.order_by("-createdAt")])

@bp.get("/<inv_id>")
def get_invoice(inv_id):
    try:
        return jsonify(to_dict(Invoice.objects.get(id=inv_id)))
    except DoesNotExist:
        return jsonify({"message": "Not found"}), 404

@bp.put("/<inv_id>")
def update_invoice(inv_id):
    data   = request.get_json(force=True)
    errors = validate_invoice(data)
    if errors:
        return jsonify({"errors": errors}), 400

    try:
        inv = Invoice.objects.get(id=inv_id)
    except DoesNotExist:
        return jsonify({"message": "Not found"}), 404

    items_data   = [_coerce_id(i) for i in data["items"]]
    sundry_data  = [_coerce_id(s) for s in data.get("billSundrys", [])]

    inv.update(
        date           = _as_date(data["date"]),
        customerName   = data["customerName"],
        billingAddress = data["billingAddress"],
        shippingAddress= data["shippingAddress"],
        GSTIN          = data["GSTIN"],
        items          = [Item(**i)   for i in items_data],
        billSundrys    = [Sundry(**s) for s in sundry_data],
        totalAmount    = data["totalAmount"]
    )
    inv.reload()
    return jsonify(to_dict(inv))

@bp.delete("/<inv_id>")
def delete_invoice(inv_id):
    try:
        Invoice.objects.get(id=inv_id).delete()
        return jsonify({"message": "Deleted"})
    except DoesNotExist:
        return jsonify({"message": "Not found"}), 404
    
