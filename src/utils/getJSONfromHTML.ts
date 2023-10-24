export interface ResponseData {
    "@context":  string;
    "@type":     string;
    name:        string;
    url:         string;
    description: string;
    sku:         string;
    image:       string[];
    offers:      Offers;
    "@id":       string;
}

export interface Offers {
    "@type":       string;
    price:         number;
    priceCurrency: string;
    availability:  string;
    url:           string;
}

export function getJSONfromHTML(html: string): ResponseData | null {
    const regExp = /<script type="application\/ld\+json">(.*)<\/script>/;
    const parsed = regExp.exec(html);
    if(parsed === null || parsed.length < 2) return null;
    const result = JSON.parse(parsed[1]);
    return result;
  }