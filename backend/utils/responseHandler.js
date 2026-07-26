// Standardized REST API Success Response Builder

class ResponseHandler {
  static success(res, statusCode = 200, message = 'Success', data = null) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static created(res, message = 'Resource created successfully', data = null) {
    return this.success(res, 201, message, data);
  }
}

module.exports = ResponseHandler;
