# config.py
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/altiushub_invoice")
PORT        = int(os.getenv("PORT", 5000))

# handy when you need the db name only
DB_NAME = MONGODB_URI.rsplit("/", 1)[-1]
