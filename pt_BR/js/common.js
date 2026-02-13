(function () {
  try {
    window.ga = window.ga || function () {
      (ga.q = ga.q || []).push(arguments);
    };
    ga.l = +new Date();

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.google-analytics.com/analytics.js';
    var m = document.getElementsByTagName('script')[0];
    m.parentNode.insertBefore(s, m);

    ga('create', 'UA-50196377-2', 'advertenciafinal.com.br');
    ga('send', 'pageview');
  } catch (e) {
  }
})();
