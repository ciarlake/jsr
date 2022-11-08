import express from 'express'
import cors from 'cors'
import { User, UserList } from './user.js'
import { Review } from './review.js'
import { CustomerRequest, VendorRequest } from './user_request.js'
import { Item } from './item.js'

const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.sendStatus(200)
})

app.get('/users', (req, res) => {
    res.json({
        message: UserList.usersStripped
    })
})

app.get('/users/:id/', (req, res) => {
    res.json({
        message: UserList.usersStripped[parseInt(req.params.id)]
    })
})


app.get('/markets/', (req, res) => {
    res.json({
        message: UserList.usersStripped.filter(u => u.role == 4)
    })
})

app.post('/markets/add/:userId', (req, res) => {
    UserList.populateMarket(req.params.userId, req.body.city)

    res.json({
        message: UserList.usersStripped[req.params.userId]
    })
})

app.post('/markets/remove/:marketId', (req, res) => {
    UserList.stripMarket(req.params.marketId)

    res.json({
        message: UserList.usersStripped[req.params.marketId]
    })

})

app.get('/markets/:id/vendors', (req, res) => {
    const market = UserList.usersStripped[parseInt(req.params.id)]
    const vendors = market.vendorIds.map(vId => UserList.usersStripped[vId])

    res.json({
        message: vendors
    })
})

app.post('/markets/:marketId/vendors/add/:userId', (req, res) => {
    UserList.marketAddVendor(req.params.marketId, req.params.userId)

    res.json({
        message: UserList.usersStripped[req.params.userId]
    })
})

app.post('/markets/:id/reviews/add', (req, res) => {
    const { head, body, author } = req.body

    const newReview = new Review({ head, body, author })
    UserList.marketAddReview(newReview, req.params.id)

    res.json({
        message: UserList.usersStripped[req.params.id]
    })
})

app.post('/markets/:marketId/reviews/:reviewId/comments/add', (req, res) => {
    const { head, body, author } = req.body

    const newReview = new Review({ head, body, author })
    UserList.marketAddReview(newReview, req.params.marketId, req.params.reviewId)

    res.json({
        message: UserList.usersStripped[req.params.marketId]
    })
})

app.get('/requests/vendor', (req, res) => {
    res.json({
        message: UserList.vendorRequests
    })
})

app.post('/requests/vendor/add', (req, res) => {
    const { fromId, marketId } = req.body

    UserList.addVendorRequest(new VendorRequest(fromId, marketId))
    
    res.json({
        message: UserList.vendorRequests
    })
})

app.post('/requests/vendor/:id/grant', (req, res) => {
    const { fromId } = UserList.vendorRequests[req.params.id]

    UserList.grantVendorRequest(parseInt(req.params.id))

    res.json({
        message: UserList.usersStripped[fromId]
    })
})

app.post('/requests/vendor/:id/decline', (req, res) => {
    const { fromId } = UserList.vendorRequests[req.params.id]

    UserList.declineVendorRequest(parseInt(req.params.id))

    res.json({
        message: UserList.vendorRequests
    })
})

app.post('/reg', (req, res) => {
    const { username, login, password} = req.body
    const newUser = new User({ username, login, password })
    const userId = UserList.addUser(newUser) - 1
    res.json({
        message: {
            userId
        }
    })
})

app.get('/requests/loan', (req, res) => {
    res.json({
        message: UserList.loanRequests
    })
})

app.post('/requests/loan/:id/grant', (req, res) => {
    UserList.grantLoan(req.params.id)
    res.json({
        message: UserList.loans
    })
})

app.post('/requests/loan/:id/decline', (req, res) => {
    UserList.denyLoan(req.params.id)
    res.json({
        message: UserList.loanRequests
    })
})

app.get('/loans', (req, res) => {
    res.json({
        message: UserList.loans
    })
})

app.post('/loans/:id/repay', (req, res) => {
    const { amount } = req.body

    UserList.repayLoan(req.params.id, amount)

    res.json({
        message: UserList.loans
    })
})

app.get('/markets/:id/rating', (req, res) => {
    res.json({
        message: UserList.calculateRating(req.params.id)
    })
})

app.post('/items/add', (req, res) => {
    const { name, manufacturer, storageTemperature, price, productionDate, shelfLife, meausrement } = req.body

    const newItem = new Item(name, manufacturer, storageTemperature, price, productionDate, shelfLife, measurement)
    const itemId = UserList.addItem(newItem) - 1

    res.json({
        message: {
            itemId
        }
    })
})

app.get('/items/:id/price', (req, res) => {
    const { marketId, amount } = req.body
    const market = UserList.users[marketId]
    const item = UserList.items[req.params.id]

    res.json({
        message: {
            price: item.calculatePrice(UserList.calculateRating(market), amount)
        }
    })
})

app.post('/items/:id/purchase', (req, res) => {
    const { marketId, amount } = req.body
    const purchaseId = UserList.purchase(req.params.id, marketId, amount) - 1

    res.json({
        message: {
            purchaseId
        }
    })
})

app.get('/items/purchase/:id', (req, res) => {
    res.json({
        message: UserList.purchases[req.params.id]
    })
})

app.post('/items/purchase/:id/confirm', (req, res) => {
    const { marketId } = req.body

    UserList.confirmPurchase(marketId, req.params.id)
})

app.post('/items/purchase/:id/decline', (req, res) => {
    UserList.declinePurchase(req.params.id)
})

app.post('/markets/:marketId/items/:itemId/purchase', (req, res) => {
    const { userId, amount } = req.body

    UserList.purchaseMarketItem(userId, req.params.itemId, req.params.marketId, amount)
})

app.post('/auth', (req, res) => {
    const { login, password } = req.body
    if (!password) throw new Error('password cannot be empty')
    if (!login) throw new Error('login cannot be empty')
    
    const userList = UserList.users
        
    const user = userList.find(u => u.login == login)
    if (!user) throw new Error('could not find user')
    if (user.password != password) throw new Error('invalid credentials')

    const userId = userList.indexOf(user)

    res.json({
        message: {
            user: {
                id: userId,
                data: user
            }
        }
    })
})

app.use((err, req, res, next) => {
    console.error(err)

    res.status(500).json({
        error: {
            message: err.message
        }
    })
})

app.use((req, res, next) => {
    res.status(404).json({
        error: {
            message: `404: cannot ${req.method} ${req.path}`
        }
    })
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
