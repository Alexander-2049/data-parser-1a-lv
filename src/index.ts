/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { headers } from "./headers";
import API from "./models/API";
import ErrorAPI, { statusCode } from "./models/ErrorAPI";

export interface Env {
  API_HOST: string;
  STORAGE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    if(!url) return new ErrorAPI("url is required", statusCode.ClientErrorBadRequest).response();

    const pattern = /^https:\/\/www\.1a\.lv\/p\/[^/]+\/[^/]+$/;
    const pattern2 = /^https:\/\/www\.1a\.lv\/ru\/p\/[^/]+\/[^/]+$/;
    if(!pattern.test(url) && !pattern2.test(url)) return new ErrorAPI("wrong url", statusCode.ClientErrorBadRequest).response();
    
    const api = new API(env.STORAGE);
    const data = await api.getData(url);

    return new Response(JSON.stringify(data), {headers});
  },
};
