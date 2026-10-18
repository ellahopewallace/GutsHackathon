# Purr Inn 猫の宿

A small shared courtyard that lives alongside a hotel stay. Each traveller
checks in by choosing and naming a cat, and every cat wanders, naps, plays and
makes friends in the same soft, pastel ukiyo-e garden under Mount Fuji. Nobody
steers the cats: travellers feed, brush, pet and play with them, and notice
each other through their cats, the way passengers on a flight notice each other
without having to talk.

It is mobile-first, icon-first and language-light, so travellers with
different languages can share it without reading much. The cat is the only
identity: the only words anyone sees are cats' names.

## Run it

```bash
npm install
npm run dev            # http://localhost:5173
npm run dev -- --host  # also reachable from phones on the same Wi-Fi (use the "Network" URL)
```

## What's in it

- **Choose and name a cat:** seven breeds, with the Norwegian Forest Cat first. Coat, pattern, white markings, fur, eyes and accessory are all picked from pictures. The cat's name goes on a pink nameplate hung right under it, the same pink tag that follows it around the courtyard.
- **The courtyard:** every traveller's cat lives here. Cats boop noses, groom each other, play tag, nap on cushions and watch the koi on their own.
- **Caring:** the five softly coloured buttons at the bottom feed, play, brush, tuck in for a nap and pet. Tap the garden to toss a yarn ball. Tap anyone's cat to pet it or give it a treat.
- **Feedback in the courtyard:** the icon you tap floats to the cat, which then reacts (happy eyes, a blush, a hand stroking it, a comb, a bowl). When someone pets your cat, their cat's name floats above yours.
- **Your cat:** marked by a soft pink glow and its pink name tag. Tap its face at the bottom left to see how it's doing.
- **Who's here:** faces in the top bar, a sheet of every cat's face and name, and a courtyard diary of small moments told with cat faces and icons ("Mochi ♥ Yuzu").
- **Day and night:** distant birds drift past Fuji by day; by night the same courtyard is lit by lanterns, with the moon, stars, fireflies and the occasional shooting star. It follows the local time until you toggle it (top right).
- **A measured picture:** the inn, plaque, lanterns, plants and stepping stones are laid out around one centre line, with the sun or moon resting on Fuji's peak, so the scene feels balanced without looking mirrored.

## Multiplayer

**Without any setup**, tabs in the same browser share one courtyard (they talk
over `BroadcastChannel`). Open two windows side by side to demo multiplayer on
one laptop.

**Across phones**, add a `.env` in this folder with the Firebase web config
(the same variables `src/lib/firebase.js` already reads):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Firestore needs to allow the hotel collections. For the hackathon demo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /hotels/{hotelId}/{document=**} {
      allow read, write: if true; // demo only: lock this down before real use
    }
  }
}
```

If Firestore can't be reached, the app falls back to local mode automatically.

Guests are anonymous: each tab gets a random id, and all anyone sees is the
cat. Two cats can share a name.

## Handy URLs

| URL | What it does |
| --- | --- |
| `/?demo` | Skip the picker and arrive with a Norwegian Forest Cat |
| `/?reset` | Forget this tab's cat and start again at the picker |
| `/?hotel=team2` | A separate courtyard |
| `/?residents=0` | Hide the five resident cats |
| `/?gallery` | Design sheet of every breed in every pose |

## How it works

- **No positions are ever sent.** Time is split into 12 s slots; each slot every
  cat gets a plan (wander, groom, nap, watch the koi, meet a friend...) chosen by
  seeded randomness from the slot number and who is in the hotel. Positions are
  pure functions of the clock, so every phone draws the same courtyard. Only
  presence and intents (feed, play, pet...) go over the network, and actions
  temporarily override a cat's plan. See `src/game/sim.js`.
- **Resident cats** (Mochi, Yuzu, Tofu, Hachi, and Kuro, who keeps checking in
  and out) are simulated on a fixed schedule, so the courtyard is lively even
  with one phone, and identical on every phone. See `src/game/residents.js`.
- **The cats are hand-built SVG prints**: three poses (sit, walk, sleep) with
  CSS-animated parts, procedural fur for long-haired breeds and brush-stroke
  tabby markings. See `src/components/cat/`.
- **Smooth on phones:** the render loop writes transforms straight to the DOM
  (React never re-renders mid-animation), each cat is its own compositor layer,
  and only the visible pose animates.

```
src/
  App.jsx                    choose a cat → courtyard, URL switches
  components/CatPicker.jsx   check-in: choose, customise and name a cat
  components/hotel/          courtyard screen: top bar, dock, popovers, sheets, diary
  components/scene/          courtyard artwork (Backdrop), render loop (HotelScene), effects
  components/cat/            the cat illustrations and animation rig
  components/ui/             icons and small shared pieces (brand, faces, day/night)
  components/StatBars.jsx    the four care gauges
  game/sim.js                deterministic courtyard simulation
  game/care.js               how needs drift and what each care action does
  game/residents.js          the simulated resident cats
  hooks/useHotel.js          presence, events, actions and the diary
  lib/                       theme, session storage, colours, Firebase setup
  net/hotelNet.js            Firestore or BroadcastChannel transport
```
