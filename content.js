(() => {
  const KEY = "shortsBlockerEnabled";
  const SHORTS_PREFIX = "/shorts";
  const CHANNEL_SHORTS_PATTERN = /^\/(@[^/]+|channel\/[^/]+|c\/[^/]+|user\/[^/]+)\/shorts(\/|$)/;
  let enabled = true;
  let lastPath = location.pathname;

  const getEnabled = async () => {
    const data = await chrome.storage.local.get(KEY);
    return data[KEY] ?? true;
  };

  const isShorts = (p) =>
    !!p &&
    (p.startsWith(SHORTS_PREFIX) ||
      p.startsWith("/feed/shorts") ||
      CHANNEL_SHORTS_PATTERN.test(p));
  const redirectHome = () => {
    location.replace("https://www.youtube.com/");
  };

  // Shorts 관련 DOM 제거/숨김 로직
  const removeShorts = () => {
    document.querySelectorAll('a[href^="/shorts"]').forEach((a) => {
      a.style.display = "none";

      const item =
        a.closest("ytd-rich-item-renderer") ||
        a.closest("ytd-video-renderer") ||
        a.closest("ytd-compact-video-renderer") ||
        a.closest("ytd-reel-shelf-renderer");

      if (item) item.remove();
    });

    document.querySelectorAll("ytd-reel-shelf-renderer").forEach((el) => el.remove());

    // 홈 피드의 Shorts 선반(ytd-rich-shelf-renderer) 제거
    document.querySelectorAll("ytd-rich-shelf-renderer").forEach((shelf) => {
      const hasShortsLink = !!shelf.querySelector('a[href^="/shorts"]');
      const titleText = shelf.querySelector("#title")?.textContent?.trim().toLowerCase() || "";
      const menuLabel =
        shelf.querySelector('button[aria-label*="Shorts"], button[aria-label*="shorts"]') !== null;
      if (hasShortsLink || titleText === "shorts" || menuLabel) {
        shelf.remove();
      }
    });

    // 좌측 가이드/미니 가이드의 Shorts 메뉴 제거
    document
      .querySelectorAll(
        'ytd-guide-entry-renderer a#endpoint[title="Shorts"], ytd-mini-guide-entry-renderer a[title="Shorts"], ytd-guide-entry-renderer a#endpoint[href^="/shorts"], ytd-mini-guide-entry-renderer a[href^="/shorts"]'
      )
      .forEach((a) => {
        const guideItem =
          a.closest("ytd-guide-entry-renderer") || a.closest("ytd-mini-guide-entry-renderer");
        if (guideItem) guideItem.remove();
      });
  };

  // 경로가 /shorts 로 시작하면 홈으로 이동
  const handleRoute = () => {
    if (!enabled) return false;
    if (isShorts(location.pathname)) {
      redirectHome();
      return true;
    }
    return false;
  };

  // SPA 탐지: history API 패치 + popstate
  const wrapHistory = (method) => {
    const orig = history[method];
    history[method] = function (...args) {
      const res = orig.apply(this, args);
      window.dispatchEvent(new Event('locationchange'));
      return res;
    };
  };
  wrapHistory('pushState');
  wrapHistory('replaceState');
  window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));

  // locationchange 처리
  window.addEventListener('locationchange', () => {
    if (location.pathname === lastPath) return;
    lastPath = location.pathname;
    if (!enabled) return;
    handleRoute();
    removeShorts();
  });

  // 폴백: 간단한 폴링 (낮은 오버헤드)
  setInterval(() => {
    if (location.pathname === lastPath) return;
    lastPath = location.pathname;
    if (!enabled) return;
    handleRoute();
    removeShorts();
  }, 500);

  // DOM 변경 감시 (원래 로직 유지)
  const observer = new MutationObserver(() => {
    if (!enabled) return;
    removeShorts();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !(KEY in changes)) return;
    enabled = changes[KEY].newValue ?? true;
    if (enabled) {
      handleRoute();
      removeShorts();
    }
  });

  // 초깃값 처리
  getEnabled().then((value) => {
    enabled = value;
    if (!enabled) return;
    removeShorts();
    handleRoute();
  });
})();
