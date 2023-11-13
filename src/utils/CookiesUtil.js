export function getCookie(key) {
    if (document.cookie === "") return undefined;
    let splited = document.cookie.split(key + "=");
    if (splited.length === 1) return undefined;
    return splited[1].split(";")[0];
}

export function removeCookie(key) {
    document.cookie = key + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.location.reload();
}