const fastify = require("fastify")({
  logger: true,
  routerOptions: {
    ignoreTrailingSlash: true,
  },
});
const { version } = require("../package.json");
const { initStockPriceScheduler } = require("./scheduler/stockPriceFetcher");

// Global auth hook
fastify.addHook("preHandler", (request, reply, done) => {
  // Skip auth for CORS preflight requests
  if (request.method === "OPTIONS") {
    return done();
  }

  const apiKey = request.headers["x-api-key"];
  if (apiKey !== process.env.API_KEY) {
    return reply.code(401).send({ error: "Unauthorized" });
  }
  done();
});

// Register plugins and routes
const registerModules = async () => {
  await fastify.register(require("./plugins/env.js"));
  await fastify.register(require("@fastify/cors"), {
    methods: ["GET"],
    origin: "*",
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
