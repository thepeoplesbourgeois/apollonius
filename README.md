# Apollonius

An experimental lightweight client for watching videos from The Internet Archive.

#### Choice of name

Apollo was [already taken](https://www.apollographql.com/), but as far as a steward would be concerned,
Apollonius was [an allegedly darn good namesake](https://en.wikipedia.org/wiki/Apollonius_of_Tyana#Historical_facts) to the god of knowledge.

## Installation

in terminal:
```bash
$ git clone https://github.com/thepeoplesbourgeois/apollonius.git ./
```

or from the page you're probably reading this on:

```
1. Click "Clone or download"
2. Click "Download ZIP"
3a. If your browser prompts it, choose to either open the archive or to save it to a specific directory
3b. Wait for the download to conplete.
3c. If you saved the ZIP, unzip it now.
4. Congratulations! Your new software is now installed!
4a. You can delete the ZIP file now.
4b. Unless you'd prefer to keep it for sentimenal reasons.
4c. But don't become a hoarder.
```

## Startup

Open `~/index.html` in your browser.

## Features

- The user can reach the video of their choice by passing `find={identifier}` in the query string
- The user can enter an identifier within the input field above the embedded video. When doing so,
  the video, title, and description update within the page instead of causing a refresh. The URL parameters will
  also change to reflect the parameters for loading the video on client startup
- The User can click the tile fore a related video to load the data for that video.

## Roadmap

- The video player should display reviews written by other users.
- Transition the video from an `<embed>` to native `<video>`
  - Need to find a way to reliably embed the necessary video sources for formats supported by `<video>`
  - Issue is what to do when the video `identifier` and the `filename` do not match.
- The interface should ideally not be hideous.

## Technical implementation

Apollonius runs entirely within a webpage via the JavaScript library [`neverland`](https://github.com/webreflection/neverland)
by Andrea Giammarchi. `neverland` is meant to be a replacement for `React`, with
an emphasis on state management through the Hook pattern [introduced in React 16.8](https://reactjs.org/docs/hooks-intro.html).
New features will be implemented as I learn more about the JavaScript standard library
and how to interface with it through `neverland`. Bundling is handled by Rollup.
Minimization isn't enabled, but apparently `neverland` weighs in around 5KB when it is.

Not too bad for near-parity with React behaviors.
