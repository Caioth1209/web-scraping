const puppeteer = require("puppeteer");
require("dotenv").config();

const scrapeLogic = async (term) => {
  const browser = await puppeteer.launch({
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
    headless: false
  });

  try {
    const page = await browser.newPage();

    await page.goto(`https://lume.ufrgs.br/handle/10183/1/discover?query=${term.trim()}&submit=&dateMode=select&querytype_0=title&query_relational_operator_0=contains&query_value_0=&querytype_1=authortd&query_relational_operator_1=contains&query_value_1=&querytype_2=orientador&query_relational_operator_2=contains&query_value_2=&querytype_3=subject&query_relational_operator_3=contains&query_value_3=&querytype_4=dateIssued&query_relational_operator_4=contains&query_value_4=&select_mes_inicio_4=&select_dia_inicio_4=&select_mes_fim_4=&select_dia_fim_4=&querytype_5=dataAno&query_relational_operator_5=equals&query_value_5=&querytype_6=nivelAcademico&query_relational_operator_6=equals&query_value_6=&querytype_7=tipo&query_relational_operator_7=equals&query_value_7=&querytype_8=idioma&query_relational_operator_8=equals&query_value_8=&querytype_9=formatoArquivo&query_relational_operator_9=equals&query_value_9=&querytype_10=serie&query_relational_operator_10=contains&query_value_10=&querytype_11=author&query_relational_operator_11=contains&query_value_11=&querytype_12=acervo&query_relational_operator_12=contains&query_value_12=&querytype_13=descriptionSection&query_relational_operator_13=contains&query_value_13=&querytype_14=tipoAto&query_relational_operator_14=contains&query_value_14=&querytype_15=natureza&query_relational_operator_15=contains&query_value_15=&querytype_16=numeroAto&query_relational_operator_16=contains&query_value_16=&querytype_17=orgao&query_relational_operator_17=contains&query_value_17=&querytype_18=dataFinal&query_relational_operator_18=contains&query_value_18=&select_mes_inicio_18=&select_dia_inicio_18=&select_mes_fim_18=&select_dia_fim_18=&querytype_19=programa&query_relational_operator_19=contains&query_value_19=&querytype_20=entrevistado&query_relational_operator_20=contains&query_value_20=&querytype_21=grandeArea&query_relational_operator_21=contains&query_value_21=&querytype_22=tipoDeApresentacao&query_relational_operator_22=contains&query_value_22=&querytype_23=areaTematica&query_relational_operator_23=contains&query_value_23=&querytype_24=coordenador&query_relational_operator_24=contains&query_value_24=&querytype_25=origem&query_relational_operator_25=contains&query_value_25=&querytype_26=unidade&query_relational_operator_26=contains&query_value_26=&querytype_27=status&query_relational_operator_27=contains&query_value_27=&querytype_28=curso&query_relational_operator_28=contains&query_value_28=&querytype_29=nivelDeEnsino&query_relational_operator_29=contains&query_value_29=&querytype_30=tipoDeMaterial&query_relational_operator_30=contains&query_value_30=`);

    // Envolva o código que pode gerar um TimeoutError em um bloco try/catch separado
    let results = [];
    try {
      await page.waitForSelector('#aspect_discovery_SimpleSearch_div_search-results', { timeout: 30000 });

      let items = await page.$$('#aspect_discovery_SimpleSearch_div_search-results');

      for (let item of items.slice(0, 5)) {
        let titleElement = await item.$('.row.ds-artifact-item .col-sm-9.artifact-description a');
        console.log(item);

        let link = titleElement ? await page.evaluate(el => el.href, titleElement) : 'No link';
        let titleArticle = await item.$('.row.ds-artifact-item .col-sm-9.artifact-description a h4')
        titleArticle = titleArticle ? await page.evaluate(el => el.innerText, titleArticle) : 'no Title';
        results.push({ link, titleArticle })

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
