
# HypeSDK API

## Description

HypeSDK is low-code dev/tools to develop Data application (API Base), Focus on help both Low-code and Developer in development process does not prepare for no-code and not ready to use in production also easy to custom extend and deployment.

Which API Base concept this project can implement on any frontend language by follow on API response that will allow developer can custom application independently.

Cause business solution not just collecting, presenting data our goal will include with make it working with (What ever make document, tutorial or API connecting) other software to match with business logic, example Jasper Report for generating PDF.

FE project now on ::WIP

Documentation is ::WIP!
on [HypeSDK.com](https://hypesdk.com)

## Installation
Require **NodeJS 16 LTS**
```bash
$ yarn
$ cp .env.cloud .env
```

Custom setting ENV with your local


```
# .env file
DATABASE_HOST=localhost
DATABASE_PORT=3307
DATABASE_USERNAME=root
DATABASE_PASSWORD=0123
DATABASE_DB=hype_migrate
```
Custom config/config.json with your local

this project require initial migration step **config/config.json** will use for setting DB for migrate.
```bash
# run migrate script
$ yarn run migrate:dev
$ yarn run migrate:dev:seed
```


## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn run start:dev

```

## Test

Need to create unit-tests, currently we don't have it 😭
```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```

## Contribute

This project open to Contribute which every support or just try to use our project.

- Any suggestion can also join in [Discord](https://discord.gg/YjbZ5eXNdR).

- For code contribute can start with folk then open PR. 

### TODO
    -   Unit-test
    -   API Doc
    -   Documentation ( need to discuss)
        -   project structure
        -   development docs
        -   others?
    -   Diagram
        -   infra-structure
        -   ER
        -   flow
        



## Stay in touch

- Website - [https://hypesdk.com](https://hypesdk.com/)
- Discord - [https://discord.gg/YjbZ5eXNdR](https://discord.gg/YjbZ5eXNdR)


## License

HypeSDK is [BSD-3 licensed](LICENSE).
