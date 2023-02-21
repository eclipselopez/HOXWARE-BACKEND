import Server from './class/server.class'
import cors from 'cors'
import express from 'express'

const server = Server.instance

server.app.enable('trust proxy')

server.app.use(express.urlencoded({extended: true, limit: '50mb'}))
server.app.use(express.json({ limit: '50mb'}))

server.app.use(cors({origin: true, credentials: true}))

// server.app.use('/api/nombre_de_la_api', routes)

server.start()