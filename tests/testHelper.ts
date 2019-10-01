import portfinder from 'portfinder'

async function GetFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    portfinder.getPort((err, port) => {
      if (err) {
        reject(err)
      }
      return resolve(port)
    })
  })
}

export = GetFreePort
