# un-X privacy policy

Last updated: November 3, 2026

un-X redirects links using source and destination hosts you can edit. Settings
stay in your browser profile. Redirects send URL information to the destination
websites so those websites can serve the requested content. un-X has no analytics,
advertising, or developer-operated data collection endpoint.

## Information processed in your browser

un-X reads the address of a link when you click it to determine whether its host
matches a redirect pair. If you enable direct-navigation redirects, it also
examines eligible top-level navigation requests, including addresses opened from
the address bar, bookmarks, or external apps.

The extension uses these addresses to apply your redirect rules. It does not
maintain a browsing history database or send a list of the pages you visit to
the developer.

## Settings stored locally

un-X saves your source and destination host pairs and your direct-navigation
preference in Firefox’s local extension storage. These settings remain until
you change them or remove the extension. The extension does not upload or sync
them to a server.

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
- Enable or disable redirects for addresses opened from the address bar,
  bookmarks, or external apps. This option is off by default.

You can disable or uninstall un-X through Firefox’s Add-ons Manager. Uninstalling
removes its local extension settings. Disabling redirects or uninstalling cannot
delete data already received by destination websites or entries in Firefox’s
own browsing history.

## Questions

Contact the maintainer through the
[un-X issue tracker](https://github.com/marras/unx/issues). Issues are public;
avoid posting private URLs, tokens, or other sensitive information.
