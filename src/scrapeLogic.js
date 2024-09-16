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
    const linksSet = new Set(); // Conjunto para armazenar links já adicionados
    try {
      await page.waitForSelector('.mainbody.right', { timeout: 30000 });

      let items = await page.$$('.mainbody.right .result-body');

      for (let item of items.slice(0, 5)) {
        let titleElement = await item.$('h2');
        let title = titleElement ? await page.evaluate(el => el.innerText, titleElement) : 'No Title';

        let authorElement = await item.$('.author div:nth-of-type(2) div a');
        let author = authorElement ? await page.evaluate(el => el.innerText, authorElement) : 'no author';

        let linkElement = await item.$('.link a');
        let link = linkElement ? await page.evaluate(el => el.href, linkElement) : 'no link';

        // Verificação se o link já foi adicionado
        if (link && !linksSet.has(link)) {
          linksSet.add(link); // Adiciona o link ao conjunto
          results.push({ link, title, author }); // Adiciona ao resultado
        }
      }
    } catch (selectorError) {
      console.error('Failed to find result page:', selectorError);
      results = [{ link: '', title: '', author: '' }];
    }

    return results;
  } catch (e) {
    console.error('An unexpected error occurred:', e);
    return [{ link: '', title: '', author: '' }];
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };
