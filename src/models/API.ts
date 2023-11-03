import { ConvertedData } from "../types/ConvertedData";
import { PriceData, PriceHistory } from "../types/PriceData";
import { ResponseData } from "../types/ResponseData";
import ErrorAPI from "./ErrorAPI";
import { StatusCode } from 'status-code-enum';

export default class API {
    private STORAGE: KVNamespace;

    constructor(STORAGE: KVNamespace) {
        this.STORAGE = STORAGE;
    }

    public async getData(url: string): Promise<ConvertedData | ErrorAPI> {
        const response = await this.fetch(url);
        const html = await response.text();
        const data: ResponseData | null = this.getDataFromHTML(html);
        if(data === null) {
            return new ErrorAPI("Data was not found", StatusCode.ClientErrorNotFound);
        }
        const id = data.sku;
        const priceHistoryResponse = await this.getPriceHistoryByID(id);
        const priceHistory = priceHistoryResponse ? priceHistoryResponse : { url: data.url, history: [] };
        const lastUpdateTime = this.getLastUpdateTime(priceHistory.history);
        const isUpdateRequired = this.isPriceHistoryUpdateRequired(lastUpdateTime);
        if(isUpdateRequired) {
            priceHistory.history.push({
                timestamp: Date.now(),
                price: data.offers.price,
                currency: data.offers.priceCurrency
            });
            await this.savePriceHistory(id, priceHistory);
        }
        const converted = this.getConvertResponseData(data, priceHistory);
        return converted;
    }

    public async getPriceHistoryByURL(url: string): Promise<PriceHistory | ErrorAPI> {
        const data: ConvertedData | ErrorAPI = await this.getData(url);
        if(data instanceof ErrorAPI) {
            return data;
        }
        return data.history;
    }

    public async getPriceHistoryByID(id: string): Promise<PriceHistory | null> {
        const data = await this.STORAGE.get(id);
        if (data === null) {
            return null;
        }
        const data_parsed: PriceHistory = JSON.parse(data);
        if(this.isPriceHistoryUpdateRequired(data_parsed.history[data_parsed.history.length - 1].timestamp)) {
            const data: PriceHistory | ErrorAPI = await this.updatePriceHistory(data_parsed);
            if(data instanceof ErrorAPI) {
                return null;
            }
            return data;
        }
        return data_parsed;
    }

    private async updatePriceHistory(priceHistory: PriceHistory) {
        const response = await this.fetch(priceHistory.url);
        const html = await response.text();
        const data: ResponseData | null = this.getDataFromHTML(html);
        if(data === null) {
            return new ErrorAPI("Data was not found", StatusCode.ClientErrorNotFound);
        }
        const id = data.sku;
        priceHistory.history.push({
            timestamp: Date.now(),
            price: data.offers.price,
            currency: data.offers.priceCurrency
        });
        await this.savePriceHistory(id, priceHistory);
        return priceHistory;
    }

    private fetch(url: string): Promise<Response> {
        const cacheKey = this.getCacheKeyFromURL(url);

        return fetch(url, {
            cf: {
              cacheTtl: 60 /* seconds */ * 60 /* minutes */ * 12 /* hours */,
              cacheEverything: true,
              cacheKey,
            }
        });
    }

    private getDataFromHTML(html: string): ResponseData | null {
        const regExp = /<script type="application\/ld\+json">(.*)<\/script>/;
        const parsed = regExp.exec(html);
        if(parsed === null || parsed.length < 2) return null;
        const result = JSON.parse(parsed[1]);
        return result;
    }

    private getConvertResponseData(responseData: ResponseData, priceHistory: PriceHistory): ConvertedData {
        const { name, url, description, sku, image, offers } = responseData;
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
            history: priceHistory
        }
    
        return result;
    }

    private getCacheKeyFromURL(url: string): string {
        const arr = new URL(url).pathname.split("/");
        return arr[arr.length - 1];
    }
    
    private async savePriceHistory(id: string, priceHistory: PriceHistory): Promise<void> {
        await this.STORAGE.put(id, JSON.stringify(priceHistory));
    }

    private isPriceHistoryUpdateRequired(lastUpdateTime: number): boolean {
        const currentTime = Date.now();
        
        const updateInterval = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

        if (currentTime - lastUpdateTime >= updateInterval) {
            return true; // Update is required
        } else {
            return false; // Update is not required
        }
    }

    private getLastUpdateTime(priceHistory: PriceData[]) {
        if(priceHistory.length === 0) return 0;
        return priceHistory[priceHistory.length - 1].timestamp;
    }
}