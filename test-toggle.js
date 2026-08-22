const fs = require("fs"), vm = require("vm");
function classList() {
  const set = new Set();
  return { add: (...c) => c.forEach(x => set.add(x)), remove: (...c) => c.forEach(x => set.delete(x)),
           contains: c => set.has(c), _set: set };
}
function el(extra = {}) {
  const h = {};
  return Object.assign({ value: "", innerHTML: "", textContent: "", hidden: true, scrollTop: 0,
    classList: classList(), dataset: {}, _h: h,
    addEventListener: (t, f) => { (h[t] = h[t] || []).push(f); },
    setAttribute(k, v) { this[k] = v; }, focus() { this._focused = true; }, select() {} }, extra);
}
const src = el(), out = el(), drop = el(), note = el(), file = el(), clear = el(), paste = el(), example = el();
const main = el();
const bSrc = el({ dataset: { pane: "src" } }), bOut = el({ dataset: { pane: "out" } });
const byId = { src, out, drop, note, file, clear, paste, example };
const doc = {
  getElementById: id => byId[id],
  querySelector: () => main,
  querySelectorAll: () => [bSrc, bOut],
  addEventListener: (t, f) => { (doc._h = doc._h || {})[t] = f; },
};
const ctx = { document: doc, window: { addEventListener: () => {} }, navigator: { platform: "Linux", clipboard: null },
  setTimeout: () => 0, clearTimeout: () => {}, FileReader: function () {}, console };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync("./vendor/marked.min.js", "utf8"), ctx);
ctx.DOMPurify = { sanitize: h => h };
vm.runInContext(fs.readFileSync("./app.js", "utf8"), ctx);

let pass = 0, fail = 0;
const is = (label, got, want) => { const ok = got === want;
  console.log("  " + (ok ? "ok  " : "FAIL") + "  " + label + (ok ? "" : `  (got ${got}, want ${want})`));
  ok ? pass++ : fail++; };

const clickSrc = () => bSrc._h.click[0]();
const clickOut = () => bOut._h.click[0]();
const esc = () => doc._h.keydown({ key: "Escape" });

is("starts with neither pane focused", main.classList._set.size, 0);
clickSrc();
is("expand editor -> focus-src", main.classList.contains("focus-src"), true);
is("editor button marked pressed", bSrc["aria-pressed"], "true");
is("preview button not pressed", bOut["aria-pressed"], "false");
clickSrc();
is("clicking again restores split", main.classList._set.size, 0);
clickOut();
is("expand preview -> focus-out", main.classList.contains("focus-out"), true);
clickSrc();
is("switching panes drops the old class", main.classList.contains("focus-out"), false);
is("switching panes sets the new one", main.classList.contains("focus-src"), true);
esc();
is("Escape exits full screen", main.classList._set.size, 0);
is("Escape resets the button state", bSrc["aria-pressed"], "false");
console.log(`\n  passed ${pass}, failed ${fail}`);
process.exit(fail ? 1 : 0);
