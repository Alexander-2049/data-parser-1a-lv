import { Env } from "..";
import { PriceData } from "./getPriceHistoryFromID";

export default async function writePriceHistoryToID(id: string, history: PriceData[], env: Env): Promise<boolean | Error> {
    try {
        await env.STORAGE.put(id, JSON.stringify(history));
        return true;
    } catch (error: unknown) {
        if(error instanceof Error) {
            return new Error(error.message);
        } else {
            return new Error("Something went wrong");
        }
    }
}