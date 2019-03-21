# Apollonius

An experimental lightweight client for looking up videos in The Internet Archive.

#### Choice of name

Apollo was [already taken](https://www.apollographql.com/), but as far as a steward would be concerned,
Apollonius was [an allegedly darn good namesake](https://en.wikipedia.org/wiki/Apollonius_of_Tyana#Historical_facts) to the god of knowledge.

## Installation

```bash
$ git clone https://github.com/thepeoplesbourgeois/apollonius.git ./
```

## Startup

Open `~/index.html` in your browser.

## Technical implementation

Apollonius runs entirely within a webpage via the JavaScript library `neverland`
by Andrea Giammarchi. `neverland` is meant to be a replacement for `React`, with
an emphasis on state management through the Hook pattern [introduced in React 16.8](https://reactjs.org/docs/hooks-intro.html).
New features will be implemented as I learn more about the JavaScript standard library
and how to interface with it through `neverland`. Bundling is handled by Rollup.
Minimization isn't enabled, but apparently `neverland` weighs in around 5KB when it is.

Not too bad for near-parity with React behaviors.
