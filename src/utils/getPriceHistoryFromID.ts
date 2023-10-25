import { Env } from "..";

export interface PriceData {
    timestamp: number;
    price: number;
    currency: string;
}

export default async function getPriceHistoryFromID(id: string | null, env: Env): Promise<PriceData[] | Error> {
    if(id === null) return new Error("no id provided");
    const data = await env.STORAGE.get(id);
    if(data === null) return [];
    return JSON.parse(data);
}