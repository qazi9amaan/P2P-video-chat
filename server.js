const express = require('express')
const app = express()
const path = require('path')
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
var dbRouter = require('./routes/db');

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use('/user', dbRouter);
app.use(express.static(path.join(__dirname+"/views")));

app.get('/', (req, res) => {
    res.render('index')
  })

app.get('/create-new-room', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})


app.get('/:room', (req, res) => {
  res.render('main', { roomId: req.params.room })
})
app.get('/:room/screen', (req, res) => {
  res.render('main', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)
    
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message,userId)
    });

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })
})

server.listen(process.env.PORT||8080)