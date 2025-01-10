import yargs from 'yargs';
import { execSync } from 'child_process';

const {
  _: [name],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  path,
} = yargs.argv;

const migrationPath = `src/migrations/${name}`;

execSync(`typeorm migration:create ${migrationPath}`, { stdio: 'inherit' });
