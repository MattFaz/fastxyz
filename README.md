# FastXYZ

A Fastify-based API service that fetches and tracks stock prices for NYSE:XYZ from the Tiingo API. The application uses scheduled jobs to retrieve stock prices every 30 minutes and provides an endpoint to query historical price data.

## Features

- Automated stock price fetching every 30 minutes via scheduled jobs
- RESTful API endpoint to retrieve stock price data
- SQLite database for persistent storage
- Environment variable validation for secure configuration
- CORS support for cross-origin requests
- Docker support for containerized deployment

## Prerequisites

- Node.js (v14 or higher recommended)
- npm
- Tiingo API key ([Get one here](https://www.tiingo.com/))

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fastXYZ
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
TIINGO_API_KEY=your_tiingo_api_key_here
API_KEY=xx
```

## Usage

### Running Locally

Start the server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Using Docker

Build and run with Docker Compose:
```bash
docker-compose up -d
```

## API Endpoints

### Authentication

All API endpoints require authentication via the `x-api-key` header. The key must match the `API_KEY` environment variable configured on the server.

### GET /price

Returns the current or historical stock price data for NYSE:XYZ.

**Example Request:**
```bash
curl -H "x-api-key: your-api-key-here" http://localhost:3000/price
```

**Example Response:**
```json
{
  "symbol": "XYZ",
  "price": 123.45,
  "timestamp": "2025-10-14T12:00:00Z"
}
```

## Project Structure

```
fastXYZ/
├── src/
│   ├── index.js              # Main entry point
│   ├── plugins/
│   │   └── env.js            # Environment variable validation
│   ├── routes/
│   │   └── price.js          # Price endpoint routes
│   └── scheduler/
│       └── stockPriceFetcher.js  # Scheduled job for fetching stock prices
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Docker container definition
├── package.json              # Project dependencies
├── .env                      # Environment variables (not tracked in git)
└── README.md                 # This file
```

## Architecture

The application follows a plugin-based architecture using Fastify:

1. **Main Entry Point** (`src/index.js`): Initializes the Fastify server, registers plugins, and starts the scheduler
2. **Environment Plugin** (`src/plugins/env.js`): Validates required environment variables at startup
3. **Scheduler** (`src/scheduler/stockPriceFetcher.js`): Runs a scheduled job every 30 minutes to fetch stock prices from Tiingo API
4. **Routes** (`src/routes/price.js`): Exposes the `/price` endpoint for querying stock data

## Configuration

The application requires the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `TIINGO_API_KEY` | API key for Tiingo stock data service | Yes |
| `API_KEY` | API key for API request (basic auth) | Yes |

## Development

The application validates all environment variables at startup and will fail immediately if any required variables are missing or empty.

### Key Dependencies

- **fastify**: Fast and low overhead web framework
- **@fastify/schedule** + **toad-scheduler**: Job scheduling for periodic tasks
- **@fastify/cors**: CORS support (GET methods only)
- **@fastify/env**: Environment variable validation
- **better-sqlite3**: SQLite database for storing stock prices

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue in the repository.
