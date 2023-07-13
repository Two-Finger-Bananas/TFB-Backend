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
                password VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                is_admin BOOLEAN DEFAULT false NOT NULL
            );

            CREATE TABLE reviews(
                "reviewId" SERIAL PRIMARY KEY,
                text VARCHAR(255) NOT NULL,
                rating INTEGER NOT NULL,
                username VARCHAR(255) NOT NULL,
                "userId" INTEGER REFERENCES users("userId"),
                "gameId" INTEGER REFERENCES games("gameId")
            );

            CREATE TABLE comments(
                "commentId" SERIAL PRIMARY KEY,
                text VARCHAR(255) NOT NULL,
                username VARCHAR(255) NOT NULL,
                "userId" INTEGER REFERENCES users("userId"),
                "reviewId" INTEGER REFERENCES reviews("reviewId"),
                "gameId" INTEGER REFERENCES games("gameId")
            );  
        `)
    } catch (error) {
        console.log(error);
    }
}

// async function updateGameById(gameId, updateGameObjData){
//     try {
//         const { rows } = await client.query(`
//             UPDATE games
//             SET title = $1, "publishDate" = $2, "gameDeveloper" = $3, genre = $4, platforms = $5, players = $6, "coverImg" = $7
//             WHERE "gameId" = $8
//             RETURNING *;
//           `, [ updateGameObjData.title, updateGameObjData.publishDate,updateGameObjData.gameDeveloper,updateGameObjData.genre, updateGameObjData.platforms, updateGameObjData.players,updateGameObjData.coverImg, gameId]);

//   if (rows.length){
//     return rows[0];
//   }
// } catch (error) {
//     console.log(error);
// }
// }

async function updateGameById(gameId, fields = {}) {
    const setString = Object.keys(fields).map(
        (key, index) => `"${ key }" = $${ index + 1}`
    ).join(', ')

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ games ] } = await client.query(`
        UPDATE games
        SET ${ setString }
        WHERE "gameId" = ${gameId}
        RETURNING *;
        `, Object.values(fields))

        return games
    } catch (error) {
        console.log(error)
    }
}

async function destroyTables() {
    try {
        await client.query(`
        DROP TABLE IF EXISTS comments;
        DROP TABLE IF EXISTS reviews;
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
            INSERT INTO users(username, password, email, is_admin)
            VALUES($1, $2, $3, $4)
            RETURNING username, email, is_admin;
        `, [userOb.username, userOb.password, userOb.email, userOb.is_admin])

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
            return undefined
        }
    } catch (error) {
        console.log(error)
    }
}

async function fetchAllUsers() {
    try {
        const { rows } = await client.query(`
                SELECT * FROM users;
        `)
        if(rows.length) {
            return rows
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
            WHERE "gameId" = $1;
        `, [idValue])
        return rows[0]
    } catch (error) {
        console.log(error)
    }
}

async function deleteGameById(gameId) {
    try{
        const { rows } = await client.query(`
            DELETE FROM comments
            WHERE "reviewId" = $1
            RETURNING *;
        `, [gameId])
        const reviews = await client.query(`
            DELETE FROM reviews
            WHERE "gameId" = $1
            RETURNING *;
        `, [gameId])
        const game = await client.query(`
            DELETE FROM games
            WHERE "gameId" = $1
            RETURNING *;
        `, [gameId])
        const deletedData = {
            comments: rows,
            reviews: reviews.rows,
            game: game.rows[0]
        }
        return deletedData
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
        
        const testUserOne = await createNewUser({
            "username": "mason",
            "password": "walker",
            "email": "mason.walker@gmail.com",
            "is_admin": true
        })

        const testUserTwo = await createNewUser({
            "username": "george",
            "password": "alvarez",
            "email": "george.alvarez@gmail.com",
            "is_admin": true
        })
        
        const testReviewOne = await createReviews({
            "text": "It's ok.",
            "rating": 3,
            "username": "mason",
            "userId": 1,
            "gameId": 1
        })

        const testReviewTwo = await createReviews({
                "text": "This sucks!",
                "rating": 1,
                "username": "george",
                "userId": 2,
                "gameId": 1    
        })

        const testCommentOne = await createComments({
            "text": "It's not ok",
            "username": "george",
            "userId": 2,
            "reviewId": 1,
            "gameId": 1
          })

          const testCommentTwo = await createComments({
            "text": "This is great!",
            "username": "mason",
            "userId": 1,
            "reviewId": 1,
            "gameId": 1
          })

        const allGames = await fetchAllGames()
        const findSpecificGame = await fetchGameById()
        
        client.end()
    } catch (error) {
        console.log(error);
    }
}
//Code for Reviews:

async function createReviews(reviews){
    // console.log(reviews)
    try{
        const check = await client.query(`
        SELECT * FROM reviews
        WHERE "userId" = $1 AND "gameId" = $2;
        `, [reviews.userId, reviews.gameId])
        // console.log(check)
        if(!check.rows.length) {
        const { rows } = await client.query(
        `INSERT INTO reviews(text, rating, username, "userId", "gameId")
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *; `,
        [reviews.text, reviews.rating, reviews.username, reviews.userId, reviews.gameId]
        );  
        return rows[0]
        } else{
            return;
        }
    } catch(error){
        console.log(error);
    }
}
async function fetchReviews(){
    try{
        const { rows } = await client.query(` SELECT * FROM reviews`)
        return rows;
    } catch (error){
        console.log(error);
    }
}

async function fetchReviewById(reviewId){
    try {
        const { rows } = await client.query(`
            SELECT * FROM reviews
            WHERE "reviewId" = $1;
        `, [reviewId])
        return rows[0]
    } catch (error) {
        console.log(error)
    }
}

async function fetchReviewsByGameId(gameId){
    try {
        const { rows } = await client.query(`
            SELECT * FROM reviews
            WHERE "gameId" = $1;
        `, [gameId])
        return rows
    } catch (error) {
        console.log(error)
    }
}

async function fetchReviewsByUserId(userId){
    try {
        const { rows } = await client.query(`
            SELECT * FROM reviews
            WHERE "userId" = $1;
        `, [userId])
        return rows
    } catch (error) {
        console.log(error)
    }
}

async function deleteReviewById(reviewId) {
    try{
        const { rows } = await client.query(`
            DELETE FROM comments
            WHERE "reviewId" = $1
            RETURNING *;
        `, [reviewId])
        const sqlResponse = await client.query(`
            DELETE FROM reviews
            WHERE "reviewId" = $1
            RETURNING *;
        `, [reviewId])
        const actualData = {
            comments: rows,
            review: sqlResponse.rows[0]
        }
        return actualData
    } catch(error){
        console.log(error); 
    }
}



async function updateReviewById(reviewId, fields = {}) {
    const setString = Object.keys(fields).map(
      (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');
    if (setString.length === 0) {
      return;
    }
    try {
      const { rows: [reviews] } = await client.query(`
        UPDATE reviews
        SET ${setString}
        WHERE "reviewId" = ${reviewId}
        RETURNING *;
      `,Object.values(fields));
  
      return reviews;
    } catch (error) {
      throw error;
    }
  }
//code for comments:

async function createComments(comments){
    try{
        const { rows } = await client.query(
            `INSERT INTO comments(text, username, "userId", "reviewId", "gameId")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;`,
       [comments.text, comments.username, comments.userId, comments.reviewId, comments.gameId]
        );
        return rows[0]
    } catch(error){
        console.log(error);
    }
}


async function fetchComments(){
    try{
        const { rows } = await client.query(` SELECT * FROM comments`)
        return rows;
    } catch (error){
        console.log(error);
    }
}

async function fetchCommentsById(commentId){
    try {
        const { rows } = await client.query(`
            SELECT * FROM comments
            WHERE "commentId" = $1;
        `, [commentId])
        return rows[0]
    } catch (error) {
        console.log(error)
    }
}

async function fetchCommentsByReviewId(reviewId){
    try {
        const { rows } = await client.query(`
            SELECT * FROM comments
            WHERE "reviewId" = $1;
        `, [reviewId])
        return rows
    } catch (error) {
        console.log(error)
    }
}

async function fetchCommentsByUserId(userId){
    try {
        const { rows } = await client.query(`
            SELECT * FROM comments
            WHERE "userId" = $1;
        `, [userId])
        return rows
    } catch (error) {
        console.log(error)
    }
}

async function deleteCommentById(commentId) {
    try{
        const { rows } = await client.query(`
            DELETE FROM comments
            WHERE "commentId" = $1
            RETURNING *;
        `, [commentId])
    } catch(error){
        console.log(error); 
    }
}

async function updateCommentById(commentId, fields = {}) {
    const setString = Object.keys(fields).map(
      (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');
    if (setString.length === 0) {
      return;
    }
    try {
      const { rows: [comments] } = await client.query(`
        UPDATE comments
        SET ${setString}
        WHERE "commentId" = ${commentId}
        RETURNING *;
      `,Object.values(fields));
  
      return comments;
    } catch (error) {
      throw error;
    }
}
//end of comments and review
module.exports = {
    fetchAllGames,
    fetchGameById,
    createNewGame,
    deleteGameById,
    updateGameById,
    createNewUser,
    fetchUserByUsername,
    fetchAllUsers,
    //new exports:
    fetchReviews,
    fetchReviewById,
    fetchReviewsByGameId,
    fetchReviewsByUserId,
    createReviews,
    deleteReviewById,
    updateReviewById,
    createComments,
    fetchComments,
    fetchCommentsById,
    deleteCommentById,
    updateCommentById,
    fetchCommentsByReviewId,
    fetchCommentsByUserId,
    buildDatabase
}