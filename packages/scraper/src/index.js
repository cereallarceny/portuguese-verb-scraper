import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const baseUrl = 'https://www.conjugacao.com.br';

  const regularVerbsUrl = `${baseUrl}/verbos-regulares/`;
  const regularVerbsSelector = '.wrapper:first-of-type ul > li a[href]';

  const irregularVerbsUrl = `${baseUrl}/verbos-irregulares-no-portugues/`;
  const irregularVerbsSelector = '.articlebody ul:first-of-type > li a[href]';

  const readyToLearn = {
    Indicativo: ['Presente', 'Pretérito Imperfeito', 'Pretérito Perfeito']
  };

  const conjugations = [
    'eu',
    'você',
    'ele',
    'ela',
    'nós',
    'eles',
    'elas',
    'vocês'
  ];

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const storeData = (data, path) => {
    try {
      fs.writeFileSync(path, JSON.stringify(data));
    } catch (err) {
      console.error(err);
    }
  };

  const ensureDirectoryExistence = filePath => {
    const dirname = path.dirname(filePath);

    if (fs.existsSync(dirname)) return true;

    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  };

  const getVerbList = async (url, selector) => {
    await page.goto(url);

    return await page.$$eval(
      selector,
      (links, u) => links.map(link => `${u}${link.getAttribute('href')}`),
      baseUrl
    );
  };

  const getTensesFromLink = async links => {
    const verbs = [];

    for (let i = 0; i < links.length; i++) {
      const url = links[i];

      await page.goto(url, { waitUntil: 'load' });

      const verb = await page.evaluate(
        (readyToLearn, conjugations) => {
          const returnVerb = {};

          returnVerb.name = document
            .querySelector('#content h1.nmt')
            .innerHTML.toLowerCase()
            .split('verbo ')[1];

          const types = document.querySelectorAll(
            '#conjugacao > div > .tempos'
          );
          const returnTypes = [];

          types.forEach(type => {
            const returnType = {};

            const typeName = type.querySelector('h3').innerHTML;

            if (readyToLearn.hasOwnProperty(typeName)) {
              returnType.name = typeName;
              returnType.modes = [];

              const modes = type.querySelectorAll('.tempo-conjugacao');

              modes.forEach(mode => {
                const returnMode = {};

                const modeName = mode.querySelector('h4').innerHTML;

                if (readyToLearn[typeName].includes(modeName)) {
                  returnMode.name = modeName;
                  returnMode.conjugations = [];

                  const modeData = mode.querySelectorAll('p > span > span');

                  modeData.forEach(modeDataItem => {
                    if (modeDataItem.innerHTML !== '--') {
                      const modeDataItemPronoun = modeDataItem.querySelector(
                        'span:first-child'
                      ).innerHTML;
                      const modeDataItemConjugation = modeDataItem.querySelector(
                        'span:last-child'
                      ).innerHTML;

                      if (conjugations.includes(modeDataItemPronoun)) {
                        returnMode.conjugations.push({
                          pronoun: modeDataItemPronoun,
                          conjugation: modeDataItemConjugation
                        });
                      }
                    }
                  });

                  returnType.modes.push(returnMode);
                }
              });

              returnTypes.push(returnType);
            }
          });

          returnVerb.types = returnTypes;

          return returnVerb;
        },
        readyToLearn,
        conjugations
      );

      console.log(`Completed: ${url}`);

      verbs.push(verb);
    }

    console.log('\n');

    return verbs;
  };

  /* ----- CREATE DIR IF NEEDED ----- */
  const dataPath = '../client/src/data';

  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
  }

  /* ----- REGULAR VERBS ----- */
  console.log('Starting: Regular verbs');

  const regularVerbLinks = await getVerbList(
    regularVerbsUrl,
    regularVerbsSelector
  );

  const regularVerbs = await getTensesFromLink(regularVerbLinks);
  await storeData(regularVerbs, `${dataPath}/regular-verbs.json`);

  /* ----- IRREGULAR VERBS ----- */
  console.log('Starting: Irregular verbs');

  const irregularVerbLinks = await getVerbList(
    irregularVerbsUrl,
    irregularVerbsSelector
  );

  const irregularVerbs = await getTensesFromLink(irregularVerbLinks);
  await storeData(irregularVerbs, `${dataPath}/irregular-verbs.json`);

  await browser.close();
})();
