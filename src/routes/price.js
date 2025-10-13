const { getLatestStockPrice, logPriceEndpointAccess } = require("../db");

module.exports = async (fastify, opts) => {
  fastify.get("/price", async (request, reply) => {
    try {
      // Log the endpoint access
      logPriceEndpointAccess();
      fastify.log.info("GET /price endpoint accessed - logged to database");

      const latestPrice = getLatestStockPrice();

      if (!latestPrice) {
        return reply.code(404).send({
          error: "No stock price data available",
        });
      }

      return {
        price: latestPrice.price,
        timestamp: latestPrice.timestamp,
      };
    } catch (error) {
      fastify.log.error("Error retrieving stock price:", error);
      return reply.code(500).send({
        error: "Failed to retrieve stock price",
      });
    }
  });
};
