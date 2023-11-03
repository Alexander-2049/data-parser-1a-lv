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
    const id = searchParams.get('id');
    if(url && !id) {
      const pattern = /^https:\/\/www\.1a\.lv\/p\/[^/]+\/[^/]+$/;
      const pattern2 = /^https:\/\/www\.1a\.lv\/ru\/p\/[^/]+\/[^/]+$/;
      if(!pattern.test(url) && !pattern2.test(url)) return new ErrorAPI("wrong url", statusCode.ClientErrorBadRequest).response();
      
      const api = new API(env.STORAGE);
      const data = await api.getData(url);
  
      return new Response(JSON.stringify(data), {headers});
    } else if(id) {
      const api = new API(env.STORAGE);
      const data = await api.getPriceHistoryByID(id);
      if(data !== null) {
        return new Response(JSON.stringify(data.history), {headers});
      }
      if(data === null && url) {
        const data = await api.getPriceHistoryByURL(url);
        if(data instanceof ErrorAPI) {
          return data.response();
        }
        return new Response(JSON.stringify(data.history), {headers});
      }
      return new ErrorAPI("wrong id/url", statusCode.ClientErrorBadRequest).response();
    } else {
      return new ErrorAPI("url || id is required", statusCode.ClientErrorBadRequest).response();
    }
  },
};
