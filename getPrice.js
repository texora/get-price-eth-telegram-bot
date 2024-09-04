const ethers = require("ethers");
const { Fetcher, Route, Token, ChainId } = require("@uniswap/sdk");

const INFURA_PROJECT_ID = "your infura project id";
const INFURA_URL = `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;

const provider = new ethers.providers.JsonRpcProvider(INFURA_URL);

async function getETHPrice() {
  try {
    const USDT = new Token(ChainId.MAINNET, "0xdAC17F958D2ee523a2206206994597C13D831ec7", 6);
    const WETH = new Token(ChainId.MAINNET, "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", 18);

    const pair = await Fetcher.fetchPairData(WETH, USDT, provider);

    const route = new Route([pair], WETH);

    const price = route.midPrice.toSignificant(6);
    console.log(`Current ETH/USDT price: $${price}`);
  } catch (error) {
    console.error("Error fetching ETH price from Uniswap:", error);
  }
}

getETHPrice();

