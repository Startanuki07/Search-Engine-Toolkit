// ==UserScript==
// @name         Search Engine Toolkit — Site Groups, Time Filter & Search Panel
// @name:zh-TW   多引擎搜尋工具 — 站台群組、時間篩選與搜尋面板
// @name:zh-CN   多引擎搜索工具 — 站点分组、时间筛选与搜索面板
// @name:ja      マルチエンジン検索ツール — サイトグループ、時間フィルター、検索パネル
// @name:ko      멀티엔진 검색 도구 — 사이트 그룹, 시간 필터 및 검색 패널
// @namespace    https://greasyfork.org/en/users/1575945-star-tanuki07?locale_override=1
// @namespace    https://github.com/Startanuki07
// @version      2.0.1
// @license      MIT
// @author       Star-tanuki07
// @icon         https://www.google.com/s2/favicons?sz=64&domain=google.com
// @include      /^https:\/\/www\.google\.[^\/]+\/search(\?|$)/
// @match        https://search.brave.com/search*
// @match        https://yandex.ru/search*
// @match        https://yandex.ru/yandsearch*
// @match        https://www.bing.com/search*
// @match        https://duckduckgo.com/*
// @match        https://search.yahoo.com/search*
// @match        https://search.yahoo.co.jp/search*
// @match        https://www.baidu.com/s*
// @match        https://yandex.com/search*
// @match        https://www.ask.com/web*
// @match        https://www.ecosia.org/search*
// @match        https://www.qwant.com/*
// @match        https://search.naver.com/search*
// @match        https://kagi.com/search*
// @match        https://www.sogou.com/web*
// @match        https://www.so.com/s*
// @match        https://www.bing.com/images/search*
// @match        https://search.brave.com/images*
// @match        https://images.search.yahoo.com/search/images*
// @match        https://images.search.yahoo.co.jp/search/images*
// @match        https://yandex.ru/images/search*
// @match        https://yandex.com/images/search*
// @match        https://image.baidu.com/search*
// @match        https://www.ask.com/images*
// @match        https://www.ecosia.org/images*
// @match        https://kagi.com/images*
// @match        https://pic.sogou.com/pics*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_openInTab
// @description      A site-search assistant for major search engines (Google, Bing, Brave, DuckDuckGo, Yandex, Baidu). Organise target domains into named groups — one click appends site:<domain> to your current query instantly. Secondary tools: granular time filter (1 hour – 9 years), multi-engine switcher, keyword exclusion, and full import/export config. Themes, opacity, and background image supported.
// @description:zh-TW 以 site: 域名過濾為核心的搜尋輔助工具，適用於 Google、Bing、Brave 等主流引擎。將常用目標網站整理成群組，一鍵將 site:<域名> 附加至當前搜尋詞即時跳轉。附加功能：1小時至9年細粒度時間篩選、多引擎切換、排除關鍵字、設定匯入匯出，以及主題、透明度與背景圖片自訂。
// @description:zh-CN 以 site: 域名过滤为核心的搜索辅助工具，支持 Google、Bing、Brave 等主流引擎。将常用目标网站整理为分组，一键将 site:<域名> 追加至当前搜索词并即时跳转。附加功能：1小时至9年细粒度时间筛选、多引擎切换、排除关键词、配置导入导出，以及主题、透明度与背景图片自定义。
// @description:ja    site: ドメインフィルタリングを主軸とした検索補助ツール。Google・Bing・Brave など主要エンジンに対応。よく使うサイトをグループにまとめ、ワンクリックで site:<ドメイン> を現在のクエリに付加して即時検索。補助機能：1時間〜9年の詳細時間フィルター・マルチエンジン切替・除外キーワード・設定のインポート/エクスポート・テーマ/透明度/背景画像カスタマイズ。
// @description:ko    site: 도메인 필터링을 핵심 기능으로 하는 검색 보조 도구. Google, Bing, Brave 등 주요 검색 엔진 지원. 자주 사용하는 사이트를 그룹으로 관리하고, 클릭 한 번으로 site:<도메인>을 현재 검색어에 추가해 즉시 이동. 부가 기능: 1시간~9년 세분화 시간 필터, 멀티엔진 전환, 키워드 제외, 설정 가져오기/내보내기, 테마·투명도·배경 이미지 커스터마이즈.
// ==/UserScript==

(function () {
  "use strict";

  const DEBUG = false;
  const log = (...args) => DEBUG && console.log(...args);
  const warn = (...args) => DEBUG && console.warn(...args);

  function isValidPixelValue(value) {
    return typeof value === "string" && /^\d+(\.\d)?px$/.test(value);
  }

  const TIME_VALUES = [
    "h","h2","h3","h6","h12",
    "d","d2","d3",
    "w","w3",
    "m","m3","m6",
    "y","y2","y3","y4","y5","y6","y7","y8","y9",
  ];

  function buildTimeOptions(labels) {
    return TIME_VALUES.map((v, i) => ({ label: labels[i] || v, value: v }));
  }

  const SYNTAX_SYNTAXES = [
    "inurl:login", "intitle:guide", "filetype:pdf",
    "intext:privacy", "-keyword", "site:example.com",
  ];

  function buildSyntaxExamples(descs, syntaxOverrides) {
    return SYNTAX_SYNTAXES.map((s, i) => ({
      syntax: (syntaxOverrides && syntaxOverrides[i]) || s,
      desc:   descs[i] || "",
    }));
  }

  const LANGUAGES = {
    en: {
      siteTitle: "Site Groups",
      timeLabel: "🕐 Time Filter",      unlimited: "Unlimited",
      expand: "🎨Expand",
      collapse: "Collapse",
      toggleShow: "Show Addresses",
      toggleHide: "Hide Addresses",
      addGroup: "Add Group ➕",
      editGroup: "Edit Group ✏️",
      delGroup: "Delete Group 🗑️",
      addSite: "Add Site ➕",
      editSite: "Edit Site ✏️",
      notFound: "Search input not found!",
      enterGroupName: "Enter group name",
      enterSite:
        "Enter site URL (e.g., example.com)\n\nRight-click ⚙️ to delete the domain",
      confirmDel: (name) => `Confirm to delete group "${name}"?（Confirm）`,
      exportConfig: "Export Config 📤",
      importConfig: "Import Config 📥",
      searchConfig: "⚙️ Search Settings",
      exclude1: "Exclude Keyword1",
      exclude2: "Exclude Keyword2",
      syntaxHelp: "Search Syntax Reference 📖",
      copied: "Copied! 📋",
      syntaxPanelTitle: "Search Syntax Reference 📖",
      groupNameUpdated: "Group name updated!",
      groupDeleted: (name) => `Group "${name}" deleted!`,
      multiSelectMode: "Multi-select",
      multiSelectSend: "Open selected",
      multiSelectConfirm: (n) => `Open ${n} selected site(s) in new tabs?`,
      multiSelectColor: "Select Highlight Color",
      multiSelectOpacity: "Highlight Opacity",
      siteButtonWidth: "Site Button Width",
      siteButtonWidthAuto: "Auto",
      multiSelectNone: "No sites selected!",
      panelHelp: "📋 Site Groups Panel — Help\n\n▸ Group header buttons:\n  ✎  Rename the group\n  ➕  Add a site to the group\n  🗑️  Delete the group\n  ☑  Enter multi-select mode\n  ↗  Open selected sites (shown in multi-select mode)\n\n▸ Site buttons:\n  Left-click    — Apply site:filter to current search\n  Long-press drag — Reorder sites within the group\n  ⋯ (three dots) — Open site menu:\n      ✏️ Edit URL / note\n      🗑️ Delete site\n      🔗 Open (same tab)\n      ↗ Open (new tab)\n\n▸ Multi-select mode:\n  Click sites to select / deselect (gold highlight).\n  Click ☑ again, or click ↗ Send to exit.\n\n▸ Engine bar (top icon row):\n  Click an icon to jump to that engine with the current keyword.\n  Drag ⠿ in the engine panel to reorder — top 5 show as icons.\n\n▸ Time filter (dropdown below engine bar):\n  Restricts results to a specific time range (1 hour – 9 years).\n  Select \"Unlimited\" to clear the filter.\n\n▸ Search Settings ⚙️:\n  Set exclude keywords, toggle syntax help, import/export config.\n\n▸ 📌 Button (top-right):\n  Controls whether the panel opens automatically.\n  ⛔ OFF — closed by default  ✅ ON — opens on load\n  📌 Pinned — always visible\n  Also contains: 🔒 Safe Search OFF and 🌐 Search Region toggles.",
      dpItemHint: {
        off:          "Panel stays closed by default. Click 🔍 to open manually.",
        on:           "Panel opens automatically on every page load.",
        pinned:       "Panel is always visible and cannot be closed.",
        safeSearch:   "Attempts to inject URL parameters to disable safe search filters (e.g. safe=off). No guarantee of effectiveness. OFF = no intervention.",
        searchRegion: "Attempts to remove country/region URL parameters (e.g. gl, mkt) so results are not limited to a specific country. OFF = no intervention.",
      },
      multiSelectSendTitle: "Open Selected Sites",
      multiSelectSendMsg: (n, urls) => `Open ${n} site(s) in new tabs?\n\n${urls}`,
      multiSelectRemember: "Remember this choice",
      multiSelectClearAfter: "Exit multi-select after sending",
      multiSelectRememberSel: "Remember selected sites for this group",
      multiSelectBanner: "☑ Multi-select mode — click sites to select · click ☑ or ↗ to exit",
      multiSelectKeyword: "Search keyword (optional)",
      siteMenuEdit: "✏️ Edit",
      siteMenuDelete: "🗑️ Delete",
      siteMenuOpenSame: "🔗 Open (same tab)",
      siteMenuOpenNew: "↗ Open (new tab)",
      multiSelectModeLabel: "Send mode (mutually exclusive):",
      modeSiteSearch: "site:A OR site:B search (same tab)",
      modeSiteSearchNew: "site:A OR site:B search (new tab)",
      modeOpenOnly: "Open each site without search keyword",
      langSwitched: "Language switched!",
      toggleReset: "🔍 Position reset",
      filterError: "Failed to apply search filter, please try again!",
      siteEditHint: "Left-click to edit | Right-click to delete",
      close: "Close",
      editSiteSuccess: "Site updated successfully!",
      emptyInput: "Input cannot be empty!",
      panelPinned: "📌 Engine panel pinned",
      panelUnpinned: "📌 Engine panel unpinned",
      defaultPanelOpen: "Default Open🗂️",
      safeSearchLabel: "🔒 Safe Search OFF",
      safeSearchOn:  "🔒 Safe Search OFF: ON",
      safeSearchOff: "🔓 Safe Search OFF: OFF",
      safeSearchWarning: "🔒 Safe Search OFF — How it works\n\n▸ ON  → When you navigate to a search engine, this script will try to inject URL parameters (e.g. safe=off, adlt=off) to disable the engine's safe search filter.\n▸ OFF → The script does nothing and leaves all search behaviour untouched.\n\n⚠️ No guarantee: engines may ignore these parameters or change them at any time. Baidu is not supported.\n\nThis notice only appears once.",
      searchRegionLabel: "🌐 Search Region: All",
      searchRegionOn:  "🌐 Search Region: All — ON",
      searchRegionOff: "🌐 Search Region: All — OFF",
      searchRegionWarning: "🌐 Search Region: All — How it works\n\n▸ ON  → When you navigate to a search engine, this script tries to remove or replace country/region URL parameters (e.g. gl, mkt, kl) so results are not filtered to a specific country.\n▸ OFF → The script does nothing and leaves region settings untouched.\n\n⚠️ No guarantee: engines may override this with their own detection. Baidu and Naver are not supported.\n\nThis notice only appears once.",
      styleConfig: "Style Settings 🎨",
      panelLayout: "Panel Layout",
      panelTopLabel: "Top Offset",
      panelRightLabel: "Right Offset",
      panelWidthLabel: "Max Width",
      panelHeightLabel: "Max Height",
      panelWidthHint: "↺ Resets to locale default width",
      seBarOffsetLabel: "Raise Engine Bar (+50px)",
      hideSyntaxBtnLabel: "Hide 📖 Syntax Help Button",
      hideBlacklistBtnLabel: "Hide 🚫 Blacklist Button",
      toggleBtnStyleLabel:    "Toggle Button Style",
      toggleBtnIconLabel:     "Icon",
      toggleBtnIconEmoji:     "🔍 Emoji",
      toggleBtnIconSvgLine:   "SVG Outline",
      toggleBtnIconSvgFill:   "SVG Filled",
      toggleBtnBgColorLabel:  "BG Color",
      toggleBtnBgOpacityLabel:"BG Opacity",
      svgIconColorLabel:      "SVG Icon Color",
      style: "Style",
      borderRadius: "Border Radius",
      contrast: "Contrast",
      opacity: "Opacity",
      fontSize: "Font Size",
      backgroundImage: "Background Image",
      imageMode: "Image Mode",
      textColor: "Text Color",
      backgroundColor: "Background Color",
      imageOffsetX: "Image X Offset",
      imageOffsetY: "Image Y Offset",
      imageScale: "Image Scale",
      imageOpacity: "Image Opacity",
      theme: "Theme",
      resetStyles: "Reset Styles 🔄",
      resetStylesConfirm: "Reset all style settings?\n(Layout, font, opacity etc. will all return to defaults)",
      importConfigSuccess: "Configuration imported successfully!",
      importConfigFailed: "Import failed: Invalid JSON format!",
      invalidSite: "Please enter a valid URL (e.g., example.com)!",
      enterSiteNote: "Enter site note (recommended: within 4 characters):",
      noteTooLong: "Note cannot exceed 4 characters!",
      emptyGroupName: "Group name cannot be empty!",
      confirm: "Confirm",
      cancel: "Cancel",
      exportConfigSuccess: "Configuration exported successfully! 📤",
      deleteKeyword: "Delete keyword",
      resetStylesSuccess: "Style reset successfully!",
      importConfigPrompt: "Select a JSON file to import",
      invalidFileType: "Please select a valid JSON file!",
      promptClose: "Click outside to close",
      customButtonBg: "Button Background",
      textBackgroundColor: "Text Background Color",
      textBorder: "Enable Text Border",
      groupOpacity: "Group Opacity",
      textOpacityCompensation: "Text Clarity Boost",
      buttonOpacity: "Button Opacity",
      contrastStatus: "Contrast: ",
      high: "High",
      low: "Low",
      enhancedClarity: "Clarity: ",
      enabled: "On",
      disabled: "Off",
      groupBackgroundColor: "Group Background Color",
      enableOverlayDarkening: "Enable Overlay Darkening",
      overlayStrength: "Overlay Strength",
      searchSites: "Search Sites...",
      searchHistory: "Search History",
      clearSearchHistory: "Clear Search History",
      noSearchHistory: "No search history",
      searchBarStyleLabel:    "Search Bar Style",
      searchBarPreset:        "Quick Preset",
      searchBarBgColor:       "Bar BG Color",
      searchBarBgOpacity:     "Bar BG Opacity",
      searchBarFgColor:       "Bar Text Color",
      searchBarGlowEnabled:   "Bar Glow",
      searchBarGlowColor:     "Glow Color",
      searchBarGlowStrength:  "Glow Strength",
      customThemeLabel:       "Custom Theme",
      quickSchemeLabel:       "🎨 Quick Scheme",
      quickSchemeLight:       "☀️ Light",
      quickSchemeDark:        "🌑 Dark",
      quickSchemeReset:       "↺ Reset",
      glowLabel:              "Border Glow / Sheen",
      enableBorderGlow:       "Border Glow",
      borderGlowColor:        "Glow Color",
      borderGlowStrength:     "Glow Strength",
      borderGlowInset:        "Inset Glow",
      enableSheen:            "Sheen Effect",
      sheenAngle:             "Sheen Angle",
      sheenOpacity:           "Sheen Intensity",
      enableSiteGlow:         "Site Button Glow",
      enableGroupGlow:        "Group Block Glow",
      styleOptions: {
        default: "Default",
        soft: "Soft",
        bold: "Bold",
      },
      imageModes: {
        center: "Center",
        tile: "Tile",
        contain: "Contain",
        auto: "Auto",
      },
      themeOptions: {
        light: "Light ☀️",
        dark: "Dark 🌙",
        custom: "Custom 🎨",
      },
      uploadImage: "Upload Image📤",
      clearImage: "Clear Image🗑️",
      blacklistBtn: "🚫 Blacklist",
      blacklistTitle: "Domain Blacklist",
      blacklistPlaceholder: "One domain per line, e.g.: pinterest.com",
      blacklistSaved: (n) => `Blacklist saved — ${n} domain(s) blocked`,
      blacklistCount: (n) => `Currently blocking ${n} domain(s)`,
      blacklistInvalid: (d) => `Invalid domain skipped: "${d}"`,
      onboarding: {
        step0Title: "🔍 Finding the panel",
        step0Body: "See the <b>🔍 button</b> on the page? That's your entry point.\nClick it anytime to open or close the main panel.",
        step1Title: "👋 Welcome!",
        step1Body: "Let's get you started.\nFirst, click <b>Add Group ➕</b> to create a site group (e.g. \"News\", \"Dev\").",
        step2Title: "📂 Group created!",
        step2Body: "Great! Now click <b>Add Site ➕</b> inside the group to add a website (e.g. github.com).",
        step3Title: "✅ All set!",
        step3Body: "Click any site button to filter your search.\nYou can add more groups and sites anytime.\nHappy searching! 🚀",
        next: "Next →",
        skip: "Skip",
        finish: "Got it!",
      },
      se: {
        panelTitle: "Search Engine Manager",
        helpTooltip:
          "Tip: All engines are in one list.\n• Top 5 show as quick-access icons in the header bar.\n• Drag ⠿ to reorder — moving an engine to position 1–5 will display it as a pinned icon.\n• Click → to navigate with the current keyword.\n• Click ✕ to delete an engine.",
        lockLabel: "🔒 Lock Engine Hint",
        lockEnabled: "🔒 Lock engine enabled",
        lockDisabled: "🔓 Lock engine disabled",
        lockToast: (name) => `🔒 Locked: ${name} — click its icon to navigate`,
        allEnginesLabel: "All Engines  (top 5 shown as icons)",
        addSectionLabel: "Add Engine",
        detectBtn: "🔍 Auto-Detect Current Site",
        detectFirstTip: "💡 To add a cross-origin search engine, you need to manually add its URL to the @include rules in your userscript manager.",
        detectFirstTipTitle: "Cross-origin notice",
        detectOk: "Got it",
        detectConfirmTitle: "Add Search Engine?",
        detectConfirm: (name, url) => `Detected: ${name}\n${url}\n\nAdd this as a search engine?`,
        detectSuccess: (name) => `✅ Added: ${name}`,
        detectFail: "❌ Cannot detect a search URL on this page.",
        adviceBannerText: "💡 This script works best as a quick-access shortcut on major search engines. For extensive custom-engine management, consider a dedicated browser extension.",
        adviceBannerTitle: "Usage tip",
        namePlaceholder: "Engine name (e.g. Google)",
        urlPlaceholder: "Search URL (ending with ?q=)",
        addBtn: "➕ Add",
        emptyList: "(No engines yet — add one below)",
        addSuccess: (name) => `✅ Added: ${name}`,
        nameEmpty: "Name and URL cannot be empty!",
        urlInvalid: "URL must start with http!",
        pinnedBadge: "TOP4",
        noKeyword: "Cannot extract search keyword",
        newWindowBtn: "⧉",
        newWindowTitle: "Open in new window",
        dpTitle: {
          pinned: "Panel always visible (Pinned)\nClick to change",
          on: "Panel opens by default (ON)\nClick to change",
          off: "Panel closed by default (OFF)\nClick to change",
          offToast: "⛔ OFF — panel stays open now. Click 🔍 or outside to close.",
        },
      },
      timeOptions: buildTimeOptions([
        "Within 1 hour","Within 2 hours","Within 3 hours","Within 6 hours","Within 12 hours",
        "Within 1 day","Within 2 days","Within 3 days",
        "Within 1 week","Within 3 weeks",
        "Within 1 month","Within 3 months","Within 6 months",
        "Within 1 year","Within 2 years","Within 3 years","Within 4 years","Within 5 years",
        "Within 6 years","Within 7 years","Within 8 years","Within 9 years",
      ]),
      syntaxExamples: buildSyntaxExamples([
        "Searches for pages with 'login' in the URL",
        "Searches for pages with 'guide' in the title",
        "Searches for PDF files",
        "Searches for pages containing 'privacy' in the text",
        "Excludes pages containing 'keyword'",
        "Searches within example.com",
      ]),
      timeUnsupported: "⚠️ Time filter is not supported on this search engine",
    },
    zh_TW: {
      siteTitle: "站台群組",
      timeLabel: "🕐 時間篩選",
      unlimited: "無限制",
      expand: "🎨展開樣式調整介面",
      collapse: "收合樣式調整介面",
      toggleShow: "顯示網址",
      toggleHide: "顯示註解",
      addGroup: "新增群組 ➕",
      editGroup: "編輯群組 ✏️",
      delGroup: "刪除群組 🗑️",
      addSite: "新增站台 ➕",
      editSite: "編輯站台 ✏️",
      notFound: "未找到搜尋輸入框！",
      enterGroupName: "輸入群組名稱",
      enterSite: "輸入站台網址（例如：example.com）\n\n若對⚙️按右鍵可刪除網域",
      confirmDel: (name) => `確認刪除群組 "${name}"？（直接確認）`,
      exportConfig: "匯出設定 📤",
      importConfig: "匯入設定 📥",
      searchConfig: "⚙️ 搜尋設定",
      exclude1: "排除關鍵字1",
      exclude2: "排除關鍵字2",
      syntaxHelp: "搜尋語法參考 📖",
      copied: "已複製！ 📋",
      syntaxPanelTitle: "搜尋語法參考 📖",
      groupNameUpdated: "群組名稱已更新！",
      groupDeleted: (name) => `群組 "${name}" 已刪除！`,
      multiSelectMode: "複選",
      multiSelectSend: "開啟已選",
      multiSelectConfirm: (n) => `確定在新分頁開啟已選的 ${n} 個站點？`,
      multiSelectColor: "選取高亮顏色",
      multiSelectOpacity: "高亮透明度",
      siteButtonWidth: "站點按鈕寬度",
      siteButtonWidthAuto: "自動",
      multiSelectNone: "尚未選取任何站點！",
      panelHelp: "📋 站台群組面板說明\n\n▸ 群組標頭按鈕：\n  ✎  重新命名群組\n  ➕  新增站台至群組\n  🗑️  刪除群組\n  ☑  進入複選模式\n  ↗  開啟已選站台（複選模式中才顯示）\n\n▸ 站台按鈕：\n  左鍵點擊      — 套用 site: 篩選搜尋\n  長按拖曳      — 在群組內重新排序\n  ⋯（三點選單）— 開啟站台選單：\n      ✏️ 編輯 URL / 備註\n      🗑️ 刪除站台\n      🔗 開啟（當前分頁）\n      ↗ 開啟（新分頁）\n\n▸ 複選模式：\n  點擊站台按鈕可選取/取消選取（金色光暈）。\n  再次點擊 ☑，或點擊 ↗ 送出後退出。\n\n▸ 引擎列（頂部圖示列）：\n  點擊圖示，以當前關鍵字跳轉至對應引擎。\n  在引擎管理面板拖曳 ⠿ 排序，前 5 個顯示為圖示。\n\n▸ 時間篩選（引擎列下方下拉選單）：\n  將搜尋結果限定在特定時間範圍（1小時 ~ 9年）。\n  選擇「無限制」可清除篩選。\n\n▸ 搜尋設定 ⚙️：\n  設定排除關鍵字、語法參考、匯入/匯出設定。\n\n▸ 📌 按鈕（右上角）：\n  控制面板是否自動開啟。\n  ⛔ OFF — 預設關閉  ✅ ON — 頁面載入時開啟\n  📌 釘選 — 永遠顯示\n  另有：🔒 安全搜尋 OFF 與 🌐 搜尋地區開關。",
      dpItemHint: {
        off:          "面板預設關閉，需手動點擊 🔍 開啟。",
        on:           "每次頁面載入時自動開啟面板。",
        pinned:       "面板永遠顯示，無法被關閉。",
        safeSearch:   "嘗試注入 URL 參數（如 safe=off）來關閉安全過濾。不保證有效。OFF = 完全不介入。",
        searchRegion: "嘗試移除地區限定 URL 參數（如 gl、mkt），讓結果不受限於特定國家。OFF = 完全不介入。",
      },
      multiSelectSendTitle: "開啟已選站台",
      multiSelectSendMsg: (n, urls) => `確定開啟 ${n} 個站台？\n\n${urls}`,
      multiSelectRemember: "記住此次選擇",
      multiSelectClearAfter: "送出後退出複選模式",
      multiSelectRememberSel: "記憶此群組的複選選取",
      multiSelectBanner: "☑ 複選模式 — 點擊站點選取 · 再按 ☑ 或送出 ↗ 退出",
      multiSelectKeyword: "搜尋關鍵字（可選）",
      siteMenuEdit: "✏️ 編輯",
      siteMenuDelete: "🗑️ 刪除",
      siteMenuOpenSame: "🔗 開啟（當前分頁）",
      siteMenuOpenNew: "↗ 開啟（新分頁）",
      multiSelectModeLabel: "送出方式（互斥選擇）：",
      modeSiteSearch: "site:A OR site:B 搜尋（當前分頁）",
      modeSiteSearchNew: "site:A OR site:B 搜尋（新分頁）",
      modeOpenOnly: "直接開啟各站點（不附加搜尋詞）",
      langSwitched: "語言已切換！",
      toggleReset: "🔍 位置已重置",
      filterError: "搜尋過濾應用失敗，請稍後重試！",
      siteEditHint: "左鍵編輯 | 右鍵刪除",
      close: "關閉",
      editSiteSuccess: "站台編輯成功！",
      emptyInput: "輸入不能為空！",
      panelPinned: "📌 引擎面板已釘選",
      panelUnpinned: "📌 引擎面板已取消釘選",
      defaultPanelOpen: "預設開啟面板 🗂️",
      safeSearchLabel: "🔒 安全搜尋 OFF",
      safeSearchOn:  "🔒 安全搜尋 OFF：已開啟",
      safeSearchOff: "🔓 安全搜尋 OFF：已關閉",
      safeSearchWarning: "🔒 安全搜尋 OFF — 運作說明\n\n▸ 開啟 → 每次跳轉到搜尋引擎時，腳本會嘗試在網址中注入對應的參數（如 safe=off、adlt=off），讓搜尋引擎關閉安全過濾。\n▸ 關閉 → 腳本完全不介入，所有搜尋行為維持原狀。\n\n⚠️ 不保證有效：各引擎可能忽略這些參數，或隨時更改機制。百度不支援此功能。\n\n此提示只出現一次。",
      searchRegionLabel: "🌐 搜尋地區：全部",
      searchRegionOn:  "🌐 搜尋地區：全部 — 已開啟",
      searchRegionOff: "🌐 搜尋地區：全部 — 已關閉",
      searchRegionWarning: "🌐 搜尋地區：全部 — 運作說明\n\n▸ 開啟 → 每次跳轉到搜尋引擎時，腳本會嘗試移除或置換網址中的國家/地區參數（如 gl、mkt、kl），讓搜尋結果不被限定在特定國家。\n▸ 關閉 → 腳本完全不介入，地區設定維持原狀。\n\n⚠️ 不保證有效：部分引擎可能透過瀏覽器 IP 或 Cookie 自動偵測地區。百度與 Naver 不支援此功能。\n\n此提示只出現一次。",
      styleConfig: "樣式設定 🎨",
      panelLayout: "面板佈局",
      panelTopLabel: "距頂部",
      panelRightLabel: "距右側",
      panelWidthLabel: "最大寬度",
      panelHeightLabel: "最大高度",
      panelWidthHint: "↺ 重置 = 恢復語系預設寬度",
      seBarOffsetLabel: "引擎列上移 50px",
      hideSyntaxBtnLabel: "隱藏 📖 語法說明按鈕",
      hideBlacklistBtnLabel: "隱藏 🚫 黑名單按鈕",
      toggleBtnStyleLabel:    "開關按鈕樣式",
      toggleBtnIconLabel:     "圖示",
      toggleBtnIconEmoji:     "🔍 Emoji",
      toggleBtnIconSvgLine:   "SVG 線框",
      toggleBtnIconSvgFill:   "SVG 填色",
      toggleBtnBgColorLabel:  "背景顏色",
      toggleBtnBgOpacityLabel:"背景透明度",
      svgIconColorLabel:      "SVG 圖示顏色",
      style: "風格",
      borderRadius: "圓角",
      contrast: "對比度",
      opacity: "透明度",
      fontSize: "文字大小",
      backgroundImage: "背景圖片",
      imageMode: "圖片模式",
      textColor: "文字顏色",
      backgroundColor: "背景顏色",
      imageOffsetX: "圖片 X 偏移",
      imageOffsetY: "圖片 Y 偏移",
      groupOpacity: "群組透明度",
      imageScale: "圖片縮放",
      imageOpacity: "圖片透明度",
      theme: "主題",
      resetStyles: "重置樣式 🔄",
      resetStylesConfirm: "確定重置所有樣式設定？\n（面板佈局、字體、透明度等全部恢復預設值）",
      importConfigSuccess: "匯入成功！",
      importConfigFailed: "匯入失敗：無效的 JSON 格式！",
      invalidSite: "請輸入有效的網址（例如：example.com）！",
      enterSiteNote: "請輸入站台註解（建議4個字以內）：",
      noteTooLong: "註解不得超過 4 個字！",
      emptyGroupName: "群組名稱不能為空！",
      confirm: "確認",
      cancel: "取消",
      exportConfigSuccess: "設定匯出成功！ 📤",
      deleteKeyword: "刪除關鍵字",
      resetStylesSuccess: "樣式已重置！",
      importConfigPrompt: "選擇要匯入的 JSON 檔案",
      invalidFileType: "請選擇有效的 JSON 檔案！",
      promptClose: "點擊外部關閉",
      textBackgroundColor: "文字背景顏色",
      textBorder: "啟用文字邊框",
      customButtonBg: "按鈕背景",
      textOpacityCompensation: "文字清晰強化",
      buttonOpacity: "按鈕透明度",
      contrastStatus: "對比度：",
      high: "高",
      low: "低",
      enhancedClarity: "清晰度：",
      enabled: "開啟",
      disabled: "關閉",
      groupBackgroundColor: "群組背景顏色",
      enableOverlayDarkening: "啟用黑幕效果",
      overlayStrength: "黑幕強度",
      searchSites: "搜尋站台...",
      searchHistory: "搜尋歷史",
      clearSearchHistory: "清除搜尋歷史",
      noSearchHistory: "無搜尋歷史",
      searchBarStyleLabel:    "搜尋列樣式",
      searchBarPreset:        "快速套色",
      searchBarBgColor:       "列背景色",
      searchBarBgOpacity:     "列背景透明度",
      searchBarFgColor:       "列文字顏色",
      searchBarGlowEnabled:   "搜尋列光暈",
      searchBarGlowColor:     "光暈顏色",
      searchBarGlowStrength:  "光暈強度",
      customThemeLabel:       "自訂主題",
      quickSchemeLabel:       "🎨 快速方案",
      quickSchemeLight:       "☀️ 亮色",
      quickSchemeDark:        "🌑 深色",
      quickSchemeReset:       "↺ 重置",
      glowLabel:              "外框光澤 / 高光",
      enableBorderGlow:       "外框光暈",
      borderGlowColor:        "光暈顏色",
      borderGlowStrength:     "光暈強度",
      borderGlowInset:        "內壁光",
      enableSheen:            "高光光澤 (Sheen)",
      sheenAngle:             "光澤角度",
      sheenOpacity:           "光澤強度",
      enableSiteGlow:         "站台按鈕光暈",
      enableGroupGlow:        "群組區塊光暈",
      styleOptions: {
        default: "預設",
        soft: "柔和",
        bold: "立體",
      },
      imageModes: {
        center: "置中",
        tile: "並排",
        contain: "自適應",
        auto: "原尺寸",
      },
      themeOptions: {
        light: "淺色 ☀️",
        dark: "深色 🌙",
        custom: "自訂 🎨",
      },
      uploadImage: "上傳圖片 📤",
      clearImage: "清除圖片 🗑️",
      blacklistBtn: "🚫 黑名單",
      blacklistTitle: "網域黑名單",
      blacklistPlaceholder: "每行輸入一個網域，例如：pinterest.com",
      blacklistSaved: (n) => `黑名單已儲存 — 已封鎖 ${n} 個網域`,
      blacklistCount: (n) => `目前封鎖 ${n} 個網域`,
      blacklistInvalid: (d) => `無效網域已略過：「${d}」`,
      onboarding: {
        step0Title: "🔍 找到面板入口",
        step0Body: "看到頁面上的 <b>🔍 按鈕</b>了嗎？那就是入口。\n隨時點擊它來開啟或關閉主面板。",
        step1Title: "👋 歡迎使用！",
        step1Body: "讓我們快速上手。\n請先點擊 <b>新增群組 ➕</b> 建立一個站台群組（例如「新聞」、「開發」）。",
        step2Title: "📂 群組建立完成！",
        step2Body: "很好！現在點擊群組內的 <b>新增站台 ➕</b>，加入一個網站（例如 github.com）。",
        step3Title: "✅ 設定完成！",
        step3Body: "點擊任意站台按鈕即可限縮搜尋範圍。\n之後可以隨時新增更多群組與站台。\n開始搜尋吧！🚀",
        next: "下一步 →",
        skip: "略過",
        finish: "知道了！",
      },
      se: {
        panelTitle: "搜尋引擎管理",
        helpTooltip:
          "使用說明：所有引擎在同一列表中。\n• 排在第 1–5 位的引擎會在頂部列顯示為快速圖示。\n• 拖曳 ⠿ 調整順序——移到前 5 個就會顯示為頂部圖示。\n• 點擊 → 可用目前關鍵字跳轉。\n• 點擊 ✕ 刪除引擎。",
        lockLabel: "🔒 鎖定引擎提示",
        lockEnabled: "🔒 鎖定引擎提示已啟用",
        lockDisabled: "🔓 鎖定引擎提示已關閉",
        lockToast: (name) => `🔒 鎖定提示：${name}（點擊圖示手動跳轉）`,
        allEnginesLabel: "所有引擎（前 5 個顯示為圖示）",
        addSectionLabel: "新增引擎",
        detectBtn: "🔍 智慧偵測當前網站",
        detectFirstTip: "💡 若要新增跨域搜尋引擎，請至腳本管理器手動在 @include 規則中加入對應網址。",
        detectFirstTipTitle: "跨域提示",
        detectOk: "知道了",
        detectConfirmTitle: "新增搜尋引擎？",
        detectConfirm: (name, url) => `偵測到：${name}\n${url}\n\n是否新增為搜尋引擎？`,
        detectSuccess: (name) => `✅ 已新增：${name}`,
        detectFail: "❌ 無法在此頁面偵測到搜尋引擎 URL。",
        adviceBannerText: "💡 此腳本較適合作為各大主流搜尋引擎的快速輔助工具。若需要管理更多自定義引擎，可以考慮使用更專業的瀏覽器擴展。",
        adviceBannerTitle: "使用提示",
        namePlaceholder: "引擎名稱 (e.g. Google)",
        urlPlaceholder: "搜尋 URL (結尾含 ?q=)",
        addBtn: "➕ 新增",
        emptyList: "（尚無引擎，請於下方新增）",
        addSuccess: (name) => `✅ 已新增：${name}`,
        nameEmpty: "名稱與 URL 不能為空！",
        urlInvalid: "URL 需以 http 開頭！",
        pinnedBadge: "頂部",
        noKeyword: "無法取得搜尋關鍵字",
        newWindowBtn: "⧉",
        newWindowTitle: "在新視窗開啟",
        dpTitle: {
          pinned: "面板永遠顯示（已固定）\n點擊可切換",
          on: "預設開啟面板（ON）\n點擊可切換",
          off: "預設關閉面板（OFF）\n點擊可切換",
          offToast: "⛔ OFF — 面板目前仍開著，點擊 🔍 或面板外側可關閉。",
        },
      },
      timeOptions: buildTimeOptions([
        "1小時內","2小時內","3小時內","6小時內","12小時內",
        "1天內","2天內","3天內",
        "1週內","3週內",
        "1月內","3月內","6月內",
        "1年內","2年內","3年內","4年內","5年內",
        "6年內","7年內","8年內","9年內",
      ]),
      syntaxExamples: buildSyntaxExamples(
        ["搜尋網址中包含「登入」的頁面","搜尋標題中包含「指南」的頁面","搜尋 PDF 檔案","搜尋內容中包含「隱私」的頁面","排除包含「關鍵字」的頁面","在 example.com 內搜尋"],
        ["inurl:登入","intitle:指南","filetype:pdf","intext:隱私","-關鍵字","site:example.com"]
      ),
      timeUnsupported: "⚠️ 此搜尋引擎不支援時間篩選",
    },
    zh_CN: {
      siteTitle: "站点群组",
      timeLabel: "🕐 时间筛选",
      unlimited: "无限制",
      expand: "🎨展开样式调整介面",
      collapse: "收起样式调整介面",
      toggleShow: "显示网址",
      toggleHide: "显示注解",
      addGroup: "添加群组 ➕",
      editGroup: "编辑群组 ✏️",
      delGroup: "删除群组 🗑️",
      addSite: "添加站点 ➕",
      editSite: "编辑站点 ✏️",
      notFound: "未找到搜索输入框！",
      enterGroupName: "输入群组名称",
      enterSite: "输入站点网址（例如：example.com）\n\n若对⚙️按右键可删除域名",
      confirmDel: (name) => `确认删除群组 "${name}"？（直接确认）`,
      exportConfig: "导出设置 📤",
      importConfig: "导入设置 📥",
      searchConfig: "⚙️ 搜索设置",
      exclude1: "排除关键字1",
      exclude2: "排除关键字2",
      syntaxHelp: "搜索语法参考 📖",
      copied: "已复制！ 📋",
      syntaxPanelTitle: "搜索语法参考 📖",
      groupNameUpdated: "群组名称已更新！",
      groupDeleted: (name) => `群组 "${name}" 已删除！`,
      multiSelectMode: "多选",
      multiSelectSend: "打开已选",
      multiSelectConfirm: (n) => `确定在新标签页打开已选的 ${n} 个站点？`,
      multiSelectColor: "选取高亮颜色",
      multiSelectOpacity: "高亮透明度",
      siteButtonWidth: "站点按钮宽度",
      siteButtonWidthAuto: "自动",
      multiSelectNone: "尚未选取任何站点！",
      panelHelp: "📋 站点群组面板说明\n\n▸ 群组标头按钮：\n  ✎  重命名群组\n  ➕  新增站点至群组\n  🗑️  删除群组\n  ☑  进入多选模式\n  ↗  打开已选站点（多选模式中才显示）\n\n▸ 站点按钮：\n  左键点击      — 套用 site: 筛选搜索\n  长按拖曳      — 在群组内重新排序\n  ⋯（三点菜单）— 打开站点菜单：\n      ✏️ 编辑 URL / 备注\n      🗑️ 删除站点\n      🔗 打开（当前标签页）\n      ↗ 打开（新标签页）\n\n▸ 多选模式：\n  点击站点按钮可选取/取消选取（金色光晕）。\n  再次点击 ☑，或点击 ↗ 发送后退出。\n\n▸ 引擎列（顶部图标列）：\n  点击图标，以当前关键字跳转至对应引擎。\n  在引擎管理面板拖拽 ⠿ 排序，前 5 个显示为图标。\n\n▸ 时间筛选（引擎列下方下拉菜单）：\n  将搜索结果限定在特定时间范围（1小时 ~ 9年）。\n  选择「无限制」可清除筛选。\n\n▸ 搜索设置 ⚙️：\n  设置排除关键字、语法参考、导入/导出设置。\n\n▸ 📌 按钮（右上角）：\n  控制面板是否自动打开。\n  ⛔ OFF — 默认关闭  ✅ ON — 页面加载时打开\n  📌 固定 — 始终显示\n  另有：🔒 安全搜索 OFF 与 🌐 搜索地区开关。",
      dpItemHint: {
        off:          "面板默认关闭，需手动点击 🔍 打开。",
        on:           "每次页面加载时自动打开面板。",
        pinned:       "面板始终显示，无法被关闭。",
        safeSearch:   "尝试注入 URL 参数（如 safe=off）来关闭安全过滤。不保证有效。OFF = 完全不介入。",
        searchRegion: "尝试移除地区限定 URL 参数（如 gl、mkt），让结果不受限于特定国家。OFF = 完全不介入。",
      },
      multiSelectSendTitle: "打开已选站点",
      multiSelectSendMsg: (n, urls) => `确定打开 ${n} 个站点？\n\n${urls}`,
      multiSelectRemember: "记住此次选择",
      multiSelectClearAfter: "送出后退出多选模式",
      multiSelectRememberSel: "记忆此群组的多选选取",
      multiSelectBanner: "☑ 多选模式 — 点击站点选取 · 再按 ☑ 或送出 ↗ 退出",
      multiSelectKeyword: "搜索关键字（可选）",
      siteMenuEdit: "✏️ 编辑",
      siteMenuDelete: "🗑️ 删除",
      siteMenuOpenSame: "🔗 打开（当前标签页）",
      siteMenuOpenNew: "↗ 打开（新标签页）",
      multiSelectModeLabel: "送出方式（互斥选择）：",
      modeSiteSearch: "site:A OR site:B 搜索（当前标签页）",
      modeSiteSearchNew: "site:A OR site:B 搜索（新标签页）",
      modeOpenOnly: "直接打开各站点（不附加搜索词）",
      langSwitched: "语言已切换！",
      toggleReset: "🔍 位置已重置",
      filterError: "搜索过滤应用失败，请稍后重试！",
      siteEditHint: "左键编辑 | 右键删除",
      close: "关闭",
      editSiteSuccess: "站点编辑成功！",
      emptyInput: "输入不能为空！",
      panelPinned: "📌 引擎面板已固定",
      panelUnpinned: "📌 引擎面板已取消固定",
      defaultPanelOpen: "默认开启面板 🗂️",
      safeSearchLabel: "🔒 安全搜索 OFF",
      safeSearchOn:  "🔒 安全搜索 OFF：已开启",
      safeSearchOff: "🔓 安全搜索 OFF：已关闭",
      safeSearchWarning: "🔒 安全搜索 OFF — 运作说明\n\n▸ 开启 → 每次跳转到搜索引擎时，脚本会尝试在网址中注入对应参数（如 safe=off、adlt=off），让搜索引擎关闭安全过滤。\n▸ 关闭 → 脚本完全不介入，所有搜索行为保持原状。\n\n⚠️ 不保证有效：各引擎可能忽略这些参数，或随时更改机制。百度不支持此功能。\n\n此提示只出现一次。",
      searchRegionLabel: "🌐 搜索地区：全部",
      searchRegionOn:  "🌐 搜索地区：全部 — 已开启",
      searchRegionOff: "🌐 搜索地区：全部 — 已关闭",
      searchRegionWarning: "🌐 搜索地区：全部 — 运作说明\n\n▸ 开启 → 每次跳转到搜索引擎时，脚本会尝试移除或替换网址中的国家/地区参数（如 gl、mkt、kl），让搜索结果不被限定在特定国家。\n▸ 关闭 → 脚本完全不介入，地区设置保持原状。\n\n⚠️ 不保证有效：部分引擎可能通过 IP 或 Cookie 自动检测地区。百度与 Naver 不支持此功能。\n\n此提示只出现一次。",
      styleConfig: "样式设置 🎨",
      panelLayout: "面板布局",
      panelTopLabel: "距顶部",
      panelRightLabel: "距右侧",
      panelWidthLabel: "最大宽度",
      panelHeightLabel: "最大高度",
      panelWidthHint: "↺ 重置 = 恢复语系默认宽度",
      seBarOffsetLabel: "引擎列上移 50px",
      hideSyntaxBtnLabel: "隱藏 📖 語法說明按鈕",
      hideBlacklistBtnLabel: "隱藏 🚫 黑名单按钮",
      toggleBtnStyleLabel:    "开关按钮样式",
      toggleBtnIconLabel:     "图标",
      toggleBtnIconEmoji:     "🔍 Emoji",
      toggleBtnIconSvgLine:   "SVG 线框",
      toggleBtnIconSvgFill:   "SVG 填色",
      toggleBtnBgColorLabel:  "背景颜色",
      toggleBtnBgOpacityLabel:"背景透明度",
      svgIconColorLabel:      "SVG 图标颜色",
      style: "风格",
      borderRadius: "圆角",
      contrast: "对比度",
      opacity: "透明度",
      fontSize: "文字大小",
      backgroundImage: "背景图片",
      imageMode: "图片模式",
      textColor: "文字颜色",
      backgroundColor: "背景颜色",
      imageOffsetX: "图片 X 偏移",
      imageOffsetY: "图片 Y 偏移",
      groupOpacity: "群组透明度",
      imageScale: "图片缩放",
      imageOpacity: "图片透明度",
      theme: "主题",
      resetStyles: "重置样式 🔄",
      resetStylesConfirm: "确定重置所有样式设置？\n（面板布局、字体、透明度等全部恢复默认值）",
      importConfigSuccess: "导入成功！",
      importConfigFailed: "导入失败：无效的 JSON 格式！",
      invalidSite: "请输入有效的网址（例如：example.com）！",
      enterSiteNote: "请输入 1~4 字的站点备注（可留空）：",
      noteTooLong: "备注不得超过 4 个字！",
      emptyGroupName: "群组名称不能为空！",
      confirm: "确认",
      cancel: "取消",
      exportConfigSuccess: "设置导出成功！ 📤",
      deleteKeyword: "删除关键字",
      resetStylesSuccess: "样式已重置！",
      importConfigPrompt: "选择要导入的 JSON 文件",
      invalidFileType: "请选择有效的 JSON 文件！",
      promptClose: "点击外部关闭",
      textBackgroundColor: "文字背景颜色",
      textBorder: "启用文字边框",
      customButtonBg: "按钮背景",
      textOpacityCompensation: "文字清晰强化",
      buttonOpacity: "按钮透明度",
      contrastStatus: "对比度：",
      high: "高",
      low: "低",
      enhancedClarity: "清晰度：",
      enabled: "开啟",
      disabled: "关闭",
      groupBackgroundColor: "群组背景顏色",
      enableOverlayDarkening: "启用黑幕效果",
      overlayStrength: "黑幕强度",
      searchSites: "搜索站点...",
      searchHistory: "搜索历史",
      clearSearchHistory: "清除搜索历史",
      noSearchHistory: "无搜索历史",
      searchBarStyleLabel:    "搜索栏样式",
      searchBarPreset:        "快速套色",
      searchBarBgColor:       "栏背景色",
      searchBarBgOpacity:     "栏背景透明度",
      searchBarFgColor:       "栏文字颜色",
      searchBarGlowEnabled:   "搜索栏光晕",
      searchBarGlowColor:     "光晕颜色",
      searchBarGlowStrength:  "光晕强度",
      customThemeLabel:       "自定义主题",
      quickSchemeLabel:       "🎨 快速方案",
      quickSchemeLight:       "☀️ 亮色",
      quickSchemeDark:        "🌑 深色",
      quickSchemeReset:       "↺ 重置",
      glowLabel:              "边框光泽 / 高光",
      enableBorderGlow:       "边框光晕",
      borderGlowColor:        "光晕颜色",
      borderGlowStrength:     "光晕强度",
      borderGlowInset:        "内壁光",
      enableSheen:            "高光光泽 (Sheen)",
      sheenAngle:             "光泽角度",
      sheenOpacity:           "光泽强度",
      enableSiteGlow:         "站点按钮光晕",
      enableGroupGlow:        "群组区块光晕",
      styleOptions: {
        default: "默认",
        soft: "柔和",
        bold: "立体",
      },
      imageModes: {
        center: "居中",
        tile: "平铺",
        contain: "自适应",
        auto: "原尺寸",
      },
      themeOptions: {
        light: "浅色 ☀️",
        dark: "深色 🌙",
        custom: "自定义 🎨",
      },
      uploadImage: "上传图片 📤",
      clearImage: "清除图片 🗑️",
      blacklistBtn: "🚫 黑名单",
      blacklistTitle: "域名黑名单",
      blacklistPlaceholder: "每行输入一个域名，例如：pinterest.com",
      blacklistSaved: (n) => `黑名单已保存 — 已屏蔽 ${n} 个域名`,
      blacklistCount: (n) => `当前屏蔽 ${n} 个域名`,
      blacklistInvalid: (d) => `无效域名已跳过：「${d}」`,
      onboarding: {
        step0Title: "🔍 找到面板入口",
        step0Body: "看到页面上的 <b>🔍 按钮</b>了吗？那就是入口。\n随时点击它来打开或关闭主面板。",
        step1Title: "👋 欢迎使用！",
        step1Body: "让我们快速上手。\n请先点击 <b>添加群组 ➕</b> 创建一个站点群组（例如「新闻」、「开发」）。",
        step2Title: "📂 群组创建完成！",
        step2Body: "很好！现在点击群组内的 <b>添加站点 ➕</b>，加入一个网站（例如 github.com）。",
        step3Title: "✅ 设置完成！",
        step3Body: "点击任意站点按钮即可缩小搜索范围。\n之后可以随时添加更多群组与站点。\n开始搜索吧！🚀",
        next: "下一步 →",
        skip: "跳过",
        finish: "知道了！",
      },
      se: {
        panelTitle: "搜索引擎管理",
        helpTooltip:
          "使用说明：所有引擎在同一列表中。\n• 排在第 1–5 位的引擎会在顶部显示为快速图标。\n• 拖拽 ⠿ 调整顺序——移到前 5 个就会显示为顶部图标。\n• 点击 → 可用当前关键字跳转。\n• 点击 ✕ 删除引擎。",
        lockLabel: "🔒 锁定引擎提示",
        lockEnabled: "🔒 锁定引擎提示已启用",
        lockDisabled: "🔓 锁定引擎提示已关闭",
        lockToast: (name) => `🔒 锁定提示：${name}（点击图标手动跳转）`,
        allEnginesLabel: "所有引擎（前 5 个显示为图标）",
        addSectionLabel: "新增引擎",
        detectBtn: "🔍 智能检测当前网站",
        detectFirstTip: "💡 若要添加跨域搜索引擎，请在脚本管理器中手动将对应网址加入 @include 规则。",
        detectFirstTipTitle: "跨域提示",
        detectOk: "知道了",
        detectConfirmTitle: "添加搜索引擎？",
        detectConfirm: (name, url) => `检测到：${name}\n${url}\n\n是否添加为搜索引擎？`,
        detectSuccess: (name) => `✅ 已添加：${name}`,
        detectFail: "❌ 无法在此页面检测到搜索引擎 URL。",
        adviceBannerText: "💡 此脚本较适合作为各大主流搜索引擎的快速辅助工具。若需管理更多自定义引擎，可考虑使用更专业的浏览器扩展。",
        adviceBannerTitle: "使用提示",
        namePlaceholder: "引擎名称 (e.g. Google)",
        urlPlaceholder: "搜索 URL (结尾含 ?q=)",
        addBtn: "➕ 新增",
        emptyList: "（暂无引擎，请在下方新增）",
        addSuccess: (name) => `✅ 已新增：${name}`,
        nameEmpty: "名称与 URL 不能为空！",
        urlInvalid: "URL 需以 http 开头！",
        pinnedBadge: "顶部",
        noKeyword: "无法获取搜索关键字",
        newWindowBtn: "⧉",
        newWindowTitle: "在新窗口打开",
        dpTitle: {
          pinned: "面板始终显示（已固定）\n点击可切换",
          on: "默认打开面板（ON）\n点击可切换",
          off: "默认关闭面板（OFF）\n点击可切换",
          offToast: "⛔ OFF — 面板目前仍开着，点击 🔍 或面板外侧可关闭。",
        },
      },
      timeOptions: buildTimeOptions([
        "1小时内","2小时内","3小时内","6小时内","12小时内",
        "1天内","2天内","3天内",
        "1周内","3周内",
        "1月内","3月内","6月内",
        "1年内","2年内","3年内","4年内","5年内",
        "6年内","7年内","8年内","9年内",
      ]),
      syntaxExamples: buildSyntaxExamples(
        ["搜索网址中包含「登录」的页面","搜索标题中包含「指南」的页面","搜索 PDF 文件","搜索内容中包含「隐私」的页面","排除包含「关键字」的页面","在 example.com 内搜索"],
        ["inurl:登录","intitle:指南","filetype:pdf","intext:隐私","-关键字","site:example.com"]
      ),
      timeUnsupported: "⚠️ 此搜索引擎不支持时间筛选",
    },
    ja: {
      siteTitle: "ｻｲﾄｸﾞﾙｰﾌﾟ",
      timeLabel: "🕐 時間ﾌｨﾙﾀｰ",
      unlimited: "無制限",
      expand: "🎨展開ｽﾀｲﾙ調整ｲﾝﾀｰﾌｪｰｽ",
      collapse: "折り畳むｽﾀｲﾙ調整ｲﾝﾀｰﾌｪｰｽ",
      toggleShow: "ｱﾄﾞﾚｽを表示",
      toggleHide: "注釈を表示",
      addGroup: "ｸﾞﾙｰﾌﾟを追加 ➕",
      editGroup: "ｸﾞﾙｰﾌﾟを編集 ✏️",
      delGroup: "ｸﾞﾙｰﾌﾟを削除 🗑️",
      addSite: "ｻｲﾄを追加 ➕",
      editSite: "ｻｲﾄを編集 ✏️",
      notFound: "検索入力欄が見つかりません！",
      enterGroupName: "ｸﾞﾙｰﾌﾟ名を入力",
      enterSite:
        "ｻｲﾄのURLを入力（例：example.com）\n\n⚙️ を右クリックするとドメインを削除できます",
      confirmDel: (name) => `ｸﾞﾙｰﾌﾟ "${name}" を削除しますか？（入力無し）`,
      exportConfig: "設定をｴｸｽﾎﾟｰﾄ 📤",
      importConfig: "設定をｲﾝﾎﾟｰﾄ 📥",
      searchConfig: "⚙️ 検索設定",
      exclude1: "除外ｷｰﾜｰﾄﾞ1",
      exclude2: "除外ｷｰﾜｰﾄﾞ2",
      syntaxHelp: "検索構文リファレンス 📖",
      copied: "ｺﾋﾟｰしました！ 📋",
      syntaxPanelTitle: "検索構文リファレンス 📖",
      groupNameUpdated: "ｸﾞﾙｰﾌﾟ名を更新しました！",
      groupDeleted: (name) => `ｸﾞﾙｰﾌﾟ "${name}" を削除しました！`,
      multiSelectMode: "複数選択",
      multiSelectSend: "選択を開く",
      multiSelectConfirm: (n) => `選択した ${n} 件のサイトを新しいタブで開きますか？`,
      multiSelectColor: "選択ハイライト色",
      multiSelectOpacity: "ハイライト透明度",
      siteButtonWidth: "ｻｲﾄﾎﾞﾀﾝ幅",
      siteButtonWidthAuto: "自動",
      multiSelectNone: "サイトが選択されていません！",
      panelHelp: "📋 サイトグループパネル説明\n\n▸ グループヘッダーボタン：\n  ✎  グループ名を変更\n  ➕  グループにサイトを追加\n  🗑️  グループを削除\n  ☑  複数選択モードに入る\n  ↗  選択済みサイトを開く（複数選択モード時のみ）\n\n▸ サイトボタン：\n  左クリック        — site: フィルターを適用して検索\n  長押しドラッグ    — グループ内で並び替え\n  ⋯（三点メニュー）— サイトメニューを開く：\n      ✏️ URL / メモを編集\n      🗑️ サイトを削除\n      🔗 開く（現在のタブ）\n      ↗ 開く（新しいタブ）\n\n▸ 複数選択モード：\n  サイトをクリックして選択/解除（ゴールドハイライト）。\n  ☑ を再クリック、または ↗ 送信後に解除。\n\n▸ エンジン列（上部アイコン列）：\n  アイコンをクリックすると現在のキーワードで遷移。\n  エンジン管理で ⠿ ドラッグして並び替え、上位5件がアイコン表示。\n\n▸ 時間フィルター（エンジン列下のドロップダウン）：\n  検索結果を特定の期間に限定（1時間〜9年）。\n  「無制限」を選択するとフィルター解除。\n\n▸ 検索設定 ⚙️：\n  除外キーワード設定・構文リファレンス・設定インポート/エクスポート。\n\n▸ 📌 ボタン（右上）：\n  パネルの自動表示を制御します。\n  ⛔ OFF — デフォルト非表示  ✅ ON — ページ読み込み時に開く\n  📌 固定 — 常に表示\n  その他：🔒 セーフサーチ OFF・🌐 検索地域 の切り替えも含む。",
      dpItemHint: {
        off:          "パネルはデフォルトで非表示。🔍 をクリックして手動で開きます。",
        on:           "ページ読み込みのたびにパネルを自動表示します。",
        pinned:       "パネルを常に表示し、閉じることができません。",
        safeSearch:   "URLパラメータ（safe=off など）を注入してセーフサーチを無効化しようとします。効果の保証なし。OFF = 不介入。",
        searchRegion: "地域URLパラメータ（gl、mkt など）を削除して特定国に限定されない結果を表示しようとします。OFF = 不介入。",
      },
      multiSelectSendTitle: "選択済みサイトを開く",
      multiSelectSendMsg: (n, urls) => `${n} 件のサイトを新しいタブで開きますか？\n\n${urls}`,
      multiSelectRemember: "この選択を記憶する",
      multiSelectClearAfter: "送信後に複数選択モードを解除",
      multiSelectRememberSel: "このグループの複数選択を記憶する",
      multiSelectBanner: "☑ 複数選択モード — サイトをクリックして選択 · ☑ または ↗ で終了",
      multiSelectKeyword: "検索キーワード（任意）",
      siteMenuEdit: "✏️ 編集",
      siteMenuDelete: "🗑️ 削除",
      siteMenuOpenSame: "🔗 開く（現在のタブ）",
      siteMenuOpenNew: "↗ 開く（新しいタブ）",
      multiSelectModeLabel: "送信方式（排他選択）：",
      modeSiteSearch: "site:A OR site:B 検索（現在のタブ）",
      modeSiteSearchNew: "site:A OR site:B 検索（新しいタブ）",
      modeOpenOnly: "各サイトを直接開く（検索ワードなし）",
      langSwitched: "言語を切り替えました！",
      toggleReset: "🔍 位置をリセットしました",
      filterError: "検索ﾌｨﾙﾀｰの適用に失敗しました。もう一度お試しください！",
      siteEditHint: "左ｸﾘｯｸで編集 | 右ｸﾘｯｸで削除",
      close: "閉じる",
      editSiteSuccess: "ｻｲﾄを編集しました！",
      emptyInput: "入力は空にできません！",
      panelPinned: "📌 ｴﾝｼﾞﾝﾊﾟﾈﾙを固定しました",
      panelUnpinned: "📌 ｴﾝｼﾞﾝﾊﾟﾈﾙの固定を解除しました",
      defaultPanelOpen: "ﾊﾟﾈﾙを自動開く",
      safeSearchLabel: "🔒 ｾｰﾌｻｰﾁ OFF",
      safeSearchOn:  "🔒 ｾｰﾌｻｰﾁ OFF：有効",
      safeSearchOff: "🔓 ｾｰﾌｻｰﾁ OFF：無効",
      safeSearchWarning: "🔒 セーフサーチ OFF — 動作説明\n\n▸ ON  → 検索エンジンに移動するたびに、URLパラメータ（safe=off、adlt=off など）を注入してセーフサーチを無効化しようとします。\n▸ OFF → スクリプトは一切介入せず、検索の動作をそのまま維持します。\n\n⚠️ 効果の保証なし：エンジンがパラメータを無視したり、仕様を変更する場合があります。Baiduは非対応。\n\nこの通知は一度だけ表示されます。",
      searchRegionLabel: "🌐 検索地域：全地域",
      searchRegionOn:  "🌐 検索地域：全地域 — ON",
      searchRegionOff: "🌐 検索地域：全地域 — OFF",
      searchRegionWarning: "🌐 検索地域：全地域 — 動作説明\n\n▸ ON  → 検索エンジンに移動するたびに、地域/国のURLパラメータ（gl、mkt、kl など）を削除または置換し、特定の国に限定されない結果を表示しようとします。\n▸ OFF → スクリプトは一切介入せず、地域設定をそのまま維持します。\n\n⚠️ 効果の保証なし：エンジンがIPやCookieで地域を自動検出する場合があります。BaiduおよびNaverは非対応。\n\nこの通知は一度だけ表示されます。",
      styleConfig: "スタイル設定 🎨",
      panelLayout: "ﾊﾟﾈﾙ配置",
      panelTopLabel: "上余白",
      panelRightLabel: "右余白",
      panelWidthLabel: "最大幅",
      panelHeightLabel: "最大高さ",
      panelWidthHint: "↺ リセット = 言語別デフォルト幅",
      seBarOffsetLabel: "ｴﾝｼﾞﾝ列+50px上移",
      hideSyntaxBtnLabel: "📖 構文ﾍﾙﾌﾟを非表示",
      hideBlacklistBtnLabel: "🚫 除外域ﾎﾞﾀﾝを非表示",
      toggleBtnStyleLabel:    "ﾄｸﾞﾙﾎﾞﾀﾝｽﾀｲﾙ",
      toggleBtnIconLabel:     "ｱｲｺﾝ",
      toggleBtnIconEmoji:     "🔍 Emoji",
      toggleBtnIconSvgLine:   "SVG ｱｳﾄﾗｲﾝ",
      toggleBtnIconSvgFill:   "SVG ﾌｨﾙ",
      toggleBtnBgColorLabel:  "背景色",
      toggleBtnBgOpacityLabel:"背景透明度",
      svgIconColorLabel:      "SVGｱｲｺﾝ色",
      style: "スタイル",
      borderRadius: "角の丸み",
      contrast: "コントラスト",
      opacity: "透明度",
      fontSize: "フォントサイズ",
      backgroundImage: "背景画像",
      imageMode: "画像モード",
      textColor: "文字色",
      backgroundColor: "背景色",
      imageOffsetX: "画像 X オフセット",
      imageOffsetY: "画像 Y オフセット",
      groupOpacity: "グループ透明度",
      imageScale: "画像スケール",
      imageOpacity: "画像透明度",
      theme: "テーマ",
      resetStyles: "スタイルをリセット 🔄",
      resetStylesConfirm: "すべてのスタイル設定をリセットしますか？\n（レイアウト・フォント・透明度などが初期値に戻ります）",
      importConfigSuccess: "インポートに成功しました！",
      importConfigFailed: "インポートに失敗しました：無効なJSON形式！",
      invalidSite: "有効なURLを入力してください（例：example.com）！",
      enterSiteNote: "1～4文字のサイト注釈を入力してください（空でも可）：",
      noteTooLong: "注釈は4文字を超えることはできません！",
      emptyGroupName: "ｸﾞﾙｰﾌﾟ名は空にできません！",
      confirm: "確認",
      cancel: "ｷｬﾝｾﾙ",
      exportConfigSuccess: "設定のｴｸｽﾎﾟｰﾄに成功しました！ 📤",
      deleteKeyword: "キーワードを削除",
      resetStylesSuccess: "スタイルをリセットしました！",
      importConfigPrompt: "ｲﾝﾎﾟｰﾄするJSONﾌｧｲﾙを選択してください",
      invalidFileType: "有効なJSONﾌｧｲﾙを選択してください！",
      promptClose: "外側をｸﾘｯｸして閉じる",
      textBackgroundColor: "ﾃｷｽﾄの背景色",
      textBorder: "ﾃｷｽﾄの枠線を有効にする",
      customButtonBg: "ﾎﾞﾀﾝの背景",
      textOpacityCompensation: "文字ｸｯｷﾘ強化",
      buttonOpacity: "ﾎﾞﾀﾝ透明度",
      contrastStatus: "ｺﾝﾄﾗｽﾄ：",
      high: "高い",
      low: "低い",
      enhancedClarity: "ｸｯｷﾘ度：",
      enabled: "有効",
      disabled: "無効",
      groupBackgroundColor: "ｸﾞﾙｰﾌﾟ背景色",
      enableOverlayDarkening: "黒幕効果を有効化",
      overlayStrength: "黒幕の強度",
      searchSites: "ｻｲﾄを検索...",
      searchHistory: "検索履歴",
      clearSearchHistory: "検索履歴をｸﾘｱ",
      noSearchHistory: "検索履歴なし",
      searchBarStyleLabel:    "検索ﾊﾞｰｽﾀｲﾙ",
      searchBarPreset:        "ｸｲｯｸﾌﾟﾘｾｯﾄ",
      searchBarBgColor:       "ﾊﾞｰ背景色",
      searchBarBgOpacity:     "ﾊﾞｰ背景不透明度",
      searchBarFgColor:       "ﾊﾞｰ文字色",
      searchBarGlowEnabled:   "検索ﾊﾞｰｸﾞﾛｳ",
      searchBarGlowColor:     "ｸﾞﾛｳ色",
      searchBarGlowStrength:  "ｸﾞﾛｳ強度",
      customThemeLabel:       "ｶｽﾀﾑﾃｰﾏ",
      quickSchemeLabel:       "🎨 ｸｲｯｸ方案",
      quickSchemeLight:       "☀️ ﾗｲﾄ",
      quickSchemeDark:        "🌑 ﾀﾞｰｸ",
      quickSchemeReset:       "↺ ﾘｾｯﾄ",
      enableBorderGlow:       "枠ｸﾞﾛｳ",
      borderGlowColor:        "ｸﾞﾛｳ色",
      borderGlowStrength:     "ｸﾞﾛｳ強度",
      borderGlowInset:        "内側ｸﾞﾛｳ",
      enableSheen:            "光沢ｼｰﾝ",
      sheenAngle:             "光沢角度",
      sheenOpacity:           "光沢強度",
      enableSiteGlow:         "ｻｲﾄﾎﾞﾀﾝｸﾞﾛｳ",
      enableGroupGlow:        "ｸﾞﾙｰﾌﾟｸﾞﾛｳ",

      styleOptions: {
        default: "デフォルト",
        soft: "ソフト",
        bold: "ボールド",
      },
      imageModes: {
        center: "中央",
        tile: "タイル",
        contain: "適合",
        auto: "オリジナル",
      },
      themeOptions: {
        light: "明るい ☀️",
        dark: "暗い 🌙",
        custom: "カスタム 🎨",
      },
      uploadImage: "画像をアップロード 📤",
      clearImage: "画像をクリア 🗑️",
      blacklistBtn: "🚫 除外域",
      blacklistTitle: "ドメインﾌﾞﾗｯｸﾘｽﾄ",
      blacklistPlaceholder: "1行に1ドメイン（例：pinterest.com）",
      blacklistSaved: (n) => `ﾌﾞﾗｯｸﾘｽﾄを保存しました — ${n} 件ブロック`,
      blacklistCount: (n) => `現在 ${n} 件ブロック中`,
      blacklistInvalid: (d) => `無効なドメインをスキップしました：「${d}」`,
      onboarding: {
        step0Title: "🔍 パネルの開き方",
        step0Body: "ページ上の <b>🔍 ボタン</b>が見えますか？それが入口です。\nいつでもクリックしてメインパネルを開閉できます。",
        step1Title: "👋 ようこそ！",
        step1Body: "さっそく始めましょう。\nまず <b>ｸﾞﾙｰﾌﾟを追加 ➕</b> をクリックしてサイトグループを作成してください（例：「ニュース」「開発」）。",
        step2Title: "📂 グループ作成完了！",
        step2Body: "次はグループ内の <b>サイト追加 ➕</b> をクリックしてサイトを追加しましょう（例：github.com）。",
        step3Title: "✅ 設定完了！",
        step3Body: "サイトボタンをクリックすると検索範囲を絞り込めます。\nグループやサイトはいつでも追加できます。\n検索を楽しんでください！🚀",
        next: "次へ →",
        skip: "スキップ",
        finish: "了解！",
      },
      se: {
        panelTitle: "検索エンジン管理",
        helpTooltip:
          "使い方：すべてのエンジンは1つのリストに統合されています。\n• 上から5番目までのエンジンがヘッダーにアイコン表示されます。\n• ⠿ をドラッグして並び替え — 上位5位以内に移動するとアイコンとして表示されます。\n• → をクリックすると現在のキーワードで遷移します。\n• ✕ をクリックで削除。",
        lockLabel: "🔒 エンジンロック通知",
        lockEnabled: "🔒 エンジンロック通知を有効化",
        lockDisabled: "🔓 エンジンロック通知を無効化",
        lockToast: (name) =>
          `🔒 ロック通知：${name}（アイコンをクリックして遷移）`,
        allEnginesLabel: "全エンジン（上位5件がアイコン表示）",
        addSectionLabel: "エンジンを追加",
        detectBtn: "🔍 現在のサイトを自動検出",
        detectFirstTip: "💡 クロスオリジンの検索エンジンを追加するには、スクリプトマネージャーの @include ルールに対象URLを手動で追加してください。",
        detectFirstTipTitle: "クロスオリジン通知",
        detectOk: "了解",
        detectConfirmTitle: "検索エンジンを追加？",
        detectConfirm: (name, url) => `検出：${name}\n${url}\n\n検索エンジンとして追加しますか？`,
        detectSuccess: (name) => `✅ 追加しました：${name}`,
        detectFail: "❌ このページで検索エンジンのURLを検出できませんでした。",
        adviceBannerText: "💡 このスクリプトは主要な検索エンジンの補助ツールとして最適です。より多くのカスタムエンジン管理が必要な場合は、専用のブラウザ拡張機能をご検討ください。",
        adviceBannerTitle: "使用ヒント",
        namePlaceholder: "エンジン名 (例: Google)",
        urlPlaceholder: "検索URL（?q= で終わるもの）",
        addBtn: "➕ 追加",
        emptyList: "（エンジンなし — 下から追加してください）",
        addSuccess: (name) => `✅ 追加しました：${name}`,
        nameEmpty: "名前とURLは必須です！",
        urlInvalid: "URLはhttpから始まる必要があります！",
        pinnedBadge: "TOP",
        noKeyword: "検索キーワードを取得できません",
        newWindowBtn: "⧉",
        newWindowTitle: "新しいウィンドウで開く",
        dpTitle: {
          pinned: "パネルを常に表示（固定中）\nクリックで切替",
          on: "デフォルトでパネルを開く（ON）\nクリックで切替",
          off: "デフォルトでパネルを閉じる（OFF）\nクリックで切替",
          offToast: "⛔ OFF — パネルは現在表示中。🔍 またはパネル外をクリックして閉じます。",
        },
      },
      timeOptions: buildTimeOptions([
        "1ｱﾜ以内","2ｱﾜ以内","3ｱﾜ以内","6ｱﾜ以内","12ｱﾜ以内",
        "1日以内","2日以内","3日以内",
        "1週間以内","3週間以内",
        "1ｶ月以内","3ｶ月以内","6ｶ月以内",
        "1年以内","2年以内","3年以内","4年以内","5年以内",
        "6年以内","7年以内","8年以内","9年以内",
      ]),
      syntaxExamples: buildSyntaxExamples(
        ["URLに「ﾛｸﾞｲﾝ」を含むﾍﾟｰｼﾞを検索","ﾀｲﾄﾙに「ｶﾞｲﾄﾞ」を含むﾍﾟｰｼﾞを検索","PDFﾌｧｲﾙを検索","本文に「ﾌﾟﾗｲﾊﾞｼｰ」を含むﾍﾟｰｼﾞを検索","「ｷｰﾜｰﾄﾞ」を含むﾍﾟｰｼﾞを除外","example.com内で検索"],
        ["inurl:ﾛｸﾞｲﾝ","intitle:ｶﾞｲﾄﾞ","filetype:pdf","intext:ﾌﾟﾗｲﾊﾞｼｰ","-ｷｰﾜｰﾄﾞ","site:example.com"]
      ),
      timeUnsupported: "⚠️ この検索エンジンは時間ﾌｨﾙﾀｰに対応していません",
    },
    ko: {
      siteTitle: "사이트 그룹",
      timeLabel: "🕐 시간 필터",
      unlimited: "제한 없음",
      expand: "🎨스타일 조정 인터페이스 펼치기",
      collapse: "스타일 조정 인터페이스 접기",
      toggleShow: "주소 표시",
      toggleHide: "메모 표시",
      addGroup: "그룹 추가 ➕",
      editGroup: "그룹 편집 ✏️",
      delGroup: "그룹 삭제 🗑️",
      addSite: "사이트 추가 ➕",
      editSite: "사이트 편집 ✏️",
      notFound: "검색 입력창을 찾을 수 없습니다！",
      enterGroupName: "그룹 이름 입력",
      enterSite: "사이트 URL 입력 (예: example.com)\n\n⚙️ 우클릭하면 도메인을 삭제할 수 있습니다",
      confirmDel: (name) => `그룹 "${name}"을(를) 삭제하시겠습니까？`,
      exportConfig: "설정 내보내기 📤",
      importConfig: "설정 가져오기 📥",
      searchConfig: "⚙️ 검색 설정",
      exclude1: "제외 키워드 1",
      exclude2: "제외 키워드 2",
      syntaxHelp: "검색 문법 참고서 📖",
      copied: "복사됨！ 📋",
      syntaxPanelTitle: "검색 문법 참고서 📖",
      groupNameUpdated: "그룹 이름이 업데이트되었습니다！",
      groupDeleted: (name) => `그룹 "${name}"이(가) 삭제되었습니다！`,
      multiSelectMode: "다중 선택",
      multiSelectSend: "선택 열기",
      multiSelectConfirm: (n) => `선택한 ${n}개의 사이트를 새 탭으로 열겠습니까？`,
      multiSelectColor: "선택 강조 색상",
      multiSelectOpacity: "강조 투명도",
      siteButtonWidth: "사이트 버튼 너비",
      siteButtonWidthAuto: "자동",
      multiSelectNone: "선택된 사이트가 없습니다！",
      panelHelp: "📋 사이트 그룹 패널 안내\n\n▸ 그룹 헤더 버튼：\n  ✎  그룹 이름 변경\n  ➕  그룹에 사이트 추가\n  🗑️  그룹 삭제\n  ☑  다중 선택 모드 진입\n  ↗  선택한 사이트 열기（다중 선택 모드에서만 표시）\n\n▸ 사이트 버튼：\n  좌클릭          — site: 필터 적용하여 검색\n  길게 드래그      — 그룹 내 순서 변경\n  ⋯（세 점 메뉴）  — 사이트 메뉴 열기：\n      ✏️ URL / 메모 편집\n      🗑️ 사이트 삭제\n      🔗 열기（현재 탭）\n      ↗ 열기（새 탭）\n\n▸ 다중 선택 모드：\n  사이트 버튼을 클릭하여 선택/해제（금색 하이라이트）。\n  ☑ 를 다시 클릭하거나 ↗ 전송 후 모드 해제。\n\n▸ 엔진 바（상단 아이콘 열）：\n  아이콘 클릭 시 현재 키워드로 해당 엔진으로 이동。\n  엔진 관리에서 ⠿ 드래그로 순서 변경, 상위 5개가 아이콘 표시。\n\n▸ 시간 필터（엔진 바 아래 드롭다운）：\n  검색 결과를 특정 기간으로 제한（1시간 ~ 9년）。\n  「제한 없음」 선택 시 필터 해제。\n\n▸ 검색 설정 ⚙️：\n  제외 키워드 설정, 문법 참고서, 설정 가져오기/내보내기。\n\n▸ 📌 버튼（우상단）：\n  패널 자동 표시 여부를 제어합니다。\n  ⛔ OFF — 기본 닫힘  ✅ ON — 페이지 로드 시 열림\n  📌 고정 — 항상 표시\n  그 외：🔒 세이프서치 OFF・🌐 검색 지역 전환도 포함。",
      dpItemHint: {
        off:          "패널이 기본으로 닫혀 있습니다。🔍 를 클릭하여 수동으로 열 수 있습니다。",
        on:           "페이지를 불러올 때마다 패널이 자동으로 열립니다。",
        pinned:       "패널이 항상 표시되며 닫을 수 없습니다。",
        safeSearch:   "URL 파라미터（safe=off 등）를 삽입하여 안전 검색 필터 비활성화 시도。효과 보장 없음。OFF = 개입 없음。",
        searchRegion: "지역 URL 파라미터（gl, mkt 등）를 제거하여 특정 국가로 제한되지 않은 결과 표시 시도。OFF = 개입 없음。",
      },
      multiSelectSendTitle: "선택한 사이트 열기",
      multiSelectSendMsg: (n, urls) => `${n}개의 사이트를 새 탭으로 열겠습니까？\n\n${urls}`,
      multiSelectRemember: "이 선택 기억하기",
      multiSelectClearAfter: "전송 후 다중 선택 모드 해제",
      multiSelectRememberSel: "이 그룹의 다중 선택 기억하기",
      multiSelectBanner: "☑ 다중 선택 모드 — 사이트 클릭으로 선택 · ☑ 또는 ↗ 으로 종료",
      multiSelectKeyword: "검색 키워드（선택 사항）",
      siteMenuEdit: "✏️ 편집",
      siteMenuDelete: "🗑️ 삭제",
      siteMenuOpenSame: "🔗 열기（현재 탭）",
      siteMenuOpenNew: "↗ 열기（새 탭）",
      multiSelectModeLabel: "전송 방식（상호 배타 선택）：",
      modeSiteSearch: "site:A OR site:B 검색（현재 탭）",
      modeSiteSearchNew: "site:A OR site:B 검색（새 탭）",
      modeOpenOnly: "각 사이트 직접 열기（검색어 없음）",
      langSwitched: "언어가 변경되었습니다！",
      toggleReset: "🔍 위치가 초기화되었습니다",
      filterError: "검색 필터 적용에 실패했습니다. 다시 시도해 주세요！",
      siteEditHint: "좌클릭으로 편집 | 우클릭으로 삭제",
      close: "닫기",
      editSiteSuccess: "사이트가 수정되었습니다！",
      emptyInput: "입력값이 비어 있습니다！",
      panelPinned: "📌 엔진 패널이 고정되었습니다",
      panelUnpinned: "📌 엔진 패널 고정이 해제되었습니다",
      defaultPanelOpen: "기본으로 패널 열기 🗂️",
      safeSearchLabel: "🔒 세이프서치 OFF",
      safeSearchOn:  "🔒 세이프서치 OFF：켜짐",
      safeSearchOff: "🔓 세이프서치 OFF：꺼짐",
      safeSearchWarning: "🔒 세이프서치 OFF — 작동 설명\n\n▸ ON  → 검색 엔진으로 이동할 때마다, 스크립트가 URL 파라미터(safe=off, adlt=off 등)를 삽입하여 안전 검색 필터를 비활성화하려고 시도합니다.\n▸ OFF → 스크립트는 아무것도 개입하지 않으며, 모든 검색 동작을 그대로 유지합니다.\n\n⚠️ 효과 보장 없음: 엔진이 해당 파라미터를 무시하거나 사양을 변경할 수 있습니다. Baidu는 지원되지 않습니다.\n\n이 안내는 한 번만 표시됩니다.",
      searchRegionLabel: "🌐 검색 지역: 전체",
      searchRegionOn:  "🌐 검색 지역: 전체 — ON",
      searchRegionOff: "🌐 검색 지역: 전체 — OFF",
      searchRegionWarning: "🌐 검색 지역: 전체 — 작동 설명\n\n▸ ON  → 검색 엔진으로 이동할 때마다, 스크립트가 URL의 국가/지역 파라미터(gl, mkt, kl 등)를 제거하거나 교체하여 특정 국가로 제한되지 않은 검색 결과를 표시하려고 시도합니다.\n▸ OFF → 스크립트는 아무것도 개입하지 않으며, 지역 설정을 그대로 유지합니다.\n\n⚠️ 효과 보장 없음: 일부 엔진은 IP 또는 쿠키로 지역을 자동 감지할 수 있습니다. Baidu 및 Naver는 지원되지 않습니다.\n\n이 안내는 한 번만 표시됩니다.",
      styleConfig: "스타일 설정 🎨",
      panelLayout: "패널 레이아웃",
      panelTopLabel: "상단 여백",
      panelRightLabel: "우측 여백",
      panelWidthLabel: "최대 너비",
      panelHeightLabel: "최대 높이",
      panelWidthHint: "↺ 초기화 = 언어 기본 너비 복원",
      seBarOffsetLabel: "엔진 바 +50px 위로",
      hideSyntaxBtnLabel: "📖 문법 도움말 숨기기",
      hideBlacklistBtnLabel: "🚫 차단목록 버튼 숨기기",
      toggleBtnStyleLabel:    "토글 버튼 스타일",
      toggleBtnIconLabel:     "아이콘",
      toggleBtnIconEmoji:     "🔍 Emoji",
      toggleBtnIconSvgLine:   "SVG 아웃라인",
      toggleBtnIconSvgFill:   "SVG 채우기",
      toggleBtnBgColorLabel:  "배경 색상",
      toggleBtnBgOpacityLabel:"배경 투명도",
      svgIconColorLabel:      "SVG 아이콘 색상",
      style: "스타일",
      borderRadius: "모서리 둥글기",
      contrast: "대비",
      opacity: "불투명도",
      fontSize: "폰트 크기",
      backgroundImage: "배경 이미지",
      imageMode: "이미지 모드",
      textColor: "글자 색상",
      backgroundColor: "배경 색상",
      imageOffsetX: "이미지 X 오프셋",
      imageOffsetY: "이미지 Y 오프셋",
      groupOpacity: "그룹 불투명도",
      imageScale: "이미지 크기",
      imageOpacity: "이미지 불투명도",
      theme: "테마",
      resetStyles: "스타일 초기화 🔄",
      resetStylesConfirm: "모든 스타일 설정을 초기화하시겠습니까？\n（레이아웃·글꼴·투명도 등이 기본값으로 돌아갑니다）",
      importConfigSuccess: "설정을 가져왔습니다！",
      importConfigFailed: "가져오기 실패：잘못된 JSON 형식！",
      invalidSite: "올바른 URL을 입력해 주세요 (예: example.com)！",
      enterSiteNote: "사이트 메모를 입력하세요 (4자 이내 권장)：",
      noteTooLong: "메모는 4자를 초과할 수 없습니다！",
      emptyGroupName: "그룹 이름을 입력해 주세요！",
      confirm: "확인",
      cancel: "취소",
      exportConfigSuccess: "설정을 내보냈습니다！ 📤",
      deleteKeyword: "키워드 삭제",
      resetStylesSuccess: "스타일이 초기화되었습니다！",
      importConfigPrompt: "가져올 JSON 파일을 선택하세요",
      invalidFileType: "올바른 JSON 파일을 선택해 주세요！",
      promptClose: "외부 클릭으로 닫기",
      customButtonBg: "버튼 배경",
      textBackgroundColor: "텍스트 배경 색상",
      textBorder: "텍스트 테두리 사용",
      textOpacityCompensation: "텍스트 선명도 강화",
      buttonOpacity: "버튼 불투명도",
      contrastStatus: "대비：",
      high: "높음",
      low: "낮음",
      enhancedClarity: "선명도：",
      enabled: "켜짐",
      disabled: "꺼짐",
      groupBackgroundColor: "그룹 배경 색상",
      enableOverlayDarkening: "오버레이 어둡게 효과",
      overlayStrength: "오버레이 강도",
      searchSites: "사이트 검색...",
      searchHistory: "검색 기록",
      clearSearchHistory: "검색 기록 지우기",
      noSearchHistory: "검색 기록 없음",
      searchBarStyleLabel:    "검색 바 스타일",
      searchBarPreset:        "빠른 프리셋",
      searchBarBgColor:       "바 배경색",
      searchBarBgOpacity:     "바 배경 투명도",
      searchBarFgColor:       "바 텍스트 색",
      searchBarGlowEnabled:   "검색 바 글로우",
      searchBarGlowColor:     "글로우 색",
      searchBarGlowStrength:  "글로우 강도",
      customThemeLabel:       "커스텀 테마",
      quickSchemeLabel:       "🎨 빠른 방안",
      quickSchemeLight:       "☀️ 라이트",
      quickSchemeDark:        "🌑 다크",
      quickSchemeReset:       "↺ 초기화",
      glowLabel:              "테두리 글로우 / 쉰",
      enableBorderGlow:       "테두리 글로우",
      borderGlowColor:        "글로우 색",
      borderGlowStrength:     "글로우 강도",
      borderGlowInset:        "안쪽 글로우",
      enableSheen:            "쉰 효과",
      sheenAngle:             "쉰 각도",
      sheenOpacity:           "쉰 강도",
      enableSiteGlow:         "사이트 버튼 글로우",
      enableGroupGlow:        "그룹 블록 글로우",
      styleOptions: {
        default: "기본",
        soft: "소프트",
        bold: "볼드",
      },
      imageModes: {
        center: "가운데",
        tile: "타일",
        contain: "맞춤",
        auto: "원본",
      },
      themeOptions: {
        light: "밝은 테마 ☀️",
        dark: "어두운 테마 🌙",
        custom: "사용자 정의 🎨",
      },
      uploadImage: "이미지 업로드 📤",
      clearImage: "이미지 삭제 🗑️",
      blacklistBtn: "🚫 차단목록",
      blacklistTitle: "도메인 블랙리스트",
      blacklistPlaceholder: "한 줄에 도메인 하나씩 입력 (예: pinterest.com)",
      blacklistSaved: (n) => `블랙리스트 저장 — ${n}개 도메인 차단`,
      blacklistCount: (n) => `현재 ${n}개 도메인 차단 중`,
      blacklistInvalid: (d) => `유효하지 않은 도메인 건너뜀: "${d}"`,
      onboarding: {
        step0Title: "🔍 패널 열기",
        step0Body: "페이지에서 <b>🔍 버튼</b>이 보이시나요？ 그게 입구입니다。\n언제든지 클릭하면 메인 패널을 열고 닫을 수 있습니다。",
        step1Title: "👋 환영합니다！",
        step1Body: "먼저 <b>그룹 추가 ➕</b>를 클릭하여 사이트 그룹을 만들어 보세요（예: 「뉴스」, 「개발」）。",
        step2Title: "📂 그룹 생성 완료！",
        step2Body: "잘하셨어요！이제 그룹 안의 <b>사이트 추가 ➕</b>를 클릭하여 사이트를 추가해 보세요（예: github.com）。",
        step3Title: "✅ 설정 완료！",
        step3Body: "사이트 버튼을 클릭하면 검색 범위를 좁힐 수 있습니다。\n언제든지 그룹과 사이트를 추가할 수 있습니다。\n즐거운 검색 되세요！🚀",
        next: "다음 →",
        skip: "건너뛰기",
        finish: "알겠어요！",
      },
      se: {
        panelTitle: "검색 엔진 관리",
        helpTooltip:
          "사용법：모든 엔진이 하나의 목록에 있습니다.\n• 상위 5개 엔진이 헤더에 아이콘으로 표시됩니다.\n• ⠿ 를 드래그하여 순서 변경 — 상위 5개 이내로 이동하면 아이콘으로 표시됩니다.\n• → 를 클릭하면 현재 키워드로 이동합니다.\n• ✕ 를 클릭하면 삭제됩니다.",
        lockLabel: "🔒 엔진 잠금 알림",
        lockEnabled: "🔒 엔진 잠금 알림 활성화",
        lockDisabled: "🔓 엔진 잠금 알림 비활성화",
        lockToast: (name) => `🔒 잠금 알림：${name} (아이콘을 클릭하여 이동)`,
        allEnginesLabel: "모든 엔진 (상위 5개가 아이콘으로 표시)",
        addSectionLabel: "엔진 추가",
        detectBtn: "🔍 현재 사이트 자동 감지",
        detectFirstTip: "💡 크로스 도메인 검색 엔진을 추가하려면 스크립트 관리자에서 @include 규칙에 해당 URL을 직접 추가해야 합니다。",
        detectFirstTipTitle: "크로스 도메인 안내",
        detectOk: "알겠어요",
        detectConfirmTitle: "검색 엔진 추가？",
        detectConfirm: (name, url) => `감지됨：${name}\n${url}\n\n검색 엔진으로 추가하시겠습니까？`,
        detectSuccess: (name) => `✅ 추가됨：${name}`,
        detectFail: "❌ 이 페이지에서 검색 엔진 URL을 감지할 수 없습니다。",
        adviceBannerText: "💡 이 스크립트는 주요 검색 엔진의 빠른 보조 도구로 가장 적합합니다。더 많은 커스텀 엔진 관리가 필요하다면 전용 브라우저 확장 프로그램을 고려해 보세요。",
        adviceBannerTitle: "사용 팁",
        namePlaceholder: "엔진 이름 (예: Google)",
        urlPlaceholder: "검색 URL (?q= 로 끝나는 것)",
        addBtn: "➕ 추가",
        emptyList: "(엔진 없음 — 아래에서 추가하세요)",
        addSuccess: (name) => `✅ 추가됨：${name}`,
        nameEmpty: "이름과 URL은 필수입니다！",
        urlInvalid: "URL은 http로 시작해야 합니다！",
        pinnedBadge: "TOP4",
        noKeyword: "검색 키워드를 가져올 수 없습니다",
        newWindowBtn: "⧉",
        newWindowTitle: "새 창에서 열기",
        dpTitle: {
          pinned: "패널 항상 표시 (고정됨)\n클릭하여 변경",
          on: "기본으로 패널 열기 (ON)\n클릭하여 변경",
          off: "기본으로 패널 닫기 (OFF)\n클릭하여 변경",
          offToast: "⛔ OFF — 패널이 현재 열려 있습니다。🔍 또는 패널 바깥을 클릭해 닫으세요。",
        },
      },
      timeOptions: buildTimeOptions([
        "1시간 이내","2시간 이내","3시간 이내","6시간 이내","12시간 이내",
        "1일 이내","2일 이내","3일 이내",
        "1주 이내","3주 이내",
        "1개월 이내","3개월 이내","6개월 이내",
        "1년 이내","2년 이내","3년 이내","4년 이내","5년 이내",
        "6년 이내","7년 이내","8년 이내","9년 이내",
      ]),
      syntaxExamples: buildSyntaxExamples(
        ["URL에 'login'이 포함된 페이지 검색","제목에 '가이드'가 포함된 페이지 검색","PDF 파일 검색","본문에 '개인정보'가 포함된 페이지 검색","'키워드'가 포함된 페이지 제외","example.com 내에서 검색"],
        ["inurl:login","intitle:가이드","filetype:pdf","intext:개인정보","-키워드","site:example.com"]
      ),
      timeUnsupported: "⚠️ 이 검색 엔진은 시간 필터를 지원하지 않습니다",
    },
  };

  const CUSTOM_LANG_TEMPLATE = {
    _note: [
      "=== AI TRANSLATION INSTRUCTIONS (for ChatGPT / Gemini) ===",
      "TASK: Translate ONLY the string VALUES in this JSON. DO NOT translate or rename any KEYS.",
      "CRITICAL — OUTPUT RULES:",
      "  1. Output the COMPLETE JSON in a single code block. Do NOT split into multiple messages.",
      "  2. Do NOT omit, skip, or summarize any key. Every key in the input MUST appear in the output.",
      "  3. 'timeOptions' is an array of exactly 22 objects — all 22 must be present in your output.",
      "  4. 'syntaxExamples' is an array of exactly 6 objects — all 6 must be present.",
      "  5. Nested objects ('se', 'dpItemHint', 'styleOptions', 'imageModes', 'themeOptions', 'onboarding', 'customLang', 'se.dpTitle') must be fully translated.",
      "  6. Keep ALL placeholders UNCHANGED: {n} {s} {t} {name} {url} {urls}",
      "  7. Keep ALL emoji characters UNCHANGED.",
      "  8. Preserve any HTML tags and class='...' attributes as-is.",
      "  9. The 'name' field is the language display label — set it to the target language name (e.g. '日本語', 'Français').",
      " 10. '_note' and '_completionCheck' must be copied verbatim — do NOT translate them.",
      "SELF-CHECK before finishing: verify timeOptions has 22 entries and the JSON ends with _completionCheck.",
      "===================================================================",
    ],
    name: "My Custom Language",
    siteTitle: "Site Groups",
    timeLabel: "🕐 Time Filter",
    unlimited: "Unlimited",
    timeUnsupported: "⚠️ Time filter is not supported on this search engine",
    expand: "🎨Expand",
    collapse: "Collapse",
    toggleShow: "Show Addresses",
    toggleHide: "Hide Addresses",
    addGroup: "Add Group ➕",
    editGroup: "Edit Group ✏️",
    delGroup: "Delete Group 🗑️",
    addSite: "Add Site ➕",
    editSite: "Edit Site ✏️",
    notFound: "Search input not found!",
    enterGroupName: "Enter group name",
    enterSite: "Enter site URL (e.g., example.com)\n\nRight-click ⚙️ to delete the domain",
    confirmDel: "Confirm to delete group \"{name}\"?（Confirm）",
    exportConfig: "Export Config 📤",
    importConfig: "Import Config 📥",
    searchConfig: "⚙️ Search Settings",
    exclude1: "Exclude Keyword1",
    exclude2: "Exclude Keyword2",
    syntaxHelp: "Search Syntax Reference 📖",
    copied: "Copied! 📋",
    syntaxPanelTitle: "Search Syntax Reference 📖",
    groupNameUpdated: "Group name updated!",
    groupDeleted: "Group \"{name}\" deleted!",
    multiSelectMode: "Multi-select",
    multiSelectSend: "Open selected",
    multiSelectConfirm: "Open {n} selected site(s) in new tabs?",
    multiSelectColor: "Select Highlight Color",
    multiSelectOpacity: "Highlight Opacity",
    siteButtonWidth: "Site Button Width",
    siteButtonWidthAuto: "Auto",
    multiSelectNone: "No sites selected!",
    panelHelp: "📋 Site Groups Panel — Help\n\n▸ Group header buttons:\n  ✎  Rename the group\n  ➕  Add a site to the group\n  🗑️  Delete the group\n  ☑  Enter multi-select mode\n  ↗  Open selected sites (shown in multi-select mode)\n\n▸ Site buttons:\n  Left-click    — Apply site:filter to current search\n  Long-press drag — Reorder sites within the group\n  ⋯ (three dots) — Open site menu:\n      ✏️ Edit URL / note\n      🗑️ Delete site\n      🔗 Open (same tab)\n      ↗ Open (new tab)\n\n▸ Multi-select mode:\n  Click sites to select / deselect (gold highlight).\n  Click ☑ again, or click ↗ Send to exit.\n\n▸ Engine bar (top icon row):\n  Click an icon to jump to that engine with the current keyword.\n  Drag ⠿ in the engine panel to reorder — top 5 show as icons.\n\n▸ Time filter (dropdown below engine bar):\n  Restricts results to a specific time range (1 hour – 9 years).\n  Select \"Unlimited\" to clear the filter.\n\n▸ Search Settings ⚙️:\n  Set exclude keywords, toggle syntax help, import/export config.\n\n▸ 📌 Button (top-right):\n  Controls whether the panel opens automatically.\n  ⛔ OFF — closed by default  ✅ ON — opens on load\n  📌 Pinned — always visible\n  Also contains: 🔒 Safe Search OFF and 🌐 Search Region toggles.",
    multiSelectSendTitle: "Open Selected Sites",
    multiSelectSendMsg: "Open {n} site(s) in new tabs?\n\n{urls}",
    multiSelectRemember: "Remember this choice",
    multiSelectClearAfter: "Exit multi-select after sending",
    multiSelectRememberSel: "Remember selected sites for this group",
    multiSelectBanner: "☑ Multi-select mode — click sites to select · click ☑ or ↗ to exit",
    multiSelectKeyword: "Search keyword (optional)",
    siteMenuEdit: "✏️ Edit",
    siteMenuDelete: "🗑️ Delete",
    siteMenuOpenSame: "🔗 Open (same tab)",
    siteMenuOpenNew: "↗ Open (new tab)",
    multiSelectModeLabel: "Send mode (mutually exclusive):",
    modeSiteSearch: "site:A OR site:B search (same tab)",
    modeSiteSearchNew: "site:A OR site:B search (new tab)",
    modeOpenOnly: "Open each site without search keyword",
    langSwitched: "Language switched!",
    toggleReset: "🔍 Position reset",
    filterError: "Failed to apply search filter, please try again!",
    siteEditHint: "Left-click to edit | Right-click to delete",
    close: "Close",
    editSiteSuccess: "Site updated successfully!",
    emptyInput: "Input cannot be empty!",
    panelPinned: "📌 Engine panel pinned",
    panelUnpinned: "📌 Engine panel unpinned",
    defaultPanelOpen: "Default Open🗂️",
    safeSearchLabel: "🔒 Safe Search OFF",
    safeSearchOn: "🔒 Safe Search OFF: ON",
    safeSearchOff: "🔓 Safe Search OFF: OFF",
    safeSearchWarning: "🔒 Safe Search OFF — How it works\n\n▸ ON → inject URL parameters to disable safe search.\n▸ OFF → no intervention.",
    searchRegionLabel: "🌐 Search Region: All",
    searchRegionOn: "🌐 Search Region: All — ON",
    searchRegionOff: "🌐 Search Region: All — OFF",
    searchRegionWarning: "🌐 Search Region: All — How it works\n\n▸ ON → remove region URL parameters.\n▸ OFF → no intervention.",
    styleConfig: "Style Settings 🎨",
    panelLayout: "Panel Layout",
    panelTopLabel: "Top Offset",
    panelRightLabel: "Right Offset",
    panelWidthLabel: "Max Width",
    panelHeightLabel: "Max Height",
    panelWidthHint: "↺ Resets to locale default width",
    seBarOffsetLabel: "Raise Engine Bar (+50px)",
    hideSyntaxBtnLabel: "Hide 📖 Syntax Help Button",
    hideBlacklistBtnLabel: "Hide 🚫 Blacklist Button",
    toggleBtnStyleLabel:    "Toggle Button Style",
    toggleBtnIconLabel:     "Icon",
    toggleBtnIconEmoji:     "🔍 Emoji",
    toggleBtnIconSvgLine:   "SVG Outline",
    toggleBtnIconSvgFill:   "SVG Filled",
    toggleBtnBgColorLabel:  "BG Color",
    toggleBtnBgOpacityLabel:"BG Opacity",
    style: "Style",
    borderRadius: "Border Radius",
    contrast: "Contrast",
    opacity: "Opacity",
    fontSize: "Font Size",
    backgroundImage: "Background Image",
    imageMode: "Image Mode",
    textColor: "Text Color",
    backgroundColor: "Background Color",
    imageOffsetX: "Image X Offset",
    imageOffsetY: "Image Y Offset",
    imageScale: "Image Scale",
    imageOpacity: "Image Opacity",
    theme: "Theme",
    resetStyles: "Reset Styles 🔄",
    resetStylesConfirm: "Reset all style settings?\n(Layout, font, opacity etc. will all return to defaults)",
    importConfigSuccess: "Configuration imported successfully!",
    importConfigFailed: "Import failed: Invalid JSON format!",
    invalidSite: "Please enter a valid URL (e.g., example.com)!",
    enterSiteNote: "Enter site note (recommended: within 4 characters):",
    noteTooLong: "Note cannot exceed 4 characters!",
    emptyGroupName: "Group name cannot be empty!",
    confirm: "Confirm",
    cancel: "Cancel",
    exportConfigSuccess: "Configuration exported successfully! 📤",
    deleteKeyword: "Delete keyword",
    resetStylesSuccess: "Style reset successfully!",
    importConfigPrompt: "Select a JSON file to import",
    invalidFileType: "Please select a valid JSON file!",
    promptClose: "Click outside to close",
    customButtonBg: "Button Background",
    textBackgroundColor: "Text Background Color",
    textBorder: "Enable Text Border",
    groupOpacity: "Group Opacity",
    textOpacityCompensation: "Text Clarity Boost",
    buttonOpacity: "Button Opacity",
    contrastStatus: "Contrast: ",
    high: "High",
    low: "Low",
    enhancedClarity: "Clarity: ",
    enabled: "On",
    disabled: "Off",
    groupBackgroundColor: "Group Background Color",
    enableOverlayDarkening: "Enable Overlay Darkening",
    overlayStrength: "Overlay Strength",
    searchSites: "Search Sites...",
    searchHistory: "Search History",
    clearSearchHistory: "Clear Search History",
    noSearchHistory: "No search history",
    searchBarStyleLabel:    "Search Bar Style",
    searchBarPreset:        "Quick Preset",
    searchBarBgColor:       "Bar BG Color",
    searchBarBgOpacity:     "Bar BG Opacity",
    searchBarFgColor:       "Bar Text Color",
    searchBarGlowEnabled:   "Bar Glow",
    searchBarGlowColor:     "Glow Color",
    searchBarGlowStrength:  "Glow Strength",
    customThemeLabel:       "Custom Theme",
    quickSchemeLabel:       "🎨 Quick Scheme",
    quickSchemeLight:       "☀️ Light",
    quickSchemeDark:        "🌑 Dark",
    quickSchemeReset:       "↺ Reset",
    glowLabel:              "Border Glow / Sheen",
    enableBorderGlow:       "Border Glow",
    borderGlowColor:        "Glow Color",
    borderGlowStrength:     "Glow Strength",
    borderGlowInset:        "Inset Glow",
    enableSheen:            "Sheen Effect",
    sheenAngle:             "Sheen Angle",
    sheenOpacity:           "Sheen Intensity",
    enableSiteGlow:         "Site Button Glow",
    enableGroupGlow:        "Group Block Glow",
    styleOptions: { default: "Default", soft: "Soft", bold: "Bold" },
    imageModes: { center: "Center", tile: "Tile", contain: "Contain", auto: "Auto" },
    themeOptions: { light: "Light ☀️", dark: "Dark 🌙", custom: "Custom 🎨" },
    uploadImage: "Upload Image📤",
    clearImage: "Clear Image🗑️",
    blacklistBtn: "🚫 Blacklist",
    blacklistTitle: "Domain Blacklist",
    blacklistPlaceholder: "One domain per line, e.g.: pinterest.com",
    blacklistSaved: "Blacklist saved — {n} domain(s) blocked",
    blacklistCount: "Currently blocking {n} domain(s)",
    blacklistInvalid: "Invalid domain skipped: \"{d}\"",
    dpItemHint: {
      off: "Panel stays closed by default. Click 🔍 to open manually.",
      on: "Panel opens automatically on every page load.",
      pinned: "Panel is always visible and cannot be closed.",
      safeSearch: "Attempts to inject URL parameters to disable safe search filters.",
      searchRegion: "Attempts to remove country/region URL parameters.",
    },
    se: {
      panelTitle: "Search Engine Manager",
      helpTooltip: "Tip: Top 5 engines show as icons. Drag ⠿ to reorder.",
      lockLabel: "🔒 Lock Engine Hint",
      lockEnabled: "🔒 Lock engine enabled",
      lockDisabled: "🔓 Lock engine disabled",
      lockToast: "🔒 Locked: {name} — click its icon to navigate",
      allEnginesLabel: "All Engines  (top 5 shown as icons)",
      addSectionLabel: "Add Engine",
      detectBtn: "🔍 Auto-Detect Current Site",
      detectFirstTip: "💡 To add a cross-origin engine, add its URL to @include rules in your userscript manager.",
      detectFirstTipTitle: "Cross-origin notice",
      detectOk: "Got it",
      detectConfirmTitle: "Add Search Engine?",
      detectConfirm: "Detected: {name}\n{url}\n\nAdd this as a search engine?",
      detectSuccess: "✅ Added: {name}",
      detectFail: "❌ Cannot detect a search URL on this page.",
      adviceBannerText: "💡 This script works best as a quick-access shortcut on major search engines.",
      adviceBannerTitle: "Usage tip",
      namePlaceholder: "Engine name (e.g. Google)",
      urlPlaceholder: "Search URL (ending with ?q=)",
      addBtn: "➕ Add",
      emptyList: "(No engines yet — add one below)",
      addSuccess: "✅ Added: {name}",
      nameEmpty: "Name and URL cannot be empty!",
      urlInvalid: "URL must start with http!",
      pinnedBadge: "TOP4",
      noKeyword: "Cannot extract search keyword",
      newWindowBtn: "⧉",
      newWindowTitle: "Open in new window",
      dpTitle: {
        pinned: "Panel always visible (Pinned)\nClick to change",
        on: "Panel opens by default (ON)\nClick to change",
        off: "Panel closed by default (OFF)\nClick to change",
        offToast: "⛔ OFF — panel stays open now. Click 🔍 or outside to close.",
      },
    },
    timeOptions: buildTimeOptions([
      "Within 1 hour","Within 2 hours","Within 3 hours","Within 6 hours","Within 12 hours",
      "Within 1 day","Within 2 days","Within 3 days",
      "Within 1 week","Within 3 weeks",
      "Within 1 month","Within 3 months","Within 6 months",
      "Within 1 year","Within 2 years","Within 3 years","Within 4 years","Within 5 years",
      "Within 6 years","Within 7 years","Within 8 years","Within 9 years",
    ]),
    syntaxExamples: buildSyntaxExamples([
      "Pages with 'login' in the URL",
      "Pages with 'guide' in the title",
      "Search for PDF files",
      "Pages containing 'privacy' in text",
      "Exclude pages with 'keyword'",
      "Search within example.com",
    ]),
    onboarding: {
      step0Title: "🔍 Finding the panel",
      step0Body: "See the <b>🔍 button</b> on the page? Click it to open or close the main panel.",
      step1Title: "👋 Welcome!",
      step1Body: "First, click <b>Add Group ➕</b> to create a site group.",
      step2Title: "📂 Group created!",
      step2Body: "Now click <b>Add Site ➕</b> inside the group to add a website.",
      step3Title: "✅ All set!",
      step3Body: "Click any site button to filter your search. Happy searching! 🚀",
      next: "Next →", skip: "Skip", finish: "Got it!",
    },
    customLang: {
      menuLabel: "Custom Language",
      panelTitle: "Custom Language Translation",
      exportBtn: "📤 Export Template",
      importBtn: "📥 Import Translation",
      exportHint: "1. Click 「📤 Export」 to download the JSON template.\n2. Open the file and translate only the VALUES (not the keys).\n3. Set the \"name\" field to your language name.\n4. Click 「📥 Import」 to apply.\n\nEnglish: Export → translate the values → Import\nDeutsch: Exportieren → Werte übersetzen → Importieren\nFrançais : Exporter → traduire les valeurs → Importer\nEspañol: Exportar → traducir los valores → Importar\nItaliano: Esporta → traduci i valori → Importa\nPortuguês: Exportar → traduzir os valores → Importar\nРусский: Экспорт → перевести значения → Импорт\nУкраїнська: Експорт → перекласти значення → Імпорт\nภาษาไทย: ส่งออก → แปลค่า → นำเข้า\nTürkçe: Dışa aktar → değerleri çevir → İçe aktar\nPolski: Eksportuj → przetłumacz wartości → Importuj\nČeština: Exportovat → přeložit hodnoty → Importovat\nRomână: Exportați → traduceți valorile → Importați\nMagyar: Exportálás → értékek fordítása → Importálás\nΕλληνικά: Εξαγωγή → μετάφραση τιμών → Εισαγωγή\nالعربية: تصدير ← ترجمة القيم ← استيراد\nעברית: ייצוא ← תרגום הערכים ← ייבוא\nفارسی: صادر کردن ← ترجمه مقادیر ← وارد کردن\nहिन्दी: निर्यात → मान अनुवाद करें → आयात\nবাংলা: রপ্তানি → মান অনুবাদ করুন → আমদানি\nIndonesia: Ekspor → terjemahkan nilai → Impor\nBahasa Melayu: Eksport → terjemah nilai → Import\nFilipino: I-export → isalin ang mga halaga → I-import\nTiếng Việt: Xuất → dịch các giá trị → Nhập\nNederlands: Exporteren → waarden vertalen → Importeren\nSvenska: Exportera → översätt värdena → Importera\nKiswahili: Hamisha → tafsiri maadili → Ingiza\n(...)",
      exportSuccess: "📦 Exported: lang-full-template.json",
      importSuccess: "Custom language applied! ✅",
      importFailed: "Import failed: invalid or missing 'name' field.",
      noCustomLang: "No custom language loaded yet.",
      currentName: "Current: ",
    },
    _completionCheck: "COMPLETE",
  };

  function hydrateCustomLang(raw) {
    const out = Object.assign({}, raw);
    const fnKeys = {
      confirmDel:        (name) => (raw.confirmDel        ?? `Confirm to delete group "${name}"?`).replace("{name}", name),
      groupDeleted:      (name) => (raw.groupDeleted       ?? `Group "${name}" deleted!`).replace("{name}", name),
      multiSelectConfirm:(n)    => (raw.multiSelectConfirm ?? `Open ${n} site(s)?`).replace("{n}", String(n)),
      multiSelectSendMsg:(n, urls) => (raw.multiSelectSendMsg ?? `Open ${n} site(s):\n${urls}`)
        .replace("{n}", String(n)).replace("{urls}", urls ?? ""),
      blacklistSaved:    (n) => (raw.blacklistSaved    ?? `Blacklist saved — ${n} domain(s) blocked`).replace("{n}", String(n)),
      blacklistCount:    (n) => (raw.blacklistCount    ?? `Currently blocking ${n} domain(s)`).replace("{n}", String(n)),
      blacklistInvalid:  (d) => (raw.blacklistInvalid  ?? `Invalid domain skipped: "${d}"`).replace("{d}", String(d)),
    };
    Object.assign(out, fnKeys);
    if (raw.se) {
      out.se = Object.assign({}, raw.se, {
        lockToast:     (name) => (raw.se.lockToast     ?? `🔒 Locked: ${name}`).replace("{name}", name),
        detectConfirm: (name, url) => (raw.se.detectConfirm ?? `Detected: ${name}\n${url}\n\nAdd as search engine?`)
          .replace("{name}", name).replace("{url}", url ?? ""),
        detectSuccess: (name) => (raw.se.detectSuccess ?? `✅ Added: ${name}`).replace("{name}", name),
        addSuccess:    (name) => (raw.se.addSuccess    ?? `✅ Added: ${name}`).replace("{name}", name),
      });
    }
    return out;
  }

  (function () {
    const saved = GM_getValue("customLangData", null);
    if (saved) {
      try {
        LANGUAGES.custom = hydrateCustomLang(JSON.parse(saved));
      } catch (_) {}
    }
  })();

  let lang = GM_getValue("sitePanelLang", "zh_TW");
  let t = LANGUAGES[lang] || LANGUAGES["en"];
  const groups = GM_getValue("siteGroups", []);
  let showAddresses = GM_getValue("showAddresses", true);
  let searchConfig = GM_getValue("searchConfig", {
    isExpanded: false,
    resetOnReload: true,
  });
  let deletedSiteHistory = null;
  let defaultPanelOpen = GM_getValue("defaultPanelOpen", false);
  let safeSearchEnabled     = GM_getValue("safeSearchEnabled",     false);
  let safeSearchNoticedOnce = GM_getValue("safeSearchNoticedOnce", false);
  let searchRegionEnabled     = GM_getValue("searchRegionEnabled",     false);
  let searchRegionNoticedOnce = GM_getValue("searchRegionNoticedOnce", false);
  let domainBlacklist = GM_getValue("domainBlacklist", []);

  function applyUrlOverrides() {
    if (!safeSearchEnabled && !searchRegionEnabled) return;
    try {
      const url     = new URL(window.location.href);
      const params  = url.searchParams;
      const host    = url.hostname;
      if (params.has("__sse_or") || params.has("__sse_sr")) {
        params.delete("__sse_or");
        params.delete("__sse_sr");
        url.search = params.toString();
        history.replaceState(null, "", url.toString());
        return;
      }
      let updated = false;

      if (safeSearchEnabled) {
        if (host.includes("google.")) {
          if (params.get("safe") !== "off") { params.set("safe", "off"); updated = true; }
        } else if (host.includes("bing.com")) {
          if (params.get("adlt") !== "off") { params.set("adlt", "off"); updated = true; }
        } else if (host.includes("duckduckgo.com")) {
          if (params.get("kp") !== "-2") { params.set("kp", "-2"); updated = true; }
        } else if (host.includes("yandex.")) {
          if (params.get("family") !== "no") { params.set("family", "no"); updated = true; }
        } else if (host.includes("search.brave.com")) {
          if (params.get("safesearch") !== "off") { params.set("safesearch", "off"); updated = true; }
        } else if (host.includes("yahoo.com")) {
          if (params.get("vm") !== "r") { params.set("vm", "r"); updated = true; }
        } else if (host.includes("ecosia.org")) {
          if (params.get("safesearch") !== "0") { params.set("safesearch", "0"); updated = true; }
        } else if (host.includes("qwant.com")) {
          if (params.get("s") !== "0") { params.set("s", "0"); updated = true; }
        } else if (host.includes("naver.com")) {
          if (params.get("adult") !== "0") { params.set("adult", "0"); updated = true; }
        }
      }

      if (searchRegionEnabled) {
        if (host.includes("google.")) {
          if (params.has("gl"))  { params.delete("gl");  updated = true; }
          if (params.has("cr"))  { params.delete("cr");  updated = true; }
        } else if (host.includes("bing.com")) {
          if (params.has("mkt")) { params.delete("mkt"); updated = true; }
        } else if (host.includes("duckduckgo.com")) {
          if (params.get("kl") !== "wt-wt") { params.set("kl", "wt-wt"); updated = true; }
        } else if (host.includes("yandex.")) {
          if (params.has("lr"))  { params.delete("lr");  updated = true; }
        } else if (host.includes("search.brave.com")) {
          if (params.has("country")) { params.delete("country"); updated = true; }
        } else if (host.includes("yahoo.com")) {
          if (params.has("vl"))  { params.delete("vl");  updated = true; }
        } else if (host.includes("ecosia.org")) {
          if (params.has("locale")) { params.delete("locale"); updated = true; }
        } else if (host.includes("qwant.com")) {
          if (params.has("locale")) { params.delete("locale"); updated = true; }
        }
        else if (host.includes("searx")) {
          if (params.has("language")) { params.delete("language"); updated = true; }
        }
      }

      if (updated) {
        params.set("__sse_or", "1");
        url.search = params.toString();
        window.location.replace(url.toString());
      }
    } catch (err) {
      warn("applyUrlOverrides error:", err);
    }
  }
  applyUrlOverrides();

  function showSafeSearchNotice(onConfirm) {
    if (safeSearchNoticedOnce) { onConfirm(); return; }

    const isDark = panelTheme === "dark";
    const fgColor = styleSettings.textColor || (isDark ? "#eee" : "#222");
    const fs = styleSettings.fontSize || 13;

    if (!document.getElementById("sse-notice-style")) {
      const styleEl = document.createElement("style");
      styleEl.id = "sse-notice-style";
      styleEl.textContent =
        "@keyframes sse-pop{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}";
      document.head.appendChild(styleEl);
    }

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:2147483665;
      background:rgba(0,0,0,.58); backdrop-filter:blur(3px);
      display:flex; align-items:center; justify-content:center;
    `;

    const card = document.createElement("div");
    card.style.cssText = `
      background:${isDark ? "#1e1e2e" : "#ffffff"};
      border:1px solid ${isDark ? "#3a3a5c" : "#d8d8e8"};
      border-radius:14px; padding:22px 24px; max-width:360px; width:90%;
      box-shadow:0 12px 40px rgba(0,0,0,.4);
      font-family:sans-serif; font-size:${fs}px; color:${fgColor};
      animation:sse-pop .2s cubic-bezier(.34,1.5,.64,1) both;
      line-height:1.5;
    `;

    const titleEl = document.createElement("div");
    titleEl.textContent = t.safeSearchLabel || "🔒 Safe Search OFF";
    titleEl.style.cssText = "font-weight:700; font-size:1.15em; margin-bottom:12px;";
    card.appendChild(titleEl);

    const bodyEl = document.createElement("div");
    bodyEl.style.cssText = `
      white-space:pre-line; opacity:.88; margin-bottom:18px;
      padding:10px 12px; border-radius:8px;
      background:${isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)"};
    `;
    bodyEl.textContent = t.safeSearchWarning ||
      "⚠️ ON: injects URL params to disable safe search.\nOFF: script does nothing.\nNo guarantee. Baidu unsupported.\n\nThis notice only appears once.";
    card.appendChild(bodyEl);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex; justify-content:flex-end; gap:8px;";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = t.cancel || "Cancel";
    cancelBtn.style.cssText = `
      padding:7px 16px; border-radius:7px; border:none; cursor:pointer;
      background:${isDark ? "#2e2e3e" : "#e8e8e8"};
      color:${isDark ? "#bbb" : "#555"}; font-size:${fs}px;
      transition:opacity .15s;
    `;
    cancelBtn.onmouseenter = () => (cancelBtn.style.opacity = ".75");
    cancelBtn.onmouseleave = () => (cancelBtn.style.opacity = "1");

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = t.confirm || "Confirm";
    confirmBtn.style.cssText = `
      padding:7px 18px; border-radius:7px; border:none; cursor:pointer;
      background:#d63031; color:#fff; font-weight:700; font-size:${fs}px;
      box-shadow:0 2px 8px rgba(214,48,49,.35);
      transition:opacity .15s;
    `;
    confirmBtn.onmouseenter = () => (confirmBtn.style.opacity = ".82");
    confirmBtn.onmouseleave = () => (confirmBtn.style.opacity = "1");

    const closeOverlay = () => overlay.remove();
    cancelBtn.onclick = closeOverlay;
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });
    confirmBtn.onclick = () => {
      closeOverlay();
      safeSearchNoticedOnce = true;
      GM_setValue("safeSearchNoticedOnce", true);
      onConfirm();
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    card.appendChild(btnRow);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

  function showSearchRegionNotice(onConfirm) {
    if (searchRegionNoticedOnce) { onConfirm(); return; }

    const isDark  = panelTheme === "dark";
    const fgColor = styleSettings.textColor || (isDark ? "#eee" : "#222");
    const fs      = styleSettings.fontSize || 13;

    if (!document.getElementById("sse-notice-style")) {
      const styleEl = document.createElement("style");
      styleEl.id = "sse-notice-style";
      styleEl.textContent =
        "@keyframes sse-pop{from{opacity:0;transform:scale(.88)}to{opacity:1;transform:scale(1)}}";
      document.head.appendChild(styleEl);
    }

    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:2147483665;
      background:rgba(0,0,0,.58); backdrop-filter:blur(3px);
      display:flex; align-items:center; justify-content:center;
    `;

    const card = document.createElement("div");
    card.style.cssText = `
      background:${isDark ? "#1e1e2e" : "#ffffff"};
      border:1px solid ${isDark ? "#3a3a5c" : "#d8d8e8"};
      border-radius:14px; padding:22px 24px; max-width:360px; width:90%;
      box-shadow:0 12px 40px rgba(0,0,0,.4);
      font-family:sans-serif; font-size:${fs}px; color:${fgColor};
      animation:sse-pop .2s cubic-bezier(.34,1.5,.64,1) both;
      line-height:1.5;
    `;

    const titleEl = document.createElement("div");
    titleEl.textContent = t.searchRegionLabel || "🌐 Search Region: All";
    titleEl.style.cssText = "font-weight:700; font-size:1.15em; margin-bottom:12px;";
    card.appendChild(titleEl);

    const bodyEl = document.createElement("div");
    bodyEl.style.cssText = `
      white-space:pre-line; opacity:.88; margin-bottom:18px;
      padding:10px 12px; border-radius:8px;
      background:${isDark ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.04)"};
    `;
    bodyEl.textContent = t.searchRegionWarning ||
      "⚠️ ON: removes/replaces region URL params to avoid country-limited results.\nOFF: script does nothing.\nNo guarantee. Baidu & Naver unsupported.\n\nThis notice only appears once.";
    card.appendChild(bodyEl);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex; justify-content:flex-end; gap:8px;";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = t.cancel || "Cancel";
    cancelBtn.style.cssText = `
      padding:7px 16px; border-radius:7px; border:none; cursor:pointer;
      background:${isDark ? "#2e2e3e" : "#e8e8e8"};
      color:${isDark ? "#bbb" : "#555"}; font-size:${fs}px;
      transition:opacity .15s;
    `;
    cancelBtn.onmouseenter = () => (cancelBtn.style.opacity = ".75");
    cancelBtn.onmouseleave = () => (cancelBtn.style.opacity = "1");

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = t.confirm || "Confirm";
    confirmBtn.style.cssText = `
      padding:7px 18px; border-radius:7px; border:none; cursor:pointer;
      background:#0984e3; color:#fff; font-weight:700; font-size:${fs}px;
      box-shadow:0 2px 8px rgba(9,132,227,.35);
      transition:opacity .15s;
    `;
    confirmBtn.onmouseenter = () => (confirmBtn.style.opacity = ".82");
    confirmBtn.onmouseleave = () => (confirmBtn.style.opacity = "1");

    const closeOverlay = () => overlay.remove();
    cancelBtn.onclick = closeOverlay;
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeOverlay(); });
    confirmBtn.onclick = () => {
      closeOverlay();
      searchRegionNoticedOnce = true;
      GM_setValue("searchRegionNoticedOnce", true);
      onConfirm();
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);
    card.appendChild(btnRow);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
  }

  const SE_PINNED_COUNT = 5;
  (function migrateSeData() {
    const oldPinned = GM_getValue("se_pinned", null);
    const oldExtra = GM_getValue("se_extra", null);
    if (oldPinned !== null || oldExtra !== null) {
      const merged = [
        ...(Array.isArray(oldPinned) ? oldPinned : []),
        ...(Array.isArray(oldExtra) ? oldExtra : []),
      ];
      if (merged.length > 0 && !GM_getValue("se_engines", null)) {
        GM_setValue("se_engines", merged);
      }
      GM_setValue("se_pinned", null);
      GM_setValue("se_extra", null);
    }
  })();
  let se_engines = GM_getValue("se_engines", [
    { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=" },
    { name: "Brave Search", url: "https://search.brave.com/search?q=" },
    { name: "Bing", url: "https://www.bing.com/search?q=" },
    { name: "Baidu", url: "https://www.baidu.com/s?wd=" },
    { name: "Yandex", url: "https://yandex.ru/yandsearch?text=" },
    { name: "Google", url: "https://www.google.com/search?q=" },
  ]);
  let se_panelPinned = GM_getValue("se_panelPinned", false);
  let se_panelPos = GM_getValue("se_panelPos", null);

  function se_save() {
    GM_setValue("se_engines", se_engines);
    GM_setValue("se_panelPinned", se_panelPinned);
    GM_setValue("se_panelPos", se_panelPos);
  }

  function se_extractKeyword() {
    try {
      if (window.location.hostname.includes("baidu.com")) {
        const baiduInput =
          document.querySelector("input#kw") ||
          document.querySelector('input[name="wd"]');
        if (baiduInput && baiduInput.value.trim()) return baiduInput.value.trim();
      }
      const u = new URL(location.href);
      return (
        u.searchParams.get("q")     ||
        u.searchParams.get("p")     ||
        u.searchParams.get("wd")    ||
        u.searchParams.get("text")  ||
        u.searchParams.get("query") ||
        u.searchParams.get("word")  ||
        ""
      );
    } catch (e) {
      return "";
    }
  }

  function se_faviconUrl(engineUrl) {
    try {
      const domain = new URL(engineUrl).hostname;
      return "https://www.google.com/s2/favicons?sz=32&domain=" + domain;
    } catch (e) {
      return "";
    }
  }

  function se_navigate(engine) {
    const kw = se_extractKeyword();
    const st = t.se || {};
    if (!kw) {
      showToast(st.noKeyword || "無法取得搜尋關鍵字");
      return;
    }
    if (isImageSearchPage()) {
      const imgUrl = getImageSearchUrl(engine.url, kw);
      if (imgUrl) { window.open(imgUrl, "_blank"); return; }
    }
    window.open(engine.url + encodeURIComponent(kw), "_blank");
  }

  log("Initial defaultPanelOpen:", defaultPanelOpen);
  let panelTheme = GM_getValue("panelTheme", "light");
  let manuallyClosed = false;
  if (window.performance && !searchConfig.resetOnReload) {
    const navigationType = performance.getEntriesByType("navigation")[0]?.type;
    if (navigationType !== "reload" && navigationType !== "navigate") {
      manuallyClosed = GM_getValue("manuallyClosed", false);
    }
  }

  const SearchHistoryManager = {
    MAX_HISTORY: 20,
    STORAGE_KEY: "siteSearchHistory",

    getHistory() {
      return GM_getValue(this.STORAGE_KEY, []);
    },

    addToHistory(keyword) {
      if (!keyword || keyword.trim() === "") return;

      let history = this.getHistory();
      history = history.filter((item) => item !== keyword);
      history.unshift(keyword);
      if (history.length > this.MAX_HISTORY) {
        history = history.slice(0, this.MAX_HISTORY);
      }

      GM_setValue(this.STORAGE_KEY, history);
    },

    removeFromHistory(keyword) {
      let history = this.getHistory();
      history = history.filter((item) => item !== keyword);
      GM_setValue(this.STORAGE_KEY, history);
    },

    clearHistory() {
      GM_setValue(this.STORAGE_KEY, []);
    },
  };

  const STYLE_PRESETS = {
    default: {
      buttonBgOffset: 0,
      borderContrast: 0.2,
      borderRadius: "6px",
      opacity: 1.0,
      fontSize: 13,
      groupOpacity: 1.0,
      buttonOpacity: 1.0,
    },
    soft: {
      buttonBgOffset: 0,
      borderContrast: 0.1,
      borderRadius: "8px",
      opacity: 0.9,
      fontSize: 13,
      groupOpacity: 0.9,
      buttonOpacity: 0.9,
    },
    bold: {
      buttonBgOffset: 10,
      borderContrast: 0.3,
      borderRadius: "4px",
      opacity: 1.0,
      fontSize: 14,
      groupOpacity: 1.0,
      buttonOpacity: 1.0,
    },
  };

  let styleSettings = GM_getValue("styleSettings", {});
  {
    const _ssDefaults = {
      style: "default", borderRadius: 6, contrast: 0, opacity: 0.9,
      fontSize: 12, isExpanded: false,
      panelTop: 80, panelRight: 20, panelLeft: -1, panelWidth: 0, panelMaxHeight: 87,
      panelUserSized: false,
      backgroundImage: "", imageMode: "center", textColor: "", backgroundColor: "",
      imageOffsetX: 0, imageOffsetY: 0, groupOpacity: 1.0,
      textOpacityCompensation: 1.0, buttonOpacity: 1.0,
      imageScale: 1.0, imageOpacity: 1.0, theme: "light",
      customBackgroundColor: "#ffffff", customTextColor: "#000000",
      customButtonBg: "#f5f5f5", groupBackgroundColor: "",
      enableOverlayDarkening: false, textBackgroundColor: "", textBorder: false,
      overlayStrength: 0.5, multiSelectColor: "#ffc400", multiSelectOpacity: 0.85,
      siteButtonWidth: 0,
      hideSyntaxBtn: false,
      hideBlacklistBtn: false,
      iconStyle: "emoji",
      toggleBtnBg: "",
      toggleBtnBgOpacity: 0,
      svgIconColor: "",
      enableBorderGlow: false,
      borderGlowColor: "#00bfff",
      borderGlowStrength: 12,
      borderGlowInset: true,
      enableSheen: false,
      sheenAngle: 135,
      sheenOpacity: 0.08,
      enableSiteGlow: false,
      enableGroupGlow: false,
      searchBarBg: "",
      searchBarBgOpacity: 0,
      searchBarFg: "",
      searchBarGlowEnabled: false,
      searchBarGlowColor: "#5599ff",
      searchBarGlowStrength: 6,
    };
    for (const k of Object.keys(_ssDefaults)) {
      if (styleSettings[k] === undefined) styleSettings[k] = _ssDefaults[k];
    }

  }

  function save() {
    GM_setValue("siteGroups", groups);
    GM_setValue("searchConfig", searchConfig);
    GM_setValue("domainBlacklist", domainBlacklist);
    GM_setValue("safeSearchEnabled",  safeSearchEnabled);
    GM_setValue("searchRegionEnabled", searchRegionEnabled);
    GM_setValue("defaultPanelOpen", defaultPanelOpen);
    GM_setValue("panelTheme", panelTheme);
    GM_setValue("styleSettings", styleSettings);
    GM_setValue("sitePanelLang", lang);
    GM_setValue("manuallyClosed", manuallyClosed);
    const toggleBtn = document.getElementById("site-toggle-simple");
    if (toggleBtn) {
      const top = toggleBtn.style.top || "60px";
      const left = toggleBtn.style.left || "20px";
      if (isValidPixelValue(top) && isValidPixelValue(left)) {
        GM_setValue("toggleButtonTop", top);
        GM_setValue("toggleButtonLeft", left);
        log("Saved button position:", { top, left });
      } else {
        warn("Invalid button position, not saved:", { top, left });
      }
    }
    log("Saved defaultPanelOpen:", defaultPanelOpen);
    log("Saved manuallyClosed:", manuallyClosed);
    log("Saved resetOnReload:", searchConfig.resetOnReload);

  }

  {
    let _applyTimer = null;
    window._debouncedApply = function () {
      clearTimeout(_applyTimer);
      _applyTimer = setTimeout(() => applyTheme(panelTheme), 16);
    };
  }

  function showPanel(panel) {
    if (!panel) return;
    panel.style.display = "block";
    panel.style.opacity = "1";
    panel.style.visibility = "visible";
  }

  function hidePanel(panel) {
    if (!panel) return;
    panel.style.display = "none";
    const dd = document.getElementById("site-history-dropdown");
    if (dd) dd.style.display = "none";
    const sf = document.getElementById("style-config-wrap");
    if (sf) sf.style.display = "none";
    searchConfig.isExpanded = false;
  }

  const ICONS = {
    plus: {
      emoji: "⊕", size: "11px",
      line: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:block;pointer-events:none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
      fill: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" style="display:block;pointer-events:none"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity=".18"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    },
    pin: {
      emoji: "📌", size: "16px",
      line: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:block;pointer-events:none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
      fill: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" style="display:block;pointer-events:none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="currentColor" fill-opacity=".2"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="3" fill="currentColor"/></svg>`,
    },
    history: {
      emoji: "🕐", size: "12px",
      line: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:block;pointer-events:none"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
      fill: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" style="display:block;pointer-events:none"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity=".18"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
    },
    clear: {
      emoji: "✕", size: "10px",
      line: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:block;pointer-events:none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      fill: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" style="display:block;pointer-events:none"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity=".15"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    },
    help: {
      emoji: "❓", size: "12px",
      line: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:block;pointer-events:none"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      fill: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" style="display:block;pointer-events:none"><circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity=".15"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
    },
    search: {
      emoji: "🔍", size: "24px",
      line: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" style="display:block;pointer-events:none"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      fill: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style="display:block;pointer-events:none"><circle cx="11" cy="11" r="8" fill="currentColor" fill-opacity=".18"/><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="1.8"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    },
    toggleAddress: {
      emoji: "👁", size: "13px",
      line: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:block;pointer-events:none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
      fill: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" style="display:block;pointer-events:none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`,
    },
  };

  function _applyIconToBtn(btn, emoji, svgLine, svgFill, emojiSize) {
    if (!btn) return;
    const style = styleSettings.iconStyle || "emoji";
    const color = styleSettings.svgIconColor || "";
    if (style === "svg-line") {
      btn.innerHTML      = svgLine;
      btn.style.fontSize = "0";
      btn.style.color    = color || "";
    } else if (style === "svg-fill") {
      btn.innerHTML      = svgFill;
      btn.style.fontSize = "0";
      btn.style.color    = color || "";
    } else {
      btn.textContent    = emoji;
      btn.style.fontSize = emojiSize || "14px";
      btn.style.color    = "";
    }
  }

  const GRP_SVG_MAP = {
    "☑": `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:block;pointer-events:none"><rect x="3" y="3" width="18" height="18" rx="3"/><polyline points="9 12 11 14 15 10"/></svg>`,
    "↗": `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;pointer-events:none"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    "✎": `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;pointer-events:none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    "➕": `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="display:block;pointer-events:none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    "🗑️": `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;pointer-events:none"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
    "⋯": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="display:block;pointer-events:none"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>`,
  };

  function applyAllBtnIcons() {
    const _plus = document.querySelector(".se-plus-btn");
    _applyIconToBtn(_plus, ICONS.plus.emoji, ICONS.plus.line, ICONS.plus.fill, ICONS.plus.size);
    const _dp = document.getElementById("se-dp-btn");
    _applyIconToBtn(_dp, ICONS.pin.emoji, ICONS.pin.line, ICONS.pin.fill, ICONS.pin.size);
    const _hist = document.getElementById("se-history-btn");
    _applyIconToBtn(_hist, ICONS.history.emoji, ICONS.history.line, ICONS.history.fill, ICONS.history.size);
    const _clr = document.getElementById("se-clear-btn");
    _applyIconToBtn(_clr, ICONS.clear.emoji, ICONS.clear.line, ICONS.clear.fill, ICONS.clear.size);
    document.querySelectorAll(".se-help-btn").forEach(_h => {
      _applyIconToBtn(_h, ICONS.help.emoji, ICONS.help.line, ICONS.help.fill, ICONS.help.size);
    });
    const _tAddr = document.getElementById("se-toggle-address-btn");
    if (_tAddr) {
      const _addrStyle = styleSettings.iconStyle || "emoji";
      if (_addrStyle !== "emoji") {
        _applyIconToBtn(_tAddr, ICONS.toggleAddress.emoji, ICONS.toggleAddress.line, ICONS.toggleAddress.fill, ICONS.toggleAddress.size);
        _tAddr.style.color = styleSettings.svgIconColor || "";
      }
    }
    const _svgMode = (styleSettings.iconStyle || "emoji") !== "emoji";
    const _svgColor = styleSettings.svgIconColor || "";
    document.querySelectorAll(".icon-btn[data-grp-emoji]").forEach(el => {
      const emoji = el.dataset.grpEmoji;
      if (_svgMode && GRP_SVG_MAP[emoji]) {
        el.innerHTML = GRP_SVG_MAP[emoji];
        el.style.fontSize = "0";
        el.style.color = _svgColor || "";
      } else {
        el.textContent = emoji;
        el.style.fontSize = "";
        el.style.color = "";
      }
    });
  }

  function applyToggleBtnStyle(btn) {
    if (!btn) return;

    const _tbBgHex   = styleSettings.toggleBtnBg || "";
    const _tbBgAlpha = styleSettings.toggleBtnBgOpacity ?? 0;
    let _tbBg;
    if (_tbBgHex && /^#[0-9a-fA-F]{6}$/.test(_tbBgHex) && _tbBgAlpha > 0) {
      const r = parseInt(_tbBgHex.slice(1,3), 16);
      const g = parseInt(_tbBgHex.slice(3,5), 16);
      const b = parseInt(_tbBgHex.slice(5,7), 16);
      _tbBg = `rgba(${r},${g},${b},${_tbBgAlpha})`;
    } else {
      const _base = styleSettings.customBackgroundColor
        || (panelTheme === "dark" ? "#2a2a2a" : "#f4f4f6");
      const _hx = _base.replace("#","");
      const _r  = parseInt(_hx.slice(0,2), 16) || 244;
      const _g  = parseInt(_hx.slice(2,4), 16) || 244;
      const _b  = parseInt(_hx.slice(4,6), 16) || 246;
      _tbBg = `rgba(${_r},${_g},${_b},0.92)`;
    }

    const _isDark   = panelTheme === "dark";
    const _bdColor  = styleSettings.customButtonBg
      ? adjustColor(styleSettings.customButtonBg, styleSettings.contrast ?? 0)
      : _isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.13)";
    const _shadow   = _isDark
      ? "0 4px 16px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.35)"
      : "0 4px 16px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.09)";
    const _radius   = (styleSettings.borderRadius ?? 10) + "px";
    const _color    = styleSettings.textColor || (_isDark ? "#e8e8f0" : "#3a3a4a");

    btn.style.cssText = `
      position: fixed;
      top: ${btn.style.top || "0px"};
      left: ${btn.style.left || "0px"};
      right: auto;
      width: 48px;
      height: 48px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      appearance: none;
      -webkit-appearance: none;
      border: 1px solid ${_bdColor};
      border-radius: ${_radius};
      background: ${_tbBg};
      color: ${_color};
      box-shadow: ${_shadow};
      cursor: pointer;
      z-index: 2147483647;
      opacity: ${styleSettings.buttonOpacity ?? 1};
      transition: box-shadow 0.18s ease, transform 0.15s ease, opacity 0.2s ease;
      user-select: none;
      line-height: 1;
      font-size: ${ICONS.search.size};
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      outline: none;
    `;

    _applyIconToBtn(btn, ICONS.search.emoji, ICONS.search.line, ICONS.search.fill, ICONS.search.size);

    btn.__hoverBound && btn.removeEventListener("mouseenter", btn.__hoverBound);
    btn.__leaveBound && btn.removeEventListener("mouseleave", btn.__leaveBound);
    btn.__downBound  && btn.removeEventListener("mousedown",  btn.__downBound);
    btn.__upBound    && btn.removeEventListener("mouseup",    btn.__upBound);

    const _shadowHover  = _isDark
      ? "0 6px 22px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.4)"
      : "0 6px 22px rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.12)";
    const _shadowActive = _isDark
      ? "0 2px 6px rgba(0,0,0,0.45)"
      : "0 2px 6px rgba(0,0,0,0.10)";

    btn.__hoverBound = () => {
      btn.style.boxShadow = _shadowHover;
      btn.style.transform = "translateY(-2px) scale(1.04)";
    };
    btn.__leaveBound = () => {
      btn.style.boxShadow = _shadow;
      btn.style.transform = "translateY(0) scale(1)";
    };
    btn.__downBound = () => {
      btn.style.boxShadow = _shadowActive;
      btn.style.transform = "translateY(0) scale(0.96)";
    };
    btn.__upBound = () => {
      btn.style.boxShadow = _shadow;
      btn.style.transform = "translateY(0) scale(1)";
    };
    btn.addEventListener("mouseenter", btn.__hoverBound);
    btn.addEventListener("mouseleave", btn.__leaveBound);
    btn.addEventListener("mousedown",  btn.__downBound);
    btn.addEventListener("mouseup",    btn.__upBound);
  }

  const TIME_OPTIONS = t.timeOptions;

  function getBingFreshness(val) {
    const freshnessMap = {
      h: "past hour", h2: "past hour", h3: "past hour",
      h6: "past hour", h12: "past hour",
      d: "past day",  d2: "past day",  d3: "past day",
      w: "past week", w3: "past week",
      m: "past month",m3: "past month",m6: "past month",
      y: "past year", y2: "past year", y3: "past year",
      y4: "past year",y5: "past year", y6: "past year",
      y7: "past year",y8: "past year", y9: "past year",
    };
    return freshnessMap[val] || "past year";
  }

  function getTimeFilterEngine() {
    const host = window.location.hostname;
    const path = window.location.pathname;
    if (host.includes("google."))          return "google";
    if (host.includes("bing.com") &&
        path.includes("/images/"))         return "bing-images";
    if (host.includes("bing.com"))         return "bing";
    if (host.includes("yahoo.com") ||
        host.includes("yahoo.co.jp"))      return "yahoo";
    return null;
  }

  function isImageSearchPage() {
    try {
      const host   = window.location.hostname;
      const path   = window.location.pathname;
      const params = new URL(location.href).searchParams;
      if (host.includes("google.")       && params.get("tbm") === "isch")   return true;
      if (host.includes("bing.com")      && path.includes("/images/"))      return true;
      if (host.includes("brave.com")     && path.startsWith("/images"))     return true;
      if (host.includes("yahoo.")        && host.startsWith("images."))     return true;
      if (host.includes("yandex.")       && path.startsWith("/images/"))    return true;
      if (host.startsWith("image.baidu"))                                    return true;
      if (host.includes("duckduckgo.com")&& params.get("ia") === "images")  return true;
      if (host.includes("ecosia.org")    && path.startsWith("/images"))     return true;
      if (host.includes("qwant.com")     && params.get("t") === "images")   return true;
      if (host.includes("naver.com")     && params.get("where") === "image")return true;
      if (host.includes("ask.com")       && path.startsWith("/images"))     return true;
      if (host.includes("kagi.com")      && path.startsWith("/images"))     return true;
      if (host === "pic.sogou.com")                                           return true;
    } catch (_) {}
    return false;
  }

  const SE_IMAGE_URLS = {
    google:     "https://www.google.com/search?tbm=isch&q=",
    bing:       "https://www.bing.com/images/search?q=",
    duckduckgo: "https://duckduckgo.com/?iax=images&ia=images&q=",
    brave:      "https://search.brave.com/images?q=",
    yahoo:      "https://images.search.yahoo.com/search/images?p=",
    yahoojp:    "https://images.search.yahoo.co.jp/search/images?p=",
    yandex:     "https://yandex.ru/images/search?text=",
    baidu:      "https://image.baidu.com/search/index?tn=baiduimage&word=",
    ecosia:     "https://www.ecosia.org/images?q=",
    qwant:      "https://www.qwant.com/?t=images&q=",
    naver:      "https://search.naver.com/search.naver?where=image&query=",
    ask:        "https://www.ask.com/images?q=",
    kagi:       "https://kagi.com/images?q=",
    sogou:      "https://pic.sogou.com/pics?query=",
  };

  function getImageSearchUrl(engineBaseUrl, keyword) {
    try {
      const host = new URL(engineBaseUrl).hostname;
      const kw   = encodeURIComponent(keyword);
      if (host.includes("google."))      return SE_IMAGE_URLS.google      + kw;
      if (host.includes("bing.com"))     return SE_IMAGE_URLS.bing        + kw;
      if (host.includes("duckduckgo"))   return SE_IMAGE_URLS.duckduckgo  + kw;
      if (host.includes("brave.com"))    return SE_IMAGE_URLS.brave       + kw;
      if (host.includes("yahoo.co.jp"))  return SE_IMAGE_URLS.yahoojp     + kw;
      if (host.includes("yahoo.com"))    return SE_IMAGE_URLS.yahoo       + kw;
      if (host.includes("yandex."))      return SE_IMAGE_URLS.yandex      + kw;
      if (host.includes("baidu.com"))    return SE_IMAGE_URLS.baidu       + kw;
      if (host.includes("ecosia.org"))   return SE_IMAGE_URLS.ecosia      + kw;
      if (host.includes("qwant.com"))    return SE_IMAGE_URLS.qwant       + kw;
      if (host.includes("naver.com"))    return SE_IMAGE_URLS.naver       + kw;
      if (host.includes("ask.com"))      return SE_IMAGE_URLS.ask         + kw;
      if (host.includes("kagi.com"))     return SE_IMAGE_URLS.kagi        + kw;
      if (host.includes("sogou.com"))    return SE_IMAGE_URLS.sogou       + kw;
    } catch (_) {}
    return null;
  }

  function getYahooAge(val) {
    if (!val) return null;
    if (val.startsWith("h"))  return "1d";
    if (val === "d")          return "1d";
    if (val === "d2")         return "1d";
    if (val === "d3")         return "1w";
    if (val.startsWith("w"))  return "1w";
    if (val === "m")          return "1m";
    if (val === "m3" || val === "m6") return "1y";
    if (val.startsWith("y"))  return "1y";
    return "1m";
  }

  function getBingImageAge(val) {
    if (!val) return null;
    const m = {
      h:60,    h2:120,   h3:180,   h6:360,   h12:720,
      d:1440,  d2:2880,  d3:4320,
      w:10080, w3:30240,
      m:43200, m3:129600, m6:259200,
      y:525960, y2:1051920, y3:1577880,
      y4:2103840, y5:2629800, y6:3155760,
      y7:3681720, y8:4207680, y9:4733640,
    };
    return m[val] ?? null;
  }

  function applyTimeFilter(val) {
    const engine = getTimeFilterEngine();
    if (!engine) {
      if (val) {
        showToast(t.timeUnsupported || "⚠️ 此搜尋引擎不支援時間篩選", 2500);
      }
      return;
    }
    const url = new URL(location.href);
    if (engine === "bing-images") {
      const mins    = getBingImageAge(val);
      const curQft  = url.searchParams.get("qft") || "";
      const baseQft = curQft.replace(/[+]?filterui:age-lt\d+/g, "").replace(/^\+/, "").trim();
      if (mins !== null) {
        url.searchParams.set("qft", (baseQft ? baseQft + "+" : "") + `filterui:age-lt${mins}`);
      } else {
        if (baseQft) url.searchParams.set("qft", baseQft);
        else         url.searchParams.delete("qft");
      }
    } else if (engine === "bing") {
      if (val) url.searchParams.set("freshness", getBingFreshness(val));
      else     url.searchParams.delete("freshness");
    } else if (engine === "yahoo") {
      const age = val ? getYahooAge(val) : null;
      if (age) url.searchParams.set("age", age);
      else     url.searchParams.delete("age");
    } else {
      if (val) url.searchParams.set("tbs", `qdr:${val}`);
      else     url.searchParams.delete("tbs");
    }
    location.href = url.toString();
  }

  function getFaviconURL(domain) {
    return `https://www.google.com/s2/favicons?sz=16&domain=${domain}`;
  }

  function getDragAfterElement(container, y, selector) {
    const draggableElements = [
      ...container.querySelectorAll(`${selector}:not(.dragging)`),
    ];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - (box.top + box.height / 2);
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element;
  }

  function debounce(fn, delay = 200) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  function updateAddressesVisibility() {
    groups.forEach((group, groupIndex) => {
      group.sites.forEach((site, siteIndex) => {
        const label = document.querySelector(
          `.group-block[data-group-index="${groupIndex}"] .site-container .draggable-site[data-site-index="${siteIndex}"] .site-label`,
        );
        if (label) {
          const displayText = showAddresses
            ? site.url.length > 10
              ? site.url.slice(0, 10) + "..."
              : site.url
            : site.note || "";
          label.textContent = displayText;
          label.style.display = "";
          label.title = site.url;
        }
      });
    });
  }

  let isPromptActive = false;

  function parseSmartDomain(raw) {
    if (!raw || typeof raw !== "string") return null;
    let s = raw.trim();

    s = s.replace(/^https?:\/\//i, "");
    s = s.replace(/#.*$/, "");
    s = s.trim();
    if (!s) return null;

    const leadingDot = s.startsWith(".");
    const hostPart = (leadingDot ? s.slice(1) : s).split(/[/?]/)[0];

    const dotIdx = hostPart.lastIndexOf(".");
    if (dotIdx <= 0) return null;
    const tld     = hostPart.slice(dotIdx + 1);
    const sldPart = hostPart.slice(0, dotIdx);
    if (!/[a-z]/i.test(tld) || !sldPart || !/^[a-z0-9._-]+$/i.test(hostPart)) return null;

    return s.toLowerCase();
  }

  function showCustomPrompt(
    message,
    defaultValue,
    onConfirm,
    onCancel,
    allowEmpty = true,
    hideInput = false,
  ) {
    if (window.__customPromptOpen) {
      log("提示框已在顯示，忽略新的提示請求");
      return;
    }

    window.__customPromptOpen = true;

    const theme =
      typeof panelTheme !== "undefined" && panelTheme ? panelTheme : "light";
    const ss =
      typeof styleSettings !== "undefined" && styleSettings
        ? styleSettings
        : {};
    const radius = ss.borderRadius != null ? ss.borderRadius : 8;
    const fontSz = ss.fontSize != null ? ss.fontSize : 12;
    const bgColor =
      ss.customBackgroundColor || (theme === "dark" ? "#333" : "#fff");
    const fgColor = ss.textColor || (theme === "dark" ? "#fff" : "#000");
    const btnBg = ss.customButtonBg || (theme === "dark" ? "#444" : "#f5f5f5");
    const btnBd = theme === "dark" ? "#555" : "#ccc";

    const overlay = document.createElement("div");
    overlay.className = "custom-prompt-container";
    Object.assign(overlay.style, {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      background: "rgba(0,0,0,0.35)",
      zIndex: "2147483649",
    });

    const box = document.createElement("div");
    box.className = "custom-prompt-box";
    Object.assign(box.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: bgColor,
      color: fgColor,
      padding: "16px",
      borderRadius: radius + "px",
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
      minWidth: "260px",
      maxWidth: "80vw",
      maxHeight: "80vh",
      overflow: "auto",
      fontSize: fontSz + "px",
    });

    const msg = document.createElement("div");
    msg.className = "custom-prompt-message";
    msg.textContent = message == null ? "" : String(message);
    msg.style.marginBottom = "10px";

    const input = document.createElement("input");
    input.className = "custom-prompt-input";
    input.type = "text";
    input.value = defaultValue || "";
    Object.assign(input.style, {
      width: "100%",
      boxSizing: "border-box",
      borderRadius: radius + "px",
      padding: "6px 8px",
      border: `1px solid ${btnBd}`,
    });

    const btns = document.createElement("div");
    btns.className = "custom-prompt-buttons";
    Object.assign(btns.style, {
      marginTop: "12px",
      display: "flex",
      gap: "8px",
      justifyContent: "flex-end",
    });

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "custom-prompt-confirm";
    confirmBtn.textContent =
      typeof t !== "undefined" && t.confirm ? t.confirm : "確認";
    Object.assign(confirmBtn.style, {
      padding: "4px 12px",
      borderRadius: radius + "px",
      cursor: "pointer",
      background: btnBg,
      border: `1px solid ${btnBd}`,
      color: fgColor,
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.className = "custom-prompt-cancel";
    cancelBtn.textContent =
      typeof t !== "undefined" && t.cancel ? t.cancel : "取消";
    Object.assign(cancelBtn.style, {
      padding: "4px 12px",
      borderRadius: radius + "px",
      cursor: "pointer",
      background: btnBg,
      border: `1px solid ${btnBd}`,
      color: fgColor,
    });

    btns.appendChild(confirmBtn);
    btns.appendChild(cancelBtn);
    box.appendChild(msg);
    if (!hideInput) box.appendChild(input);
    box.appendChild(btns);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    let closed = false;
    function cleanup() {
      if (closed) return;
      closed = true;

      if (overlay && overlay.parentNode) overlay.remove();
      document.removeEventListener("keydown", onKeydown);
      window.__customPromptOpen = false;
    }

    function doConfirm() {
      const raw = input.value;
      const val = raw.trim();
      if (!allowEmpty && !val) {
        showToast(t.emptyInput || "Input cannot be empty!");
        return;
      }
      log("提示框關閉，輸入值：", raw);
      cleanup();
      if (typeof onConfirm === "function") onConfirm(raw);
    }

    function doCancel() {
      log("提示框因點擊外部或取消按鈕關閉");
      cleanup();
      if (typeof onCancel === "function") onCancel();
    }

    function onKeydown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        doConfirm();
      } else if (e.key === "Escape") {
        e.preventDefault();
        doCancel();
      }
    }
    document.addEventListener("keydown", onKeydown);
    confirmBtn.addEventListener("click", doConfirm);
    cancelBtn.addEventListener("click", doCancel);
    box.addEventListener("click", (e) => e.stopPropagation());
    shieldFromFileDrop(overlay);

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const restoreScroll = () => {
      document.documentElement.style.overflow = prevOverflow;
    };
    overlay.addEventListener("remove", restoreScroll, { once: true });

    setTimeout(() => input.focus(), 0);
  }

  function shieldFromFileDrop(el) {
    if (!el || el.__fileDropShielded) return;
    el.__fileDropShielded = true;
    const shield = (e) => {
      if (!e.defaultPrevented) {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "none";
      }
    };
    el.addEventListener("dragover",  shield);
    el.addEventListener("dragenter", shield);
    el.addEventListener("dragleave", shield);
    el.addEventListener("drop",      shield);
  }

  function adjustColor(hex, offset) {
    if (!hex || typeof hex !== "string") return "rgb(128,128,128)";
    hex = hex.replace("#", "");
    if (hex.length === 3) {
      hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return "rgb(128,128,128)";
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgb(${Math.min(255, Math.max(0, r + offset))}, ${Math.min(255, Math.max(0, g + offset))}, ${Math.min(255, Math.max(0, b + offset))})`;
  }

  function showToast(msg, duration = 1500) {
    const toast = document.createElement("div");
    const _isDarkToast = panelTheme === "dark";
    const _toastBg     = _isDarkToast ? "rgba(255,255,255,0.13)" : "rgba(0,0,0,0.76)";
    const _toastRadius = (styleSettings.borderRadius ?? 6) + "px";
    const _toastBorder = _isDarkToast ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(0,0,0,0.28)";

    toast.textContent = msg;
    toast.style.cssText = `
      position:fixed; bottom:20px; right:20px;
      background:${_toastBg}; color:#fff;
      border:${_toastBorder}; border-radius:${_toastRadius};
      padding:8px 14px; font-family:sans-serif;
      font-size:${(styleSettings.fontSize ?? 13) - 1}px;
      box-shadow:0 4px 16px rgba(0,0,0,0.3);
      backdrop-filter:blur(4px);
      z-index:2147483649; opacity:0;
      transition:opacity 0.25s ease;
      pointer-events:none; white-space:nowrap;
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function showSyntaxPanel() {
    const existingPanel = document.getElementById("syntax-panel");
    if (existingPanel) {
      existingPanel.remove();
    }

    const syntaxPanel = document.createElement("div");
    syntaxPanel.id = "syntax-panel";
    syntaxPanel.style.cssText = `
      position:fixed; z-index:2147483648;
      max-width:300px; max-height:80vh; overflow-y:auto;
      padding:10px; font-family:sans-serif;
      font-size:${styleSettings.fontSize}px;
      border-radius:${styleSettings.borderRadius}px;
      border:1px solid ${panelTheme === "dark" ? "#555" : "#ccc"};
      box-shadow:0 4px 16px rgba(0,0,0,0.22);
      background:${styleSettings.backgroundImage ? "transparent" : panelTheme === "dark" ? "#333" : "#fff"};
      color:${styleSettings.textColor || (panelTheme === "dark" ? "#fff" : "#000")};
      opacity:1;
    `;

    const _bgImgSyntax = styleSettings.backgroundImage;
    const _bgImgSyntaxSafe = (_bgImgSyntax && /^(https?:|data:image\/)/.test(_bgImgSyntax)) ? _bgImgSyntax : "";
    if (_bgImgSyntaxSafe) {
      syntaxPanel.style.backgroundImage = `linear-gradient(rgba(0,0,0,${1 - styleSettings.imageOpacity}), rgba(0,0,0,${1 - styleSettings.imageOpacity})), url(${_bgImgSyntaxSafe})`;
      syntaxPanel.style.backgroundRepeat =
        styleSettings.imageMode === "tile" ? "repeat" : "no-repeat";
      syntaxPanel.style.backgroundPosition =
        styleSettings.imageMode === "center"
          ? "center"
          : `${styleSettings.imageOffsetX || 0}px ${styleSettings.imageOffsetY || 0}px`;
      syntaxPanel.style.backgroundSize = `${styleSettings.imageScale * 100}%`;
    }

    const title = document.createElement("div");
    title.textContent = t.syntaxPanelTitle;
    title.style.fontWeight = "bold";
    title.style.marginBottom = "10px";
    syntaxPanel.appendChild(title);

    t.syntaxExamples.forEach(({ syntax, desc }) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.marginBottom = "6px";
      row.style.gap = "6px";

      const syntaxText = document.createElement("span");
      syntaxText.textContent = syntax;
      syntaxText.style.fontFamily = "monospace";
      syntaxText.style.background = styleSettings.customButtonBg
        || (panelTheme === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.07)");
      syntaxText.style.padding = "2px 4px";
      syntaxText.style.borderRadius = styleSettings.borderRadius + "px";
      row.appendChild(syntaxText);

      const descText = document.createElement("span");
      descText.textContent = desc;
      descText.style.flex = "1";
      row.appendChild(descText);

      const copyBtn = document.createElement("button");
      copyBtn.textContent = "📋";
      copyBtn.style.padding = "2px 6px";
      copyBtn.style.border = `1px solid ${panelTheme === "dark" ? "#666" : "#888"}`;
      copyBtn.style.borderRadius = styleSettings.borderRadius + "px";
      copyBtn.style.cursor = "pointer";
      copyBtn.style.fontSize = styleSettings.fontSize + "px";
      copyBtn.style.opacity = styleSettings.buttonOpacity;
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(syntax).then(() => showToast(t.copied));
      };
      row.appendChild(copyBtn);

      syntaxPanel.appendChild(row);
    });

    document.body.appendChild(syntaxPanel);
    shieldFromFileDrop(syntaxPanel);

    requestAnimationFrame(() => {
      const mainPanel = document.getElementById("site-group-panel");
      const tipW = syntaxPanel.offsetWidth  || 300;
      const tipH = syntaxPanel.offsetHeight || 200;
      const margin = 8;
      if (mainPanel && mainPanel.style.display !== "none") {
        const r = mainPanel.getBoundingClientRect();
        const leftPos  = r.left - tipW - margin;
        const rightPos = r.right + margin;
        const topPos   = Math.min(r.top, window.innerHeight - tipH - margin);
        if (leftPos >= margin) {
          syntaxPanel.style.left = leftPos + "px";
          syntaxPanel.style.top  = Math.max(margin, topPos) + "px";
        } else if (rightPos + tipW <= window.innerWidth - margin) {
          syntaxPanel.style.left = rightPos + "px";
          syntaxPanel.style.top  = Math.max(margin, topPos) + "px";
        } else {
          syntaxPanel.style.left = Math.max(margin, r.left) + "px";
          syntaxPanel.style.top  = (r.bottom + margin) + "px";
        }
        syntaxPanel.style.right = "auto";
      } else {
        syntaxPanel.style.top   = (styleSettings.panelTop ?? 80) + "px";
        syntaxPanel.style.right = (styleSettings.panelRight ?? 20) + "px";
      }
    });

    const closeSyntaxPanel = (event) => {
      if (
        !syntaxPanel.contains(event.target) &&
        !document.getElementById("syntax-help-btn")?.contains(event.target)
      ) {
        syntaxPanel.remove();
        document.removeEventListener("click", closeSyntaxPanel);
      }
    };
    document.addEventListener("click", closeSyntaxPanel);
  }

  function applyThemeValues(theme) {
    const isDark = theme === "dark";
    let baseButtonBg, backgroundColor, textColor, buttonBg;

    if (theme === "custom") {
      baseButtonBg    = styleSettings.customButtonBg;
      backgroundColor = styleSettings.customBackgroundColor;
      textColor       = styleSettings.customTextColor;
      buttonBg        = adjustColor(baseButtonBg, styleSettings.contrast);
    } else {
      baseButtonBg    = isDark ? "#4a4a4a" : "#f5f5f5";
      backgroundColor = styleSettings.backgroundColor || (isDark ? "#333333" : "#ffffff");
      textColor       = styleSettings.textColor       || (isDark ? "#ffffff" : "#000000");
      buttonBg        = adjustColor(baseButtonBg, styleSettings.contrast);
    }

    const borderColor   = adjustColor(baseButtonBg, styleSettings.contrast);
    const borderRadius  = styleSettings.borderRadius + "px";
    const fontSize      = styleSettings.fontSize + "px";
    const buttonOpacity = styleSettings.buttonOpacity;
    const panelOpacity  = styleSettings.opacity;
    const groupOpacity  = styleSettings.groupOpacity;
    const safeBg = /^#[0-9a-fA-F]{6}$/.test(backgroundColor)
      ? backgroundColor
      : isDark ? "#333333" : "#ffffff";
    const r = parseInt(safeBg.slice(1, 3), 16);
    const g = parseInt(safeBg.slice(3, 5), 16);
    const b = parseInt(safeBg.slice(5, 7), 16);

    return { isDark, baseButtonBg, backgroundColor, textColor, buttonBg,
             borderColor, borderRadius, fontSize, buttonOpacity,
             panelOpacity, groupOpacity, r, g, b };
  }

  function applyThemeToDom(v) {
    const {
      textColor, buttonBg, borderColor, borderRadius,
      fontSize, buttonOpacity, panelOpacity, groupOpacity, r, g, b,
    } = v;

    const panel = document.getElementById("site-group-panel");
    if (panel) {
      panel.style.background = styleSettings.backgroundImage
        ? "transparent"
        : `rgba(${r},${g},${b},${panelOpacity})`;
      panel.style.color = textColor;
      panel.style.borderColor = borderColor;
      panel.style.borderRadius = Math.max(parseInt(borderRadius) || 6, 10) + "px";
      panel.style.fontSize = fontSize;
      panel.style.position = "fixed";
      panel.style.top    = (styleSettings.panelTop    ?? 80)  + "px";
      if (styleSettings.panelLeft >= 0) {
        panel.style.left  = styleSettings.panelLeft + "px";
      } else {
        const _r = styleSettings.panelRight ?? 20;
        const _w = parseInt(panel.style.width) || getEffectivePanelWidth();
        panel.style.left = Math.max(8, window.innerWidth - _r - _w) + "px";
      }
      panel.style.right = "auto";
      panel.style.transform = "translate(0,0)";
      panel.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      panel.style.maxHeight = (styleSettings.panelMaxHeight ?? 87) + "vh";
      panel.style.overflowY = "auto";
      panel.style.opacity = panelOpacity;

      {
        const _gc = styleSettings.borderGlowColor || "#00bfff";
        const _gs = Math.max(4, Math.min(32, styleSettings.borderGlowStrength || 12));
        let _shadow = "0 4px 20px rgba(0,0,0,0.35)";
        if (styleSettings.enableBorderGlow) {
          _shadow += `, 0 0 ${_gs}px ${_gc}, 0 0 ${_gs * 2}px ${_gc}44`;
          if (styleSettings.borderGlowInset) {
            _shadow += `, inset 0 0 ${Math.round(_gs * 0.6)}px ${_gc}33`;
          }
        }
        panel.style.boxShadow = _shadow;
      }

      {
        let sheenEl = panel.querySelector(".panel-sheen");
        if (styleSettings.enableSheen) {
          if (!sheenEl) {
            sheenEl = document.createElement("div");
            sheenEl.className = "panel-sheen";
            sheenEl.style.cssText = `
              position:absolute; inset:0; pointer-events:none;
              border-radius:inherit; z-index:0;
            `;
            panel.insertBefore(sheenEl, panel.firstChild);
          }
          const _angle = styleSettings.sheenAngle ?? 135;
          const _op    = Math.max(0.02, Math.min(0.25, styleSettings.sheenOpacity ?? 0.08));
          sheenEl.style.background =
            `linear-gradient(${_angle}deg, rgba(255,255,255,${_op}) 0%, transparent 55%)`;
          sheenEl.style.display = "block";
        } else if (sheenEl) {
          sheenEl.style.display = "none";
        }
      }

      if (styleSettings.enableOverlayDarkening) {
        let overlayStyle = document.querySelector("style[data-overlay-style]");
        if (!overlayStyle) {
          overlayStyle = document.createElement("style");
          overlayStyle.setAttribute("data-overlay-style", "true");
          document.head.appendChild(overlayStyle);
        }

        overlayStyle.textContent = `
        #site-group-panel::before, #syntax-panel::before {
            content: '';
            position: absolute;
            top: 0; left: 0;
            width: 100%;
            height: 10000px;
            background: rgba(0,0,0,${styleSettings.overlayStrength || 0});
            z-index: 1;
            pointer-events: none;
        }
        #site-group-panel > *, #syntax-panel > * {
            position: relative;
            z-index: 2;
        }
    `;
      } else {
        const overlayStyle = document.querySelector(
          "style[data-overlay-style]",
        );
        if (overlayStyle) overlayStyle.remove();
      }

      const _bgImgMain = styleSettings.backgroundImage;
      const _bgImgMainSafe = (_bgImgMain && /^(https?:|data:image\/)/.test(_bgImgMain)) ? _bgImgMain : "";
      if (_bgImgMainSafe) {
        panel.style.backgroundImage = `linear-gradient(rgba(0,0,0,${1 - styleSettings.imageOpacity}), rgba(0,0,0,${1 - styleSettings.imageOpacity})), url(${_bgImgMainSafe})`;
        panel.style.backgroundRepeat =
          styleSettings.imageMode === "tile" ? "repeat" : "no-repeat";
        panel.style.backgroundPosition =
          styleSettings.imageMode === "center"
            ? "center"
            : `${styleSettings.imageOffsetX || 0}px ${styleSettings.imageOffsetY || 0}px`;
        panel.style.backgroundSize = `${styleSettings.imageScale * 100}%`;
      }

      panel.querySelectorAll(".group-block").forEach((el) => {
        el.style.background = `rgba(${r},${g},${b},${groupOpacity})`;
        el.style.borderColor = borderColor;
        el.style.borderRadius = borderRadius;

        {
          const _gc = styleSettings.borderGlowColor || "#00bfff";
          const _gs = Math.max(2, Math.min(20, (styleSettings.borderGlowStrength || 12) * 0.5));
          if (styleSettings.enableGroupGlow) {
            el.style.boxShadow =
              `0 2px 8px rgba(0,0,0,0.18), 0 0 ${_gs}px ${_gc}, 0 0 ${_gs * 2}px ${_gc}44`;
          } else {
            el.style.boxShadow = "";
          }
        }

        {
          let sheenEl = el.querySelector(".group-sheen");
          if (styleSettings.enableSheen) {
            if (!sheenEl) {
              sheenEl = document.createElement("div");
              sheenEl.className = "group-sheen";
              sheenEl.style.cssText =
                "position:absolute; inset:0; pointer-events:none; border-radius:inherit; z-index:0;";
              el.style.position = el.style.position || "relative";
              el.insertBefore(sheenEl, el.firstChild);
            }
            const _angle = styleSettings.sheenAngle ?? 135;
            const _op    = Math.max(0.02, Math.min(0.25, styleSettings.sheenOpacity ?? 0.08));
            sheenEl.style.background =
              `linear-gradient(${_angle}deg, rgba(255,255,255,${_op}) 0%, transparent 55%)`;
            sheenEl.style.display = "block";
          } else if (sheenEl) {
            sheenEl.style.display = "none";
          }
        }
      });

      panel.querySelectorAll("button:not(.icon-btn)").forEach((el) => {
        el.style.background = buttonBg;
        el.style.borderColor = borderColor;
        el.style.borderRadius = borderRadius;
        el.style.color = textColor;
        el.style.opacity = buttonOpacity;
        el.style.fontSize = fontSize;
        el.onmouseover = () => {
          el.style.background = adjustColor(buttonBg, 10);
        };
        el.onmouseout = () => {
          el.style.background = buttonBg;
        };
      });

      {
        const _sbw = styleSettings.siteButtonWidth ?? 0;
        const _minCell = _sbw > 0 ? _sbw : 104;
        panel.querySelectorAll(".site-container").forEach(sc => {
          sc.style.gridTemplateColumns = `repeat(auto-fill, minmax(${_minCell}px, 1fr))`;
        });
      }

      panel.querySelectorAll(".draggable-site").forEach((el) => {
        el.style.opacity    = buttonOpacity;
        el.style.background = buttonBg;
        el.style.color      = textColor;
        el.dataset.baseBg   = buttonBg;
        const _sbw = styleSettings.siteButtonWidth ?? 0;
        if (_sbw > 0) {
          el.style.width    = _sbw + "px";
          el.style.maxWidth = _sbw + "px";
        } else {
          el.style.width    = "";
          el.style.maxWidth = "none";
        }
        const _lbl = el.querySelector(".site-label");
        if (_lbl) _lbl.style.display = (_sbw > 0 && _sbw <= 28) ? "none" : "";

        {
          const _gc = styleSettings.borderGlowColor || "#00bfff";
          const _gs = Math.max(2, Math.min(14, (styleSettings.borderGlowStrength || 12) * 0.35));
          if (styleSettings.enableSiteGlow) {
            el.style.boxShadow =
              `0 1px 3px rgba(0,0,0,0.15), 0 0 ${_gs}px ${_gc}, 0 0 ${_gs * 2}px ${_gc}44`;
          } else {
            el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.10)";
          }
        }

        {
          let sheenEl = el.querySelector(".site-sheen");
          if (styleSettings.enableSheen) {
            if (!sheenEl) {
              sheenEl = document.createElement("div");
              sheenEl.className = "site-sheen";
              sheenEl.style.cssText =
                "position:absolute; inset:0; pointer-events:none; border-radius:inherit; z-index:0;";
              el.style.position = "relative";
              el.insertBefore(sheenEl, el.firstChild);
            }
            const _angle = styleSettings.sheenAngle ?? 135;
            const _op    = Math.max(0.02, Math.min(0.25, styleSettings.sheenOpacity ?? 0.08));
            sheenEl.style.background =
              `linear-gradient(${_angle}deg, rgba(255,255,255,${_op}) 0%, transparent 60%)`;
            sheenEl.style.display = "block";
          } else if (sheenEl) {
            sheenEl.style.display = "none";
          }
        }
      });

      const textBorderVal = styleSettings.textBorder;
      panel.querySelectorAll(".site-label, .group-name").forEach((el) => {
        el.style.textShadow = textBorderVal
          ? "0 0 1px rgba(0,0,0,0.4)"
          : "none";
        el.style.webkitTextStroke = textBorderVal
          ? "0.3px currentColor"
          : "0";
      });

      const toc = styleSettings.textOpacityCompensation || 1.0;
      panel.querySelectorAll(".site-label, .group-name").forEach((el) => {
        el.style.filter = toc !== 1.0 ? `brightness(${toc})` : "";
      });

      const tbg = styleSettings.textBackgroundColor || "";
      panel.querySelectorAll(".site-label").forEach((el) => {
        el.style.backgroundColor = tbg;
        el.style.borderRadius = tbg ? "2px" : "";
        el.style.padding = tbg ? "0 2px" : "";
      });
    }

    const syntaxPanel = document.getElementById("syntax-panel");
    if (syntaxPanel) {
      syntaxPanel.style.background = styleSettings.backgroundImage
        ? "transparent"
        : `rgba(${r},${g},${b},${panelOpacity})`;
      syntaxPanel.style.color        = textColor;
      syntaxPanel.style.borderColor  = borderColor;
      syntaxPanel.style.borderRadius = borderRadius;
      syntaxPanel.style.fontSize     = fontSize;
      syntaxPanel.style.position     = "fixed";
      syntaxPanel.style.transition   = "opacity 0.2s ease, transform 0.2s ease";
      syntaxPanel.style.maxHeight    = "87vh";
      syntaxPanel.style.overflowY    = "auto";
      syntaxPanel.style.opacity      = panelOpacity;

      if (styleSettings.backgroundImage) {
        syntaxPanel.style.backgroundImage = `linear-gradient(rgba(0,0,0,${1 - styleSettings.imageOpacity}), rgba(0,0,0,${1 - styleSettings.imageOpacity})), url(${styleSettings.backgroundImage})`;
        syntaxPanel.style.backgroundRepeat =
          styleSettings.imageMode === "tile" ? "repeat" : "no-repeat";
        syntaxPanel.style.backgroundPosition =
          styleSettings.imageMode === "center"
            ? "center"
            : `${styleSettings.imageOffsetX || 0}px ${styleSettings.imageOffsetY || 0}px`;
        syntaxPanel.style.backgroundSize = `${styleSettings.imageScale * 100}%`;
      }

      syntaxPanel.querySelectorAll("button").forEach((el) => {
        el.style.background = buttonBg;
        el.style.borderColor = borderColor;
        el.style.color = textColor;
        el.style.borderRadius = borderRadius;
        el.style.opacity = buttonOpacity;
        el.style.fontSize = fontSize;
      });

      syntaxPanel.querySelectorAll("span, div, p, button").forEach((el) => {
        el.style.textShadow = styleSettings.textBorder
          ? "0 0 1px rgba(0,0,0,0.4)"
          : "none";
        el.style.webkitTextStroke = styleSettings.textBorder
          ? "0.3px currentColor"
          : "0";
      });
    }

    {
      const _scw = document.getElementById("search-config-wrap");
      if (_scw) {
        const _sbg    = styleSettings.searchBarBg || "";
        const _sbgOp  = styleSettings.searchBarBgOpacity ?? 0;
        const _sfg    = styleSettings.searchBarFg || "";
        const _sglow  = !!styleSettings.searchBarGlowEnabled;
        const _sglowC = styleSettings.searchBarGlowColor || "#5599ff";
        const _sglowS = Math.max(2, Math.min(16, styleSettings.searchBarGlowStrength || 6));
        const _isDarkScw = panelTheme === "dark";
        if (_sbg && _sbgOp > 0) {
          const _sr = parseInt(_sbg.slice(1,3),16) || 0;
          const _sg = parseInt(_sbg.slice(3,5),16) || 0;
          const _sb2 = parseInt(_sbg.slice(5,7),16) || 0;
          _scw.style.background = `rgba(${_sr},${_sg},${_sb2},${_sbgOp})`;
          _scw.style.border = `1px solid rgba(${_sr},${_sg},${_sb2},${Math.min(1,_sbgOp+0.15)})`;
        } else {
          _scw.style.background = _isDarkScw ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
          _scw.style.border = `1px solid ${_isDarkScw ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"}`;
        }
        _scw.style.color      = _sfg || "";
        _scw.style.boxShadow  = _sglow
          ? `0 0 ${_sglowS}px ${_sglowC}, 0 0 ${_sglowS * 2}px ${_sglowC}44`
          : "";
      }
    }

    const toggleBtnSimple = document.getElementById("site-toggle-simple");
    if (toggleBtnSimple) {
      toggleBtnSimple.style.pointerEvents = "auto";
      applyToggleBtnStyle(toggleBtnSimple);
    }
    applyAllBtnIcons();
  }

  function applyTheme(theme) {
    log("Applying theme:", theme, "Style settings:", styleSettings);
    applyThemeToDom(applyThemeValues(theme));
  }

  function initSearchConfigCollapse() {
    const wrap = document.getElementById("search-config-wrap");
    if (!wrap) {
      warn("search-config-wrap not found");
      return;
    }

    let toggleBtn = document.getElementById("search-config-toggle");
    if (!toggleBtn) {
      toggleBtn = document.createElement("button");
      toggleBtn.id = "search-config-toggle";
      toggleBtn.textContent = "☰";
      toggleBtn.style.cssText = `
        background:transparent; border:none; cursor:pointer;
        font-size:18px; line-height:1; padding:2px 4px;
        flex-shrink:0; z-index:99;
      `;
      const _hdrCon = document.querySelector(".panel-header-container");
      if (_hdrCon) _hdrCon.appendChild(toggleBtn);

      toggleBtn.title =
        "Collapse Settings\n折疊設定\n折叠设置\n設定を折りたたむ";

    }

    let collapsed = GM_getValue("searchConfigCollapsed", false);
    wrap.style.display = collapsed ? "none" : "block";
    const toolbar = document.getElementById("toolbar-container");
    if (toolbar) toolbar.style.display = collapsed ? "none" : "flex";
    if (collapsed) {
      const p = document.getElementById("site-group-panel");
      if (p) {
        const hdr = p.querySelector(".panel-header-container");
        const naturalW = hdr ? hdr.scrollWidth + 24 : getEffectivePanelWidth();
        const _initColW = Math.min(naturalW, getEffectivePanelWidth());
        p.style.width = _initColW + "px";
        p.style.maxWidth = _initColW + "px";
      }
    }

    toggleBtn.onclick = () => {
      collapsed = !collapsed;
      const panel = document.getElementById("site-group-panel");
      if (collapsed) {
        const hdr = panel && panel.querySelector(".panel-header-container");
        const naturalW = hdr ? hdr.scrollWidth + 24 : getEffectivePanelWidth();
        if (panel) {
          const _colW = Math.min(naturalW, getEffectivePanelWidth());
          panel.style.width = _colW + "px";
          panel.style.maxWidth = _colW + "px";
        }
      } else {
        if (panel) {
          const _expW = getEffectivePanelWidth();
          panel.style.width    = _expW + "px";
          panel.style.maxWidth = _expW + "px";
        }
      }
      wrap.style.display = collapsed ? "none" : "block";
      const tb = document.getElementById("toolbar-container");
      if (tb) tb.style.display = collapsed ? "none" : "flex";
      GM_setValue("searchConfigCollapsed", collapsed);
    };
  }

  function renderSites(panel) {
    panel.style.minWidth = "300px";
    panel.style.width    = getEffectivePanelWidth() + "px";
    panel.style.maxWidth = getEffectivePanelWidth() + "px";
    const _bodyTarget = document.getElementById("panel-group-slot")
      || document.getElementById("panel-body")
      || panel;

    groups.forEach((group) => {
      group.sites = group.sites.map((site) =>
        typeof site === "string" ? { url: site, note: "" } : site,
      );
    });
    save();

    const existingBlocks = new Map();
    _bodyTarget.querySelectorAll(".group-block").forEach((block) => {
      existingBlocks.set(block.dataset.groupIndex, block);
    });

    existingBlocks.forEach((block, index) => {
      if (!groups[index]) {
        block.remove();
        existingBlocks.delete(index);
      }
    });

    groups.forEach((group, groupIndex) => {
      let block = existingBlocks.get(String(groupIndex));

      if (!block) {
        block = document.createElement("div");
        block.className = "group-block draggable-group";
        block.dataset.groupIndex = groupIndex;
        block.dataset.groupName = group.name;
        block.style.marginBottom = "14px";
        block.style.padding = "8px";
        block.style.borderRadius = styleSettings.borderRadius + "px";
        block.style.boxSizing = "border-box";
        block.draggable = true;

        block.addEventListener("dragstart", (e) => {
          e.stopPropagation();
          block.classList.add("dragging");
          block.style.opacity = "";
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", "group");
          e.dataTransfer.setData("groupIndex", block.dataset.groupIndex);
        });

        block.addEventListener("dragend", (e) => {
          e.stopPropagation();
          block.classList.remove("dragging");
          block.style.opacity = "";
        });

        _bodyTarget.appendChild(block);
      } else {
        block.dataset.groupIndex = groupIndex;
        block.dataset.groupName = group.name;
      }

      let header = block.querySelector(".group-header");
      if (!header) {
        header = document.createElement("div");
        header.className = "group-header";
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.justifyContent = "space-between";
        header.style.marginBottom = "4px";
        block.appendChild(header);
      }

      let leftContainer = header.querySelector(".left-container");
      if (!leftContainer) {
        leftContainer = document.createElement("div");
        leftContainer.className = "left-container";
        leftContainer.style.cssText = "display:flex;align-items:center;flex:1;min-width:0;";
        header.appendChild(leftContainer);
      }

      let nameSpan = leftContainer.querySelector(".group-name");
      if (!nameSpan) {
        nameSpan = document.createElement("span");
        nameSpan.className = "group-name";
        nameSpan.style.cssText = `
          font-weight:500; font-size:11px; letter-spacing:0.03em;
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
          opacity:0.65;
        `;
        leftContainer.appendChild(nameSpan);
      }
      nameSpan.textContent = group.name;

      if (!block._multiSelected) block._multiSelected = new Set();

      const _msHexToRgba = (hex, a) => {
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${a})`;
      };
      const _hlColor  = () => styleSettings.multiSelectColor  || "#ffc400";
      const _hlOpacity = () => styleSettings.multiSelectOpacity != null ? styleSettings.multiSelectOpacity : 0.85;

      const _exitMultiSelect = (blk, mBtn, sBtn) => {
        blk.dataset.multiSelectActive = "false";
        blk._multiSelected.clear();
        mBtn.style.opacity = "0.6";
        mBtn.style.background = "none";
        mBtn.style.color = "";
        mBtn.style.fontWeight = "";
        mBtn._activeStyle = null;
        sBtn.style.display = "none";
        sBtn.textContent = "↗";
        sBtn.style.background = "none";
        sBtn.style.color = "#e08000";
        sBtn.style.fontWeight = "";
        sBtn.style.opacity = "";
        blk.querySelectorAll(".site-ms-chk").forEach(c => { c.style.display = "none"; c.checked = false; });
        const ov = document.getElementById(`ms-overlay-${blk.dataset.groupIndex}`);
        if (ov) ov.remove();
        const banner = document.getElementById(`ms-banner-${blk.dataset.groupIndex}`);
        if (banner) banner.remove();
        panel.dataset.multiSelectLock = "";
      };

      let multiPill = leftContainer.querySelector(".multi-pill");
      if (!multiPill) {
        multiPill = document.createElement("div");
        multiPill.className = "multi-pill";
        multiPill.style.cssText = `
          display:flex; align-items:center; gap:0;
          border:1px solid rgba(128,128,128,0.25);
          border-radius:8px; overflow:hidden; flex-shrink:0;
          background:rgba(0,0,0,0.08); margin-left:6px;
        `;
        leftContainer.appendChild(multiPill);
      }

      const _GRP_SVG = GRP_SVG_MAP;
      function _applyGrpIcon(el, emoji) {
        el.dataset.grpEmoji = emoji;
        const _svgMode = (styleSettings.iconStyle || "emoji") !== "emoji";
        const _svgColor = styleSettings.svgIconColor || "";
        if (_svgMode && _GRP_SVG[emoji]) {
          el.innerHTML = _GRP_SVG[emoji];
          el.style.fontSize = "0";
          el.style.color = _svgColor || "";
        } else {
          el.textContent = emoji;
          el.style.fontSize = "";
          el.style.color = "";
        }
      }

      function mkPillBtn(emoji, titleText) {
        const btn = document.createElement("button");
        btn.className = "icon-btn";
        btn.title = titleText;
        btn.dataset.grpEmoji = emoji;
        btn.style.cssText = `
          background:none; border:none; border-radius:0;
          cursor:pointer; padding:2px 7px;
          font-size:12px; line-height:1.6;
          display:inline-flex; align-items:center; justify-content:center;
          opacity:0.6; transition:opacity 0.15s, background 0.15s;
        `;
        _applyGrpIcon(btn, emoji);
        btn.addEventListener("mouseenter", () => { btn.style.opacity = "1"; btn.style.background = "rgba(128,128,128,0.12)"; });
        btn.addEventListener("mouseleave", () => { btn.style.opacity = btn._activeStyle ? "1" : "0.6"; btn.style.background = btn._activeStyle || "none"; });
        return btn;
      }

      let multiBtn = multiPill.querySelector(".multi-btn");
      let sendBtn  = multiPill.querySelector(".multi-send-btn");

      if (!multiBtn) {
        multiBtn = mkPillBtn("☑", t.multiSelectMode || "複選");
        multiBtn.className += " multi-btn";
        multiPill.appendChild(multiBtn);

        const pillSep = document.createElement("span");
        pillSep.style.cssText = "width:1px;height:14px;background:rgba(128,128,128,0.25);flex-shrink:0;display:none;";
        pillSep.className = "multi-pill-sep";
        multiPill.appendChild(pillSep);

        sendBtn = mkPillBtn("↗", t.multiSelectSend || "開啟已選");
        sendBtn.className += " multi-send-btn";
        sendBtn.style.display = "none";
        sendBtn.style.color = "#e08000";
        multiPill.appendChild(sendBtn);
      }

      let rightContainer = header.querySelector(".right-container");
      if (!rightContainer) {
        rightContainer = document.createElement("div");
        rightContainer.className = "right-container";
        rightContainer.style.cssText = `
          display:flex; align-items:center; gap:0;
          border:1px solid rgba(128,128,128,0.25);
          border-radius:8px; overflow:hidden; flex-shrink:0;
          background:rgba(0,0,0,0.12);
          opacity:0; transition:opacity 0.15s;
          pointer-events:none;
        `;
        header.addEventListener("mouseenter", () => {
          rightContainer.style.opacity = "1";
          rightContainer.style.pointerEvents = "auto";
        });
        header.addEventListener("mouseleave", () => {
          rightContainer.style.opacity = "0";
          rightContainer.style.pointerEvents = "none";
        });
        header.appendChild(rightContainer);
      }

      function mkIconBtn(emoji, titleText) {
        const btn = document.createElement("button");
        btn.className = "icon-btn";
        btn.title = titleText;
        btn.style.cssText = `
          background:none; border:none; border-radius:0;
          cursor:pointer; padding:2px 7px;
          font-size:12px; line-height:1.6;
          display:inline-flex; align-items:center; justify-content:center;
          opacity:0.6; transition:opacity 0.15s, background 0.15s;
        `;
        _applyGrpIcon(btn, emoji);
        btn.addEventListener("mouseenter", () => { btn.style.opacity = "1"; btn.style.background = "rgba(128,128,128,0.12)"; });
        btn.addEventListener("mouseleave", () => { btn.style.opacity = "0.6"; btn.style.background = "none"; });
        return btn;
      }

      function mkSep() {
        const s = document.createElement("span");
        s.style.cssText = "width:1px;height:14px;background:rgba(128,128,128,0.25);flex-shrink:0;";
        return s;
      }

      let editBtn = rightContainer.querySelector(".edit-btn");
      if (!editBtn) {
        editBtn = mkIconBtn("✎", t.enterGroupName || "重新命名");
        editBtn.className += " edit-btn";
        rightContainer.appendChild(editBtn);
        rightContainer.appendChild(mkSep());
      }

      editBtn.onclick = null;
      editBtn.onclick = (function (currentIndex) {
        return function () {
          const currentGroup = groups[currentIndex];
          if (!currentGroup) return;
          showCustomPrompt(t.enterGroupName, currentGroup.name, (newName) => {
            if (newName && newName.trim()) {
              groups[currentIndex].name = newName.trim();
              save();
              renderSites(panel);
              showToast(t.groupNameUpdated);
            } else {
              showToast(t.emptyGroupName);
            }
          });
        };
      })(groupIndex);

      let addSiteBtnInline = rightContainer.querySelector(".add-site-btn");
      if (!addSiteBtnInline) {
        addSiteBtnInline = mkIconBtn("➕", t.addSite || "新增站台");
        addSiteBtnInline.className += " add-site-btn";
        rightContainer.appendChild(addSiteBtnInline);
        rightContainer.appendChild(mkSep());
      }

      addSiteBtnInline.onclick = () => {
        if (isPromptActive) return;
        showCustomPrompt(t.enterSite, "", (siteInput) => {
          const parsed = parseSmartDomain(siteInput);
          if (parsed) {
            showCustomPrompt(
              t.enterSiteNote || "請輸入站台註解（建議4個字以內）：",
              "",
              (note) => {
                group.sites.push({ url: parsed, note: note.trim() || "" });
                save();
                renderSites(panel);
                showToast(`${t.addSite} 成功！`);
              },
            );
          } else showToast(t.invalidSite || "請輸入有效網址！");
        });
      };

      let delBtn = rightContainer.querySelector(".del-btn");
      if (!delBtn) {
        delBtn = mkIconBtn("🗑️", t.confirmDel ? t.confirmDel(group.name) : "刪除群組");
        delBtn.className += " del-btn";
        rightContainer.appendChild(delBtn);
      }

      delBtn.onclick = null;
      delBtn.onclick = (function (currentIndex) {
        return function () {
          const currentGroup = groups[currentIndex];
          if (!currentGroup) return;
          showCustomPrompt(t.confirmDel(currentGroup.name), "", () => {
            groups.splice(currentIndex, 1);
            save();
            renderSites(panel);
            showToast(t.groupDeleted(currentGroup.name));
          });
        };
      })(groupIndex);

      multiBtn.onclick = null;
      multiBtn.onclick = (function (blk, mBtn, sBtn) {
        return function () {
          const isActive = blk.dataset.multiSelectActive === "true";
          if (isActive) {
            if (typeof blk._msExit === "function") blk._msExit();
            else {
              _exitMultiSelect(blk, mBtn, sBtn);
              blk.querySelector(".multi-pill-sep").style.display = "none";
              showToast((t.multiSelectMode || "複選") + " OFF");
            }
          } else {
            blk.dataset.multiSelectActive = "true";
            mBtn.style.opacity = "1";
            mBtn.style.color = "#fff";
            mBtn.style.fontWeight = "bold";
            mBtn._activeStyle = "#c88000";
            mBtn.style.background = "#c88000";
            mBtn.style.borderRadius = "0";
            sBtn.style.display = "";
            blk.querySelector(".multi-pill-sep").style.display = "";
            showToast((t.multiSelectMode || "複選") + " ON ☑");
            panel.dataset.multiSelectLock = "true";

            const _grpSelKey = `ms_sel_${blk.dataset.groupIndex}`;
            const _savedSel = GM_getValue(_grpSelKey, null);
            if (_savedSel) {
              try {
                const _urls = JSON.parse(_savedSel);
                if (Array.isArray(_urls)) _urls.forEach(u => blk._multiSelected.add(u));
              } catch(_) {}
            }

            blk.querySelectorAll(".site-ms-chk").forEach(c => {
              c.style.display = "";
              c.checked = blk._multiSelected.has(c.dataset.msUrl);
            });

            const _updateSendLabel = () => {
              const n = blk._multiSelected.size;
              sBtn.textContent = n > 0 ? `↗${n}` : "↗";
              if (n > 0) {
                sBtn.style.background = "#e08000";
                sBtn.style.color = "#fff";
                sBtn.style.fontWeight = "bold";
                sBtn.style.opacity = "1";
              } else {
                sBtn.style.background = "none";
                sBtn.style.color = "#e08000";
                sBtn.style.fontWeight = "";
                sBtn.style.opacity = "0.7";
              }
            };
            blk._updateSendLabel = _updateSendLabel;
            _updateSendLabel();

            blk._msExit = () => {
              _exitMultiSelect(blk, mBtn, sBtn);
              blk.querySelector(".multi-pill-sep").style.display = "none";
              showToast((t.multiSelectMode || "複選") + " OFF");
              document.removeEventListener("keydown", blk._msEscHandler);
            };

            blk._msEscHandler = (ev) => {
              if (ev.key === "Escape" && blk.dataset.multiSelectActive === "true" && !window.__customPromptOpen) {
                ev.stopPropagation();
                blk._msExit();
              }
            };
            document.addEventListener("keydown", blk._msEscHandler);
            const bannerId = `ms-banner-${blk.dataset.groupIndex}`;
            if (!document.getElementById(bannerId)) {
              const banner = document.createElement("div");
              banner.id = bannerId;
              const _bDark = panelTheme === "dark";
              banner.style.cssText = `
                margin-top:5px; padding:4px 12px;
                background:${_bDark ? "rgba(124,106,247,0.13)" : "rgba(79,70,229,0.07)"};
                color:${_bDark ? "#b8aaff" : "#4f46e5"};
                font-size:10px; font-weight:600;
                border-radius:6px; text-align:center;
                border:1px solid ${_bDark ? "rgba(124,106,247,0.28)" : "rgba(79,70,229,0.2)"};
                letter-spacing:0.2px; line-height:1.7;
              `;
              banner.textContent = t.multiSelectBanner || "☑ 複選模式 — 點擊站點選取 · 再按 ☑ 或送出 ↗ 退出";
              blk.appendChild(banner);
            }
            const overlayId = `ms-overlay-${blk.dataset.groupIndex}`;
            if (!document.getElementById(overlayId)) {
              const msOverlay = document.createElement("div");
              msOverlay.id = overlayId;
              msOverlay.style.cssText = `
                position:fixed; inset:0;
                background:rgba(0,0,0,0.5);
                z-index:2147483628;
                pointer-events:all;
              `;
              msOverlay.addEventListener("click", e => { e.stopPropagation(); e.preventDefault(); });

              const updateClip = () => {
                const r = blk.getBoundingClientRect();
                const m = 8;
                const x1 = r.left - m, y1 = r.top - m;
                const x2 = r.right + m, y2 = r.bottom + m;
                msOverlay.style.clipPath =
                  `polygon(0px 0px, 100vw 0px, 100vw 100vh, 0px 100vh,` +
                  ` 0px ${y1}px, ${x1}px ${y1}px, ${x1}px ${y2}px, ${x2}px ${y2}px,` +
                  ` ${x2}px ${y1}px, 0px ${y1}px)`;
              };
              updateClip();
              document.body.appendChild(msOverlay);
              const _loop = () => {
                if (!document.getElementById(overlayId)) return;
                updateClip();
                requestAnimationFrame(_loop);
              };
              requestAnimationFrame(_loop);
            }
          }
        };
      })(block, multiBtn, sendBtn);

      sendBtn.onclick = null;
      sendBtn.onclick = (function (blk, mBtn, sBtn) {
        return function () {
          const selected = Array.from(blk._multiSelected);
          if (selected.length === 0) {
            showToast(t.multiSelectNone || "尚未選取任何站點！");
            return;
          }
          if (window.__customPromptOpen) return;
          window.__customPromptOpen = true;

          const keyword = (() => {
            const sels = [
              'input[name="q"]','textarea[name="q"]',
              'input[name="wd"]','input#kw','input#sb_form_q',
              'input[name="p"]','input[name="query"]',
              'input[name="text"]','input[role="combobox"]',
            ];
            for (const s of sels) { const el = document.querySelector(s); if (el && el.value) return el.value.trim(); }
            return "";
          })();

          const theme  = panelTheme || "light";
          const ss     = styleSettings || {};
          const radius = ss.borderRadius || 8;
          const bgColor = ss.customBackgroundColor || (theme === "dark" ? "#333" : "#fff");
          const fgColor = ss.textColor || (theme === "dark" ? "#fff" : "#000");
          const btnBg  = ss.customButtonBg || (theme === "dark" ? "#444" : "#f5f5f5");
          const btnBd  = theme === "dark" ? "#555" : "#ccc";

          const dlgOverlay = document.createElement("div");
          Object.assign(dlgOverlay.style, {
            position:"fixed", inset:"0",
            background:"rgba(0,0,0,0.55)", zIndex:"2147483649",
          });

          const box = document.createElement("div");
          Object.assign(box.style, {
            position:"fixed", top:"50%", left:"50%",
            transform:"translate(-50%,-50%)",
            background:bgColor, color:fgColor,
            padding:"18px 20px", borderRadius:radius+"px",
            boxShadow:"0 8px 32px rgba(0,0,0,0.4)",
            minWidth:"300px", maxWidth:"440px",
            fontSize:(ss.fontSize||12)+"px", zIndex:"2147483650",
            boxSizing:"border-box",
          });

          const dlgTitle = document.createElement("div");
          dlgTitle.textContent = (t.multiSelectSendTitle || "開啟已選站台") + ` (${selected.length})`;
          dlgTitle.style.cssText = "font-weight:bold; margin-bottom:10px; font-size:13px;";
          box.appendChild(dlgTitle);

          const urlList = document.createElement("div");
          urlList.style.cssText = `
            background:${theme==="dark"?"#222":"#f0f0f0"};
            border-radius:4px; padding:6px 8px; margin-bottom:12px;
            max-height:90px; overflow-y:auto; font-size:11px; line-height:1.8;
            font-family:monospace;
          `;
          urlList.textContent = selected.map(u => `• ${u}`).join("\n");
          box.appendChild(urlList);

          const modeLabel = document.createElement("div");
          modeLabel.textContent = t.multiSelectModeLabel || "送出方式：";
          modeLabel.style.cssText = "font-size:11px; font-weight:bold; margin-bottom:5px; opacity:0.75;";
          box.appendChild(modeLabel);

          const _savedMode = GM_getValue("ms_sendMode", "site_same");
          const modes = [
            { id:"site_same", label: t.modeSiteSearch    || "site:A OR site:B 搜尋（當前分頁）" },
            { id:"site_new",  label: t.modeSiteSearchNew || "site:A OR site:B 搜尋（新分頁）" },
            { id:"open_only", label: t.modeOpenOnly      || "直接開啟各站點（不搜尋）" },
          ];
          const radioGroup = {};
          modes.forEach(m => {
            const row = document.createElement("label");
            row.style.cssText = "display:flex; align-items:center; gap:6px; margin-bottom:5px; cursor:pointer; font-size:11px;";
            const radio = document.createElement("input");
            radio.type = "radio"; radio.name = "ms_mode_radio"; radio.value = m.id;
            if (_savedMode === m.id) radio.checked = true;
            radioGroup[m.id] = radio;
            row.appendChild(radio);
            row.appendChild(Object.assign(document.createElement("span"), { textContent: m.label }));
            box.appendChild(row);
          });
          if (!Object.values(radioGroup).some(r => r.checked)) radioGroup["site_same"].checked = true;

          const hr = document.createElement("hr");
          hr.style.cssText = `border:none; border-top:1px solid ${btnBd}; margin:10px 0 8px;`;
          box.appendChild(hr);

          const kwRow = document.createElement("div");
          kwRow.style.cssText = "display:flex; align-items:center; gap:6px; margin-bottom:8px;";
          const kwLabel = document.createElement("label");
          kwLabel.textContent = t.multiSelectKeyword || "搜尋關鍵字（可選）";
          kwLabel.style.cssText = "font-size:11px; flex-shrink:0; white-space:nowrap;";
          const kwInput = document.createElement("input");
          kwInput.type = "text";
          kwInput.value = keyword;
          kwInput.placeholder = keyword || "（目前無關鍵字）";
          Object.assign(kwInput.style, {
            flex: "1", fontSize: "11px",
            padding: "3px 6px", borderRadius: radius + "px",
            border: `1px solid ${btnBd}`, background: bgColor, color: fgColor,
            boxSizing: "border-box",
          });
          kwRow.appendChild(kwLabel);
          kwRow.appendChild(kwInput);
          box.appendChild(kwRow);

          const timeRow = document.createElement("div");
          timeRow.style.cssText = "display:flex; align-items:center; gap:6px; margin-bottom:8px;";
          const timeRowLabel = document.createElement("label");
          timeRowLabel.textContent = t.timeLabel || "時間篩選";
          timeRowLabel.style.cssText = "font-size:11px; flex-shrink:0; white-space:nowrap;";
          const msTimeSelect = document.createElement("select");
          Object.assign(msTimeSelect.style, {
            flex: "1", fontSize: "11px",
            padding: "3px 4px", borderRadius: radius + "px",
            border: `1px solid ${btnBd}`, background: bgColor, color: fgColor,
            boxSizing: "border-box",
          });
          const _curTbs = (() => {
            try {
              const u = new URL(location.href);
              const tbs = u.searchParams.get("tbs") || "";
              const m = tbs.match(/qdr:([a-z0-9]+)/);
              return m ? m[1] : "";
            } catch(_) { return ""; }
          })();
          msTimeSelect.innerHTML = `<option value="">${t.unlimited || "無限制"}</option>`;
          (t.timeOptions || []).forEach(({ label, value }) => {
            const opt = document.createElement("option");
            opt.value = value; opt.textContent = label;
            if (value === _curTbs) opt.selected = true;
            msTimeSelect.appendChild(opt);
          });
          if (!getTimeFilterEngine()) {
            msTimeSelect.disabled = true;
            msTimeSelect.style.opacity = "0.45";
            msTimeSelect.style.cursor = "not-allowed";
            msTimeSelect.title = t.timeUnsupported || "⚠️ 此搜尋引擎不支援時間篩選";
          }
          timeRow.appendChild(timeRowLabel);
          timeRow.appendChild(msTimeSelect);
          box.appendChild(timeRow);

          const optClearRow = document.createElement("label");
          optClearRow.style.cssText = "display:flex; align-items:center; gap:6px; margin-bottom:6px; cursor:pointer; font-size:11px;";
          const optClearChk = document.createElement("input");
          optClearChk.type = "checkbox";
          optClearChk.checked = GM_getValue("ms_clearAfterSend", true);
          optClearRow.appendChild(optClearChk);
          optClearRow.appendChild(Object.assign(document.createElement("span"), {
            textContent: t.multiSelectClearAfter || "送出後退出複選模式"
          }));
          box.appendChild(optClearRow);

          const optRemSelRow = document.createElement("label");
          optRemSelRow.style.cssText = "display:flex; align-items:center; gap:6px; margin-bottom:10px; cursor:pointer; font-size:11px;";
          const optRemSelChk = document.createElement("input");
          optRemSelChk.type = "checkbox";
          const _grpSelKey = `ms_sel_${blk.dataset.groupIndex}`;
          optRemSelChk.checked = !!GM_getValue(_grpSelKey, null);
          optRemSelRow.appendChild(optRemSelChk);
          optRemSelRow.appendChild(Object.assign(document.createElement("span"), {
            textContent: t.multiSelectRememberSel || "記憶此群組的複選選取"
          }));
          box.appendChild(optRemSelRow);

          const btnRow = document.createElement("div");
          btnRow.style.cssText = "display:flex; gap:8px; justify-content:flex-end;";
          const confirmBtn = document.createElement("button");
          confirmBtn.textContent = t.confirm || "確認";
          Object.assign(confirmBtn.style, {
            padding:"5px 18px", borderRadius:radius+"px",
            cursor:"pointer", background:"#e08000",
            border:"none", color:"#fff", fontWeight:"bold",
          });
          const cancelBtn = document.createElement("button");
          cancelBtn.textContent = t.cancel || "取消";
          Object.assign(cancelBtn.style, {
            padding:"5px 14px", borderRadius:radius+"px",
            cursor:"pointer", background:btnBg,
            border:`1px solid ${btnBd}`, color:fgColor,
          });
          btnRow.appendChild(confirmBtn);
          btnRow.appendChild(cancelBtn);
          box.appendChild(btnRow);
          dlgOverlay.appendChild(box);
          document.body.appendChild(dlgOverlay);
          box.addEventListener("click", e => e.stopPropagation());

          const closeDlg = () => { dlgOverlay.remove(); window.__customPromptOpen = false; };

          confirmBtn.onclick = () => {
            const mode = Object.entries(radioGroup).find(([, r]) => r.checked)?.[0] || "site_same";
            const finalKeyword = kwInput.value.trim();
            const finalTime   = msTimeSelect.value;
            GM_setValue("ms_sendMode", mode);
            GM_setValue("ms_clearAfterSend", optClearChk.checked);
            if (optRemSelChk.checked) {
              GM_setValue(_grpSelKey, JSON.stringify(selected));
            } else {
              GM_setValue(_grpSelKey, null);
            }
            closeDlg();

            const _applyTime = (url) => {
              const _eng = getTimeFilterEngine();
              if (finalTime && _eng) {
                if (_eng === "bing") {
                  url.searchParams.set("freshness", getBingFreshness(finalTime));
                } else if (_eng === "yahoo") {
                  const _age = getYahooAge(finalTime);
                  if (_age) url.searchParams.set("age", _age);
                } else {
                  url.searchParams.set("tbs", `qdr:${finalTime}`);
                }
              } else {
                url.searchParams.delete("tbs");
                url.searchParams.delete("freshness");
                url.searchParams.delete("age");
              }
              return url;
            };

            if (mode === "open_only") {
              selected.forEach(url => GM_openInTab(`https://${url}`, { active: false }));
            } else {
              const siteStr = selected.map(u => `site:${u}`).join(" OR ");
              const _isBaidu = window.location.hostname.includes("baidu.com");
              const _blStr = (!_isBaidu && Array.isArray(domainBlacklist) && domainBlacklist.length > 0)
                ? domainBlacklist.map(d => d.trim()).filter(d => d).map(d => `-site:${d}`).join(" ")
                : "";
              const finalQuery = [
                finalKeyword ? `${siteStr} ${finalKeyword}` : siteStr,
                _blStr
              ].filter(Boolean).join(" ");
              if (mode === "site_same") {
                try {
                  const url = _applyTime(new URL(location.href));
                  const qParam = getEngineQueryParam ? getEngineQueryParam() : "q";
                  url.searchParams.set(qParam, finalQuery);
                  location.href = url.toString();
                } catch(_) {
                  const sels = ['input[name="q"]','textarea[name="q"]','input[name="wd"]','input#kw'];
                  for (const sel of sels) {
                    const el = document.querySelector(sel);
                    if (el) { el.value = finalQuery; el.form && el.form.submit(); break; }
                  }
                }
              } else {
                try {
                  const url = _applyTime(new URL(location.href));
                  const qParam = getEngineQueryParam ? getEngineQueryParam() : "q";
                  url.searchParams.set(qParam, finalQuery);
                  window.open(url.toString(), "_blank");
                } catch(_) {
                  window.open(`https://www.google.com/search?q=${encodeURIComponent(finalQuery)}`, "_blank");
                }
              }
            }
            if (optClearChk.checked) _exitMultiSelect(blk, mBtn, sBtn);
          };
          cancelBtn.onclick = closeDlg;
          setTimeout(() => confirmBtn.focus(), 0);
        };
      })(block, multiBtn, sendBtn);

      block._restoreHighlight = () => {
        if (block.dataset.multiSelectActive !== "true") return;
        block.querySelectorAll(".site-ms-chk").forEach(c => {
          c.style.display = "";
          c.checked = block._multiSelected.has(c.dataset.msUrl);
        });
      };
      let siteContainer = block.querySelector(".site-container");
      if (!siteContainer) {
        siteContainer = document.createElement("div");
        siteContainer.className = "site-container";
        siteContainer.style.display = "grid";
        {
          const _sbw = styleSettings.siteButtonWidth > 0 ? styleSettings.siteButtonWidth : 104;
          siteContainer.style.gridTemplateColumns = `repeat(auto-fill, minmax(${_sbw}px, 1fr))`;
        }
        siteContainer.style.gap = "5px";
        siteContainer.style.paddingTop = "6px";
        siteContainer.style.minWidth = "280px";
        siteContainer.style.minHeight = "18px";
        siteContainer.dataset.groupIndex = groupIndex;

        siteContainer.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const draggingSite = document.querySelector(
            ".dragging.draggable-site",
          );
          if (!draggingSite) return;
          const afterElement = getDragAfterElement(
            siteContainer,
            e.clientY,
            ".draggable-site",
          );
          if (!afterElement) siteContainer.appendChild(draggingSite);
          else siteContainer.insertBefore(draggingSite, afterElement);
        });

        siteContainer.addEventListener("drop", (e) => {
          e.preventDefault();
          e.stopPropagation();

          const draggingSite = document.querySelector(
            ".dragging.draggable-site",
          );
          if (!draggingSite) return;

          const sourceGroupIndex = parseInt(draggingSite.dataset.groupIndex);
          const targetGroupIndex = parseInt(siteContainer.dataset.groupIndex);
          const sourceSiteIndex = parseInt(draggingSite.dataset.siteIndex);

          const afterElement = getDragAfterElement(
            siteContainer,
            e.clientY,
            ".draggable-site",
          );
          let targetSiteIndex = afterElement
            ? parseInt(afterElement.dataset.siteIndex)
            : groups[targetGroupIndex].sites.length;

          const movedSite = groups[sourceGroupIndex].sites.splice(
            sourceSiteIndex,
            1,
          )[0];

          if (
            sourceGroupIndex === targetGroupIndex &&
            sourceSiteIndex < targetSiteIndex
          ) {
            targetSiteIndex--;
          }

          groups[targetGroupIndex].sites.splice(targetSiteIndex, 0, movedSite);
          draggingSite.dataset.groupIndex = targetGroupIndex;

          draggingSite.classList.remove("dragging");
          draggingSite.style.opacity = styleSettings.buttonOpacity.toString();
          draggingSite.style.transform = "";
          draggingSite.style.boxShadow = "";
          void draggingSite.offsetHeight;
          draggingSite.blur();
          document.activeElement?.blur();

          save();
          requestAnimationFrame(() => renderSites(panel));
        });

        block.appendChild(siteContainer);
      } else {
        siteContainer.dataset.groupIndex = groupIndex;
      }

      siteContainer.innerHTML = "";

      if (!siteContainer.__delegationBound) {
        siteContainer.__delegationBound = true;

        siteContainer.addEventListener("mouseover", (e) => {
          const b = e.target.closest(".draggable-site");
          if (!b) return;
          if (b.contains(e.relatedTarget)) return;
          const bg = b.dataset.baseBg || "";
          if (bg) b.style.background = adjustColor(bg, 10);
        });

        siteContainer.addEventListener("mouseout", (e) => {
          const b = e.target.closest(".draggable-site");
          if (!b) return;
          if (b.contains(e.relatedTarget)) return;
          const bg = b.dataset.baseBg || "";
          if (bg) b.style.background = bg;
          b.style.transform  = "translateY(0)";
          b.style.boxShadow  = "0 1px 2px rgba(0,0,0,0.15)";
        });

        siteContainer.addEventListener("mousedown", (e) => {
          const b = e.target.closest(".draggable-site");
          if (!b) return;
          b.style.transform = "translateY(1px)";
          b.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.3)";
        });

        siteContainer.addEventListener("mouseup", (e) => {
          const b = e.target.closest(".draggable-site");
          if (!b) return;
          b.style.transform = "translateY(0)";
          b.style.boxShadow = "0 1px 2px rgba(0,0,0,0.15)";
        });
      }

      group.sites.forEach((site, siteIndex) => {
        const btn = document.createElement("div");
        btn.className = "draggable-site";
        btn.setAttribute("role", "button");
        btn.tabIndex = 0;
        btn.dataset.siteIndex = siteIndex;
        btn.dataset.groupIndex = groupIndex;
        btn.draggable = true;

        const baseBg = panelTheme === "custom"
          ? (styleSettings.customButtonBg || "#f5f5f5")
          : (panelTheme === "dark" ? "#4a4a4a" : "#f5f5f5");
        const textColor =
          styleSettings.textColor || (panelTheme === "dark" ? "#fff" : "#000");
        const borderColor = styleSettings.contrast > 0 ? "#888" : "#ccc";

        btn.dataset.baseBg = baseBg;

        Object.assign(btn.style, {
          display: "flex",
          alignItems: "center",
          margin: "0",
          padding: "5px 8px",
          gap: "5px",
          width:    (styleSettings.siteButtonWidth > 0 ? styleSettings.siteButtonWidth + "px" : ""),
          maxWidth: (styleSettings.siteButtonWidth > 0 ? styleSettings.siteButtonWidth + "px" : "none"),
          borderRadius: Math.max(styleSettings.borderRadius, 8) + "px",
          border: `0.5px solid ${borderColor}`,
          background: baseBg,
          color: textColor,
          cursor: "pointer",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          opacity: styleSettings.buttonOpacity.toString(),
          boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
          transition: "background 0.12s ease, box-shadow 0.12s ease",
          userSelect: "none",
          fontSize: styleSettings.fontSize + "px",
        });

        let pressStartTime = 0;

        btn.addEventListener("mousedown", () => { pressStartTime = Date.now(); });

        btn.onclick = (e) => {
          const pressDuration = Date.now() - pressStartTime;
          if (pressDuration > 200) {
            e.stopPropagation();
            return;
          }
          e.stopPropagation();

          const parentBlock = btn.closest(".group-block");
          if (parentBlock && parentBlock.dataset.multiSelectActive === "true") {
            const url = site.url;
            const chk = btn.querySelector(".site-ms-chk");
            if (parentBlock._multiSelected.has(url)) {
              parentBlock._multiSelected.delete(url);
              if (chk) chk.checked = false;
            } else {
              parentBlock._multiSelected.add(url);
              if (chk) chk.checked = true;
            }
            if (typeof parentBlock._updateSendLabel === "function") parentBlock._updateSendLabel();
            return;
          }

          applySiteFilter(site.url);
        };

        btn.dataset.siteUrl = site.url;
        btn.dataset.siteNote = site.note || "";

        btn.addEventListener("dragstart", (e) => {
          e.stopPropagation();
          btn.classList.add("dragging");
          btn.style.opacity = "0.5";
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", "site");
          e.dataTransfer.setData("groupIndex", groupIndex);
          e.dataTransfer.setData("siteIndex", siteIndex);
          try { if (e.dataTransfer.items) {  } } catch(_) {}
        });

        btn.addEventListener("dragend", (e) => {
          e.stopPropagation();
          btn.classList.remove("dragging");
          btn.style.opacity = styleSettings.buttonOpacity.toString();
          btn.blur();
          document.activeElement?.blur();
        });

        const favicon = document.createElement("img");
        favicon.src = getFaviconURL(site.url);
        favicon.style.width = "16px";
        favicon.style.height = "16px";
        favicon.style.marginRight = "4px";
        favicon.onerror = () =>
          (favicon.src = "https://www.google.com/favicon.ico");

        const label = document.createElement("span");
        label.className = "site-label";
        label.textContent = showAddresses
          ? site.url.length > 10
            ? site.url.slice(0, 10) + "..."
            : site.url
          : site.note || "";
        label.title = site.url;
        label.style.flex = "1";
        label.style.overflow = "hidden";
        label.style.textOverflow = "ellipsis";
        label.style.whiteSpace = "nowrap";
        label.style.minWidth = "0";

        const del = document.createElement("span");
        del.className = "site-del";
        del.style.cssText = `
          cursor:pointer; margin-left:auto; flex-shrink:0;
          padding-left:4px; opacity:0.4; font-size:13px;
          line-height:1; transition:opacity 0.15s; user-select:none;
          display:inline-flex; align-items:center;
        `;
        del.title = t.siteEditHint || "點擊開啟選單";
        _applyGrpIcon(del, "⋯");
        del.addEventListener("mouseenter", () => { del.style.opacity = "0.9"; });
        del.addEventListener("mouseleave", () => { del.style.opacity = "0.4"; });

        const _showSiteMenu = (e) => {
          e.stopPropagation();
          e.preventDefault();

          const _blk = btn.closest(".group-block");
          if (_blk && _blk.dataset.multiSelectActive === "true") return;
          if (isPromptActive) return;

          const old = document.getElementById("site-popup-menu");
          if (old) old.remove();

          const theme2 = panelTheme || "light";
          const ss2    = styleSettings || {};
          const bg2    = ss2.customBackgroundColor || (theme2 === "dark" ? "#2a2a2a" : "#fff");
          const fg2    = ss2.textColor || (theme2 === "dark" ? "#fff" : "#222");
          const bd2    = theme2 === "dark" ? "#444" : "#ddd";

          const menu = document.createElement("div");
          menu.id = "site-popup-menu";
          menu.style.cssText = `
            position:fixed; z-index:2147483660;
            background:${bg2}; color:${fg2};
            border:1px solid ${bd2};
            border-radius:${(ss2.borderRadius||6)+2}px;
            box-shadow:0 4px 18px rgba(0,0,0,0.22);
            overflow:hidden; min-width:160px;
            font-size:${(ss2.fontSize||12)}px;
          `;

          const menuItems = [
            { label: t.siteMenuEdit      || "✏️ 編輯",           action: "edit"      },
            { label: t.siteMenuDelete    || "🗑️ 刪除",           action: "delete"    },
            { label: t.siteMenuOpenSame  || "🔗 開啟（當前分頁）", action: "open_same" },
            { label: t.siteMenuOpenNew   || "↗ 開啟（新分頁）",   action: "open_new"  },
          ];

          menuItems.forEach((item, idx) => {
            const mi = document.createElement("div");
            mi.textContent = item.label;
            mi.style.cssText = `
              padding:7px 14px; cursor:pointer;
              border-top:${idx === 0 ? "none" : `1px solid ${bd2}`};
              transition:background 0.1s;
            `;
            mi.addEventListener("mouseenter", () => {
              mi.style.background = theme2 === "dark" ? "#3a3a3a" : "#f0f4ff";
            });
            mi.addEventListener("mouseleave", () => {
              mi.style.background = "";
            });
            mi.addEventListener("mousedown", (ev) => {
              ev.stopPropagation();
              ev.preventDefault();
              menu.remove();
              document.removeEventListener("mousedown", _closeMenu, true);

              if (item.action === "edit") {
                showCustomPrompt(t.enterSite, site.url, (newUrl) => {
                  if (newUrl && newUrl.trim()) {
                    const cleanUrl = parseSmartDomain(newUrl);
                    if (!cleanUrl) {
                      showToast(t.invalidSite || "請輸入有效網址！");
                      return;
                    }
                    showCustomPrompt(
                      t.enterSiteNote || "請輸入站台註解：",
                      site.note || "",
                      (newNote) => {
                        group.sites[siteIndex] = { url: cleanUrl, note: newNote?.trim() || "" };
                        save(); renderSites(panel); showToast(t.editSiteSuccess);
                      }, null, true
                    );
                  }
                }, null, false);

              } else if (item.action === "delete") {
                const deletedSite = { url: site.url, note: site.note || "" };
                group.sites.splice(siteIndex, 1);
                groups[groupIndex].sites = group.sites;
                save(); renderSites(panel);
                showUndoMessage(deletedSite, groupIndex, siteIndex);

              } else if (item.action === "open_same") {
                const cleanHost2 = parseSmartDomain(site.url) || site.url.replace(/^https?:\/\//i,"").split(/[/?#]/)[0];
                try {
                  const url = new URL(location.href);
                  const qParam = getEngineQueryParam ? getEngineQueryParam() : "q";
                  const kw = url.searchParams.get(qParam) || "";
                  const newQ = kw
                    ? kw.replace(/(?:^|\s)-?site:[^\s]+/gi, "").trim() + ` site:${cleanHost2}`
                    : `site:${cleanHost2}`;
                  url.searchParams.set(qParam, newQ.trim());
                  location.href = url.toString();
                } catch(_) { applySiteFilter(cleanHost2); }

              } else if (item.action === "open_new") {
                const cleanHost = parseSmartDomain(site.url) || site.url.replace(/^https?:\/\//i,"").split(/[/?#]/)[0];
                GM_openInTab(`https://${cleanHost}`, { active: true });
              }
            });
            menu.appendChild(mi);
          });

          document.body.appendChild(menu);
          const dr = del.getBoundingClientRect();
          const mw = menu.offsetWidth || 170;
          const mh = menu.offsetHeight || 120;
          let mx = dr.right - mw;
          let my = dr.bottom + 4;
          if (mx < 4) mx = 4;
          if (my + mh > window.innerHeight - 4) my = dr.top - mh - 4;
          menu.style.left = mx + "px";
          menu.style.top  = my + "px";

          const _closeMenu = (ev) => {
            if (!menu.contains(ev.target)) {
              menu.remove();
              document.removeEventListener("mousedown", _closeMenu, true);
            }
          };
          setTimeout(() => document.addEventListener("mousedown", _closeMenu, true), 0);
        };

        del.addEventListener("click", _showSiteMenu);
        del.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); };

        const msChk = document.createElement("input");
        msChk.type = "checkbox";
        msChk.className = "site-ms-chk";
        msChk.dataset.msUrl = site.url;
        msChk.style.cssText = `
          display:none; flex-shrink:0;
          margin-right:4px; margin-left:0;
          pointer-events:none;
          accent-color:${styleSettings.multiSelectColor || "#ffc400"};
          width:12px; height:12px;
        `;
        const _parentBlock = btn.closest ? btn.closest(".group-block") : null;
        if (_parentBlock && _parentBlock.dataset.multiSelectActive === "true") {
          msChk.style.display = "";
          msChk.checked = (_parentBlock._multiSelected || new Set()).has(site.url);
        }

        btn.appendChild(msChk);
        btn.appendChild(favicon);
        btn.appendChild(label);
        btn.appendChild(del);
        siteContainer.appendChild(btn);
      });

      if (typeof block._restoreHighlight === "function") block._restoreHighlight();

    });

    updateAddressesVisibility();
  }

  const langWidths = {
    en: 710,
    zh_TW: 610,
    zh_CN: 610,
    ja: 610,
    ko: 640,
    custom: 660,
  };

  function getEffectivePanelWidth() {
    return (styleSettings.panelWidth > 0)
      ? styleSettings.panelWidth
      : (langWidths[lang] || 410);
  }

  function rebuildPanel() {
    const wasVisible = (() => {
      const p = document.getElementById("site-group-panel");
      return p && p.style.display !== "none";
    })();
    createPanel();
    if (wasVisible) {
      const p = document.getElementById("site-group-panel");
      if (p) {
        p.style.display = "block";
        p.style.opacity  = "1";
        p.style.visibility = "visible";
      }
    }
    requestAnimationFrame(() => {
      const sf = document.getElementById("style-config-wrap");
      if (sf && sf.style.display !== "none") {
        const mainPanel = document.getElementById("site-group-panel");
        if (mainPanel && mainPanel.style.display !== "none") {
          const rect = mainPanel.getBoundingClientRect();
          sf.style.top = rect.top + "px";
          const expectedLeft = rect.left - sf.offsetWidth - 8;
          if (expectedLeft >= 8) {
            sf.style.left = expectedLeft + "px";
          } else {
            const expectedRight = rect.right + 8;
            sf.style.left = (expectedRight + sf.offsetWidth <= window.innerWidth - 8)
              ? expectedRight + "px"
              : "8px";
          }
          sf.style.right = "auto";
        }
      }
    });
  }

  function createPanel() {
    log("Creating panel with defaultPanelOpen:", defaultPanelOpen);
    searchConfig.isExpanded = false;

    const existingPanel = document.getElementById("site-group-panel");
    if (existingPanel) {
      const oldClickHandler = existingPanel.__clickOutsideHandler;
      if (oldClickHandler) {
        document.removeEventListener("click", oldClickHandler);
      }
      existingPanel.remove();
    }

    const panel = document.createElement("div");
    panel.id = "site-group-panel";
    panel.style.position = "fixed";
    panel.style.top  = (styleSettings.panelTop  ?? 80) + "px";
    if (styleSettings.panelLeft >= 0) {
      panel.style.left  = styleSettings.panelLeft + "px";
    } else {
      const _initRight = styleSettings.panelRight ?? 20;
      const _initW = getEffectivePanelWidth();
      panel.style.left = Math.max(8, window.innerWidth - _initRight - _initW) + "px";
    }
    panel.style.right = "auto";
    panel.style.background = styleSettings.backgroundImage
      ? "transparent"
      : styleSettings.backgroundColor ||
        (panelTheme === "dark" ? "#333" : "#fff");
    panel.style.border = `1px solid ${panelTheme === "dark" ? "#444" : "#e0e0e0"}`;
    panel.style.borderRadius = Math.max(styleSettings.borderRadius, 10) + "px";
    panel.style.boxShadow = panelTheme === "dark"
      ? "0 4px 20px rgba(0,0,0,0.45)"
      : "0 4px 20px rgba(0,0,0,0.12)";
    panel.style.zIndex = "2147483648";
    panel.style.width    = getEffectivePanelWidth() + "px";
    panel.style.maxWidth = getEffectivePanelWidth() + "px";
    panel.style.maxHeight = (styleSettings.panelMaxHeight ?? 87) + "vh";
    panel.style.overflowY = "auto";
    panel.style.overflowX = "hidden";
    panel.style.fontFamily = "sans-serif";
    panel.style.fontSize = styleSettings.fontSize + "px";
    panel.style.opacity = styleSettings.opacity;
    panel.style.display = "none";
    panel.style.transition = "opacity 0.2s ease, transform 0.2s ease";
    panel.style.boxSizing = "border-box";

    panel.addEventListener("dragover", (e) => {
      if (!e.defaultPrevented) {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "none";
      }
    });
    panel.addEventListener("drop", (e) => {
      if (!e.defaultPrevented) {
        e.preventDefault();
        e.stopPropagation();
      }
    });

    const closePanelOnClickOutside = (event) => {
      if (!panel || isPromptActive) return;
      if (searchConfig.isExpanded) {
        const _sfWrap = document.getElementById("style-config-wrap");
        const _sfBtn  = document.getElementById("sf-close-btn");
        if (_sfWrap && _sfWrap.contains(event.target)) return;
        if (panel.contains(event.target)) return;
        if (_sfBtn && !_sfBtn.__flashing) {
          _sfBtn.__flashing = true;
          const _origBg  = _sfBtn.style.background;
          const _origClr = _sfBtn.style.color;
          const _origBd  = _sfBtn.style.borderColor;
          let _count = 0;
          const _flash = setInterval(() => {
            _count++;
            const on = _count % 2 === 1;
            _sfBtn.style.background   = on ? "#e05252" : (_origBg || "");
            _sfBtn.style.color        = on ? "#fff"    : (_origClr || "");
            _sfBtn.style.borderColor  = on ? "#e05252" : (_origBd || "");
            if (_count >= 6) {
              clearInterval(_flash);
              _sfBtn.style.background  = _origBg;
              _sfBtn.style.color       = _origClr;
              _sfBtn.style.borderColor = _origBd;
              _sfBtn.__flashing = false;
            }
          }, 180);
        }
        return;
      }
      if (window._historyItemClicked) return;

      if (panel.dataset.multiSelectLock === "true") {
        if (window.__customPromptOpen) return;
        const clickedInPanel = panel.contains(event.target);
        const clickedInOverlay = !!event.target.closest("[id^='ms-overlay-']");
        if (!clickedInPanel && !clickedInOverlay) {
          const activeBlock = panel.querySelector(".group-block[data-multi-select-active='true']");
          if (activeBlock) {
            const mBtn = activeBlock.querySelector(".multi-btn");
            const sBtn = activeBlock.querySelector(".multi-send-btn");
            if (mBtn && sBtn) {
              if (typeof activeBlock._msExit === "function") activeBlock._msExit();
            }
          }
        }
        return;
      }

      if (
        panel.contains(event.target) ||
        event.target.closest(
          "#site-toggle-simple, #syntax-panel, #style-config-wrap, #site-history-dropdown, input, select, .prompt, #dp-dropdown",
        ) ||
        defaultPanelOpen === "pinned"
      ) {
        return;
      }

      panel.style.display = "none";
      manuallyClosed = true;
      GM_setValue("manuallyClosed", manuallyClosed);
      panel.dataset.manuallyClosed = "true";
      setTimeout(() => { delete panel.dataset.manuallyClosed; }, 1000);
      const dd = document.getElementById("site-history-dropdown");
      if (dd) dd.style.display = "none";
    };

    panel.__clickOutsideHandler = closePanelOnClickOutside;
    document.addEventListener("click", closePanelOnClickOutside);

    panel.addEventListener(
      "remove",
      () => {
        document.removeEventListener("click", closePanelOnClickOutside);
      },
      { once: true },
    );

    const headerContainer = document.createElement("div");
    headerContainer.className = "panel-header-container";
    headerContainer.style.cssText = `
      display:flex; align-items:center; gap:4px; flex-wrap:nowrap; box-sizing:border-box;
      padding:8px 10px 8px 12px;
      border-bottom:1px solid ${panelTheme === "dark" ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.1)"};
      cursor:grab; user-select:none; flex-shrink:0;
      border-radius:${Math.max(styleSettings.borderRadius, 10)}px ${Math.max(styleSettings.borderRadius, 10)}px 0 0;
    `;

    {
      let _hDragging = false, _hOx = 0, _hOy = 0;
      headerContainer.addEventListener("mousedown", (e) => {
        if (e.target.closest("button,input,select,a,[role=button]")) return;
        _hDragging = true;
        const rect = panel.getBoundingClientRect();
        _hOx = e.clientX - rect.left;
        _hOy = e.clientY - rect.top;
        headerContainer.style.cursor = "grabbing";
        e.preventDefault();
      });
      document.addEventListener("mousemove", (e) => {
        if (!_hDragging) return;
        const nx = Math.max(0, Math.min(e.clientX - _hOx, window.innerWidth  - panel.offsetWidth));
        const ny = Math.max(0, Math.min(e.clientY - _hOy, window.innerHeight - panel.offsetHeight));
        panel.style.left = nx + "px";
        panel.style.top  = ny + "px";
        panel.style.right = "auto";
      });
      document.addEventListener("mouseup", () => {
        if (!_hDragging) return;
        _hDragging = false;
        headerContainer.style.cursor = "grab";
        styleSettings.panelLeft = parseInt(panel.style.left) || 0;
        styleSettings.panelTop  = parseInt(panel.style.top)  || 0;
        GM_setValue("styleSettings", styleSettings);
      });
    }

    const headerLeft = document.createElement("div");
    headerLeft.style.cssText =
      "display:flex; align-items:center; gap:6px; flex-shrink:0;";

    const siteTitle = document.createElement("div");
    siteTitle.textContent = t.siteTitle || "站台快捷";
    siteTitle.style.cssText = "font-weight:600; font-size:13px; letter-spacing:0.01em;";
    headerLeft.appendChild(siteTitle);

    const panelHelpBtn = document.createElement("span");
    panelHelpBtn.textContent = "❓";
    panelHelpBtn.style.cssText = "cursor:help; font-size:12px; opacity:0.55; flex-shrink:0;";
    const panelHelpTip = document.createElement("div");
    panelHelpTip.style.cssText = `
      display:none; position:fixed;
      background:${panelTheme === "dark" ? "#2a2a4a" : "#f8f8ff"};
      border:1px solid ${panelTheme === "dark" ? "#555" : "#ccc"};
      border-radius:8px; padding:10px 12px;
      font-size:${styleSettings.fontSize - 1}px;
      white-space:pre-wrap; line-height:1.65;
      color:${styleSettings.textColor || (panelTheme === "dark" ? "#fff" : "#000")};
      box-shadow:0 6px 24px rgba(0,0,0,0.28);
      z-index:2147483660; min-width:260px; max-width:320px;
      pointer-events:none;
    `;
    panelHelpTip.textContent = t.panelHelp || "";
    document.body.appendChild(panelHelpTip);
    panelHelpBtn.addEventListener("mouseenter", () => {
      panelHelpTip.style.display = "block";
      requestAnimationFrame(() => {
        const r = panel.getBoundingClientRect();
        const tipW = panelHelpTip.offsetWidth || 280;
        const tipH = panelHelpTip.offsetHeight || 200;
        const margin = 8;
        let tipLeft = r.right + margin;
        if (tipLeft + tipW > window.innerWidth - margin) tipLeft = r.left - tipW - margin;
        if (tipLeft < margin) tipLeft = margin;
        let tipTop = r.top;
        if (tipTop + tipH > window.innerHeight - margin) tipTop = window.innerHeight - tipH - margin;
        if (tipTop < margin) tipTop = margin;
        panelHelpTip.style.left = tipLeft + "px";
        panelHelpTip.style.top = tipTop + "px";
      });
    });
    panelHelpBtn.addEventListener("mouseleave", () => { panelHelpTip.style.display = "none"; });
    panel.addEventListener("remove", () => panelHelpTip.remove(), { once: true });
    headerLeft.appendChild(panelHelpBtn);

    const langBtn = document.createElement("button");
    langBtn.id = "lang-btn";
    langBtn.title = "Language / 語言";
    langBtn.textContent = "🌍";
    langBtn.style.cssText = `
      background: none;
      border: 1px solid transparent;
      border-radius: ${styleSettings.borderRadius}px;
      cursor: pointer;
      font-size: 15px;
      padding: 1px 3px;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.15s, border-color 0.15s;
      flex-shrink: 0;
    `;
    langBtn.addEventListener("mouseenter", () => {
      langBtn.style.opacity = "1";
      langBtn.style.borderColor = panelTheme === "dark" ? "#666" : "#ccc";
    });
    langBtn.addEventListener("mouseleave", () => {
      langBtn.style.opacity = "0.7";
      langBtn.style.borderColor = "transparent";
    });

    const LANG_LIST = [
      { code: "en",    label: "English" },
      { code: "zh_TW", label: "繁體中文" },
      { code: "zh_CN", label: "简体中文" },
      { code: "ja",    label: "日本語" },
      { code: "ko",    label: "한국어" },
    ];

    function _buildLangMenu() {
      const existing = document.getElementById("lang-float-menu");
      if (existing) { existing.remove(); return; }

      const menu = document.createElement("div");
      menu.id = "lang-float-menu";
      const bg = panelTheme === "dark" ? "#2d2d2d" : "#fff";
      const fg = panelTheme === "dark" ? "#eee"    : "#222";
      const bd = panelTheme === "dark" ? "#555"    : "#ddd";
      const hv = panelTheme === "dark" ? "#3a3a3a" : "#f0f4ff";
      menu.style.cssText = `
        position: fixed;
        background: ${bg};
        border: 1px solid ${bd};
        border-radius: ${styleSettings.borderRadius}px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.22);
        z-index: 2147483667;
        min-width: 160px;
        overflow: hidden;
        font-family: sans-serif;
        font-size: ${styleSettings.fontSize}px;
      `;

      const rect = langBtn.getBoundingClientRect();
      menu.style.left = rect.left + "px";
      menu.style.top  = (rect.bottom + 4) + "px";

      LANG_LIST.forEach(({ code, label }) => {
        const item = document.createElement("div");
        item.textContent = (lang === code ? "✓ " : "   ") + label;
        item.style.cssText = `
          padding: 7px 14px;
          cursor: pointer;
          color: ${fg};
          background: ${lang === code ? hv : "transparent"};
          transition: background 0.1s;
          white-space: nowrap;
        `;
        item.addEventListener("mouseenter", () => { item.style.background = hv; });
        item.addEventListener("mouseleave", () => { item.style.background = lang === code ? hv : "transparent"; });
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          menu.remove();
          if (code === lang) return;
          const sf = document.getElementById("style-config-wrap");
          if (sf) sf.style.display = "none";
          searchConfig.isExpanded = false;
          lang = code;
          GM_setValue("sitePanelLang", lang);
          t = LANGUAGES[lang] || LANGUAGES["en"];
          createPanel();
          showToast(t.langSwitched);
        });
        menu.appendChild(item);
      });

      const customItem = document.createElement("div");
      const customLabel = LANGUAGES.custom
        ? "✏️ " + (LANGUAGES.custom.name || "Custom")
        : "✏️ " + CUSTOM_LANG_TEMPLATE.customLang.menuLabel;
      const customItemText = document.createElement("span");
      customItemText.textContent = (lang === "custom" ? "✓ " : "   ") + customLabel;
      const customItemArrow = document.createElement("span");
      customItemArrow.textContent = " ›";
      customItemArrow.style.cssText = `
        margin-left: 6px;
        opacity: 0.5;
        font-size: 1.1em;
        line-height: 1;
      `;
      customItem.appendChild(customItemText);
      customItem.appendChild(customItemArrow);
      customItem.style.cssText = `
        padding: 7px 14px;
        cursor: pointer;
        color: ${fg};
        background: ${lang === "custom" ? hv : "transparent"};
        transition: background 0.1s;
        white-space: nowrap;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid ${bd};
        margin-top: 2px;
      `;
      customItem.addEventListener("mouseenter", () => { customItem.style.background = hv; });
      customItem.addEventListener("mouseleave", () => { customItem.style.background = lang === "custom" ? hv : "transparent"; });
      customItem.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        menu.remove();
        _showCustomLangPanel();
      });
      menu.appendChild(customItem);

      const _close = (e) => {
        if (!menu.contains(e.target) && e.target !== langBtn) {
          menu.remove();
          document.removeEventListener("mousedown", _close, true);
        }
      };
      setTimeout(() => document.addEventListener("mousedown", _close, true), 0);

      document.body.appendChild(menu);
    }

    langBtn.addEventListener("mousedown", (e) => { e.preventDefault(); });
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      _buildLangMenu();
    });

    headerLeft.appendChild(langBtn);
    headerContainer.appendChild(headerLeft);

    function _showCustomLangPanel() {
      const cl = CUSTOM_LANG_TEMPLATE.customLang;
      const existing = document.getElementById("custom-lang-panel");
      if (existing) { existing.remove(); return; }

      const overlay = document.createElement("div");
      overlay.id = "custom-lang-panel";
      overlay.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.5);
        z-index:2147483667; display:flex; align-items:center; justify-content:center;
      `;

      const box = document.createElement("div");
      const bg  = panelTheme === "dark" ? "#2d2d2d" : "#fdf8f0";
      const fg  = panelTheme === "dark" ? "#eee"    : "#2a1f0e";
      const bd  = panelTheme === "dark" ? "#555"    : "#d6c9a8";
      box.style.cssText = `
        background:${bg}; color:${fg}; border:1px solid ${bd};
        border-radius:${styleSettings.borderRadius}px;
        padding:20px 22px; min-width:300px; max-width:460px; width:90vw;
        box-shadow:0 8px 32px rgba(0,0,0,0.3); font-family:sans-serif;
        font-size:${styleSettings.fontSize}px;
      `;

      const title = document.createElement("div");
      title.textContent = cl.panelTitle;
      title.style.cssText = `font-weight:bold; font-size:${styleSettings.fontSize + 2}px; margin-bottom:12px;`;
      box.appendChild(title);

      const curName = document.createElement("div");
      curName.style.cssText = `font-size:${styleSettings.fontSize - 1}px; color:${panelTheme === "dark" ? "#aaa" : "#888"}; margin-bottom:10px;`;
      curName.textContent = LANGUAGES.custom
        ? cl.currentName + (LANGUAGES.custom.name || "—")
        : cl.noCustomLang;
      box.appendChild(curName);

      const hint = document.createElement("pre");
      hint.textContent = cl.exportHint;
      hint.style.cssText = `
        background:${panelTheme === "dark" ? "#1e1e1e" : "#f5ede0"};
        border:1px solid ${bd}; border-radius:6px;
        padding:10px; font-size:${styleSettings.fontSize - 1}px;
        white-space:pre-wrap; word-break:break-word;
        line-height:1.6; margin-bottom:14px; color:${fg};
      `;
      box.appendChild(hint);

      const btnRow = document.createElement("div");
      btnRow.style.cssText = "display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap;";

      const btnStyle = (accent) => `
        padding:6px 14px; border:1px solid ${accent}; border-radius:${styleSettings.borderRadius}px;
        background:${accent}; color:#fff; cursor:pointer;
        font-size:${styleSettings.fontSize}px; white-space:nowrap;
      `;
      const btnStyleSecondary = `
        padding:6px 14px; border:1px solid ${bd}; border-radius:${styleSettings.borderRadius}px;
        background:transparent; color:${fg}; cursor:pointer;
        font-size:${styleSettings.fontSize}px; white-space:nowrap;
      `;

      const exportBtn = document.createElement("button");
      exportBtn.textContent = cl.exportBtn;
      exportBtn.style.cssText = btnStyle("#4a90d9");
      exportBtn.onclick = () => {
        const tpl = CUSTOM_LANG_TEMPLATE;
        const fullJson = JSON.stringify(tpl, null, 2);

        const blob = new Blob([fullJson], { type: "application/json" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = "lang-full-template.json";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);

        showToast(cl.exportSuccess || "📦 Exported: lang-full-template.json");
      };
      btnRow.appendChild(exportBtn);

      const importBtn = document.createElement("button");
      importBtn.textContent = cl.importBtn;
      importBtn.style.cssText = btnStyle("#4a9a6a");
      importBtn.onclick = () => {
        const input = document.createElement("input");
        input.type   = "file";
        input.accept = ".json,application/json";
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            try {
              const raw = JSON.parse(ev.target.result);

              const isChunk = typeof raw._chunkInfo === "string";
              if (isChunk) {
                let draft = {};
                try { draft = JSON.parse(GM_getValue("customLangDraft", "{}")); } catch(_) {}
                const { _chunkInfo, _chunkEnd, _completionCheck: cc, ...payload } = raw;
                Object.assign(draft, payload);
                if (cc) draft._completionCheck = cc;
                GM_setValue("customLangDraft", JSON.stringify(draft));
                const hasCore  = typeof draft.siteTitle === "string";
                const hasSe    = typeof draft.se === "object";
                const hasArray = Array.isArray(draft.timeOptions) && draft.timeOptions.length === 22;
                const isComplete = hasCore && hasSe && hasArray && draft._completionCheck === "COMPLETE";
                if (isComplete) {
                  if (!draft.name || typeof draft.name !== "string") throw new Error("missing name");
                  GM_setValue("customLangDraft", null);
                  const hydrated = hydrateCustomLang(draft);
                  LANGUAGES.custom = hydrated;
                  GM_setValue("customLangData", JSON.stringify(draft));
                  lang = "custom";
                  GM_setValue("sitePanelLang", "custom");
                  t = LANGUAGES.custom;
                  overlay.remove();
                  createPanel();
                  showToast(cl.importSuccess + " ✅ (3/3 段已合併)");
                } else {
                  const parts = [hasCore ? "1" : "?", hasSe ? "2" : "?", hasArray ? "3" : "?"].join("/");
                  showToast(`📦 分段已暫存 (${parts})，請繼續匯入其餘分段`);
                }
                return;
              }

              if (!raw.name || typeof raw.name !== "string") throw new Error("missing name");

              if ("_completionCheck" in raw && raw._completionCheck !== "COMPLETE") {
                showToast("⚠️ 檔案可能被截斷（_completionCheck 異常），請重新由 AI 取得完整 JSON");
                return;
              }
              if (Array.isArray(raw.timeOptions) && raw.timeOptions.length !== 22) {
                showToast(`⚠️ timeOptions 應有 22 項，目前只有 ${raw.timeOptions.length} 項，AI 可能截斷了輸出`);
                return;
              }

              const hydrated = hydrateCustomLang(raw);
              LANGUAGES.custom = hydrated;
              GM_setValue("customLangData", JSON.stringify(raw));
              lang = "custom";
              GM_setValue("sitePanelLang", "custom");
              t = LANGUAGES.custom;
              overlay.remove();
              createPanel();
              showToast(cl.importSuccess);
            } catch (_) {
              showToast(cl.importFailed);
            }
          };
          reader.readAsText(file);
        };
        document.body.appendChild(input);
        input.click();
        setTimeout(() => input.remove(), 5000);
      };
      btnRow.appendChild(importBtn);

      if (LANGUAGES.custom) {
        const switchBtn = document.createElement("button");
        switchBtn.textContent = "✅ " + (LANGUAGES.custom.customLang?.menuLabel || "Use Custom");
        switchBtn.style.cssText = btnStyle("#e08a00");
        switchBtn.onclick = () => {
          lang = "custom";
          GM_setValue("sitePanelLang", "custom");
          t = LANGUAGES.custom;
          overlay.remove();
          createPanel();
          showToast(LANGUAGES.custom.langSwitched || "Language switched!");
        };
        btnRow.appendChild(switchBtn);
      }

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "✕ " + (t.close || "Close");
      closeBtn.style.cssText = btnStyleSecondary;
      closeBtn.onclick = () => overlay.remove();
      btnRow.appendChild(closeBtn);

      box.appendChild(btnRow);
      overlay.appendChild(box);
      overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
      document.body.appendChild(overlay);
    }

    const seBarWrap = document.createElement("div");
    seBarWrap.id = "se-bar-wrap";
    seBarWrap.style.cssText =
      "flex:1; display:flex; justify-content:center; align-items:center; min-width:0;";

    const seBar = document.createElement("div");
    seBar.style.cssText =
      "display:flex; align-items:center; gap:3px; flex-shrink:0;";

    let seExtraPanel = null;
    let seHelpTip = null;

    function closeExtraPanel(force) {
      if (seExtraPanel) {
        if (se_panelPinned && !force) return;
        seExtraPanel.remove();
        seExtraPanel = null;
      }
      if (seHelpTip) {
        seHelpTip.remove();
        seHelpTip = null;
      }
    }

    function renderPinnedEngines() {
      seBar.querySelectorAll(".se-icon-pinned").forEach((el) => el.remove());
      const plusBtnEl = seBar.querySelector(".se-plus-btn");
      se_engines.slice(0, SE_PINNED_COUNT).forEach((engine) => {
        const wrap = document.createElement("span");
        wrap.className = "se-icon-pinned";
        wrap.style.cssText = "display:inline-flex; align-items:center;";
        const btn = document.createElement("img");
        btn.src = se_faviconUrl(engine.url);
        btn.title = engine.name;
        btn.style.cssText = `
          width:25px; height:25px; cursor:pointer; border-radius:3px;
          border:1px solid transparent; object-fit:contain;
          transition:border-color 0.15s; display:block;
        `;
        btn.addEventListener(
          "mouseenter",
          () => (btn.style.borderColor = "#888"),
        );
        btn.addEventListener(
          "mouseleave",
          () => (btn.style.borderColor = "transparent"),
        );
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (!se_panelPinned) closeExtraPanel(true);
          se_navigate(engine);
        });
        btn.onerror = () => {
          btn.style.visibility = "hidden";
        };
        wrap.appendChild(btn);
        seBar.insertBefore(wrap, plusBtnEl || null);
      });
    }

    const plusBtn = document.createElement("button");
    plusBtn.className = "se-plus-btn";
    plusBtn.textContent = "⊕";
    plusBtn.title = (t.se || {}).panelTitle || "搜尋引擎管理";
    plusBtn.style.cssText = `
      width:22px; height:22px; font-size:11px; line-height:1;
      cursor:pointer; border:1px solid #aaa; border-radius:3px;
      background:transparent; padding:3px; display:inline-flex;
      align-items:center; justify-content:center; flex-shrink:0;
      transition:border-color .15s, background .15s;
    `;
    seBar.appendChild(plusBtn);
    seBarWrap.appendChild(seBar);
    headerContainer.appendChild(seBarWrap);

    const dpBtn = document.createElement("button");
    dpBtn.id = "se-dp-btn";
    dpBtn.style.cssText = `
      background:none; border:1px solid transparent; border-radius:5px;
      cursor:pointer; font-size:16px; line-height:1; padding:3px 4px;
      flex-shrink:0; transition:opacity 0.2s, border-color 0.2s, filter 0.2s;
      margin: 0 0 0 2px;
      display:inline-flex; align-items:center; justify-content:center;
    `;

    function dpUpdateStyle() {
      const dpT      = (t.se || {}).dpTitle || {};
      const _dpEmoji = (styleSettings.iconStyle || "emoji") === "emoji";
      if (defaultPanelOpen === "pinned") {
        if (_dpEmoji) dpBtn.textContent = "📌";
        dpBtn.title = dpT.pinned || "面板永遠顯示（已固定）\n點擊可切換";
        dpBtn.style.opacity = "1";
        dpBtn.style.filter = "none";
        dpBtn.style.borderColor = "#f80";
      } else if (defaultPanelOpen === true) {
        if (_dpEmoji) dpBtn.textContent = "📌";
        dpBtn.title = dpT.on || "預設開啟面板（ON）\n點擊可切換";
        dpBtn.style.opacity = "1";
        dpBtn.style.filter = "none";
        dpBtn.style.borderColor = "#4a9";
      } else {
        if (_dpEmoji) dpBtn.textContent = "📌";
        dpBtn.title = dpT.off || "預設關閉面板（OFF）\n點擊可切換";
        dpBtn.style.opacity = "0.3";
        dpBtn.style.filter = "grayscale(1)";
        dpBtn.style.borderColor = "transparent";
      }
    }
    dpUpdateStyle();

    let dpDropdown = null;
    function closeDpDropdown() {
      if (dpDropdown) {
        dpDropdown.remove();
        dpDropdown = null;
      }
    }

    dpBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (dpDropdown) {
        closeDpDropdown();
        return;
      }

      const isDark2 = panelTheme === "dark";
      dpDropdown = document.createElement("div");
      dpDropdown.id = "dp-dropdown";
      dpDropdown.style.cssText = `
        position:fixed; z-index:2147483660;
        background:${isDark2 ? "#1e1e2e" : "#fff"};
        border:1px solid ${isDark2 ? "#3a3a5c" : "#ccc"};
        border-radius:8px; box-shadow:0 6px 20px rgba(0,0,0,0.2);
        padding:4px; min-width:130px;
        font-size:${styleSettings.fontSize}px;
        color:${styleSettings.textColor || (isDark2 ? "#eee" : "#111")};
      `;
      const btnRect = dpBtn.getBoundingClientRect();
      dpDropdown.style.top = btnRect.bottom + 4 + "px";
      dpDropdown.style.right = window.innerWidth - btnRect.right + "px";

      [
        { value: false,    label: "⛔ OFF",   hintKey: "off"    },
        { value: true,     label: "✅ ON",    hintKey: "on"     },
        { value: "pinned", label: "📌 " + (t.pinned || "Pinned"), hintKey: "pinned" },
      ].forEach(({ value, label, hintKey }) => {
        const item = document.createElement("div");
        item.textContent = label;
        const hint = (t.dpItemHint || {})[hintKey] || "";
        if (hint) item.title = hint;
        const isActive = defaultPanelOpen === value;
        item.style.cssText = `
          padding:6px 10px; border-radius:5px; cursor:pointer;
          background:${isActive ? (isDark2 ? "#2a2a4a" : "#f0f0ff") : "transparent"};
          font-weight:${isActive ? "600" : "400"};
          transition:background 0.1s;
        `;
        item.addEventListener("mouseenter", () => {
          if (!isActive)
            item.style.background = isDark2 ? "#252535" : "#f5f5f5";
        });
        item.addEventListener("mouseleave", () => {
          if (!isActive) item.style.background = "transparent";
        });
        item.addEventListener("click", (ev) => {
          ev.stopPropagation();
          defaultPanelOpen = value;
          GM_setValue("defaultPanelOpen", defaultPanelOpen);
          const p = document.getElementById("site-group-panel");
          if (value === "pinned" && p) p.style.display = "block";
          dpUpdateStyle();
          closeDpDropdown();
          if (value === false) {
            const offMsg = ((t.se || {}).dpTitle || {}).offToast;
            showToast(offMsg || label, 3500);
          } else {
            showToast(label);
          }
        });
        dpDropdown.appendChild(item);
      });

      const sep = document.createElement("div");
      sep.style.cssText = `
        margin:4px 6px; border-top:1px solid ${isDark2 ? "#3a3a5c" : "#e0e0e0"};
      `;
      dpDropdown.appendChild(sep);

      const ssItem = document.createElement("div");
      ssItem.style.cssText = `
        padding:6px 10px; border-radius:5px; cursor:pointer;
        font-weight:${safeSearchEnabled ? "600" : "400"};
        background:${safeSearchEnabled ? (isDark2 ? "#2a1a1a" : "#fff0f0") : "transparent"};
        transition:background 0.1s;
      `;
      function _updateSsItem() {
        ssItem.textContent = safeSearchEnabled
          ? (t.safeSearchOn  || "🔒 SafeSearch OFF: ON")
          : (t.safeSearchOff || "🔓 SafeSearch OFF: OFF");
        ssItem.style.fontWeight = safeSearchEnabled ? "600" : "400";
        ssItem.style.background  = safeSearchEnabled
          ? (isDark2 ? "#2a1a1a" : "#fff0f0")
          : "transparent";
      }
      _updateSsItem();
      ssItem.title = (t.dpItemHint || {}).safeSearch || "Attempts to disable safe search filters via URL parameters.";
      ssItem.addEventListener("mouseenter", () => {
        if (!safeSearchEnabled) ssItem.style.background = isDark2 ? "#252535" : "#f5f5f5";
      });
      ssItem.addEventListener("mouseleave", () => {
        if (!safeSearchEnabled) ssItem.style.background = "transparent";
      });
      ssItem.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (!safeSearchEnabled) {
          closeDpDropdown();
          showSafeSearchNotice(() => {
            safeSearchEnabled = true;
            GM_setValue("safeSearchEnabled", safeSearchEnabled);
            showToast(t.safeSearchOn || "🔒 SafeSearch OFF: ON", 2000);
            applyUrlOverrides();
          });
          return;
        }
        safeSearchEnabled = false;
        GM_setValue("safeSearchEnabled", safeSearchEnabled);
        _updateSsItem();
        showToast(t.safeSearchOff || "🔓 SafeSearch OFF: OFF", 2000);
        closeDpDropdown();
      });
      dpDropdown.appendChild(ssItem);

      const srItem = document.createElement("div");
      srItem.style.cssText = `
        padding:6px 10px; border-radius:5px; cursor:pointer;
        font-weight:${searchRegionEnabled ? "600" : "400"};
        background:${searchRegionEnabled ? (isDark2 ? "#0d2137" : "#e8f4fd") : "transparent"};
        transition:background 0.1s;
      `;
      function _updateSrItem() {
        srItem.textContent = searchRegionEnabled
          ? (t.searchRegionOn  || "🌐 Search Region: All — ON")
          : (t.searchRegionOff || "🌐 Search Region: All — OFF");
        srItem.style.fontWeight = searchRegionEnabled ? "600" : "400";
        srItem.style.background = searchRegionEnabled
          ? (isDark2 ? "#0d2137" : "#e8f4fd")
          : "transparent";
      }
      _updateSrItem();
      srItem.title = (t.dpItemHint || {}).searchRegion || "Attempts to remove region/country URL parameters for global results.";
      srItem.addEventListener("mouseenter", () => {
        if (!searchRegionEnabled) srItem.style.background = isDark2 ? "#252535" : "#f5f5f5";
      });
      srItem.addEventListener("mouseleave", () => {
        if (!searchRegionEnabled) srItem.style.background = "transparent";
      });
      srItem.addEventListener("click", (ev) => {
        ev.stopPropagation();
        if (!searchRegionEnabled) {
          closeDpDropdown();
          showSearchRegionNotice(() => {
            searchRegionEnabled = true;
            GM_setValue("searchRegionEnabled", searchRegionEnabled);
            showToast(t.searchRegionOn || "🌐 Search Region: All — ON", 2000);
            applyUrlOverrides();
          });
          return;
        }
        searchRegionEnabled = false;
        GM_setValue("searchRegionEnabled", searchRegionEnabled);
        _updateSrItem();
        showToast(t.searchRegionOff || "🌐 Search Region: All — OFF", 2000);
        closeDpDropdown();
      });
      dpDropdown.appendChild(srItem);

      document.body.appendChild(dpDropdown);
      setTimeout(() => {
        function onOut(ev) {
          if (!dpDropdown) {
            document.removeEventListener("click", onOut);
            return;
          }
          if (!dpDropdown.contains(ev.target) && ev.target !== dpBtn) {
            closeDpDropdown();
            document.removeEventListener("click", onOut);
          }
        }
        document.addEventListener("click", onOut);
      }, 0);
    });
    headerContainer.appendChild(dpBtn);

    function buildExtraPanel() {
      if (seExtraPanel) {
        closeExtraPanel(true);
        return;
      }

      const st = t.se || {};
      const isDark = panelTheme === "dark";
      const fg = styleSettings.textColor || (isDark ? "#e8e8e8" : "#1a1a1a");
      const bg = isDark ? "#1e1e2e" : "#ffffff";
      const border = isDark ? "#3a3a5c" : "#d0d0d0";
      const accent = isDark ? "#7c6af7" : "#4f46e5";

      seExtraPanel = document.createElement("div");
      seExtraPanel.id = "se-extra-float-panel";
      seExtraPanel.style.cssText = `
        position:fixed; background:${bg}; border:1px solid ${border};
        border-radius:12px; padding:0; z-index:2147483651;
        box-shadow:0 8px 32px rgba(0,0,0,${isDark ? "0.55" : "0.18"}),
                   0 2px 8px rgba(0,0,0,0.12),
                   inset 0 1px 0 rgba(255,255,255,${isDark ? "0.06" : "0.8"});
        min-width:260px; max-width:300px;
        font-size:${styleSettings.fontSize}px; color:${fg};
        backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
        overflow:hidden; user-select:none;
      `;

      const epTitleBar = document.createElement("div");
      epTitleBar.style.cssText = `
        display:flex; align-items:center; justify-content:space-between;
        padding:10px 12px 8px; cursor:grab; border-radius:12px 12px 0 0;
        border-bottom:1px solid ${border};
        background:${
          isDark
            ? "linear-gradient(135deg,#2a2a4a 0%,#1e1e2e 100%)"
            : "linear-gradient(135deg,#f0f0ff 0%,#ffffff 100%)"
        };
      `;

      const epTitleLeft = document.createElement("div");
      epTitleLeft.style.cssText = "display:flex; align-items:center; gap:6px;";

      const epDot = document.createElement("span");
      epDot.style.cssText = `width:8px;height:8px;border-radius:50%;
        background:${accent};display:inline-block;box-shadow:0 0 6px ${accent}88;`;

      const epTitleText = document.createElement("span");
      epTitleText.textContent = st.panelTitle || "搜尋引擎管理";
      epTitleText.style.cssText = `font-weight:600;font-size:${styleSettings.fontSize + 1}px;color:${fg};letter-spacing:0.3px;`;

      const helpBtn = document.createElement("span");
      helpBtn.className = "se-help-btn";
      helpBtn.textContent = "❓";
      helpBtn.style.cssText = `cursor:help; font-size:12px; opacity:0.7; position:relative; flex-shrink:0; display:inline-flex; align-items:center;`;

      const helpTip = document.createElement("div");
      helpTip.style.cssText = `
        display:none; position:fixed;
        background:${isDark ? "#2a2a4a" : "#f8f8ff"};
        border:1px solid ${border}; border-radius:8px;
        padding:10px 12px; font-size:${styleSettings.fontSize - 1}px;
        white-space:pre-wrap; line-height:1.65; color:${fg};
        box-shadow:0 6px 24px rgba(0,0,0,0.28);
        z-index:2147483660; min-width:240px; max-width:300px;
        pointer-events:none;
      `;
      helpTip.textContent = st.helpTooltip || "";
      document.body.appendChild(helpTip);
      seHelpTip = helpTip;

      helpBtn.addEventListener("mouseenter", () => {
        helpTip.style.display = "block";
        requestAnimationFrame(() => {
          if (!seExtraPanel) return;
          const panelRect = seExtraPanel.getBoundingClientRect();
          const tipW = helpTip.offsetWidth || 260;
          const tipH = helpTip.offsetHeight || 140;
          const margin = 8;

          let tipLeft = panelRect.left - tipW - margin;
          let tipTop = panelRect.top;

          if (tipLeft < margin) {
            tipLeft = panelRect.right + margin;
          }
          if (tipLeft + tipW > window.innerWidth - margin) {
            tipLeft = margin;
          }
          if (tipTop + tipH > window.innerHeight - margin) {
            tipTop = window.innerHeight - tipH - margin;
          }
          if (tipTop < margin) tipTop = margin;

          helpTip.style.left = tipLeft + "px";
          helpTip.style.top = tipTop + "px";
        });
      });
      helpBtn.addEventListener("mouseleave", () => {
        helpTip.style.display = "none";
      });

      epTitleLeft.appendChild(epDot);
      epTitleLeft.appendChild(epTitleText);
      epTitleLeft.appendChild(helpBtn);

      epTitleBar.appendChild(epTitleLeft);

      const epTitleRight = document.createElement("div");
      epTitleRight.style.cssText =
        "display:flex; align-items:center; gap:3px; flex-shrink:0;";

      const epPinBtn = document.createElement("button");
      epPinBtn.style.cssText = `
        background:none; border:1px solid transparent; border-radius:4px;
        cursor:pointer; font-size:14px; line-height:1; padding:2px 4px;
        transition:opacity 0.2s, border-color 0.2s, filter 0.2s;
      `;
      function epUpdatePin() {
        epPinBtn.textContent = "📌";

        epPinBtn.title = se_panelPinned
          ? `EN │ Pinned (click to unpin)
TW │ 已釘選（點擊取消）
CN │ 已固定（点击取消）
JP │ ピン留め済み（クリックで解除）
KR │ 고정됨 (click to unpin)`
          : `EN │ Pin panel (won't disappear after navigation)
TW │ 釘選面板（跳轉後不消失）
CN │ 固定面板（跳转后不消失）
JP │ パネルをピン留め（移動後も消えない）
KR │ 패널 고정 (won't disappear after navigation)`;

        epPinBtn.style.opacity = se_panelPinned ? "1" : "0.3";
        epPinBtn.style.filter = se_panelPinned ? "none" : "grayscale(1)";
        epPinBtn.style.borderColor = se_panelPinned ? "#f80" : "transparent";
      }
      epUpdatePin();
      epPinBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        se_panelPinned = !se_panelPinned;
        se_save();
        epUpdatePin();
        showToast(se_panelPinned ? t.panelPinned : t.panelUnpinned);
      });
      epTitleRight.appendChild(epPinBtn);

      const epCloseBtn = document.createElement("button");
      epCloseBtn.textContent = "✕";
      epCloseBtn.title = t.close;
      epCloseBtn.style.cssText = `
        background:none; border:none; cursor:pointer; color:${isDark ? "#888" : "#aaa"};
        font-size:14px; line-height:1; padding:2px 4px; border-radius:4px;
        transition:color 0.15s,background 0.15s; flex-shrink:0;
      `;
      epCloseBtn.addEventListener("mouseenter", () => {
        epCloseBtn.style.color = "#e55";
        epCloseBtn.style.background = isDark ? "#3a1a1a" : "#ffe8e8";
      });
      epCloseBtn.addEventListener("mouseleave", () => {
        epCloseBtn.style.color = isDark ? "#888" : "#aaa";
        epCloseBtn.style.background = "none";
      });
      epCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeExtraPanel(true);
      });
      epTitleRight.appendChild(epCloseBtn);

      epTitleBar.appendChild(epTitleRight);
      seExtraPanel.appendChild(epTitleBar);

      let epDragging = false,
        epDragX = 0,
        epDragY = 0;
      epTitleBar.addEventListener("mousedown", (e) => {
        if (e.target === epCloseBtn || e.target === helpBtn) return;
        epDragging = true;
        const rect = seExtraPanel.getBoundingClientRect();
        epDragX = e.clientX - rect.left;
        epDragY = e.clientY - rect.top;
        epTitleBar.style.cursor = "grabbing";
        e.preventDefault();
      });
      document.addEventListener("mousemove", (e) => {
        if (!epDragging || !seExtraPanel) return;
        const nx = Math.max(
          0,
          Math.min(
            e.clientX - epDragX,
            window.innerWidth - seExtraPanel.offsetWidth,
          ),
        );
        const ny = Math.max(
          0,
          Math.min(
            e.clientY - epDragY,
            window.innerHeight - seExtraPanel.offsetHeight,
          ),
        );
        seExtraPanel.style.left = nx + "px";
        seExtraPanel.style.top = ny + "px";
        seExtraPanel.style.right = "auto";
      });
      document.addEventListener("mouseup", () => {
        if (!epDragging) return;
        epDragging = false;
        epTitleBar.style.cursor = "grab";
        if (seExtraPanel) {
          se_panelPos = {
            left: parseInt(seExtraPanel.style.left),
            top: parseInt(seExtraPanel.style.top),
          };
          se_save();
        }
      });

      const epBody = document.createElement("div");
      epBody.style.cssText =
        "padding:10px 12px; display:flex; flex-direction:column; gap:8px; max-height:70vh; overflow-y:auto;";
      seExtraPanel.appendChild(epBody);

      function mkDivider(label) {
        const d = document.createElement("div");
        d.style.cssText = `display:flex;align-items:center;gap:6px;
          color:${isDark ? "#666" : "#bbb"};font-size:${styleSettings.fontSize - 1}px;margin:2px 0;`;
        const l1 = document.createElement("div");
        l1.style.cssText = `flex:1;height:1px;background:${border};`;
        const tx = document.createElement("span");
        tx.textContent = label;
        tx.style.whiteSpace = "nowrap";
        const l2 = document.createElement("div");
        l2.style.cssText = `flex:1;height:1px;background:${border};`;
        d.appendChild(l1);
        d.appendChild(tx);
        d.appendChild(l2);
        return d;
      }

      epBody.appendChild(
        mkDivider(st.allEnginesLabel || "所有引擎（前4個顯示為圖示）"),
      );
      const epList = document.createElement("div");
      epList.style.cssText = "display:flex; flex-direction:column; gap:3px;";
      epBody.appendChild(epList);

      function renderEngineList() {
        epList.innerHTML = "";

        if (se_engines.length === 0) {
          const empty = document.createElement("div");
          empty.textContent = st.emptyList || "（尚無引擎）";
          empty.style.cssText = `color:${isDark ? "#555" : "#ccc"};font-size:${styleSettings.fontSize - 1}px;padding:4px 0;`;
          epList.appendChild(empty);
          return;
        }

        se_engines.forEach((engine, idx) => {
          const isPinned = idx < SE_PINNED_COUNT;
          const row = document.createElement("div");
          row.dataset.idx = idx;
          row.draggable = true;
          row.style.cssText = `
            display:flex; align-items:center; gap:5px;
            padding:5px 7px; border-radius:6px; cursor:grab;
            background:${
              isPinned
                ? isDark
                  ? "#2a2a4a"
                  : "#f0f0ff"
                : isDark
                  ? "#252535"
                  : "#fafafa"
            };
            border:1px solid ${
              isPinned
                ? isDark
                  ? accent + "55"
                  : accent + "44"
                : isDark
                  ? "#333355"
                  : "#ebebeb"
            };
            transition:background 0.12s, border-color 0.12s;
          `;

          const dragHint = document.createElement("span");
          dragHint.textContent = "⠿";
          dragHint.style.cssText = `color:${isDark ? "#444" : "#ccc"};font-size:10px;cursor:grab;flex-shrink:0;`;
          row.appendChild(dragHint);

          const favicon = document.createElement("img");
          favicon.src = se_faviconUrl(engine.url);
          favicon.style.cssText =
            "width:14px;height:14px;flex-shrink:0;object-fit:contain;border-radius:2px;";
          favicon.onerror = () => {
            favicon.style.visibility = "hidden";
          };
          row.appendChild(favicon);

          const nameSpan = document.createElement("span");
          nameSpan.textContent = engine.name;
          nameSpan.style.cssText = `flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:${styleSettings.fontSize}px;`;
          row.appendChild(nameSpan);

          if (isPinned) {
            const badge = document.createElement("span");
            badge.textContent = `TOP${idx + 1}`;
            badge.style.cssText = `
              font-size:9px; padding:1px 4px; border-radius:3px;
              background:${accent}22; color:${accent};
              border:1px solid ${accent}55; flex-shrink:0; font-weight:600;
            `;
            row.appendChild(badge);
          }

          const goBtn = document.createElement("button");
          goBtn.textContent = "→";
          goBtn.title = engine.name;
          goBtn.style.cssText = `
            background:${accent}18; border:1px solid ${accent}44; border-radius:4px;
            cursor:pointer; padding:2px 6px; font-size:11px; flex-shrink:0;
            color:${accent}; transition:background 0.15s;
          `;
          goBtn.addEventListener(
            "mouseenter",
            () => (goBtn.style.background = accent + "33"),
          );
          goBtn.addEventListener(
            "mouseleave",
            () => (goBtn.style.background = accent + "18"),
          );
          goBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            se_navigate(engine);
            closeExtraPanel();
          });
          row.appendChild(goBtn);

          const newWinBtn = document.createElement("button");
          newWinBtn.textContent = st.newWindowBtn || "⧉";
          newWinBtn.title =
            (st.newWindowTitle || "新視窗") + " — " + engine.name;
          newWinBtn.style.cssText = `
            background:${isDark ? "#2a3a2a" : "#f0fff0"};
            border:1px solid ${isDark ? "#3a6a3a" : "#b0d8b0"};
            border-radius:4px; cursor:pointer; padding:2px 5px;
            font-size:11px; flex-shrink:0;
            color:${isDark ? "#6f9" : "#2a7a2a"};
            transition:background 0.15s;
          `;
          newWinBtn.addEventListener(
            "mouseenter",
            () => (newWinBtn.style.background = isDark ? "#2e4a2e" : "#d8f5d8"),
          );
          newWinBtn.addEventListener(
            "mouseleave",
            () => (newWinBtn.style.background = isDark ? "#2a3a2a" : "#f0fff0"),
          );
          newWinBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const kw = se_extractKeyword();
            const st2 = t.se || {};
            if (!kw) {
              showToast(st2.noKeyword || "無法取得關鍵字");
              return;
            }
            const w = Math.min(1280, screen.availWidth || 1280);
            const h = Math.min(900, screen.availHeight || 900);
            window.open(
              engine.url + encodeURIComponent(kw),
              "_blank",
              `width=${w},height=${h},left=60,top=60,noopener,noreferrer`,
            );
            closeExtraPanel();
          });
          row.appendChild(newWinBtn);

          const delBtn = document.createElement("button");
          delBtn.textContent = "✕";
          delBtn.title = engine.name;
          delBtn.style.cssText = `
            background:none; border:none; cursor:pointer;
            color:${isDark ? "#666" : "#ccc"}; font-size:12px;
            flex-shrink:0; padding:0 1px; transition:color 0.15s;
          `;
          delBtn.addEventListener(
            "mouseenter",
            () => (delBtn.style.color = "#e55"),
          );
          delBtn.addEventListener(
            "mouseleave",
            () => (delBtn.style.color = isDark ? "#666" : "#ccc"),
          );
          delBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            se_engines.splice(idx, 1);
            se_save();
            renderEngineList();
            renderPinnedEngines();
          });
          row.appendChild(delBtn);

          row.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("se-idx", String(idx));
            e.dataTransfer.effectAllowed = "move";
            row.style.opacity = "0.4";
          });
          row.addEventListener("dragend", () => {
            row.style.opacity = "1";
          });
          row.addEventListener("dragover", (e) => {
            e.preventDefault();
            row.style.background = isDark ? "#2e3060" : "#eff2ff";
            row.style.borderColor = accent;
          });
          row.addEventListener("dragleave", () => {
            row.style.background = isPinned
              ? isDark
                ? "#2a2a4a"
                : "#f0f0ff"
              : isDark
                ? "#252535"
                : "#fafafa";
            row.style.borderColor = isPinned
              ? isDark
                ? accent + "55"
                : accent + "44"
              : isDark
                ? "#333355"
                : "#ebebeb";
          });
          row.addEventListener("drop", (e) => {
            e.preventDefault();
            const fromIdx = parseInt(e.dataTransfer.getData("se-idx"));
            const toIdx = idx;
            if (fromIdx === toIdx) return;
            const moved = se_engines.splice(fromIdx, 1)[0];
            se_engines.splice(toIdx, 0, moved);
            se_save();
            renderEngineList();
            renderPinnedEngines();
          });

          epList.appendChild(row);
        });
      }

      seExtraPanel.__renderEngineList = renderEngineList;

      if (!GM_getValue("hideSeAdviceBanner", false)) {
        const adviceBanner = document.createElement("div");
        adviceBanner.style.cssText = `
          background:${isDark ? "#1a2a1a" : "#f0fff4"};
          color:${isDark ? "#8fce8f" : "#2d6a2d"};
          border:1px dashed ${isDark ? "#3a6a3a" : "#90e090"};
          border-radius:8px; padding:8px 10px;
          font-size:${styleSettings.fontSize - 1}px;
          line-height:1.55; display:flex; align-items:flex-start; gap:6px;
        `;
        const adviceText = document.createElement("span");
        adviceText.style.flex = "1";
        adviceText.textContent = st.adviceBannerText || "💡 This script works best as a shortcut helper for major search engines.";
        const adviceClose = document.createElement("button");
        adviceClose.textContent = "❌";
        adviceClose.title = st.adviceBannerTitle || "Usage tip";
        adviceClose.style.cssText = `
          background:none;border:none;cursor:pointer;
          font-size:12px;padding:0 2px;flex-shrink:0;
          opacity:0.55;transition:opacity 0.15s;line-height:1;
        `;
        adviceClose.addEventListener("mouseenter", () => { adviceClose.style.opacity = "1"; });
        adviceClose.addEventListener("mouseleave", () => { adviceClose.style.opacity = "0.55"; });
        adviceClose.addEventListener("click", (e) => {
          e.stopPropagation();
          GM_setValue("hideSeAdviceBanner", true);
          adviceBanner.remove();
        });
        adviceBanner.appendChild(adviceText);
        adviceBanner.appendChild(adviceClose);
        epBody.appendChild(adviceBanner);
      }

      epBody.appendChild(mkDivider(st.detectBtn || "🔍 Auto-Detect"));

      const detectBtn = document.createElement("button");
      detectBtn.textContent = st.detectBtn || "🔍 Auto-Detect Current Site";
      detectBtn.style.cssText = `
        width:100%; padding:8px 10px; border-radius:8px; cursor:pointer;
        border:2px solid ${accent}88; background:${accent}18; color:${accent};
        font-size:${styleSettings.fontSize + 1}px; font-weight:600;
        transition:background 0.15s, border-color 0.15s;
        letter-spacing:0.2px;
      `;
      detectBtn.addEventListener("mouseenter", () => {
        detectBtn.style.background = accent + "30";
        detectBtn.style.borderColor = accent + "cc";
      });
      detectBtn.addEventListener("mouseleave", () => {
        detectBtn.style.background = accent + "18";
        detectBtn.style.borderColor = accent + "88";
      });

      detectBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        function runDetect() {
          let detectedName = "";
          let detectedUrl  = "";

          try {
            const u = new URL(location.href);
            const host = u.hostname.replace(/^www\./, "");

            const knownParams = [
              { param: "q",     suffix: "?q=" },
              { param: "wd",    suffix: "?wd=" },
              { param: "text",  suffix: "?text=" },
              { param: "query", suffix: "?query=" },
              { param: "p",     suffix: "?p=" },
              { param: "s",     suffix: "?s=" },
              { param: "k",     suffix: "?k=" },
            ];

            for (const { param, suffix } of knownParams) {
              if (u.searchParams.has(param)) {
                const base = u.origin + u.pathname;
                detectedUrl  = base + suffix;
                detectedName = host.split(".")[0];
                detectedName = detectedName.charAt(0).toUpperCase() + detectedName.slice(1);
                break;
              }
            }
          } catch (_) {}

          if (!detectedUrl) {
            showToast(st.detectFail || "❌ Cannot detect search URL.");
            return;
          }

          const confirmMsg = typeof st.detectConfirm === "function"
            ? st.detectConfirm(detectedName, detectedUrl)
            : `${detectedName}\n${detectedUrl}`;

          showCustomPrompt(
            `【${st.detectConfirmTitle || "Add Search Engine?"}】\n\n${confirmMsg}`,
            detectedName,
            (finalName) => {
              if (!finalName || !finalName.trim()) return;
              if (se_engines.some(eng => eng.url === detectedUrl)) {
                showToast("⚠️ " + detectedUrl + " already exists.");
                return;
              }
              se_engines.push({ name: finalName.trim(), url: detectedUrl });
              se_save();
              renderEngineList();
              renderPinnedEngines();
              const msg = typeof st.detectSuccess === "function"
                ? st.detectSuccess(finalName.trim())
                : `✅ ${finalName.trim()}`;
              showToast(msg);
            },
            null,
            false,
          );
        }

        if (!GM_getValue("seDetectFirstSeen", false)) {
          const tipOverlay = document.createElement("div");
          tipOverlay.style.cssText = `
            position:fixed; top:0; left:0; right:0; bottom:0;
            background:rgba(0,0,0,0.45); z-index:2147483670;
            display:flex; align-items:center; justify-content:center;
          `;
          const tipBox = document.createElement("div");
          tipBox.style.cssText = `
            background:${bg}; color:${fg};
            border:1px solid ${border}; border-radius:12px;
            padding:20px 22px; min-width:270px; max-width:340px;
            box-shadow:0 8px 32px rgba(0,0,0,0.28);
            font-size:${styleSettings.fontSize}px; line-height:1.65;
            font-family:sans-serif;
          `;
          const tipTitle = document.createElement("div");
          tipTitle.style.cssText = `font-weight:700;font-size:${styleSettings.fontSize + 2}px;margin-bottom:10px;color:${accent};`;
          tipTitle.textContent = st.detectFirstTipTitle || "Cross-origin notice";

          const tipBody = document.createElement("div");
          tipBody.style.cssText = `margin-bottom:16px;white-space:pre-wrap;`;
          tipBody.textContent = st.detectFirstTip || "To add a cross-origin search engine, add its URL to @include in your userscript manager.";

          const tipOkBtn = document.createElement("button");
          tipOkBtn.textContent = st.detectOk || "Got it";
          tipOkBtn.style.cssText = `
            display:block; width:100%; padding:7px 0; border-radius:8px;
            cursor:pointer; border:none;
            background:${accent}; color:#fff;
            font-size:${styleSettings.fontSize}px; font-weight:600;
          `;
          tipOkBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            GM_setValue("seDetectFirstSeen", true);
            tipOverlay.remove();
            runDetect();
          });
          tipBox.appendChild(tipTitle);
          tipBox.appendChild(tipBody);
          tipBox.appendChild(tipOkBtn);
          tipOverlay.appendChild(tipBox);
          document.body.appendChild(tipOverlay);
          shieldFromFileDrop(tipOverlay);
          tipOverlay.addEventListener("click", (ev) => {
            if (ev.target === tipOverlay) tipOverlay.remove();
          });
        } else {
          runDetect();
        }
      });
      epBody.appendChild(detectBtn);

      const manualToggleWrap = document.createElement("div");
      manualToggleWrap.style.cssText = "margin-top:2px;";

      const manualToggleBtn = document.createElement("button");
      manualToggleBtn.textContent = (st.addSectionLabel || "Add Engine") + " ▾";
      manualToggleBtn.style.cssText = `
        background:none; border:none; cursor:pointer; padding:3px 0;
        color:${isDark ? "#555" : "#bbb"}; font-size:${styleSettings.fontSize - 1}px;
        width:100%; text-align:left; transition:color 0.15s;
      `;
      manualToggleBtn.addEventListener("mouseenter", () => {
        manualToggleBtn.style.color = isDark ? "#888" : "#999";
      });
      manualToggleBtn.addEventListener("mouseleave", () => {
        manualToggleBtn.style.color = isDark ? "#555" : "#bbb";
      });

      let manualOpen = false;
      const addForm = document.createElement("div");
      addForm.style.cssText = `
        display:none; flex-direction:column; gap:5px; margin-top:4px;
        padding:8px; border-radius:8px;
        border:1px dashed ${isDark ? "#333" : "#e0e0e0"};
        background:${isDark ? "#16161e" : "#fafafa"};
      `;

      manualToggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        manualOpen = !manualOpen;
        addForm.style.display = manualOpen ? "flex" : "none";
        manualToggleBtn.textContent = (st.addSectionLabel || "Add Engine") + (manualOpen ? " ▴" : " ▾");
      });

      function mkInput(placeholder) {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.placeholder = placeholder;
        inp.style.cssText = `
          width:100%; padding:5px 8px; border-radius:6px; box-sizing:border-box;
          border:1px solid ${border}; background:${isDark ? "#141420" : "#f9f9ff"};
          color:${fg}; font-size:${styleSettings.fontSize}px;
          outline:none; transition:border-color 0.15s;
        `;
        inp.addEventListener("focus", () => (inp.style.borderColor = accent));
        inp.addEventListener("blur",  () => (inp.style.borderColor = border));
        return inp;
      }

      const nameInp = mkInput(st.namePlaceholder || "Engine name");
      const urlInp  = mkInput(st.urlPlaceholder  || "Search URL (?q=)");
      addForm.appendChild(nameInp);
      addForm.appendChild(urlInp);

      const addBtn2 = document.createElement("button");
      addBtn2.textContent = st.addBtn || "➕ Add";
      addBtn2.style.cssText = `
        padding:5px 8px; border-radius:6px; cursor:pointer;
        border:1px solid ${isDark ? "#444" : "#ddd"};
        background:${isDark ? "#222" : "#f5f5f5"};
        color:${isDark ? "#aaa" : "#888"};
        font-size:${styleSettings.fontSize}px;
        transition:background 0.15s; width:100%;
      `;
      addBtn2.addEventListener("mouseenter", () => {
        addBtn2.style.background = isDark ? "#2a2a3a" : "#ececec";
      });
      addBtn2.addEventListener("mouseleave", () => {
        addBtn2.style.background = isDark ? "#222" : "#f5f5f5";
      });
      addBtn2.addEventListener("click", (e) => {
        e.stopPropagation();
        const name = nameInp.value.trim();
        const url  = urlInp.value.trim();
        if (!name || !url) {
          showToast(st.nameEmpty || "Name and URL cannot be empty!");
          return;
        }
        if (!url.startsWith("http")) {
          showToast(st.urlInvalid || "URL must start with http!");
          return;
        }
        se_engines.push({ name, url });
        se_save();
        nameInp.value = "";
        urlInp.value  = "";
        renderEngineList();
        renderPinnedEngines();
        const msg = typeof st.addSuccess === "function"
          ? st.addSuccess(name) : `✅ ${name}`;
        showToast(msg);
      });
      addForm.appendChild(addBtn2);

      manualToggleWrap.appendChild(manualToggleBtn);
      manualToggleWrap.appendChild(addForm);
      epBody.appendChild(manualToggleWrap);

      seExtraPanel.style.left = "-9999px";
      seExtraPanel.style.top = "-9999px";
      document.body.appendChild(seExtraPanel);
      shieldFromFileDrop(seExtraPanel);
      renderEngineList();

      requestAnimationFrame(() => {
        if (!seExtraPanel) return;
        const epW = seExtraPanel.offsetWidth || 280;
        const epH = seExtraPanel.offsetHeight || 320;
        const margin = 6;

        if (
          se_panelPos &&
          se_panelPos.left >= 0 &&
          se_panelPos.top >= 0 &&
          se_panelPos.left + epW <= window.innerWidth + margin &&
          se_panelPos.top + epH <= window.innerHeight + margin
        ) {
          seExtraPanel.style.left =
            Math.min(se_panelPos.left, window.innerWidth - epW - margin) + "px";
          seExtraPanel.style.top =
            Math.min(se_panelPos.top, window.innerHeight - epH - margin) + "px";
        } else {
          const btnRect = plusBtn.getBoundingClientRect();
          let left = btnRect.right - epW;
          let top = btnRect.bottom + margin;
          if (left < margin) left = margin;
          if (top + epH > window.innerHeight - margin)
            top = btnRect.top - epH - margin;
          if (top < margin) top = margin;
          seExtraPanel.style.left = left + "px";
          seExtraPanel.style.top = top + "px";
        }
        seExtraPanel.style.right = "auto";
      });
    }

    plusBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      buildExtraPanel();
    });

    renderPinnedEngines();

    if (se_panelPinned) {
      setTimeout(() => {
        buildExtraPanel();
      }, 300);
    }

    panel.appendChild(headerContainer);

    const panelBody = document.createElement("div");
    panelBody.id = "panel-body";
    panelBody.style.cssText = "padding:10px; box-sizing:border-box;";
    const searchContainer = document.createElement("div");
    searchContainer.id = "site-search-container";
    searchContainer.style.cssText = `
      position: relative;
      flex: 0 1 130px;
      min-width: 60px;
      align-self: center;
      z-index: 10;
    `;

    const searchRow = document.createElement("div");
    searchRow.style.cssText = "display:flex; align-items:center; position:relative;";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.id = "site-search-input";
    searchInput.placeholder = t.searchSites;
    searchInput.autocomplete = "off";
    searchInput.style.cssText = `
      flex: 1;
      min-width: 0;
      padding: 2px 42px 2px 6px;
      border-radius: ${styleSettings.borderRadius}px;
      border: 1px solid ${panelTheme === "dark" ? "#555" : "#ccc"};
      font-size: ${styleSettings.fontSize}px;
      background: ${styleSettings.customBackgroundColor || (panelTheme === "dark" ? "#2a2a2a" : "#fff")};
      color: ${styleSettings.textColor || (panelTheme === "dark" ? "#fff" : "#000")};
      box-sizing: border-box;
      outline: none;
      opacity: ${styleSettings.buttonOpacity};
      transition: border-color 0.15s, opacity 0.15s;
      height: 22px;
    `;

    const clearInputBtn = document.createElement("button");
    clearInputBtn.id = "se-clear-btn";
    clearInputBtn.textContent = "✕";
    clearInputBtn.title = t.close;
    clearInputBtn.style.cssText = `
      display: none;
      position: absolute;
      right: 22px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      padding: 0;
      border: none;
      background: transparent;
      color: ${panelTheme === "dark" ? "#888" : "#aaa"};
      cursor: pointer;
      font-size: 10px;
      line-height: 16px;
      text-align: center;
      opacity: 0.6;
      transition: opacity 0.15s;
      z-index: 2;
    `;

    const historyBtn = document.createElement("button");
    historyBtn.id = "se-history-btn";
    historyBtn.textContent = "🕐";
    historyBtn.title = t.searchHistory || "搜尋歷史";
    historyBtn.style.cssText = `
      position: absolute;
      right: 3px;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 18px;
      padding: 1px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 12px;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      opacity: 0.45;
      transition: opacity 0.15s;
      z-index: 1;
    `;
    historyBtn.addEventListener("mouseenter", () => { historyBtn.style.opacity = "1"; });
    historyBtn.addEventListener("mouseleave", () => { historyBtn.style.opacity = "0.45"; });

    const historyDropdown = document.createElement("div");
    historyDropdown.id = "site-history-dropdown";
    historyDropdown.style.cssText = `
      display: none;
      position: fixed;
      background: ${panelTheme === "dark" ? "#2d2d2d" : "#fff"};
      border: 1px solid ${panelTheme === "dark" ? "#555" : "#ddd"};
      border-radius: ${styleSettings.borderRadius}px;
      min-width: 180px;
      max-width: 260px;
      max-height: 220px;
      overflow-y: auto;
      z-index: 2147483666;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    `;

    let highlightIndex = -1;

    function renderHistoryDropdown(keyword) {
      historyDropdown.innerHTML = "";
      highlightIndex = -1;
      const history = SearchHistoryManager.getHistory();

      const header = document.createElement("div");
      header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 8px 4px;
        font-size: ${styleSettings.fontSize - 1}px;
        color: ${panelTheme === "dark" ? "#888" : "#999"};
        border-bottom: 1px solid ${panelTheme === "dark" ? "#444" : "#eee"};
        user-select: none;
      `;

      const headerLabel = document.createElement("span");
      headerLabel.textContent = t.searchHistory;
      header.appendChild(headerLabel);

      if (history.length > 0) {
        const clearAllBtn = document.createElement("button");
        clearAllBtn.textContent = t.clearSearchHistory;
        clearAllBtn.style.cssText = `
          background: none;
          border: none;
          cursor: pointer;
          color: #e55;
          font-size: ${styleSettings.fontSize - 1}px;
          padding: 0;
        `;
        clearAllBtn.onmousedown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          SearchHistoryManager.clearHistory();
          filterSites("");
          searchInput.value = "";
          clearInputBtn.style.display = "none";
          renderHistoryDropdown("");
          showToast(t.clearSearchHistory);
        };
        header.appendChild(clearAllBtn);
      }
      historyDropdown.appendChild(header);

      if (history.length === 0) {
        const empty = document.createElement("div");
        empty.textContent = t.noSearchHistory;
        empty.style.cssText = `
          padding: 10px 8px;
          color: ${panelTheme === "dark" ? "#666" : "#bbb"};
          font-size: ${styleSettings.fontSize - 1}px;
          text-align: center;
        `;
        historyDropdown.appendChild(empty);
        return;
      }

      const filtered = keyword
        ? history.filter(k => k.toLowerCase().includes(keyword.toLowerCase()))
        : history;

      if (filtered.length === 0) {
        historyDropdown.style.display = "none";
        return;
      }

      filtered.forEach((kw, idx) => {
        const item = document.createElement("div");
        item.dataset.historyIndex = idx;
        item.style.cssText = `
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 8px;
          cursor: pointer;
          border-bottom: 1px solid ${panelTheme === "dark" ? "#3a3a3a" : "#f0f0f0"};
          font-size: ${styleSettings.fontSize}px;
          color: ${styleSettings.textColor || (panelTheme === "dark" ? "#ddd" : "#333")};
          transition: background 0.1s;
        `;

        const kwText = document.createElement("span");
        kwText.textContent = kw;
        kwText.style.flex = "1";
        kwText.style.overflow = "hidden";
        kwText.style.textOverflow = "ellipsis";
        kwText.style.whiteSpace = "nowrap";

        item.onmousedown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          window._historyItemClicked = true;
          setTimeout(() => { window._historyItemClicked = false; }, 300);
          searchInput.value = kw;
          clearInputBtn.style.display = "";
          filterSites(kw);
          historyDropdown.style.display = "none";
          renderHistoryDropdown("");
        };

        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.style.cssText = `
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13px;
          padding: 0 2px;
          flex-shrink: 0;
          opacity: 0.5;
          transition: opacity 0.1s;
        `;
        delBtn.title = t.deleteKeyword;
        delBtn.onmousedown = (e) => {
          e.preventDefault();
          e.stopPropagation();
          SearchHistoryManager.removeFromHistory(kw);
          renderHistoryDropdown(searchInput.value);
          if (SearchHistoryManager.getHistory().length === 0) {
            historyDropdown.style.display = "none";
          }
        };
        delBtn.onmouseenter = () => { delBtn.style.opacity = "1"; };
        delBtn.onmouseleave = () => { delBtn.style.opacity = "0.5"; };

        item.onmouseenter = () => {
          item.style.background = panelTheme === "dark" ? "#3a3a3a" : "#f5f5f5";
        };
        item.onmouseleave = () => {
          item.style.background = "transparent";
        };

        item.appendChild(kwText);
        item.appendChild(delBtn);
        historyDropdown.appendChild(item);
      });
    }

    function getDropdownItems() {
      return [...historyDropdown.querySelectorAll("[data-history-index]")];
    }

    function setHighlight(idx) {
      const items = getDropdownItems();
      items.forEach((it, i) => {
        it.style.background = i === idx
          ? (panelTheme === "dark" ? "#4a4a4a" : "#e8f0fe")
          : "transparent";
      });
      highlightIndex = idx;
    }

    function filterSites(keyword) {
      const lk = keyword.toLowerCase().trim();
      panel.querySelectorAll(".group-block").forEach((block) => {
        let visibleCount = 0;
        block.querySelectorAll(".draggable-site").forEach((btn) => {
          const url  = (btn.dataset.siteUrl  || "").toLowerCase();
          const note = (btn.dataset.siteNote || "").toLowerCase();
          const match = !lk || url.includes(lk) || note.includes(lk);
          btn.style.display = match ? "" : "none";
          if (match) visibleCount++;
        });
        block.style.display = (lk && visibleCount === 0) ? "none" : "";
      });
    }

    function positionDropdown() {
      const rect = searchContainer.getBoundingClientRect();
      const ddW = Math.max(180, rect.width);
      let left = rect.left;
      if (left + ddW > window.innerWidth - 6) left = rect.right - ddW;
      if (left < 6) left = 6;
      historyDropdown.style.left     = left + "px";
      historyDropdown.style.top      = (rect.bottom + 4) + "px";
      historyDropdown.style.right    = "auto";
      historyDropdown.style.minWidth = ddW + "px";
    }

    historyBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });
    historyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = historyDropdown.style.display === "block";
      if (isOpen) {
        historyDropdown.style.display = "none";
        return;
      }
      renderHistoryDropdown(searchInput.value);
      document.body.appendChild(historyDropdown);
      positionDropdown();
      historyDropdown.style.display = "block";
    });

    searchInput.addEventListener("focus", () => {
      searchInput.style.borderColor = panelTheme === "dark" ? "#888" : "#4a90d9";
      const history = SearchHistoryManager.getHistory();
      if (history.length === 0) return;
      renderHistoryDropdown(searchInput.value);
      document.body.appendChild(historyDropdown);
      positionDropdown();
      historyDropdown.style.display = "block";
    });

    searchInput.addEventListener("blur", () => {
      searchInput.style.borderColor = panelTheme === "dark" ? "#555" : "#ccc";
      setTimeout(() => {
        historyDropdown.style.display = "none";
      }, 150);
    });

    const _reposDD = () => {
      if (historyDropdown.style.display === "block") positionDropdown();
    };
    window.addEventListener("scroll", _reposDD, true);
    window.addEventListener("resize", _reposDD);
    panel.addEventListener("remove", () => {
      window.removeEventListener("scroll", _reposDD, true);
      window.removeEventListener("resize", _reposDD);
      historyDropdown.remove();
    }, { once: true });

    const _debouncedFilterSites = debounce(filterSites, 200);
    let _historyDebounceTimer = null;
    searchInput.addEventListener("input", (e) => {
      const kw = e.target.value;
      clearInputBtn.style.display = kw ? "" : "none";
      _debouncedFilterSites(kw);

      clearTimeout(_historyDebounceTimer);
      if (kw.trim()) {
        _historyDebounceTimer = setTimeout(() => {
          SearchHistoryManager.addToHistory(kw.trim());
        }, 800);
      }

      renderHistoryDropdown(kw);
      const history = SearchHistoryManager.getHistory();
      const filtered = kw
        ? history.filter(k => k.toLowerCase().includes(kw.toLowerCase()))
        : history;
      if (filtered.length > 0) {
        positionDropdown();
        historyDropdown.style.display = "block";
      } else {
        historyDropdown.style.display = "none";
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      const items = getDropdownItems();
      const isOpen = historyDropdown.style.display === "block";

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen) {
          renderHistoryDropdown(searchInput.value);
          positionDropdown();
          historyDropdown.style.display = "block";
        }
        setHighlight(Math.min(highlightIndex + 1, items.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight(Math.max(highlightIndex - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        if (isOpen && highlightIndex >= 0 && items[highlightIndex]) {
          const kw = items[highlightIndex].querySelector("span")?.textContent || "";
          searchInput.value = kw;
          clearInputBtn.style.display = kw ? "" : "none";
          filterSites(kw);
          historyDropdown.style.display = "none";
        } else {
          historyDropdown.style.display = "none";
        }
        return;
      }
      if (e.key === "Escape") {
        historyDropdown.style.display = "none";
        searchInput.blur();
        return;
      }
    });

    clearInputBtn.addEventListener("click", () => {
      searchInput.value = "";
      clearInputBtn.style.display = "none";
      filterSites("");
      historyDropdown.style.display = "none";
      searchInput.focus();
    });

    searchRow.appendChild(searchInput);
    searchRow.appendChild(clearInputBtn);
    searchRow.appendChild(historyBtn);
    searchContainer.appendChild(searchRow);
    document.body.appendChild(historyDropdown);
    shieldFromFileDrop(historyDropdown);
    headerContainer.insertBefore(searchContainer, dpBtn);

    const buttonContainer = document.createElement("div");
    buttonContainer.id = "toolbar-container";
    buttonContainer.style.cssText = `
      display:flex; flex-wrap:wrap; gap:4px; row-gap:3px;
      margin-bottom:8px; position:relative; z-index:0;
      padding:6px 8px;
      background:${panelTheme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"};
      border-radius:${Math.max(styleSettings.borderRadius, 8)}px;
      border:1px solid ${panelTheme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"};
    `;

    const _tlbBg  = panelTheme === "dark" ? "#4a4a4a" : "#f5f5f5";
    const _tlbFg  = panelTheme === "dark" ? "#ffffff" : "#000000";
    const _tlbBd  = panelTheme === "dark" ? "#666"    : "#ccc";
    const _tlbRad = Math.max(styleSettings.borderRadius, 6) + "px";

    const addGroupBtn = document.createElement("button");
    addGroupBtn.textContent = t.addGroup || "新增群組";
    addGroupBtn.style.cssText = `
      padding:3px 8px; border-radius:${_tlbRad};
      cursor:pointer; white-space:nowrap; font-size:11px;
      background:${_tlbBg}; color:${_tlbFg}; border:1px solid ${_tlbBd};
    `;
    addGroupBtn.onclick = () => {
      if (isPromptActive) {
        warn("提示框已在顯示，忽略新增群組請求");
        return;
      }
      showCustomPrompt(t.enterGroupName || "輸入群組名稱", "", (name) => {
        if (!name || !name.trim()) {
          showToast(t.emptyGroupName || "群組名稱不能為空！");
          return;
        }
        groups.push({ name: name.trim(), sites: [] });
        save();
        renderSites(panel);
        panel.style.display = "block";
        showToast(`${t.addGroup} 成功！`);
      });
    };
    buttonContainer.appendChild(addGroupBtn);

    const toggleAddressBtn = document.createElement("button");
    toggleAddressBtn.id = "se-toggle-address-btn";
    toggleAddressBtn.style.cssText = `
      padding:3px 8px; border-radius:${_tlbRad};
      cursor:pointer; white-space:nowrap; font-size:11px;
      background:${_tlbBg}; color:${_tlbFg}; border:1px solid ${_tlbBd};
      display:inline-flex; align-items:center; gap:4px;
    `;

    function _updateAddrBtn() {
      const _ic = styleSettings.iconStyle || "emoji";
      const _lbl = showAddresses ? (t.toggleHide || "顯示註解") : (t.toggleShow || "顯示網址");
      if (_ic === "emoji") {
        toggleAddressBtn.textContent = ICONS.toggleAddress.emoji + "\u202F" + _lbl;
        toggleAddressBtn.style.fontSize = "11px";
      } else if (_ic === "svg-line") {
        toggleAddressBtn.innerHTML =
          ICONS.toggleAddress.line + `<span style="font-size:11px;line-height:1">${_lbl}</span>`;
        toggleAddressBtn.style.color = styleSettings.svgIconColor || "";
      } else {
        toggleAddressBtn.innerHTML =
          ICONS.toggleAddress.fill + `<span style="font-size:11px;line-height:1">${_lbl}</span>`;
        toggleAddressBtn.style.color = styleSettings.svgIconColor || "";
      }
    }
    _updateAddrBtn();

    toggleAddressBtn.onclick = () => {
      showAddresses = !showAddresses;
      GM_setValue("showAddresses", showAddresses);
      _updateAddrBtn();
      renderSites(panel);
    };
    buttonContainer.appendChild(toggleAddressBtn);

    const exportBtn = document.createElement("button");
    exportBtn.textContent = t.exportConfig || "匯出設定";
    exportBtn.style.padding = "4px 8px";
    exportBtn.style.borderRadius = _tlbRad;
    exportBtn.style.cursor = "pointer";
    exportBtn.style.whiteSpace = "nowrap";
    exportBtn.style.flexShrink = "1";
    exportBtn.style.background = _tlbBg;
    exportBtn.style.color = _tlbFg;
    exportBtn.style.border = `1px solid ${_tlbBd}`;
    exportBtn.onclick = () => {
      const config = {
        siteGroups: groups,
        searchConfig: searchConfig,
        safeSearchEnabled:  safeSearchEnabled,
        searchRegionEnabled: searchRegionEnabled,
        safeSearchNoticedOnce:   safeSearchNoticedOnce,
        searchRegionNoticedOnce: searchRegionNoticedOnce,
        defaultPanelOpen: defaultPanelOpen,
        panelTheme: panelTheme,
        styleSettings: styleSettings,
        sitePanelLang: lang,
        se_engines: se_engines,
        se_panelPinned: se_panelPinned,
        se_panelPos: se_panelPos,
        showAddresses: showAddresses,
        searchConfigCollapsed: GM_getValue("searchConfigCollapsed", false),
        toggleButtonTop: GM_getValue("toggleButtonTop", null),
        toggleButtonLeft: GM_getValue("toggleButtonLeft", null),
        styleFloatPos: GM_getValue("styleFloatPos", null),
        manuallyClosed: GM_getValue("manuallyClosed", false),
        domainBlacklist: domainBlacklist,
      };
      const jsonString = JSON.stringify(config, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "site-shortcuts-config.json";
      a.click();
      URL.revokeObjectURL(url);
      navigator.clipboard
        .writeText(jsonString)
        .then(() => {
          showToast(t.exportConfigSuccess || "匯出設定成功！");
          log("Configuration exported and copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy to clipboard:", err);
          showToast(t.copied || "已複製到剪貼簿");
        });
    };
    buttonContainer.appendChild(exportBtn);

    const importBtn = document.createElement("button");
    importBtn.textContent = t.importConfig || "匯入設定";
    importBtn.style.padding = "4px 8px";
    importBtn.style.borderRadius = _tlbRad;
    importBtn.style.cursor = "pointer";
    importBtn.style.whiteSpace = "nowrap";
    importBtn.style.flexShrink = "1";
    importBtn.style.background = _tlbBg;
    importBtn.style.color = _tlbFg;
    importBtn.style.border = `1px solid ${_tlbBd}`;
    importBtn.onclick = () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
      fileInput.style.display = "none";
      fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (!file) return;
        if (!file.name.endsWith(".json")) {
          showToast(t.invalidFileType || "檔案必須是 JSON 格式！");
          fileInput.remove();
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const config = JSON.parse(e.target.result);
            function _isValidSite(s) {
              if (typeof s === "string") return s.length > 0 && s.length < 512;
              return s !== null && typeof s === "object" &&
                typeof s.url === "string" && s.url.length > 0 && s.url.length < 512 &&
                (s.note === undefined || typeof s.note === "string");
            }
            function _isValidGroup(g) {
              return g !== null && typeof g === "object" &&
                typeof g.name === "string" && g.name.length > 0 && g.name.length < 256 &&
                Array.isArray(g.sites) && g.sites.every(_isValidSite);
            }
            if (config.siteGroups) groups.length = 0;
            const _importedGroups = Array.isArray(config.siteGroups)
              ? config.siteGroups.filter(_isValidGroup)
              : [];
            Object.assign(groups, _importedGroups);
            searchConfig = config.searchConfig || searchConfig;
            safeSearchEnabled  = config.safeSearchEnabled  ?? safeSearchEnabled;
            searchRegionEnabled = config.searchRegionEnabled ?? searchRegionEnabled;
            defaultPanelOpen = config.defaultPanelOpen ?? defaultPanelOpen;
            GM_setValue("defaultPanelOpen", defaultPanelOpen);
            panelTheme = config.panelTheme || panelTheme;
            GM_setValue("panelTheme", panelTheme);
            if (config.styleSettings) {
              styleSettings = Object.assign({}, styleSettings, config.styleSettings);
            }
            GM_setValue("styleSettings", styleSettings);
            lang = config.sitePanelLang || lang;
            GM_setValue("sitePanelLang", lang);
            if (config.safeSearchNoticedOnce !== undefined) {
              safeSearchNoticedOnce = config.safeSearchNoticedOnce;
              GM_setValue("safeSearchNoticedOnce", safeSearchNoticedOnce);
            }
            if (config.searchRegionNoticedOnce !== undefined) {
              searchRegionNoticedOnce = config.searchRegionNoticedOnce;
              GM_setValue("searchRegionNoticedOnce", searchRegionNoticedOnce);
            }
            if (Array.isArray(config.se_engines) && config.se_engines.length > 0) {
              se_engines = config.se_engines;
            }
            if (config.se_panelPinned !== undefined) se_panelPinned = config.se_panelPinned;
            if (config.se_panelPos !== undefined) se_panelPos = config.se_panelPos;
            if (config.showAddresses !== undefined) {
              showAddresses = config.showAddresses;
              GM_setValue("showAddresses", showAddresses);
            }
            if (config.searchConfigCollapsed !== undefined)
              GM_setValue("searchConfigCollapsed", config.searchConfigCollapsed);
            if (config.toggleButtonTop != null)
              GM_setValue("toggleButtonTop", config.toggleButtonTop);
            if (config.toggleButtonLeft != null)
              GM_setValue("toggleButtonLeft", config.toggleButtonLeft);
            if (config.styleFloatPos != null)
              GM_setValue("styleFloatPos", config.styleFloatPos);
            if (config.manuallyClosed !== undefined)
              GM_setValue("manuallyClosed", config.manuallyClosed);
            if (Array.isArray(config.domainBlacklist)) {
              domainBlacklist = config.domainBlacklist;
              GM_setValue("domainBlacklist", domainBlacklist);
            }
            se_save();
            save();
            createPanel();
            showToast(t.importConfigSuccess || "匯入成功！");
            log("Configuration imported successfully");
          } catch (err) {
            showToast(t.importConfigFailed || "匯入失敗：無效的 JSON 格式！");
            console.error("Import failed:", err);
          } finally {
            fileInput.remove();
          }
        };
        reader.readAsText(file);
      };
      document.body.appendChild(fileInput);
      fileInput.click();
      setTimeout(() => fileInput.remove(), 30000);
    };
    buttonContainer.appendChild(importBtn);

    const syntaxHelpBtn = document.createElement("button");
    syntaxHelpBtn.id = "syntax-help-btn";
    syntaxHelpBtn.textContent = "📖";
    syntaxHelpBtn.title = t.syntaxHelp || "Search Syntax Reference";
    syntaxHelpBtn.style.cssText = `
      padding:3px 6px;
      border-radius:${_tlbRad};
      cursor:pointer; white-space:nowrap;
      font-size:${styleSettings.fontSize}px; line-height:1.4;
      flex-shrink:0;
      background:${_tlbBg}; color:${_tlbFg}; border:1px solid ${_tlbBd};
    `;
    syntaxHelpBtn.onclick = () => showSyntaxPanel();
    syntaxHelpBtn.style.display = styleSettings.hideSyntaxBtn ? "none" : "";

    const blacklistBtnEl = document.createElement("button");
    blacklistBtnEl.id = "blacklist-btn";
    blacklistBtnEl.textContent = t.blacklistBtn || "🚫 Blacklist";
    blacklistBtnEl.title = t.blacklistTitle || "Domain Blacklist";
    blacklistBtnEl.style.padding = "4px 8px";
    blacklistBtnEl.style.borderRadius = _tlbRad;
    blacklistBtnEl.style.cursor = "pointer";
    blacklistBtnEl.style.whiteSpace = "nowrap";
    blacklistBtnEl.style.flexShrink = "0";
    blacklistBtnEl.style.background = _tlbBg;
    blacklistBtnEl.style.color = _tlbFg;
    blacklistBtnEl.style.border = `1px solid ${_tlbBd}`;
    const _blCount = Array.isArray(domainBlacklist) ? domainBlacklist.filter(d => d.trim()).length : 0;
    if (_blCount > 0) {
      blacklistBtnEl.textContent = `🚫 ${_blCount}`;
      blacklistBtnEl.title = (t.blacklistCount ? t.blacklistCount(_blCount) : `Blocking ${_blCount} domain(s)`) + "\n" + (t.blacklistTitle || "Domain Blacklist");
    }
    blacklistBtnEl.onclick = () => showBlacklistDialog();
    blacklistBtnEl.style.display = styleSettings.hideBlacklistBtn ? "none" : "";
    buttonContainer.appendChild(blacklistBtnEl);
    buttonContainer.appendChild(syntaxHelpBtn);

    const groupSlot = document.createElement("div");
    groupSlot.id = "panel-group-slot";
    panel.appendChild(panelBody);
    panelBody.appendChild(groupSlot);

    const searchConfigWrap = document.createElement("div");
    searchConfigWrap.id = "search-config-wrap";
    searchConfigWrap.style.cssText = `
      margin-top:8px; padding:6px 8px;
      border-radius:${Math.max(styleSettings.borderRadius, 8)}px;
      background:${panelTheme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"};
      border:1px solid ${panelTheme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"};
    `;

    const searchConfigHeaderRow = document.createElement("div");
    searchConfigHeaderRow.style.cssText = `
      display:flex; align-items:center; gap:8px;
      cursor:pointer; user-select:none;
    `;

    const timeFilterRow = document.createElement("div");
    timeFilterRow.style.cssText = "display:flex; align-items:center; gap:6px; flex:1; min-width:0;";

    const timeLabel = document.createElement("label");
    timeLabel.textContent = t.timeLabel;
    timeLabel.style.cssText = "white-space:nowrap; flex-shrink:0; font-size:11px; opacity:0.7;";
    timeFilterRow.appendChild(timeLabel);

    const _tsEngine = getTimeFilterEngine();

    let _initTimeVal = "";
    if (_tsEngine) {
      try {
        const _u = new URL(location.href);
        if (_tsEngine === "bing-images") {
          const _qft = _u.searchParams.get("qft") || "";
          const _mMatch = _qft.match(/filterui:age-lt(\d+)/);
          if (_mMatch) {
            const _mins = parseInt(_mMatch[1]);
            const _biaMap = [[60,"h"],[120,"h2"],[180,"h3"],[360,"h6"],[720,"h12"],
              [1440,"d"],[2880,"d2"],[4320,"d3"],[10080,"w"],[30240,"w3"],
              [43200,"m"],[129600,"m3"],[259200,"m6"],[525960,"y"]];
            const _found = _biaMap.find(([n]) => n >= _mins);
            _initTimeVal = _found ? _found[1] : "y";
          }
        } else if (_tsEngine === "bing") {
          const _freshnessRev = { "past hour":"h","past day":"d","past week":"w","past month":"m","past year":"y" };
          _initTimeVal = _freshnessRev[(_u.searchParams.get("freshness")||"").toLowerCase()] || "";
        } else if (_tsEngine === "yahoo") {
          const _ageRev = { "1d":"d","1w":"w","1m":"m","1y":"y" };
          _initTimeVal = _ageRev[_u.searchParams.get("age")||""] || "";
        } else {
          const _m = (_u.searchParams.get("tbs")||"").match(/qdr:([a-z0-9]+)/);
          _initTimeVal = _m ? _m[1] : "";
        }
      } catch(_) {}
    }

    const _SEG_OPTIONS = [
      { label: t.unlimited || "∞", value: "" },
      { label: "1h",  value: "h"  },
      { label: "1d",  value: "d"  },
      { label: "1w",  value: "w"  },
      { label: "1m",  value: "m"  },
      { label: "1y",  value: "y"  },
      { label: t.timeCustom || "…", value: "__custom__" },
    ];
    const _isDark = panelTheme === "dark";
    const _segBg = _isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const _segActiveBg = _isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.13)";
    const _segBorder = _isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)";

    const segWrap = document.createElement("div");
    segWrap.style.cssText = `
      display:flex; flex:1; border:1px solid ${_segBorder};
      border-radius:8px; overflow:hidden; flex-shrink:0;
      background:${_segBg};
      opacity:${_tsEngine ? "1" : "0.45"};
      pointer-events:${_tsEngine ? "auto" : "none"};
    `;
    if (!_tsEngine) {
      segWrap.title = t.timeUnsupported || "⚠️ 此搜尋引擎不支援時間篩選";
      segWrap.style.pointerEvents = "auto";
      segWrap.style.cursor = "not-allowed";
      segWrap.addEventListener("click", (e) => {
        e.stopPropagation();
        showToast(t.timeUnsupported || "⚠️ 此搜尋引擎不支援時間篩選", 2500);
      });
    }

    const customDateRow = document.createElement("div");
    customDateRow.style.cssText = `
      display:none; align-items:center; gap:5px; flex-wrap:wrap;
      margin-top:5px; padding:5px 6px;
      background:${_segBg}; border:1px solid ${_segBorder};
      border-radius:7px; font-size:11px;
    `;

    function _makeCustomDateInput(labelTxt, placeholder) {
      const wrap = document.createElement("div");
      wrap.style.cssText = "display:flex; align-items:center; gap:3px;";
      const lbl = document.createElement("span");
      lbl.textContent = labelTxt;
      lbl.style.cssText = "opacity:0.6; white-space:nowrap;";
      const inp = document.createElement("input");
      inp.type = "date";
      inp.placeholder = placeholder;
      inp.style.cssText = `
        font-size:11px; padding:2px 4px; border-radius:5px;
        border:1px solid ${_segBorder};
        background:${_isDark ? "#3a3a3a" : "#fff"};
        color:inherit; cursor:pointer;
      `;
      wrap.appendChild(lbl);
      wrap.appendChild(inp);
      return { wrap, inp };
    }

    const _afterField  = _makeCustomDateInput("after:",  "YYYY-MM-DD");
    const _beforeField = _makeCustomDateInput("before:", "YYYY-MM-DD");
    const _applyCustomBtn = document.createElement("button");
    _applyCustomBtn.textContent = t.apply || "Apply";
    _applyCustomBtn.className = "icon-btn";
    _applyCustomBtn.style.cssText = `
      padding:2px 8px; border-radius:5px; font-size:11px; cursor:pointer;
      background:${_segActiveBg}; border:1px solid ${_segBorder}; color:inherit;
    `;
    _applyCustomBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const after  = _afterField.inp.value;
      const before = _beforeField.inp.value;
      if (!after && !before) return;
      try {
        const u = new URL(location.href);
        const q = u.searchParams.get("q") || u.searchParams.get("query") || "";
        let newQ = q.replace(/\s*after:\S+/g, "").replace(/\s*before:\S+/g, "").trim();
        if (after)  newQ += ` after:${after}`;
        if (before) newQ += ` before:${before}`;
        if (u.searchParams.has("q"))     u.searchParams.set("q", newQ.trim());
        else if (u.searchParams.has("query")) u.searchParams.set("query", newQ.trim());
        else { showToast("⚠️ 無法識別此引擎的查詢參數", 2000); return; }
        location.href = u.toString();
      } catch(_) {
        showToast("⚠️ 日期格式錯誤，請使用 YYYY-MM-DD", 2000);
      }
    });
    customDateRow.appendChild(_afterField.wrap);
    customDateRow.appendChild(_beforeField.wrap);
    customDateRow.appendChild(_applyCustomBtn);

    _SEG_OPTIONS.forEach(({ label, value }) => {
      const opt = document.createElement("button");
      opt.className = "icon-btn seg-time-btn";
      opt.dataset.value = value;
      opt.textContent = label;
      const _isActive = value === _initTimeVal;
      opt.style.cssText = `
        flex:1; border:none; border-right:1px solid ${_segBorder}; border-radius:0;
        background:${_isActive ? _segActiveBg : "transparent"};
        color:inherit; font-size:10px; font-weight:${_isActive ? "600" : "400"};
        padding:4px 2px; cursor:${_tsEngine ? "pointer" : "not-allowed"};
        transition:background 0.12s, font-weight 0.1s;
        white-space:nowrap; line-height:1;
      `;
      opt.addEventListener("click", (e) => {
        if (!_tsEngine) return;
        e.stopPropagation();
        segWrap.querySelectorAll(".seg-time-btn").forEach(b => {
          const _a = b.dataset.value === value;
          b.style.background = _a ? _segActiveBg : "transparent";
          b.style.fontWeight = _a ? "600" : "400";
        });
        if (value === "__custom__") {
          const _shown = customDateRow.style.display !== "none";
          customDateRow.style.display = _shown ? "none" : "flex";
        } else {
          customDateRow.style.display = "none";
          applyTimeFilter(value);
        }
      });
      segWrap.appendChild(opt);
    });
    const _lastSeg = segWrap.lastElementChild;
    if (_lastSeg) _lastSeg.style.borderRight = "none";

    timeFilterRow.appendChild(segWrap);

    {
      const _yearExtOptions = TIME_OPTIONS.filter(o => /^y[2-9]$/.test(o.value));
      if (_yearExtOptions.length > 0) {
        const _yearSel = document.createElement("select");
        _yearSel.title = "2–9 years";
        _yearSel.style.cssText = `
          flex-shrink:0; font-size:10px; padding:3px 4px;
          border:1px solid ${_segBorder}; border-radius:7px;
          background:${_segBg}; color:inherit; cursor:pointer;
          opacity:${_tsEngine ? "1" : "0.45"};
          pointer-events:${_tsEngine ? "auto" : "none"};
        `;

        const _ph = document.createElement("option");
        _ph.value = "";
        _ph.textContent = "2y+";
        _ph.disabled = true;
        _yearSel.appendChild(_ph);

        _yearExtOptions.forEach(({ label, value }) => {
          const opt = document.createElement("option");
          opt.value = value;
          opt.textContent = label;
          _yearSel.appendChild(opt);
        });

        _yearSel.value = /^y[2-9]$/.test(_initTimeVal) ? _initTimeVal : "";

        _yearSel.addEventListener("change", (e) => {
          if (!_tsEngine) return;
          const val = e.target.value;
          if (!val) return;
          segWrap.querySelectorAll(".seg-time-btn").forEach(b => {
            b.style.background = "transparent";
            b.style.fontWeight = "400";
          });
          customDateRow.style.display = "none";
          applyTimeFilter(val);
        });

        segWrap.addEventListener("click", () => { _yearSel.value = ""; });

        timeFilterRow.appendChild(_yearSel);
      }
    }

    timeFilterRow.style.flexWrap = "wrap";
    timeFilterRow.appendChild(customDateRow);

    searchConfigHeaderRow.appendChild(timeFilterRow);
    searchConfigWrap.appendChild(searchConfigHeaderRow);

    const collapsibleContent = document.createElement("div");
    collapsibleContent.id = "search-config-content";
    collapsibleContent.style.display = searchConfig.isExpanded
      ? "grid"
      : "none";
    collapsibleContent.style.gridTemplateColumns =
      "repeat(auto-fill, minmax(100px, 1fr))";
    collapsibleContent.style.alignItems = "center";
    collapsibleContent.style.gap = "10px";

    const miscContainer = document.createElement("div");
    miscContainer.style.display = "flex";
    miscContainer.style.flexDirection = "row";
    miscContainer.style.alignItems = "center";
    miscContainer.style.gap = "6px";
    miscContainer.style.flexWrap = "nowrap";
    miscContainer.style.minWidth = "0";
    miscContainer.style.marginLeft = "60px";

    collapsibleContent.appendChild(miscContainer);
    searchConfigWrap.appendChild(collapsibleContent);

    {
      const grip = document.createElement("div");
      grip.id = "panel-resize-grip";
      grip.title = "拖曳調整大小";
      grip.style.cssText = `
        position:sticky; bottom:0; right:0;
        width:100%; height:14px;
        display:flex; align-items:center; justify-content:flex-end;
        padding-right:4px;
        cursor:se-resize; z-index:10; flex-shrink:0;
        background:${panelTheme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"};
        border-top:1px solid ${panelTheme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)"};
        border-radius:0 0 ${Math.max(styleSettings.borderRadius, 10)}px ${Math.max(styleSettings.borderRadius, 10)}px;
        user-select:none;
      `;
      grip.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10" style="opacity:0.30;display:block">
        <line x1="2" y1="9" x2="9" y2="2" stroke="currentColor" stroke-width="1.2"/>
        <line x1="5" y1="9" x2="9" y2="5" stroke="currentColor" stroke-width="1.2"/>
        <line x1="8" y1="9" x2="9" y2="8" stroke="currentColor" stroke-width="1.2"/>
      </svg>`;
      panel.appendChild(grip);

      let _rDragging = false, _rStartX = 0, _rStartY = 0, _rStartW = 0, _rStartH = 0;
      grip.addEventListener("mousedown", (e) => {
        _rDragging = true;
        _rStartX = e.clientX; _rStartY = e.clientY;
        _rStartW = panel.offsetWidth; _rStartH = panel.offsetHeight;
        document.body.style.cursor = "se-resize";
        e.preventDefault(); e.stopPropagation();
      });
      document.addEventListener("mousemove", (e) => {
        if (!_rDragging) return;
        const nw = Math.max(260, _rStartW + (e.clientX - _rStartX));
        const nh = Math.max(200, _rStartH + (e.clientY - _rStartY));
        panel.style.width = nw + "px"; panel.style.maxWidth = nw + "px";
        panel.style.maxHeight = Math.min(95, Math.round(nh / window.innerHeight * 100)) + "vh";
      });
      document.addEventListener("mouseup", () => {
        if (!_rDragging) return;
        _rDragging = false;
        document.body.style.cursor = "";
        styleSettings.panelWidth     = parseInt(panel.style.width)     || getEffectivePanelWidth();
        styleSettings.panelMaxHeight = parseInt(panel.style.maxHeight) || 87;
        styleSettings.panelUserSized = true;
        GM_setValue("styleSettings", styleSettings);
      });
    }

    const expandCollapseBtn = document.createElement("button");
    expandCollapseBtn.textContent = t.expand;
    expandCollapseBtn.style.cssText = `
      padding:3px 8px; border-radius:${Math.max(styleSettings.borderRadius, 6)}px;
      cursor:pointer; white-space:nowrap; font-size:11px; flex-shrink:0;
      border:1px solid ${panelTheme === "dark" ? "#555" : "#ccc"};
      background:${styleSettings.customButtonBg || (panelTheme === "dark" ? "#4a4a4a" : "#f5f5f5")};
      color:${styleSettings.textColor || (panelTheme === "dark" ? "#fff" : "#000")};
      opacity:${styleSettings.buttonOpacity};
    `;
    expandCollapseBtn.onmouseover = () => {
      expandCollapseBtn.style.background = adjustColor(
        styleSettings.customButtonBg || (panelTheme === "dark" ? "#4a4a4a" : "#f5f5f5"), 10);
    };
    expandCollapseBtn.onmouseout = () => {
      expandCollapseBtn.style.background =
        styleSettings.customButtonBg || (panelTheme === "dark" ? "#4a4a4a" : "#f5f5f5");
    };
    expandCollapseBtn.onclick = () => {
      searchConfig.isExpanded = !searchConfig.isExpanded;
      save();
      expandCollapseBtn.textContent = searchConfig.isExpanded
        ? t.collapse
        : t.expand;
      const styleFloat = document.getElementById("style-config-wrap");
      if (styleFloat) {
        styleFloat.style.display = searchConfig.isExpanded ? "block" : "none";
        if (searchConfig.isExpanded) _positionStyleFloat(styleFloat);
      }
    };
    searchConfigHeaderRow.appendChild(expandCollapseBtn);

    function _positionStyleFloat(el) {
      const mainPanel = document.getElementById("site-group-panel");
      if (mainPanel) {
        const rect = mainPanel.getBoundingClientRect();
        el.style.top = rect.top + "px";

        const expectedLeft = rect.left - el.offsetWidth - 8;
        if (expectedLeft >= 8) {
          el.style.left = expectedLeft + "px";
        } else {
          const expectedRight = rect.right + 8;
          if (expectedRight + el.offsetWidth <= window.innerWidth - 8) {
            el.style.left = expectedRight + "px";
          } else {
            el.style.left = "8px";
          }
        }
        el.style.right = "auto";
      }
    }

    if (window.__styleFloatResizeHandler) {
      window.removeEventListener("resize", window.__styleFloatResizeHandler);
    }
    window.__styleFloatResizeHandler = () => {
      const el = document.getElementById("style-config-wrap");
      if (el && el.style.display !== "none") {
        _positionStyleFloat(el);
      }
    };
    window.addEventListener("resize", window.__styleFloatResizeHandler);

    const styleConfigWrap = document.createElement("div");
    styleConfigWrap.id = "style-config-wrap";
    const _scBg = (panelTheme === "custom" && styleSettings.customBackgroundColor)
      ? styleSettings.customBackgroundColor
      : panelTheme === "dark" ? "#2a2a2a" : "#fff";
    const _scFg = styleSettings.textColor || (panelTheme === "dark" ? "#fff" : "#000");
    styleConfigWrap.style.cssText = `
      display: ${searchConfig.isExpanded ? "block" : "none"};
      position: fixed;
      top: -9999px;
      left: -9999px;
      right: auto;
      z-index: 2147483665;
      min-width: 300px;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      border-radius: ${styleSettings.borderRadius}px;
      border: 1px solid ${panelTheme === "dark" ? "#555" : "#ccc"};
      background: ${_scBg};
      color: ${_scFg};
      box-shadow: 0 6px 24px rgba(0,0,0,0.28);
      font-size: ${styleSettings.fontSize}px;
      padding: 0;
      user-select: none;
    `;

    const _scHdrBg = (panelTheme === "custom" && styleSettings.customBackgroundColor)
      ? (styleSettings.customBackgroundColor + "cc")
      : panelTheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
    const _scHdrBd = panelTheme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
    const styleConfigHeaderRow = document.createElement("div");
    styleConfigHeaderRow.style.cssText = `
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px 4px;
      cursor: grab;
      background: ${_scHdrBg};
      border-radius: ${styleSettings.borderRadius}px ${styleSettings.borderRadius}px 0 0;
      border-bottom: 1px solid ${_scHdrBd};
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 1;
    `;

    let _sfDragging = false, _sfOx = 0, _sfOy = 0;
    styleConfigHeaderRow.addEventListener("mousedown", (e) => {
      if (e.target.tagName === "BUTTON" || e.target.tagName === "SELECT") return;
      _sfDragging = true;
      _sfOx = e.clientX - styleConfigWrap.getBoundingClientRect().left;
      _sfOy = e.clientY - styleConfigWrap.getBoundingClientRect().top;
      styleConfigHeaderRow.style.cursor = "grabbing";
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!_sfDragging) return;
      const nx = Math.max(0, Math.min(e.clientX - _sfOx, window.innerWidth  - styleConfigWrap.offsetWidth));
      const ny = Math.max(0, Math.min(e.clientY - _sfOy, window.innerHeight - styleConfigWrap.offsetHeight));
      styleConfigWrap.style.left  = nx + "px";
      styleConfigWrap.style.top   = ny + "px";
      styleConfigWrap.style.right = "auto";
    });
    document.addEventListener("mouseup", () => {
      if (_sfDragging) {
        _sfDragging = false;
        styleConfigHeaderRow.style.cursor = "grab";
        GM_setValue("styleFloatPos", {
          top:  styleConfigWrap.style.top,
          left: styleConfigWrap.style.left,
        });
      }
    });

    const styleFloatBody = document.createElement("div");
    styleFloatBody.style.padding = "6px";

    if (!GM_getValue("hideLockHintBanner", false)) {
      const lockHintBanner = document.createElement("div");
      lockHintBanner.style.cssText = `
        background: ${panelTheme === "dark" ? "#332b00" : "#fff8d6"};
        color: ${panelTheme === "dark" ? "#ffda33" : "#997300"};
        border: 1px dashed ${panelTheme === "dark" ? "#806600" : "#ffe066"};
        border-radius: ${styleSettings.borderRadius}px;
        padding: 6px 8px;
        margin-bottom: 8px;
        font-size: 11px;
        line-height: 1.4;
        display: flex;
        align-items: flex-start; 
        gap: 6px;
      `;

      const iconSpan = document.createElement("span");
      iconSpan.textContent = "📌";
      iconSpan.style.flexShrink = "0";

      const textSpan = document.createElement("span");
      textSpan.style.flex = "1";
      const lockHints = {
        en:    { bold: "Editing Mode:",  rest: " Panel pinned for preview. Close to resume." },
        zh_TW: { bold: "編輯模式：",     rest: "主面板已鎖定以便預覽，關閉此視窗即可恢復。" },
        zh_CN: { bold: "编辑模式：",     rest: "主面板已锁定以便预览，关闭此窗口即可恢复。" },
        ja:    { bold: "編集モード：",   rest: "プレビュー用に固定中。閉じることで通常操作に戻ります。" },
        ko:    { bold: "편집 모드：",    rest: "미리보기를 위해 고정됨. 정상 작동으로 돌아가려면 닫아주세요." },
      };
      const _hint = lockHints[lang] || lockHints["zh_TW"];
      const _boldEl = document.createElement("b");
      _boldEl.textContent = _hint.bold;
      textSpan.appendChild(_boldEl);
      textSpan.appendChild(document.createTextNode(_hint.rest));

      const closeBannerBtn = document.createElement("button");
      closeBannerBtn.textContent = "✕";
      closeBannerBtn.title = t.close || "Close";
      closeBannerBtn.style.cssText = `
        background: transparent;
        border: none;
        cursor: pointer;
        color: inherit;
        opacity: 0.5;
        font-size: 12px;
        padding: 0 2px;
        line-height: 1.2;
        flex-shrink: 0;
        transition: opacity 0.2s;
      `;
      closeBannerBtn.onmouseover = () => closeBannerBtn.style.opacity = "1";
      closeBannerBtn.onmouseout = () => closeBannerBtn.style.opacity = "0.5";
      closeBannerBtn.onclick = () => {
        lockHintBanner.remove();
        GM_setValue("hideLockHintBanner", true);
      };

      lockHintBanner.appendChild(iconSpan);
      lockHintBanner.appendChild(textSpan);
      lockHintBanner.appendChild(closeBannerBtn);

      styleFloatBody.appendChild(lockHintBanner);
    }

    const sfDragHandle = document.createElement("div");
    sfDragHandle.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 4px);
      grid-template-rows: repeat(3, 4px);
      gap: 2px;
      padding: 2px 4px 2px 2px;
      flex-shrink: 0;
      cursor: grab;
      opacity: 0.45;
    `;
    for (let _i = 0; _i < 9; _i++) {
      const dot = document.createElement("div");
      dot.style.cssText = `
        width: 3px; height: 3px;
        border-radius: 50%;
        background: ${panelTheme === "dark" ? "#ccc" : "#666"};
      `;
      sfDragHandle.appendChild(dot);
    }
    sfDragHandle.onmouseover = () => sfDragHandle.style.opacity = "0.85";
    sfDragHandle.onmouseout  = () => sfDragHandle.style.opacity = "0.45";

    const styleConfigHeader = document.createElement("div");
    styleConfigHeader.textContent = t.styleConfig || "樣式設定";
    styleConfigHeader.style.cssText = "font-weight:bold; flex:1;";
    styleConfigHeaderRow.appendChild(sfDragHandle);
    styleConfigHeaderRow.appendChild(styleConfigHeader);

    const themeSelect = document.createElement("select");
    themeSelect.style.width = "100px";
    Object.entries(t.themeOptions || {}).forEach(([key, value]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = value;
      if (styleSettings.theme === key) option.selected = true;
      themeSelect.appendChild(option);
    });
    themeSelect.onchange = () => {
      styleSettings.theme = themeSelect.value;
      panelTheme = styleSettings.theme;
      customThemeContainer.style.display =
        styleSettings.theme === "custom" ? "flex" : "none";
      save();
      applyTheme(panelTheme);
      rebuildPanel();
    };
    styleConfigHeaderRow.appendChild(themeSelect);

    const resetStylesBtn = document.createElement("button");
    resetStylesBtn.textContent = t.resetStyles || "重置樣式 🔄";
    resetStylesBtn.style.padding = "4px 8px";
    resetStylesBtn.style.borderRadius = styleSettings.borderRadius + "px";
    resetStylesBtn.style.border = `1px solid ${panelTheme === "dark" ? "#555" : "#ccc"}`;
    resetStylesBtn.style.cursor = "pointer";
    resetStylesBtn.style.whiteSpace = "nowrap";
    resetStylesBtn.onclick = () => {
      showCustomPrompt(
        t.resetStylesConfirm || "確定要重置所有樣式設定嗎？\n（面板佈局、字體、透明度等全部恢復預設值）",
        null,
        () => {
          _doResetStyles();
        },
        null,
        true,
        true
      );
    };
    function _doResetStyles() {
      const currentBackgroundImage = styleSettings.backgroundImage;
      styleSettings = {
        theme: "light",
        style: "default",
        borderRadius: 6,
        contrast: 0,
        opacity: 0.9,
        groupOpacity: 1.0,
        textOpacityCompensation: 1.0,
        buttonOpacity: 1.0,
        fontSize: 12,
        backgroundImage: currentBackgroundImage,
        imageMode: "center",
        imageOffsetX: 0,
        imageOffsetY: 0,
        imageScale: 1.0,
        imageOpacity: 1.0,
        customBackgroundColor: "#ffffff",
        customTextColor: "#000000",
        customButtonBg: "#f5f5f5",
        groupBackgroundColor: "",
        enableOverlayDarkening: false,
        overlayStrength: 0.5,
        textBackgroundColor: "",
        textBorder: false,
        panelTop:       80,
        panelRight:     20,
        panelLeft:      -1,
        panelWidth:     0,
        panelMaxHeight: 87,
        panelUserSized: false,
        multiSelectColor:   "#ffc400",
        multiSelectOpacity: 0.85,
        siteButtonWidth: 0,
        hideSyntaxBtn:    false,
        hideBlacklistBtn: false,
        isExpanded:       false,
        iconStyle:          "emoji",
        toggleBtnBg:        "",
        toggleBtnBgOpacity: 0,
        svgIconColor:       "",
        enableBorderGlow:    false,
        borderGlowColor:    "#00bfff",
        borderGlowStrength:  12,
        borderGlowInset:     true,
        enableSheen:         false,
        sheenAngle:          135,
        sheenOpacity:        0.08,
        enableSiteGlow:      false,
        enableGroupGlow:     false,
        searchBarBg:             "",
        searchBarBgOpacity:      0,
        searchBarFg:             "",
        searchBarGlowEnabled:    false,
        searchBarGlowColor:      "#5599ff",
        searchBarGlowStrength:   6,
      };
      save();
      applyTheme(panelTheme);
      rebuildPanel();
      requestAnimationFrame(() => {
        const _rp = document.getElementById("site-group-panel");
        if (_rp) {
          const _w = getEffectivePanelWidth();
          _rp.style.width    = _w + "px";
          _rp.style.maxWidth = _w + "px";
        }
      });
      showToast(t.resetStylesSuccess || "樣式已重置！");
    }
    styleConfigHeaderRow.appendChild(resetStylesBtn);

    const sfCloseBtn = document.createElement("button");
    sfCloseBtn.id = "sf-close-btn";
    sfCloseBtn.textContent = "✕";
    sfCloseBtn.title = t.close || "Close";
    sfCloseBtn.style.cssText = `
      background: ${panelTheme === "dark" ? "#4a1919" : "#ffeeee"};
      border: 1px solid ${panelTheme === "dark" ? "#802b2b" : "#ffb3b3"};
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      padding: 3px 10px;
      line-height: 1;
      color: ${panelTheme === "dark" ? "#ff8080" : "#d93025"};
      font-weight: bold;
      flex-shrink: 0;
      margin-left: 4px;
      transition: all 0.2s ease;
    `;
    sfCloseBtn.onmouseover = () => {
      sfCloseBtn.style.background = panelTheme === "dark" ? "#802b2b" : "#ffcccc";
      sfCloseBtn.style.color = panelTheme === "dark" ? "#fff" : "#a50e0e";
      sfCloseBtn.style.borderColor = panelTheme === "dark" ? "#ff4d4d" : "#ff8080";
    };
    sfCloseBtn.onmouseout = () => {
      sfCloseBtn.style.background = panelTheme === "dark" ? "#4a1919" : "#ffeeee";
      sfCloseBtn.style.color = panelTheme === "dark" ? "#ff8080" : "#d93025";
      sfCloseBtn.style.borderColor = panelTheme === "dark" ? "#802b2b" : "#ffb3b3";
    };
    sfCloseBtn.onclick = () => {
      searchConfig.isExpanded = false;
      save();
      styleConfigWrap.style.display = "none";
      expandCollapseBtn.textContent = t.expand;
    };
    styleConfigHeaderRow.appendChild(sfCloseBtn);

    styleConfigWrap.appendChild(styleConfigHeaderRow);
    styleConfigWrap.appendChild(styleFloatBody);

    const styleConfigContent = document.createElement("div");
    styleConfigContent.style.display = "flex";
    styleConfigContent.style.flexDirection = "column";
    styleConfigContent.style.gap = "6px";
    styleFloatBody.appendChild(styleConfigContent);

    const STYLE_DEFAULTS = {
      borderRadius: 6,
      contrast: 0,
      opacity: 0.9,
      groupOpacity: 1.0,
      buttonOpacity: 1.0,
      textOpacityCompensation: 1.0,
      fontSize: 12,
      imageOffsetX: 0,
      imageOffsetY: 0,
      imageScale: 1.0,
      imageOpacity: 1.0,
      overlayStrength: 0.5,
      panelTop: 80,
      panelRight: 20,
      panelWidth: 0,
      panelMaxHeight: 87,
      siteButtonWidth: 0,
      hideSyntaxBtn: false,
      hideBlacklistBtn: false,
      iconStyle: "emoji",
      toggleBtnBg: "",
      toggleBtnBgOpacity: 0,
      svgIconColor: "",
    };

    function rowCss() {
      return "display: flex; align-items: center; margin-bottom: 6px; width: 100%; justify-content: space-between;";
    }

    function labelCss() {
      return "width: 85px; flex-shrink: 0; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";
    }

    function sliderCss() {
      return "flex: 1; min-width: 60px; margin: 0 6px;";
    }

    function makeValueSpan(val) {
      const span = document.createElement("span");
      span.textContent = val;
      span.style.cssText = "width: 40px; text-align: right; font-size: 11px; flex-shrink: 0;";
      return span;
    }

    function makeResetBtn(defaultVal, callback) {
      const btn = document.createElement("button");
      btn.textContent = "↺";
      btn.title = "重置為預設值";
      btn.style.cssText = "background: transparent; border: none; cursor: pointer; padding: 0 4px; font-size: 14px; margin-left: 2px; flex-shrink: 0; color: inherit; opacity: 0.7;";
      btn.onmouseover = () => btn.style.opacity = "1";
      btn.onmouseout = () => btn.style.opacity = "0.7";
      btn.onclick = (e) => {
        e.preventDefault();
        callback(defaultVal);
      };
      return btn;
    }

    const panelLayoutContainer = document.createElement("div");
    panelLayoutContainer.style.border = `1px solid ${panelTheme === "dark" ? "#555" : "#ccc"}`;
    panelLayoutContainer.style.borderRadius = styleSettings.borderRadius + "px";
    panelLayoutContainer.style.padding = "6px";
    panelLayoutContainer.style.display = "flex";
    panelLayoutContainer.style.flexDirection = "column";
    panelLayoutContainer.style.gap = "0";
    panelLayoutContainer.style.maxWidth = "490px";

    const panelLayoutHeader = document.createElement("div");
    panelLayoutHeader.textContent = t.panelLayout || "面板佈局";
    panelLayoutHeader.style.cssText = "font-weight:bold; margin-bottom:4px; font-size:11px;";
    panelLayoutContainer.appendChild(panelLayoutHeader);

    function makeNumRow(labelText, key, min, max, step, unit, defaultVal) {
      const row = document.createElement("div");
      row.style.cssText = rowCss();
      const lbl = document.createElement("label");
      lbl.textContent = labelText;
      lbl.style.cssText = labelCss();
      row.appendChild(lbl);
      const inp = document.createElement("input");
      inp.type = "number";
      inp.min = min; inp.max = max; inp.step = step;
      inp.value = styleSettings[key] ?? defaultVal;
      inp.style.cssText = "flex:1; min-width:50px; margin:0 6px; padding:2px 4px; box-sizing:border-box;";
      const unitSpan = document.createElement("span");
      unitSpan.textContent = unit;
      unitSpan.style.cssText = "width:28px; font-size:11px; flex-shrink:0; text-align:left;";
      inp.oninput = () => {
        const v = parseFloat(inp.value);
        if (!isNaN(v)) {
          styleSettings[key] = v;
          save();
          const p = document.getElementById("site-group-panel");
          if (!p) return;
          if (key === "panelTop")    p.style.top  = v + "px";
          if (key === "panelRight") {
            const _w = parseInt(p.style.width) || getEffectivePanelWidth();
            const _newLeft = Math.max(8, window.innerWidth - v - _w);
            p.style.left = _newLeft + "px";
            p.style.right = "auto";
            styleSettings.panelLeft = _newLeft;
            save();
          }
          if (key === "panelWidth") { const _w = v > 0 ? v : getEffectivePanelWidth(); p.style.width = _w + "px"; p.style.maxWidth = _w + "px"; }
          if (key === "panelMaxHeight") p.style.maxHeight = v + "vh";
        }
      };
      const resetBtn = makeResetBtn(defaultVal, (dv) => {
        inp.value = dv;
        styleSettings[key] = dv;
        save();
        const p = document.getElementById("site-group-panel");
        if (!p) return;
        if (key === "panelTop")    p.style.top  = dv + "px";
        if (key === "panelRight") {
          const _w = parseInt(p.style.width) || getEffectivePanelWidth();
          const _newLeft = Math.max(8, window.innerWidth - dv - _w);
          p.style.left = _newLeft + "px";
          p.style.right = "auto";
          styleSettings.panelLeft = _newLeft;
          save();
        }
        if (key === "panelWidth") { const _dw = dv > 0 ? dv : getEffectivePanelWidth(); p.style.width = _dw + "px"; p.style.maxWidth = _dw + "px"; }
        if (key === "panelMaxHeight") p.style.maxHeight = dv + "vh";
      });
      row.appendChild(inp);
      row.appendChild(unitSpan);
      row.appendChild(resetBtn);
      return row;
    }

    panelLayoutContainer.appendChild(makeNumRow(t.panelTopLabel    || "距頂部",   "panelTop",       0, 2000, 1,  "px", 80));
    panelLayoutContainer.appendChild(makeNumRow(t.panelRightLabel  || "距右側",   "panelRight",     0, 2000, 1,  "px", 20));

    (function() {
      const _localeW = langWidths[lang] || 410;
      const _initW   = styleSettings.panelWidth > 0 ? styleSettings.panelWidth : _localeW;
      const row = document.createElement("div");
      row.style.cssText = rowCss();
      const lbl = document.createElement("label");
      lbl.textContent = t.panelWidthLabel || "最大寬度";
      lbl.style.cssText = labelCss();
      row.appendChild(lbl);
      const inp = document.createElement("input");
      inp.type = "number"; inp.min = 200; inp.max = 2000; inp.step = 10;
      inp.value = _initW;
      inp.style.cssText = "flex:1; min-width:50px; margin:0 6px; padding:2px 4px; box-sizing:border-box;";
      const unitSpan = document.createElement("span");
      unitSpan.textContent = "px";
      unitSpan.style.cssText = "width:28px; font-size:11px; flex-shrink:0; text-align:left;";
      inp.oninput = () => {
        const v = parseInt(inp.value, 10);
        if (!isNaN(v) && v >= 200) {
          styleSettings.panelWidth = (v === _localeW) ? 0 : v;
          save();
          const p = document.getElementById("site-group-panel");
          if (p) { p.style.width = v + "px"; p.style.maxWidth = v + "px"; }
        }
      };
      const resetBtn = makeResetBtn(_localeW, (dv) => {
        inp.value = dv;
        styleSettings.panelWidth = 0;
        save();
        const p = document.getElementById("site-group-panel");
        if (p) { p.style.width = dv + "px"; p.style.maxWidth = dv + "px"; }
      });
      row.appendChild(inp); row.appendChild(unitSpan); row.appendChild(resetBtn);
      panelLayoutContainer.appendChild(row);
    })();

    panelLayoutContainer.appendChild(makeNumRow(t.panelHeightLabel || "最大高度", "panelMaxHeight", 10, 100,  1,  "vh", 87));

    const widthHint = document.createElement("div");
    widthHint.textContent = t.panelWidthHint || "↺ 重置 = 恢復語系預設寬度";
    widthHint.style.cssText = `font-size:10px; color:${panelTheme === "dark" ? "#aaa" : "#888"}; margin-top:2px; padding-left:4px;`;
    panelLayoutContainer.appendChild(widthHint);

    (function() {
      const row = document.createElement("div");
      row.style.cssText = "display:flex; align-items:center; gap:6px; margin-top:6px; padding-left:2px;";
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.id = "hide-syntax-btn-chk";
      chk.checked = !!styleSettings.hideSyntaxBtn;
      chk.style.cssText = "cursor:pointer; flex-shrink:0;";
      const lbl = document.createElement("label");
      lbl.htmlFor = "hide-syntax-btn-chk";
      lbl.textContent = t.hideSyntaxBtnLabel || "隱藏 📖 語法說明按鈕";
      lbl.style.cssText = "cursor:pointer; font-size:12px; user-select:none; flex:1;";
      chk.onchange = () => {
        styleSettings.hideSyntaxBtn = chk.checked;
        save();
        const btn = document.getElementById("syntax-help-btn");
        if (btn) btn.style.display = chk.checked ? "none" : "";
      };
      const _openSyntax = document.createElement("button");
      _openSyntax.textContent = "📖";
      _openSyntax.title = t.syntaxHelp || "Search Syntax Reference";
      _openSyntax.style.cssText = `
        padding:1px 6px; border-radius:4px; cursor:pointer; flex-shrink:0;
        border:1px solid ${panelTheme === "dark" ? "#555" : "#ccc"};
        background:transparent; font-size:12px; line-height:1.6;
        transition:background .15s;
      `;
      _openSyntax.addEventListener("mouseenter", () => {
        _openSyntax.style.background = panelTheme === "dark" ? "#333" : "#f0f0f0";
      });
      _openSyntax.addEventListener("mouseleave", () => {
        _openSyntax.style.background = "transparent";
      });
      _openSyntax.addEventListener("click", (e) => {
        e.stopPropagation();
        showSyntaxPanel();
      });
      row.appendChild(chk);
      row.appendChild(lbl);
      row.appendChild(_openSyntax);
      panelLayoutContainer.appendChild(row);
    })();

    (function() {
      const row = document.createElement("div");
      row.style.cssText = "display:flex; align-items:center; gap:6px; margin-top:4px; padding-left:2px;";
      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.id = "hide-blacklist-btn-chk";
      chk.checked = !!styleSettings.hideBlacklistBtn;
      chk.style.cssText = "cursor:pointer; flex-shrink:0;";
      const lbl = document.createElement("label");
      lbl.htmlFor = "hide-blacklist-btn-chk";
      lbl.textContent = t.hideBlacklistBtnLabel || "隱藏 🚫 黑名單按鈕";
      lbl.style.cssText = "cursor:pointer; font-size:12px; user-select:none; flex:1;";
      chk.onchange = () => {
        styleSettings.hideBlacklistBtn = chk.checked;
        save();
        const btn = document.getElementById("blacklist-btn");
        if (btn) btn.style.display = chk.checked ? "none" : "";
      };
      const _openBl = document.createElement("button");
      _openBl.textContent = "🚫";
      _openBl.title = t.blacklistTitle || "Domain Blacklist";
      _openBl.style.cssText = `
        padding:1px 6px; border-radius:4px; cursor:pointer; flex-shrink:0;
        border:1px solid ${panelTheme === "dark" ? "#555" : "#ccc"};
        background:transparent; font-size:12px; line-height:1.6;
        transition:background .15s;
      `;
      _openBl.addEventListener("mouseenter", () => {
        _openBl.style.background = panelTheme === "dark" ? "#333" : "#f0f0f0";
      });
      _openBl.addEventListener("mouseleave", () => {
        _openBl.style.background = "transparent";
      });
      _openBl.addEventListener("click", (e) => {
        e.stopPropagation();
        showBlacklistDialog();
      });
      row.appendChild(chk);
      row.appendChild(lbl);
      row.appendChild(_openBl);
      panelLayoutContainer.appendChild(row);
    })();

    const generalStyleContainer = document.createElement("div");
    generalStyleContainer.style.border = `1px solid ${panelTheme === "dark" ? "#555" : "#ccc"}`;
    generalStyleContainer.style.borderRadius =
      styleSettings.borderRadius + "px";
    generalStyleContainer.style.padding = "6px";
    generalStyleContainer.style.display = "flex";
    generalStyleContainer.style.flexDirection = "column";
    generalStyleContainer.style.gap = "0";
    generalStyleContainer.style.maxWidth = "490px";

    const generalStyleHeader = document.createElement("div");
    generalStyleHeader.textContent = t.style || "整體樣式";
    generalStyleHeader.style.cssText = "font-weight:bold; margin-bottom:4px; font-size:11px;";
    generalStyleContainer.appendChild(generalStyleHeader);

    const styleRow = document.createElement("div");
    styleRow.style.cssText = rowCss();

    const styleLabel = document.createElement("label");
    styleLabel.textContent = t.style || "風格";
    styleLabel.style.cssText = labelCss();
    styleRow.appendChild(styleLabel);

    const styleSelect = document.createElement("select");
    styleSelect.style.width = "100px";
    Object.entries(t.styleOptions || {}).forEach(([key, value]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = value;
      if (styleSettings.style === key) option.selected = true;
      styleSelect.appendChild(option);
    });
    styleSelect.onchange = () => {
      styleSettings.style = styleSelect.value;
      Object.assign(styleSettings, STYLE_PRESETS[styleSettings.style] || {});
      save();
      applyTheme(panelTheme);
      rebuildPanel();
    };
    styleRow.appendChild(styleSelect);
    generalStyleContainer.appendChild(styleRow);

    let _qsHeader;
    {
      const _qsDark = panelTheme === "dark";
      const _qsContainer = document.createElement("div");
      _qsContainer.style.cssText = `
        border:1px solid ${_qsDark ? "#555" : "#ccc"};
        border-radius:${styleSettings.borderRadius}px;
        padding:6px 8px; display:none; flex-direction:column; gap:4px; margin-top:0;
      `;
      _qsHeader = document.createElement("div");
      _qsHeader.textContent = t.quickSchemeLabel || "🎨 Quick Scheme";
      _qsHeader.style.cssText = "font-weight:bold; font-size:11px; margin-bottom:2px;";
      _qsContainer.appendChild(_qsHeader);

      const _qsRow = document.createElement("div");
      _qsRow.style.cssText = "display:flex; gap:5px; flex-wrap:wrap;";

      const _SCHEMES = {
        light: {
          panelTheme:        "light",
          searchBarBg:       "#ffffff",
          searchBarBgOpacity: 0.85,
          searchBarFg:       "#111111",
          customBackgroundColor: "#ffffff",
          customTextColor:   "#111111",
          customButtonBg:    "#f0f0f0",
        },
        dark: {
          panelTheme:        "dark",
          searchBarBg:       "#1a1a1a",
          searchBarBgOpacity: 0.75,
          searchBarFg:       "#eeeeee",
          customBackgroundColor: "#1e1e1e",
          customTextColor:   "#eeeeee",
          customButtonBg:    "#3c3c3c",
        },
        reset: null,
      };

      const _qsDefs = [
      ];

      _qsDefs.forEach(def => {
        const pb = document.createElement("button");
        pb.textContent = def.label;
        pb.title = def.label;
        pb.className = "icon-btn";
        pb.style.cssText = `flex:1; padding:3px 6px; border-radius:5px; font-size:11px;
          cursor:pointer; white-space:nowrap;
          background:${_qsDark ? "#4a4a4a" : "#eee"};
          border:1px solid ${_qsDark ? "#666" : "#ccc"}; color:inherit;`;
        pb.onclick = () => {
          if (def.key === "reset") {
            styleSettings.searchBarBg        = "";
            styleSettings.searchBarBgOpacity = 0;
            styleSettings.searchBarFg        = "";
            styleSettings.searchBarGlowEnabled = false;
          } else {
            const s = _SCHEMES[def.key];
            styleSettings.searchBarBg        = s.searchBarBg;
            styleSettings.searchBarBgOpacity = s.searchBarBgOpacity;
            styleSettings.searchBarFg        = s.searchBarFg;
            if (panelTheme === "custom") {
              styleSettings.customBackgroundColor = s.customBackgroundColor;
              styleSettings.customTextColor       = s.customTextColor;
              styleSettings.customButtonBg        = s.customButtonBg;
            }
          }
          save();
          applyTheme(panelTheme);
        };
        _qsRow.appendChild(pb);
      });

      _qsContainer.appendChild(_qsRow);
      generalStyleContainer.appendChild(_qsContainer);
    }

    const borderRadiusRow = document.createElement("div");
    borderRadiusRow.style.cssText = rowCss();

    const borderRadiusLabel = document.createElement("label");
    borderRadiusLabel.textContent = t.borderRadius || "圓角";
    borderRadiusLabel.style.cssText = labelCss();
    borderRadiusRow.appendChild(borderRadiusLabel);

    const borderRadiusInput = document.createElement("input");
    borderRadiusInput.type = "range";
    borderRadiusInput.min = "0";
    borderRadiusInput.max = "20";
    borderRadiusInput.value = styleSettings.borderRadius;
    borderRadiusInput.style.cssText = sliderCss();
    borderRadiusInput.oninput = () => {
      styleSettings.borderRadius = parseInt(borderRadiusInput.value);
      save();
      _debouncedApply();
      _vs_borderRadiusInput.textContent = borderRadiusInput.value+"px";
    };
    const _vs_borderRadiusInput = makeValueSpan(borderRadiusInput.value+"px");
    const _rb_borderRadiusInput = makeResetBtn(STYLE_DEFAULTS.borderRadius, (dv) => {
      borderRadiusInput.value = dv;
      styleSettings.borderRadius = dv;
      _vs_borderRadiusInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    borderRadiusRow.appendChild(borderRadiusInput);
    borderRadiusRow.appendChild(_vs_borderRadiusInput);
    borderRadiusRow.appendChild(_rb_borderRadiusInput);
    generalStyleContainer.appendChild(borderRadiusRow);

    const contrastRow = document.createElement("div");
    contrastRow.style.cssText = rowCss();

    const contrastLabel = document.createElement("label");
    contrastLabel.textContent = t.contrast || "對比度";
    contrastLabel.style.cssText = labelCss();
    contrastRow.appendChild(contrastLabel);

    const contrastInput = document.createElement("input");
    contrastInput.type = "range";
    contrastInput.min = "-50";
    contrastInput.max = "50";
    contrastInput.value = styleSettings.contrast;
    contrastInput.style.cssText = sliderCss();
    contrastInput.oninput = () => {
      styleSettings.contrast = parseInt(contrastInput.value);
      save();
      _debouncedApply();
      _vs_contrastInput.textContent = contrastInput.value;
    };
    const _vs_contrastInput = makeValueSpan(contrastInput.value);
    const _rb_contrastInput = makeResetBtn(STYLE_DEFAULTS.contrast, (dv) => {
      contrastInput.value = dv;
      styleSettings.contrast = dv;
      _vs_contrastInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    contrastRow.appendChild(contrastInput);
    contrastRow.appendChild(_vs_contrastInput);
    contrastRow.appendChild(_rb_contrastInput);
    generalStyleContainer.appendChild(contrastRow);

    const opacityRow = document.createElement("div");
    opacityRow.style.cssText = rowCss();

    const opacityLabel = document.createElement("label");
    opacityLabel.textContent = t.opacity || "面板透明度";
    opacityLabel.style.cssText = labelCss();
    opacityRow.appendChild(opacityLabel);

    const opacityInput = document.createElement("input");
    opacityInput.type = "range";
    opacityInput.min = "0.3";
    opacityInput.max = "1";
    opacityInput.step = "0.1";
    opacityInput.value = styleSettings.opacity;
    opacityInput.style.cssText = sliderCss();
    opacityInput.oninput = () => {
      styleSettings.opacity = parseFloat(opacityInput.value);
      save();
      _debouncedApply();
      _vs_opacityInput.textContent = parseFloat(opacityInput.value).toFixed(1);
    };
    const _vs_opacityInput = makeValueSpan(parseFloat(opacityInput.value).toFixed(1));
    const _rb_opacityInput = makeResetBtn(STYLE_DEFAULTS.opacity, (dv) => {
      opacityInput.value = dv;
      styleSettings.opacity = dv;
      _vs_opacityInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    opacityRow.appendChild(opacityInput);
    opacityRow.appendChild(_vs_opacityInput);
    opacityRow.appendChild(_rb_opacityInput);
    generalStyleContainer.appendChild(opacityRow);

    const groupOpacityRow = document.createElement("div");
    groupOpacityRow.style.cssText = rowCss();

    const groupOpacityLabel = document.createElement("label");
    groupOpacityLabel.textContent = t.groupOpacity || "群組透明度";
    groupOpacityLabel.style.cssText = labelCss();
    groupOpacityRow.appendChild(groupOpacityLabel);

    const groupOpacityInput = document.createElement("input");
    groupOpacityInput.type = "range";
    groupOpacityInput.min = "0.3";
    groupOpacityInput.max = "1";
    groupOpacityInput.step = "0.1";
    groupOpacityInput.value = styleSettings.groupOpacity;
    groupOpacityInput.style.cssText = sliderCss();
    groupOpacityInput.oninput = () => {
      styleSettings.groupOpacity = parseFloat(groupOpacityInput.value);
      save();
      _debouncedApply();
      _vs_groupOpacityInput.textContent = parseFloat(groupOpacityInput.value).toFixed(1);
    };
    const _vs_groupOpacityInput = makeValueSpan(parseFloat(groupOpacityInput.value).toFixed(1));
    const _rb_groupOpacityInput = makeResetBtn(STYLE_DEFAULTS.groupOpacity, (dv) => {
      groupOpacityInput.value = dv;
      styleSettings.groupOpacity = dv;
      _vs_groupOpacityInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    groupOpacityRow.appendChild(groupOpacityInput);
    groupOpacityRow.appendChild(_vs_groupOpacityInput);
    groupOpacityRow.appendChild(_rb_groupOpacityInput);
    generalStyleContainer.appendChild(groupOpacityRow);

    const buttonOpacityRow = document.createElement("div");
    buttonOpacityRow.style.cssText = rowCss();

    const buttonOpacityLabel = document.createElement("label");
    buttonOpacityLabel.textContent = t.buttonOpacity || "按鈕透明度";
    buttonOpacityLabel.style.cssText = labelCss();
    buttonOpacityRow.appendChild(buttonOpacityLabel);

    const buttonOpacityInput = document.createElement("input");
    buttonOpacityInput.type = "range";
    buttonOpacityInput.min = "0.3";
    buttonOpacityInput.max = "1";
    buttonOpacityInput.step = "0.1";
    buttonOpacityInput.value = styleSettings.buttonOpacity;
    buttonOpacityInput.style.cssText = sliderCss();
    buttonOpacityInput.oninput = () => {
      styleSettings.buttonOpacity = parseFloat(buttonOpacityInput.value);
      save();
      _debouncedApply();
      _vs_buttonOpacityInput.textContent = parseFloat(buttonOpacityInput.value).toFixed(1);
    };
    const _vs_buttonOpacityInput = makeValueSpan(parseFloat(buttonOpacityInput.value).toFixed(1));
    const _rb_buttonOpacityInput = makeResetBtn(STYLE_DEFAULTS.buttonOpacity, (dv) => {
      buttonOpacityInput.value = dv;
      styleSettings.buttonOpacity = dv;
      _vs_buttonOpacityInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    buttonOpacityRow.appendChild(buttonOpacityInput);
    buttonOpacityRow.appendChild(_vs_buttonOpacityInput);
    buttonOpacityRow.appendChild(_rb_buttonOpacityInput);
    generalStyleContainer.appendChild(buttonOpacityRow);

    const siteButtonWidthRow = document.createElement("div");
    siteButtonWidthRow.style.cssText = rowCss();
    const siteButtonWidthLabel = document.createElement("label");
    siteButtonWidthLabel.textContent = t.siteButtonWidth || "站點按鈕寬度";
    siteButtonWidthLabel.style.cssText = labelCss();
    siteButtonWidthRow.appendChild(siteButtonWidthLabel);
    const siteButtonWidthInput = document.createElement("input");
    siteButtonWidthInput.type = "range";
    siteButtonWidthInput.min = 0;
    siteButtonWidthInput.max = 110;
    siteButtonWidthInput.step = 4;
    siteButtonWidthInput.value = styleSettings.siteButtonWidth ?? 0;
    siteButtonWidthInput.style.cssText = sliderCss();
    const _vs_siteButtonWidth = makeValueSpan(
      (styleSettings.siteButtonWidth > 0 ? styleSettings.siteButtonWidth + "px" : (t.siteButtonWidthAuto || "Auto"))
    );
    siteButtonWidthInput.oninput = () => {
      const v = parseInt(siteButtonWidthInput.value, 10);
      styleSettings.siteButtonWidth = v;
      _vs_siteButtonWidth.textContent = v > 0 ? v + "px" : (t.siteButtonWidthAuto || "Auto");
      save();
      document.querySelectorAll(".site-container").forEach(sc => {
        const _minCell = v > 0 ? v : 104;
        sc.style.gridTemplateColumns = `repeat(auto-fill, minmax(${_minCell}px, 1fr))`;
      });
      document.querySelectorAll(".draggable-site").forEach(el => {
        if (v > 0) {
          el.style.width    = v + "px";
          el.style.maxWidth = v + "px";
          const lbl = el.querySelector(".site-label");
          if (lbl) lbl.style.display = v <= 28 ? "none" : "";
        } else {
          el.style.width    = "";
          el.style.maxWidth = "none";
          const lbl = el.querySelector(".site-label");
          if (lbl) lbl.style.display = "";
        }
      });
    };
    const _rb_siteButtonWidth = makeResetBtn(0, (dv) => {
      siteButtonWidthInput.value = dv;
      styleSettings.siteButtonWidth = dv;
      _vs_siteButtonWidth.textContent = t.siteButtonWidthAuto || "Auto";
      save();
      document.querySelectorAll(".site-container").forEach(sc => {
        sc.style.gridTemplateColumns = `repeat(auto-fill, minmax(104px, 1fr))`;
      });
      document.querySelectorAll(".draggable-site").forEach(el => {
        el.style.width    = "";
        el.style.maxWidth = "none";
        const lbl = el.querySelector(".site-label");
        if (lbl) lbl.style.display = "";
      });
    });
    siteButtonWidthRow.appendChild(siteButtonWidthInput);
    siteButtonWidthRow.appendChild(_vs_siteButtonWidth);
    siteButtonWidthRow.appendChild(_rb_siteButtonWidth);
    generalStyleContainer.appendChild(siteButtonWidthRow);

    const panelBgColorRow = document.createElement("div");
    panelBgColorRow.style.cssText = rowCss();
    const panelBgColorLabel = document.createElement("label");
    panelBgColorLabel.textContent = t.panelBgColor || "面板背景色";
    panelBgColorLabel.style.cssText = labelCss();
    panelBgColorRow.appendChild(panelBgColorLabel);
    const panelBgColorInput = document.createElement("input");
    panelBgColorInput.type = "color";
    panelBgColorInput.value = styleSettings.backgroundColor
      || (panelTheme === "dark" ? "#333333" : "#ffffff");
    panelBgColorInput.oninput = () => {
      styleSettings.backgroundColor = panelBgColorInput.value;
      save(); _debouncedApply();
    };
    const panelBgColorReset = makeResetBtn(
      panelTheme === "dark" ? "#333333" : "#ffffff",
      (dv) => {
        panelBgColorInput.value = dv;
        styleSettings.backgroundColor = dv;
        save(); applyTheme(panelTheme);
      }
    );
    panelBgColorRow.appendChild(panelBgColorInput);
    panelBgColorRow.appendChild(panelBgColorReset);
    generalStyleContainer.appendChild(panelBgColorRow);

    const panelBgAlphaRow = document.createElement("div");
    panelBgAlphaRow.style.cssText = rowCss();
    const panelBgAlphaLabel = document.createElement("label");
    panelBgAlphaLabel.textContent = t.panelBgAlpha || "背景透明度";
    panelBgAlphaLabel.style.cssText = labelCss();
    panelBgAlphaRow.appendChild(panelBgAlphaLabel);
    const panelBgAlphaInput = document.createElement("input");
    panelBgAlphaInput.type = "range";
    panelBgAlphaInput.min = "0.1";
    panelBgAlphaInput.max = "1";
    panelBgAlphaInput.step = "0.05";
    panelBgAlphaInput.value = styleSettings.opacity ?? 0.9;
    panelBgAlphaInput.style.cssText = sliderCss();
    const _vs_panelBgAlpha = makeValueSpan(
      parseFloat(panelBgAlphaInput.value).toFixed(2)
    );
    panelBgAlphaInput.oninput = () => {
      styleSettings.opacity = parseFloat(panelBgAlphaInput.value);
      _vs_panelBgAlpha.textContent = styleSettings.opacity.toFixed(2);
      save(); _debouncedApply();
    };
    const _rb_panelBgAlpha = makeResetBtn(0.9, (dv) => {
      panelBgAlphaInput.value = dv;
      styleSettings.opacity = dv;
      _vs_panelBgAlpha.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    panelBgAlphaRow.appendChild(panelBgAlphaInput);
    panelBgAlphaRow.appendChild(_vs_panelBgAlpha);
    panelBgAlphaRow.appendChild(_rb_panelBgAlpha);
    generalStyleContainer.appendChild(panelBgAlphaRow);

    const glowSection = document.createElement("div");
    glowSection.style.cssText = `
      border:1px solid ${panelTheme === "dark" ? "#555" : "#ccc"};
      border-radius:${styleSettings.borderRadius}px;
      padding:7px 8px; margin-top:6px; display:flex;
      flex-direction:column; gap:4px;
    `;
    const glowHeader = document.createElement("div");
    glowHeader.textContent = "✨ " + (t.glowLabel || "外框光澤 / 高光");
    glowHeader.style.cssText = "font-weight:bold; font-size:11px; margin-bottom:2px;";
    glowSection.appendChild(glowHeader);

    const glowToggleRow = document.createElement("div");
    glowToggleRow.style.cssText = rowCss();
    const glowToggleLbl = document.createElement("label");
    glowToggleLbl.textContent = t.enableBorderGlow || "外框光暈";
    glowToggleLbl.style.cssText = labelCss();
    glowToggleRow.appendChild(glowToggleLbl);
    const glowToggle = document.createElement("input");
    glowToggle.type = "checkbox";
    glowToggle.checked = !!styleSettings.enableBorderGlow;
    glowToggle.onchange = () => {
      styleSettings.enableBorderGlow = glowToggle.checked;
      save(); applyTheme(panelTheme);
    };
    glowToggleRow.appendChild(glowToggle);
    glowSection.appendChild(glowToggleRow);

    const glowColorRow = document.createElement("div");
    glowColorRow.style.cssText = rowCss();
    const glowColorLbl = document.createElement("label");
    glowColorLbl.textContent = t.borderGlowColor || "光暈顏色";
    glowColorLbl.style.cssText = labelCss();
    glowColorRow.appendChild(glowColorLbl);
    const glowColorInput = document.createElement("input");
    glowColorInput.type = "color";
    glowColorInput.value = styleSettings.borderGlowColor || "#00bfff";
    glowColorInput.oninput = () => {
      styleSettings.borderGlowColor = glowColorInput.value;
      save(); _debouncedApply();
    };
    const glowColorReset = makeResetBtn("#00bfff", (dv) => {
      glowColorInput.value = dv;
      styleSettings.borderGlowColor = dv;
      save(); applyTheme(panelTheme);
    });
    glowColorRow.appendChild(glowColorInput);
    glowColorRow.appendChild(glowColorReset);
    glowSection.appendChild(glowColorRow);

    const glowStrRow = document.createElement("div");
    glowStrRow.style.cssText = rowCss();
    const glowStrLbl = document.createElement("label");
    glowStrLbl.textContent = t.borderGlowStrength || "光暈強度";
    glowStrLbl.style.cssText = labelCss();
    glowStrRow.appendChild(glowStrLbl);
    const glowStrInput = document.createElement("input");
    glowStrInput.type = "range"; glowStrInput.min = "4"; glowStrInput.max = "32"; glowStrInput.step = "1";
    glowStrInput.value = styleSettings.borderGlowStrength || 12;
    glowStrInput.style.cssText = sliderCss();
    const _vs_glowStr = makeValueSpan(glowStrInput.value + "px");
    glowStrInput.oninput = () => {
      styleSettings.borderGlowStrength = parseInt(glowStrInput.value);
      _vs_glowStr.textContent = glowStrInput.value + "px";
      save(); _debouncedApply();
    };
    glowStrRow.appendChild(glowStrInput);
    glowStrRow.appendChild(_vs_glowStr);
    glowSection.appendChild(glowStrRow);

    const glowInsetRow = document.createElement("div");
    glowInsetRow.style.cssText = rowCss();
    const glowInsetLbl = document.createElement("label");
    glowInsetLbl.textContent = t.borderGlowInset || "內壁光";
    glowInsetLbl.style.cssText = labelCss();
    glowInsetRow.appendChild(glowInsetLbl);
    const glowInsetToggle = document.createElement("input");
    glowInsetToggle.type = "checkbox";
    glowInsetToggle.checked = styleSettings.borderGlowInset !== false;
    glowInsetToggle.onchange = () => {
      styleSettings.borderGlowInset = glowInsetToggle.checked;
      save(); applyTheme(panelTheme);
    };
    glowInsetRow.appendChild(glowInsetToggle);
    glowSection.appendChild(glowInsetRow);

    const sheenToggleRow = document.createElement("div");
    sheenToggleRow.style.cssText = rowCss() + "margin-top:4px;border-top:1px solid " +
      (panelTheme === "dark" ? "#444" : "#eee") + ";padding-top:5px;";
    const sheenToggleLbl = document.createElement("label");
    sheenToggleLbl.textContent = t.enableSheen || "高光光澤 (Sheen)";
    sheenToggleLbl.style.cssText = labelCss();
    sheenToggleRow.appendChild(sheenToggleLbl);
    const sheenToggle = document.createElement("input");
    sheenToggle.type = "checkbox";
    sheenToggle.checked = !!styleSettings.enableSheen;
    sheenToggle.onchange = () => {
      styleSettings.enableSheen = sheenToggle.checked;
      save(); applyTheme(panelTheme);
    };
    sheenToggleRow.appendChild(sheenToggle);
    glowSection.appendChild(sheenToggleRow);

    const sheenAngleRow = document.createElement("div");
    sheenAngleRow.style.cssText = rowCss();
    const sheenAngleLbl = document.createElement("label");
    sheenAngleLbl.textContent = t.sheenAngle || "光澤角度";
    sheenAngleLbl.style.cssText = labelCss();
    sheenAngleRow.appendChild(sheenAngleLbl);
    const sheenAngleInput = document.createElement("input");
    sheenAngleInput.type = "range"; sheenAngleInput.min = "0"; sheenAngleInput.max = "360"; sheenAngleInput.step = "5";
    sheenAngleInput.value = styleSettings.sheenAngle ?? 135;
    sheenAngleInput.style.cssText = sliderCss();
    const _vs_sheenAngle = makeValueSpan(sheenAngleInput.value + "°");
    sheenAngleInput.oninput = () => {
      styleSettings.sheenAngle = parseInt(sheenAngleInput.value);
      _vs_sheenAngle.textContent = sheenAngleInput.value + "°";
      save(); _debouncedApply();
    };
    sheenAngleRow.appendChild(sheenAngleInput);
    sheenAngleRow.appendChild(_vs_sheenAngle);
    glowSection.appendChild(sheenAngleRow);

    const sheenOpRow = document.createElement("div");
    sheenOpRow.style.cssText = rowCss();
    const sheenOpLbl = document.createElement("label");
    sheenOpLbl.textContent = t.sheenOpacity || "光澤強度";
    sheenOpLbl.style.cssText = labelCss();
    sheenOpRow.appendChild(sheenOpLbl);
    const sheenOpInput = document.createElement("input");
    sheenOpInput.type = "range"; sheenOpInput.min = "0.02"; sheenOpInput.max = "0.25"; sheenOpInput.step = "0.01";
    sheenOpInput.value = styleSettings.sheenOpacity ?? 0.08;
    sheenOpInput.style.cssText = sliderCss();
    const _vs_sheenOp = makeValueSpan(parseFloat(sheenOpInput.value).toFixed(2));
    sheenOpInput.oninput = () => {
      styleSettings.sheenOpacity = parseFloat(sheenOpInput.value);
      _vs_sheenOp.textContent = styleSettings.sheenOpacity.toFixed(2);
      save(); _debouncedApply();
    };
    sheenOpRow.appendChild(sheenOpInput);
    sheenOpRow.appendChild(_vs_sheenOp);
    glowSection.appendChild(sheenOpRow);

    const siteGlowRow = document.createElement("div");
    siteGlowRow.style.cssText = rowCss();
    const siteGlowLbl = document.createElement("label");
    siteGlowLbl.textContent = t.enableSiteGlow || "站台按鈕光暈";
    siteGlowLbl.style.cssText = labelCss();
    siteGlowRow.appendChild(siteGlowLbl);
    const siteGlowToggle = document.createElement("input");
    siteGlowToggle.type = "checkbox";
    siteGlowToggle.checked = !!styleSettings.enableSiteGlow;
    siteGlowToggle.oninput = () => {
      styleSettings.enableSiteGlow = siteGlowToggle.checked;
      save(); applyTheme(panelTheme);
    };
    const _rb_siteGlow = makeResetBtn(false, (dv) => {
      siteGlowToggle.checked = dv;
      styleSettings.enableSiteGlow = dv;
      save(); applyTheme(panelTheme);
    });
    siteGlowRow.appendChild(siteGlowToggle);
    siteGlowRow.appendChild(_rb_siteGlow);
    glowSection.appendChild(siteGlowRow);

    const groupGlowRow = document.createElement("div");
    groupGlowRow.style.cssText = rowCss();
    const groupGlowLbl = document.createElement("label");
    groupGlowLbl.textContent = t.enableGroupGlow || "群組區塊光暈";
    groupGlowLbl.style.cssText = labelCss();
    groupGlowRow.appendChild(groupGlowLbl);
    const groupGlowToggle = document.createElement("input");
    groupGlowToggle.type = "checkbox";
    groupGlowToggle.checked = !!styleSettings.enableGroupGlow;
    groupGlowToggle.oninput = () => {
      styleSettings.enableGroupGlow = groupGlowToggle.checked;
      save(); applyTheme(panelTheme);
    };
    const _rb_groupGlow = makeResetBtn(false, (dv) => {
      groupGlowToggle.checked = dv;
      styleSettings.enableGroupGlow = dv;
      save(); applyTheme(panelTheme);
    });
    groupGlowRow.appendChild(groupGlowToggle);
    groupGlowRow.appendChild(_rb_groupGlow);
    glowSection.appendChild(groupGlowRow);

    generalStyleContainer.appendChild(glowSection);

    const searchBarSection = document.createElement("div");
    searchBarSection.style.cssText = `
      border:1px solid ${panelTheme === "dark" ? "#555" : "#ccc"};
      border-radius:${styleSettings.borderRadius}px;
      padding:7px 8px; margin-top:6px; display:flex;
      flex-direction:column; gap:4px;
    `;
    const _sbsHeader = document.createElement("div");
    _sbsHeader.textContent = "🔍 " + (t.searchBarStyleLabel || "搜尋列樣式");
    _sbsHeader.style.cssText = "font-weight:bold; font-size:11px; margin-bottom:2px;";
    searchBarSection.appendChild(_sbsHeader);

    const _sbsPresetRow = document.createElement("div");
    _sbsPresetRow.style.cssText = rowCss();
    const _sbsPresetLbl = document.createElement("label");
    _sbsPresetLbl.textContent = t.searchBarPreset || "快速套色";
    _sbsPresetLbl.style.cssText = labelCss();
    _sbsPresetRow.appendChild(_sbsPresetLbl);
    const _presetBtnWrap = document.createElement("div");
    _presetBtnWrap.style.cssText = "display:flex;gap:4px;flex:1;justify-content:flex-end;";
    const _sbsPresets = [
      { icon:"↺",  title:"重置 / Reset",    bg:"",        bgOp:0,    fg:"" },
      { icon:"🌑",  title:"暗底 / Dark BG",  bg:"#1a1a1a", bgOp:0.75, fg:"#eeeeee" },
      { icon:"☀️",  title:"亮底 / Light BG", bg:"#ffffff", bgOp:0.85, fg:"#111111" },
    ];
    let _sbsBgInputRef, _sbsBgOpInputRef, _sbsBgOpSpanRef, _sbsFgInputRef;
    _sbsPresets.forEach(p => {
      const pb = document.createElement("button");
      pb.textContent = p.icon;
      pb.title = p.title;
      pb.className = "icon-btn";
      pb.style.cssText = `padding:2px 7px;border-radius:5px;font-size:12px;cursor:pointer;
        background:${panelTheme==="dark"?"#4a4a4a":"#eee"};
        border:1px solid ${panelTheme==="dark"?"#666":"#ccc"};color:inherit;`;
      pb.onclick = () => {
        styleSettings.searchBarBg        = p.bg;
        styleSettings.searchBarBgOpacity = p.bgOp;
        styleSettings.searchBarFg        = p.fg;
        if (_sbsBgInputRef)   _sbsBgInputRef.value   = p.bg  || "#333333";
        if (_sbsBgOpInputRef) _sbsBgOpInputRef.value  = p.bgOp;
        if (_sbsBgOpSpanRef)  _sbsBgOpSpanRef.textContent = p.bgOp.toFixed(2);
        if (_sbsFgInputRef)   _sbsFgInputRef.value    = p.fg  || "#eeeeee";
        save(); applyTheme(panelTheme);
      };
      _presetBtnWrap.appendChild(pb);
    });
    _sbsPresetRow.appendChild(_presetBtnWrap);
    searchBarSection.appendChild(_sbsPresetRow);

    const _sbsBgRow = document.createElement("div");
    _sbsBgRow.style.cssText = rowCss();
    const _sbsBgLbl = document.createElement("label");
    _sbsBgLbl.textContent = t.searchBarBgColor || "列背景色";
    _sbsBgLbl.style.cssText = labelCss();
    _sbsBgRow.appendChild(_sbsBgLbl);
    const sbsBgInput = document.createElement("input");
    sbsBgInput.type = "color";
    sbsBgInput.value = styleSettings.searchBarBg || "#333333";
    sbsBgInput.oninput = () => {
      styleSettings.searchBarBg = sbsBgInput.value;
      save(); _debouncedApply();
    };
    _sbsBgInputRef = sbsBgInput;
    const _rb_sbsBg = makeResetBtn("", (dv) => {
      sbsBgInput.value = dv || "#333333";
      styleSettings.searchBarBg = dv;
      save(); applyTheme(panelTheme);
    });
    _sbsBgRow.appendChild(sbsBgInput);
    _sbsBgRow.appendChild(_rb_sbsBg);
    searchBarSection.appendChild(_sbsBgRow);

    const _sbsBgOpRow = document.createElement("div");
    _sbsBgOpRow.style.cssText = rowCss();
    const _sbsBgOpLbl = document.createElement("label");
    _sbsBgOpLbl.textContent = t.searchBarBgOpacity || "列背景透明度";
    _sbsBgOpLbl.style.cssText = labelCss();
    _sbsBgOpRow.appendChild(_sbsBgOpLbl);
    const sbsBgOpInput = document.createElement("input");
    sbsBgOpInput.type = "range"; sbsBgOpInput.min = "0"; sbsBgOpInput.max = "1"; sbsBgOpInput.step = "0.05";
    sbsBgOpInput.value = styleSettings.searchBarBgOpacity ?? 0;
    sbsBgOpInput.style.cssText = sliderCss();
    const sbsBgOpSpan = makeValueSpan(parseFloat(sbsBgOpInput.value).toFixed(2));
    sbsBgOpInput.oninput = () => {
      styleSettings.searchBarBgOpacity = parseFloat(sbsBgOpInput.value);
      sbsBgOpSpan.textContent = styleSettings.searchBarBgOpacity.toFixed(2);
      save(); _debouncedApply();
    };
    _sbsBgOpInputRef = sbsBgOpInput;
    _sbsBgOpSpanRef  = sbsBgOpSpan;
    const _rb_sbsBgOp = makeResetBtn(0, (dv) => {
      sbsBgOpInput.value = dv;
      sbsBgOpSpan.textContent = parseFloat(dv).toFixed(2);
      styleSettings.searchBarBgOpacity = dv;
      save(); applyTheme(panelTheme);
    });
    _sbsBgOpRow.appendChild(sbsBgOpInput);
    _sbsBgOpRow.appendChild(sbsBgOpSpan);
    _sbsBgOpRow.appendChild(_rb_sbsBgOp);
    searchBarSection.appendChild(_sbsBgOpRow);

    const _sbsFgRow = document.createElement("div");
    _sbsFgRow.style.cssText = rowCss();
    const _sbsFgLbl = document.createElement("label");
    _sbsFgLbl.textContent = t.searchBarFgColor || "列文字顏色";
    _sbsFgLbl.style.cssText = labelCss();
    _sbsFgRow.appendChild(_sbsFgLbl);
    const sbsFgInput = document.createElement("input");
    sbsFgInput.type = "color";
    sbsFgInput.value = styleSettings.searchBarFg || "#eeeeee";
    sbsFgInput.oninput = () => {
      styleSettings.searchBarFg = sbsFgInput.value;
      save(); _debouncedApply();
    };
    _sbsFgInputRef = sbsFgInput;
    const _rb_sbsFg = makeResetBtn("", (dv) => {
      sbsFgInput.value = dv || "#eeeeee";
      styleSettings.searchBarFg = dv;
      save(); applyTheme(panelTheme);
    });
    _sbsFgRow.appendChild(sbsFgInput);
    _sbsFgRow.appendChild(_rb_sbsFg);
    searchBarSection.appendChild(_sbsFgRow);

    const _sbsGlowToggleRow = document.createElement("div");
    _sbsGlowToggleRow.style.cssText = rowCss() + "margin-top:4px;border-top:1px solid " +
      (panelTheme === "dark" ? "#444" : "#eee") + ";padding-top:5px;";
    const _sbsGlowToggleLbl = document.createElement("label");
    _sbsGlowToggleLbl.textContent = t.searchBarGlowEnabled || "搜尋列光暈";
    _sbsGlowToggleLbl.style.cssText = labelCss();
    _sbsGlowToggleRow.appendChild(_sbsGlowToggleLbl);
    const _sbsGlowToggle = document.createElement("input");
    _sbsGlowToggle.type = "checkbox";
    _sbsGlowToggle.checked = !!styleSettings.searchBarGlowEnabled;
    _sbsGlowToggle.onchange = () => {
      styleSettings.searchBarGlowEnabled = _sbsGlowToggle.checked;
      save(); applyTheme(panelTheme);
    };
    _sbsGlowToggleRow.appendChild(_sbsGlowToggle);
    searchBarSection.appendChild(_sbsGlowToggleRow);

    const _sbsGlowColorRow = document.createElement("div");
    _sbsGlowColorRow.style.cssText = rowCss();
    const _sbsGlowColorLbl = document.createElement("label");
    _sbsGlowColorLbl.textContent = t.searchBarGlowColor || "光暈顏色";
    _sbsGlowColorLbl.style.cssText = labelCss();
    _sbsGlowColorRow.appendChild(_sbsGlowColorLbl);
    const _sbsGlowColorInput = document.createElement("input");
    _sbsGlowColorInput.type = "color";
    _sbsGlowColorInput.value = styleSettings.searchBarGlowColor || "#5599ff";
    _sbsGlowColorInput.oninput = () => {
      styleSettings.searchBarGlowColor = _sbsGlowColorInput.value;
      save(); _debouncedApply();
    };
    const _rb_sbsGlowColor = makeResetBtn("#5599ff", (dv) => {
      _sbsGlowColorInput.value = dv;
      styleSettings.searchBarGlowColor = dv;
      save(); applyTheme(panelTheme);
    });
    _sbsGlowColorRow.appendChild(_sbsGlowColorInput);
    _sbsGlowColorRow.appendChild(_rb_sbsGlowColor);
    searchBarSection.appendChild(_sbsGlowColorRow);

    const _sbsGlowStrRow = document.createElement("div");
    _sbsGlowStrRow.style.cssText = rowCss();
    const _sbsGlowStrLbl = document.createElement("label");
    _sbsGlowStrLbl.textContent = t.searchBarGlowStrength || "光暈強度";
    _sbsGlowStrLbl.style.cssText = labelCss();
    _sbsGlowStrRow.appendChild(_sbsGlowStrLbl);
    const _sbsGlowStrInput = document.createElement("input");
    _sbsGlowStrInput.type = "range"; _sbsGlowStrInput.min = "2"; _sbsGlowStrInput.max = "16"; _sbsGlowStrInput.step = "1";
    _sbsGlowStrInput.value = styleSettings.searchBarGlowStrength || 6;
    _sbsGlowStrInput.style.cssText = sliderCss();
    const _vs_sbsGlowStr = makeValueSpan(_sbsGlowStrInput.value + "px");
    _sbsGlowStrInput.oninput = () => {
      styleSettings.searchBarGlowStrength = parseInt(_sbsGlowStrInput.value);
      _vs_sbsGlowStr.textContent = _sbsGlowStrInput.value + "px";
      save(); _debouncedApply();
    };
    const _rb_sbsGlowStr = makeResetBtn(6, (dv) => {
      _sbsGlowStrInput.value = dv;
      _vs_sbsGlowStr.textContent = dv + "px";
      styleSettings.searchBarGlowStrength = dv;
      save(); applyTheme(panelTheme);
    });
    _sbsGlowStrRow.appendChild(_sbsGlowStrInput);
    _sbsGlowStrRow.appendChild(_vs_sbsGlowStr);
    _sbsGlowStrRow.appendChild(_rb_sbsGlowStr);
    searchBarSection.appendChild(_sbsGlowStrRow);

    generalStyleContainer.appendChild(searchBarSection);
    const toggleBtnStyleContainer = document.createElement("div");
    toggleBtnStyleContainer.style.cssText = `
      border:1px solid ${panelTheme === "dark" ? "#555" : "#ccc"};
      border-radius:${styleSettings.borderRadius}px;
      padding:6px; display:flex; flex-direction:column;
      gap:0; max-width:490px; margin-top:0;
    `;
    const _tbsHeader = document.createElement("div");
    _tbsHeader.textContent = t.toggleBtnStyleLabel || "開關按鈕樣式";
    _tbsHeader.style.cssText = "font-weight:bold; margin-bottom:6px; font-size:11px;";
    toggleBtnStyleContainer.appendChild(_tbsHeader);

    (function() {
      const row = document.createElement("div");
      row.style.cssText = rowCss() + "flex-wrap:wrap; gap:4px;";
      const lbl = document.createElement("label");
      lbl.textContent = t.toggleBtnIconLabel || "圖示";
      lbl.style.cssText = labelCss();
      row.appendChild(lbl);
      const _wrap = document.createElement("div");
      _wrap.style.cssText = "display:flex; gap:4px; flex:1; flex-wrap:wrap;";
      const _opts = [
        { v: "emoji",    lb: t.toggleBtnIconEmoji   || "🔍 Emoji" },
        { v: "svg-line", lb: t.toggleBtnIconSvgLine || "SVG 線框" },
        { v: "svg-fill", lb: t.toggleBtnIconSvgFill || "SVG 填色" },
      ];
      _opts.forEach(({ v, lb }) => {
        const b = document.createElement("button");
        b.textContent = lb;
        b.dataset.iconVal = v;
        const _isDark = panelTheme === "dark";
        const _active = (styleSettings.iconStyle || "emoji") === v;
        b.style.cssText = `
          padding:2px 8px; border-radius:4px; cursor:pointer;
          font-size:${styleSettings.fontSize - 1}px; white-space:nowrap;
          border:1px solid ${_isDark ? "#555" : "#ccc"};
          background:${_active ? (_isDark ? "#334466" : "#ddeeff") : "transparent"};
          color:${_active ? (_isDark ? "#88aaff" : "#0055cc") : "inherit"};
          transition: background .15s, color .15s;
        `;
        b.addEventListener("click", () => {
          styleSettings.iconStyle = v;
          save();
          const tb = document.getElementById("site-toggle-simple");
          if (tb) applyToggleBtnStyle(tb);
          applyAllBtnIcons();
          _wrap.querySelectorAll("button").forEach(btn2 => {
            const now = btn2.dataset.iconVal === v;
            btn2.style.background = now
              ? (panelTheme === "dark" ? "#334466" : "#ddeeff")
              : "transparent";
            btn2.style.color = now
              ? (panelTheme === "dark" ? "#88aaff" : "#0055cc")
              : "inherit";
          });
        });
        _wrap.appendChild(b);
      });
      row.appendChild(_wrap);
      toggleBtnStyleContainer.appendChild(row);
    })();

    (function() {
      const _isDkP = panelTheme === "dark";
      const row = document.createElement("div");
      row.style.cssText = rowCss() + "flex-wrap:wrap; align-items:center; gap:4px;";
      const lbl = document.createElement("label");
      lbl.textContent = t.svgIconColorLabel || "SVG 圖示顏色";
      lbl.style.cssText = labelCss();
      row.appendChild(lbl);
      const _cRow = document.createElement("div");
      _cRow.style.cssText = "display:flex; gap:5px; flex:1; flex-wrap:wrap; align-items:center;";
      const PALETTE = [
        { hex:"",        title:"Inherit (theme)" },
        { hex:"#ffffff", title:"White"   },
        { hex:"#dddddd", title:"Silver"  },
        { hex:"#222222", title:"Black"   },
        { hex:"#4a90d9", title:"Blue"    },
        { hex:"#2ecc71", title:"Green"   },
        { hex:"#e74c3c", title:"Red"     },
        { hex:"#f39c12", title:"Amber"   },
        { hex:"#9b59b6", title:"Purple"  },
        { hex:"#1abc9c", title:"Teal"    },
      ];
      let _cci;
      PALETTE.forEach(({ hex, title }) => {
        const sw = document.createElement("button");
        sw.title = title;
        sw.dataset.palette = hex;
        const _isAct = (styleSettings.svgIconColor || "") === hex;
        sw.style.cssText = [
          "width:18px; height:18px; border-radius:50%; cursor:pointer; flex-shrink:0;",
          `border:2px solid ${_isAct ? (_isDkP ? "#88aaff" : "#4a90d9") : "rgba(0,0,0,0)"};`,
          hex ? `background:${hex};` : "background:conic-gradient(#ccc 50%, #fff 50%);",
          "box-shadow:inset 0 0 0 1px rgba(0,0,0,.18); transition:border-color .12s;",
        ].join(" ");
        sw.addEventListener("click", () => {
          styleSettings.svgIconColor = hex;
          save();
          applyAllBtnIcons();
          const tb = document.getElementById("site-toggle-simple");
          if (tb) applyToggleBtnStyle(tb);
          _cRow.querySelectorAll("button[data-palette]").forEach(b2 => {
            b2.style.borderColor = b2.dataset.palette === hex
              ? (_isDkP ? "#88aaff" : "#4a90d9") : "rgba(0,0,0,0)";
          });
          if (_cci && hex) _cci.value = hex;
        });
        _cRow.appendChild(sw);
      });
      _cci = document.createElement("input");
      _cci.type  = "color";
      _cci.title = "Custom color";
      _cci.value = /^#[0-9a-fA-F]{6}$/.test(styleSettings.svgIconColor || "")
        ? styleSettings.svgIconColor : "#4a90d9";
      _cci.style.cssText = "width:22px; height:18px; border:none; cursor:pointer; padding:0; border-radius:3px; flex-shrink:0;";
      _cci.oninput = () => {
        styleSettings.svgIconColor = _cci.value;
        save();
        applyAllBtnIcons();
        const tb = document.getElementById("site-toggle-simple");
        if (tb) applyToggleBtnStyle(tb);
        _cRow.querySelectorAll("button[data-palette]").forEach(b2 => {
          b2.style.borderColor = "rgba(0,0,0,0)";
        });
      };
      _cRow.appendChild(_cci);
      row.appendChild(_cRow);
      toggleBtnStyleContainer.appendChild(row);
    })();

    (function() {
      const row = document.createElement("div");
      row.style.cssText = rowCss();
      const lbl = document.createElement("label");
      lbl.textContent = t.toggleBtnBgColorLabel || "背景顏色";
      lbl.style.cssText = labelCss();
      row.appendChild(lbl);
      const _cWrap = document.createElement("div");
      _cWrap.style.cssText = "display:flex; align-items:center; gap:6px; flex:1;";
      const _ci = document.createElement("input");
      _ci.type = "color";
      _ci.value = styleSettings.toggleBtnBg || "#ffffff";
      _ci.style.cssText = "width:36px; height:24px; border:none; cursor:pointer; padding:0; border-radius:3px;";
      _ci.oninput = () => {
        styleSettings.toggleBtnBg = _ci.value;
        save();
        const tb = document.getElementById("site-toggle-simple");
        if (tb) applyToggleBtnStyle(tb);
      };
      const _cbReset = makeResetBtn("", (dv) => {
        styleSettings.toggleBtnBg = dv;
        _ci.value = "#ffffff";
        save();
        const tb = document.getElementById("site-toggle-simple");
        if (tb) applyToggleBtnStyle(tb);
      });
      _cWrap.appendChild(_ci);
      _cWrap.appendChild(_cbReset);
      row.appendChild(_cWrap);
      toggleBtnStyleContainer.appendChild(row);
    })();

    (function() {
      const row = document.createElement("div");
      row.style.cssText = rowCss();
      const lbl = document.createElement("label");
      lbl.textContent = t.toggleBtnBgOpacityLabel || "背景透明度";
      lbl.style.cssText = labelCss();
      row.appendChild(lbl);
      const _si = document.createElement("input");
      _si.type = "range";
      _si.min = "0"; _si.max = "1"; _si.step = "0.05";
      _si.value = styleSettings.toggleBtnBgOpacity ?? 0;
      _si.style.cssText = sliderCss();
      const _vs = makeValueSpan(
        parseFloat(_si.value).toFixed(2)
      );
      _si.oninput = () => {
        styleSettings.toggleBtnBgOpacity = parseFloat(_si.value);
        _vs.textContent = parseFloat(_si.value).toFixed(2);
        save();
        const tb = document.getElementById("site-toggle-simple");
        if (tb) applyToggleBtnStyle(tb);
      };
      const _rb = makeResetBtn(0, (dv) => {
        _si.value = dv;
        styleSettings.toggleBtnBgOpacity = dv;
        _vs.textContent = "0.00";
        save();
        const tb = document.getElementById("site-toggle-simple");
        if (tb) applyToggleBtnStyle(tb);
      });
      row.appendChild(_si);
      row.appendChild(_vs);
      row.appendChild(_rb);
      toggleBtnStyleContainer.appendChild(row);
    })();

    const textStyleContainer = document.createElement("div");
    textStyleContainer.style.border = `1px solid ${panelTheme === "dark" ? "#555" : "#ccc"}`;
    textStyleContainer.style.borderRadius = styleSettings.borderRadius + "px";
    textStyleContainer.style.padding = "6px";
    textStyleContainer.style.display = "flex";
    textStyleContainer.style.flexDirection = "column";
    textStyleContainer.style.gap = "0";
    textStyleContainer.style.maxWidth = "490px";

    const textStyleHeader = document.createElement("div");
    textStyleHeader.textContent = t.fontSize || "文字設定";
    textStyleHeader.style.cssText = "font-weight:bold; margin-bottom:4px; font-size:11px;";
    textStyleContainer.appendChild(textStyleHeader);

    const fontSizeRow = document.createElement("div");
    fontSizeRow.style.cssText = rowCss();

    const fontSizeLabel = document.createElement("label");
    fontSizeLabel.textContent = t.fontSize || "文字大小";
    fontSizeLabel.style.cssText = labelCss();
    fontSizeRow.appendChild(fontSizeLabel);

    const fontSizeInput = document.createElement("input");
    fontSizeInput.type = "range";
    fontSizeInput.min = "10";
    fontSizeInput.max = "16";
    fontSizeInput.value = styleSettings.fontSize;
    fontSizeInput.style.cssText = sliderCss();
    fontSizeInput.oninput = () => {
      styleSettings.fontSize = parseInt(fontSizeInput.value);
      save();
      _debouncedApply();
      _vs_fontSizeInput.textContent = fontSizeInput.value+"px";
    };
    const _vs_fontSizeInput = makeValueSpan(fontSizeInput.value+"px");
    const _rb_fontSizeInput = makeResetBtn(STYLE_DEFAULTS.fontSize, (dv) => {
      fontSizeInput.value = dv;
      styleSettings.fontSize = dv;
      _vs_fontSizeInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    fontSizeRow.appendChild(fontSizeInput);
    fontSizeRow.appendChild(_vs_fontSizeInput);
    fontSizeRow.appendChild(_rb_fontSizeInput);
    textStyleContainer.appendChild(fontSizeRow);

    const textBackgroundColorRow = document.createElement("div");
    textBackgroundColorRow.style.cssText = rowCss();

    const textBackgroundColorLabel = document.createElement("label");
    textBackgroundColorLabel.textContent =
      t.textBackgroundColor || "文字背景色";
    textBackgroundColorLabel.style.cssText = labelCss();
    textBackgroundColorRow.appendChild(textBackgroundColorLabel);

    const textBackgroundColorInput = document.createElement("input");
    textBackgroundColorInput.type = "color";
    textBackgroundColorInput.value =
      styleSettings.textBackgroundColor || "#ffffff";
    textBackgroundColorInput.oninput = () => {
      styleSettings.textBackgroundColor = textBackgroundColorInput.value;
      save();
      _debouncedApply();
    };
    textBackgroundColorRow.appendChild(textBackgroundColorInput);
    textStyleContainer.appendChild(textBackgroundColorRow);

    const textBorderRow = document.createElement("div");
    textBorderRow.style.cssText = rowCss();

    const textBorderLabel = document.createElement("label");
    textBorderLabel.textContent = t.textBorder || "文字邊框";
    textBorderLabel.style.cssText = labelCss();
    textBorderRow.appendChild(textBorderLabel);

    const textBorderInput = document.createElement("input");
    textBorderInput.type = "checkbox";
    textBorderInput.checked = styleSettings.textBorder;
    textBorderInput.onchange = () => {
      styleSettings.textBorder = textBorderInput.checked;
      save();
      applyTheme(panelTheme);
    };
    const _rb_textBorderInput = makeResetBtn(false, (dv) => {
      textBorderInput.checked = dv;
      styleSettings.textBorder = dv;
      save(); applyTheme(panelTheme);
    });
    textBorderRow.appendChild(textBorderInput);
    textBorderRow.appendChild(_rb_textBorderInput);
    textStyleContainer.appendChild(textBorderRow);

    const textOpacityCompensationRow = document.createElement("div");
    textOpacityCompensationRow.style.cssText = rowCss();

    const textOpacityCompensationLabel = document.createElement("label");
    textOpacityCompensationLabel.textContent =
      t.textOpacityCompensation || "文字清晰強化";
    textOpacityCompensationLabel.style.cssText = labelCss();
    textOpacityCompensationRow.appendChild(textOpacityCompensationLabel);

    const textOpacityCompensationInput = document.createElement("input");
    textOpacityCompensationInput.type = "range";
    textOpacityCompensationInput.min = "0.3";
    textOpacityCompensationInput.max = "2.0";
    textOpacityCompensationInput.step = "0.1";
    textOpacityCompensationInput.value = styleSettings.textOpacityCompensation;
    textOpacityCompensationInput.style.cssText = sliderCss();
    textOpacityCompensationInput.oninput = () => {
      styleSettings.textOpacityCompensation = parseFloat(
        textOpacityCompensationInput.value,
      );
      save();
      _debouncedApply();
      _vs_textOpacityCompensationInput.textContent = parseFloat(textOpacityCompensationInput.value).toFixed(1);
    };
    const _vs_textOpacityCompensationInput = makeValueSpan(parseFloat(textOpacityCompensationInput.value).toFixed(1));
    const _rb_textOpacityCompensationInput = makeResetBtn(STYLE_DEFAULTS.textOpacityCompensation, (dv) => {
      textOpacityCompensationInput.value = dv;
      styleSettings.textOpacityCompensation = dv;
      _vs_textOpacityCompensationInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    textOpacityCompensationRow.appendChild(textOpacityCompensationInput);
    textOpacityCompensationRow.appendChild(_vs_textOpacityCompensationInput);
    textOpacityCompensationRow.appendChild(_rb_textOpacityCompensationInput);
    textStyleContainer.appendChild(textOpacityCompensationRow);

    const backgroundOverlayContainer = document.createElement("div");
    backgroundOverlayContainer.style.border = `1px solid ${panelTheme === "dark" ? "#555" : "#ccc"}`;
    backgroundOverlayContainer.style.borderRadius =
      styleSettings.borderRadius + "px";
    backgroundOverlayContainer.style.padding = "6px";
    backgroundOverlayContainer.style.display = "flex";
    backgroundOverlayContainer.style.flexDirection = "column";
    backgroundOverlayContainer.style.gap = "0";
    backgroundOverlayContainer.style.maxWidth = "490px";

    const backgroundOverlayHeader = document.createElement("div");
    backgroundOverlayHeader.textContent = t.backgroundImage || "背景與黑幕";
    backgroundOverlayHeader.style.cssText = "font-weight:bold; margin-bottom:4px; font-size:11px;";
    backgroundOverlayContainer.appendChild(backgroundOverlayHeader);

    const overlayDarkeningRow = document.createElement("div");
    overlayDarkeningRow.style.cssText = rowCss();

    const overlayDarkeningLabel = document.createElement("label");
    overlayDarkeningLabel.textContent = t.enableOverlayDarkening || "黑幕效果";
    overlayDarkeningLabel.style.cssText = labelCss();
    overlayDarkeningRow.appendChild(overlayDarkeningLabel);

    const overlayDarkeningInput = document.createElement("input");
    overlayDarkeningInput.type = "checkbox";
    overlayDarkeningInput.checked = styleSettings.enableOverlayDarkening;
    overlayDarkeningInput.onchange = () => {
      styleSettings.enableOverlayDarkening = overlayDarkeningInput.checked;
      save();
      applyTheme(panelTheme);
    };
    const _rb_overlayDarkeningInput = makeResetBtn(false, (dv) => {
      overlayDarkeningInput.checked = dv;
      styleSettings.enableOverlayDarkening = dv;
      save(); applyTheme(panelTheme);
    });
    overlayDarkeningRow.appendChild(overlayDarkeningInput);
    overlayDarkeningRow.appendChild(_rb_overlayDarkeningInput);
    backgroundOverlayContainer.appendChild(overlayDarkeningRow);

    const overlayStrengthRow = document.createElement("div");
    overlayStrengthRow.style.cssText = rowCss();

    const overlayStrengthLabel = document.createElement("label");
    overlayStrengthLabel.textContent = t.overlayStrength || "黑幕強度";
    overlayStrengthLabel.style.cssText = labelCss();
    overlayStrengthRow.appendChild(overlayStrengthLabel);

    const overlayStrengthInput = document.createElement("input");
    overlayStrengthInput.type = "range";
    overlayStrengthInput.min = "0.0";
    overlayStrengthInput.max = "1.0";
    overlayStrengthInput.step = "0.1";
    overlayStrengthInput.value = styleSettings.overlayStrength || 0.5;
    overlayStrengthInput.style.cssText = sliderCss();
    overlayStrengthInput.oninput = () => {
      styleSettings.overlayStrength = parseFloat(overlayStrengthInput.value);
      save();
      _debouncedApply();
      _vs_overlayStrengthInput.textContent = parseFloat(overlayStrengthInput.value).toFixed(1);
    };
    const _vs_overlayStrengthInput = makeValueSpan(parseFloat(overlayStrengthInput.value).toFixed(1));
    const _rb_overlayStrengthInput = makeResetBtn(STYLE_DEFAULTS.overlayStrength, (dv) => {
      overlayStrengthInput.value = dv;
      styleSettings.overlayStrength = dv;
      _vs_overlayStrengthInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    overlayStrengthRow.appendChild(overlayStrengthInput);
    overlayStrengthRow.appendChild(_vs_overlayStrengthInput);
    overlayStrengthRow.appendChild(_rb_overlayStrengthInput);
    backgroundOverlayContainer.appendChild(overlayStrengthRow);

    const imageRow = document.createElement("div");
    imageRow.style.cssText = rowCss();

    const imageLabel = document.createElement("label");
    imageLabel.textContent = t.backgroundImage || "背景圖片";
    imageLabel.style.cssText = labelCss();
    imageRow.appendChild(imageLabel);

    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*";
    imageInput.style.cssText = "flex: 1; min-width: 0; margin: 0 6px; font-size: 11px; overflow: hidden;";
    imageInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          styleSettings.backgroundImage = ev.target.result;
          save();
          applyTheme(panelTheme);
        };
        reader.readAsDataURL(file);
      }
    };
    imageRow.appendChild(imageInput);

    const clearImageBtn = document.createElement("button");
    clearImageBtn.textContent = t.clearImage || "清除圖片";
    clearImageBtn.style.padding = "2px 6px";
    clearImageBtn.style.borderRadius = styleSettings.borderRadius + "px";
    clearImageBtn.style.cursor = "pointer";
    clearImageBtn.style.whiteSpace = "nowrap";
    clearImageBtn.style.flexShrink = "0";
    clearImageBtn.onclick = () => {
      styleSettings.backgroundImage = "";
      save();
      applyTheme(panelTheme);
    };
    imageRow.appendChild(clearImageBtn);
    backgroundOverlayContainer.appendChild(imageRow);

    const imageModeRow = document.createElement("div");
    imageModeRow.style.cssText = rowCss();

    const imageModeLabel = document.createElement("label");
    imageModeLabel.textContent = t.imageMode || "圖片模式";
    imageModeLabel.style.cssText = labelCss();
    imageModeRow.appendChild(imageModeLabel);

    const imageModeSelect = document.createElement("select");
    imageModeSelect.style.cssText = sliderCss();
    Object.entries(t.imageModes || {}).forEach(([key, value]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = value;
      if (styleSettings.imageMode === key) option.selected = true;
      imageModeSelect.appendChild(option);
    });
    function syncImageOffsetVisibility() {
      const isCenter = styleSettings.imageMode === "center";
      imageOffsetXRow.style.opacity = isCenter ? "0.35" : "1";
      imageOffsetXRow.style.pointerEvents = isCenter ? "none" : "";
      imageOffsetYRow.style.opacity = isCenter ? "0.35" : "1";
      imageOffsetYRow.style.pointerEvents = isCenter ? "none" : "";
    }
    imageModeSelect.onchange = () => {
      styleSettings.imageMode = imageModeSelect.value;
      save();
      applyTheme(panelTheme);
      syncImageOffsetVisibility();
    };
    imageModeRow.appendChild(imageModeSelect);
    backgroundOverlayContainer.appendChild(imageModeRow);

    const imageOffsetXRow = document.createElement("div");
    imageOffsetXRow.style.cssText = rowCss();

    const imageOffsetXLabel = document.createElement("label");
    imageOffsetXLabel.textContent = t.imageOffsetX || "圖片 X 偏移";
    imageOffsetXLabel.style.cssText = labelCss();
    imageOffsetXRow.appendChild(imageOffsetXLabel);

    const imageOffsetXInput = document.createElement("input");
    imageOffsetXInput.type = "range";
    imageOffsetXInput.min = "-1000";
    imageOffsetXInput.max = "1000";
    imageOffsetXInput.value = styleSettings.imageOffsetX;
    imageOffsetXInput.style.cssText = sliderCss();
    imageOffsetXInput.oninput = () => {
      styleSettings.imageOffsetX = parseInt(imageOffsetXInput.value);
      log("X Offset updated:", styleSettings.imageOffsetX);
      save();
      _debouncedApply();
      _vs_imageOffsetXInput.textContent = imageOffsetXInput.value+"px";
    };
    const _vs_imageOffsetXInput = makeValueSpan(imageOffsetXInput.value+"px");
    const _rb_imageOffsetXInput = makeResetBtn(STYLE_DEFAULTS.imageOffsetX, (dv) => {
      imageOffsetXInput.value = dv;
      styleSettings.imageOffsetX = dv;
      _vs_imageOffsetXInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    imageOffsetXRow.appendChild(imageOffsetXInput);
    imageOffsetXRow.appendChild(_vs_imageOffsetXInput);
    imageOffsetXRow.appendChild(_rb_imageOffsetXInput);
    backgroundOverlayContainer.appendChild(imageOffsetXRow);

    const imageOffsetYRow = document.createElement("div");
    imageOffsetYRow.style.cssText = rowCss();

    const imageOffsetYLabel = document.createElement("label");
    imageOffsetYLabel.textContent = t.imageOffsetY || "圖片 Y 偏移";
    imageOffsetYLabel.style.cssText = labelCss();
    imageOffsetYRow.appendChild(imageOffsetYLabel);

    const imageOffsetYInput = document.createElement("input");
    imageOffsetYInput.type = "range";
    imageOffsetYInput.min = "-1000";
    imageOffsetYInput.max = "1000";
    imageOffsetYInput.value = styleSettings.imageOffsetY;
    imageOffsetYInput.style.cssText = sliderCss();
    imageOffsetYInput.oninput = () => {
      styleSettings.imageOffsetY = parseInt(imageOffsetYInput.value);
      log("Y Offset updated:", styleSettings.imageOffsetY);
      save();
      _debouncedApply();
      _vs_imageOffsetYInput.textContent = imageOffsetYInput.value+"px";
    };
    const _vs_imageOffsetYInput = makeValueSpan(imageOffsetYInput.value+"px");
    const _rb_imageOffsetYInput = makeResetBtn(STYLE_DEFAULTS.imageOffsetY, (dv) => {
      imageOffsetYInput.value = dv;
      styleSettings.imageOffsetY = dv;
      _vs_imageOffsetYInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    imageOffsetYRow.appendChild(imageOffsetYInput);
    imageOffsetYRow.appendChild(_vs_imageOffsetYInput);
    imageOffsetYRow.appendChild(_rb_imageOffsetYInput);
    backgroundOverlayContainer.appendChild(imageOffsetYRow);
    syncImageOffsetVisibility();

    const imageScaleRow = document.createElement("div");
    imageScaleRow.style.cssText = rowCss();

    const imageScaleLabel = document.createElement("label");
    imageScaleLabel.textContent = t.imageScale || "圖片縮放";
    imageScaleLabel.style.cssText = labelCss();
    imageScaleRow.appendChild(imageScaleLabel);

    const imageScaleInput = document.createElement("input");
    imageScaleInput.type = "range";
    imageScaleInput.min = "0.5";
    imageScaleInput.max = "3.0";
    imageScaleInput.step = "0.1";
    imageScaleInput.value = styleSettings.imageScale;
    imageScaleInput.style.cssText = sliderCss();
    imageScaleInput.oninput = () => {
      styleSettings.imageScale = parseFloat(imageScaleInput.value);
      save();
      _debouncedApply();
      _vs_imageScaleInput.textContent = parseFloat(imageScaleInput.value).toFixed(1)+"x";
    };
    const _vs_imageScaleInput = makeValueSpan(parseFloat(imageScaleInput.value).toFixed(1)+"x");
    const _rb_imageScaleInput = makeResetBtn(STYLE_DEFAULTS.imageScale, (dv) => {
      imageScaleInput.value = dv;
      styleSettings.imageScale = dv;
      _vs_imageScaleInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    imageScaleRow.appendChild(imageScaleInput);
    imageScaleRow.appendChild(_vs_imageScaleInput);
    imageScaleRow.appendChild(_rb_imageScaleInput);
    backgroundOverlayContainer.appendChild(imageScaleRow);

    const imageOpacityRow = document.createElement("div");
    imageOpacityRow.style.cssText = rowCss();

    const imageOpacityLabel = document.createElement("label");
    imageOpacityLabel.textContent = t.imageOpacity || "圖片透明度";
    imageOpacityLabel.style.cssText = labelCss();
    imageOpacityRow.appendChild(imageOpacityLabel);

    const imageOpacityInput = document.createElement("input");
    imageOpacityInput.type = "range";
    imageOpacityInput.min = "0.3";
    imageOpacityInput.max = "1.0";
    imageOpacityInput.step = "0.1";
    imageOpacityInput.value = styleSettings.imageOpacity;
    imageOpacityInput.style.cssText = sliderCss();
    imageOpacityInput.oninput = () => {
      styleSettings.imageOpacity = parseFloat(imageOpacityInput.value);
      save();
      _debouncedApply();
      _vs_imageOpacityInput.textContent = parseFloat(imageOpacityInput.value).toFixed(1);
    };
    const _vs_imageOpacityInput = makeValueSpan(parseFloat(imageOpacityInput.value).toFixed(1));
    const _rb_imageOpacityInput = makeResetBtn(STYLE_DEFAULTS.imageOpacity, (dv) => {
      imageOpacityInput.value = dv;
      styleSettings.imageOpacity = dv;
      _vs_imageOpacityInput.textContent = String(dv);
      save(); applyTheme(panelTheme);
    });
    imageOpacityRow.appendChild(imageOpacityInput);
    imageOpacityRow.appendChild(_vs_imageOpacityInput);
    imageOpacityRow.appendChild(_rb_imageOpacityInput);
    backgroundOverlayContainer.appendChild(imageOpacityRow);

    const multiSelectContainer = document.createElement("div");
    multiSelectContainer.style.border = `1px solid ${panelTheme === "dark" ? "#555" : "#ccc"}`;
    multiSelectContainer.style.padding = "6px";
    multiSelectContainer.style.borderRadius = styleSettings.borderRadius + "px";
    multiSelectContainer.style.display = "flex";
    multiSelectContainer.style.flexDirection = "column";
    multiSelectContainer.style.gap = "0";
    multiSelectContainer.style.maxWidth = "490px";

    const multiSelectHeader = document.createElement("div");
    multiSelectHeader.textContent = t.multiSelectMode || "複選模式";
    multiSelectHeader.style.cssText = "font-weight:bold; margin-bottom:4px; font-size:11px;";
    multiSelectContainer.appendChild(multiSelectHeader);

    const msColorRow = document.createElement("div");
    msColorRow.style.cssText = rowCss();
    const msColorLabel = document.createElement("label");
    msColorLabel.textContent = t.multiSelectColor || "選取高亮顏色";
    msColorLabel.style.cssText = labelCss();
    msColorRow.appendChild(msColorLabel);
    const msColorInput = document.createElement("input");
    msColorInput.type = "color";
    msColorInput.value = styleSettings.multiSelectColor || "#ffc400";
    msColorInput.oninput = () => {
      styleSettings.multiSelectColor = msColorInput.value;
      save();
    };
    msColorRow.appendChild(msColorInput);
    multiSelectContainer.appendChild(msColorRow);

    const msOpacityRow = document.createElement("div");
    msOpacityRow.style.cssText = rowCss();
    const msOpacityLabel = document.createElement("label");
    msOpacityLabel.textContent = t.multiSelectOpacity || "高亮透明度";
    msOpacityLabel.style.cssText = labelCss();
    msOpacityRow.appendChild(msOpacityLabel);
    const msOpacityInput = document.createElement("input");
    msOpacityInput.type = "range";
    msOpacityInput.min = "0";
    msOpacityInput.max = "1";
    msOpacityInput.step = "0.05";
    msOpacityInput.value = styleSettings.multiSelectOpacity != null ? styleSettings.multiSelectOpacity : 0.85;
    msOpacityInput.style.cssText = sliderCss();
    msOpacityInput.oninput = () => {
      styleSettings.multiSelectOpacity = parseFloat(msOpacityInput.value);
      _vs_msOpacity.textContent = parseFloat(msOpacityInput.value).toFixed(2);
      save();
    };
    const _vs_msOpacity = makeValueSpan(parseFloat(msOpacityInput.value).toFixed(2));
    const _rb_msOpacity = makeResetBtn(0.85, (dv) => {
      msOpacityInput.value = dv;
      styleSettings.multiSelectOpacity = dv;
      _vs_msOpacity.textContent = String(dv);
      save();
    });
    msOpacityRow.appendChild(msOpacityInput);
    msOpacityRow.appendChild(_vs_msOpacity);
    msOpacityRow.appendChild(_rb_msOpacity);
    multiSelectContainer.appendChild(msOpacityRow);
    const customThemeContainer = document.createElement("div");
    customThemeContainer.style.border = `1px solid ${panelTheme === "dark" ? "#555" : "#ccc"}`;
    customThemeContainer.style.padding = "6px";
    customThemeContainer.style.borderRadius = styleSettings.borderRadius + "px";
    customThemeContainer.style.display =
      styleSettings.theme === "custom" ? "flex" : "none";
    customThemeContainer.style.flexDirection = "column";
    customThemeContainer.style.gap = "0";
    customThemeContainer.style.maxWidth = "490px";

    const customThemeHeader = document.createElement("div");
    customThemeHeader.textContent = t.customThemeLabel || "Custom Theme";
    customThemeHeader.style.cssText = "font-weight:bold; margin-bottom:4px; font-size:11px;";
    customThemeContainer.appendChild(customThemeHeader);

    const backgroundColorRow = document.createElement("div");
    backgroundColorRow.style.cssText = rowCss();

    const backgroundColorLabel = document.createElement("label");
    backgroundColorLabel.textContent = t.backgroundColor || "背景色";
    backgroundColorLabel.style.cssText = labelCss();
    backgroundColorRow.appendChild(backgroundColorLabel);

    const backgroundColorInput = document.createElement("input");
    backgroundColorInput.type = "color";
    backgroundColorInput.value = styleSettings.customBackgroundColor;
    backgroundColorInput.oninput = () => {
      styleSettings.customBackgroundColor = backgroundColorInput.value;
      save();
      _debouncedApply();
    };
    backgroundColorRow.appendChild(backgroundColorInput);
    customThemeContainer.appendChild(backgroundColorRow);

    const textColorRow = document.createElement("div");
    textColorRow.style.cssText = rowCss();

    const textColorLabel = document.createElement("label");
    textColorLabel.textContent = t.textColor || "文字色";
    textColorLabel.style.cssText = labelCss();
    textColorRow.appendChild(textColorLabel);

    const textColorInput = document.createElement("input");
    textColorInput.type = "color";
    textColorInput.value = styleSettings.customTextColor;
    textColorInput.oninput = () => {
      styleSettings.customTextColor = textColorInput.value;
      save();
      _debouncedApply();
    };
    textColorRow.appendChild(textColorInput);
    customThemeContainer.appendChild(textColorRow);

    const buttonBgRow = document.createElement("div");
    buttonBgRow.style.cssText = rowCss();

    const buttonBgLabel = document.createElement("label");
    buttonBgLabel.textContent = t.customButtonBg || "按鈕背景";

    buttonBgLabel.style.cssText = labelCss();
    buttonBgRow.appendChild(buttonBgLabel);

    const buttonBgInput = document.createElement("input");
    buttonBgInput.type = "color";
    buttonBgInput.value = styleSettings.customButtonBg;
    buttonBgInput.oninput = () => {
      styleSettings.customButtonBg = buttonBgInput.value;
      save();
      _debouncedApply();
    };
    buttonBgRow.appendChild(buttonBgInput);
    customThemeContainer.appendChild(buttonBgRow);

    styleConfigContent.appendChild(panelLayoutContainer);
    styleConfigContent.appendChild(generalStyleContainer);
    styleConfigContent.appendChild(toggleBtnStyleContainer);
    styleConfigContent.appendChild(textStyleContainer);
    styleConfigContent.appendChild(backgroundOverlayContainer);
    styleConfigContent.appendChild(multiSelectContainer);
    styleConfigContent.appendChild(customThemeContainer);

    {
      const _hc = panelTheme === "dark"
        ? "rgba(80,180,255,0.85)"
        : "rgba(30,140,240,0.75)";
      const _DASHED = `2px dashed ${_hc}`;
      const _NONE   = "";

      function _hlSet(selectors, on) {
        const p = document.getElementById("site-group-panel");
        if (!p) return;
        selectors.forEach(sel => {
          p.querySelectorAll(sel).forEach(el => {
            el.style.outline       = on ? _DASHED : _NONE;
            el.style.outlineOffset = on ? "2px"   : _NONE;
          });
        });
      }

      function _hlEls(els, on) {
        els.forEach(el => {
          if (!el) return;
          el.style.outline       = on ? _DASHED : _NONE;
          el.style.outlineOffset = on ? "2px"   : _NONE;
        });
      }

      function _hlPanel(on) {
        const p = document.getElementById("site-group-panel");
        if (!p) return;
        p.style.outline       = on ? _DASHED : _NONE;
        p.style.outlineOffset = on ? "3px"   : _NONE;
      }

      function _bind(el, onEnter, onLeave) {
        if (!el) return;
        el.style.cursor = "default";
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      }

      _bind(panelLayoutHeader,
        () => _hlPanel(true),
        () => _hlPanel(false)
      );

      _bind(generalStyleHeader,
        () => _hlSet([".group-block", "button:not(.icon-btn)"], true),
        () => _hlSet([".group-block", "button:not(.icon-btn)"], false)
      );

      _bind(_qsHeader,
        () => { _hlPanel(true); _hlSearchBar(true); },
        () => { _hlPanel(false); _hlSearchBar(false); }
      );

      _bind(glowHeader,
        () => _hlPanel(true),
        () => _hlPanel(false)
      );

      _bind(_tbsHeader,
        () => _hlEls([document.getElementById("site-toggle-simple")], true),
        () => _hlEls([document.getElementById("site-toggle-simple")], false)
      );

      _bind(textStyleHeader,
        () => _hlSet([".site-label", ".group-name"], true),
        () => _hlSet([".site-label", ".group-name"], false)
      );

      _bind(backgroundOverlayHeader,
        () => _hlPanel(true),
        () => _hlPanel(false)
      );

      _bind(multiSelectHeader,
        () => _hlSet([".multi-btn", ".multi-send-btn"], true),
        () => _hlSet([".multi-btn", ".multi-send-btn"], false)
      );

      _bind(customThemeHeader,
        () => _hlSet([".group-block", ".draggable-site"], true),
        () => _hlSet([".group-block", ".draggable-site"], false)
      );

      _bind(borderRadiusLabel,
        () => _hlSet([".group-block", ".draggable-site"], true),
        () => _hlSet([".group-block", ".draggable-site"], false)
      );

      _bind(contrastLabel,
        () => _hlSet(["button:not(.icon-btn)", ".draggable-site"], true),
        () => _hlSet(["button:not(.icon-btn)", ".draggable-site"], false)
      );

      _bind(opacityLabel,
        () => _hlPanel(true),
        () => _hlPanel(false)
      );

      _bind(groupOpacityLabel,
        () => _hlSet([".group-block"], true),
        () => _hlSet([".group-block"], false)
      );

      _bind(buttonOpacityLabel,
        () => _hlSet([".draggable-site", "button:not(.icon-btn)"], true),
        () => _hlSet([".draggable-site", "button:not(.icon-btn)"], false)
      );

      _bind(siteButtonWidthLabel,
        () => _hlSet([".draggable-site"], true),
        () => _hlSet([".draggable-site"], false)
      );

      _bind(panelBgColorLabel,  () => _hlPanel(true), () => _hlPanel(false));
      _bind(panelBgAlphaLabel,  () => _hlPanel(true), () => _hlPanel(false));

      _bind(glowToggleLbl,  () => _hlPanel(true), () => _hlPanel(false));
      _bind(glowColorLbl,   () => _hlPanel(true), () => _hlPanel(false));
      _bind(glowStrLbl,     () => _hlPanel(true), () => _hlPanel(false));
      _bind(glowInsetLbl,   () => _hlPanel(true), () => _hlPanel(false));
      _bind(sheenToggleLbl, () => _hlPanel(true), () => _hlPanel(false));
      _bind(sheenAngleLbl,  () => _hlPanel(true), () => _hlPanel(false));
      _bind(sheenOpLbl,     () => _hlPanel(true), () => _hlPanel(false));

      _bind(siteGlowLbl,
        () => _hlSet([".draggable-site"], true),
        () => _hlSet([".draggable-site"], false)
      );
      _bind(groupGlowLbl,
        () => _hlSet([".group-block"], true),
        () => _hlSet([".group-block"], false)
      );

      toggleBtnStyleContainer.querySelectorAll("label").forEach(lbl => {
        _bind(lbl,
          () => _hlEls([document.getElementById("site-toggle-simple")], true),
          () => _hlEls([document.getElementById("site-toggle-simple")], false)
        );
      });

      _bind(fontSizeLabel,
        () => _hlSet([".site-label", ".group-name"], true),
        () => _hlSet([".site-label", ".group-name"], false)
      );
      _bind(textBackgroundColorLabel,
        () => _hlSet([".site-label"], true),
        () => _hlSet([".site-label"], false)
      );
      _bind(textBorderLabel,
        () => _hlSet([".site-label", ".group-name"], true),
        () => _hlSet([".site-label", ".group-name"], false)
      );
      _bind(textOpacityCompensationLabel,
        () => _hlSet([".site-label", ".group-name"], true),
        () => _hlSet([".site-label", ".group-name"], false)
      );

      _bind(overlayDarkeningLabel,  () => _hlPanel(true), () => _hlPanel(false));
      _bind(overlayStrengthLabel,   () => _hlPanel(true), () => _hlPanel(false));

      _bind(imageLabel,        () => _hlPanel(true), () => _hlPanel(false));
      _bind(imageModeLabel,    () => _hlPanel(true), () => _hlPanel(false));
      _bind(imageOffsetXLabel, () => _hlPanel(true), () => _hlPanel(false));
      _bind(imageOffsetYLabel, () => _hlPanel(true), () => _hlPanel(false));
      _bind(imageScaleLabel,   () => _hlPanel(true), () => _hlPanel(false));
      _bind(imageOpacityLabel, () => _hlPanel(true), () => _hlPanel(false));

      _bind(msColorLabel,
        () => _hlSet([".multi-btn", ".multi-send-btn"], true),
        () => _hlSet([".multi-btn", ".multi-send-btn"], false)
      );
      _bind(msOpacityLabel,
        () => _hlSet([".multi-btn", ".multi-send-btn"], true),
        () => _hlSet([".multi-btn", ".multi-send-btn"], false)
      );

      _bind(backgroundColorLabel,
        () => _hlPanel(true),
        () => _hlPanel(false)
      );
      _bind(textColorLabel,
        () => _hlSet([".site-label", ".group-name"], true),
        () => _hlSet([".site-label", ".group-name"], false)
      );
      _bind(buttonBgLabel,
        () => _hlSet([".draggable-site", "button:not(.icon-btn)"], true),
        () => _hlSet([".draggable-site", "button:not(.icon-btn)"], false)
      );

      function _hlSearchBar(on) {
        const _scw = document.getElementById("search-config-wrap");
        if (!_scw) return;
        _scw.style.outline       = on ? _DASHED : _NONE;
        _scw.style.outlineOffset = on ? "3px"   : _NONE;
      }
      _bind(_sbsHeader,
        () => _hlSearchBar(true),
        () => _hlSearchBar(false)
      );
      [_sbsPresetLbl, _sbsBgLbl, _sbsBgOpLbl, _sbsFgLbl,
       _sbsGlowToggleLbl, _sbsGlowColorLbl, _sbsGlowStrLbl].forEach(lbl => {
        _bind(lbl, () => _hlSearchBar(true), () => _hlSearchBar(false));
      });
    }

    if (document.getElementById("style-config-wrap")) {
      document.getElementById("style-config-wrap").remove();
    }
    document.body.appendChild(styleConfigWrap);
    shieldFromFileDrop(styleConfigWrap);
    if (searchConfig.isExpanded) {
      requestAnimationFrame(() => _positionStyleFloat(styleConfigWrap));
    }

    panelBody.insertBefore(searchConfigWrap, groupSlot);
    panelBody.insertBefore(buttonContainer,  groupSlot);

    panel.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const draggingGroup = document.querySelector(".dragging.draggable-group");
      if (!draggingGroup) return;

      const afterElement = getDragAfterElement(
        panel,
        e.clientY,
        ".group-block",
      );

      if (afterElement == null) {
        panel.appendChild(draggingGroup);
      } else {
        panel.insertBefore(draggingGroup, afterElement);
      }
    });

    panel.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const draggingGroup = document.querySelector(".dragging.draggable-group");
      if (!draggingGroup) return;

      draggingGroup.classList.remove("dragging");
      draggingGroup.style.opacity = "";

      document.getElementById("site-group-panel").style.opacity = "1";

      const newGroups = [];
      panel.querySelectorAll(".group-block").forEach((block, index) => {
        const originalIndex = parseInt(block.dataset.groupIndex);
        if (groups[originalIndex]) {
          newGroups.push(groups[originalIndex]);
        }
        block.dataset.groupIndex = index;
      });

      groups.length = 0;
      groups.push(...newGroups);

      save();
      renderSites(panel);
      log("Drop: Groups updated");
    });

    panel.addEventListener("dragend", (e) => {
      e.stopPropagation();
      const draggingGroup = document.querySelector(".dragging.draggable-group");
      if (draggingGroup) {
        draggingGroup.classList.remove("dragging");
        draggingGroup.style.opacity = styleSettings.groupOpacity.toString();
      }

      document.getElementById("site-group-panel").style.opacity = "1";
    });

    document.body.appendChild(panel);
    initSearchConfigCollapse();
    renderSites(panel);

    try {
      applyTheme(panelTheme);
    } catch (e) {
      console.error("Error in applyTheme during createPanel:", e);
    }
  }

  const ENGINE_QUERY_PARAMS = [
    { host: "yandex.",   param: "text"  },
    { host: "baidu.com", param: "wd"    },
    { host: "yahoo.com", param: "p"     },
    { host: "naver.com", param: "query" },
    { host: "ask.com",   param: "q"     },
  ];

  function getEngineQueryParam() {
    const host = window.location.hostname;
    for (const { host: h, param } of ENGINE_QUERY_PARAMS) {
      if (host.includes(h)) return param;
    }
    return "q";
  }

  function applySiteFilter(keyword) {
    const selectors = [
      'input[name="text"]',
      'input.mini-suggest__input',
      'input[class*="suggest__input"]',
      'input[name="q"]',
      'textarea[name="q"]',
      'input.gLFyf',
      'input[name="wd"]',
      'input#kw',
      'input#sb_form_q',
      'input[name="p"]',
      'input[name="query"]',
      'input.searchboxinput',
      'input[aria-label="Search"]',
      'input[aria-label="Enter your search term"]',
      'input[aria-label="Search the web"]',
      'input[role="combobox"]',
      'input[type="search"]',
    ];

    let input = null;
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        input = el;
        log(`Input found with selector: ${selector}, value: ${el.value}`);
        break;
      }
    }

    if (!input) {
      input = Array.from(
        document.querySelectorAll('input[type="text"], input:not([type])'),
      ).find(
        (el) =>
          el.offsetParent !== null &&
          el.getBoundingClientRect().width > 50,
      ) || null;
      if (input) log("Input found via fallback visible-input scan");
    }

    if (!input) {
      console.error("Search input not found with any selector!");
      showToast(t.notFound || "搜尋輸入框未找到！");
      return;
    }
    if (!keyword.trim()) {
      console.error("Keyword is empty!");
      showToast(t.invalidSite || "請輸入有效網址！");
      return;
    }

    try {
      const url = new URL(location.href);
      const qParam = getEngineQueryParam();

      const rawQuery = (() => {
        if (window.location.hostname.includes("baidu.com")) {
          const baiduInput =
            document.querySelector("input#kw") ||
            document.querySelector('input[name="wd"]');
          if (baiduInput && baiduInput.value.trim()) return baiduInput.value.trim();
        }
        return url.searchParams.get(qParam) || input.value || "";
      })();

      let newQuery = rawQuery
        .replace(/(?:^|\s)-?site:[^\s]+/gi, "")
        .trim();
      newQuery = `${newQuery} site:${keyword}`.trim();

      const isBaidu = window.location.hostname.includes("baidu.com");
      if (!isBaidu && Array.isArray(domainBlacklist) && domainBlacklist.length > 0) {
        const blackStr = domainBlacklist
          .map(d => d.trim())
          .filter(d => d.length > 0)
          .map(d => `-site:${d}`)
          .join(" ");
        if (blackStr) newQuery = `${newQuery} ${blackStr}`;
      }

      url.searchParams.set(qParam, newQuery);
      log("New search URL:", url.toString());
      location.href = url.toString();
    } catch (error) {
      console.error("Error in applySiteFilter:", error);
      showToast(t.filterError);
    }
  }

  function showBlacklistDialog() {
    if (window.__blacklistDialogOpen) return;
    window.__blacklistDialogOpen = true;

    const t_bl = LANGUAGES[lang] || LANGUAGES["en"];
    const isDark = panelTheme === "dark";
    const bgColor = styleSettings.customBackgroundColor || (isDark ? "#2a2a2a" : "#fff");
    const fgColor = styleSettings.textColor || (isDark ? "#eee" : "#111");
    const borderColor = isDark ? "#555" : "#ccc";
    const radius = styleSettings.borderRadius != null ? styleSettings.borderRadius : 8;
    const fSize = styleSettings.fontSize != null ? styleSettings.fontSize : 13;

    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed", top: "0", left: "0", right: "0", bottom: "0",
      background: "rgba(0,0,0,0.4)", zIndex: "2147483649",
    });

    const box = document.createElement("div");
    Object.assign(box.style, {
      position: "fixed", top: "50%", left: "50%",
      transform: "translate(-50%,-50%)",
      background: bgColor, color: fgColor,
      padding: "18px 20px", borderRadius: radius + "px",
      boxShadow: "0 6px 24px rgba(0,0,0,0.3)",
      width: "340px", maxWidth: "90vw",
      fontSize: fSize + "px", zIndex: "2147483650",
      display: "flex", flexDirection: "column", gap: "10px",
    });

    const titleRow = document.createElement("div");
    Object.assign(titleRow.style, {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontWeight: "bold", fontSize: (fSize + 1) + "px",
    });
    const titleText = document.createElement("span");
    titleText.textContent = t_bl.blacklistTitle || "Domain Blacklist";
    const closeX = document.createElement("button");
    closeX.textContent = "✕";
    Object.assign(closeX.style, {
      background: "transparent", border: "none", cursor: "pointer",
      fontSize: (fSize + 2) + "px", color: fgColor, lineHeight: "1",
      padding: "0 2px",
    });
    titleRow.appendChild(titleText);
    titleRow.appendChild(closeX);
    box.appendChild(titleRow);

    const hint = document.createElement("div");
    hint.style.cssText = `font-size:${fSize - 1}px; color:${isDark ? "#aaa" : "#666"};`;
    hint.textContent = t_bl.blacklistPlaceholder || "One domain per line, e.g.: pinterest.com";
    box.appendChild(hint);

    const textarea = document.createElement("textarea");
    textarea.value = Array.isArray(domainBlacklist) ? domainBlacklist.join("\n") : "";
    textarea.placeholder = "pinterest.com\nquora.com\nmedium.com";
    Object.assign(textarea.style, {
      width: "100%", minHeight: "140px", boxSizing: "border-box",
      padding: "8px", borderRadius: radius + "px",
      border: "1px solid " + borderColor,
      background: isDark ? "#1e1e1e" : "#f9f9f9",
      color: fgColor, fontSize: fSize + "px", fontFamily: "monospace",
      resize: "vertical", outline: "none",
    });
    box.appendChild(textarea);

    const countRow = document.createElement("div");
    countRow.style.cssText = `font-size:${fSize - 1}px; color:${isDark ? "#aaa" : "#666"};`;
    const currentCount = Array.isArray(domainBlacklist) ? domainBlacklist.filter(d => d.trim()).length : 0;
    countRow.textContent = (t_bl.blacklistCount ? t_bl.blacklistCount(currentCount) : `Blocking ${currentCount} domain(s)`);
    textarea.addEventListener("input", () => {
      const lines = textarea.value.split("\n").filter(l => l.trim());
      countRow.textContent = (t_bl.blacklistCount ? t_bl.blacklistCount(lines.length) : `Blocking ${lines.length} domain(s)`);
    });
    box.appendChild(countRow);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex; justify-content:flex-end; gap:8px;";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = t_bl.cancel || "Cancel";
    Object.assign(cancelBtn.style, {
      padding: "5px 14px", borderRadius: radius + "px", cursor: "pointer",
      border: "1px solid " + borderColor,
      background: isDark ? "#444" : "#f0f0f0", color: fgColor,
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = t_bl.confirm || "Save";
    Object.assign(saveBtn.style, {
      padding: "5px 14px", borderRadius: radius + "px", cursor: "pointer",
      border: "1px solid #e05252",
      background: "#e05252", color: "#fff", fontWeight: "bold",
    });

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(saveBtn);
    box.appendChild(btnRow);

    function closeDialog() {
      window.__blacklistDialogOpen = false;
      overlay.remove();
    }
    function safeClose() {
      const hasContent = textarea.value.trim().length > 0;
      const isModified = textarea.value.trim() !== (Array.isArray(domainBlacklist) ? domainBlacklist.join("\n") : "");
      if (hasContent && isModified) {
        cancelBtn.textContent = (t_bl.confirm || "Confirm") + "?";
        cancelBtn.style.background = "#e05252";
        cancelBtn.style.color = "#fff";
        cancelBtn.style.border = "1px solid #e05252";
        cancelBtn.onclick = closeDialog;
        closeX.onclick = closeDialog;
        setTimeout(() => {
          cancelBtn.textContent = t_bl.cancel || "Cancel";
          cancelBtn.style.background = isDark ? "#444" : "#f0f0f0";
          cancelBtn.style.color = fgColor;
          cancelBtn.style.border = "1px solid " + borderColor;
          cancelBtn.onclick = safeClose;
          closeX.onclick = safeClose;
        }, 3000);
      } else {
        closeDialog();
      }
    }
    closeX.onclick = safeClose;
    cancelBtn.onclick = safeClose;

    saveBtn.onclick = () => {
      const lines = textarea.value.split("\n");
      const valid = [];
      const invalid = [];
      lines.forEach(raw => {
        const trimmed = raw.trim().toLowerCase();
        if (!trimmed) return;
        const parsed = parseSmartDomain(trimmed);
        if (parsed) {
          valid.push(parsed);
        } else {
          invalid.push(trimmed);
        }
      });

      domainBlacklist = [...new Set(valid)];
      GM_setValue("domainBlacklist", domainBlacklist);
      save();

      const blBtn = document.getElementById("blacklist-btn");
      if (blBtn) {
        const cnt = domainBlacklist.filter(d => d.trim()).length;
        blBtn.textContent = cnt > 0 ? `🚫 ${cnt}` : (t_bl.blacklistBtn || "🚫 Blacklist");
        blBtn.title = cnt > 0
          ? (t_bl.blacklistCount ? t_bl.blacklistCount(cnt) : `Blocking ${cnt}`) + "\n" + (t_bl.blacklistTitle || "Domain Blacklist")
          : (t_bl.blacklistTitle || "Domain Blacklist");
      }

      const msg = t_bl.blacklistSaved ? t_bl.blacklistSaved(domainBlacklist.length) : `Saved — ${domainBlacklist.length} blocked`;
      showToast(msg);
      if (invalid.length > 0) {
        invalid.forEach(d => {
          const warnMsg = t_bl.blacklistInvalid ? t_bl.blacklistInvalid(d) : `Invalid domain skipped: "${d}"`;
          setTimeout(() => showToast(warnMsg), 600);
        });
      }
      closeDialog();
    };

    const escHandler = (e) => { if (e.key === "Escape") { safeClose(); document.removeEventListener("keydown", escHandler); } };
    document.addEventListener("keydown", escHandler);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    setTimeout(() => textarea.focus(), 50);
  }

  function showUndoMessage(deletedSite, groupIndex, siteIndex) {
    const currentLangData = LANGUAGES[lang] || LANGUAGES["zh_TW"];
    const existingMsg = document.getElementById("undo-message");
    if (existingMsg) {
      existingMsg.remove();
    }

    const _undoIsDark   = panelTheme === "dark";
    const _undoAccent   = _undoIsDark ? "#7c6af7" : "#4f46e5";
    const _undoBg       = _undoIsDark
      ? `rgba(124,106,247,0.22)`
      : `rgba(79,70,229,0.88)`;
    const _undoBorder   = _undoIsDark
      ? "1px solid rgba(124,106,247,0.45)"
      : "1px solid rgba(79,70,229,0.6)";
    const _undoRadius   = Math.max(styleSettings.borderRadius ?? 6, 8) + "px";
    const _undoFontSize = (styleSettings.fontSize ?? 13) + "px";

    const undoMsg = document.createElement("div");
    undoMsg.id = "undo-message";
    undoMsg.style.cssText = `
      position:fixed; bottom:30px; left:50%;
      transform:translateX(-50%);
      background:${_undoBg}; color:#fff;
      border:${_undoBorder}; border-radius:${_undoRadius};
      box-shadow:0 8px 32px rgba(0,0,0,0.28);
      z-index:2147483650;
      display:flex; align-items:center; gap:16px;
      padding:14px 20px;
      font-size:${_undoFontSize}; font-weight:500;
      animation:slideUp 0.3s ease-out;
      backdrop-filter:blur(10px);
    `;
    if (!document.getElementById("undo-animation-style")) {
      const style = document.createElement("style");
      style.id = "undo-animation-style";
      style.textContent = `
      @keyframes slideUp {
        from {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
      }
      @keyframes slideDown {
        from {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }
        to {
          transform: translateX(-50%) translateY(100px);
          opacity: 0;
        }
      }
      @keyframes pulse {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
        100% {
          transform: scale(1);
        }
      }
    `;
      document.head.appendChild(style);
    }

    const messageText = document.createElement("span");
    const displayName = deletedSite.note || deletedSite.url;
    messageText.textContent = `Deleted "${displayName}"`;
    messageText.style.flex = "1";

    const undoBtn = document.createElement("button");
    undoBtn.textContent = "↩️ Undo";
    undoBtn.style.cssText = `
      background:rgba(255,255,255,0.22); color:#fff;
      border:1px solid rgba(255,255,255,0.38);
      padding:6px 14px; border-radius:${_undoRadius};
      cursor:pointer; font-size:${_undoFontSize}; font-weight:600;
      transition:background 0.18s, transform 0.15s; white-space:nowrap;
    `;
    undoBtn.onmouseover = () => { undoBtn.style.background = "rgba(255,255,255,0.35)"; undoBtn.style.transform = "scale(1.04)"; };
    undoBtn.onmouseout  = () => { undoBtn.style.background = "rgba(255,255,255,0.22)"; undoBtn.style.transform = "scale(1)"; };
    undoBtn.onclick = () => {
      const targetGroup = groups[groupIndex];
      if (targetGroup) {
        targetGroup.sites.splice(siteIndex, 0, deletedSite);
        save();

        const panel = document.getElementById("site-group-panel");
        if (panel) {
          renderSites(panel);
        }

        messageText.textContent = `✅ Restored "${displayName}"`;
        undoBtn.remove();
        setTimeout(() => {
          removeUndoMessage(undoMsg);
        }, 2000);
        log("站點已恢復:", {
          群組: targetGroup.name,
          站點: deletedSite.url,
          位置: siteIndex,
        });
      }
    };

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = `
    background: transparent;
    color: rgba(255, 255, 255, 0.8);
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 18px;
    font-weight: bold;
    transition: color 0.2s;
  `;

    closeBtn.onmouseover = () => {
      closeBtn.style.color = "white";
    };
    closeBtn.onmouseout = () => {
      closeBtn.style.color = "rgba(255, 255, 255, 0.8)";
    };
    closeBtn.onclick = () => {
      removeUndoMessage(undoMsg);
    };

    undoMsg.appendChild(messageText);
    undoMsg.appendChild(undoBtn);
    undoMsg.appendChild(closeBtn);
    document.body.appendChild(undoMsg);
    setTimeout(() => {
      if (document.getElementById("undo-message")) {
        removeUndoMessage(undoMsg);
      }
    }, 6000);
  }

  function removeUndoMessage(msgElement) {
    if (!msgElement || !msgElement.parentNode) return;
    msgElement.style.animation = "slideDown 0.3s ease-out";
    setTimeout(() => {
      if (msgElement && msgElement.parentNode) {
        msgElement.remove();
      }
    }, 300);
  }

  function showOnboarding() {
    if (GM_getValue("onboardingDone", false)) return;

    const ob = t.onboarding || {};
    const isDark = panelTheme === "dark";
    const fg = styleSettings.textColor || (isDark ? "#e8e8e8" : "#1a1a1a");
    const bg = isDark ? "#1e1e2e" : "#ffffff";
    const accent = isDark ? "#7c6af7" : "#4f46e5";
    const border = isDark ? "#3a3a5c" : "#d0d0d0";
    const radius = styleSettings.borderRadius + "px";

    const steps = [
      { title: ob.step0Title || "🔍 Finding the panel", body: ob.step0Body || "See the <b>🔍 button</b> on the page? Click it to open or close the main panel." },
      { title: ob.step1Title || "👋 Welcome!", body: ob.step1Body || "Click Add Group ➕ to get started." },
      { title: ob.step2Title || "📂 Group created!", body: ob.step2Body || "Now add a site inside the group." },
      { title: ob.step3Title || "✅ All set!", body: ob.step3Body || "Click any site to filter search. Enjoy!" },
    ];

    let currentStep = 0;

    const overlay = document.createElement("div");
    overlay.id = "ob-overlay";
    Object.assign(overlay.style, {
      position: "fixed", top: "0", left: "0", right: "0", bottom: "0",
      background: "rgba(0,0,0,0.55)",
      zIndex: "2147483660",
      display: "flex", alignItems: "center", justifyContent: "center",
      animation: "obFadeIn 0.3s ease",
    });

    if (!document.getElementById("ob-keyframes")) {
      const style = document.createElement("style");
      style.id = "ob-keyframes";
      style.textContent = `
        @keyframes obFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes obSlideUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
      `;
      document.head.appendChild(style);
    }

    const card = document.createElement("div");
    Object.assign(card.style, {
      background: bg, color: fg,
      border: `1px solid ${border}`,
      borderRadius: "14px",
      boxShadow: `0 12px 40px rgba(0,0,0,${isDark ? "0.6" : "0.2"})`,
      padding: "24px 26px 20px",
      minWidth: "280px", maxWidth: "360px",
      fontFamily: "sans-serif",
      fontSize: styleSettings.fontSize + "px",
      animation: "obSlideUp 0.3s ease",
      position: "relative",
    });

    const dots = document.createElement("div");
    dots.style.cssText = "display:flex;gap:6px;justify-content:center;margin-bottom:14px;";
    steps.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.style.cssText = `
        width:8px;height:8px;border-radius:50%;display:inline-block;
        background:${i === 0 ? accent : (isDark ? "#333" : "#ddd")};
        transition:background 0.2s;
      `;
      dot.dataset.dotIdx = i;
      dots.appendChild(dot);
    });
    card.appendChild(dots);

    const titleEl = document.createElement("div");
    titleEl.style.cssText = `font-weight:700;font-size:${styleSettings.fontSize + 3}px;margin-bottom:10px;color:${fg};`;
    card.appendChild(titleEl);

    const bodyEl = document.createElement("div");
    bodyEl.style.cssText = `line-height:1.65;color:${isDark ? "#c8c8d8" : "#444"};white-space:pre-wrap;margin-bottom:18px;`;
    card.appendChild(bodyEl);

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:8px;justify-content:flex-end;";

    const skipBtn = document.createElement("button");
    skipBtn.style.cssText = `
      padding:6px 14px;border-radius:8px;cursor:pointer;
      background:transparent;border:1px solid ${border};color:${isDark ? "#888" : "#999"};
      font-size:${styleSettings.fontSize}px;transition:opacity 0.15s;
    `;

    const nextBtn = document.createElement("button");
    nextBtn.style.cssText = `
      padding:6px 18px;border-radius:8px;cursor:pointer;
      background:${accent};border:none;color:#fff;
      font-size:${styleSettings.fontSize}px;font-weight:600;
      box-shadow:0 2px 8px ${accent}66;transition:opacity 0.15s;
    `;
    nextBtn.addEventListener("mouseenter", () => { nextBtn.style.opacity = "0.85"; });
    nextBtn.addEventListener("mouseleave", () => { nextBtn.style.opacity = "1"; });

    btnRow.appendChild(skipBtn);
    btnRow.appendChild(nextBtn);
    card.appendChild(btnRow);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    function updateStep(idx) {
      currentStep = idx;
      const s = steps[idx];
      titleEl.textContent = s.title;
      bodyEl.textContent = "";
      s.body.split(/(<b>.*?<\/b>)/g).forEach(part => {
        if (part.startsWith("<b>") && part.endsWith("</b>")) {
          const bEl = document.createElement("b");
          bEl.textContent = part.slice(3, -4);
          bodyEl.appendChild(bEl);
        } else {
          bodyEl.appendChild(document.createTextNode(part));
        }
      });
      skipBtn.textContent = ob.skip || "Skip";
      nextBtn.textContent = idx < steps.length - 1 ? (ob.next || "Next →") : (ob.finish || "Got it!");
      dots.querySelectorAll("span").forEach((dot, i) => {
        dot.style.background = i === idx ? accent : (isDark ? "#333" : "#ddd");
      });
    }

    function finish() {
      GM_setValue("onboardingDone", true);
      overlay.style.animation = "obFadeIn 0.2s ease reverse";
      setTimeout(() => overlay.remove(), 200);
    }

    skipBtn.addEventListener("click", finish);
    nextBtn.addEventListener("click", () => {
      if (currentStep < steps.length - 1) {
        updateStep(currentStep + 1);
      } else {
        finish();
      }
    });

    updateStep(0);
  }

  function createToggleButton() {
    log(
      "Creating toggle button with defaultPanelOpen:",
      defaultPanelOpen,
    );

    if (window.__toggleButtonObserver) {
      window.__toggleButtonObserver.disconnect();
    }

    window.__toggleButtonObserver = new MutationObserver((mutations) => {
      const btn = document.getElementById("site-toggle-simple");
      if (!btn && document.body) {
        warn("Toggle button removed, recreating...");
        createToggleButton();
      }
    });

    window.__toggleButtonObserver.observe(document.body, {
      childList: true,
      subtree: false,
    });

    window.addEventListener(
      "unload",
      () => {
        if (window.__toggleButtonObserver) {
          window.__toggleButtonObserver.disconnect();
          window.__toggleButtonObserver = null;
        }
      },
      { once: true },
    );

    const existingToggle = document.getElementById("site-toggle-simple");
    if (existingToggle) {
      existingToggle.remove();
    }

    const toggleBtnSimple = document.createElement("button");
    toggleBtnSimple.id = "site-toggle-simple";

    const savedTop  = GM_getValue("toggleButtonTop",  null);
    const savedLeft = GM_getValue("toggleButtonLeft", null);

    const defaultTop  = Math.round(window.innerHeight * 0.42) + "px";
    const defaultLeft = (window.innerWidth - 64) + "px";

    toggleBtnSimple.style.top  = (savedTop  && isValidPixelValue(savedTop))  ? savedTop  : defaultTop;
    toggleBtnSimple.style.left = (savedLeft && isValidPixelValue(savedLeft)) ? savedLeft : defaultLeft;

    applyToggleBtnStyle(toggleBtnSimple);

    let isDragging = false;
    let startX, startY;
    let dragStartTime;
    let _resetHoldTimer = null;

    toggleBtnSimple.addEventListener("mousedown", (e) => {
      dragStartTime = Date.now();
      isDragging = true;
      const rect = toggleBtnSimple.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;
      e.preventDefault();

      _resetHoldTimer = setTimeout(() => {
        isDragging = false;
        toggleBtnSimple.style.top  = defaultTop;
        toggleBtnSimple.style.left = defaultLeft;
        GM_setValue("toggleButtonTop",  defaultTop);
        GM_setValue("toggleButtonLeft", defaultLeft);
        showToast(t.toggleReset || "🔍 Reset position");
      }, 1500);
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        if (_resetHoldTimer) { clearTimeout(_resetHoldTimer); _resetHoldTimer = null; }
        const newLeft = e.clientX - startX;
        const newTop  = e.clientY - startY;
        toggleBtnSimple.style.left =
          Math.max(10, Math.min(newLeft, window.innerWidth - 58)) + "px";
        toggleBtnSimple.style.right = "auto";
        toggleBtnSimple.style.top =
          Math.max(10, Math.min(newTop, window.innerHeight - 58)) + "px";
      }
    });

    document.addEventListener("mouseup", () => {
      if (_resetHoldTimer) { clearTimeout(_resetHoldTimer); _resetHoldTimer = null; }
      if (isDragging) {
        isDragging = false;
        const dragDuration = Date.now() - dragStartTime;
        if (dragDuration > 200) {
          const newTop  = toggleBtnSimple.style.top;
          const newLeft = toggleBtnSimple.style.left;
          if (isValidPixelValue(newTop) && isValidPixelValue(newLeft)) {
            GM_setValue("toggleButtonTop",  newTop);
            GM_setValue("toggleButtonLeft", newLeft);
          }
        }
      }
    });

    toggleBtnSimple.onclick = (e) => {
      e.preventDefault();
      const clickDuration = Date.now() - dragStartTime;
      if (clickDuration < 200 || !dragStartTime) {
        let panel = document.getElementById("site-group-panel");

        if (!panel) {
          log("Panel not found, creating and showing new one");
          createPanel();
          panel = document.getElementById("site-group-panel");
          if (panel) {
            showPanel(panel);
            manuallyClosed = false;
            GM_setValue("manuallyClosed", manuallyClosed);
          }
          return;
        }

        const isPanelHidden = panel.style.display === "none";
        if (isPanelHidden) {
          showPanel(panel);
          manuallyClosed = false;
        } else {
          hidePanel(panel);
          manuallyClosed = true;
        }
        GM_setValue("manuallyClosed", manuallyClosed);

        panel.dataset.manuallyClosed = manuallyClosed ? "true" : "false";
        setTimeout(() => {
          delete panel.dataset.manuallyClosed;
        }, 1000);
      }
    };

    if (document.body) {
      document.body.appendChild(toggleBtnSimple);
    } else {
      console.error("document.body is not available");
    }

    setTimeout(() => {
      if (!document.body) return;
      let panel = document.getElementById("site-group-panel");
      if (defaultPanelOpen && !panel?.dataset.manuallyClosed) {
        if (!panel) {
          createPanel();
          panel = document.getElementById("site-group-panel");
        }
        if (panel) {
          showPanel(panel);
          manuallyClosed = false;
          GM_setValue("manuallyClosed", manuallyClosed);
        }
      }
    }, 100);
  }
  (function (global) {
    let lastUrl = location.href;
    let renderTimer = null;
    let checkAttempts = 0;
    const MAX_ATTEMPTS = 10;

    const triggerChange = () => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        checkAttempts = 0;
        log("偵測到網址變更,執行環境檢查...");

        const panel = document.getElementById("site-group-panel");
        if (!panel) return;

        clearTimeout(renderTimer);

        const safeRender = () => {
          checkAttempts++;

          if (checkAttempts > MAX_ATTEMPTS) {
            warn("已達最大嘗試次數,放棄渲染");
            return;
          }

          if (document.readyState === "loading") {
            renderTimer = setTimeout(safeRender, 300);
            return;
          }

          const searchInput = document.querySelector(
            'input[name="q"], textarea[name="q"], input#sb_form_q, ' +
            'input[name="text"], input[name="p"], input[name="query"], ' +
            'input[name="wd"], input[name="word"], input[name="search_query"]',
          );

          if (!searchInput) {
            if (checkAttempts < MAX_ATTEMPTS) {
              renderTimer = setTimeout(safeRender, 500);
            }
            return;
          }

          try {
            renderSites(panel);
            if (defaultPanelOpen && !manuallyClosed) {
              showPanel(panel);
            }
            applyAllBtnIcons();
            const _tb = document.getElementById("site-toggle-simple");
            if (_tb) applyToggleBtnStyle(_tb);
          } catch (err) {
            console.error("渲染過程發生錯誤:", err);
          }
        };

        safeRender();
      }
    };

    const _push = history.pushState;
    history.pushState = function () {
      const ret = _push.apply(this, arguments);
      triggerChange();
      return ret;
    };

    const _replace = history.replaceState;
    history.replaceState = function () {
      const ret = _replace.apply(this, arguments);
      triggerChange();
      return ret;
    };

    window.addEventListener("popstate", triggerChange);
    window.addEventListener("hashchange", triggerChange);

    const urlCheckTimer = setInterval(triggerChange, 5000);

    window.addEventListener(
      "unload",
      () => {
        clearInterval(urlCheckTimer);
        clearTimeout(renderTimer);
      },
      { once: true },
    );

    triggerChange();
    createToggleButton();
    setTimeout(showOnboarding, 800);
  })({});
})();