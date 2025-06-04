# app.py
from flask import Flask, jsonify
from flask_cors import CORS
from mongoengine import connect
import config
from routes.invoice_routes import bp as invoice_bp
from mongoengine.errors import ValidationError as MongoValidationError

def create_app():
    app = Flask(__name__)
    CORS(app)

    # DB connection
    connect(host=config.MONGODB_URI)

    # health check
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # blueprint
    app.register_blueprint(invoice_bp)

    # 404
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"message": f"❌ Path not found: {request.path}"}), 404

    # mongo validation errors
    @app.errorhandler(MongoValidationError)
    def bad_request(e):
        return jsonify({"message": str(e)}), 400

    # everything else
    @app.errorhandler(Exception)
    def server_error(e):
        app.logger.exception(e)
        return jsonify({"message": "Server error"}), 500

    return app

if __name__ == "__main__":
    create_app().run(port=config.PORT, debug=True)
