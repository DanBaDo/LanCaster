export function getCookies() {
    const cookies = document.cookie.split(";")
    return {
        cookies: cookies.map(
            cookie => {
                cookie.trim()
                const tuple = cookie.split("=")
                return { name: tuple[0], value: tuple[1] }
            }
        ),
        valueOf (cookieName) {
            const cookie = this.cookies.find(
                cookie => cookie.name === cookieName
            )
            return cookie ? cookie.value : null
        }
    }
}