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

    await page.goto(`https://bdtd.ibict.br/vufind/Search/Results?lookfor=${term.trim()}&type=AllFields`);

    let results = [];
    try {
      await page.waitForSelector('.mainbody.right', { timeout: 30000 });

      let items = await page.$$('.mainbody.right');

      for (let item of items.slice(0, 5)) {
        const path = "#result0 .media .media-body .result-body"
        let titleElement = await item.$(`${path} h2`);
        let title = titleElement ? await page.evaluate(el => el.innerText, titleElement) : 'No Title';
        let author = await item.$(`${path} .author div:nth-of-type(2) div a`)
        author = author ? await page.evaluate(el => el.innerText, author) : 'no author';
        let link = await item.$(`${path} .link a`)
        link = link ? await page.evaluate(el => el.href, link) : 'no link'
        results.push({ link, title, author })

      }
    } catch (selectorError) {
      console.error('Failed to find result page:', selectorError);
      results = [{ link: '', title: '', author: '' }];
    }

    console.log(`Referências obtidas para o termo "${term.trim()}":`, results);
    return results;
  } catch (e) {
    console.error('An unexpected error occurred:', e);
    return [{ link: '', title: '', author: '' }];
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
