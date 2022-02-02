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
- [x] Reach out to This week in Avalanche for a collaberation
- [ ] Add Telegram push notifications (February 3)
- [ ] Add Web push notifications (February 4)
- [ ] Add Discord Bot for notifications (February 5)
- [ ] Add schedule push (February 6)
- [ ] Make it possible to edit/delete your own notifications (February 6)
- [ ] Give snowflakes admin acount possibility to push notifications of not verified domains, needed to kickstart snowflakes.network and give demos (February 7)
- [ ] Write notifications for the the most popular projects (february 7)
- [ ] Add missing contract -> domain set with easy admin ability to remove them (example is wavax.net) (February 7)
- [ ] Make the code DRY (February 7)
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
