# WeM2k Server
This server can be used to mock out external REST services. The server uses two different
configuration files, a server settings file and a server configuration file.

## Configuring the Server
### Server Settings
The server  supports a few different configurations:
1. Mocking mode
1. Response generation mode (this configures wem2k-server as a reverse-proxy to a remote endpoint of your choosing)
1. Mocking + response generation
1. Record mode (this configures wem2k-server as a reverse-proxy as well, but captures all traffic into a mocking output file to be used in mocking mode until wem2k-server is terminated)

Note that for all configurations except record mode, mocks with static json can also be added using the [update endpoint](#adding-mocks-at-run-time) after wem2k-server is started.

Server settings are controlled by config/default.json. Valid configuration settings are as follows:
* `port`: This is the port that the server will start at. If it is not provided it will default to
     port 8000.
* `responseGenerator`: This is the URL of a server which can generate default responses for the
     server that WeM2K Server is mocking out (e.g. a common response generator could be a [prism server](https://github.com/stoplightio/prism) that responds with examples from an open API spec). If a response generator is not
     provided the server will not permit any unmocked calls.
* `serverConfig`: This is the path to a file which configures how the server controls responses.
     This file uses [nock](http://www.github.com/nock/nock) syntax to control how the WeM2K server
     responds with two modifications which we will explain below. Relative paths are assumed to be
     relative from the current working directory of the node server, this is usually the root of the
     the repository.
* `recordTarget`: This mode cannot be used in conjunction with `serverConfig` or `responseGenerator`. Record target specifies the endpoint to proxy all requests to, and will cause resulting mocks to be written out to `recordingFilepath`.
* `recordingFilepath`: Only valid if `recordTarget` is set. Defaults to `./tmp/record-output-<timestamp>.js` if not configured explicitly.


#### Example 1: Use Mocking Mode Only (i.e. All Hard Coded Responses)
When the server has a `serverConfig` but no `responseGenerator` the server will fail for any
unmocked calls.
```json
{
    "serverConfig": "./hardCodedResponses.js"
}
```

#### Example 2: Use Response Generation Mode Only (i.e. All Default Responses)
When the server has a `responseGenerator` but no `serverConfig` the server will use all default
responses.
```json
{
    "responseGenerator": "http://localhost:8484"
}
```



#### Example 3: Enable Partially Mocked Responses (i.e. Mocking + Response Generation)
When the server has both a `serverConfig` setting and a `responseGenerator` setting then you can use
partially mocked responses with the `replyWithDefault` method explained below.
```json
{
    "serverConfig": "./hardCodedResponses.js",
    "responseGenerator": "http://localhost:8484"
}
```

#### Example 4: Enable Record Mode
```json
{
    "recordTarget": "http://localhost:8484",
    "recordingFilepath": "./tmp/my-recording.js"
}
```
### Server Configuration File
The second configuration file (specified by the `serverConfig` file) is the mock configuration file if you choose to use mocking mode. This file is written in JS and you
can use [nock](http://www.github.com/nock/nock) syntax to control what is mocked out. We have made
a few modifications to make it easy for you.
1. We introduced a Global function that sets the defaults you will need for defining your mocks.
   Simply call `WeM2k.mock()` instead of `nock` directly for setting up a mock.
1. We have added a new type of reply method to `nock` called `replyWithDefault` which is only valid when used in conjunction with response generation. This method
enables _partial_ mocking of responses that start with the default body from your response generator.

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

## Running with an Example Configuration
To show an example configuration with a response generator and mocking in action, we've provided a `docker-compose.yml` file in the root directory.

Merely run `docker-compose up` to start all the dependencies required for this. It uses a [prism](https://github.com/stoplightio/prism) mocking server as a response generator to give example responses from an open API spec.

You can then run the commands below to see both mocking and response generation in action:

```bash
# trigger mocked route from ./testConfig
curl localhost:8000/health_check

# trigger a route that isn't mocked but not supported by example response generator
curl localhost:8000/invalid_route | python -m json.tool
{
    "type": "https://stoplight.io/prism/errors#NO_PATH_MATCHED_ERROR",
    "title": "Route not resolved, no path matched",
    "status": 404,
    "detail": "The route /invalid_route hasn't been found in the specification file"
}

# trigger route against response generator
curl localhost:8000/no_auth/pets/findByStatus?status=available | python -m json.tool
[
    {
        "id": -9223372036854776000,
        "category": {
            "id": -9223372036854776000,
            "name": "string"
        },
        "name": "doggie",
        "photoUrls": [
            "string"
        ],
        "tags": [
            {
                "id": -9223372036854776000,
                "name": "string"
            }
        ],
        "status": "available"
    }
]
```

## Adding Mocks at Run-time
If you want to add mocks after wem2k-server is started, you can do so by hitting the `/wem2k/v1/update` endpoint. Note that while the `serverConfig` let's you execute any raw javascript you desire, the `/wem2k/v1/update` endpoint only supports hard-coded values.

Other limitations:
1. Mocks will be processed in a FIFO/queue format, so if two mocks would match the same request (regardless of whether one has more specific criteria than the other), the one that was added first will be used for a response.
2. Mocks are not persisted after you've added them, so if you need to respond with the same mock multiple times, then you will have to invoke this endpoint the same number of times as you need replies.

### Example
```bash
# add mock
curl localhost:8000/wem2k/v1/update -d "{ \"path\": \"/route3\",\"method\": \"post\",\"status\": \"200\",\"response\": {\"a\": \"b\"}}"

# exercise mock
curl localhost:8000/route3 -H 'content-type: application/json' -d '{}' | python -m json.tool
{
    "a": "b"
}

# try mock again, but it doesn't exist. You will have to re-add it if you want to execute
# it multiple times.
curl localhost:8000/route3 -H 'content-type: application/json' -d '{}'The server is misconfigured and you will need to mock the following call
Error: Nock: No match for request {
  "method": "POST",
  "url": "http://example.com/route3",
  "headers": {
    "content-length": "2",
    "content-type": "application/json",
    "accept": "*/*",
    "user-agent": "curl/7.54.0",
    "host": "example.com",
    "connection": "close"
  },
  "body": "{}"
}
```

## Advanced Usage

For more advanced usage take a look at the modules we use in the server.
* We use the [config](https://github.com/lorenwest/node-config) module to read the server settings
  file.
* We use the [debug](https://github.com/visionmedia/debug) module for debug messages.
* We use [nock](https://github.com/nock/nock) to control mocks.
