# RESEEDER

a small script which searches folder/file locations for torrents, and then adds them to the client to seed.

# why?

my music and movie folders are split across multiple storage drives. whenever i reinstall or distro hop, etc. one of the more tedious things to is reseed everything. i decided to write out a couple more features and make this public. someone might find it helpful.

# install

run `npm install`

# usage

`npm start -i [torrent folder/file] -i [another torrent folder/file] -f [search path] -f [another search path]`

e.g. a folder of your snatches at a hypothetical `~/snatches`. you have media drives `/mnt/storage/movies`, `/mnt/storage_3/anime`. and you have one folder with mixed media in `~/Downloads`. invoke `npm start -i ~/snatches -f /mnt/storage/movies -f /mnt/storage_3/anime -f ~/Downloads --disable-popup --safe-add` and it will auto add them to qbittorrent. if it's a lot of files, disable-popup will add without the prompt for each one of them. safe-add will add them in a paused state. safe-add and disable-popup are qbittorrent only.

invoke `npm start` to read the other options.
