const fs = require('fs');
const path = require('path');

async function saveRanking(results) {
    const timestamp = new Date()
        .toISOString()
        .replace(/:/g, '-');

    const fileName = `ranking-${timestamp}.json`;
    const outputDir = path.resolve(__dirname, '..', 'ranking');

    fs.mkdirSync(outputDir, { recursive: true });

    const filePath = path.join(outputDir, fileName);

    fs.writeFileSync(
        filePath,
        JSON.stringify(results, null, 2),
        'utf8'
    );

    console.log(`Ranking guardado en: ${filePath}`);
}

module.exports = {
    saveRanking,
};