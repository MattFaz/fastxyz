const { SimpleIntervalJob, AsyncTask, ToadScheduler } = require("toad-scheduler");
const { insertStockPrice } = require("../db");

// Every 5 mins, get the current stock price for NYSE:XYZ using IEX real-time data
const getStockPrice = async (fastify) => {
  const startTime = new Date().toISOString();
  fastify.log.info(`[${startTime}] Starting scheduled stock price fetch for NYSE:XYZ`);

  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Token ${process.env.TIINGO_API_KEY}`,
    };

    fastify.log.info("Calling Tiingo IEX API for real-time data...");
    const response = await fetch("https://api.tiingo.com/iex/xyz", { headers });

    if (!response.ok) {
      throw new Error(`Tiingo API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    fastify.log.info({ apiResponse: data }, "Received response from Tiingo IEX API");

    // Extract the last traded price from the IEX response
    // IEX returns an array with real-time data including 'last' (last trade price)
    if (data && data.length > 0 && data[0].last !== undefined) {
      const latestPrice = data[0].last;
      const lastSaleTimestamp = data[0].lastSaleTimestamp;
      insertStockPrice(latestPrice);
      const endTime = new Date().toISOString();
      fastify.log.info(
        { price: latestPrice, lastSaleTimestamp, timestamp: endTime },
        `✓ Successfully saved stock price: $${latestPrice} (last trade: ${lastSaleTimestamp}) at ${endTime}`
      );
      return latestPrice;
    } else {
      fastify.log.error({ apiResponse: data }, "No price data found in API response");
      return null;
    }
  } catch (error) {
    const errorTime = new Date().toISOString();
    fastify.log.error({ error: error.message, timestamp: errorTime }, `✗ Failed to fetch stock price at ${errorTime}`);
    throw error;
  }
};

const initStockPriceScheduler = (fastify) => {
  const task = new AsyncTask("getStockPrice", () => getStockPrice(fastify), []);
  const job = new SimpleIntervalJob(
    {
      minutes: 5,
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
