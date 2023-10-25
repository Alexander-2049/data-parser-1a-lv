import { ResponseData } from "./getJSONfromHTML";
import { PriceData } from "./getPriceHistoryFromID";

export interface RestructuredData {
    name:        string;
    url:         string;
    description: string;
    id:         string;
    image:       string[];
    offers:      Offers;
    history:    PriceData[];
}

export interface Offers {
    price:         number;
    priceCurrency: string;
    availability:  boolean;
}

export function getRestructuredData(data: ResponseData, history: PriceData[]): RestructuredData {

    const { name, url, description, sku, image, offers } = data;
    const { price, priceCurrency, availability } = offers;

    const result = {
        id: sku,
        name,
        url,
        description,
        image,
        offers: {
            price,
            priceCurrency,
            availability: availability === "http://schema.org/InStock" ? true : false
        },
        history
    }

    return result;
}
