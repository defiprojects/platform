# Snowflakes.network

Advanced notification opt-in system running completely serverless (Moralis/Cloudflare/Upstash) for the Avalanche ecosystem.

## Design philosophy

Create a serverless subscribe/push system that works on every chain (that Covalent en Moralis support) and subnet (pull block cron strategy). This project can evolve in two or three ways, becoming a deploy your own subscribe/push system and/or managed subscribe/push system with garantuees that only domain authorised people can send push notifications.

### Scalability

Sveltekit Cloudflare Pages with functions will work fine for the start (less than 143k subscribers). After that hoping that the Cloudflare team will have their functions improved or we need to switch to unbound Cloudflare workers.

### API

Check [Snowflakes API docs](https://snowflakes.network/api). We have three public endpoints:

1. /api/push.json POST Push endpoint (to send a signed push, can be blocked if you don't have the authorization to send it from that domain/organization (TODO))
2. /api/notifications-[address].json GET Notifications endpoint for specific address
3. /api/subscriptions.json Post subscription endpoint (for implementing subscriptions on your own platform)

## Todo:

- [ ] Ask major avalanche (defi) platforms for their needs and feedback
  - [x] Snowball
  - [ ] Trader Joe
  - [ ] Pangolin
  - [ ] Benqi
  - [ ] Penguin Finance
  - [x] MagnetDAO
  - [ ] Avalaunch
  - [ ] Crabada
  - [ ] Yield Yak
  - [ ] Alpha Finance
  - [ ] Colony
- [x] Reach out to This week in Avalanche for a collaberation (Got an answer that it is a pay to promote channel, but wasn't really going for that, will probably go along without a collab, but if I need extra test users or do a launch I can consider it, however getting organic users > paid promotion when finding product market fit)
- [ ] Add confirmation delete modal for profile/domain/push (feedback iteration)
- [x] Reach out to This week in Avalanche for a collaberation
- [x] Add Telegram push notifications (bot is @snowflakes_network_bot)
  - [x] Keep hitting 429 while testing bulk push notifications https://core.telegram.org/bots/faq#my-bot-is-hitting-limits-how-do-i-avoid-this          https://core.telegram.org/bots/faq#how-can-i-message-all-of-my-bot-39s-subscribers-at-once Basically this limits it to 30 subscribers a second, with 5 minute time frames we have like 5 * 60 * 30 = 9000 push messages limit and in the best case spread over the whole day 259200 push notifications, but in reality a lot less. There are some approaches to handle this in a different way (like creating more bots and spreading users over new bots, but feels complicated and not sure how it works when they change the time and certain blocks are already booked). Feels quite complicated to solve in comparison with mail or web push (maybe make it a premium feature?). Wait with web push implementation and discord bot before commiting. Update: change to https://github.com/snowflakes-network/shove
- [ ] Change push endpoint to https://github.com/snowflakes-network/shove
  - [ ] Setup on fly.io
  - [ ] Check Redis storage approach between shove an snowflakes platform
- [ ] Add Discord Bot for notifications
- [ ] Add schedule push
- [ ] Make it possible to edit/delete your own notifications
- [ ] Give snowflakes admin acount possibility to push notifications of not verified domains, needed to kickstart snowflakes.network and give demos
- [x] Write notifications for the the most popular projects (february 7)
- [x] Add missing contract -> domain set with easy admin ability to remove them (example is wavax.net) (February 7)
- [ ] Ask for feedback round
- [x] Protect /api/push endpoint by domain check
  - [ ] Create cron job to check verified domains and update authorization
- [ ] Proper API docs how they can easily test it themselves (CURL)
- [ ] New Homepage
  - [ ] Less text, make it easier and shorter (more graphics)
  - [ ] Add video
  - [ ] Interactive subscription widget which alters the notifications example
- [ ] Add Wallet Connect login option
- [ ] Add Coinbase wallet login option
- [ ] Add Rabby login option
- [ ] Add Coin98 login option
- [ ] WeStaySafe VM subnet integration example
- [ ] Write Unit/E2E tests
- [ ] Add QA flows before release
- [ ] JS -> TS when prototype iteration is over
  - [x] Switch to tsconfig/svelte-chceck
  - [ ] Fix all type warnings if possible
- [ ] Setup Github Actions CI
  - [ ] Run type checker
  - [ ] Run unit tests
  - [ ] Run E2E tests
