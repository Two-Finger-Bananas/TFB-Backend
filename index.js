const express = require("express")
const path = require('path')
require("dotenv").config()
const jwt = require("jsonwebtoken")

const app = express()

function corsBypass(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5174');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
}

function middlewareTest(req, res, next) {
    console.log("the test worked")
    next()
}
app.use(middlewareTest)
app.use(corsBypass);
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

const { fetchAllGames, fetchGameById, createNewGame, deleteGameById, updateGameById, createNewUser, fetchUserByUsername } = require("./db/seed")

async function getAllGames(req, res, next) {
    try {
        const response = await fetchAllGames()
        if (response.length) {
            res.send(response)
        } else {
            res.send("No games available")
        }
    } catch (error) {
        console.log(error)
    }
}

app.get("/games", getAllGames)

async function getGameById(req, res, next) {
    try {
        const response = await fetchGameById(Number(req.params.id))

        res.send(response)
    } catch (error) {
        console.log(error)
    }
}

app.get("/games/:id", getGameById)

async function postNewGame(req, res, next) {
    try {
        const myAuthToken = req.headers.authorization.slice(7)
        const auth = jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if (auth) {
            const userFromDb = await fetchUserByUsername(auth.username)
            if ( userFromDb) {
                const response = await createNewGame(req.body)
                res.send(response)
            } else {
                res.send({error: true, message: "User does not exist. Please register for a new account or try again."})
            }
        } else {
            res.send({error: true, message: "Failed to decrypt token."})
        }
    } catch (error) {
        console.log(error)
    }
}

app.post("/games", postNewGame)

async function deleteGame(req, res) {
    try {
        const myAuthToken = req.headers.authorization.slice(7)
        const auth = jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if (auth) {
            const userFromDb = await fetchUserByUsername(auth.username)
            if ( userFromDb) {
                const response = await deleteGameById(Number(req.params.id))
                res.send(response)
            } else {
                res.send({error: true, message: "Failed to delete game."})
            }
        } else {
            res.send({error: true, message: "Failed to decrypt token."})
        }
    } catch (error) {
        console.log(error)
    }
}
app.delete("/games/:id", deleteGame);

async function updateAGame(req,res){
    try{
        const myAuthToken = req.headers.authorization.slice(7)
        const auth = jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if (auth) {
            const userFromDb = await fetchUserByUsername(auth.username)
            if ( userFromDb) {
                let theGameId = Number(req.params.id);
                let actualupdateGame = req.body;
                const newUpdatedGame= await updateGameById(theGameId,actualupdateGame);
                res.send(newUpdatedGame)
            } else {
                res.send({error: true, message: "Failed to update game."})
            }
        } else {
            res.send({error: true, message: "Failed to decrypt token."})
        }
    } catch(error){
        console.log(error);
    }
}
 app.patch("/games/:id", updateAGame);

 async function registerNewUser(req, res) {
    try {
        const response = req.body
        const newJWTToken = await jwt.sign(response, process.env.JWT_SECRET, {
            expiresIn: "1w"
        })
        if(newJWTToken) {
            const newUserForDb = await createNewUser(req.body)
            if(newUserForDb) {
                res.send({userData: newUserForDb, token: newJWTToken}).status(200)
            } else {
                res.send({error: true, message: "Failed to create user"}).status(403)
            }
        } else {
            res.send({error: true, message: "Failed to create valid auth token"})
        }
    } catch (error) {
        console.log(error)
    }
 }

 app.post("/user/register", registerNewUser)

 async function loginUser(req, res) {
    try {
        const response = req.body
        const JWTToken = await jwt.sign(response, process.env.JWT_SECRET, {
            expiresIn: "1w"
        })
        if(JWTToken) {
            const user = await fetchUserByUsername(req.body.username)
            if(user) {
                res.send({userData: user.username, token: JWTToken}).status(200)
            } else {
                res.send({error: true, message: "Failed to login. Please try again"}).status(403)
            }
        } else {
            res.send({error: true, message: "Failed to fetch valid auth token"})
        }
    } catch (error) {
        console.log(error)
    }
 }

 app.post("/user/login", loginUser)

const client = require("./db/index")
client.connect()

app.listen(3000, () => {
    console.log("You are connected")
})