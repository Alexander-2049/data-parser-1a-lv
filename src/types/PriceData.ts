export interface PriceHistory {
    url: string;
    history: PriceData[];
}

export interface PriceData {
    timestamp: number;
    price: number;
}