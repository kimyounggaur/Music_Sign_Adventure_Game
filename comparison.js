'use strict';
const frames = [...document.querySelectorAll('iframe')];
document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  document.body.dataset.view = button.dataset.view;
  document.querySelectorAll('[data-view]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
document.getElementById('reset').addEventListener('click', () => {
  // Re-enter the known fixture independently in each sandboxed game state.
  frames.forEach(frame => { frame.src = frame.getAttribute('src'); });
});
