import puppeteer from "puppeteer";

// Function to crawl a URL
const crawl = async (url, depth, maxSites, visitedUrls = new Set()) => {
  // Stop if depth is zero, max sites reached, or the URL has already been visited
  if (depth === 0 || visitedUrls.size >= maxSites || visitedUrls.has(url))
    return [];

  visitedUrls.add(url); // Mark the URL as visited
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  const results = [];

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    console.log(`Crawling: ${url}`);

    // Extract all links from the page
    const links = await page.$$eval(
      "a",
      (anchors) => anchors.map((anchor) => anchor.href).filter((href) => href) // Filter out empty links
    );

    console.log("Links:", links);
    results.push({ url, links });

    // Recursively crawl each link
    for (const link of links) {
      // Only crawl if we haven't exceeded the maxSites limit
      if (visitedUrls.size < maxSites) {
        const nestedResults = await crawl(
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
    await page.close(); // Close the page before closing the browser
    await browser.close();
  }

  return results; // Return collected results
};

// Define the crawling endpoint
export const crawlData = async (req, res) => {
  const { url, depth, maxSites } = req.query;

  if (!url || !depth || !maxSites) {
    return res
      .status(400)
      .json({ error: "Please provide a valid URL, depth, and maxSites." });
  }

  try {
    const crawlDepth = parseInt(depth);
    const siteLimit = parseInt(maxSites);

    if (isNaN(crawlDepth) || crawlDepth < 1) {
      return res
        .status(400)
        .json({ error: "Depth must be a positive integer." });
    }

    if (isNaN(siteLimit) || siteLimit < 1) {
      return res
        .status(400)
        .json({ error: "maxSites must be a positive integer." });
    }

    const results = await crawl(url, crawlDepth, siteLimit);
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: `Failed to crawl: ${error.message}` });
  }
};
