(function () {
  "use strict";

  var src = document.getElementById("src");
  var out = document.getElementById("out");
  var drop = document.getElementById("drop");

  marked.setOptions({ gfm: true, breaks: false });

  // Render is debounced: typing fires per keystroke, and re-parsing a long
  // document on every one of them is what makes these editors feel sticky.
  var timer = null;
  function render() {
    var html = marked.parse(src.value || "");
    // marked does not sanitise by design. The content is usually your own, but
    // "preview a README somebody else wrote" is the whole point of a tool like
    // this, so it is cleaned before it reaches the DOM.
    out.innerHTML = DOMPurify.sanitize(html);
  }
  function schedule() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(render, 60);
  }

  src.addEventListener("input", schedule);

  function load(file) {
    if (!file) return;
    var r = new FileReader();
    r.onload = function () {
      src.value = r.result;
      render();
      src.scrollTop = 0;
      out.scrollTop = 0;
    };
    r.readAsText(file);
  }

  document.getElementById("file").addEventListener("change", function (e) {
    load(e.target.files[0]);
    e.target.value = "";           // so re-opening the same file fires again
  });

  document.getElementById("clear").addEventListener("click", function () {
    src.value = "";
    render();
    src.focus();
  });

  // Drop anywhere on the page, not just on a target the user has to find.
  var depth = 0;
  window.addEventListener("dragenter", function (e) {
    e.preventDefault(); depth++; drop.classList.add("show");
  });
  window.addEventListener("dragover", function (e) { e.preventDefault(); });
  window.addEventListener("dragleave", function () {
    depth--; if (depth <= 0) { depth = 0; drop.classList.remove("show"); }
  });
  window.addEventListener("drop", function (e) {
    e.preventDefault(); depth = 0; drop.classList.remove("show");
    load(e.dataTransfer.files[0]);
  });

  var EXAMPLE = [
    "# Markdown preview",
    "",
    "Paste markdown on the left. The formatted version appears on the right.",
    "",
    "Everything happens in your browser - nothing is uploaded, nothing is stored.",
    "",
    "## What is supported",
    "",
    "Standard GitHub-flavoured markdown:",
    "",
    "- lists, **bold**, _italic_, `inline code`",
    "- [links](https://dcorral.com) and images",
    "- tables, blockquotes and task lists",
    "",
    "| Feature | Works |",
    "| --- | :---: |",
    "| Tables | yes |",
    "| Code blocks | yes |",
    "",
    "> Drop a `.md` file anywhere on the page to open it.",
    "",
    "```js",
    "function hello(name) {",
    "  return `hello, ${name}`;",
    "}",
    "```",
    "",
    "- [x] split screen",
    "- [ ] anything else"
  ].join("\n");

  document.getElementById("example").addEventListener("click", function () {
    src.value = EXAMPLE;
    render();
  });

  // Explicit paste. The textarea has always accepted Ctrl/Cmd+V, but a pane
  // that arrives pre-filled reads as a demo rather than as an input, so the
  // action is spelled out. readText() needs a secure context and permission,
  // and Firefox refuses it outright - so failure falls back to focusing the
  // box and telling the user to use the keyboard, never to a dead button.
  document.getElementById("paste").addEventListener("click", function () {
    if (!navigator.clipboard || !navigator.clipboard.readText) return manualPaste();
    navigator.clipboard.readText().then(function (text) {
      if (!text) return manualPaste();
      src.value = text;
      render();
      src.scrollTop = 0;
    }).catch(manualPaste);
  });

  function manualPaste() {
    src.focus();
    src.select();
    flash("Press " + (navigator.platform.indexOf("Mac") === 0 ? "Cmd" : "Ctrl") + "+V to paste");
  }

  var noteTimer = null;
  function flash(msg) {
    var n = document.getElementById("note");
    n.textContent = msg;
    n.hidden = false;
    if (noteTimer) clearTimeout(noteTimer);
    noteTimer = setTimeout(function () { n.hidden = true; }, 3000);
  }

  render();
})();
