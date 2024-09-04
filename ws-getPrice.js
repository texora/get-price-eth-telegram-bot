const ethers = require("ethers");
const { Fetcher, Route, Token, ChainId } = require("@uniswap/sdk");
const { Telegraf } = require("telegraf");
require("dotenv").config();

const INFURA_WS_URL = `wss://mainnet.infura.io/ws/v3/${process.env.INFURA_PROJECT_ID}`;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_IDS = ["6492447856", "6032361330"];
const THRESHOLD_PRICE = 2800;

const provider = new ethers.providers.WebSocketProvider(INFURA_WS_URL);
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

async function getETHPrice() {
  try {
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

    const pair = await Fetcher.fetchPairData(WETH, USDT, provider);
    const route = new Route([pair], WETH);
    return parseFloat(route.midPrice.toSignificant(6));
  } catch (error) {
    console.error("Error fetching ETH price from Uniswap:", error);
    return null;
  }
}

async function sendTelegramAlert(ethPrice) {
  for (const chatId of TELEGRAM_CHAT_IDS) {
    try {
      await bot.telegram.sendMessage(
        chatId,
        `🚨 ETH price is now $${ethPrice}, which is above your threshold of $${THRESHOLD_PRICE}. Consider taking action!`
      );
      console.log(`Alert sent to Telegram chat ID: ${chatId}`);
    } catch (error) {
      console.error(
        `Error sending alert to Telegram chat ID: ${chatId}`,
        error
      );
    }
  }
}

async function monitorPrice() {
  const ethPrice = await getETHPrice();
  if (!ethPrice) return;

  console.log(`Current ETH/USDT price: $${ethPrice}`);

  if (ethPrice >= THRESHOLD_PRICE) {
    console.log(
      `ETH price is above $${THRESHOLD_PRICE}. Sending alert to Telegram...`
    );
    await sendTelegramAlert(ethPrice);
  } else {
    console.log(`ETH price is below $${THRESHOLD_PRICE}. No action taken.`);
  }
}

provider.on("block", async () => {
  await monitorPrice();
});

monitorPrice();
