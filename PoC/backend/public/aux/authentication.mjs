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

export function decodeJWT (jwt) {
    const [ , payload, ] = jwt.split(".")
    return JSON.parse(window.atob(jwt))
}

export function decodeAuthData () {
    const [ , payload, ] = getCookies().valueOf("jwt").split(".")
    return JSON.parse(window.atob(payload))
}