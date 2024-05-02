import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/cookieconsentpopup.scss"

// @ts-ignore
import script from "./scripts/cookieconsentpopup.inline"

interface Options {}

export default ((options?: Options) => {
  function CookieConsentPopup(props: QuartzComponentProps) {
    return (
      <div class="cookies-banner hidden">
        <div>
          This website uses cookies to ensure you get the best experience on our website. Who
          doesn't like cookies?
        </div>
        <button>Feed me</button>
      </div>
    )
  }

  CookieConsentPopup.css = style
  CookieConsentPopup.afterDOMLoaded = script

  return CookieConsentPopup
}) satisfies QuartzComponentConstructor
