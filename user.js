import { Review } from './review.js'
import { CustomerRequest, VendorRequest } from './user_request.js'
import { Loan, LoanRequest } from "./loan.js"
import { Item } from './item.js'

class User {
    username
    login
    password
    balance
    role 
    city
    vendorIds
    items
    reviews
    marketId

    constructor({ username, login, password, balance = 0, role = 1, city, vendorIds, items, reviews, marketId }) {
        if (!username) throw new Error('username cannot be empty')
        if (!login) throw new Error('login cannot be empty')
        if (!password) throw new Error('password cannot be empty')

        this.username = username
        this.login = login,
        this.password = password
        this.balance = balance
        this.role = role // Guest | Customer | Vendor | Supplier | Market | SystemAdministrator | Bank
        this.city = city
        this.vendorIds = vendorIds
        this.items = items
        this.reviews = reviews
        this.marketId = marketId
    }
}

class UserList {
    static #users = [
        new User({ username: 'test', login: 'test', password: 'test'} ),
        new User({ username: '123', login: '123', password: '123' }),
        new User({ 
            username: 'mkt', 
            login: 'mkt', 
            password: 'mkt', 
            balance: 1e+21, 
            role: 4, 
            city: 'Testville', 
            vendorIds: [3], 
            reviews: [
                new Review({
                    rating: 10,
                    body: "Отличное качество товара!",
                    author: 0,
                    likes: 25,
                    comments: [
                        new Review({
                            rating: 9,
                            body: "Подтверждаю",
                            author: 1,
                            likes: 20,
                            dislikes: 2
                        })
                    ]
                }),
                new Review({
                    rating: 9,
                    body: "Быстрое обслуживание!",
                    author: 1,
                    likes: 15,
                dislikes: 1,
                    comments: [
                        new Review({
                            rating: 2,
                            body: "А я долго ждал(9((((9((((99((((99((((",
                            dislikes: 11,
                            author: 0
                        }),
                        new Review ({
                            body: "Магазин приносит свои извинения за длительное ожидание",
                            likes: 40,
                            dislikes: 15,
                            author: 3
                        }),
                    ]
                })
            ] 
        }),
        new User({ username: 'vdr', login: 'vdr', password: 'vdr', role: 2, marketId: 2})
    ]

    static #vendorRequests = []
    static #customerRequests = []
    static #loanRequests = []
    static #loans = []
    static #items = []
    static #purchases = []

    static get users() {
        return this.#users
    }

    static get items() {
        return this.#items
    }

    static get usersStripped() {
        const usersStripped = this.#users

        usersStripped.forEach(u => {
            delete u.password
        })

        return usersStripped
    }

    static get vendorRequests() {
        return this.#vendorRequests
    }

    static get customerRequests() {
        return this.#customerRequests
    }

    static get loanRequests() {
        return this.#loanRequests
    }

    static get loans() {
        return this.#loans
    }

    static get purchases() {
        return this.#purchases
    }

    static addUser(user) {
        if (!user instanceof User) throw new Error('expected user to be User')

        if (this.#users.find(u => u.login == user.login)) {
            throw new Error('duplicate login')
        }

        return UserList.#users.push(user)
    }

    static createLoan(marketId) {
        const market = this.#users[marketId]
        if (!market) throw new Error('invalid market id')

        this.#loans.push(new Loan(10_000e+18, marketId))
    }

    static populateMarket(id, city) {
        if (!city) throw new Error('city cannot be empty')
        if (!this.#users[id]) throw new Error('invalid id')

        const user = this.#users[id]

        if(user.role != 1) throw new Error('user is not a customer')
        user.role = 4
        user.city = city
        user.vendorIds = []
        user.reviews = []
        user.items = []
        user.balance = 1000 * 1e+18

        this.#users[id] = user

        this.#loanRequests.push(new LoanRequest(id))
    }

    static stripMarket(id) {
        if (!this.#users[id]) throw new Error('invalid id')

        const market = this.#users[id]

        if (market.role != 4) throw new Error('user is not a market')
        market.role = 1

        delete market.city
        market.vendorIds.forEach(vendorId => {
            this.#users[vendorId].role = 1 
            delete this.#users[vendorId].marketId
        })
        delete market.vendorIds
        delete market.items
        delete market.reviews

        this.#users[id] = market
    }

    static marketAddVendor(marketId, vendorId) {
        console.log(marketId, vendorId)
        if (!this.#users[marketId]) throw new Error('invalid market id')
        if (!this.#users[vendorId]) throw new Error('invalid vendor id')

        const market = this.#users[marketId]
        const vendor = this.#users[vendorId]
        if (market.role != 4) throw new Error('user is not a market')
        if (vendor.role != 1) throw new Error('user is not a customer')

        market.vendorIds.push(vendorId)
        vendor.marketId = marketId
        vendor.role = 2

        this.#users[marketId] = market
        this.#users[vendorId] = vendor
    }

    static marketAddReview(review, marketId, reviewId) {
        if (!(review instanceof Review)) throw new Error('invalid review')

        if (!this.#users[marketId]) throw new Error('invalid market id')
        if (reviewId) {
            if (!this.#users[marketId].reviews[reviewId]) throw new Error('invalid review id')

            this.#users[marketId].reviews[reviewId].comments.push(review)
        } else {
            this.#users[marketId].reviews.push(review)
        }
    }

    static likeReview(marketId, reviewId, commentId) {
        if (!this.#users[marketId]) throw new Error('invalid market id')
        if (!this.#users[marketId].reviews[reviewId]) throw new Error('invalid review id')
        if (commentId) {
            if (!this.#users[marketId].reviews[reviewId].comments[commentId]) throw new Error('invalid comment id')

            this.#users.reviews[reviewId].comments[commentId].likes++
        } else {
            this.#users.reviews[reviewId].likes++
        }
    }

    static dislikeReview(marketId, reviewId, commentId) {
        if (!this.#users[marketId]) throw new Error('invalid market id')
        if (!this.#users[marketId].reviews[reviewId]) throw new Error('invalid review id')
        if (commentId) {
            if (!this.#users[marketId].reviews[reviewId].comments[commentId]) throw new Error('invalid comment id')

            this.#users.reviews[reviewId].comments[commentId].likes--
        }

        this.#users.reviews[reviewId].likes--
    }

    static addVendorRequest(req) {
        if (!(req instanceof VendorRequest)) throw new Error('invalid request')

        const user = this.#users[req.fromId]
        const market = this.#users[req.marketId]

        if (!user) throw new Error('invalid user id')
        if (!market) throw new Error('invalid market id')

        if (user.role != 1) throw new Error('user must be a customer')
        if (market.role != 4) throw new Error('cannot assign vendors to a non-market user')

        this.#vendorRequests.push(req)
    }

    static grantVendorRequest(reqId) {
        const req = this.#vendorRequests.splice(reqId, 1)[0]

        this.marketAddVendor(req.marketId, req.fromId)
    }

    static declineVendorRequest(reqId) {
        delete this.#vendorRequests[reqId]
    }

    static addCustomerRequest(req) {
        if (!(req instanceof CustomerRequest)) throw new Error('invalid request')

        const user = this.#users[req.fromId]
        if (!user) throw new Error('invalid user id')

        this.#customerRequests.push(req)
    }

    static grantCustomerRequest(reqId) {
        const req = this.#customerRequests.splice(reqId, 1)[0]
        const user = this.#users[req.fromId]
        if (!user) throw new Error('invalid user id')

        user.role = 1
        delete user.marketId

        this.#users[reqId] = user
    }

    static delcineCustomerRequest(reqId) {
        delete this.#customerRequests[reqId]
    }

    static grantLoan(reqId) {
        const req = this.#loanRequests.splice(reqId, 1)[0]
        if(!req) throw new Error('invalid request id')

        this.createLoan(req.fromId)
    }

    static denyLoan(reqId) {
        this.#loanRequests.splice(reqId, 1)
    }

    static repayLoan(loanId, amount) {
        const loan = this.#loans[loanId]
        if(!loan) throw new Error('invalid loan id')

        if(isNaN(amount)) throw new Error('not a number')

        loan.deposit(amount)

        if (loan.repayed >= loan.total ) {
            delete this.#loans[loanId]
        } else {
            this.#loans[loanId] = loan
        }
    }

    static calculateRating(marketId) {
        const market = this.#users[marketId]
        if (!market) throw new Error('invalid market id')

        const flatReviews = market.reviews.
            map((review) => {
                return [review, review.comments]
            })
            .flat(2)
            .filter((review) => 
                !(!(review.rating) || review.likes < 10 || review.dislikes > review.likes)
            )

        return (flatReviews
            .map((review) => 
                review.rating * (review.likes / (review.likes + review.dislikes)).toFixed(2)
            )
            .reduce((intermediate, n) => intermediate + n)
            / flatReviews.length).toFixed(2)
    }

    static addItem(item) {
        if (!(item instanceof Item)) throw new Error('invalid item')

        return this.#items.push(item) 
    }

    static purchase(itemId, marketId, amount) {
        const item = this.#items[itemId]

        return this.#purchases.push({
            itemId: itemId,
            marketId: marketId,
            amount: amount,
            calculatedPrice: item.calculatePrice(this.calculateRating(marketId), amount),
            storageLogs: item.simulateStorage()
        })
    }

    static confirmPurchase(marketId, purchaseId) {
        const purchase = this.#purchases[purchaseId]
        const item = this.#items[purchase.itemId]
        const market = this.#users[purchase.marketId]
        const vendor = this.#users[purchase.vendorId]

        if (purchase.marketId !== marketId) throw new Error('invalid market id')
        if (market.balance < purchase.calculatedPrice) throw new Error('insufficient funds')

        market.balance -= purchase.calculatedPrice
        market.items.push({
            item,
            amount: purchase.amount
        })
        vendor.balance += purchase.calculatedPrice

        this.#users[marketid] = market
        this.#users[vendorId] = vendor

        delete this.#purchases[purchaseId]
    }

    static declinePurchase(purchaseId) {
        delete this.#purchases[purchaseId]
    }

    static purchaseMarketItem(userId, itemId, marketId, amount) {
        const market = this.#suers[marketId]
        const user = this.#users[userId]

        if(market.items[itemId].amount < amount) throw new Error('out of stock')
        if(user.balance < market.items[itemId].price * amount) throw new Error('insufficient funds') 

        market.items[itemId].amount -= amount

        user.balance -= item.price * amount
        market.balance += item.price * amount
    }

}

export { User, UserList }