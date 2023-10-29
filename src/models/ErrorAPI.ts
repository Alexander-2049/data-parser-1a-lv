import { StatusCode } from 'status-code-enum';
import { headers } from '../headers';

export const statusCode = StatusCode;

export default class ErrorAPI extends Error {
    statusCode: StatusCode;

    constructor(message: string, statusCode: StatusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
    }

    public response(): Response {
        return new Response(this.body(), this.init());
    }

    private body() {
        return JSON.stringify({
            error: true,
            message: this.message,
        });
    }

    private init() {
        const status = this.statusCode;

        return { headers, status };
    }
}