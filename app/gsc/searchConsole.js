const fs = require('fs');
const { google } = require('googleapis');
const credentials = require('../../oauth.json');
const tokens = JSON.parse(fs.readFileSync('token.json'));
const { client_id, client_secret, } = credentials.installed;

const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost:3333'
);

oAuth2Client.setCredentials(tokens);

const searchconsole = google.searchconsole({
    version: 'v1',
    auth: oAuth2Client,
});

async function getQueries(pageUrl) {

    const response =
        await searchconsole.searchanalytics.query({

            siteUrl: 'sc-domain:equiposdeseguridadmexico.com',

            requestBody: {
                startDate: '2025-02-25',
                endDate: '2026-06-25',
                dataState: 'all',
                dimensions: ['query'],
                type: 'web',
                aggregationType: 'byPage',
                dimensionFilterGroups: [
                    {
                        filters: [
                            {
                                dimension: 'page',
                                operator: 'equals',
                                expression: pageUrl,
                            },
                            {
                                dimension: 'searchAppearance',
                                operator: 'equals',
                                expression: 'PRODUCT_SNIPPETS',
                            },
                        ],
                    },
                ],
                rowLimit: 22,
            },
        });

    return response.data.rows || [];
}

module.exports = {
    getQueries,
};