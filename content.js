(function () {
    // 必要な要素を取得
    const title = document.querySelector('.p-novel__title')?.innerText;
    const body = document.querySelector('.p-novel__body')?.innerHTML;
    const nextLink = document.querySelector('.c-pager__item--next')?.getAttribute('href');
    const prevLink = document.querySelector('.c-pager__item--before')?.getAttribute('href');
    const indexLink = location.href.trim().replace(/\/\d+\/$/, '');

    if (!body) return; // 本文がない場合は終了

    // 既存のスタイルを削除
    const existingStyles = document.querySelectorAll('link[rel="stylesheet"], style');
    existingStyles.forEach(s => s.remove());

    // viewportメタタグの設定
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = "viewport";
        document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1.0, user-scalable=yes, maximum-scale=5.0";

    // ローカルストレージから設定を読み込み
    const savedTheme = localStorage.getItem('reader-theme') || 'light';
    const savedFontSize = localStorage.getItem('reader-font-size') || '18';
    const currentUrl = location.href;

    // DOM構造を作成
    document.body.innerHTML = `
        <div id="reader-container" data-theme="${savedTheme}">
            <!-- 読書進捗バー -->
            <div id="progress-bar"></div>
            
            <!-- ヘッダー（上部ナビゲーション） -->
            <header class="reader-header">
                <div class="header-content">
                    <a href="${indexLink}" class="btn-index" aria-label="目次に戻る">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </a>
                    <div class="header-controls">
                        <button id="font-size-btn" class="icon-btn" aria-label="文字サイズ">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 7V4h16v3M9 20h6M12 4v16"></path>
                            </svg>
                        </button>
                        <button id="theme-toggle" class="icon-btn" aria-label="テーマ切替">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </header>
            
            <!-- フォントサイズ調整パネル -->
            <div id="font-panel" class="control-panel">
                <div class="panel-content">
                    <label>文字サイズ</label>
                    <div class="font-size-controls">
                        <input type="range" id="font-size-slider" min="10" max="32" step="1" value="${savedFontSize}">
                        <div class="font-size-input-wrapper">
                            <input type="number" id="font-size-number" min="10" max="64" value="${savedFontSize}">
                            <span>px</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- メインコンテンツ -->
            <main class="reader-main">
                <article class="novel-content">
                    <h1 class="novel-title">${title}</h1>
                    <div class="novel-body" style="font-size: ${savedFontSize}px">${body}</div>
                </article>
            </main>
            
            <!-- 下部固定ナビゲーション -->
            <nav class="bottom-nav">
                ${prevLink ? `
                    <a href="${prevLink}" class="nav-btn nav-prev">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        <span>前へ</span>
                    </a>
                ` : '<div class="nav-btn nav-disabled"></div>'}
                
                ${nextLink ? `
                    <a href="${nextLink}" class="nav-btn nav-next">
                        <span>次へ</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </a>
                ` : '<div class="nav-btn nav-disabled"></div>'}
            </nav>
        </div>
    `;

    // スタイルシートを追加
    const style = document.createElement('style');
    style.textContent = `
        /* ===== リセットとベース設定 ===== */
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        :root {
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --text-primary: #1a1a1a;
            --text-secondary: #666666;
            --accent: #4a90e2;
            --accent-hover: #357abd;
            --border: #e0e0e0;
            --shadow: rgba(0, 0, 0, 0.1);
            --header-height: 56px;
            --bottom-nav-height: 64px;
        }
        
        [data-theme="dark"] {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --text-primary: #e4e4e4;
            --text-secondary: #a0a0a0;
            --accent: #5ca3ff;
            --accent-hover: #4a8fe6;
            --border: #404040;
            --shadow: rgba(0, 0, 0, 0.3);
        }
        
        html {
            font-size: 16px;
            -webkit-text-size-adjust: 100%;
            scroll-behavior: smooth;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.8;
            overflow-x: hidden;
            transition: background-color 0.3s ease, color 0.3s ease;
        }
        
        /* ===== プログレスバー ===== */
        #progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--accent), #a78bfa);
            width: 0%;
            z-index: 1000;
            transition: width 0.1s ease;
        }
        
        /* ===== ヘッダー ===== */
        .reader-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: var(--header-height);
            background: var(--bg-primary);
            border-bottom: 1px solid var(--border);
            z-index: 100;
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.9);
        }
        
        [data-theme="dark"] .reader-header {
            background: rgba(26, 26, 26, 0.9);
        }
        
        .header-content {
            max-width: 800px;
            height: 100%;
            margin: 0 auto;
            padding: 0 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .header-controls {
            display: flex;
            gap: 8px;
        }
        
        .icon-btn, .btn-index {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: none;
            background: transparent;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            -webkit-tap-highlight-color: transparent;
        }
        
        .icon-btn:active, .btn-index:active {
            transform: scale(0.95);
            background: var(--bg-secondary);
        }
        
        @media (hover: hover) {
            .icon-btn:hover, .btn-index:hover {
                background: var(--bg-secondary);
            }
        }
        
        /* ===== コントロールパネル ===== */
        .control-panel {
            position: fixed;
            top: var(--header-height);
            left: 0;
            right: 0;
            background: var(--bg-primary);
            border-bottom: 1px solid var(--border);
            z-index: 99;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .control-panel.active {
            max-height: 120px;
        }
        
        .panel-content {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px 16px;
        }
        
        .panel-content label {
            display: block;
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 12px;
        }
        
        .font-size-controls {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        #font-size-slider {
            flex: 1;
            height: 40px;
            cursor: pointer;
            accent-color: var(--accent);
        }
        
        .font-size-input-wrapper {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        #font-size-number {
            width: 60px;
            padding: 8px;
            border: 1px solid var(--border);
            border-radius: 8px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            font-size: 16px;
            text-align: center;
            -moz-appearance: textfield;
        }
        
        #font-size-number::-webkit-outer-spin-button,
        #font-size-number::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        
        /* ===== メインコンテンツ ===== */
        #reader-container {
            min-height: 100vh;
            background: var(--bg-primary);
            padding-top: var(--header-height);
            padding-bottom: var(--bottom-nav-height);
        }

        .novel-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .reader-main {
            max-width: 800px;
            margin: 0 auto;
            padding: 32px 20px;
        }
        
        .novel-content {
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .novel-body {
            color: var(--text-primary);
            line-height: 2;
            letter-spacing: 0.05em;
            white-space: pre-wrap;
            word-wrap: break-word;
            transition: font-size 0.2s ease;
        }
        
        .novel-body p {
            margin-bottom: 1.5em;
        }
        
        /* ルビのスタイル */
        .novel-body ruby {
            ruby-position: over;
        }
        
        .novel-body rt {
            font-size: 0.6em;
            color: var(--text-secondary);
        }
        
        /* ===== 下部ナビゲーション ===== */
        .bottom-nav {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: var(--bottom-nav-height);
            background: var(--bg-primary);
            border-top: 1px solid var(--border);
            display: flex;
            z-index: 100;
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.95);
        }
        
        [data-theme="dark"] .bottom-nav {
            background: rgba(26, 26, 26, 0.95);
        }
        
        .nav-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            color: var(--accent);
            text-decoration: none;
            font-size: 15px;
            font-weight: 500;
            transition: all 0.2s ease;
            -webkit-tap-highlight-color: transparent;
            min-height: 48px; /* タップ領域確保 */
        }
        
        .nav-btn:active {
            background: var(--bg-secondary);
            transform: scale(0.98);
        }
        
        .nav-disabled {
            opacity: 0;
            pointer-events: none;
        }
        
        /* ===== レスポンシブ対応 ===== */
        @media (max-width: 640px) {
            :root {
                --header-height: 52px;
            }
            
            .reader-main {
                padding: 24px 16px;
            }
            
            .novel-body {
                font-size: 16px !important; /* モバイルでは最小サイズを確保 */
            }
        }
        
        @media (min-width: 641px) {
            .nav-btn:hover {
                background: var(--bg-secondary);
            }
        }
        
        /* ===== アクセシビリティ ===== */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;

    document.head.appendChild(style);

    // ===== JavaScript機能の実装 ===== //

    // プログレスバーの更新
    const progressBar = document.getElementById('progress-bar');
    function updateProgress() {
        const winScroll = document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressBar.style.width = scrolled + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });

    // テーマ切り替え
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const container = document.getElementById('reader-container');
        const currentTheme = container.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        container.setAttribute('data-theme', newTheme);
        localStorage.setItem('reader-theme', newTheme);
    });

    // フォントサイズ調整
    const fontSizeBtn = document.getElementById('font-size-btn');
    const fontPanel = document.getElementById('font-panel');
    const novelBody = document.querySelector('.novel-body');

    fontSizeBtn.addEventListener('click', () => {
        fontPanel.classList.toggle('active');
    });

    // フォントサイズ調整の実装（スライダー＆数値入力）
    const fontSizeSlider = document.getElementById('font-size-slider');
    const fontSizeNumber = document.getElementById('font-size-number');

    function updateFontSize(size) {
        novelBody.style.fontSize = size + 'px';
        localStorage.setItem('reader-font-size', size);
        fontSizeSlider.value = size;
        fontSizeNumber.value = size;
    }

    fontSizeSlider.addEventListener('input', (e) => {
        updateFontSize(e.target.value);
    });

    fontSizeNumber.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val)) val = 18;
        updateFontSize(val);
    });

    // パネル外クリックで閉じる
    document.addEventListener('click', (e) => {
        if (!fontPanel.contains(e.target) && !fontSizeBtn.contains(e.target)) {
            fontPanel.classList.remove('active');
        }
    });

    document.addEventListener('dblclick', () => {
        const header = document.querySelector('.reader-header');
        const nav = document.querySelector('.bottom-nav');
        const fontPanel = document.getElementById('font-panel');
        const isHidden = header.style.display === 'none';
        header.style.display = isHidden ? 'block' : 'none';
        nav.style.display = isHidden ? 'flex' : 'none';
        fontPanel.style.display = isHidden ? 'block' : 'none';
    });


    // スワイプ操作の実装
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 100; // スワイプと判定する最低距離(px)
        const diff = touchEndX - touchStartX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff < 0 && nextLink) {
                // 右から左へスワイプ：次のページ
                window.location.href = nextLink;
            } else if (diff > 0 && prevLink) {
                // 左から右へスワイプ：前のページ
                window.location.href = prevLink;
            }
        }
    }

    // 読書位置の保存と復元
    const positionKey = `reading-position-${currentUrl}`;
    const savedPosition = localStorage.getItem(positionKey);

    if (savedPosition) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedPosition));
        }, 100);
    }

    // スクロール位置を定期的に保存
    let scrollTimer;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => {
            localStorage.setItem(positionKey, window.scrollY);
        }, 500);
    }, { passive: true });

})();