const express = require("express");
const path = require("path");
const socket = require("socket.io");
const {MongoClient} = require('mongodb');

const PORT = process.env.PORT || 3000;
const app = express();

let userList = [];
let gameStarted = false;

let unitData = {};
let upgradesData = {};
let towerData = {};
let gameData = {};

app.use(express.json());
app.use(express.static('static'))

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
});

app.post('/resetUser', function (req, res) {
    userList = userList.filter(item => item != req.body.username)
    if(userList.length == 0) gameStarted = false;
})

app.post('/resetUsers', function (req, res) {
    userList = [];
    gameStarted = false;
})

const server = app.listen(PORT, function () {
    console.log("http://localhost:" + PORT);
});


// Sockets
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const io = socket(server);

io.on("connection", (socket) => {
    socket.on("login", (username, callback) => {
        if (userList.length >= 2 || gameStarted) {
            callback({ error: true, message: '2 players are already playing' });
            return;
        }

        if (userList.includes(username)) {
            callback({ error: true, message: 'Username taken by other player' });
            return;
        }

        userList.push(username)

        if (userList.length == 2) {
            const data = { unitData, upgradesData, towerData, gameData }
            callback({ error: false, message: 'starting', secondUsername: userList[0], data });
            io.emit("waitingForSecondPlayer", userList[1], data);
            gameStarted = true;
        } else {
            callback({ error: false, message: 'waiting' });
        }
        return;
    });
    
    socket.on("unitSpawned", (...args) => {
        io.emit("spawnUnit", args)
    });
});


// Database
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const uri = `mongodb+srv://Admin:Admin@timeofwarcluster.peesiju.mongodb.net/?retryWrites=true&w=majority`;
MongoClient.connect(uri, (err, client) => {

    // units data
    client.db('unitData').listCollections().toArray(function(err, collArray) {
        for(let coll of collArray) {  
            const collName = coll.name;    
            coll = client.db('unitData').collection(collName)
            coll.find({}).toArray(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    result = result[0];
                    delete result._id;
                    unitData[collName] = result;
                }
            });
        }
    })


    // upgrades data  
    client.db('upgradesData').listCollections().toArray(function(err, collArray) {
        for(let coll of collArray) {  
            const collName = coll.name;    
            coll = client.db('upgradesData').collection(collName)
            coll.find({}).toArray(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    result = result[0];
                    delete result._id;
                    upgradesData[collName] = result;
                }
            });
        }
    })
   

    // tower data
    client.db('towerData').collection('data').find({}).toArray((err, result) => {
        if (err) {
            console.log(err);
        } else {
            result = result[0];
            delete result._id;
            towerData = result;
        }
    })


    // game data
    client.db('gameData').collection('gameData').find({}).toArray((err, result) => {
        if (err) {
            console.log(err);
        } else {
            result = result[0];
            delete result._id;
            gameData = result;
        }
    })
})
