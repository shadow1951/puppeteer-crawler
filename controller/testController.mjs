import puppeteer from "puppeteer";
import { crawlData } from "./pupteerController.mjs";
import { exists } from "fs";

export const testCrawl = async (req, res) => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.goto(req.query.url);

  await page.waitForSelector("a");
  const pageTitle = await page.title();
  res.json(pageTitle);
};

export const loginToPacifyca = async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();
    // Check if the element exists

    await page.goto(process.env.URL, {
      waitUntil: "networkidle0",
    });
    await page.waitForSelector("#email", { visible: true });

    await page.type("#email", process.env.username);
    await page.type("#password", process.env.password);
    await page.waitForSelector(".btn.btn-primary", { visible: true });

    const buttons = await page.$$(".btn.btn-primary");
    if (buttons.length > 1) {
      await buttons[1].click(); // Click the second button
    } else {
      console.log("The second login button not found.");
    }

    await page.waitForNavigation();
    await page.waitForSelector("a");

    const results = await crawlData;
    const cookies = await page.cookies();
    console.log(cookies);

    // Setting a cookie
    await page.setCookie({ name: "key", value: "value" });

    // Accessing local storage
    const localStorageData = await page.evaluate(() => {
      return JSON.stringify(window.localStorage);
    });
    console.log(localStorageData);

    browser.close();
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
