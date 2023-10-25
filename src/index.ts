/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { ResponseData, getJSONfromHTML } from "./utils/getJSONfromHTML";
import getPriceHistoryFromID, { PriceData } from "./utils/getPriceHistoryFromID";
import { RestructuredData, getRestructuredData } from "./utils/getRestructuredData";
import writePriceHistoryToID from "./utils/writePriceHistoryToID";

export interface Env {
  API_HOST: string;
  STORAGE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    if(!url) return new Response("URL is required");

    const response = await fetch(url);
    const html = await response.text();

    const init = {
      headers: {
        "Content-Type": "application/json; charset=UTF-8"
      }
    };

    const data_original: ResponseData | null = getJSONfromHTML(html);
    if(!data_original) return new Response("Can't parse JSON");

    const id: string = data_original.sku;
    const history: PriceData[] | Error = await getPriceHistoryFromID(id, env);
    if(history instanceof Error) {
      return new Response(history.message);
    }
    const lastCheckDay = history.length === 0 ? -1 : new Date(history[history.length - 1].timestamp).getDay();
    const lastCheckMonth = history.length === 0 ? -1 : new Date(history[history.length - 1].timestamp).getMonth();
    const today = new Date();
    if(history.length === 0 || lastCheckDay !== today.getDay() || lastCheckMonth !== today.getMonth()) {
      history.push({
        timestamp: Date.now(),
        price: data_original.offers.price,
        currency: data_original.offers.priceCurrency
      });
      await writePriceHistoryToID(id, history, env);
    }

    const data_restructured: RestructuredData = getRestructuredData(data_original, history);

    return new Response(JSON.stringify(data_restructured), init);
  },
};
