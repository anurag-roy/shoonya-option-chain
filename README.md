<div align="center">

# Option Chain

Live Option Chain for Equity Derivatives using Finvasia (Shoonya) APIs and Next.js

<img width="1412" alt="option-chain" src="https://user-images.githubusercontent.com/53750093/219455211-6384c214-0aae-461b-a020-30f3039794d7.png">
  
</div>

## Features

- Grouped stocks for easily monitoring relevant stocks
- Connect from multiple tabs to monitor different groups of upto 3000 stocks (KiteTicker limit)
- Vertically resizable and scrollable tables to adjust views when needed
- Prices displayed - First Bid and First Ask for options and LTP for equities along with change from previous day's close
- Options displayed
  - CE: Only Call options with strikes lesser than the LTP
  - PE: Only Put options with strikes greater than the LTP
  - A percentage of options close to the LTP on both sides are ignored. See [`DIFF_PERCENT`](#configts)

## Screenshots

![initial-view](https://github.com/anurag-roy/shoonya-option-chain/assets/53750093/09fe5873-0975-4e76-9378-e100e0346651)

![all-view](https://github.com/anurag-roy/shoonya-option-chain/assets/53750093/04690c1b-e274-41a6-a05f-29b6406b2d66)

![group-view](https://github.com/anurag-roy/shoonya-option-chain/assets/53750093/ad5889ad-7e13-465c-a465-f014f858cafc)

![order-with-cash](https://github.com/anurag-roy/shoonya-option-chain/assets/53750093/2881c25a-e390-448a-b07e-abd7fe2e84ed)

![order-with-shortfall](https://github.com/anurag-roy/shoonya-option-chain/assets/53750093/a9bc7e05-bb79-49c0-a199-f5ecd7d10bce)


## Setup

Install dependencies. (npm or yarn is recommended)[^1]

```sh
npm install
```

Setup environment secrets in an `env.json` file by copying the `example.env.json` file. For further customisation, see [configuration](#configuration).

```sh
cd src
cp example.env.json env.json
# Populate env.json secrets
```

Populate the SQLite DB with instrument data.

```sh
npm run data:prepare
```

## Usage

Start in development mode

```
npm run dev
```

Build and start production server.

```sh
npm run build
npm start
```

## Configuration

### Port

The default port is `3000`. To change it, update the `dev` and `start` scripts in `package.json`.

### config.ts

Edit `src/config.ts` to:

- `GROUPS` - Update stock dropdown options and relevant grouping
- `EXPIRY_OPTION_LENGTH` - Expiry dropdown options
- `DIFF_PERCENT` - Control the range of strikes to ignore (depending on the LTP of the equity instrument).

## Related

- [All Option Chain](https://github.com/anurag-roy/all-option-chain)
- [Kite Option Chain](https://github.com/anurag-roy/kite-option-chain)
- [5paisa Live Ticker](https://github.com/anurag-roy/5paisa-live-ticker)

## Contact

- [Twitter](https://twitter.com/anurag__roy)
- [Email](mailto:anuragroy@duck.com)

## License

[MIT © 2023 Anurag Roy](/LICENSE)

[^1]: The app uses this [Next.js plugin](https://www.npmjs.com/package/next-plugin-websocket) to maintain a WebSocket Server, which patches some files in `node_modules`. I have tried using `pnpm` but it does not work reliably. See other caveats [here](https://github.com/sam3d/next-plugin-websocket#caveats).
