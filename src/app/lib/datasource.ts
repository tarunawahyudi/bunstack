import {DataSource} from "typeorm"
import {User} from "@module/user/entity/user"
import config from "@core/config"

const databaseType = config.database.client === "postgresql"
  ? "postgres"
  : config.database.client

const databasePort = Number(config.database.port || 5432)

export const AppDataSource = new DataSource({
  type: databaseType as "postgres",
  host: config.database.host,
  port: databasePort,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  entities: [User],
  synchronize: true,
  ssl: config.database.ssl ? { rejectUnauthorized: false } : false,
  extra: {
    min: config.database.pool.min,
    max: config.database.pool.max,
  },
})
