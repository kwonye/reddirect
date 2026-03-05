// Listen for navigation events to redirect Reddit subdomain URLs
browser.webNavigation.onBeforeNavigate.addListener((details) => {
    const url = new URL(details.url);

    // Match *.reddit.com subdomains (e.g., nba.reddit.com)
    const subdomainMatch = url.hostname.match(/^([a-z0-9_-]+)\.reddit\.com$/i);

    if (subdomainMatch) {
        const subdomain = subdomainMatch[1];

        // Skip common subdomains that shouldn't be redirected
        const skippedSubdomains = ['www', 'old', 'new', 'amp', 'm', 'i', 'static', 'preview', 'external-preview', 'gateway'];
        if (skippedSubdomains.includes(subdomain.toLowerCase())) {
            return;
        }

        // Build the new URL: reddit.com/r/{subdomain}
        const newPath = `/r/${subdomain}${url.pathname}${url.search}${url.hash}`;
        const newUrl = `https://reddit.com${newPath}`;

        console.log(`Reddirect: Redirecting ${url.hostname} to ${newUrl}`);
        browser.tabs.update(details.tabId, { url: newUrl });
    }
});

console.log("Reddirect extension loaded");
