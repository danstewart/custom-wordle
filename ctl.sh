#!/usr/bin/env bash

# Actions
serve=0
build=0
deploy=0
help=0

while [[ "$#" -gt 0 ]]; do
	case "$1" in
		--serve) serve=1 ;;
		--build) build=1 ;;
        --deploy) build=1; deploy=1 ;;
		-h|--help) help=1 ;;
		--) shift; break ;;
	esac

	shift
done

if [[ $help == 1 ]] || [[ $serve == 1 && $build == 1 ]] || [[ $serve == 0 && $build == 0 ]]; then
    echo "Usage: ./ctl.sh [--serve] [--build] [--help]"
    echo ""
    echo "--serve:  Serve the app for local development on http://localhost:8000"
    echo "          JavaScript will be live transpiled"
    echo "--build:  Build the app for production"
    echo "--help:   Show this help text"
    exit 0
fi


if [[ $serve == 1 ]]; then
    # Transpile JS
    npx swc src/js --out-dir src/build/ --watch &

    # Serve
    echo "Starting server at http://localhost:8000"
    cd src
    python3 -m http.server
fi

if [[ $build == 1 ]]; then
    npx swc src/js --out-dir src/build/
fi

if [[ $deploy == 1 ]]; then
    scp -r src/* 192.168.4.72:/data/www/wordle.danstewart.xyz/
fi
