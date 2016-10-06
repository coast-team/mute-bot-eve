# Translator bot for MUTE editor

## Install
Get Yandex translate API key from: https://tech.yandex.com/keys/get/?service=trnsl

Define `YANDEX_TRANSLATE_API_KEY` environment variable.

```
npm install
```

## Run
```
Usage: node server [options]

  Options:

    -h, --help      output usage information
    -v, --version   output the version number
    -h, --host <n>  specify host (DEFAULT: SERVER_HOST || "127.0.0.1")
    -p, --port <n>  specify port (DEFAULT: SERVER_PORT || 8000)

  Example:

     $ node server -h 192.168.0.1 -p 9000
```

## How it works
Type `/rt` in MUTE editor. All text preceding this tag will be translated
in real-time in the editor.
