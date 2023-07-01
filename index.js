const express = require("express")

const app = express()

function middlewareTest(req, res, next) {
    console.log("the test worked")
    next()
}
app.use(middlewareTest)

app.use(express.json())

const { fetchAllGames, fetchGameById, createNewGame, updateGameById } = require("./db/seed")

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
        const response = await createNewGame(req.body)
        console.log(req.body)
        res.send(response)
    } catch (error) {
        console.log(error)
    }
}

app.post("/games", postNewGame)

async function deleteGame(req,res,next){
    try{
        const gameId = req.params.id;
        await fetchGameById(gameId);
        res.send("game has been deleted")
    } catch(error){
        console.log(error);
    }
}
app.delete("/games", deleteGame);

async function updateAGame(req,res){
    try{
        let theGameId = Number(req.params.id);
        let actualupdateGame = req.body;
       const newUpdatedGame= await updateGameById(theGameId,actualupdateGame);
        res.send(newUpdatedGame)
    } catch(error){
        console.log(error);
    }
}
 app.patch("/games/:id", updateAGame);

const client = require("./db/index")
client.connect()

app.listen(3000, () => {
    console.log("You are connected")
})