const SDK = require('ringcentral')
let config = require('./config.default')
let FormData = require('form-data')
let opts = {
  server: SDK.server.sandbox,
  appKey: config.appKey,
  appSecret: config.appSecret,
  redirectUri: config.redirectUri
}
let rcsdk = new SDK(opts)

/**
* @param {Error} e
*/
function handleError(e) {
  console.log(e.stack)
}

const run = () => {
  let platform = rcsdk.platform()

  let timeout = null // reference to timeout object
  let ringout = {} // this is the status object (lowercase)

  async function create(unsavedRingout) {

    console.log('start auth')
    let res = await platform.login({
      username: config.fromNumber, // phone number in full format
      extension: '', // leave blank if direct number is used
      password: config.password
    })
    .then(res => res)
    .catch(handleError)
    console.log('start call')
    platform
      .post('/account/~/extension/~/ringout', unsavedRingout)
      .then(function(response) {
        ringout = response.json()
        console.info('First status:', ringout.status.callStatus)
        update()
      })
      .catch(handleError)
  }

  /**
   * @param {function(number?)} next - callback that will be used to continue polling
   * @param {number} delay - last used delay
   */
  function update() {

    clearTimeout(timeout)

    timeout = setTimeout(function() {

        if (ringout.status && ringout.status.callStatus !== 'InProgress') {
          return
        }

        platform
          .get(ringout.uri)
          .then(function(response) {
            ringout = response.json()
            console.info('Current status:', ringout.status.callStatus)
            update()
          })
          .catch(handleError)

    }, 500)

  }

  /**
   * To stop polling, call this at any time
   */
  function hangUp() {

    clearTimeout(timeout)

    if (ringout.status && ringout.status.callStatus !== 'InProgress') {
      platform
        .delete(ringout.uri)
        .catch(handleError)

    }

    // Clean
    ringout = {
      from: {phoneNumber: ''},
      to: {phoneNumber: ''},
      callerId: {phoneNumber: ''}, // optional,
      playPrompt: true // optional
    }

  }

  /**
  * Start the ringout procedure (may be called multiple times with different settings)
  */
  create({
    from: {phoneNumber: config.fromNumber},
    to: {phoneNumber: config.toNumber},
    //grant_type: 'client_credentials',
    //callerId: {phoneNumber: '18882222222'}, // optional,
    playPrompt: true // optionalgrant_type":"password","playPrompt":tru
  })

}

run()