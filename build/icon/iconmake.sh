mkdir source.iconset
sips -z 16 16     source.png --out source.iconset/icon_16x16.png
sips -z 32 32     source.png --out source.iconset/icon_16x16@2x.png
sips -z 32 32     source.png --out source.iconset/icon_32x32.png
sips -z 64 64     source.png --out source.iconset/icon_32x32@2x.png
sips -z 128 128   source.png --out source.iconset/icon_128x128.png
sips -z 256 256   source.png --out source.iconset/icon_128x128@2x.png
sips -z 256 256   source.png --out source.iconset/icon_256x256.png
sips -z 512 512   source.png --out source.iconset/icon_256x256@2x.png
sips -z 512 512   source.png --out source.iconset/icon_512x512.png
sips -z 1024 1024 source.png --out source.iconset/icon_512x512@2x.png
iconutil -c icns source.iconset
mv source.icns ../opendarkroom.icns
rm -R source.iconset
