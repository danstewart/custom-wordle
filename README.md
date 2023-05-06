# Custom Wordle

A [wordle](https://www.powerlanguage.co.uk/wordle/) clone where you can set a word and send it to others!

### Build dependencies

Tooling dependencies are managed using [hermit](https://cashapp.github.io/hermit/).

```
source ./bin/activate-hermit

npm install @swc/cli @swc/core

# Only needed for `--serve` mode
npm install chokidar
```

### Develop Locally

```shell
# Runs on http://localhost:8000/src/
./ctl.sh --serve
```

### Deploy

```shell
# Deploy to https://wordle.danstewart.xyz
./ctl.sh --deploy
```

## Screenshots

![image](https://user-images.githubusercontent.com/10670565/197400983-efded70a-1fb1-4425-bc5c-8dc3ff4ac8dd.png)
![image](https://user-images.githubusercontent.com/10670565/197400998-c4bbac86-e9a9-4f07-82d6-fa3b869f187e.png)
