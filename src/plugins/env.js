const fastifyEnv = require("@fastify/env");

const schema = {
  type: "object",
  required: ["TIINGO_API_KEY"],
  properties: { TIINGO_API_KEY: { type: "string" } },
};

const options = {
  schema: schema,
  //   data: process.env,
  dotenv: true,
};

const validateEnvVars = () => {
  const requiredVars = schema.required;
  const missingVars = requiredVars.filter((key) => !process.env[key] || process.env[key].trim() === "");

  if (missingVars.length > 0)
    throw new Error(`Missing or empty required environment variables: ${missingVars.join(", ")}`);
};

validateEnvVars();

module.exports = async (fastify, opts) => {
  try {
    await fastify.register(fastifyEnv, options);
  } catch (error) {
    fastify.log.error(`Failed to register environment variables: ${error.message}`);
    throw error;
  }
};
