# WeM2k Server
This server can be used to mock out external REST services. The server uses two different
configuration files, a server settings file and a 

## Configuring the Server
### Server Settings
Server settings are controlled by config/default.json. There are three values that the file
expects.

* `responseGenerator`: This is the URL of a server which can generate default responses for the
     server that WeM2K Server is mocking out.
* `serverConfig`: This is the path to a file which configures how the server controls responses.
     This file can use [nock](http://www.github.com/nock/nock) syntax to control how the WeM2K server
     responds with two modifications which we will explain below.
* `port`: This is the port that the server will start at

### Server Configuration File
The second configuration file is the mock configuration file. This file is written in JS and you
can use [nock](http://www.github.com/nock/nock) syntax to control what is mocked out. We have made
a few modifications to make it easy for you.
1. We introduced a Global function that sets the defaults you will use for all your mock
configuration in this file. Simply call `WeM2k.mock()` instead of `nock` directly for setting up
the mock.
1. We have added a new type of reply method to `nock` called `replyWithDefault`. This method
enables _partial_ mocking of responses that start with the default body.
