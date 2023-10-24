import { ResponseData } from "./getJSONfromHTML";

export interface RestructuredData {
    name:        string;
    url:         string;
    description: string;
    id:         string;
    image:       string[];
    offers:      Offers;
}

export interface Offers {
    price:         number;
    priceCurrency: string;
    availability:  boolean;
}

export function getRestructuredData(data: ResponseData): RestructuredData {

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
        }
    }

    return result;
}
