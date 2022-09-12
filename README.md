# Config Loader

[![npm version](https://badge.fury.io/js/@universal-packages%2Fconfig-loader.svg)](https://www.npmjs.com/package/@universal-packages/config-loader)
[![Testing](https://github.com/universal-packages/universal-config-loader/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-config-loader/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-config-loader/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-config-loader)

Get ready to load all the configuration into a single plane old javascript object from any directory and with file format priority, defaults and overiting.

## Install

```shell
npm install @universal-packages/config-loader
```

## loadConfig()

Given a configuration location reads deeply into it and get all the contents of the configuration files there into a plain old javascript object.

```js
import { loadconfig } from '@universal-packages/config-loader'

async function test() {
  const config = await loadconfig('./config')

  console.log(config)
}

test()
```

Lets say `./config` looks like this in disk:

```text
config
  |- database.yaml
  |- redis.json
  |- secrets
      |- api.ymal
      |- github.js
```

We will end up with something like

```json
{
  "database": {
    "host": "localhost",
    "post": 5432
  },
  "redis": {
    "host": "localhost",
    "post": 6380
  },
  "secrets": {
    "api": {
      "key": "n35jnk36n4j6nkj"
    },
    "github": {
      "key": "kl456jk456kj45n6"
    }
  }
}
```

## Options

- `callback` `TraverseCallback`
  A function to pass to the [directory-traversal](https://github.com/universal-packages/universal-directory-traversal), call for every directory mapped, use this to decide if the config loading should continue or modify the directory map before loading files in it.

- **`formatPriority`** `['json' | 'yaml' | 'yml' | 'js' | 'ts']`
  If there are 2 files with the same name but with different extension? which one should be prioritized to load?

- **`selectEnvironment`** `string | boolean`
  If you want your files to be post processed after loaded with a selection of an environment seccion you can specify the name of the environment to select or pass `true` to automatically set from `NODE_ENV`.

  ```js
  import { loadconfig } from '@universal-packages/config-loader'

  async function test() {
    const config = await loadconfig('./config', { selectEnvironment: 'staging' })

    console.log(config)
  }

  test()
  ```

  Lets say `./config/redis.yaml` looks like this:

  ```yaml
  defaulf:
    port: 6380
  development:
    host: localhost
    dev: true
  production:
    host: 45.60.129.1
  ```

  We will end up with something like

  ```json
  {
    "redis": {
      "host": "localhost",
      "post": 6380,
      "dev": true
    }
  }
  ```

## loadFileConfig()

Given a base file location it prioritizes and loads the file content into a plain old javascript object.

Example if there are two files `jest.js` and `jest.yml` in your root directory the following script will load the `jest.js` contents over the `jest.yml` ones.

```js
import { loadFileconfig } from '@universal-packages/config-loader'

async function test() {
  const config = await loadconfig('./jest', { formatpriority: ['js', 'yml'] })

  console.log(config)
}

test()
```

## Options

- **`formatPriority`** `['json' | 'yaml' | 'yml' | 'js' | 'ts']`
  If there are 2 files with the same name but with different extension? which one should be prioritized to load?

- **`selectEnvironment`** `string`
  If you want your files to be post processed after loaded with a selection of an environment seccion you can specify the name of the environment to select.

## Environment variables

Config loader will try to match strings inside the configuration files with a replacement pattern and assign the value of an environment variable if it exists.

Lets say `./config/redis.yaml` looks like this:

```yaml
defaulf:
  port: 6380
development:
  host: localhost
  dev: true
production:
  host: '{{ REDIS_HOST }}'
```

We will end up with something like if `REDIS_HOST` is set with `www.redis.com`

```json
{
  "redis": {
    "host": "www.redis.com",
    "post": 6380
  }
}
```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
