function getCookie(cookieName: string) {
  let name = cookieName + "="
  let decodedCookie = decodeURIComponent(document.cookie)
  let ca = decodedCookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) == " ") {
      c = c.substring(1)
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ""
}

function setCookie(cookieName: string, cookieValue: string, expireDays: number) {
  const d = new Date()
  d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000)
  let expires = "expires=" + d.toUTCString()
  document.cookie = cookieName + "=" + cookieValue + ";" + expires + ";path=/"
}

document.addEventListener("nav", () => {
  const $cookiesBanner = document.querySelector(".cookies-banner")
  if ($cookiesBanner) {
    const $cookiesBannerButton = $cookiesBanner.querySelector("button")
    if ($cookiesBannerButton) {
      const cookieName = "cookiesBanner"
      const hasCookie = getCookie(cookieName)

      if (!hasCookie) {
        $cookiesBanner.classList.remove("hidden")
      }

      $cookiesBannerButton.addEventListener("click", () => {
        setCookie(cookieName, "closed", 1)
        $cookiesBanner.remove()
      })
    }
  }
})
