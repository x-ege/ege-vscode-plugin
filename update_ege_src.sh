#!/usr/bin/env bash

cd "$(dirname "$0")"

if [[ -n "$1" ]]; then
    export XEGE_DIR="$1"
else
    export XEGE_DIR="../xege"
fi

XEGE_DIR=$(realpath "$XEGE_DIR")

if [[ ! -e "$XEGE_DIR/.git" ]]; then
    echo "The xege repository is not initialized. Please clone it first."
    exit 1
fi

echo "Find xege repository at $XEGE_DIR"

cd bundle/ege_src || exit 1

# 拷贝 ege 源代码
rm -rf ./src ./include ./CMakeLists.txt
cp -rf "$XEGE_DIR/src" ./src
cp -rf "$XEGE_DIR/include" ./include
cp -rf "$XEGE_DIR/CMakeLists.txt" ./CMakeLists.txt

# 拷贝第三方 - ccap
rm -rf ./3rdparty/ccap/
rsync -av --exclude='tests' --exclude='examples' --exclude='scripts' --exclude='.*' "$XEGE_DIR/3rdparty/ccap/" ./3rdparty/ccap/

# 拷贝第三方 - libpng
rm -rf ./3rdparty/libpng/
rsync -av --exclude='.*' --exclude='*.png' --exclude='libtests' --exclude='examples' --exclude='pngsuite' --exclude='tests' "$XEGE_DIR/3rdparty/libpng/" ./3rdparty/libpng/

# 拷贝第三方 - zlib
rm -rf ./3rdparty/zlib/
rsync -av --exclude='.*' --exclude='doc' --exclude='examples' --exclude='test' --exclude='testzlib' --exclude='dotzlib' "$XEGE_DIR/3rdparty/zlib/" ./3rdparty/zlib/

du -h -d 2 | sort -h
