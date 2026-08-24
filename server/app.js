import express from 'express'
import cors from 'cors'
import leadsRouter from './leads.routes.js'
import stagesRouter from './stages.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/leads', leadsRouter)
app.use('/api/stages', stagesRouter)

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
  ])
})

export default app
