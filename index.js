class BackgroundBuffer {
  constructor(first, second) {
    /** @type {HTMLImageElement} */
    this.bottom = first;
    /** @type {HTMLImageElement} */
    this.top = second;
    this.displaying = "";
  }

  swapImages() {
    this.top.classList.toggle("hidden");
    this.bottom.classList.toggle("hidden");
    let t = this.top;
    this.top = this.bottom;
    this.bottom = t;
  }

  pushImage(path) {
    if(this.displaying == path) return;
    this.displaying = path;
    let img = new Image();
    img.addEventListener("load", _ => {
      this.bottom.src = img.src;
      this.swapImages();
    });
    img.addEventListener("error", _ => {
      this.bottom.src = "";
      this.swapImages();
    });
    img.src = path;
  }
}

/*
  hide-hits -> hides hit counts in gameplay
  hide-mods -> hides mods
  hide-fc-pp -> hides "if fc pp" counter
  hide-stats-l / hide-stats-r -> hides map stats on left/right side
*/
const props = location.hash.slice(1).split("+");

const createCountUp = (el, opts = {}) => new countUp.CountUp(el, 0, {
  duration: 0.5,
  useGrouping: false,
  ...opts,
})

const socket = new ReconnectingWebSocket(window.overlay.config.getWs() + "/tokens");

socket.addEventListener("open", () => {
  socket.send(JSON.stringify([
    "artistRoman",
    "titleRoman",
    "diffName",
    "backgroundImageLocation",
    "ar",
    "cs",
    "od",
    "hp",
    "c100",
    "c50",
    "miss",
    "sliderBreaks",
    "ppIfMapEndsNow",
    "noChokePp",
    "currentBpm",
    "rawStatus",
    "mStars",
    "mods",
    "osu_m98PP",
    "osu_m99PP",
    "osu_mSSPP",
    "md5",
  ]));
});

if(props.includes("hide-stats-l")) {
  document.querySelector(".stats.left").setAttribute("style", "display: none");
}
if(props.includes("hide-stats-r")) {
  document.querySelector(".stats.right").setAttribute("style", "display: none");
}
if(props.includes("hide-mods")) {
  document.querySelector(".mods").setAttribute("style", "display: none");
}

const els = {
  container: document.querySelector(".container"),
  bg: [
    document.getElementById("first"),
    document.getElementById("second"),
  ],
  artist: document.querySelector(".artist"),
  title: document.querySelector(".title"),
  version: document.querySelector(".version"),
  previews: {
    98: createCountUp(document.querySelectorAll(".pp-preview>.pp")[0], { suffix: 'pp' }),
    99: createCountUp(document.querySelectorAll(".pp-preview>.pp")[1], { suffix: 'pp' }),
    100: createCountUp(document.querySelectorAll(".pp-preview>.pp")[2], { suffix: 'pp' }),
  },
  pp: {
    container: document.querySelector("div.pp"),
    now: createCountUp(document.querySelector(".pp>.now"), { suffix: 'pp' }),
    fc: createCountUp(document.querySelector(".pp>.fc"), { prefix: 'if fc: ', suffix: 'pp' }),
  },
  stats: {
    bpm: document.querySelector(".bpm>.value"),
    stars: document.querySelector(".stars>.value"),
    ar: document.querySelector(".ar>.value"),
    od: document.querySelector(".od>.value"),
    cs: document.querySelector(".cs>.value"),
    hp: document.querySelector(".hp>.value"),
  },
  hits: {
    container: document.querySelector(".hits-container"),
    100: createCountUp(document.querySelectorAll(".hit>.value")[0]),
    50: createCountUp(document.querySelectorAll(".hit>.value")[1]),
    0: createCountUp(document.querySelectorAll(".hit>.value")[2]),
    sb: createCountUp(document.querySelectorAll(".hit>.value")[3]),
  },
  mods: document.querySelector(".mods"),
};

const bg = new BackgroundBuffer(...els.bg);

let oldMods = "";

let data = {};

let currentBgImage = "";

socket.addEventListener("message", ev => {
  let newData = JSON.parse(ev.data);
  data = { ...data, ...newData };
  console.log(data);

  if(currentBgImage != data.backgroundImageLocation) {
    console.log("updating image");
    currentBgImage = data.backgroundImageLocation;
    bg.pushImage(`http://${location.host}/backgroundImage?cache=true&md5=${data.md5}`);
  }

  let playing = [2, 7, 14].includes(data.rawStatus);
  let showHits = data.rawStatus == 2;

  if(playing) {
    els.container.classList.add("playing");
  } else {
    els.container.classList.remove("playing");
  }

  if(showHits && !props.includes("hide-hits")) {
    els.hits.container.classList.add("show");
  } else {
    els.hits.container.classList.remove("show");
  }

  els.artist.innerText = data.artistRoman;
  els.title.innerText = data.titleRoman;
  els.version.innerText = '[' + data.diffName + ']';

  els.stats.bpm.innerText = Math.round(data.currentBpm);
  els.stats.stars.innerText = Math.round(data.mStars * 100) / 100;
  els.stats.ar.innerText = data.ar;
  els.stats.od.innerText = data.od;
  els.stats.cs.innerText = data.cs;
  els.stats.hp.innerText = data.hp;

  els.previews[98].update(data.osu_m98PP);
  els.previews[99].update(data.osu_m99PP);
  els.previews[100].update(data.osu_mSSPP);

  els.hits[100].update(data.c100);
  els.hits[50].update(data.c50);
  els.hits[0].update(data.miss);
  els.hits.sb.update(data.sliderBreaks);

  let showFcPp = data.miss + data.sliderBreaks > 0;

  if(showFcPp && !props.includes("hide-fc-pp")) {
    els.pp.container.classList.add("rip");
  } else {
    els.pp.container.classList.remove("rip");
  }

  els.pp.now.update(data.ppIfMapEndsNow);
  els.pp.fc.update(data.noChokePp);

  let mods = data.mods;
  if(oldMods != mods) {
    oldMods = mods;
    mods = mods.split(",")
    if(mods[0] == "None") mods = [];
    if(mods.includes("PF")) mods.splice(mods.indexOf("SD"), 1);
    els.mods.innerHTML = "";
    for(let mod of mods) {
      let modDiv = document.createElement("div");
      modDiv.classList.add("mod");
      if(['EZ', 'NF', 'HT'].includes(mod))
        modDiv.classList.add("green");
      if(['HR', 'SD', 'PF', 'DT', 'NC', 'HD', 'FL'].includes(mod))
        modDiv.classList.add("red");
      if(['RX', 'AP', 'SO', 'AU', 'CN'].includes(mod))
        modDiv.classList.add("blue");
      if(['V2'].includes(mod))
        modDiv.classList.add("gray");
      modDiv.innerText = mod;
      els.mods.append(modDiv);
    }
  }
});