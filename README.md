# ✨ Organise, Filter, and Cross-Engine Search from One Panel

**A floating panel that adds site-group filtering, a time range selector, a domain blacklist, and a multi-engine switcher to major search engines — all accessible from a single 🔍 button on the page.**

---

> 💡 **Overview**
> This script is **not** a general-purpose search tool or a search-engine switcher.
> Its primary purpose is to help you manage and apply `site:<domain>` parameters while you search.
> You define groups of domains you frequently want to scope your searches to, and the script appends the appropriate `site:` filter to your current query instantly.
>
> Secondary tools bundled alongside the core feature include: a segmented time-range control (from 1 hour up to 9 years), a quick engine-switcher bar for navigating across engines with the same keyword, a domain blacklist to suppress unwanted results, and configurable keyword exclusion fields. After installation, a draggable 🔍 button appears on any supported search engine — clicking it opens the main panel where all these controls live. The panel itself is draggable and resizable.

---

## 🎛 Panel Entry Points

| Control | Feature Name | Where It Appears |
|---|---|---|
| 🔍 | Main Toggle Button | Floating on every supported search results page; drag to any screen position |
| 🕐 | Time Filter | Inside the panel, below the engine icon bar; quick-select segments + full range |
| ⚙️ | Search Settings | Inside the panel, bottom toolbar |
| 🎨 | Style Settings | Expands as a side panel when clicked from the main toolbar |
| 📌 | Panel Behaviour Menu | Top-right corner of the main panel |
| 🔧 | Search Engine Manager | Top-right area of the main panel header |
| ☰ | Collapse Search Settings | Overlaid on the search settings section when the panel is open |
| 🚫 | Domain Blacklist | Inside the Search Settings section |
| ⊞ | Compact Mode Toggle | Appears near the 🔍 button after hovering over it for one second |

---

## 🚀 Core Features

### 🗂️ Site Groups

Organise domains you frequently search into named groups (e.g. "News", "Dev", "Docs"). Each group can hold multiple domain entries, each optionally labelled with a short note of up to four characters.

- Click **Add Group ➕** to create a new group and give it a name.
- Click **Add Site ➕** inside a group to register a domain (e.g. `github.com`). Optionally add a short display note.
- **Left-click** any site button to immediately redirect your current search with a `site:` domain filter applied.
- **Long-press and drag** a site button to reorder entries within the group.
- Click **⋯** on any site button to open its context menu: edit the URL or note, delete the entry, or open the domain in the same or a new tab.
- Use the search bar at the top of the panel to filter visible site buttons by URL or note text.
- Toggle between displaying URLs and notes on the site buttons using the **Show Addresses / Show Notes** control.

### ☑️ Multi-Select Mode

Select multiple sites within a group and act on them all at once.

- Click **☑** on a group header to enter multi-select mode. Selected sites are highlighted.
- Click sites to toggle their selection on or off.
- When ready, choose a send mode: a combined `site:A OR site:B` search (same tab or new tab), or open each site directly without attaching a keyword.
- Optionally save the selection so the same sites remain pre-selected the next time you open multi-select for that group.
- Exit multi-select by clicking **☑** again or by clicking **↗ Open Selected**.

### 🕐 Time Filter

Restrict search results to a specific time window using the control below the engine icon bar.

- Six quick-access segments — **Unlimited / 1h / 1d / 1w / 1m / 1y** — allow one-click switching between the most common ranges.
- The full set of 23 preset intervals (from Within 1 hour to Within 9 years) is also available.
- When the active engine does not support time filtering, the entire row appears dimmed and a notification is shown on click.
- Select **Unlimited** to clear the time restriction.
- The selected range carries across engine switches.

### 🔀 Engine Switcher

Jump to a different search engine while keeping your current keyword.

- The top row of the panel displays up to 5 engine icons as quick-access shortcuts.
- Click any icon to navigate to that engine with the active search term.
- Open the **Search Engine Manager** to view and reorder the full engine list. Drag ⠿ handles to rearrange — the top 5 positions are shown as icons.
- Use **🔍 Auto-Detect Current Site** to register the page you are currently on as a new engine entry.
- Engines can be opened in a new window using the **⧉** button.
- Enable **🔒 Lock Engine Hint** to show a reminder when navigating away from your preferred engine.

### 🚫 Domain Blacklist

Block specific domains from appearing in your search results.

- Open **🚫 Blacklist** from the Search Settings section to manage blocked domains.
- Enter one domain per line (e.g. `pinterest.com`). Invalid entries are skipped with a notification.
- The blacklist is applied automatically across all supported engines and persists between sessions.
- The blacklist button can be hidden from the toolbar via Style Settings if you prefer a cleaner interface.

### ⚙️ Search Settings

Accessible via the ⚙️ button inside the panel.

- Set up to two **exclude keywords**, which are automatically appended as `-keyword` operators to every search.
- Open the **Search Syntax Reference 📖** for a quick-reference card covering common operators such as `inurl:`, `intitle:`, `filetype:`, and `site:`.
- View the panel-level **help guide** for a full description of all controls and gestures.

---

## ⚠️ Experimental Features & Known Limitations

### 🔒 Safe Search OFF

An opt-in toggle that attempts to inject URL parameters (e.g. `safe=off`) to disable a search engine's content filter on each navigation.

- **No guarantee of effectiveness.** Engines may ignore these parameters or change their implementation at any time.
- **Baidu is not supported** by this feature.
- A one-time explanation card is shown the first time you enable this option.

### 🌐 Search Region: All

An opt-in toggle that attempts to remove or replace country/region parameters from search URLs so results are not limited to a specific country.

- **No guarantee of effectiveness.** Engines may override this behaviour through IP detection or other means.
- **Baidu and Naver are not supported** by this feature.
- A one-time explanation card is shown the first time you enable this option.

### Known Constraints

| Situation | Impact | Recommended Action |
|---|---|---|
| Engine does not support time filtering | Time Filter row appears dimmed; clicking shows a notification | Use a supported engine (Google, Bing, Brave, Yahoo, etc.) |
| Safe Search OFF on Baidu | Feature has no effect | Adjust content settings directly in Baidu |
| Search Region: All on Baidu / Naver | Feature has no effect | Adjust region settings directly in the engine |
| Search history | Stored locally; the most recent 20 queries are kept | Clear history manually from the search bar area if needed |

---

## ⚙️ Additional Features

### 📌 Panel Behaviour

The **📌** button in the top-right corner of the panel cycles through three states:

- **⛔ OFF** — Panel stays closed by default; open manually with 🔍.
- **✅ ON** — Panel opens automatically on every page load.
- **📌 Pinned** — Panel is always visible and cannot be dismissed.

The **Safe Search OFF** and **Search Region: All** toggles are also accessible from this menu.

### 🎨 Style Settings

Expand the style panel from the **🎨** button to adjust the panel's visual appearance without editing the script.

- **Quick Scheme**: Apply a full ☀️ Light or 🌑 Dark colour scheme in one click, or ↺ Reset to defaults.
- **Theme**: Light ☀️, Dark 🌙, or Custom 🎨.
- **Style preset**: Default, Soft, or Bold.
- **Search Bar Style**: Independent colour, opacity, text colour, and glow controls for the search bar area.
- **Border Glow / Sheen**: Enable a glowing outline or angled sheen effect on the panel border.
- **Site Button Glow / Group Block Glow**: Add a subtle glow to individual site buttons or group containers.
- **Individual controls**: border radius, font size, opacity, contrast, button opacity, group opacity, text colour, background colour, text clarity boost, overlay darkening, and overlay strength.
- **Toggle Button Style**: Choose between 🔍 Emoji, SVG outline, or SVG filled icon for the floating toggle button. Set its background colour, opacity, and icon colour from a preset palette.
- **Background image**: Upload a local image and configure its display mode (Center, Tile, Contain, Auto), position offsets, scale, and opacity.
- **Reset Styles 🔄**: Restores all appearance settings to their defaults.

### 📐 Panel Layout & Resize

- Drag the panel header to reposition the panel anywhere on screen. Its position is remembered across sessions.
- Drag the **resize grip** in the bottom-right corner to freely adjust the panel width and maximum height. The adjusted size is remembered across sessions.
- Fine-tune the panel's position and dimensions numerically from within Style Settings.

### 🌐 Language

The panel interface supports English, Traditional Chinese, Simplified Chinese, Japanese, and Korean. Switch languages from within the panel settings. A **Custom** language slot is also available — export the template JSON, translate the values, and re-import it to apply.

### 📤 Import / Export Config

Export your current configuration (site groups, engine list, style settings, and all preferences) as a JSON file. Import a previously exported file to restore or transfer your setup to another browser or machine.

### 📋 Search History

The panel maintains a local history of recent `site:` searches. Access it from the search bar area to quickly revisit previous queries. History can be cleared at any time.

### ⊞ Compact Mode

A minimal floating widget that replaces the full panel with a smaller, always-visible overlay — useful when you want quick site access without the full panel taking up screen space.

- Hover over the 🔍 toggle button for about one second. A secondary button (⊞) slides out from behind it.
- Click ⊞ to switch into compact mode. The main panel hides and a small floating widget appears in its place.
- The widget shows a group dropdown at the top, a grid of site favicon buttons below it, and a row of engine icons along the bottom. Clicking any site button applies the `site:` filter exactly as the full panel does.
- Switch between site groups using the dropdown at the top of the widget.
- Toggle between light and dark appearance using the ☀️/🌙 button on the widget's handle bar.
- Drag the handle bar to reposition the widget anywhere on screen. Its position, selected group, and theme choice are all remembered across sessions.
- Click ✕ on the widget — or hover 🔍 and click the ⊟ button that replaces ⊞ — to exit compact mode and restore the full panel.

---

- This userscript is primarily maintained on Greasy Fork.
- Built with AI assistance by a hobbyist developer. Bug fixes and updates may not be immediate.
- Feedback is welcome. Responses may be assisted by translation tools if needed.