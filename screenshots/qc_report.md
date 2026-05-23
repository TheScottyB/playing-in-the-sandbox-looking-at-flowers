# App Store Screenshot Quality Control Report

*Generated on: 5/22/2026, 10:33:52 PM*

## Summary

- **Total screenshots found**: 2
- **Critical Issues (App Store Rejections)**: <span style="color:red">**4**</span>
- **Warnings / Design Recommendations**: <span style="color:orange">**3**</span>

> [!CAUTION]
> **4 critical issues detected!** Screenshots containing alpha channels, incorrect dimensions, or showing developer menu screens will be rejected by Apple App Store Connect. Use the `npm run qc-screenshots -- --fix` command to resolve alpha channels and formats automatically.

## Detailed Results

### `iphone_pro_max/light/flowers/flowers_gallery_preview.png`

- **Path**: [flowers_gallery_preview.png](file:///Users/scottybe/workspace/playing-in-the-sandbox-looking-at-flowers/screenshots/iphone_pro_max/light/flowers/flowers_gallery_preview.png)
- **Format**: PNG
- **Dimensions**: `1290 x 2796 px`
- **Alpha Channel**: 🔴 Yes (Rejected by Apple)
- **File Size**: `3.56 MB`

#### 🔴 Critical Issues:
- Contains an **alpha channel (transparency)**. App Store Connect will reject this screenshot.
- Looks like a screenshot of the **iOS Simulator Home Screen (Springboard)**, not the app.

#### ⚠️ Warnings:
- Large file size: **3.56 MB**. We recommend compressing screenshots to speed up downloads and uploads.

#### 🟢 Passed Checks:
- Format is PNG
- Dimensions match iPhone Pro Max (6.7") (`1290x2796`)

<details>
<summary>Extracted Text (OCR)</summary>

```text
TT i)

NIOPRT A "Fe FRIDAY

11

a

SAMERICA
mm

No events today

Maps Calendar

Calendar Photos

Reminde News

Wallet Settings

Q Search

) @
```

</details>

---

### `mcp_screenshot_post_tap.jpg`

- **Path**: [mcp_screenshot_post_tap.jpg](file:///Users/scottybe/workspace/playing-in-the-sandbox-looking-at-flowers/screenshots/mcp_screenshot_post_tap.jpg)
- **Format**: JPEG
- **Dimensions**: `960 x 2083 px`
- **Alpha Channel**: 🟢 No
- **File Size**: `0.10 MB`

#### 🔴 Critical Issues:
- Incorrect format: file is **JPEG**, but App Store screenshots **MUST** be PNG.
- Looks like a screenshot of the **Expo Development Launcher / Expo Go** screen instead of the application.

#### ⚠️ Warnings:
- Misplaced screenshot found in root `screenshots/` directory.
- Status bar time is `5:19`. Apple's design guidelines recommend standardizing simulator time to `9:41`.

#### 🟢 Passed Checks:
- No alpha channel
- File size is optimized (0.10 MB)

<details>
<summary>Extracted Text (OCR)</summary>

```text
5:19

Specimen Sandbox
Development Build

DEVELOPMENT SERVERS

Specimen Sandbox
http://192.168.1.206:8081

> Enter URL manually

Home

INFO

Vv
```

</details>

---

