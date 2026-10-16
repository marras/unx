# unx: un-x.com my browser

A minimal Firefox extension that sends clicked `x.com/*` links to https://nitter.cf/.
Paths, query strings, and fragments are preserved. Typing or pasting an x.com
address into the address bar loads x.com normally.

## Load in Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select this project's `manifest.json`.

The temporary extension stays installed until Firefox restarts. After editing
the files, click **Reload** beside unxcom on the same page. Redirect messages
appear in the source page's developer console. Enable **Persist Logs** to keep
them across navigations.

After reloading the add-on, refresh already-open pages to install the click
listener. It runs on ordinary web pages, including localhost on any port.
Normal clicks, Ctrl/Cmd-clicks, and middle clicks keep their usual tab behavior.
Firefox's protected pages (such as `about:` pages) do not allow content scripts.

If clicking an x.com link produces no messages, open `about:addons`, select unxcom, and
check its **Permissions** tab: access to all websites must be enabled. After changing the
manifest, reload the add-on in `about:debugging`; if Firefox does not pick up
the new permissions, remove the temporary add-on and load it again.

## Files

- `manifest.json`: extension name, version, website access, and content script registration.
- `content.js`: changes an x.com link's destination during a user click, then restores it.

No dependencies or build step are required.

## Reference

- [Temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
