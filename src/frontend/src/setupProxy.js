/**
 * Proxy configuration for development environment.
 * 
 * This file configures the development server to proxy API requests to the backend server.
 * It allows the frontend to make requests to '/api' endpoints, which are then forwarded
 * to the backend server running on localhost:5000 with the '/api' prefix removed.
 * 
 * This setup enables seamless integration between the React development server and
 * the Flask backend during development.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Sets up the proxy middleware for the development server.
 * 
 * @param {Object} app - The Express application instance
 */
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',  // /api/signup -> /signup
      },
    })
  );
};
