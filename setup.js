import fs from 'fs'
import axios from 'axios'
import path from 'path'

const services = [
  { name: 'locationSelector', target: 'packages/location-selector/src/services.config.js' },
  //{ name: 'timezoneSelector', target: 'packages/timezone-selector/src/services.config.js' }
]

const endpoint = 'https://api.data-forge.tech'

async function setupService(service) {
  try {
    const res = await axios.post(`${endpoint}/api/guest-task/Services/Install`, {
      subtype: 'vue',
      source: service.name,
      version: '0.1.0'
    })

    const config = {
      [service.name]: {
        token: res.data.token,
        endpoint
      }
    }

    const fileContent = `export default ${JSON.stringify(config, null, 2)}\n`
    fs.mkdirSync(path.dirname(service.target), { recursive: true })
    fs.writeFileSync(service.target, fileContent)
    console.log(`✅ Token written to ${service.target}`)
  } catch (err) {
    console.error(`❌ Failed for ${service.name}:`, err.message)
  }
}

async function run() {
  for (const service of services) {
    await setupService(service)
  }
}

run()
