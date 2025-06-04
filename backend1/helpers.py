# helpers.py
from datetime import date as dt_date

def totals(items, bill_sundrys):
    items_total   = sum(i["quantity"] * i["price"] for i in items)
    sundry_total  = sum(b["amount"]              for b in bill_sundrys)
    return items_total, sundry_total

def validate_invoice(body: dict) -> list[str]:
    errors = []
    today  = dt_date.today()

    # date
    if not body.get("date") or dt_date.fromisoformat(body["date"]) < today:
        errors.append("Date must be today or a future date.")

    # items
    items = body.get("items", [])
    if not items:
        errors.append("At least one item is required.")
    for idx, it in enumerate(items):
        if it["price"]    <= 0: errors.append(f"Item {idx+1}: price must be > 0")
        if it["quantity"] <= 0: errors.append(f"Item {idx+1}: quantity must be > 0")

    # totals
    items_total, sundry_total = totals(items, body.get("billSundrys", []))
    calc_total = items_total + sundry_total
    if body.get("totalAmount") != calc_total:
        errors.append(f"totalAmount ({body.get('totalAmount')}) ≠ items+sundry ({calc_total})")

    return errors
