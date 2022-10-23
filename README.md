# Custom Wordle

A [wordle](https://www.powerlanguage.co.uk/wordle/) clone where you can set a word and send it to others!  


### Build dependencies
```
npm install --global @swc/cli @swc/core

# Only needed for `--serve` mode
npm install --global chokidar
```

### Develop Locally
```shell
# Runs on http://localhost:8000/src/
./ctl.sh --serve
```

### Build for production
```shell
# One of compilation of app for deployment
./ctl.sh --build
cp -r src/* /data/www/wordle.danstewart.xyz/
```

## Screenshots

![image](https://user-images.githubusercontent.com/10670565/197400983-efded70a-1fb1-4425-bc5c-8dc3ff4ac8dd.png)
![image](https://user-images.githubusercontent.com/10670565/197400998-c4bbac86-e9a9-4f07-82d6-fa3b869f187e.png)


