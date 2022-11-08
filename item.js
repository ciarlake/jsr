class Item {
    name
    manufacturer
    storageTemperature
    basePrice
    productionDate
    shelfLife
    measurement
    vendorId

    constructor(name, manufacturer, storageTemperature, basePrice, productionDate, shelfLife, measurement, vendorId) {
        this.name = name
        this.manufacturer = manufacturer
        this.storageTemperature = storageTemperature
        this.basePrice = basePrice
        this.productionDate = productionDate
        this.shelfLife = shelfLife
        this.measurement = measurement
        this.vendorId = vendorId
    }

    calculatePrice(rating, amount) {
        const k = (amount <= 100) ? 1 : ((amount <= 1000) ? 0.95 : 0.9)
        const discount = this.basePrice * rating / 100

        return (this.basePrice - discount) * k * amount
    }

    simulateStorage() {
        return Array(6).map(() => Math.random() * 100 - 50)
    }
}

export { Item }