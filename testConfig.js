WeM2k.mock()
  .get('/hello')
  .replyWithDefault(200, function (body) { 
     console.log(body);
     return 'I have been mocked';
  });