import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ready } from './db.js'
import leadsRouter from './leads.routes.js'
import stagesRouter from './stages.routes.js'
import eventsRouter from './events.routes.js'

const app = express()
const publicDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public')

app.use(cors())
app.use(express.json())
app.get('/tracker.js', (req, res) => {
  res.type('application/javascript')
  res.sendFile(path.join(publicDir, 'das-tracker.js'))
})
app.use(async (req, res, next) => {
  await ready()
  next()
})

app.use('/api/leads', leadsRouter)
app.use('/api/stages', stagesRouter)
app.use('/api/events', eventsRouter)

app.get('/api/sources', (req, res) => {
  res.json([
    'Google GMB',
    'BNI',
    'Udemy',
    'Website',
    'Instagram',
    'LinkedIn',
    'ICF',
    'Facebook Group',
    'LinkedIn Group',
    'Boolean - Insta',
    'Boolean - Facebook',
    'Boolean - LinkedIn',
    'Boolean - SERP',
    'Ads Library',
  ])
})

export default app
