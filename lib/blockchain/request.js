import fetch from "node-fetch";
import WebSocket from "ws";

const WS_CACHE = {};

class WsRpc {
  constructor(address) {
    this.address = address;
    this.requests = {};
    this.requestId = 1;
    this.idMap = {};
  }
  async setupWs() {
    this.ws = new WebSocket(this.address);
    this.ws.on("message", (message) => this.onMessage(message));
    await new Promise((resolve) => this.ws.on("open", resolve));
  }
  onMessage(message) {
    const parsedResponse = JSON.parse(message);
    const id = parsedResponse.id;
    if (this.requests[id]) {
      const realId = this.idMap[parsedResponse.id];
      const callback = this.requests[id];
      delete this.requests[id];
      delete this.idMap[id];
      callback(JSON.stringify({ ...parsedResponse, id: realId }));
    }
  }
  async send(request) {
    if (!this.ws || this.ws.readyState > 1) {
      await this.setupWs();
    }
    const parsedRequest = JSON.parse(request);
    const id = this.requestId++;
    this.idMap[id] = parsedRequest.id;
    return new Promise((resolve, reject) => {
      this.requests[id] = resolve;
      this.ws.send(JSON.stringify({ ...parsedRequest, id }), (err) => {
        if (err) reject(err);
      });
    });
  }
}

const sendWs = async (endpoint, request) => {
  if (!WS_CACHE[endpoint]) {
    WS_CACHE[endpoint] = new WsRpc(endpoint);
  }
  const rpc = WS_CACHE[endpoint];
  return rpc.send(request);
};

const sendHttp = async (endpoint, request) => {
  const res = await fetch(endpoint, {
    method: "POST",
    body: request,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "accept-encoding": "gzip, deflate, br",
    },
  });

  return await res.text();
};

export const send = (endpoint, request) => {
  return endpoint.startsWith("https")
    ? sendHttp(endpoint, request)
    : sendWs(endpoint, request);
};
