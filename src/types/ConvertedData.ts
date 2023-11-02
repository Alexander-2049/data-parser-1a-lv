import { PriceHistory } from "./PriceData";

export interface ConvertedData {
    name:        string;
    url:         string;
    description: string;
    id:         string;
    image:       string[];
    offers:      Offers;
    history:    PriceHistory;
}

export interface Offers {
    price:         number;
    priceCurrency: string;
    availability:  boolean;
}