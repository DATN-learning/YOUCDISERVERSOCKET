const {
    createServer
} = require("http");
const {
    Server
} = require("socket.io");
const {
    instrument
} = require("@socket.io/admin-ui");
const suggestExercises = require("./socketModules/suggestExercises");
const handlePost = require("./socketModules/handlePost");
const createPost = require("./socketModules/createPost");

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});

instrument(io, {
    auth: false,
    mode: "development",
});

// create url /home


// ?type
let usersOnline = [];

const addUser = ({
    token,
}) => {
    const user = {
        token,
    };
    if (usersOnline.find(user => user.token === token)) {
        return {
            error: 'Username is  taken'
        };
    }
    usersOnline.push(user);
}
const leaveUser = (token) => {
    const user = usersOnline.find(user => user.token === token);
    if (user) {
        usersOnline = usersOnline.filter(user => user.token != token);
        return user;
    }
}

// làm việc với socket
io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}, IP address: ${socket.handshake.address}`);
    const token = socket.handshake.query.token;
    console.log(token);
    socket.leave(socket.handshake.address);
    socket.join(socket.handshake.address);
    addUser({
        token
    });
    suggestExercises(socket, io);
    handlePost(io, socket);
    createPost(io, socket);

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected, IP address: ${socket.handshake.address}`);
        console.log(token);
        // leaveUser(token);
    });

});


httpServer.listen(3000);