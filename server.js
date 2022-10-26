import { createClient } from "redis"
import { Client, Entity, Schema } from "redis-om"

/* connect to Redis */
const redis = createClient('redis://localhost:6379')
await redis.connect()

/* wipe the database */
await redis.flushAll()

/* set up a Redis OM Client */
const client = await new Client().use(redis)

/* define Entity and Schema */
class Fuzzy extends Entity {}

const schema = new Schema(Fuzzy, {
  wuzzy: { type: 'text' }
})

/* get a Repository */
const repository = client.fetchRepository(schema)

/* create an index */
await repository.createIndex()

/* create some stuff to search */
const buzz = repository.createEntity({ wuzzy: 'abc' })
const fuzz = repository.createEntity({ wuzzy: 'abz' })
const muzz = repository.createEntity({ wuzzy: 'ayz' })
const wuzz = repository.createEntity({ wuzzy: 'xyz' })

await repository.save(buzz)
await repository.save(fuzz)
await repository.save(muzz)
await repository.save(wuzz)

/* kick off some searches */
let results, count

/* simple search */
results = await repository.searchRaw("@wuzzy:abc").return.all()
count = await repository.searchRaw("@wuzzy:abc").return.count()
console.log(count, JSON.stringify(results))

/* search with Levenshtein distance of 1 */
results = await repository.searchRaw("@wuzzy:%abc%").return.all()
count = await repository.searchRaw("@wuzzy:%abc%").return.count()
console.log(count, JSON.stringify(results))

/* search with Levenshtein distance of 2 */
results = await repository.searchRaw("@wuzzy:%%abc%%").return.all()
count = await repository.searchRaw("@wuzzy:%%abc%%").return.count()
console.log(count, JSON.stringify(results))

/* search with Levenshtein distance of 3 */
results = await repository.searchRaw("@wuzzy:%%%abc%%%").return.all()
count = await repository.searchRaw("@wuzzy:%%%abc%%%").return.count()
console.log(count, JSON.stringify(results))

/* clean up */
await client.close()
