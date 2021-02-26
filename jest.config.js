module.exports = {
    moduleFileExtensions: ["ts", "json", "js"],
    collectCoverageFrom: [
        "src/**/*.ts"
    ],
    coverageDirectory: "test-reports/coverage",
    testEnvironment: "node",
    testRegex: "((\\.|/)(e2e|tests))\\.[jt]sx?$",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    cacheDirectory: '.jest/cache',
    reporters: [
        "default",
        ["jest-stare", {
            resultDir: "test-reports/html",
            reportTitle: "html-report",
            coverageLink: "../coverage/lcov-report/index.html",
        }]
    ],
};
