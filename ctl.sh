#!/usr/bin/env bash

# Actions
serve=0
build=0
help=0

while [[ "$#" -gt 0 ]]; do
	case "$1" in
		--serve) serve=1 ;;
		--build) build=1 ;;
		-h|--help) help=1 ;;
		--) shift; break ;;
	esac

	shift
done

if [[ $help == 1 ]] || [[ $serve == 1 && $build == 1 ]]; then
    echo "Usage: ./ctl.sh [--serve] [--build] [--help]"
    echo ""
    echo "--server: Serve the app for local development on http://localhost:8000"
    echo "          JavaScript will be live transpiled"
    echo "--build:  Build the app for production"
    echo "--help:   Show this help text"
    exit 0
fi


if [[ $serve == 1 ]]; then
    # Transpile JS
    swc --watch src/js --out-dir src/build/ &

    # Serve
    echo "Starting server at http://localhost:8000"
    cd src
    python3 -m http.server
fi

if [[ $build == 1 ]]; then
    swc src/js --out-dir src/build/
fi
