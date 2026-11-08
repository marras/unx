# un-X privacy policy

Effective date: November 8, 2026
Last updated: November 8, 2026

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
un-X does not send these records to the developer. This describes the extension’s
own storage; Firefox and your operating system may maintain separate records.

The extension does not maintain a browsing history database or send a list of
the pages you visit to the developer.

## Settings stored locally

un-X saves your source and destination host pairs in Firefox’s local extension
storage so it can remember and apply your redirect configuration. These settings
remain until you change them or remove the extension.
The extension does not upload or sync them to a server.

## Information sent to destination websites

When a matching link is redirected, your browser opens the configured destination
over HTTPS, preserving the original URL path, query string, and fragment.
Paths, query strings, and fragments may contain usernames, search terms,
identifiers, authentication tokens, or sensitive personal information. un-X
preserves this information in the destination URL without filtering it.

For example, with the default X rule,
`https://x.com/user?q=hello#post` becomes
`https://nitter.cf/user?q=hello#post`. The destination server receives `/user`
and `q=hello`. The fragment `#post` is not sent in the HTTP request, but can be
read by scripts on the destination page.

The destination also receives your network IP address and the normal request
information sent by Firefox. Depending on your browser settings and the website,
this can include cookies for the destination, browser information, and a referrer.
After receiving the redirected request, the destination website may further
process or retain data under its own policies. The maintainer does not control
those subsequent activities. This statement does not exclude any legal
responsibility the maintainer may have for the initial redirect and transmission.

Until you save your own pairs, the default destinations are:

- `x.com` → `nitter.cf`
- `instagram.com` → `kittygram.irelephant.net`

The default destination websites are operated by third parties. The maintainer
does not own or operate those websites. The default redirect rules are enabled
automatically, and you can change or remove them in the extension’s settings.

Changing a destination changes which website receives the redirected request.
Only configure destinations you trust with the information in those URLs.

## Your choices

Firefox requests a browsing activity data permission during installation because
redirects transmit URL information to destination websites. You can decline
installation if you do not want to allow this transmission.

In Firefox’s Add-ons Manager, select un-X and open its Preferences or Options to:

- Change or remove individual host pairs.
- Remove every pair and select “Save changes” to stop all redirects.

On Firefox desktop, click the un-X address-bar icon after a redirect to visit the
original site in that tab. The exception ends when the tab leaves that host or closes.

You can disable or uninstall un-X through Firefox’s Add-ons Manager. Uninstalling
removes its local extension settings. Disabling redirects or uninstalling cannot
delete data already received by destination websites or entries in Firefox’s
own browsing history.

## Changes to this policy

Updates to this policy will be published here with a revised “Last updated” date
and an effective date. Material changes will also be described in the extension’s
release notes. Any new consent required by applicable law will be obtained before
the relevant processing begins.

## Questions

Contact the maintainer through the
[un-X issue tracker](https://github.com/marras/unx/issues). Issues are public;
avoid posting private URLs, tokens, or other sensitive information.
