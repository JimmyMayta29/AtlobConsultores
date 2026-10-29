const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function element(attrs = {}) {
  const listeners = {};
  const classes = new Set();
  return {
    attrs, classes,
    addEventListener(name, fn) { (listeners[name] ||= []).push(fn); },
    emit(name, event = {}) { (listeners[name] || []).forEach(fn => fn(event)); },
    getAttribute: name => attrs[name],
    setAttribute: (name, value) => { attrs[name] = value; },
    removeAttribute: name => { delete attrs[name]; },
    get href() { return attrs.href; }, set href(value) { attrs.href = value; },
    focus() { this.focused = true; },
    classList: {
      toggle(name, active) { if (active) classes.add(name); else classes.delete(name); },
      add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name)
    }
  };
}

async function loadLayout(base, page) {
  const links = ['/index.html#servicios', '/index.html#dashboard-demo', '/nosotros.html', '/revista/index.html', '/contacto.html'].map(href => element({ href }));
  const footerLinks = ['/rss.xml', 'mailto:contacto@atlob.pe', 'javascript:void(0)', '#local', '//cdn.example.com/file'].map(href => element({ href }));
  const controls = { '.menu-toggle': element({ 'aria-expanded': 'false' }), '.nav-center': element(), '.nav-right': element(), '.whatsapp-float': element() };
  const containers = { 'header-container': { querySelectorAll: () => links }, 'footer-container': { querySelectorAll: () => footerLinks } };
  const document = Object.assign(element(), {
    currentScript: { src: new URL('js/layout-loader.js', base).href },
    getElementById: id => containers[id] || null,
    querySelector: selector => controls[selector] || null,
    querySelectorAll: () => links
  });
  const media = element();
  const window = Object.assign(element(), { location: new URL(page), matchMedia: () => media });
  const requests = [];
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../Front-end/js/layout-loader.js'), 'utf8'), {
    document, window, URL, console,
    fetch: async url => { requests.push(String(url)); return { ok: true, text: async () => '' }; }
  });
  document.emit('DOMContentLoaded');
  await new Promise(setImmediate);
  return { links, footerLinks, controls, requests, document, window, media };
}

function checkSavedCookiePreferences() {
  const nodes = {};
  let saved = JSON.stringify({ necessary: true, analytics: false, preferences: true });
  const document = Object.assign(element(), {
    readyState: 'complete', getElementById: id => nodes[id] || null,
    body: {
      style: { overflow: 'auto' },
      insertAdjacentHTML(position, html) {
        for (const match of html.matchAll(/id="([^"]+)"/g)) {
          const node = nodes[match[1]] = element();
          node.isConnected = true;
          node.focus = () => { document.activeElement = node; };
        }
        nodes['atlob-cookie-modal'].querySelectorAll = () => ['btn-cookie-modal-close', 'cookie-opt-analytics', 'cookie-opt-preferences', 'btn-cookie-save-preferences'].map(id => nodes[id]);
      }
    }
  });
  const opener = { isConnected: true, focus() { document.activeElement = this; } };
  document.activeElement = opener;
  const updates = [];
  const window = { dispatchEvent: event => updates.push(event.detail) };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../Front-end/js/cookie-consent.js'), 'utf8'), {
    document, window, console, setTimeout: () => 0,
    localStorage: { getItem: () => saved, setItem: (key, value) => { saved = value; } },
    CustomEvent: function (type, options) { this.detail = options.detail; }
  });
  assert.equal(nodes['atlob-cookie-banner'], undefined);
  assert.equal(nodes['atlob-cookie-modal'], undefined);
  window.atlobCookieConsent.openSettings();
  assert.equal(nodes['atlob-cookie-banner'], undefined);
  assert.equal(nodes['cookie-opt-analytics'].checked, false);
  assert.equal(nodes['cookie-opt-preferences'].checked, true);
  assert.equal(document.activeElement, nodes['btn-cookie-modal-close']);
  document.emit('keydown', { key: 'Tab', shiftKey: true, preventDefault() {} });
  assert.equal(document.activeElement, nodes['btn-cookie-save-preferences']);
  document.emit('keydown', { key: 'Tab', shiftKey: false, preventDefault() {} });
  assert.equal(document.activeElement, nodes['btn-cookie-modal-close']);
  document.emit('keydown', { key: 'Escape', preventDefault() {} });
  assert.equal(document.activeElement, opener);
  assert.equal(nodes['atlob-cookie-modal'].attrs['aria-hidden'], 'true');
  assert.equal(document.body.style.overflow, 'auto');
  window.atlobCookieConsent.openSettings();
  nodes['cookie-opt-analytics'].checked = true;
  nodes['btn-cookie-save-preferences'].emit('click');
  assert.equal(JSON.parse(saved).analytics, true);
  assert.equal(JSON.parse(saved).preferences, true);
  assert.equal(JSON.parse(saved).necessary, true);
  assert.equal(updates.length, 1);
  assert.equal(document.activeElement, opener);
}

function checkAccordionAndCounters() {
  const panels = Array.from({ length: 4 }, () => element());
  panels[0].classList.add('is-active');
  const decorative = Object.assign(element(), { textContent: '01' });
  const counted = Object.assign(element({ 'data-target': '25', 'data-suffix': '%' }), { textContent: '25%' });
  const invalid = Object.assign(element({ 'data-count': 'invalid' }), { textContent: 'Sin datos' });
  const stats = [decorative, counted, invalid];
  const document = Object.assign(element(), {
    activeElement: null,
    getElementById: () => null,
    querySelectorAll(selector) {
      if (selector === '.service-accordion-panel') return panels;
      if (selector.includes('.stat-number')) {
        return stats.filter(node => selector.split(',').some(part => {
          const attribute = part.match(/\[([^\]]+)\]/)?.[1];
          return !attribute || node.getAttribute(attribute) !== undefined;
        }));
      }
      return [];
    }
  });
  const link = element();
  const parent = { contains: node => panels.includes(node) || node === link };
  for (const panel of panels) {
    panel.parentElement = parent;
    panel.focus = () => { document.activeElement = panel; panel.emit('focusin'); };
  }
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.nodes = []; observers.push(this); }
    observe(node) { this.nodes.push(node); }
    unobserve() {}
  }
  const window = Object.assign(element(), {
    IntersectionObserver: Observer,
    matchMedia: () => ({ matches: true })
  });
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../Front-end/js/main.js'), 'utf8'), {
    document, window, IntersectionObserver: Observer,
    performance: { now: () => 0 }, requestAnimationFrame: callback => callback(0), setTimeout
  });
  document.emit('DOMContentLoaded');
  const counters = observers.find(observer => observer.nodes.includes(counted));
  assert.ok(counters, 'Numeric targets must be observed');
  assert.equal(counters.nodes.includes(decorative), false, 'Decorative numbers must never enter the counter');
  counters.callback(counters.nodes.map(target => ({ target, isIntersecting: true })));
  assert.equal(decorative.textContent, '01');
  assert.equal(counted.textContent, '25%');
  assert.equal(invalid.textContent, 'Sin datos');

  const activeIndex = () => panels.findIndex(panel => panel.classes.has('is-active'));
  panels[1].emit('click');
  assert.equal(activeIndex(), 1);
  panels[2].focus();
  assert.equal(activeIndex(), 2);
  let prevented = false;
  panels[2].emit('keydown', { key: 'Enter', target: link, preventDefault() { prevented = true; } });
  assert.equal(prevented, false, 'Enter on a descendant link must retain native navigation');
  panels[2].emit('keydown', { key: 'ArrowRight', target: panels[2], preventDefault() { prevented = true; } });
  assert.ok(prevented);
  assert.equal(document.activeElement, panels[3]);
  assert.equal(activeIndex(), 3);
  panels[3].emit('keydown', { key: 'ArrowRight', target: panels[3], preventDefault() {} });
  assert.equal(activeIndex(), 0, 'Arrow navigation wraps to the first service');
  panels[0].emit('keydown', { key: 'End', target: panels[0], preventDefault() {} });
  assert.equal(activeIndex(), 3);
  panels[0].emit('mouseenter');
  assert.equal(activeIndex(), 3, 'Hover must not hide the service containing keyboard focus');
  document.activeElement = null;
  panels[0].emit('mouseenter');
  assert.equal(activeIndex(), 0);
}

function checkServiceModalFocus() {
  const modal = element({ 'aria-hidden': 'true' });
  const title = element();
  const description = element();
  const list = element();
  const button = element();
  const close = element();
  const card = element({ 'data-service': 'outsourcing-contable' });
  const opener = element();
  const nodes = { serviceModal: modal, modalTitle: title, modalDescription: description, modalList: list };
  const document = Object.assign(element(), {
    body: { style: { overflow: 'scroll' } },
    getElementById: id => nodes[id],
    querySelector: selector => ({ '.modal-btn': button, '.close-modal': close })[selector],
    querySelectorAll: () => [card, opener]
  });
  card.closest = () => card;
  opener.closest = () => card;
  card.querySelector = () => opener;
  modal.querySelectorAll = () => [close, button];
  [opener, close, button].forEach(node => { node.focus = () => { document.activeElement = node; }; });
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../Front-end/js/servicios.js'), 'utf8'), { document });
  document.emit('DOMContentLoaded');
  opener.focus();
  opener.emit('click', { currentTarget: opener, stopPropagation() {} });
  assert.equal(modal.attrs['aria-hidden'], 'false');
  assert.equal(document.activeElement, close);
  assert.equal(document.body.style.overflow, 'hidden');
  assert.equal(title.textContent, 'Outsourcing Contable y Tributario');
  assert.ok(button.href.startsWith('https://wa.me/51940781298?text='));
  assert.equal(button.rel, 'noopener noreferrer');
  document.emit('keydown', { key: 'Tab', shiftKey: true, preventDefault() {} });
  assert.equal(document.activeElement, button);
  document.emit('keydown', { key: 'Tab', shiftKey: false, preventDefault() {} });
  assert.equal(document.activeElement, close);
  document.emit('keydown', { key: 'Escape', preventDefault() {} });
  assert.equal(modal.attrs['aria-hidden'], 'true');
  assert.equal(document.activeElement, opener);
  assert.equal(document.body.style.overflow, 'scroll');
  card.emit('click', { currentTarget: card, stopPropagation() {} });
  modal.emit('click', { target: modal });
  assert.equal(document.activeElement, opener, 'Clicking a card restores focus to its actionable button');
  assert.equal(modal.attrs['aria-hidden'], 'true');
}

(async () => {
  for (const [base, page, active] of [
    ['https://example.com/', 'https://example.com/index.html#servicios', 0],
    ['https://example.com/', 'https://example.com/revista/posts/articulo.html', 3],
    ['https://example.com/AtlobConsultores/', 'https://example.com/AtlobConsultores/revista/posts/articulo.html', 3]
  ]) {
    const result = await loadLayout(base, page);
    assert.deepEqual(result.requests, ['Components/header.html', 'Components/footer.html'].map(file => new URL(file, base).href));
    assert.equal(result.links[4].href, new URL('contacto.html', base).href);
    assert.equal(result.footerLinks[0].href, new URL('rss.xml', base).href);
    assert.deepEqual(result.footerLinks.slice(1).map(link => link.href), ['mailto:contacto@atlob.pe', 'javascript:void(0)', '#local', '//cdn.example.com/file']);
    assert.deepEqual(result.links.map(link => link.classes.has('is-active')), result.links.map((_, index) => index === active));
    assert.ok(result.links[active].attrs['aria-current']);
  }

  // Static articles have layout-loader but no main.js: their menu must still work.
  const { controls, document, window, media, links } = await loadLayout('https://example.com/', 'https://example.com/index.html#servicios');
  const toggle = controls['.menu-toggle'];
  toggle.emit('click');
  assert.equal(toggle.attrs['aria-expanded'], 'true');
  assert.equal(toggle.attrs['aria-label'], 'Cerrar menú de navegación');
  assert.ok(controls['.nav-center'].classes.has('active'));
  let prevented = false;
  document.emit('keydown', { key: 'Escape', preventDefault() { prevented = true; } });
  assert.ok(prevented && toggle.focused);
  assert.equal(toggle.attrs['aria-expanded'], 'false');
  toggle.emit('click');
  document.emit('click', { target: { closest: () => null } });
  assert.equal(toggle.attrs['aria-expanded'], 'false');
  toggle.emit('click');
  document.emit('click', { target: { closest: () => links[0] } });
  assert.equal(toggle.attrs['aria-expanded'], 'false');
  toggle.emit('click');
  media.emit('change', { matches: false });
  assert.equal(toggle.attrs['aria-expanded'], 'false');
  assert.equal(controls['.nav-right'].classes.has('active'), false);
  window.location.hash = '#dashboard-demo';
  window.emit('hashchange');
  assert.equal(links[0].classes.has('is-active'), false);
  assert.equal(links[1].classes.has('is-active'), true);
  checkSavedCookiePreferences();
  checkAccordionAndCounters();
  checkServiceModalFocus();
  console.log('PASS: layout paths, article navigation, mobile menu, section state, saved cookie preferences, service accordion, counters, and service modal focus.');
})().catch(error => { console.error(error); process.exitCode = 1; });
