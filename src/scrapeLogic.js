const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (term) => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  try {
    const page = await browser.newPage();

    await page.goto(`https://semanticscholar.org/search?q=${encodeURIComponent(term.trim())}`);

    // Envolva o código que pode gerar um TimeoutError em um bloco try/catch separado
    let results = [];
    try {
      await page.waitForSelector('.result-page', { timeout: 30000 });

      let items = await page.$$('.result-page div');

      for (let item of items.slice(0, 5)) {
        let titleElement = await item.$('a');
        let link = titleElement ? await page.evaluate(el => el.href, titleElement) : 'No link';

        let citeButton = await item.$('[data-test-id="cite-link"]');
        if (citeButton) {
          await citeButton.click();

          try {
            await page.waitForSelector('.tabs.flex-row.cite-modal__tabs', { timeout: 30000 });

            let thirdTabButton = await page.$('.tabs.flex-row.cite-modal__tabs li:nth-child(3) button');
            if (thirdTabButton) {
              await thirdTabButton.click();

              try {
                await page.waitForSelector('cite.formatted-citation.formatted-citation--style-apa', { timeout: 30000 });

                let citationElement = await page.$('cite.formatted-citation.formatted-citation--style-apa');
                let citationText = citationElement ? await page.evaluate(el => el.innerText, citationElement) : 'No citation';

                results.push({ link, citationText });

                await page.click('.cl-modal__close-section > button');
              } catch (citationError) {
                console.error('Failed to get citation:', citationError);
                results.push({ link: '', citationText: '' });
              }
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (tabError) {
            console.error('Failed to click tab:', tabError);
            results.push({ link: '', citationText: '' });
          }
        } else {
          results.push({ link: '', citationText: '' });
        }
      }
    } catch (selectorError) {
      console.error('Failed to find result page:', selectorError);
      results = [{ link: '', citationText: '' }];
    }

    console.log(`Referências obtidas para o termo "${term.trim()}":`, results);
    return results;
  } catch (e) {
    console.error('An unexpected error occurred:', e);
    return [{ link: '', citationText: '' }];
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
