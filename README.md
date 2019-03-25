# WeM2k Server
This server can be used to mock out external REST services. The server uses two different
configuration files, a server settings file and a 

## Configuring the Server
### Server Settings
Server settings are controlled by config/default.json. There are three values that the file
expects.

* `responseGenerator`: This is the URL of a server which can generate default responses for the
     server that WeM2K Server is mocking out.
* `mockConfig`: This is the path to a js file which configures how the server controls responses.
     This file can use [nock](www.github.com/nock/nock) syntax to control how the WeM2K server
     responds with two modifications. 

