#!/bin/bash
cd "$(dirname "$0")"
electron-icon-builder --input=./source.png --output=./out
mv ./out/icons/mac/icon.icns ../icon.icns
mv ./out/icons/win/icon.ico ../icon.ico
rm -r ./out
