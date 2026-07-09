const { getQueries } = require('../app/gsc/searchConsole');
const { createBrowser, searchKeyword, } = require('../app/scraper/googleScraper');
const { saveRanking } = require('../app/rankingSave/saveRanking');

async function run() {

    const targetUrl = 'https://www.equiposdeseguridadmexico.com/overol-forestal-tb-ov/';

    const queries = await getQueries('https://www.equiposdeseguridadmexico.com/overol-forestal-tb-ov/');

    const {
        context,
        page,
    } = await createBrowser();

    const results = [];

    for (const row of queries) {
        const keyword = row.keys[0];

        try {
            const ranking =
                await searchKeyword(
                    page,
                    keyword,
                    targetUrl
                );

            results.push({

                keyword,

                clicks:
                    row.clicks,

                impressions:
                    row.impressions,

                ctr:
                    row.ctr,

                gscAveragePosition:
                    row.position,

                serpPosition:
                    ranking.position,

                found:
                    ranking.found,
            });

            console.log(ranking);

            const delay =
                Math.floor(Math.random() * 10000)
                + 5000;

            console.log(
                `Esperando ${delay / 1000}s`
            );

            await page.waitForTimeout(delay);

        } catch (error) {

            console.error(error);

            results.push({
                keyword,
                error: true,
            });
        }
    }

    console.dir(results, {
        depth: null,
    });

    await context.close();

    await saveRanking(results);
}

run();