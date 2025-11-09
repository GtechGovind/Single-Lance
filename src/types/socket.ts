import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { NextApiResponse } from "next";
import type { Server as IOServer } from "socket.io";

// This is the main type you'll use in your API route.
// It extends the default NextApiResponse to include a `socket`
// property that is aware of our custom server and IO instance.
export interface NextApiResponseServerIO extends NextApiResponse {
  socket: SocketWithIO;
}

// Internal type for the socket object itself.
// It extends the base net.Socket and adds a `server` property.
interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

// Internal type for the server object.
// It extends the base http.Server and adds an optional `io`
// property for the Socket.IO server instance.
interface SocketServer extends HTTPServer {
  io?: IOServer;
}