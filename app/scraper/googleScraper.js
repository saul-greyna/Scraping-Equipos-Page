const { chromium } = require('playwright');

async function createBrowser() {

    const context =
        await chromium.launchPersistentContext(
            './chrome-data',
            {
                headless: false,

                viewport: {
                    width: 1250,
                    height: 940,
                },

                userAgent:
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',

                locale: 'es-MX',
            }
        );

    const page = await context.newPage();

    return {
        context,
        page,
    };
}

async function randomDelay(page) {

    const delay =
        Math.floor(Math.random() * 4000) + 3000;

    await page.waitForTimeout(delay);
}

async function humanBehavior(page) {

    await page.mouse.move(
        Math.random() * 500,
        Math.random() * 500
    );

    await page.waitForTimeout(1000);

    await page.mouse.wheel(
        0,
        Math.random() * 1000
    );

    await page.waitForTimeout(1500);
}

function normalizeUrl(url) {

    try {
        const parsed =
            new URL(url);

        return (
            parsed.origin +
            parsed.pathname
        )
            .replace(/\/+$/, '')
            .toLowerCase()
            .trim();

    } catch {
        return url
            .split('?')[0]
            .replace(/\/+$/, '')
            .toLowerCase()
            .trim();
    }
}

let firstSearch = true;

async function searchKeyword(
    page,
    keyword,
    targetUrl
) {

    console.log(`Buscando: ${keyword}`);

    await page.goto(
        'https://www.google.com',
        {
            waitUntil: 'domcontentloaded',
        }
    );

    await randomDelay(page);

    const searchInput =
        page.locator('textarea[name="q"]');

    await searchInput.fill(keyword);

    await randomDelay(page);

    await page.keyboard.press('Enter');

    if (firstSearch) {

        console.log(
            'Esperando resolución manual de CAPTCHA...'
        );

        await page.waitForTimeout(90000);

        firstSearch = false;
    }

    await page.waitForSelector(
        'div.yuRUbf',
        {
            state: 'attached',
            timeout: 15000,
        }
    );

    await humanBehavior(page);

    await randomDelay(page);

    let currentPage = 1;

    const normalizedTarget =
        normalizeUrl(targetUrl);

    while (currentPage <= 10) {

        console.log(
            `Revisando página ${currentPage}`
        );

        await randomDelay(page);

        const organicResults = await page
            .locator('div.yuRUbf a')
            .evaluateAll(elements => {

                return elements.map(el => ({
                    href: el.href,
                    text: el.innerText || '',
                }));

            });

        const position =
            organicResults.findIndex(result => {

                const normalizedLink =
                    normalizeUrl(result.href);

                return (
                    normalizedLink ===
                    normalizedTarget
                );
            });

        if (position !== -1) {

            const realPosition =
                ((currentPage - 1) * 10)
                + position
                + 1;

            return {
                keyword,
                found: true,
                position: realPosition,
                page: currentPage,
            };
        }

        const nextButton =
            page.locator('#pnnext');

        const hasNext =
            await nextButton.count();

        if (!hasNext) {
            break;
        }

        const previousUrl = page.url();

        await Promise.all([

            nextButton.click(),

            page.waitForFunction(
                oldUrl =>
                    location.href !== oldUrl,
                previousUrl
            )
        ]);

        await randomDelay(page);

        await humanBehavior(page);

        currentPage++;
    }

    return {
        keyword,
        found: false,
        position: null,
        page: null,
    };
}

module.exports = {
    createBrowser,
    searchKeyword,
};