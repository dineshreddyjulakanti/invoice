# models.py
import uuid
from mongoengine import Document, EmbeddedDocument, fields

class Item(EmbeddedDocument):
    id        = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    itemName  = fields.StringField(required=True)
    quantity  = fields.IntField(required=True, min_value=1)
    price     = fields.FloatField(required=True, min_value=0.01)
    amount    = fields.FloatField(required=True, min_value=0.01)

class Sundry(EmbeddedDocument):
    id              = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    billSundryName  = fields.StringField(required=True)
    amount          = fields.FloatField(required=True)

class Invoice(Document):
    meta = {"collection": "invoice"}                  # keeps your existing collection
    id             = fields.StringField(primary_key=True, default=lambda: str(uuid.uuid4()))
    date           = fields.DateField(required=True)
    invoiceNumber  = fields.IntField(required=True, unique=True)
    customerName   = fields.StringField(required=True)
    billingAddress = fields.StringField(required=True)
    shippingAddress= fields.StringField(required=True)
    GSTIN          = fields.StringField(required=True)
    items          = fields.EmbeddedDocumentListField(Item, required=True)
    billSundrys    = fields.EmbeddedDocumentListField(Sundry)
    totalAmount    = fields.FloatField(required=True)

    createdAt      = fields.DateTimeField(auto_now_add=True)
    updatedAt      = fields.DateTimeField(auto_now=True)    
