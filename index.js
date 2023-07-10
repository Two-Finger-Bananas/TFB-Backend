const express = require("express")
const path = require('path')
require("dotenv").config()
const jwt = require("jsonwebtoken")

const app = express()

const cors = require("cors");
app.use(cors());

// function corsBypass(req, res, next) {
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// }

function middlewareTest(req, res, next) {
    console.log("the test worked")
    next()
}
app.use(middlewareTest)
// app.use(corsBypass);
app.use(express.json())

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

const { fetchAllGames, fetchGameById, createNewGame, deleteGameById, updateGameById, createNewUser, fetchUserByUsername,fetchReviews,
    fetchReviewById, createReviews, deleteReviewById, updateReviewById, createComments, fetchComments, fetchCommentsById, updateCommentById, deleteCommentById } = require("./db/seedData")

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
                res.send({response, message: "Game deleted"})
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
            const newUserForDb = await createNewUser(response)
            if(newUserForDb) {
                res.send({userData: newUserForDb, token: newJWTToken}).status(200)
            } else {
                res.send({error: true, message: "Failed to create user (index)"}).status(403)
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

        if (!req.body.username || !req.body.password){
            res.send({error: true, message: "Your username or password is incorrect"})
        } else{
            const user = await fetchUserByUsername(req.body.username)
        console.log(user, 'user')
        if (user && user.username){
            const response = req.body
                    const JWTToken = await jwt.sign(response, process.env.JWT_SECRET, {
                        expiresIn: "1w"
                    })
                    if(JWTToken) {
                        
                        if(user) {
                            res.send({userData: user, token: JWTToken}).status(200)
                        } else {
                            res.send({error: true, message: "Failed to login. Please try again"}).status(403)
                        }
                    } else {
                        res.send({error: true, message: "Failed to fetch valid auth token"})
                    }
        } else {
            res.send({error: true, message: "User does not exist"})
        }
        }
    } catch (error) {
        console.log(error)
    }
 }

 app.post("/user/login", loginUser)

 //code for reviews:

 async function getAllReviews(req, res, next) {
    try {
        const response = await fetchReviews()
        if (response.length) {
            res.send(response)
        } else {
            res.send("No reviews available")
        }
    } catch (error) {
        console.log(error)
    }
}

app.get("/reviews", getAllReviews)

async function getReviewById(req, res, next) {
    try {
        const response = await fetchReviewById(Number(req.params.id))

        res.send(response)
    } catch (error) {
        console.log(error)
    }
}

app.get("/reviews/:id", getReviewById)

async function postNewReview(req, res, next) {
    try {
        const myAuthToken = req.headers.authorization.slice(7)
        const auth = jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if (auth) {
            const userFromDb = await fetchUserByUsername(auth.username)
            if ( userFromDb) {
                const response = await createReviews(req.body)
                console.log(response)
                res.send(response)
            } else {
                res.send({error: true, message: "You need to have an account before being able to post a review."})
            }
        } else {
            res.send({error: true, message: "Failed to create review, try again."})
        }
    } catch (error) {
        console.log(error)
    }
}

app.post("/reviews", postNewReview)

async function deleteReview(req, res) {
    try {
        const myAuthToken = req.headers.authorization.slice(7)
        const auth = jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if (auth) {
            const userFromDb = await fetchUserByUsername(auth.username)
            if ( userFromDb ) {
                const response = await deleteReviewById(Number(req.params.id))
                res.send({response, message: "Review deleted"})
            } else {
                res.send({error: true, message: "Failed to delete review."})
            }
        } else {
            res.send({error: true, message: "Failed to create review, try again."})
        }
    } catch (error) {
        console.log(error)
    }
}
app.delete("/reviews/:id", deleteReview);

async function updateAReview(req,res){
    try{
        const myAuthToken = req.headers.authorization.slice(7)
        const auth = jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if (auth) {
            const userFromDb = await fetchUserByUsername(auth.username)
            if ( userFromDb) {
                let theReviewId = Number(req.params.id);
                let actualUpdatedReview = req.body;
                const newUpdatedReview= await updateReviewById(theReviewId,actualUpdatedReview);
                res.send(newUpdatedReview)
            } else {
                res.send({error: true, message: "Failed to update review."})
            }
        } else {
            res.send({error: true, message: "Failed to decrypt token."})
        }
    } catch(error){
        console.log(error);
    }
}
 app.patch("/reviews/update/:id", updateAReview);

 
 // code for comments:

 async function getAllComments(req, res, next) {
    try {
        const response = await fetchComments()
        if (response.length) {
            res.send(response)
        } else {
            res.send("No comments available")
        }
    } catch (error) {
        console.log(error)
    }
}

app.get("/comments", getAllComments)

async function getCommentById(req, res, next) {
    try {
        const response = await fetchCommentsById(Number(req.params.id))

        res.send(response)
    } catch (error) {
        console.log(error)
    }
}

app.get("/comments/:id", getCommentById)

async function postNewComment(req, res, next) {
    try {
        const myAuthToken = req.headers.authorization.slice(7)
        const auth = jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if (auth) {
            const userFromDb = await fetchUserByUsername(auth.username)
            if ( userFromDb) {
                const response = await createComments(req.body)
                console.log(response)
                res.send(response)
            } else {
                res.send({error: true, message: "You need to have an account before being able to post a comment."})
            }
        } else {
            res.send({error: true, message: "Failed to create comment, try again."})
        }
    } catch (error) {
        console.log(error)
    }
}

app.post("/comments", postNewComment)

async function deleteComment(req, res) {
    try {
        const myAuthToken = req.headers.authorization.slice(7)
        const auth = jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if (auth) {
            const userFromDb = await fetchUserByUsername(auth.username)
            if ( userFromDb) {
                const response = await deleteCommentById(Number(req.params.id))
                res.send({response, message: "Comment deleted"})
            } else {
                res.send({error: true, message: "Failed to delete comment."})
            }
        } else {
            res.send({error: true, message: "Failed to decrypt token."})
        }
    } catch (error) {
        console.log(error)
    }
}
app.delete("/comments/:id", deleteComment);

async function updateAComment(req,res){
    try{
        const myAuthToken = req.headers.authorization.slice(7)
        const auth = jwt.verify(myAuthToken, process.env.JWT_SECRET)
        if (auth) {
            const userFromDb = await fetchUserByUsername(auth.username)
            if ( userFromDb) {
                let theCommentId = Number(req.params.id);
                let actualUpdatedComment = req.body;
                const newUpdatedComment= await updateCommentById(theCommentId,actualUpdatedComment);
                res.send(newUpdatedComment)
            } else {
                res.send({error: true, message: "Failed to update comment."})
            }
        } else {
            res.send({error: true, message: "Failed to decrypt token."})
        }
    } catch(error){
        console.log(error);
    }
}
 app.patch("/comments/:id", updateAComment);

 
const client = require("./db/index")
client.connect()

app.listen(3000, () => {
    console.log("You are connected")
})