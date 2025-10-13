const { SimpleIntervalJob, AsyncTask, ToadScheduler } = require("toad-scheduler");
const { insertStockPrice } = require("../db");

// Every 30 mins, get the current stock price for NYSE:XYZ
const getStockPrice = async (fastify) => {
  const startTime = new Date().toISOString();
  fastify.log.info(`[${startTime}] Starting scheduled stock price fetch for NYSE:XYZ`);

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${process.env.TIINGO_API_KEY}`,
    };

    fastify.log.info("Calling Tiingo API...");
    const response = await fetch("https://api.tiingo.com/tiingo/daily/xyz/prices", { headers });

    if (!response.ok) {
      throw new Error(`Tiingo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    fastify.log.info({ apiResponse: data }, "Received response from Tiingo API");

    // Extract the latest closing price from the response
    // Tiingo returns an array with the most recent price data
    if (data && data.length > 0 && data[0].close !== undefined) {
      const latestPrice = data[0].close;
      insertStockPrice(latestPrice);
      const endTime = new Date().toISOString();
      fastify.log.info(
        { price: latestPrice, timestamp: endTime },
        `✓ Successfully saved stock price: $${latestPrice} at ${endTime}`
      );
      return latestPrice;
    } else {
      fastify.log.error({ apiResponse: data }, "No price data found in API response");
      return null;
    }
  } catch (error) {
    const errorTime = new Date().toISOString();
    fastify.log.error(
      { error: error.message, timestamp: errorTime },
      `✗ Failed to fetch stock price at ${errorTime}`
    );
    throw error;
  }
};

const initStockPriceScheduler = (fastify) => {
  const task = new AsyncTask("getStockPrice", () => getStockPrice(fastify), []);
  const job = new SimpleIntervalJob(
    {
      minutes: 30,
      runImmediately: true, // Run immediately on startup, then every 30 minutes
    },
    task
  );
  const scheduler = new ToadScheduler();
  scheduler.addSimpleIntervalJob(job);

  fastify.log.info("Stock price scheduler initialized - will fetch every 30 minutes");

  return scheduler;
};

module.exports = { initStockPriceScheduler };
