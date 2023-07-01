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
        `)
    } catch (error) {
        console.log(error);
    }
}

async function destroyTables() {
    try {
        await client.query(`
            DROP TABLE IF EXISTS games;
        `)
    } catch (error) {
        console.log(error);
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

async function buildDatabase() {
    try {
        client.connect();

        await destroyTables();
        await createTables();

        const firstGame = await createNewGame({
            title: "Grand Theft Auto V",
            publishDate: "Sep 2023",
            gameDeveloper: "Rockstar Games",
            genre: ["Action", "Adventure"],
            platforms: ["Playstation", "Xbox", "PC"],
            players: ["Singleplayer", "Multiplayer"],
            coverImg: "https://i.ibb.co/NVMkhWX/actual-1364906194.jpg"
        })

        const secondGame = await createNewGame({
            title: "The Witcher 3: Wild Hunt",
            publishDate: "May 2015",
            gameDeveloper: "CD Projekt Red",
            genre: ["Action", "Adventure", "RPG"],
            platforms: ["Playstation", "Xbox", "PC", "Nintendo"],
            players: ["Singleplayer", "Multiplayer"],
            coverImg: "https://i.ibb.co/dcpYWWR/Witcher-3-cover-art.jpg"
        })

        const thirdGame = await createNewGame({
            title: "Portal 2",
            publishDate: "Apr 2011",
            gameDeveloper: "Valve",
            genre: ["Shooter", "Puzzle"],
            platforms: ["Playstation", "Xbox", "PC", "Apple Macintosh", "Linux"],
            players: ["Singleplayer", "Multiplayer"],
            coverImg: "https://i.ibb.co/pvyGxcX/MV5-BNz-Ey-NGM5-Yjgt-Yj-Fk-MC00-MTE1-LTk1-Yjgt-Nj-Ay-Yj-A2-ODUz-Nz-Qw-Xk-Ey-Xk-Fqc-Gde-QXVy-Njk2-MTc.jpg"
        })

        const allGames = await fetchAllGames()
        const findSpecificGame = await fetchGameById()
        
        client.end()
    } catch (error) {
        console.log(error);
    }
}

// buildDatabase();

module.exports = {
    fetchAllGames,
    fetchGameById,
    createNewGame
}