# unx: un-x.com my browser

A minimal Firefox extension that sends clicked `x.com/*` links to https://nitter.cf/.

It runs on ordinary web pages, including localhost on any port.
Normal clicks, Ctrl/Cmd-clicks, and middle clicks keep their usual tab behavior.

Paths, query strings, and fragments are preserved. Typing or pasting an x.com
address into the address bar loads x.com normally.

## Load in Firefox

`git clone https://github.com/marras/unx`

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…**.
3. Select this project's `manifest.json`.

The temporary extension stays installed until Firefox restarts.

### Permissions

If clicking an x.com link produces no messages and still takes you to the original x.com site: open `about:addons`, select unxcom, and check its **Permissions** tab: access to all websites must be enabled.

## Files

- `manifest.json`: extension name, version, website access, and content script registration.
- `content.js`: changes an x.com link's destination during a user click, then restores it.

No dependencies or build step are required.

## Reference

- [Temporary installation in Firefox](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/)
