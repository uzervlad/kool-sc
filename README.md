# kool

An overlay for [StreamCompanion](https://github.com/Piotrekol/StreamCompanion)

## Screenshots

<details>
  <summary>Expand</summary>

  ![image](/img/a.png)

  ![image](/img/b.png)

</details>

## Setup

1. Download latest version [here](https://github.com/uzervlad/kool-sc/releases/latest/download/kool.zip)

2. Create a new folder called `Kool` in your `StreamCompanion/Files/Web/overlays` folder

3. Unzip `kool.zip` into the folder from step 2

4. Open `http://localhost:20727/overlays/Kool/`

5. To update, run `update.exe` ([Source](https://github.com/uzervlad/simple-gh-updater))

## Settings

To apply settings, add them in the link after `#` joined by `+`.

For example: `http://localhost:20727/overlays/Kool/#hide-fc-pp+hide-stats-l`

Available settings:

* `hide-hits` - hides hit counts in gameplay
* `hide-mods` - hides mods
* `hide-fc-pp` - hides "if fc pp" counter
* `hide-stats-l`/`hide-stats-r` - hides map stats on left/right side

## Depends on:

* [CountUp.js](https://github.com/inorganik/CountUp.js)
* [reconnecting-websocket](https://github.com/pladaria/reconnecting-websocket)
