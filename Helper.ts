import { Renderer } from "@k8slens/extensions";
import fs from 'fs';
import path from 'path';
import { Parser } from "simple-text-parser";
import getColors from 'get-image-colors';
import arrayBufferToBuffer from 'arraybuffer-to-buffer';

export class Helper {
    public static getCurrentClusterName() {
        try {
            return Renderer.Catalog.catalogEntities.activeEntity.metadata.name;
        } catch (err) { return null; }
    }
    public static getCurrentClusterId() {
        try {
            return Renderer.Catalog.catalogEntities.activeEntity.metadata.uid;
        } catch (err) { return null; }
    }
    public static registerStylesheetFromNodeModule(modulename: string, ...subpaths: string[]) {
        var dirPath = __dirname;
        if (dirPath.endsWith("dist")) {
            dirPath = path.dirname(dirPath);
        }
        var css = "";

        for (var subpath of subpaths) {
            const targetPath = path.join(dirPath, "node_modules", subpath);
            css += fs.readFileSync(targetPath, "utf8");
        }

        const customSelector = `.module_${modulename}`;
        const el = window.document.createElement("style");

        var p = new Parser();
        p.addRule(/,/g, null, "splitter");

        css = css.replace(/[^\{\}\n]+(?=\{)/gs, (match) => {
            var nodes = p.toTree(match);
            return nodes.map(text => {
                if (text.type === "text") {
                    text.text = customSelector + " " + text.text;
                }
                return text.text;
            }).join("");
        });
        el.innerText = css;
        if (window.document.head.children.length == 0) {
            window.document.head.insertBefore(el, window.document.head.children[0]);
        }
        else {
            window.document.head.appendChild(el);
        }
    }
    public static registerStylesheetFromCurrentDir(modulename: string, ...subpaths: string[]) {
        subpaths = subpaths.map(item => {
            return path.join("..", item);
        });
        return Helper.registerStylesheetFromNodeModule(modulename, ...subpaths);
    }
    public static async haveLogo(id: string): Promise<Boolean> {
        var dirpath = path.join(__dirname, "logos");
        if (!fs.existsSync(dirpath)) {
            fs.mkdirSync(dirpath);
        }
        var newPath = path.join(__dirname, "logos", id + ".png");
        var newPathSVG = path.join(__dirname, "logos", id + ".svg");
        if (fs.existsSync(newPath) || fs.existsSync(newPathSVG)) {
            return true;
        }
        else {
            return false;
        }
    }
    public static async cacheLogo(id: string, logo: string): Promise<{ logo: string, color: string }> {
        var buffer: Buffer = Buffer.from(new ArrayBuffer(0));
        var logoData: any = {};
        var dirpath = path.join(__dirname, "logos");
        if (!fs.existsSync(dirpath)) {
            fs.mkdirSync(dirpath);
        }
        var ext = logo && path.extname(logo).replace('.', '');
        if (!ext) {
            ext = fs.readdirSync(dirpath).filter(item => item.indexOf(id) > -1).map(item => path.extname(item).replace('.', ''))[0];
            console.log('EXT:', ext);
        }
        var newPath = path.join(__dirname, "logos", id + "." + ext);
        if (fs.existsSync(newPath)) {
            buffer = Buffer.from(fs.readFileSync(newPath, "binary"));
        }
        else {
            await fetch(logo, {
                method: 'get',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36',
                    'Accept': '*'
                }
            }).then(p => p.arrayBuffer()).then(p => buffer = Buffer.from(p)).catch(console.error);
            fs.writeFileSync(newPath, buffer, "binary");
        }
        /* await new Promise(async (resolve,reject)=>{
             await getColors(newPath).then(colors => {
                 logoData.color = colors[0].hex();
                 console.log(colors);
            }).catch(console.error);
            resolve(null);
         }).catch(console.error);*/
        logoData.ext = ext;
        logoData.logo = await getBase64Async(buffer, ext);
        return logoData;
    }
}

async function getBase64Async(file: Buffer, ext: string): Promise<string> {
    return new Promise((resolve) => {
        if (ext === 'svg') ext = 'svg+xml';

        resolve(`data:image/${ext};base64,` + file.toString('base64'));
    });
}