# un-X AMO listing draft

Copy the Summary and Description sections into the corresponding AMO fields.
The remaining sections contain listing metadata, reviewer notes, and screenshot
copy. Resolve the items under Before submission before publishing.

## Name

un-X

## Summary

Redirect X and Instagram links to alternative sites, or configure your own source and destination hosts.

## Description

Choose where links take you. un-X redirects top-level navigations using editable source and destination host pairs.

Two pairs are active by default:

- x.com → nitter.cf
- instagram.com → kittygram.irelephant.net

You can replace or remove either pair and add your own. Redirects preserve the
URL path, query string, and fragment, and destinations use HTTPS. Source hosts
also match their www. version; other subdomains need their own pair.

Normal clicks, Ctrl/Cmd-clicks, and middle clicks retain their usual tab behavior.
Each navigation request applies one pair, without chaining through other pairs.

Clicked links, typed or pasted addresses, bookmarks, and external-app links all
redirect automatically. Top-level HTTP(S) GET requests are covered; POST form
submissions and embedded frames are not redirected.

After a redirect, click the un-X icon in the Firefox desktop address bar to open
the original URL. The original host can then be browsed and reloaded in that tab
until the tab leaves the host or closes. Other tabs continue redirecting.

To configure un-X, open Firefox’s Add-ons Manager, select un-X, and open its
Preferences or Options. Edit the host pairs and select “Save changes”. Saved
changes apply to open tabs. Remove all pairs and save to disable all redirects.

Website access is needed to redirect navigations to custom source hosts. Firefox restricts extensions on certain
pages, including its internal pages and protected Mozilla pages.

Settings stay in your browser profile. The extension has no analytics and sends
no data to a developer-operated collection server. Redirecting a link causes
your browser to contact the configured destination website with the preserved
path and query string. The destination receives your IP address and may receive
data through its own normal website behavior. Preserved URL fragments can be
read by the destination page even though they are not sent in the HTTP request.
Destination websites handle data under their own policies.

Alternative websites may be unavailable or may not support the original site’s
content, paths, or features. You can change the destination hosts in the options.

Requires Firefox 142 or later.

## Listing metadata

- Suggested AMO slug: `un-x`, subject to availability.
- Suggested desktop category: Other.
- Homepage: https://github.com/marras/unx
- Support website: https://github.com/marras/unx/issues
- Support email: supply a public support address if used in the listing.
- License: GNU General Public License v3.0 only (`GPL-3.0-only` on AMO).
- Privacy policy: select “This add-on has a privacy policy” and paste the content
  of [PRIVACY.md](../PRIVACY.md) into the policy field.
- Payment or additional hardware required by the extension: no.
- Android availability: select only after testing the extension on Firefox for Android.

## Notes for reviewers

un-X is a configurable host redirect extension. Its initial pairs are
x.com → nitter.cf and instagram.com → kittygram.irelephant.net. Users can edit
or remove every pair. All eligible navigations redirect automatically.

Permissions:

- Access to all websites: allows redirecting navigations to user-configured hosts.
- storage: saves host pairs in storage.local and temporary original URLs and
  per-tab exceptions in in-memory storage.session.
- webRequest and webRequestBlocking: redirect top-level HTTP(S) GET requests
  before loading the source site.
- webNavigation: tracks committed navigations and same-document URL changes to
  update the address-bar icon and clear exceptions when leaving the original host.
- Required browsingActivity data permission: redirects transmit the preserved
  URL path and query to the configured destination site. Firefox’s built-in
  consent is used; the minimum Firefox version is 142.

The extension keeps temporary redirect records in memory, does not maintain a
browsing history database, use analytics, or contact a
developer-operated collection endpoint. It includes readable JavaScript with
no dependencies, minification, generated code, or build step. No account is
needed to configure or test the redirect mechanism.

To test without depending on alternative services:

1. Open the options, remove the initial pairs, add example.com → example.org,
   and save.
2. Click a link to https://example.com/ on an ordinary web page. Confirm navigation
   to https://example.org/ and the un-X address-bar icon. Ctrl/Cmd-click and
   middle-click should retain their normal tab behavior.
3. Enter https://example.com/?unx-test=1#demo in the address bar. Confirm the URL
   becomes https://example.org/?unx-test=1#demo and shows the icon.
4. Click the icon. Confirm return to the original URL. Reload and browse within
   example.com; the tab should stay on that host. Another tab should still redirect.
5. Navigate the excepted tab to an unrelated site, then open example.com again.
   Confirm redirects resume. Remove all pairs and save to disable redirects.

## Screenshot copy

Capture the actual extension UI with a clean test profile and no personal data.

1. Options showing both default pairs.
   Caption: “Edit the default X and Instagram redirects, or add your own host pairs.”
2. A redirected page with the un-X address-bar icon visible.
   Caption: “Click un-X to browse the original site in this tab.”
3. Options with every pair removed and changes saved.
   Caption: “Remove all host pairs and save to turn off redirects.”

## Before submission

- Confirm that the support issue tracker is available to users, and supply a
  support email if desired or required by the submission form.
- Capture the screenshots described above.
- Test the default destinations before release and update both the code and
  listing if either destination changes.
- Choose the experimental flag based on whether the release is ready for
  general use; select only platforms you have tested.

## Mozilla requirements

- [Listing fields and submission process](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)
- [Add-on policies including functionality and data disclosures](https://extensionworkshop.com/documentation/publish/add-on-policies/)
