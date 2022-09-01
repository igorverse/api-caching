import axios from 'axios'
import Redis from 'ioredis'
import * as dotenv from 'dotenv'
dotenv.config()

const redis = new Redis({
  port: 55000,
  host: '127.0.0.1',
})
const cityEndpoint = (city) =>
  `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${process.env.WEATHER_API_KEY}`

const getWeather = async (city) => {
  let cacheEntry = await redis.get(`weather:${city}`)

  if (cacheEntry) {
    cacheEntry = JSON.parse(cacheEntry)

    return { ...cacheEntry, source: 'cache' }
  }

  let apiResponse = await axios.get(cityEndpoint(city))
  redis.set(`weather:${city}`, JSON.stringify(apiResponse.data), 'EX', 3600)
  return { ...apiResponse.data, source: 'API' }
}

const city = 'Gouveia'
const t0 = new Date().getTime()
let weather = await getWeather(city)
const t1 = new Date().getTime()

weather.responseTime = `${t1 - t0}ms`
console.log(weather)
process.exit()
