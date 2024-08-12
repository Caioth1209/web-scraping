const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (term) => {
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();

    await page.goto(`https://semanticscholar.org/search?q=${encodeURIComponent(term.trim())}`, {
      waitUntil: 'networkidle2'
    });

    await page.waitForSelector('.result-page');

    const results = [];
    let items = await page.$$('.result-page div');

    for (let item of items.slice(0, 5)) {
      let titleElement = await item.$('a');
      let title = titleElement ? await page.evaluate(el => el.innerText, titleElement) : 'No title';
      let link = titleElement ? await page.evaluate(el => el.href, titleElement) : 'No link';

      let citeButton = await item.$('[data-test-id="cite-link"]');
      if (citeButton) {
        await citeButton.click();

        await page.waitForSelector('.tabs.flex-row.cite-modal__tabs');

        let thirdTabButton = await page.$('.tabs.flex-row.cite-modal__tabs li:nth-child(3) button');
        if (thirdTabButton) {
          await thirdTabButton.click();

          await page.waitForSelector('cite.formatted-citation.formatted-citation--style-apa');

          let citationElement = await page.$('cite.formatted-citation.formatted-citation--style-apa');
          let citationText = citationElement ? await page.evaluate(el => el.innerText, citationElement) : 'No citation';

          results.push({ title, link, citationText });

          await page.click('.cl-modal__close-section > button');
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    await browser.close();
    console.log(`Referências obtidas para o termo "${term.trim()}":`, results);
    return results;
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
