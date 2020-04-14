module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "../",
  testEnvironment: "node",
  testRegex: ".e2e.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  setupFilesAfterEnv: ["./setup/e2e-setup.ts"],
  reporters: [
    "default",
    ["jest-stare", {
      resultDir: "test-reports/e2e",
      reportTitle: "e2e-report",
      coverageLink: "../coverage/lcov-report/index.html",
    }]
  ]
};
