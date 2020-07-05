[![Dependencies][deps-image]][deps-url] [![star this repo][gh-stars-image]][gh-url] [![fork this repo][gh-forks-image]][gh-url] [![Build Status][travis-image]][travis-url]

# Rust JS13k Pixel Game Boilerplate

This is a boilerplate for JS13k pixel game written in Rust.

## Features

* Sharp pixels
* Resizable canvas with correct aspect ratio
* <1kb wasm size
* TODO: Sends keyboard input to Rust
* TODO: Minifies html and javascript

## Trade-offs

* No Rust std library, only core. Most std functions add too much code bloat.
* No memory allocator
    * The default allocator is 10kb, but you can include [wee-alloc](https://github.com/rustwasm/wee_alloc) at <1kb
* There is a fixed / maximum # of on-screen pixels -- but then again, this is a boilerplate for a pixel game

## Running

### Installation

```
git clone https://github.com/leebradley/js13k-rust-boilerplate

mv js13k-rust-boilerplate [NAME OF YOUR GAME]
cd [NAME OF YOUR GAME]

rm -rf .git
npm install # install devDependencies

rm readme.md
$EDITOR package.json # change package details
```

### Get dependencies

* [Install Rust](https://rustup.rs/)
* [Install Yarn](https://classic.yarnpkg.com/en/)
* `yarn install -D`
* Install WASM optimization tool kit: `brew install binaryen wabt`

### Run

* Build with `yarn build` - This places the output in the `dist` directory
* Serve with `yarn serve`

### Other commands

* Serve with `yarn serve`

# Credits

* Cliff Biffle's guide to [Making really tiny WebAssembly graphics demos](http://cliffle.com/blog/bare-metal-wasm/)
* Shreyas Minocha's [js13k-boilerplate](https://github.com/shreyasminocha/js13k-boilerplate)

## License

MIT © 2020 [Lee Bradley](https://github.com/leebradley)

[deps-url]: https://david-dm.org/leebradley/zipstats
[deps-image]: https://badgen.net/david/dep/leebradley/zipstats

[gh-url]: https://github.com/leebradley/zipstats
[gh-stars-image]: https://badgen.net/github/stars/leebradley/zipstats
[gh-forks-image]: https://badgen.net/github/forks/leebradley/zipstats

[travis-url]: https://travis-ci.com/leebradley/zipstats
[travis-image]: https://travis-ci.com/leebradley/zipstats.svg?branch=master