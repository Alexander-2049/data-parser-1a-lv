export default function getCacheKeyFromUrl(url: string): string {
    const arr = new URL(url).pathname.split("/");
    return arr[arr.length - 1];
}
