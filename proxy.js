const net = require('net');
const server = net.createServer();

const port = '8080';
//Listen to connect event from client
server.on("connection", (ClientToProxySocket) => {
    console.log("client connected to proxy");
    ClientToProxySocket.once("data", (data) => {
        let isHTTPS = data.toString().indexOf("CONNECT") !== -1;
        let serverPort = 80;
        let serverAddress;
        if (isHTTPS) {
            serverPort = 443;
            //Server Address for HTTPS
            serverAddress = data.toString()
                .split("CONNECT")[1]
                .split(" ")[1]
                .split(":")[0]
        }
        else {
            //Server Address for HTTP
            serverAddress = data.toString()
                .split("Host: ")[1]
                .split("\n")[0]
        }
        //Establish Connection between proxy and server
        let ProxyToServerSocket = net.createConnection(
            {
                host: serverAddress,
                port: serverPort
            },
            () => {
                console.log("proxy connected to server")
            }
        )

        // if (isHTTPS) {
        //     ClientToProxySocket.write("HTTP/1.1 200 OK\r\n\n")
        // }
        // else {
        //     ProxyToServerSocket.write(data)
        // }

        ClientToProxySocket.pipe(ProxyToServerSocket);
        ProxyToServerSocket.pipe(ClientToProxySocket);
        //Listen to error event of sockets
        ProxyToServerSocket.on("error", (err) => {
            console.log("Proxy to Client error",err);
        })
        ClientToProxySocket.on("error", (err) => {
            console.log("Client to Proxy error",err);
        })
        ClientToProxySocket.on("end", (err) => {
            console.log("Client conn ended");
        })
    })
})
//Listen to error event
server.on("error", (err) => {
    console.log(err);
})
//Listen to close event
server.on("close", () => {
    console.log("client disconnected");
})
// Making Server To listen for requests
server.listen({
    host: '0.0.0.0',
    port: port
}, () => {
    console.log('Server started and listening on ' + port);
})