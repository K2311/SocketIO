const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req,res)=>{
    const staticath = path.join(__dirname,'public');
    const filePath = path.join(staticath,req.url === '/' ? 'index.html' : req.url);

    const ext = path.extname(filePath);
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/html');
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/html');
                res.end('<h1>500 - Internal Server Error</h1>');
            }
        } else {
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'text/html');
                    res.end('<h1>500 - Internal Server Error</h1>');
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', contentType);
                    res.setHeader('Cache-Control', 'public, max-age=3600');
                    res.end(content);
                }
            });
        }
    });
});

const io = socketIo(server);

io.on('connection',(socket)=>{
    console.log('A user connected');

    socket.on('chat message',(data)=>{
        console.log('Message received: ' + data.message);
        io.to(data.room).emit('chat message', data); 
    });


    socket.on('join room', (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
