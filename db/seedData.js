const client = require("./index");

async function createTables() {
    try {
        await client.query(`
            CREATE TABLE games(
                "gameId" SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                "publishDate" TEXT,
                "gameDeveloper" VARCHAR(255) NOT NULL,
                genre TEXT,
                platforms TEXT,
                players TEXT,
                "coverImg" TEXT
            );

            CREATE TABLE users(
                "userId" SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `)
    } catch (error) {
        console.log(error);
    }
}
async function updateGameById(gameId, updateGameObjData){
    try {
        const { rows } = await client.query(`
            UPDATE games
            SET title = $1, "publishDate" = $2, "gameDeveloper" = $3, genre = $4, platforms = $5, players = $6, "coverImg" = $7
            WHERE "gameId" = $8
            RETURNING *;
          `, [ updateGameObjData.title, updateGameObjData.publishDate,updateGameObjData.gameDeveloper,updateGameObjData.genre, updateGameObjData.platforms, updateGameObjData.players,updateGameObjData.coverImg, gameId]);

  if (rows.length){
    return rows[0];
  }
} catch (error) {
    console.log(error);
}
}

async function destroyTables() {
    try {
        await client.query(`
            DROP TABLE IF EXISTS games;
            DROP TABLE IF EXISTS users;
        `)
    } catch (error) {
        console.log(error);
    }
}

async function createNewUser(userOb) {
    try {
        const { rows } = await client.query(`
            INSERT INTO users(username, password)
            VALUES($1, $2)
            RETURNING username;
        `, [userOb.username, userOb.password])

        if(rows.length) {
            return rows[0]
        } else {
            return "Failed to create user (seed)"
        }
    } catch (error) {
        console.log(error)
    }
}

async function fetchUserByUsername(username) {
    try {
        const { rows } = await client.query(`
                SELECT * FROM users
                WHERE username = $1;
        `, [username])
        
        if(rows.length) {
            return rows[0]
        } else {
            return "Failed to fetch users "
        }
    } catch (error) {
        console.log(error)
    }
}

async function createNewGame(newGameObj) {
    try {
        const { rows } = await client.query(`
            INSERT INTO games(title, "publishDate", "gameDeveloper", genre, platforms, players, "coverImg")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `, [newGameObj.title, newGameObj.publishDate, newGameObj.gameDeveloper, newGameObj.genre, newGameObj.platforms, newGameObj.players, newGameObj. coverImg])
    } catch (error) {
        console.log(error)
    }
}



async function fetchAllGames() {
    try {
        const { rows } = await client.query(`
            SELECT * FROM games;
        `)
        return rows
    } catch (error) {
        console.log(error)
    }
}

async function fetchGameById(idValue) {
    try {
        const { rows } = await client.query(`
            SELECT * FROM games
            WHERE "gameId" = $1
        `, [idValue])
        return rows[0]
    } catch (error) {
        console.log(error)
    }
}

async function deleteGameById(gameId) {
    try{
        const { rows } = await client.query(`
            DELETE FROM games
            WHERE "gameId" = $1
            RETURNING *;
        `, [gameId])
    } catch(error){
        console.log(error); 
    }
}

async function buildDatabase() {
    try {
        client.connect();

        await destroyTables();
        await createTables();

        const firstGame = await createNewGame({
            title: "Grand Theft Auto V",
            publishDate: "Sep 2013",
            gameDeveloper: "Rockstar Games",
            genre: ["Action", "Adventure"],
            platforms: ["Playstation", "Xbox", "PC"],
            players: ["Singleplayer", "Multiplayer"],
            coverImg: "https://res.cloudinary.com/dvto5eysb/image/upload/v1688583670/actual_1364906194_fnxfla.jpg"
        })

        const secondGame = await createNewGame({
            title: "The Witcher 3: Wild Hunt",
            publishDate: "May 2015",
            gameDeveloper: "CD Projekt Red",
            genre: ["Action", "Adventure", "RPG"],
            platforms: ["Playstation", "Xbox", "PC", "Nintendo"],
            players: ["Singleplayer", "Multiplayer"],
            coverImg: "https://res.cloudinary.com/dvto5eysb/image/upload/v1688583641/Witcher_3_cover_art_f1pren.jpg"
        })

        const thirdGame = await createNewGame({
            title: "Portal 2",
            publishDate: "Apr 2011",
            gameDeveloper: "Valve",
            genre: ["Shooter", "Puzzle"],
            platforms: ["Playstation", "Xbox", "PC", "Apple Macintosh", "Linux"],
            players: ["Singleplayer", "Multiplayer"],
            coverImg: "https://res.cloudinary.com/dvto5eysb/image/upload/v1688583670/portal_2_gsgbbx.jpg"
        })

        const fourthGame = await createNewGame({
            title: "Diablo 2",
            publishDate: "Jun 2000",
            gameDeveloper: "Blizzard North",
            genre: ["Action", "Adventire", "RPG"],
            platforms: ["PC", "Apple Macintosh"],
            players: ["Singleplayer", "Multiplayer"],
            coverImg: "https://res.cloudinary.com/dvto5eysb/image/upload/v1688583669/Diablo_II_Coverart_vye1nj.png"
        })

        const allGames = await fetchAllGames()
        const findSpecificGame = await fetchGameById()
        
        client.end()
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    fetchAllGames,
    fetchGameById,
    createNewGame,
    deleteGameById,
    updateGameById,
    createNewUser,
    fetchUserByUsername,
    buildDatabase
}