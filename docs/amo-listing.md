# un-X AMO listing draft

Copy the Summary and Description sections into the corresponding AMO fields.
The remaining sections contain listing metadata, reviewer notes, and screenshot
copy. Resolve the items under Before submission before publishing.

## Name

un-X

## Summary

Redirect X and Instagram links to alternative sites, or configure your own source and destination hosts.

## Description

Choose where links take you. un-X redirects links on ordinary web pages using
editable source and destination host pairs.

Two pairs are active by default:

- x.com → nitter.cf
- instagram.com → kittygram.irelephant.net

You can replace or remove either pair and add your own. Redirects preserve the
URL path, query string, and fragment, and destinations use HTTPS. Source hosts
also match their www. version; other subdomains need their own pair.

Normal clicks, Ctrl/Cmd-clicks, and middle clicks retain their usual tab behavior.
Each click applies one pair, without chaining through other pairs.

Redirecting addresses typed or pasted into the address bar, opened from external
apps, or opened from bookmarks is optional and off by default. Enable “Redirect
links typed or pasted into the address bar or opened from external apps” in the
options and save to use this feature.

To configure un-X, open Firefox’s Add-ons Manager, select un-X, and open its
Preferences or Options. Edit the host pairs and select “Save changes”. Saved
changes apply to open tabs. Remove all pairs and save to disable all redirects.

Website access is needed to handle clicks on pages where you encounter links
and to support custom source hosts. Firefox restricts extensions on certain
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
or remove every pair. Direct-navigation redirects are off by default.

Permissions:

- Access to all websites: content scripts handle clicks on ordinary web pages,
  including links to user-configured source hosts. Host access also allows the
  background listener to redirect configured direct navigations.
- storage: saves host pairs and the direct-navigation preference in storage.local.
- webRequest and webRequestBlocking: redirect eligible top-level GET requests
  without an originating page when the direct-navigation option is enabled.
- Required browsingActivity data permission: redirects transmit the preserved
  URL path and query to the configured destination site. Firefox’s built-in
  consent is used; the minimum Firefox version is 142.

The extension does not record browsing history, use analytics, or contact a
developer-operated collection endpoint. It includes readable JavaScript with
no dependencies, minification, generated code, or build step. No account is
needed to configure or test the redirect mechanism.

To test without depending on alternative services:

1. Open the options, remove the initial pairs, add example.com → example.org,
   and save. Leave the direct-navigation checkbox unchecked.
2. On an ordinary web page with a link to https://example.com/, click that link.
   Confirm navigation to https://example.org/. Ctrl/Cmd-click and middle-click
   should retain the browser’s normal tab behavior.
3. Open https://example.com/ directly from the address bar. It should remain
   on example.com while the option is off.
4. Enable the direct-navigation checkbox and save. Enter
   https://example.com/?unx-test=1#demo in the address bar. The resulting URL
   should be https://example.org/?unx-test=1#demo.
5. Remove all pairs and save. Clicked links and direct navigations should no
   longer redirect.

## Screenshot copy

Capture the actual extension UI with a clean test profile and no personal data.
These captions are ready to accompany the screenshots; the images still need
to be captured.

1. Options showing both default pairs with the direct-navigation checkbox off.
   Caption: “Edit the default X and Instagram redirects, or add your own host pairs.”
2. Options showing a custom example.com → example.org pair and the checkbox on.
   Caption: “Optionally redirect addresses opened from the address bar, bookmarks, and external apps.”
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
