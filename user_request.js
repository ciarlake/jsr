class VendorRequest {
    fromId
    marketId

    constructor(fromId, marketId) {
        this.fromId = fromId
        this.marketId = marketId
    }
}

class CustomerRequest {
    fromId

    constructor(fromId) {
        this.fromId = fromId
    }
}

export { VendorRequest, CustomerRequest }