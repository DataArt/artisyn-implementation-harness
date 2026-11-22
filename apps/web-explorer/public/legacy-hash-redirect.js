// Old HashRouter links (#/get-started?…, #/inside-the-loop/<id>) land on the site root;
// send them to the matching path URL before the page hydrates. Plain in-page anchors
// such as #how-it-works are left alone. Injected into the landing <head> by the
// post-export step; an external file, so the CSP needs no hash for it.
(function () {
  var hash = window.location.hash;
  if (hash.indexOf('#/') !== 0) return;
  var script = document.currentScript;
  var base = script ? new URL('.', script.src).pathname : '/';
  var rest = hash.slice(2);
  var q = rest.indexOf('?');
  var path = q === -1 ? rest : rest.slice(0, q);
  var query = q === -1 ? '' : rest.slice(q + 1);
  if (path && path.charAt(path.length - 1) !== '/') path += '/';
  window.location.replace(base + path + (query ? '?' + query : ''));
})();
