const ethers = require("ethers");
const { Fetcher, Route, Token, ChainId } = require("@uniswap/sdk");
const { Telegraf } = require("telegraf");

const INFURA_PROJECT_ID = "your infura project id";
const INFURA_URL = `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;
const TELEGRAM_BOT_TOKEN = "your bot token here"; // Replace with your Telegram bot token
const TELEGRAM_CHAT_ID = "6492447856"; // Replace with your Telegram chat ID
const THRESHOLD_PRICE = 2800; // Price threshold in USDT

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL);
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

async function getETHPrice() {
  try {
    // Fetch token data
    const USDT = new Token(
      ChainId.MAINNET,
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      6
    );
    const WETH = new Token(
      ChainId.MAINNET,
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      18
    );

    // Fetch pair data
    const pair = await Fetcher.fetchPairData(WETH, USDT, provider);

    // Create a route
    const route = new Route([pair], WETH);

    // Get the ETH/USDT price
    return parseFloat(route.midPrice.toSignificant(6));
  } catch (error) {
    console.error("Error fetching ETH price from Uniswap:", error);
    return null;
  }
}

// Function to monitor the price and send a Telegram alert
async function monitorPrice() {
  const ethPrice = await getETHPrice();
  if (!ethPrice) return;

  console.log(`Current ETH/USDT price: $${ethPrice}`);

  if (ethPrice >= THRESHOLD_PRICE) {
    console.log(
      `ETH price is above $${THRESHOLD_PRICE}. Sending alert to Telegram...`
    );
    await bot.telegram.sendMessage(
      TELEGRAM_CHAT_ID,
      `🚨 ETH price is now $${ethPrice}, which is above your threshold of $${THRESHOLD_PRICE}. Consider taking action!`
    );
  } else {
    console.log(`ETH price is below $${THRESHOLD_PRICE}. No action taken.`);
  }
}

// Monitor the price every minute
setInterval(monitorPrice, 60 * 1000);

// Start monitoring immediately when the server starts
monitorPrice();
