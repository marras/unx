"use strict";

// TODO: Add redirects for x.com/* once the destination site is chosen.
// Register future browser event listeners at the top level so Firefox can
// restore them when this non-persistent background script starts again.
browser.runtime.onInstalled.addListener(() => {
  console.info("unxcom installed. Redirects are not configured yet.");
});
