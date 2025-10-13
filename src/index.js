const fastify = require("fastify")({
  logger: true,
});
const { version } = require("../package.json");
const { initStockPriceScheduler } = require("./scheduler/stockPriceFetcher");

// Register plugins and routes
const registerModules = async () => {
  await fastify.register(require("./plugins/env.js"));
  await fastify.register(require("@fastify/cors"), {
    methods: ["GET"],
  });
  await fastify.register(require("./routes/price.js"));
};

// Run the server!
const start = async () => {
  fastify.log.info(`FastXYZ v${version}`);
  try {
    await registerModules();
    initStockPriceScheduler(fastify);
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
