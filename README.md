# Endless 💍 https://endlessring.xyz/

![Screenshot](https://github.com/ProphetFund/endless-ring/blob/main/app/src/media/Screenshot%202022-08-31%20163007.png)

## 💎 TLDR

https://endlessring.xyz/

The Endless Ring is a peak into the future of fashion. In the future, fashion will bridge universe and metaverse, as people will express themselves through physical wearables with metaverse representations. Endless is physical piece of jewellery that holds your voice and has metaverse representations and can be raed by any smartphone.

Record a voice message and get 3 things:
* a physical NFC-enabled ring that links to the NFT (ISO 14443A)
* IPFS-hosted NFT with an artistic generative rendering of your voice's sound wave. The NFT is on Polygon and Lukso and takes advantage of the LSP8-IdentifiableDigitalAsset.
* metaverse wearable jewellery on Decentraland (WIP)


## 💡 Inspiration
Future-proof storage and the tamper-free nature of the blockchain. Despite being technical terms, the ideas of eternity and immutability have been with us since the dawn of civilisation. 

These are also key concepts of love, whether it's affectionate, familiar, brotherly, or romantic love. To express it to family, a friend, or a romantic partner in an eternal and immutable way seems very valuable.

We took inspiration from Lukso and the idea of combining digital & physical. A physical ring that also a very personal voice message that will last forever, and can be tied to you thanks to Lukso.  We took inspiration from the concept of the ERC751Y and LSP8-IdentifiableDigitalAsset and voice as a personal identifier.

Endless rings will cross the boundaries of physical world and metaverse worlds as the same ring with the same message will be wearable across these worlds. 

## 💍 What it does

Check out a video presentation and product walk through here https://www.tella.tv/video/cl7gu0b2i00010gmlfyku58wc/view

The web app
* connects to your wallet
* lets you record your voice
* generate an image of your voice wave
* create a unique identifier for that voice message [[@Hugo pls include standard name]]
* mint that voice message on Polygon and Lukso as an NFT and gets hosted on IPFS.

The physical ring is an NFC-enabled ring, which will point to the IPFS. You don't need to charge it. You don't need any special app. Simply get your phone close to the ring and it will play your message.

Oh, the web app also shows you some cool 3d floating rings and fog. I know it's hard to miss, but just wanted to mention that again （￣︶￣）↗　

See the it on explorer
https://explorer.execution.l16.lukso.network/tx/0x2ce7a2bacb72293547d1a2c05efdf008b4f4fde638f1e5f0a9556e7ab0d1b25b

## 🧰 How we built it
For the frontend, we used:
* flask
* tailwind
* alpinejs
* vanilla js
* threejs
* vantajs

On the backend, we used:
* web3.js, eth-brownie to interact with blockchain
* numpy, matploblib and pydub to manipulate the voice data
* flask, gunicorn, werkzeug to run server-side stuff

💍 Physical ring:
We contacted 8 different suppliers and chose the best looking desings, which are being prototyped right now. Unfortunately, due to the difficulty of soldering around copper wire, there have been delays, but the first prototypes work. We made them work by embedding them in an temperature-absorant plastic inlay, which then gets coated with ceramic. The ring is compatible with all modern smartphones. It can be easily programmed. It has about 100k cycles. It is based on ISO 14443A, 13.56MHz NDEF.

## 🤯 Challenges we ran into
* Largest challenge: Hardware getting the physical ring to work with soldering.
* Any kind of jewellery making process in proximity to copper wire will break the wire.
* Very hard to get the shape right, so for prototype we skipped that part.
* Trying to integrate with Universal Profiles
* Smart contract & IPFS: integrating IPFS storage with recording a voice message on the site and also minting an NFT, all in real time.
* Time management!

## 🎓 What we learned
* Hugo has learnt how to easily integrate IPFS
* Hugo has learnt how to integrate crypto transactions on frontend with metamask and web3.js
* Konrad has learnt ThreeJS and a lot of frontend stuff.
* Konrad has learnt a lot about NFC technology and jewellery manufacturing

## 🌚 What's next 
Finalizing ring design & launching!

Also, expanding expanding this to the metaverse wearables market and integrating with Decentraland, Sandra and VR Chat. See an example on Decentraland https://builder.decentraland.org/items/789b8811-0a74-40b3-ad3b-987626db2a3c

# Instructions
(Assuming linux terminal. If on windows consider using [WSL](https://docs.microsoft.com/en-us/windows/wsl/install))

1. create local python installation, activate it, and install libraries

```
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
```

2. go to app/src/ and install npm packages

```
        cd app/src
        npm install
```

<br>

That's it! Now you can run the server, or push to github (autodeploys to render).

<br>

### Useful commands:

```
cd src
npm run build-css
```
⬆️ This will run a script that re-builds tailwind everytime you make a change to the html or css.

```
cd src
npm run local
```
⬆️ This builds the css once and will run the server locally.

```
python app.py
```
⬆️ Same thing as before, just without building the css first.

```
cd src
npm run yeet-it
```
⬆️ This says, builds the css, adds all files to a git commit, and pushes to github.


### Render deployment

1. hook up git repo
2. Run settings: ```cd app/src/ && npm install && npm run build-css && cd .. && gunicorn app:app```
3. copy over .env file
