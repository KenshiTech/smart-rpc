import { getSecrets } from "../secrets.js";

const smartRpcEndpoints = await getSecrets("secrets/rpc/smart");

export const rpcList = {
  "binance-mainnet": smartRpcEndpoints.BINANCE_MAINNET,
  "binance-testnet": smartRpcEndpoints.BINANCE_TESTNET,
  "polygon-mainnet": smartRpcEndpoints.POLYGON_MAINNET,
  "polygon-mumbai": smartRpcEndpoints.POLYGON_MUMBAI,
  "fantom-mainnet": smartRpcEndpoints.FANTOM_MAINNET,
  "fantom-testnet": smartRpcEndpoints.FANTOM_TESTNET,
  "avalanche-mainnet": smartRpcEndpoints.AVALANCHE_MAINNET,
  "avalanche-fuji": smartRpcEndpoints.AVALANCHE_FUJI,
  "ethereum-mainnet": smartRpcEndpoints.ETHEREUM_MAINNET,
  "ethereum-goerli": smartRpcEndpoints.ETHEREUM_GOERLI,
};
