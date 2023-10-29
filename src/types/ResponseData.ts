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