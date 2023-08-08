import {DataSource} from "typeorm";

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'mysqlroot',
  database: 'fz-srb-db',
  synchronize: false,
  entities: [
    "src/**/*.entity.ts"
  ],
  logging: true,
});

export default AppDataSource
