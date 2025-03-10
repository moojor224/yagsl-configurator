import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { DOMParser } from "linkedom";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workingDir = path.join(__dirname, "src/docs");
const indexHtml = path.join(workingDir, "index.html");
fs.mkdirSync(path.join(workingDir, "cdn"), { recursive: true });

const document = new DOMParser().parseFromString(fs.readFileSync(indexHtml, "utf-8"), "text/html");

/**
 * @param {string} tag
 * @param {string} property
 */
async function replacer(tag, property) {
    await Promise.all([...document.querySelectorAll(`${tag}[${property}]`)].map(async element => {
        const src = element.getAttribute(property);
        if (src === null) return;
        if (src.startsWith("http")) {
            // fetch and save in cdn
            await fetch(src).then(res => res.text()).then(async data => {
                const filename = src.split("/").pop();
                fs.writeFileSync(path.join(workingDir, "cdn", filename), data);
                element.setAttribute(property, "cdn/" + filename);
                if (src.endsWith(".css")) {
                    console.log("extracting urls from", src);
                    const urls = [].map(url => url.slice(4, -1));
                    data = data.replaceAll(/url\((.*?)\)/g, (match, ...groups) => {
                        if (groups[0].startsWith("data:")) return match;
                        const value = groups[0];
                        urls.push(value);
                        return `url(${value.split("/").pop()})`;
                    });
                    fs.writeFileSync(path.join(workingDir, "cdn", filename), data);
                    await Promise.all(urls.map(async (url) => {
                        const calced = new URL(url, src);
                        if (url.startsWith("..")) url = url.slice(3);
                        await fetch(calced).then(res => res.arrayBuffer()).then(data => {
                            const filename = url.split("/").pop();
                            try {
                                fs.writeFileSync(path.join(workingDir, "cdn", filename), Buffer.from(data));
                            } catch { }
                        });
                    }));
                }
            });
        }
    }));
}
await replacer("script", "src");
await replacer("link", "href");
fs.writeFileSync(indexHtml, document.documentElement.outerHTML);