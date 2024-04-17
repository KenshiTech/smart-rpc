import { getRpc, chargeRpc } from "./lib/db/index.js";
import { rpcList } from "./lib/blockchain/list.js";
import { validate } from "./lib/blockchain/validate.js";
import { send } from "./lib/blockchain/request.js";

const err = (code, message) => {
  return {
    jsonrpc: "2.0",
    error: { code, message },
  };
};

const headers = {
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "*",
};

export const handler = async (request) => {
  const rpc = await getRpc(request.pathParameters.project);

  if (!rpc) {
    return {
      statusCode: 404,
      body: JSON.stringify(
        err(404, "Smart RPC endpoint not found or out of credits.")
      ),
      headers,
    };
  }

  const endpoint = rpcList[rpc.chain];

  if (!endpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify(err(400, "Smart RPC endpoint has invalid chain.")),
      headers,
    };
  }

  if (!validate(JSON.parse(request.body), rpc.methods, rpc.allow)) {
    await chargeRpc(rpc, true);
    return {
      statusCode: 405,
      body: JSON.stringify(err(405, "Method not allowed.")),
      headers,
    };
  }

  try {
    const body = await send(endpoint, request.body);
    await chargeRpc(rpc, false);
    return { statusCode: 200, body, headers };
  } catch (_err) {
    await chargeRpc(rpc, true);
    return {
      statusCode: 500,
      body: JSON.stringify(err(500, "Unexpected Error")),
      headers,
    };
  }
};
