# WeM2k Server
This server can be used to mock out external REST services. The server uses two different
configuration files, a server settings file and a server configuration file.

## Configuring the Server
### Server Settings
Server settings are controlled by config/default.json. There are three values that the file
expects.

* `responseGenerator`: This is the URL of a server which can generate default responses for the
     server that WeM2K Server is mocking out. If a response generator is not
     provided the server will not permit any unmocked calls.
* `serverConfig`: This is the path to a file which configures how the server controls responses.
     This file uses [nock](http://www.github.com/nock/nock) syntax to control how the WeM2K server
     responds with two modifications which we will explain below. Relative paths are assumed to be
     relative from the current working directory of the node server, this is usually the root of the
     the repository.
* `port`: This is the port that the server will start at. If it is not provided it will default to
     port 8000.

#### Example 1: Use All Default Responses
When the server has a `responseGenerator` but no `serverConfig` the server will use all default
responses.
```json
{
    "responseGenerator": "http://localhost:8484"
}
```

#### Example 2: Use All Hard Coded Responses
When the server has a `serverConfig` but no `responseGenerator` the server will fail for any
unmocked calls.
responses.
```json
{
    "serverConfig": "./hardCodedResponses.js"
}
```

#### Example 3: Enable Partially Mocked Responses
When the server has both a `serverConfig` setting and a `responseGenerator` setting then you can use
partially mocked responses with the `replyWithDefault` method explained below.
```json
{
    "serverConfig": "./hardCodedResponses.js",
    "responseGenerator": "http://localhost:8484"
}
```

### Server Configuration File
The second configuration file is the mock configuration file. This file is written in JS and you
can use [nock](http://www.github.com/nock/nock) syntax to control what is mocked out. We have made
a few modifications to make it easy for you.
1. We introduced a Global function that sets the defaults you will need for defining your mocks.
   Simply call `WeM2k.mock()` instead of `nock` directly for setting up a mock.
1. We have added a new type of reply method to `nock` called `replyWithDefault`. This method
enables _partial_ mocking of responses that start with the default body.

#### Example 1: Static Mock
```js
WeM2k.mock()
     .persist()
     .get('/my/route')
     .reply(200, {
       key1: 'val1',
       key2: 'val2'
     })
```

#### Example 2: Mock that uses the default response
```js
WeM2k.mock()
     .persist()
     .get('/my/route')
     .replyWithDefault(200, (body) => {
       body.key1 = 'new val'
     })
```

#### Example 3: Dynamic Mock
```
userTable = {
    'email1@wework.com': '22323234'
    'email2@wework.com': '22323235'
    'email3@wework.com': '22323236'
}

WeM2k.mock()
    .persist()
    .post('/getuuid')
    .reply((uri, requestBody) => {
      return userTable[requestBody.email];
    })
```

## Advanced Usage

For more advanced usage take a look at the modules we use in the server.
* We use the [config](https://github.com/lorenwest/node-config) module to read the server settings
  file.
* We use the [debug](https://github.com/visionmedia/debug) module for debug messages.
* We use [nock](https://github.com/nock/nock) to control mocks.
