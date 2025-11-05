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
    // IEX returns an array with real-time data
    // Priority: 'last' (last trade) > 'tngoLast' (Tiingo's last price) > 'prevClose' (previous close)
    if (data && data.length > 0) {
      const priceData = data[0];
      const latestPrice = priceData.last ?? priceData.tngoLast ?? priceData.prevClose;
      const lastSaleTimestamp = priceData.lastSaleTimestamp || priceData.timestamp;

      if (latestPrice !== null && latestPrice !== undefined) {
        insertStockPrice(latestPrice);
        const endTime = new Date().toISOString();
        const priceSource = priceData.last ? 'last trade' : priceData.tngoLast ? 'tngoLast' : 'prevClose';
        fastify.log.info(
          { price: latestPrice, lastSaleTimestamp, priceSource, timestamp: endTime },
          `✓ Successfully saved stock price: $${latestPrice} (source: ${priceSource}, timestamp: ${lastSaleTimestamp}) at ${endTime}`
        );
        return latestPrice;
      } else {
        fastify.log.error({ apiResponse: data }, "No valid price data found in API response");
        return null;
      }
    } else {
      fastify.log.error({ apiResponse: data }, "Empty or invalid API response");
      return null;
    }
  } catch (error) {
    const errorTime = new Date().toISOString();
    fastify.log.error({ error: error.message, timestamp: errorTime }, `✗ Failed to fetch stock price at ${errorTime}`);
    throw error;
  }
};

const initStockPriceScheduler = (fastify) => {
  const task = new AsyncTask(
    "getStockPrice",
    () => getStockPrice(fastify),
    (err) => {
      fastify.log.error({ error: err.message, stack: err.stack }, "Error in stock price scheduler task");
    }
  );
  const job = new SimpleIntervalJob(
    {
      minutes: 5,
      runImmediately: true, // Run immediately on startup, then every 5 minutes
    },
    task
  );
  const scheduler = new ToadScheduler();
  scheduler.addSimpleIntervalJob(job);

  fastify.log.info("Stock price scheduler initialized - will fetch every 5 minutes");

  return scheduler;
};

module.exports = { initStockPriceScheduler };
