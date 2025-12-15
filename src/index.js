const fastify = require("fastify")({
  logger: true,
  routerOptions: {
    ignoreTrailingSlash: true,
  },
});
const { version } = require("../package.json");
const { initStockPriceScheduler } = require("./scheduler/stockPriceFetcher");

// Register plugins and routes
const registerModules = async () => {
  await fastify.register(require("./plugins/env.js"));
  await fastify.register(require("@fastify/cors"), {
    methods: ["GET", "OPTIONS"],
    origin: "*",
  });

  // Auth hook - registered AFTER CORS so preflight requests are handled first
  fastify.addHook("preHandler", (request, reply, done) => {
    if (request.method === "OPTIONS") return done();

    const apiKey = request.headers["x-api-key"];
    if (apiKey !== process.env.API_KEY) {
      fastify.log.error(`Unauthorized request from ${request.ip}`);
      return reply.code(401).send({ error: "Unauthorized" });
    }
    done();
  });

  await fastify.register(require("./routes/price.js"));
};

// Run the server!
const start = async () => {
  fastify.log.info(`FastXYZ v${version}`);
  try {
    await registerModules();
    initStockPriceScheduler(fastify);
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
