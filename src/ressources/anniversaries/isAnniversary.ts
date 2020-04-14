export function isAnniversary (performanceCount: number){
    return performanceCount === 25 || performanceCount === 50 || performanceCount % 100 === 0
}
