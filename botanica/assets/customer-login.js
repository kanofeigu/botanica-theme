/* Botanica v3 — Customer login view switcher
   Toggles between the login view and the password-recovery view on
   /account/login, driven by the URL hash (#recover / #login).
   Progressive enhancement: without JS both views render stacked and the
   #recover anchor still scrolls to the recovery form. No animations, so
   prefers-reduced-motion needs no special handling. */
(function () {
  var roots = document.querySelectorAll('[data-bt-login]');
  if (!roots.length) return;

  roots.forEach(function (root) {
    var loginView = root.querySelector('[data-bt-login-view="login"]');
    var recoverView = root.querySelector('[data-bt-login-view="recover"]');
    if (!loginView || !recoverView) return;

    function sync() {
      // Show the recovery view for #recover, or after a successful recovery
      // post (Shopify redirects back to /account/login without the hash).
      var showRecover =
        window.location.hash === '#recover' ||
        recoverView.querySelector('.bt-form-success') !== null;
      loginView.hidden = showRecover;
      recoverView.hidden = !showRecover;
    }

    window.addEventListener('hashchange', sync);
    sync();
  });
})();
