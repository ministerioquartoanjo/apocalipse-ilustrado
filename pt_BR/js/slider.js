(function () {
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function initSlider(root) {
    var viewport = root.querySelector('.mqa-slider__viewport');
    var track = root.querySelector('.mqa-slider__track');
    var slides = Array.prototype.slice.call(root.querySelectorAll('.mqa-slider__slide'));
    var btnPrev = root.querySelector('.mqa-slider__btn--prev');
    var btnNext = root.querySelector('.mqa-slider__btn--next');
    var btnFs = root.querySelector('.mqa-slider__btn--fs');
    var counter = root.querySelector('.mqa-slider__counter');
    var hint = root.querySelector('.mqa-slider__hint');

    if (!viewport || !track || slides.length === 0) return;

    var index = 0;
    var total = slides.length;

    var counterDragging = false;

    function update() {
      track.style.transform = 'translate3d(' + (-index * 100) + '%, 0, 0)';
      if (counter) counter.textContent = (index + 1) + ' / ' + total;
      if (btnPrev) btnPrev.disabled = index === 0;
      if (btnNext) btnNext.disabled = index === total - 1;
    }

    function isFullscreen() {
      return document.fullscreenElement === root;
    }

    function setHint(msg) {
      if (!hint) return;
      if (!msg) {
        hint.style.display = 'none';
        hint.textContent = '';
        return;
      }
      hint.textContent = msg;
      hint.style.display = 'flex';
    }

    async function lockLandscape() {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('landscape');
          return true;
        }
      } catch (e) {
      }
      return false;
    }

    async function unlockOrientation() {
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      } catch (e) {
      }
    }

    async function enterFullscreen() {
      if (!root.requestFullscreen) {
        setHint('Tela cheia não suportada neste navegador');
        return;
      }

      try {
        await root.requestFullscreen();
      } catch (e) {
        return;
      }

      root.classList.add('is-fullscreen');
      var locked = await lockLandscape();
      if (!locked) {
        setHint('Gire o celular para paisagem');
      } else {
        setHint('');
      }
    }

    async function exitFullscreen() {
      try {
        await unlockOrientation();
      } catch (e) {
      }

      try {
        if (document.exitFullscreen) await document.exitFullscreen();
      } catch (e) {
      }

      root.classList.remove('is-fullscreen');
      setHint('');
    }

    function bindFullscreen() {
      if (!btnFs) return;

      btnFs.addEventListener('click', function () {
        if (isFullscreen()) exitFullscreen();
        else enterFullscreen();
      });

      document.addEventListener('fullscreenchange', function () {
        if (isFullscreen()) root.classList.add('is-fullscreen');
        else {
          root.classList.remove('is-fullscreen');
          setHint('');
          unlockOrientation();
        }
      });
    }

    function getStorageKey() {
      return 'mqa_slider_counter_pos:' + window.location.pathname;
    }

    function applyCounterPos(pos) {
      if (!counter) return;
      if (!pos) return;

      counter.style.left = pos.left;
      counter.style.top = pos.top;
      counter.style.right = 'auto';
      counter.style.bottom = 'auto';
    }

    function clampCounterToSlider() {
      if (!counter) return;
      var sliderRect = root.getBoundingClientRect();
      var counterRect = counter.getBoundingClientRect();

      var left = counterRect.left - sliderRect.left;
      var top = counterRect.top - sliderRect.top;

      left = clamp(left, 6, sliderRect.width - counterRect.width - 6);
      top = clamp(top, 6, sliderRect.height - counterRect.height - 6);

      counter.style.left = left + 'px';
      counter.style.top = top + 'px';
      counter.style.right = 'auto';
      counter.style.bottom = 'auto';

      try {
        localStorage.setItem(getStorageKey(), JSON.stringify({ left: counter.style.left, top: counter.style.top }));
      } catch (e) {
      }
    }

    function initDraggableCounter() {
      if (!counter) return;

      try {
        var raw = localStorage.getItem(getStorageKey());
        if (raw) applyCounterPos(JSON.parse(raw));
      } catch (e) {
      }

      var startX = 0;
      var startY = 0;
      var startLeft = 0;
      var startTop = 0;

      function getLeftTop() {
        var sliderRect = root.getBoundingClientRect();
        var counterRect = counter.getBoundingClientRect();
        return {
          left: counterRect.left - sliderRect.left,
          top: counterRect.top - sliderRect.top,
        };
      }

      counter.addEventListener('pointerdown', function (e) {
        counterDragging = true;
        e.preventDefault();
        e.stopPropagation();

        var lt = getLeftTop();
        startLeft = lt.left;
        startTop = lt.top;
        startX = e.clientX;
        startY = e.clientY;

        counter.setPointerCapture(e.pointerId);
      });

      counter.addEventListener('pointermove', function (e) {
        if (!counterDragging) return;
        e.preventDefault();
        e.stopPropagation();

        var dx = e.clientX - startX;
        var dy = e.clientY - startY;
        counter.style.left = (startLeft + dx) + 'px';
        counter.style.top = (startTop + dy) + 'px';
        counter.style.right = 'auto';
        counter.style.bottom = 'auto';
      });

      function end(e) {
        if (!counterDragging) return;
        counterDragging = false;
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        clampCounterToSlider();
      }

      counter.addEventListener('pointerup', end);
      counter.addEventListener('pointercancel', end);
      window.addEventListener('resize', function () {
        clampCounterToSlider();
      });
    }

    function goTo(nextIndex) {
      index = clamp(nextIndex, 0, total - 1);
      update();
    }

    if (btnPrev) btnPrev.addEventListener('click', function () { goTo(index - 1); });
    if (btnNext) btnNext.addEventListener('click', function () { goTo(index + 1); });

    var startX = 0;
    var startY = 0;
    var dx = 0;
    var dy = 0;
    var dragging = false;

    viewport.addEventListener('pointerdown', function (e) {
      if (counterDragging) return;
      dragging = true;
      dx = 0;
      dy = 0;
      startX = e.clientX;
      startY = e.clientY;
      viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      if (counterDragging) return;
      dx = e.clientX - startX;
      dy = e.clientY - startY;
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;

      if (Math.abs(dy) > Math.abs(dx)) return;

      var threshold = 40;
      if (dx <= -threshold) goTo(index + 1);
      else if (dx >= threshold) goTo(index - 1);
    }

    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    initDraggableCounter();
    bindFullscreen();
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var sliders = document.querySelectorAll('[data-mqa-slider]');
    for (var i = 0; i < sliders.length; i++) initSlider(sliders[i]);
  });
})();
