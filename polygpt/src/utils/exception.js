class APIError extends Error {
  constructor(message, status, ...params) {
    super(message, ...params);

    this.name = 'API Error';
    this.status = status;
  }
}

export { APIError };
