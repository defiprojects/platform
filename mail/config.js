/*
|-------------------------------------------------------------------------------
| Development config               https://maizzle.com/docs/environments/#local
|-------------------------------------------------------------------------------
|
| The exported object contains the default Maizzle settings for development.
| This is used when you run the `maizzle build` or `maizzle serve` and it
| has the fastest build time, since most transformations are disabled.
|
*/

const Parser = require('rss-parser')

module.exports = {
  build: {
    feed: {
      url: 'https://laracasts.com/feed',
    },
    templates: {
      source: 'src/templates',
      destination: {
        path: 'build_local',
      },
    },
  },
  events: {
    async beforeCreate(config) {
      // create a new Parser instance
      const parser = new Parser({
        customFields: {
          feed: ['subtitle'],
          item: ['summary'],
        }
      })

      // fetch and parse the feed
      const feed = await parser.parseURL(config.build.feed.url)

      // organisation
        // logo
        // name
        // [notificaitons]
          // type
          // Title
          // Message

          const projects = [
            {
              notifications: [
                {
                  title: 'MultiChain bridge vulnerability',
                  text: 'Only users who had approved the 6 tokens (WETH, PERI, OMT, WBNB, MATIC, AVAX) on Router are required to revoke approvals',
                  link: 'https://medium.com/multichainorg/action-required-critical-vulnerability-for-six-tokens-6b3cbd22bfc0',
                  type: 'security'
                },
                {
                  title: 'Celsius Now Supports Avalanche',
                  text: 'Avalanche is now supported by Celsius Network, allowing users to earn and borrow against their AVAX on the app!',
                  link: 'https://medium.com/avalancheavax/celsius-now-supports-avalanche-730870f30940',
                  type: 'general'
                }
              ],
              name: 'Avalanche',
              link: 'https://www.avax.network/',
              logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=018'
            },
            {
              notifications: [
                {
                  title: 'Trader Joe add new pools',
                  text: 'Stake your AVAX/DAI.e right now!',
                  link: 'https://traderjoexyz.com/#/pool/AVAX/0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
                  type: 'general'
                }
              ],
              link: 'https://traderjoexyz.com/#/home',
              name: 'Trader Joe',
              logo: 'https://traderjoexyz.com/static/media/logo.bc60f78d.png'
            },
            {
              notifications: [
                {
                  title: 'Your SNOB and AXIAL staking reward can be claimed',
                  text: 'Some awesome notification message that we want to read',
                  link: 'https://snowball.network',
                  type: 'personal'
                }
              ],
              link: 'https://snowball.network',
              name: 'Snowball.network',
              logo: 'https://app.snowball.network/_next/image?url=https%3A%2F%2Fraw.githubusercontent.com%2FSnowball-Finance%2Fbridge-tokens%2Fmain%2Favalanche-tokens%2F0xC38f41A296A4493Ff429F1238e030924A1542e50%2Flogo.png&w=3840&q=75'
            }
          ];

      // https://app.snowball.network/_next/image?url=https%3A%2F%2Fraw.githubusercontent.com%2FSnowball-Finance%2Fbridge-tokens%2Fmain%2Favalanche-tokens%2F0xC38f41A296A4493Ff429F1238e030924A1542e50%2Flogo.png&w=3840&q=75
      // store the feed data in our config
      config.feed = {
        title: "Snowflakes.network",
        subtitle: "Snowflakes.network",
        link: "https://snowflakes.network",
        updated_at: feed.lastBuildDate,
        projects: projects,
      }
    }
  },
  formattedDate(str) {
    const date = new Date(str)
    return date.toLocaleDateString('en-US', {day: 'numeric', month: 'short', year: 'numeric'})
  },
}
