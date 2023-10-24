/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
  async fetch(request, env, ctx) {
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

    const result = getJSONfromHTML(html);
    if(result.offers.availability !== "http://schema.org/InStock") {
      result.offers.availability = false;
    } else {
      result.offers.availability = true;
    }

    delete result['@context'];
    delete result['@type'];
    delete result.offers['@type'];
    delete result['@id'];

    return new Response(JSON.stringify(result), init);
  },
};

function getJSONfromHTML(html) {
  const regExp = /<script type="application\/ld\+json">(.*)<\/script>/;
  return JSON.parse(regExp.exec(html)[1]);
}