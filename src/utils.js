export const trimPrefix = (str, prefix) => {
    if (str.startsWith(prefix)) {
        return str.slice(prefix.length)
    } else {
        return str
    }
}