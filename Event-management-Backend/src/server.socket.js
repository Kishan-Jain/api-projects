import {createServer} from "http"
import {Server} from "socket.io"
import app from "./app.js"

const server = createServer(app)

const io = new Server(server)

io.on("Connection", (socket) => {
    console.log("Server connected")
})

export default server