declare module NodeJS  {
    interface Global {
        testApp: any
        accessToken: string
        refreshToken: string
        testDataManager: any
    }
}
