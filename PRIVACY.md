# Privacy Policy — IP Find

**Last updated:** 2026-05-15

## Overview

IP Find ("the extension") is an open-source Chrome extension that helps you look up your own public IP address and any other IP address you enter. **The extension does not collect, store, transmit, or share any personal data with the developer or any third party for tracking purposes.**

There is no analytics, no telemetry, no advertising, and no backend server operated by the developer.

## What the extension does

When you use the extension, the following network requests are made **directly from your browser**:

1. **Your own IP lookup** — opening the popup sends one request to `https://json.geoiplookup.io/` to retrieve your public IP address and approximate location.
2. **Manual lookups** — when you click *Search*, the extension sends the IP you typed to `https://json.geoiplookup.io/?ip=<ip>` to retrieve information about it.

These requests are subject to [geoiplookup.io's own privacy policy](https://geoiplookup.io/privacy). The developer of IP Find does not see, log, or proxy any of this traffic.

## Data stored on your device

The extension stores the following in your browser's `localStorage`. **This data never leaves your computer:**

- **Recent search history** — up to 6 IP addresses you have looked up, with the country and city returned for each.
- **Theme preference** — whether you chose light or dark mode.

You can clear the history at any time with the **Clear** button in the popup, or by removing the extension's site data via Chrome's settings.

## Permissions

| Permission | Why it is needed |
|---|---|
| `clipboardWrite` | To copy an IP to your clipboard when you click *Copy*. |
| `clipboardRead`  | To paste an IP from your clipboard when you click *Paste*. |

Both actions are user-initiated. The extension never reads or writes the clipboard in the background.

## What the extension does NOT do

- It does not collect or transmit personally identifiable information.
- It does not track you across websites.
- It does not show advertising or contact ad networks.
- It does not sell, rent, or share data with any third party.
- It does not load or execute remote code.
- It does not require an account or login.

## Source code

The extension is open source under the MIT license. You can audit the full source code at:
<https://github.com/NatLee/IP-FIND-ChromeExtension>

## Contact

Questions or concerns? Please open an issue at:
<https://github.com/NatLee/IP-FIND-ChromeExtension/issues>

## Changes to this policy

Any future changes will be reflected in this file with the *Last updated* date revised. Material changes will additionally be noted in the project's GitHub Releases.

---

## 隱私權政策（繁體中文）

**最後更新：** 2026-05-15

### 總覽

IP Find 是一個開放原始碼的 Chrome 擴充功能，協助您查詢自己的公開 IP 或任何輸入的 IP。**本擴充功能不會為了追蹤目的，向開發者或任何第三方收集、儲存、傳送或分享任何個人資料。** 沒有分析工具、沒有遙測、沒有廣告，開發者也不運作任何後端伺服器。

### 擴充功能的行為

使用本擴充功能時，瀏覽器會**直接**對外發出以下請求：

1. **查詢您自己的 IP** — 開啟 popup 時，會向 `https://json.geoiplookup.io/` 發出一次請求，以取得您的公開 IP 與大致位置。
2. **手動查詢** — 您按下「Search」時，會將您輸入的 IP 送到 `https://json.geoiplookup.io/?ip=<ip>` 以查詢資訊。

上述請求適用 [geoiplookup.io 自身的隱私權政策](https://geoiplookup.io/privacy)。本擴充功能開發者不會接觸、記錄或代理這些流量。

### 儲存於您裝置上的資料

擴充功能會在您瀏覽器的 `localStorage` 中儲存以下資料，**這些資料絕不會離開您的電腦：**

- **最近的查詢歷史** — 最多保留 6 筆您查詢過的 IP，連同回應的國家與城市。
- **主題偏好** — 您選擇的深色或淺色模式。

您可以隨時透過 popup 中的「Clear」按鈕清除歷史，或透過 Chrome 設定移除本擴充功能的網站資料。

### 權限

| 權限 | 用途 |
|---|---|
| `clipboardWrite` | 當您按下「Copy」時，將 IP 寫入剪貼簿。 |
| `clipboardRead`  | 當您按下「Paste」時，從剪貼簿讀取 IP。 |

兩者都需使用者主動觸發，擴充功能不會在背景讀寫剪貼簿。

### 本擴充功能不會做的事

- 不會收集或傳送任何個人識別資訊。
- 不會跨網站追蹤您。
- 不會顯示廣告或聯繫任何廣告網路。
- 不會販售、出租或與第三方分享您的資料。
- 不會載入或執行遠端程式碼。
- 不需要任何帳號或登入。

### 原始碼

本擴充功能採用 MIT 授權釋出，完整原始碼可於下列網址檢視：
<https://github.com/NatLee/IP-FIND-ChromeExtension>

### 聯絡方式

如有疑問或建議，請於下列網址開立 issue：
<https://github.com/NatLee/IP-FIND-ChromeExtension/issues>

### 政策異動

未來的任何變更皆會反映在此檔案，並更新「最後更新」日期。重大變更也會在 GitHub Releases 中註明。
