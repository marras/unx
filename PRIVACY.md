# un-X privacy policy

Last updated: November 5, 2026

un-X redirects links using source and destination hosts you can edit. Settings
stay in your browser profile. Redirects send URL information to the destination
websites so those websites can serve the requested content. un-X has no analytics,
advertising, or developer-operated data collection endpoint.

## Information processed in your browser

un-X examines top-level HTTP(S) navigation requests to determine whether their
host matches a redirect pair. This includes clicked links, addresses typed or
pasted into the address bar, bookmarks, and external-app links. Non-GET requests,
such as POST form submissions, are not redirected.

For each redirected tab, un-X temporarily keeps the original and destination
URLs in Firefox’s in-memory extension session storage. This lets the address-bar
icon return you to the original URL. Clicking the icon replaces that record with
a temporary exception for the original host in that tab, allowing you to browse
it until you leave the host or close the tab. Records are cleared when they no
longer apply, when the tab closes, or when the browser or extension shuts down.
They are not saved to disk or sent to the developer.

The extension does not maintain a browsing history database or send a list of
the pages you visit to the developer.

## Settings stored locally

un-X saves your source and destination host pairs in Firefox’s local extension
storage. These settings remain until you change them or remove the extension.
The extension does not upload or sync them to a server. Older installations may
retain an unused direct-navigation preference; it no longer controls redirects.

## Information sent to destination websites

When a matching link is redirected, your browser opens the configured destination
over HTTPS, preserving the original URL path, query string, and fragment.
Paths and query strings may contain usernames, search terms, identifiers, or
other personal information. That information is forwarded as part of the
destination URL without being filtered by un-X.

For example, with the default X rule,
`https://x.com/user?q=hello#post` becomes
`https://nitter.cf/user?q=hello#post`. The destination server receives `/user`
and `q=hello`. The fragment `#post` is not sent in the HTTP request, but can be
read by scripts on the destination page.

The destination also receives your network IP address and the normal request
information sent by Firefox. Depending on your browser settings and the website,
this can include cookies for the destination, browser information, and a referrer.
The destination website may collect or retain data under its own policies;
un-X does not control that processing or retention.

Until you save your own pairs, the default destinations are:

- `x.com` → `nitter.cf`
- `instagram.com` → `kittygram.irelephant.net`

Changing a destination changes which website receives the redirected request.
Only configure destinations you trust with the information in those URLs.

## Your choices

Firefox asks for the required browsing activity data permission during
installation. This covers URL transmission needed for redirects. You can decline
installation if you do not agree.

In Firefox’s Add-ons Manager, select un-X and open its Preferences or Options to:

- Change or remove individual host pairs.
- Remove every pair and select “Save changes” to stop all redirects.

On Firefox desktop, click the un-X address-bar icon after a redirect to visit the
original site in that tab. The exception ends when the tab leaves that host or closes.

You can disable or uninstall un-X through Firefox’s Add-ons Manager. Uninstalling
removes its local extension settings. Disabling redirects or uninstalling cannot
delete data already received by destination websites or entries in Firefox’s
own browsing history.

## Questions

Contact the maintainer through the
[un-X issue tracker](https://github.com/marras/unx/issues). Issues are public;
avoid posting private URLs, tokens, or other sensitive information.
