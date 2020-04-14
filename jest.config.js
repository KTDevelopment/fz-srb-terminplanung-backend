module.exports = {
    collectCoverageFrom: [
        "src/**/*.ts"
    ],
    coverageDirectory: "test-reports/coverage",
    testRegex: ".tests.ts$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    cacheDirectory: '.jest/cache',
    reporters: [
        "default",
        ["jest-stare", {
            resultDir: "test-reports/unit",
            reportTitle: "unit-report",
            coverageLink: "../coverage/lcov-report/index.html",
        }]
    ],
};
