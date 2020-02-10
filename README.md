# Brazilian Portuguese Verb Scraper

A simple Node.js scraper to get verb conjugations I want to study from conjugacao.com.br

0. Install Lerna: `npm install -g lerna`
1. Run `lerna bootstrap` to install all dependencies in the client and the scraper.
1. If you haven't already compiled your verbs in the scraper, run `lerna run scrape`.
1. After this, you may run the client using `lerna run start`.
1. If you'd like to deploy, fill in the appropriate information in your client's `package.json` and run `lerna run deploy`.
