class LoanRequest {
    fromId

    constructor(fromId) {
        this.fromId = fromId
    }
}

class Loan {
    borrowerId
    total
    repayed = 0

    constructor(total, borrowerId) {
        this.total = total
        this.borrowerId = borrowerId
    }

    withdraw(amount) {
        repayed += amount
    }
}

export { Loan, LoanRequest }