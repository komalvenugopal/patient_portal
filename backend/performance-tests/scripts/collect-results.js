const fs = require('fs');
const path = require('path');

function collectResults(testRunId) {
    const jmeterResults = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, `../results/reports_${testRunId}/results.jtl`)
        )
    );
    
    const applicationMetrics = JSON.parse(
        fs.readFileSync(
            path.join(__dirname, `../results/reports_${testRunId}/app-metrics.json`)
        )
    );
    
    return {
        jmeter: jmeterResults,
        application: applicationMetrics,
        summary: generateSummary(jmeterResults, applicationMetrics)
    };
}

function generateSummary(jmeterResults, appMetrics) {
    // Add your summary logic here
    return {
        totalRequests: jmeterResults.length,
        avgResponseTime: calculateAverage(jmeterResults.map(r => r.elapsed)),
        errorRate: calculateErrorRate(jmeterResults),
        appMetrics: summarizeAppMetrics(appMetrics)
    };
} 