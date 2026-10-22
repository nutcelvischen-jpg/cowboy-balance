# 手機終結者 · Tilt Rodeo

> 傾斜手機，穩住牛仔！挑戰 30 秒暴走騎牛存活紀錄！

🎮 **線上試玩（手機／電腦皆可直接玩）**：  
👉 **[https://nutcelvischen-jpg.github.io/cowboy-balance/](https://nutcelvischen-jpg.github.io/cowboy-balance/)**

🗣️ **配音與電子音樂試聽頁**：  
👉 **[https://nutcelvischen-jpg.github.io/cowboy-balance/audio-preview.html](https://nutcelvischen-jpg.github.io/cowboy-balance/audio-preview.html)**

*(使用 HTTPS 網址可完整啟用手機陀螺儀／方向感測傾斜操控)*

---

手機傾斜平衡遊戲 v0.5.0，使用 Blender 製作的卡通牛仔與牛。牛仔騎在持續甩動的牛上；往反方向傾斜手機，把重心拉回中央，挑戰 30 秒通關。這是獨立新專案，沒有修改敲釘遊戲。

## 開啟

```bash
cd "/Users/chenchunchih/Documents/ChatGPT/遊戲王/cowboy-balance"
python3 server.py
```

電腦預覽：http://localhost:8094/

不需要 npm install，不需要編譯，也沒有 API 金鑰。Three.js 0.160.1 和 Rye 字體已放在專案裡，遊戲執行不依賴 CDN。

## 手機傾斜操作

1. 把遊戲檔案放到支援 HTTPS 的靜態網站（例如自己的 GitHub Pages）。
2. 使用手機 Safari / Chrome 開啟網站，點「啟用手機傾斜」。
3. 若瀏覽器詢問動作與方向感測權限，選允許。
4. 用舒服的角度拿穩手機，點「校正好了，上牛！」，等待三秒倒數。
5. 牛仔往右倒，手機輕輕往左斜；反過來亦然。不要猛甩手機。
6. 轉換直向／橫向、切到背景或感測資料中斷時會暫停，繼續時重新校正中央角度。

**手機直接開 `http://電腦IP:8094/` 通常無法使用方向感測器。** localhost 是目前電腦的測試網址，不是手機的遠端 HTTPS 網址。區網 HTTP 可以先用觸控試玩；要驗證感測器請用有效 HTTPS 網址。這個專案尚未部署公開網站，尚未在實體手機校驗傾斜軸向與手感。

瀏覽器要求參考：[MDN DeviceOrientationEvent.requestPermission](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static)。感測資料只在本機使用，不傳送、不儲存。

## 備援與規則

- 沒有感測器或拒絕權限：選「觸控／方向鍵試玩」。
- 手機按住向左、向右；電腦按 ← / → 或 A / D。
- 綠色範圍是穩定區，白色指標是牛仔目前的重心。
- 偏得太多會消耗抓握力，極度傾斜或抓握力歸零就會摔落。
- 撐滿 30 秒即通關。每 6 秒一階段，最後一階段連續暴走。
- 全場 17 次衝擊，每擊提前 0.85 秒顯示真正方向；連擊至少相隔 1.1 秒。
- 假動作只影響牛的動畫，不偷偷施加反向力；真正出手仍有預告。
- 前四波最後 1.2 秒喘息，回到中央可加速恢復抓握力。
- 最佳秒數存於這個瀏覽器的 localStorage；不需登入。
- 暫停按鈕或 Escape 暫停；切到背景自動暫停，不會繼續扣時間。
- 音效與電子配樂由 Web Audio 合成；台語老闆配音為預先產生的 8 個 MP3。遊戲執行不呼叫 TTS 服務。

## 檔案

| 檔案 | 用途 |
|---|---|
| index.html / styles.css | 手機與桌面介面、字幕、狀態 |
| app.js | 主流程、觸控、鍵盤、暫停、紀錄 |
| model.js | 固定步長物理、擾動、抓握力與難度 |
| sensor.js | 方向感測器授權、軸向、校正、平滑與中斷判斷 |
| scene.js | GLB 模型載入、場景、牛身旋轉中心、摔落與落地鏡頭 |
| motion.js | 斜側面姿勢、側翻、抬身、甩頭、四腿踢動及減少動態模式 |
| assets/models/ | bull.glb、cowboy.glb，兩個可獨立替換的模型 |
| models/ | Blender 原始檔、重建腳本與幾何檢查結果 |
| audio.js | 電子音樂、音效、配音排程與混音 |
| voice/ / voice_lines.json | 8 個台語 MP3、台詞、台羅與生成 prompt |
| audio-preview.html | 配音及五種節奏強度試聽頁 |
| scripts/generate_voice.py | 使用環境變數金鑰重建配音 |
| vendor/ | 本地 Three.js 與 MIT 授權 |
| assets/fonts/ | Rye 字體與 SIL Open Font License |
| tests/ | 模型、感測器單元測試及尺寸預覽 |
| server.py | 8094 埠開發伺服器 |

可調手感：sensor.js 的 12 度為完整輸入力道，平滑係數 12；model.js 的輸入力道 7.4、第一擊 2.4 秒、傾斜上限 1.2。角色已換成 Blender 製作的模型：牛角、眉眼、牛尾、四腿；牛仔帽、鬍子、背心、手臂、領巾及靴子。遊戲透過命名的關節節點驅動動作；不是骨架蒙皮模型。載入時暫停開始按鈕；資源失敗會顯示提示，並保留簡易角色可玩。

## 測試

```bash
npm test
```

包含反向救回、錯向摔落、30／60／120 fps、暫停、甩動預告、感測器權限、校正、無效資料及方向切換的模擬測試。這些測試不能替代 iOS／Android 實機感測器測試。

尺寸預覽：http://localhost:8094/tests/preview.html

## 上線檔案

部署根目錄的 HTML / CSS / JS、icon.svg、.nojekyll、assets/、voice/ 和 vendor/ 即可。所有執行資源都是相對路徑，能放在網站的子路徑下。不要部署開發過程的 .impeccable/surfaces/ 與 review/；完整交付 ZIP 會排除這些內部紀錄。

## Blender 原始檔與重建

- `models/rodeo_characters.blend`：牛與牛仔的組裝場景、材質與預覽燈光。
- `models/build_rodeo.py`：完整可重建腳本。以獨立背景程序執行，會清空該程序的起始場景；不要貼到有未存檔作品的 Blender 視窗執行。
- `models/geometry-audit.json`：118 個零件的邊界與 55 組連接檢查。
- `docs/blender-characters.png`：Blender 渲染預覽。

```bash
/Applications/Blender.app/Contents/MacOS/Blender -b --python models/build_rodeo.py
```

重建需 Blender 5.1（目前用 5.1.1 驗證），會重新輸出兩個 GLB、來源 blend 與預覽 PNG。正常遊玩不需要安裝 Blender。兩個 GLB 合計約 824 KB，沒有外部貼圖或解壓縮服務依賴。

牛的活動節點：`Head`、`Tail`、`Leg_LF`、`Leg_LB`、`Leg_RF`、`Leg_RB`；牛仔：`Torso`、`Arm`、`Scarf`。修改模型時保留節點名稱與原點。匯出牛仔以馬鞍中心為原點，遊戲會將其放到坐騎上。

v0.2.0 介面改為深綠操控區、金色主按鈕與更清楚的平衡條。直向以角色為中心；橫向改為右側操作區。摔落時鏡頭會退開，並將角色落點保持在地面上。

## v0.3.0 手機終結者

加強牛身左右翻滾、躍起、蹄部踢動與短暫鏡頭衝擊。平衡條和操作區保持固定，系統「減少動態效果」會停用額外跳動、鏡頭震動及塵土。操控只需要約 ±12° 傾斜；超過此角度不增加力道，沒有甩動加分或脫手機制。

通關有獨立的成功音效、結算及重玩。新版紀錄使用獨立 localStorage key，避免舊版無限存活時間混入 30 秒紀錄。

平衡測試：100 個固定種子在 30/60/120 fps 下以即時回授控制全部通關；增加 200ms 回應延遲和輸入濾波後，100 個種子中有 46 次通關、54 次失敗。這是人工控制器模擬，**不是人類玩家勝率**，仍需實體手機試玩調整。

`tests/challenge.html` 是使用正式 app.js 的模擬感測器自動操作頁，測試紀錄隔離於記憶體，不會寫入正式最高分。它不代表實機感測器驗證，亦不應作為上線遊戲入口。

## v0.4.0 台語配音與電子音樂

粗獷台灣老闆角色使用 Algenib 合成聲線，沿用先前敲釘遊戲的聲音方向。8 句台語台羅腳本見 `voice_lines.json`，配音共約 196 KB。開場在倒數時播放，第二到第五階段各喊一次，兩句摔落吐槽輪流出現，通關有獨立歡呼。同步字幕只在實際播音時顯示。

音樂為此遊戲撰寫的合成節奏，不使用商業歌曲音檔：大鼓、拍手／軍鼓、hi-hat、低通鋸齒貝斯，第三階段起加入琶音。每階段依序 124／134／144／154／164 BPM；喘息階段減少聲部。配音與預告時會壓低音樂。

右上方音符按鈕只關音樂；喇叭按鈕關全部聲音。暫停或切到背景會停止音樂和未完的配音。音樂只在點擊開始後播放；不會在載入頁面時自動發聲。

試聽：http://localhost:8094/audio-preview.html

重新產生（需 ffmpeg、ffprobe，以及有額度的環境變數 OPENROUTER_API_KEY）：

```bash
python3 scripts/generate_voice.py
# 只重做通關台詞：
python3 scripts/generate_voice.py win
```

程式從環境變數讀金鑰，不把金鑰放進前端或封裝檔。正常遊玩不需要金鑰。台羅詞彙參考：[教育部「拑牢牢」](https://sutian.moe.edu.tw/zh-hant/su/4023/)。TTS 的口音和情緒仍以試聽為準，沒有宣稱經真人母語者校音。


## v0.5.0 斜側面與強烈甩動

牛身轉向斜側面，清楚露出身體、後腿和尾巴。以軀幹為旋轉中心，連擊時左右側翻（上限約 43°）、前後俯仰、抬身、甩頭和交錯踢腿；越後段振幅越大，喘息時放緩。牛仔座位跟隨牛背，身體反向扭轉以呈現救回重心的動作，牛蹄以包圍盒修正避免穿地。

動作由 motion.js 獨立產生，不回寫平衡物理。原有感測輸入、17 次攻擊、台語配音與電子音樂保留。HUD 保持固定；減少動態模式關閉躍起與鏡頭衝擊，降低側翻幅度。

`tests/motion.html` 對照 390×844、320×568、844×390 的左右甩動姿勢；這是固定狀態的構圖驗證頁。完整遊戲仍從 index.html 開啟。
