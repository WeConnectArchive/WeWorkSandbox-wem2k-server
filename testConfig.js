WeM2k.mock()
  .persist()
  .get('/health_check')
  .replyWithDefault(200, function (body) {
     console.log(body);
     return 'This is a healthy endpoint!';
  });

WeM2k.mock()
  .get('/hello') // only works once if not persisted
  .replyWithDefault(200, function (body) {
     console.log(body);
     return 'I have been mocked';
  });

WeM2k.mock()
  .persist()
  .post('/api/tokens')
  .reply(200, function (requestBody) {
    let uuid = this.req.euuid;
    console.log("uuid: "+ uuid);
    WeM2k.makeJWT(uuid)
  });

  WeM2k.mock()
    .persist()
    .post('/v1/action')
    .reply(200, {
        principal_uuid: WeM2k.networkEncodeUUID('2b7a2019-13c5-4337-ba60-90b6437d3920'),
        actionToken: "",
        euuid: "",
        jwt: "",
        shouldUpdateClient: true

    });

const dt = new Date();
const exp = dt.getTime() + dt.getMonth() + 1;
const payload = { euuid: '2b7a2019-13c5-4337-ba60-90b6437d3920',
                  exp: exp.toString(),
                  uuid: '2b7a2019-13c5-4337-ba60-90b6437d3920' };

WeM2k.mock()
  .get('/goodbye') // only works once if not persisted
  .reply(200, 'Hello World!');
