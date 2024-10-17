import puppeteer from "puppeteer";

// Function to crawl a URL and extract emails with their source URLs
const crawlEmail = async (url, depth, maxSites, visitedUrls = new Set()) => {
  if (depth === 0 || visitedUrls.size >= maxSites || visitedUrls.has(url))
    return [];

  visitedUrls.add(url); // Mark the URL as visited
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let results = []; // Store emails with their source URLs

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    console.log(`Crawling: ${url}`);

    // Extract page content and find emails
    const pageContent = await page.content();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const foundEmails = pageContent.match(emailRegex) || [];

    console.log(`Emails found on ${url}:`, foundEmails);

    // Store emails along with their source URL
    for (const email of foundEmails) {
      results.push({ email, source: url });
    }

    // Extract all links from the page
    const links = await page.$$eval("a", (anchors) =>
      anchors.map((anchor) => anchor.href).filter((href) => href)
    );

    // Recursively crawl each link
    for (const link of links) {
      if (visitedUrls.size < maxSites) {
        const nestedResults = await crawlEmail(
          link,
          depth - 1,
          maxSites,
          visitedUrls
        );
        results.push(...nestedResults); // Append nested results
      }
    }
  } catch (error) {
    console.error(`Failed to crawl ${url}: ${error.message}`);
  } finally {
    await page.close();
    await browser.close();
  }

  return results; // Return emails with their source URLs
};

// Express route handler for crawling emails
export const crawlEmails = async (req, res) => {
  const { url, depth, maxSites } = req.query;

  if (!url || !depth || !maxSites) {
    return res
      .status(400)
      .json({ error: "Please provide a valid URL, depth, and maxSites." });
  }

  try {
    const crawlDepth = parseInt(depth);
    const crawlMaxSites = parseInt(maxSites);

    if (
      isNaN(crawlDepth) ||
      crawlDepth < 1 ||
      isNaN(crawlMaxSites) ||
      crawlMaxSites < 1
    ) {
      return res
        .status(400)
        .json({ error: "Depth and maxSites must be positive integers." });
    }

    const results = await crawlEmail(url, crawlDepth, crawlMaxSites);
    res.json({ results }); // Respond with emails and their source URLs
  } catch (error) {
    res.status(500).json({ error: `Failed to crawl: ${error.message}` });
  }
};
