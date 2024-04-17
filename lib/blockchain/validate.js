import { ethers } from "ethers";

const safeBigNumber = (value) =>
  value === "0x" ? ethers.BigNumber.from(0) : ethers.BigNumber.from(value);

const parseRawTx = (tx) => {
  const [nonce, gasPrice, gasLimit, to, value, data, v, r, s] =
    ethers.utils.RLP.decode(tx);

  return {
    nonce: safeBigNumber(nonce).toNumber(),
    gasPrice: safeBigNumber(gasPrice),
    gasLimit: safeBigNumber(gasLimit),
    to,
    value: safeBigNumber(value),
    data,
    v: safeBigNumber(v).toNumber(),
    r,
    s,
  };
};

const whiteListedMethods = ["net_version"];

export const validate = (request, methods, contracts) => {
  const { method, params } = request;

  if (whiteListedMethods.includes(method)) {
    return true;
  }

  if (!methods[method]) {
    return false;
  }

  if (["eth_call", "eth_estimateGas"].includes(method)) {
    return contracts.includes(params[0].to.toLowerCase());
  }

  if (method === "eth_getLogs") {
    return (
      params.length &&
      params.every(
        (param) =>
          param.address && contracts.includes(param.address.toLowerCase())
      )
    );
  }

  if (method === "eth_sendRawTransaction") {
    return params.every((param) =>
      contracts.includes(parseRawTx(param).to.toLowerCase())
    );
  }

  return true;
};
