/* i18n.js — 个人网站三语切换运行时
 *
 * 用法:
 *   <html lang="zh-CN">  ← 默认 lang
 *   <span data-i18n="nav.home">首页</span>
 *   <input data-i18n-attr="placeholder" data-i18n="search.placeholder">
 *
 * 自动:
 *   - 读 localStorage('site-lang') → 没有则用 navigator.language → fallback 'zh'
 *   - fetch lang/{lang}.json，对 [data-i18n] 元素写入翻译
 *   - 监听 .lang-switcher 按钮，点击切换并持久化
 */

(function () {
  'use strict';

  const SUPPORTED = ['zh', 'en', 'de'];
  const DEFAULT_LANG = 'zh';
  const STORAGE_KEY = 'site-lang';

  // 计算 lang/ 目录的相对路径（兼容 posts/ 子目录里的页面）
  // 通过 <script src="i18n.js"> 或 <script src="../i18n.js"> 推断
  function detectBasePath() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].getAttribute('src') || '';
      if (src.endsWith('i18n.js')) {
        return src.slice(0, -('i18n.js'.length)); // '' 或 '../'
      }
    }
    return '';
  }
  const BASE = detectBasePath();

  function detectInitialLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED.indexOf(stored) >= 0) return stored;

    const nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (nav.indexOf('zh') === 0) return 'zh';
    if (nav.indexOf('de') === 0) return 'de';
    if (nav.indexOf('en') === 0) return 'en';
    return DEFAULT_LANG;
  }

  // 从 dotted key 'a.b.c' 取 dict.a.b.c
  function getByPath(obj, path) {
    const parts = path.split('.');
    let cur = obj;
    for (let i = 0; i < parts.length; i++) {
      if (cur == null) return null;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function applyTranslations(dict) {
    // 处理 [data-i18n]：默认替换 textContent
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getByPath(dict, key);
      if (typeof val !== 'string') return;

      // 如果有 data-i18n-attr，写进对应属性而不是 textContent
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, val);
      } else {
        // 支持简单 HTML（用 \n 换行 → <br>）
        if (val.indexOf('\n') >= 0) {
          el.innerHTML = val
            .split('\n')
            .map(escapeHtml)
            .join('<br>');
        } else {
          el.textContent = val;
        }
      }
    });

    // <title> 单独处理
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
      const key = titleEl.getAttribute('data-i18n');
      const val = getByPath(dict, key);
      if (typeof val === 'string') document.title = val;
    }
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function setHtmlLang(lang) {
    const map = { zh: 'zh-CN', en: 'en', de: 'de' };
    document.documentElement.setAttribute('lang', map[lang] || 'zh-CN');
  }

  function highlightSwitcher(lang) {
    document.querySelectorAll('.lang-switcher [data-lang]').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  let cache = {};

  async function loadLang(lang) {
    if (cache[lang]) return cache[lang];
    try {
      const res = await fetch(BASE + 'lang/' + lang + '.json', { cache: 'force-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const dict = await res.json();
      cache[lang] = dict;
      return dict;
    } catch (err) {
      console.warn('[i18n] failed to load', lang, err);
      return null;
    }
  }

  async function setLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0) lang = DEFAULT_LANG;
    const dict = await loadLang(lang);
    if (!dict) return;
    setHtmlLang(lang);
    applyTranslations(dict);
    highlightSwitcher(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }

  // 委托：一个全局监听器处理所有 .lang-switcher 按钮
  document.addEventListener('click', e => {
    const btn = e.target.closest('.lang-switcher [data-lang]');
    if (!btn) return;
    e.preventDefault();
    const lang = btn.getAttribute('data-lang');
    setLang(lang);
  });

  // 初始化
  function init() {
    const lang = detectInitialLang();
    setLang(lang);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
