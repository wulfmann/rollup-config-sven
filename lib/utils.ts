export const trimPrefix = (str: string, prefix: string): string => {
    if (str.startsWith(prefix)) {
        return str.slice(prefix.length)
    } else {
        return str
    }
}
