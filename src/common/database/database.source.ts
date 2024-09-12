import { registerAs } from "@nestjs/config";
import { DataSource, DataSourceOptions, Migration } from "typeorm";
import { config as dotenvConfig } from 'dotenv';
import { SeederOptions } from "typeorm-extension";

dotenvConfig({ path: '.env' });

const dataSourceOptions = {
  type: 'postgres',
  host: `${process.env.DB_HOST}`,
  port: Number(process.env.DB_PORT),
  username: `${process.env.DB_USERNAME}`,
  password: `${process.env.DB_PASSWORD}`,
  database: `${process.env.DB_DATABASE}`,
  entities: [process.env.DB_ENTITIES_PATH],
  synchronize: false,
  migrations: [process.env.DB_MIGRATIONS_PATH]
}

export default registerAs('typeorm', () => dataSourceOptions);
export const dataSource = new DataSource(
  dataSourceOptions as DataSourceOptions,
);
