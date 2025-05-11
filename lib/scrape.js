const path = require('node:path');
const fs = require('node:fs');
const { promisify } = require('node:util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const Scandir = async (dir) => {
    let subdirs = await readdir(path.resolve(dir));
    let files = await Promise.all(
        subdirs.map(async (subdir) => {
            let res = path.resolve(path.resolve(dir), subdir);
            return (await stat(res)).isDirectory() ? Scandir(res) : res;
        }),
    );
    return files.reduce((a, f) => a.concat(f), []);
};

class Scraper {
    #src;
    constructor(dir) {
        this.dir = dir;
        this.#src = {};
    }
    
    load = async () => {
        let data = await Scandir('./lib/scrape_file');
        for (let i of data) {
            let name = i.split('/').pop().replace('.js', '');
            try {
                if (!i.endsWith('.js')) return;
                this.#src[name] = require(i);
            } catch (e) {
                console.log(`Failed to load Scraper : ${e}`);
                delete this.#src[name];
            }
        }
        return this.#src;
    };
    
    list = () => this.#src;
}

module.exports = Scraper;