/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { getJSONfromHTML } from "./utils/getJSONfromHTML";
import { getRestructuredData } from "./utils/getRestructuredData";



export default {
  async fetch(request: Request) {
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

    const data_original = getJSONfromHTML(html);
    if(!data_original) return new Response("Can't parse JSON");
    const data_restructured = getRestructuredData(data_original);

    return new Response(JSON.stringify(data_restructured), init);
  },
};
