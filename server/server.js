import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import dashboardRoutes from './routes/dashboardRoutes.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import activityRoutes from './routes/activityRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 5000

// Some networks block DNS SRV lookups, which are used by Atlas `mongodb+srv`
// URLs. This project can fall back to the same Atlas replica set through the
// standard MongoDB URL format. No credentials are stored here—the credentials
// still come only from MONGODB_URI in the environment.
const ATLAS_SRV_HOST = 'cluster0.t8pxwgg.mongodb.net'
const ATLAS_SEEDS = [
  'ac-d9qok1s-shard-00-00.t8pxwgg.mongodb.net:27017',
  'ac-d9qok1s-shard-00-01.t8pxwgg.mongodb.net:27017',
  'ac-d9qok1s-shard-00-02.t8pxwgg.mongodb.net:27017',
].join(',')
const ATLAS_REPLICA_SET = 'atlas-wckp0v-shard-0'

app.use(cors())
app.use(express.json())

app.get('/', (_request, response) => {
  response.status(200).send('PlanetPulse API running')
})

app.use('/api/activities', activityRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

function createStandardAtlasUri(srvUri) {
  const match = srvUri.match(/^mongodb\+srv:\/\/(?<credentials>[^@]+)@(?<host>[^/?]+)(?<database>\/[^?]*)?(?<options>\?.*)?$/)

  if (!match?.groups || match.groups.host !== ATLAS_SRV_HOST) return null

  const database = match.groups.database || '/'
  const originalOptions = match.groups.options?.slice(1) || ''
  const preservedOptions = originalOptions ? `&${originalOptions}` : ''

  return `mongodb://${match.groups.credentials}@${ATLAS_SEEDS}${database}?tls=true&authSource=admin&replicaSet=${ATLAS_REPLICA_SET}${preservedOptions}`
}

function isSrvDnsFailure(error) {
  return /querySrv (ECONNREFUSED|ETIMEOUT)/.test(error?.message || '')
}

async function connectToMongo(mongoUri) {
  try {
    await mongoose.connect(mongoUri)
  } catch (error) {
    const standardUri = createStandardAtlasUri(mongoUri)

    if (!isSrvDnsFailure(error) || !standardUri) throw error

    console.warn('Atlas SRV DNS lookup failed; retrying with the standard Atlas connection format.')
    await mongoose.connect(standardUri)
  }
}

async function startServer() {
  const mongoUri = process.env.MONGODB_URI

  if (!mongoUri) {
    throw new Error('MONGODB_URI is required to start PlanetPulse API')
  }

  await connectToMongo(mongoUri)
  console.log('Connected to MongoDB')

  app.listen(port, () => {
    console.log(`PlanetPulse API running on port ${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start PlanetPulse API:', error.message)
  process.exit(1)
})
