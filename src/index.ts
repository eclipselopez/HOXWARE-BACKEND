import Server from './class/server.class'
import cors from 'cors'
import express from 'express'
import fileUpload from 'express-fileupload'

const server = Server.instance

server.app.enable('trust proxy')

server.app.use(express.urlencoded({extended: true, limit: '50mb'}))
server.app.use(express.json({ limit: '50mb'}))

server.app.use( fileUpload() );

server.app.use(cors({origin: true, credentials: true}))

server.app.use('/api/product', require("./routes/url.routes"))
server.app.use('/api/product', require("./routes/proyecto.routes"))
server.app.use('/api/product', require("./routes/usuario.routes"))
server.app.use('/api/product', require("./routes/auth.routes"))

server.start()