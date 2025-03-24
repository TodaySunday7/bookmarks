document.addEventListener('DOMContentLoaded', function() {
    const bookmarkFileInput = document.getElementById('bookmarkFile');
    const bookmarksContainer = document.getElementById('bookmarksContainer');
    const uploadContainer = document.getElementById('uploadContainer');
    const searchInput = document.getElementById('searchInput');
    const themeToggle = document.getElementById('themeToggle');
    const clearDataBtn = document.getElementById('clearData');
    const favoritesContainer = document.getElementById('favoritesContainer');
    const favoritesList = document.getElementById('favoritesList');
    const autoClassifyBtn = document.getElementById('autoClassifyBtn');
    const simplifyNamesBtn = document.getElementById('simplifyNamesBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const closeSettings = document.getElementById('closeSettings');
    const colorOptions = document.querySelectorAll('.color-option');
    const animationToggle = document.getElementById('animationToggle');
    const exportBtn = document.getElementById('exportBtn');
    const shareLink = document.getElementById('shareLink');
    const shareLinkContainer = document.getElementById('shareLinkContainer');
    const copyShareLink = document.getElementById('copyShareLink');
    const generateShareLink = document.getElementById('generateShareLink');
    
    // 书签数据
    let bookmarkStructure = {};
    // 原始书签数据（用于重置分类）
    let originalBookmarkStructure = {};
    // 收藏的书签
    let favorites = [];
    // 是否已经自动分类
    let isAutoClassified = false;
    // 是否已经简化名称
    let isNamesSimplified = false;
    // 主题颜色
    let accentColor = localStorage.getItem('accentColor') || '#007bff';
    // 动画状态
    let animationsEnabled = localStorage.getItem('animationsEnabled') === 'true';
    
    // 分类规则
    const categoryRules = [
        { name: '社交媒体', icon: 'fas fa-users', patterns: ['facebook', 'twitter', 'instagram', 'linkedin', 'weibo', 'zhihu', 'douban', 'tieba', 'weixin', 'qq'] },
        { name: '视频娱乐', icon: 'fas fa-film', patterns: ['youtube', 'bilibili', 'netflix', 'iqiyi', 'youku', 'tudou', 'douyu', 'huya', 'twitch', 'tiktok', 'douyin'] },
        { name: '购物电商', icon: 'fas fa-shopping-cart', patterns: ['taobao', 'jd', 'amazon', 'tmall', 'pinduoduo', 'suning', 'ebay', 'aliexpress', 'walmart'] },
        { name: '新闻资讯', icon: 'fas fa-newspaper', patterns: ['news', 'bbc', 'cnn', 'nytimes', 'theguardian', 'reuters', 'sina', 'sohu', '163', 'qq.com/news', 'ifeng', 'people', 'xinhuanet'] },
        { name: '学习教育', icon: 'fas fa-graduation-cap', patterns: ['coursera', 'udemy', 'edx', 'mooc', 'xuetang', 'study', 'learn', 'edu', 'course', 'tutorial', 'university', 'college'] },
        { name: '开发编程', icon: 'fas fa-code', patterns: ['github', 'gitlab', 'stackoverflow', 'leetcode', 'csdn', 'developer', 'coding', 'w3school', 'mdn', 'npm', 'yarn', 'python', 'javascript', 'java', 'php', 'ruby', 'api'] },
        { name: '工具应用', icon: 'fas fa-tools', patterns: ['tool', 'app', 'converter', 'calculator', 'translate', 'map', 'baidu.com/map', 'amap', 'gaode', 'google.com/maps', 'weather'] },
        { name: '金融理财', icon: 'fas fa-money-bill-wave', patterns: ['bank', 'finance', 'stock', 'fund', 'invest', 'alipay', 'paypal', 'visa', 'mastercard', 'insurance'] },
        { name: '旅游出行', icon: 'fas fa-plane', patterns: ['travel', 'trip', 'booking', 'hotel', 'flight', 'train', 'ticket', 'ctrip', 'qunar', 'mafengwo', 'tripadvisor'] },
        { name: '音乐音频', icon: 'fas fa-music', patterns: ['music', 'spotify', 'soundcloud', 'apple.com/music', 'qq.com/music', '163.com/music', 'xiami', 'kugou', 'kuwo'] },
        { name: '健康生活', icon: 'fas fa-heartbeat', patterns: ['health', 'fitness', 'sport', 'food', 'recipe', 'diet', 'medical', 'hospital', 'doctor'] },
        { name: '设计创意', icon: 'fas fa-paint-brush', patterns: ['design', 'dribbble', 'behance', 'sketch', 'figma', 'photoshop', 'illustrator', 'ui', 'ux', 'creative'] }
    ];
    
    // 初始化主题
    initTheme();
    
    // 检查是否有保存的书签数据
    loadSavedData();
    
    // 当用户选择文件时
    bookmarkFileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const content = e.target.result;
                parseBookmarks(content);
                // 隐藏上传区域
                uploadContainer.style.display = 'none';
                // 保存到localStorage
                saveToLocalStorage();
            };
            
            reader.readAsText(file);
        }
    });
    
    // 搜索功能
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // 搜索常用书签
        if (favorites.length > 0) {
            const favoriteItems = favoritesList.querySelectorAll('.bookmark-item');
            let hasVisibleFavorites = false;
            
            favoriteItems.forEach(item => {
                const link = item.querySelector('a');
                const text = link.textContent.toLowerCase();
                const url = link.getAttribute('href').toLowerCase();
                
                if (text.includes(searchTerm) || url.includes(searchTerm)) {
                    item.style.display = 'flex';
                    hasVisibleFavorites = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            favoritesContainer.style.display = hasVisibleFavorites ? 'block' : 'none';
        }
        
        // 搜索所有书签
        const bookmarkItems = bookmarksContainer.querySelectorAll('.bookmark-item');
        const folders = bookmarksContainer.querySelectorAll('.bookmark-folder');
        
        bookmarkItems.forEach(item => {
            const link = item.querySelector('a');
            const text = link.textContent.toLowerCase();
            const url = link.getAttribute('href').toLowerCase();
            
            if (text.includes(searchTerm) || url.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
        
        // 隐藏空文件夹
        folders.forEach(folder => {
            const visibleItems = folder.querySelectorAll('.bookmark-item[style="display: flex"], .bookmark-item:not([style])');
            if (visibleItems.length === 0) {
                folder.style.display = 'none';
            } else {
                folder.style.display = 'block';
            }
        });
    });
    
    // 主题切换
    themeToggle.addEventListener('click', function() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
    
    // 清除数据
    clearDataBtn.addEventListener('click', function() {
        if (confirm('确定要清除所有保存的数据吗？这将删除您的书签和收藏。')) {
            localStorage.removeItem('bookmarks');
            localStorage.removeItem('favorites');
            localStorage.removeItem('isAutoClassified');
            localStorage.removeItem('isNamesSimplified');
            localStorage.removeItem('originalBookmarks');
            location.reload();
        }
    });
    
    // 自动分类
    autoClassifyBtn.addEventListener('click', function() {
        if (Object.keys(bookmarkStructure).length === 0) {
            alert('请先上传书签文件');
            return;
        }
        
        if (!isAutoClassified) {
            // 保存原始结构
            if (Object.keys(originalBookmarkStructure).length === 0) {
                originalBookmarkStructure = JSON.parse(JSON.stringify(bookmarkStructure));
            }
            
            // 执行自动分类
            const newStructure = autoClassifyBookmarks(bookmarkStructure);
            bookmarkStructure = newStructure;
            isAutoClassified = true;
            
            // 保存状态
            saveToLocalStorage();
            
            // 重新渲染
            renderBookmarks(bookmarkStructure);
            
            alert('书签已按内容智能分类完成！');
        } else {
            // 恢复原始分类
            if (Object.keys(originalBookmarkStructure).length > 0) {
                bookmarkStructure = JSON.parse(JSON.stringify(originalBookmarkStructure));
                isAutoClassified = false;
                
                // 保存状态
                saveToLocalStorage();
                
                // 重新渲染
                renderBookmarks(bookmarkStructure);
                
                alert('已恢复原始书签分类！');
            }
        }
    });
    
    // 简化名称
    simplifyNamesBtn.addEventListener('click', function() {
        if (Object.keys(bookmarkStructure).length === 0) {
            alert('请先上传书签文件');
            return;
        }
        
        if (!isNamesSimplified) {
            // 保存原始结构（如果还没保存）
            if (Object.keys(originalBookmarkStructure).length === 0) {
                originalBookmarkStructure = JSON.parse(JSON.stringify(bookmarkStructure));
            }
            
            // 执行名称简化
            simplifyBookmarkNames(bookmarkStructure);
            isNamesSimplified = true;
            
            // 保存状态
            saveToLocalStorage();
            
            // 重新渲染
            renderBookmarks(bookmarkStructure);
            
            alert('书签名称已简化完成！');
        } else {
            // 恢复原始名称
            if (Object.keys(originalBookmarkStructure).length > 0) {
                bookmarkStructure = JSON.parse(JSON.stringify(originalBookmarkStructure));
                isNamesSimplified = false;
                
                // 如果仍需要保持分类
                if (isAutoClassified) {
                    bookmarkStructure = autoClassifyBookmarks(bookmarkStructure);
                }
                
                // 保存状态
                saveToLocalStorage();
                
                // 重新渲染
                renderBookmarks(bookmarkStructure);
                
                alert('已恢复原始书签名称！');
            }
        }
    });
    
    // 视图切换 - 网格视图
    gridViewBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            listViewBtn.classList.remove('active');
            this.classList.add('active');
            bookmarksContainer.classList.remove('list-view');
            bookmarksContainer.classList.add('grid-view');
            localStorage.setItem('viewMode', 'grid');
        }
    });
    
    // 视图切换 - 列表视图
    listViewBtn.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
            gridViewBtn.classList.remove('active');
            this.classList.add('active');
            bookmarksContainer.classList.remove('grid-view');
            bookmarksContainer.classList.add('list-view');
            localStorage.setItem('viewMode', 'list');
        }
    });
    
    // 设置面板
    settingsBtn.addEventListener('click', function(event) {
        settingsPanel.classList.add('open');
        event.stopPropagation(); // 阻止事件冒泡
    });
    
    closeSettings.addEventListener('click', function() {
        settingsPanel.classList.remove('open');
    });
    
    // 点击设置面板外部关闭
    document.addEventListener('click', function(event) {
        if (settingsPanel.classList.contains('open') && 
            !settingsPanel.contains(event.target) && 
            event.target !== settingsBtn) {
            settingsPanel.classList.remove('open');
        }
    });
    
    // 颜色选项
    colorOptions.forEach(option => {
        if (option.dataset.color === accentColor) {
            option.classList.add('active');
        }
        
        option.addEventListener('click', function() {
            const color = this.dataset.color;
            accentColor = color;
            
            // 移除所有active类
            colorOptions.forEach(opt => opt.classList.remove('active'));
            // 添加active类到当前选项
            this.classList.add('active');
            
            // 更新CSS变量
            applyAccentColor();
            
            // 保存到localStorage
            localStorage.setItem('accentColor', color);
        });
    });
    
    // 动画开关
    animationToggle.checked = animationsEnabled;
    animationToggle.addEventListener('change', function() {
        animationsEnabled = this.checked;
        
        // 更新动画状态
        if (animationsEnabled) {
            document.body.classList.remove('no-animations');
        } else {
            document.body.classList.add('no-animations');
        }
        
        // 保存到localStorage
        localStorage.setItem('animationsEnabled', animationsEnabled);
    });
    
    // 导出按钮
    exportBtn.addEventListener('click', function(event) {
        // 创建导出选项菜单
        let exportOptions = document.getElementById('exportOptions');
        
        if (!exportOptions) {
            exportOptions = document.createElement('div');
            exportOptions.id = 'exportOptions';
            exportOptions.innerHTML = `
                <button id="exportHTML">导出为HTML书签文件</button>
                <button id="exportJSON">导出为JSON文件</button>
            `;
            document.body.appendChild(exportOptions);
            
            // 添加事件监听器
            document.getElementById('exportHTML').addEventListener('click', exportAsHTML);
            document.getElementById('exportJSON').addEventListener('click', exportAsJSON);
        }
        
        // 显示/隐藏导出选项
        exportOptions.classList.toggle('show');
        
        // 定位导出选项
        const rect = exportBtn.getBoundingClientRect();
        exportOptions.style.top = (rect.bottom + 5) + 'px';
        exportOptions.style.left = (rect.left - 100) + 'px';
        
        // 阻止事件冒泡
        event.stopPropagation();
    });
    
    // 点击其他地方关闭导出选项
    document.addEventListener('click', function() {
        const exportOptions = document.getElementById('exportOptions');
        if (exportOptions && exportOptions.classList.contains('show')) {
            exportOptions.classList.remove('show');
        }
    });
    
    // 生成分享链接
    generateShareLink.addEventListener('click', function() {
        // 创建要分享的数据
        const shareData = {
            bookmarks: bookmarkStructure,
            favorites: favorites
        };
        
        // 将数据转换为Base64编码
        const jsonData = JSON.stringify(shareData);
        const base64Data = btoa(encodeURIComponent(jsonData));
        
        // 创建分享链接
        const url = new URL(window.location.href);
        url.searchParams.set('share', base64Data);
        
        // 显示分享链接
        shareLink.value = url.toString();
        shareLinkContainer.style.display = 'block';
    });
    
    // 复制分享链接
    copyShareLink.addEventListener('click', function() {
        shareLink.select();
        document.execCommand('copy');
        
        // 显示复制成功提示
        const originalText = this.textContent;
        this.textContent = '已复制!';
        setTimeout(() => {
            this.textContent = originalText;
        }, 2000);
    });
    
    // 检查URL中是否有分享参数
    function checkForSharedData() {
        const urlParams = new URLSearchParams(window.location.search);
        const shareData = urlParams.get('share');
        
        if (shareData) {
            try {
                // 解码分享数据
                const jsonData = decodeURIComponent(atob(shareData));
                const data = JSON.parse(jsonData);
                
                // 加载分享的书签
                bookmarkStructure = data.bookmarks || {};
                favorites = data.favorites || [];
                
                // 渲染书签
                renderBookmarks(bookmarkStructure);
                if (favorites.length > 0) {
                    renderFavorites();
                }
                
                // 隐藏上传区域
                uploadContainer.style.display = 'none';
                
                // 保存到localStorage
                saveToLocalStorage();
                
                // 清除URL参数
                window.history.replaceState({}, document.title, window.location.pathname);
                
                return true;
            } catch (e) {
                console.error('解析分享数据失败:', e);
            }
        }
        
        return false;
    }
    
    // 导出为HTML书签文件
    function exportAsHTML() {
        let html = '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n';
        html += '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n';
        html += '<TITLE>Bookmarks</TITLE>\n';
        html += '<H1>Bookmarks</H1>\n';
        html += '<DL><p>\n';
        
        // 添加收藏夹
        if (favorites.length > 0) {
            html += '    <DT><H3>常用书签</H3>\n';
            html += '    <DL><p>\n';
            
            favorites.forEach(bookmark => {
                html += `        <DT><A HREF="${bookmark.url}">${bookmark.title}</A>\n`;
            });
            
            html += '    </DL><p>\n';
        }
        
        // 添加其他文件夹
        for (const folder in bookmarkStructure) {
            html += `    <DT><H3>${folder}</H3>\n`;
            html += '    <DL><p>\n';
            
            bookmarkStructure[folder].forEach(bookmark => {
                html += `        <DT><A HREF="${bookmark.url}">${bookmark.title}</A>\n`;
            });
            
            html += '    </DL><p>\n';
        }
        
        html += '</DL>';
        
        // 创建下载
        downloadFile(html, '书签.html', 'text/html');
        
        // 隐藏导出选项
        const exportOptions = document.getElementById('exportOptions');
        if (exportOptions) {
            exportOptions.classList.remove('show');
        }
    }
    
    // 导出为JSON文件
    function exportAsJSON() {
        const data = {
            bookmarks: bookmarkStructure,
            favorites: favorites
        };
        
        // 创建下载
        downloadFile(JSON.stringify(data, null, 2), '书签.json', 'application/json');
        
        // 隐藏导出选项
        const exportOptions = document.getElementById('exportOptions');
        if (exportOptions) {
            exportOptions.classList.remove('show');
        }
    }
    
    // 下载文件
    function downloadFile(content, fileName, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    }
    
    // 应用主题颜色
    function applyAccentColor() {
        document.documentElement.style.setProperty('--accent-color', accentColor);
        
        // 根据颜色生成hover颜色（稍微暗一点）
        const hoverColor = adjustColorBrightness(accentColor, -20);
        document.documentElement.style.setProperty('--accent-hover', hoverColor);
    }
    
    // 调整颜色亮度
    function adjustColorBrightness(hex, percent) {
        // 将hex转换为rgb
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);
        
        // 调整亮度
        r = Math.max(0, Math.min(255, r + percent));
        g = Math.max(0, Math.min(255, g + percent));
        b = Math.max(0, Math.min(255, b + percent));
        
        // 转回hex
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // 渲染书签到页面
    function renderBookmarks(structure) {
        bookmarksContainer.innerHTML = '';
        
        // 遍历所有文件夹
        for (const folder in structure) {
            const folderElement = document.createElement('div');
            folderElement.className = 'bookmark-folder';
            folderElement.setAttribute('data-folder', folder);
            
            // 创建文件夹标题
            const folderHeader = document.createElement('div');
            folderHeader.className = 'folder-header';
            
            // 获取文件夹图标
            let folderIcon = 'fas fa-folder';
            if (isAutoClassified) {
                const category = categoryRules.find(cat => cat.name === folder);
                if (category) {
                    folderIcon = category.icon;
                }
            }
            
            folderHeader.innerHTML = `
                <h2><i class="${folderIcon} category-icon"></i>${folder}</h2>
                <span class="folder-count">${structure[folder].length}</span>
            `;
            
            // 创建书签列表
            const bookmarkList = document.createElement('ul');
            bookmarkList.className = 'bookmark-list';
            
            // 添加书签
            structure[folder].forEach(bookmark => {
                const bookmarkItem = createBookmarkItem(bookmark);
                bookmarkList.appendChild(bookmarkItem);
            });
            
            folderElement.appendChild(folderHeader);
            folderElement.appendChild(bookmarkList);
            bookmarksContainer.appendChild(folderElement);
        }
        
        // 初始化文件夹拖放排序
        new Sortable(bookmarksContainer, {
            animation: 150,
            handle: '.folder-header',
            draggable: '.bookmark-folder',
            onEnd: function() {
                // 更新文件夹顺序
                updateFolderOrder();
            }
        });
        
        // 初始化每个文件夹内的书签拖放排序
        document.querySelectorAll('.bookmark-list').forEach(list => {
            new Sortable(list, {
                animation: 150,
                handle: '.drag-handle',
                draggable: '.bookmark-item',
                onEnd: function() {
                    // 更新书签顺序
                    updateBookmarkStructure();
                }
            });
        });
    }
    
    // 创建书签项
    function createBookmarkItem(bookmark) {
        const listItem = document.createElement('li');
        listItem.className = 'bookmark-item';
        listItem.setAttribute('data-url', bookmark.url);
        
        const link = document.createElement('a');
        link.className = 'bookmark-link';
        link.href = bookmark.url;
        link.target = '_blank';
        link.textContent = bookmark.title;
        
        // 添加网站图标
        const favicon = document.createElement('img');
        favicon.className = 'favicon';
        favicon.src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}`;
        favicon.onerror = function() {
            this.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2NkoBAwUqifYdQAhtEwYBgNA1A6uXbtGiM2P1y5cgXsAkJpgJE0jQEAE+oFATDxwKIAAAAASUVORK5CYII=';
        };
        
        // 添加收藏按钮
        const starBtn = document.createElement('button');
        starBtn.className = 'star-btn';
        starBtn.innerHTML = '★';
        starBtn.title = '添加到常用书签';
        
        // 添加拖动手柄
        const dragHandle = document.createElement('span');
        dragHandle.className = 'drag-handle';
        dragHandle.innerHTML = '<i class="fas fa-grip-lines"></i>';
        dragHandle.title = '拖动排序';
        
        // 检查是否已收藏
        const isFavorite = favorites.some(fav => fav.url === bookmark.url);
        if (isFavorite) {
            starBtn.classList.add('active');
        }
        
        // 收藏按钮点击事件
        starBtn.addEventListener('click', function() {
            toggleFavorite(bookmark);
            this.classList.toggle('active');
        });
        
        link.prepend(favicon);
        listItem.appendChild(link);
        listItem.appendChild(starBtn);
        listItem.appendChild(dragHandle);
        
        return listItem;
    }
    
    // 切换收藏状态
    function toggleFavorite(bookmark) {
        const index = favorites.findIndex(fav => fav.url === bookmark.url);
        
        if (index === -1) {
            // 添加到收藏
            favorites.push(bookmark);
        } else {
            // 从收藏中移除
            favorites.splice(index, 1);
        }
        
        // 更新收藏列表
        renderFavorites();
        // 保存到localStorage
        saveToLocalStorage();
    }
    
    // 渲染收藏列表
    function renderFavorites() {
        favoritesList.innerHTML = '';
        
        if (favorites.length > 0) {
            favoritesContainer.style.display = 'block';
            
            favorites.forEach(bookmark => {
                const listItem = document.createElement('li');
                listItem.className = 'bookmark-item';
                listItem.setAttribute('data-url', bookmark.url);
                
                const link = document.createElement('a');
                link.className = 'bookmark-link';
                link.href = bookmark.url;
                link.target = '_blank';
                link.textContent = bookmark.title;
                
                // 添加网站图标
                const favicon = document.createElement('img');
                favicon.className = 'favicon';
                favicon.src = `https://www.google.com/s2/favicons?domain=${new URL(bookmark.url).hostname}`;
                favicon.onerror = function() {
                    this.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMElEQVQ4T2NkoBAwUqifYdQAhtEwYBgNA1A6uXbtGiM2P1y5cgXsAkJpgJE0jQEAE+oFATDxwKIAAAAASUVORK5CYII=';
                };
                
                // 添加移除按钮
                const removeBtn = document.createElement('button');
                removeBtn.className = 'star-btn active';
                removeBtn.innerHTML = '★';
                removeBtn.title = '从常用书签中移除';
                
                // 添加拖动手柄
                const dragHandle = document.createElement('span');
                dragHandle.className = 'drag-handle';
                dragHandle.innerHTML = '<i class="fas fa-grip-lines"></i>';
                dragHandle.title = '拖动排序';
                
                // 移除按钮点击事件
                removeBtn.addEventListener('click', function() {
                    toggleFavorite(bookmark);
                    // 更新所有书签中的收藏状态
                    const allStarBtns = bookmarksContainer.querySelectorAll('.star-btn');
                    allStarBtns.forEach(btn => {
                        const link = btn.previousElementSibling;
                        if (link.href === bookmark.url) {
                            btn.classList.remove('active');
                        }
                    });
                });
                
                link.prepend(favicon);
                listItem.appendChild(link);
                listItem.appendChild(removeBtn);
                listItem.appendChild(dragHandle);
                favoritesList.appendChild(listItem);
            });
            
            // 初始化收藏夹拖放排序
            new Sortable(favoritesList, {
                animation: 150,
                handle: '.drag-handle',
                draggable: '.bookmark-item',
                onEnd: function() {
                    // 更新收藏夹顺序
                    updateFavorites();
                }
            });
        } else {
            favoritesContainer.style.display = 'none';
        }
    }
    
    // 更新收藏夹顺序
    function updateFavorites() {
        const newFavorites = [];
        const items = favoritesList.querySelectorAll('.bookmark-item');
        
        items.forEach(item => {
            const url = item.getAttribute('data-url');
            const favorite = favorites.find(f => f.url === url);
            if (favorite) {
                newFavorites.push(favorite);
            }
        });
        
        favorites = newFavorites;
        saveToLocalStorage();
    }
    
    // 获取文件夹图标
    function getFolderIcon(folderName) {
        // 为自动分类的文件夹添加图标
        for (const category of categoryRules) {
            if (category.name === folderName) {
                return `<i class="${category.icon} folder-icon"></i>`;
            }
        }
        
        // 为其他常见文件夹添加图标
        const folderIcons = {
            '根目录': 'fas fa-home',
            '书签栏': 'fas fa-bookmark',
            '其他书签': 'fas fa-ellipsis-h',
            '移动书签': 'fas fa-mobile-alt',
            '其他': 'fas fa-folder'
        };
        
        return folderIcons[folderName] 
            ? `<i class="${folderIcons[folderName]} folder-icon"></i>` 
            : `<i class="fas fa-folder folder-icon"></i>`;
    }
    
    // 初始化主题和视图模式
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // 应用保存的主题颜色
        accentColor = localStorage.getItem('accentColor') || '#4285f4';
        applyAccentColor();
        
        // 标记当前选中的颜色选项
        colorOptions.forEach(option => {
            if (option.dataset.color === accentColor) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // 初始化视图模式
        const viewMode = localStorage.getItem('viewMode') || 'grid';
        if (viewMode === 'list') {
            gridViewBtn.classList.remove('active');
            listViewBtn.classList.add('active');
            bookmarksContainer.classList.remove('grid-view');
            bookmarksContainer.classList.add('list-view');
        } else {
            bookmarksContainer.classList.add('grid-view');
        }
        
        // 初始化动画状态
        animationsEnabled = localStorage.getItem('animationsEnabled') !== 'false';
        animationToggle.checked = animationsEnabled;
        if (!animationsEnabled) {
            document.body.classList.add('no-animations');
        }
    }
    
    // 加载保存的数据
    function loadSavedData() {
        // 首先检查是否有分享数据
        if (checkForSharedData()) {
            return;
        }
        
        const savedBookmarks = localStorage.getItem('bookmarks');
        const savedFavorites = localStorage.getItem('favorites');
        const savedOriginalBookmarks = localStorage.getItem('originalBookmarks');
        
        isAutoClassified = localStorage.getItem('isAutoClassified') === 'true';
        isNamesSimplified = localStorage.getItem('isNamesSimplified') === 'true';
        
        if (savedBookmarks) {
            bookmarkStructure = JSON.parse(savedBookmarks);
            renderBookmarks(bookmarkStructure);
            uploadContainer.style.display = 'none';
        }
        
        if (savedOriginalBookmarks) {
            originalBookmarkStructure = JSON.parse(savedOriginalBookmarks);
        }
        
        if (savedFavorites) {
            favorites = JSON.parse(savedFavorites);
            if (favorites.length > 0) {
                renderFavorites();
            }
        }
    }
    
    // 保存数据到localStorage
    function saveToLocalStorage() {
        localStorage.setItem('bookmarks', JSON.stringify(bookmarkStructure));
        localStorage.setItem('favorites', JSON.stringify(favorites));
        localStorage.setItem('isAutoClassified', isAutoClassified);
        localStorage.setItem('isNamesSimplified', isNamesSimplified);
        
        if (Object.keys(originalBookmarkStructure).length > 0) {
            localStorage.setItem('originalBookmarks', JSON.stringify(originalBookmarkStructure));
        }
    }
    
    // 解析书签HTML文件
    function parseBookmarks(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bookmarkElements = doc.querySelectorAll('DL > DT');
        
        // 创建书签结构
        bookmarkStructure = {};
        
        // 处理书签元素
        processBookmarkElements(bookmarkElements, bookmarkStructure);
        
        // 保存原始结构
        originalBookmarkStructure = JSON.parse(JSON.stringify(bookmarkStructure));
        
        // 渲染书签
        renderBookmarks(bookmarkStructure);
    }
    
    // 处理书签元素
    function processBookmarkElements(elements, structure, parentFolder = '根目录') {
        elements.forEach(element => {
            // 检查是否是文件夹
            const folderTitle = element.querySelector('H3');
            
            if (folderTitle) {
                const folderName = folderTitle.textContent;
                
                // 创建新文件夹
                if (!structure[folderName]) {
                    structure[folderName] = [];
                }
                
                // 处理文件夹内的书签
                const sublist = element.querySelector('DL');
                if (sublist) {
                    const subitems = sublist.querySelectorAll('DT');
                    processBookmarkElements(subitems, structure, folderName);
                }
            } else {
                // 这是一个书签链接
                const link = element.querySelector('A');
                if (link) {
                    const url = link.getAttribute('HREF');
                    const title = link.textContent;
                    
                    // 添加到当前文件夹
                    if (!structure[parentFolder]) {
                        structure[parentFolder] = [];
                    }
                    
                    structure[parentFolder].push({
                        title: title,
                        url: url
                    });
                }
            }
        });
    }
    
    // 自动分类书签
    function autoClassifyBookmarks(structure) {
        // 创建新的分类结构
        const newStructure = {};
        
        // 初始化分类
        categoryRules.forEach(category => {
            newStructure[category.name] = [];
        });
        
        // 添加"其他"分类
        newStructure['其他'] = [];
        
        // 遍历所有书签
        for (const folder in structure) {
            structure[folder].forEach(bookmark => {
                let categorized = false;
                const url = bookmark.url.toLowerCase();
                const title = bookmark.title.toLowerCase();
                
                // 尝试根据URL和标题匹配分类
                for (const category of categoryRules) {
                    for (const pattern of category.patterns) {
                        if (url.includes(pattern) || title.includes(pattern)) {
                            newStructure[category.name].push(bookmark);
                            categorized = true;
                            break;
                        }
                    }
                    if (categorized) break;
                }
                
                // 如果没有匹配任何分类，放入"其他"
                if (!categorized) {
                    newStructure['其他'].push(bookmark);
                }
            });
        }
        
        // 移除空分类
        for (const category in newStructure) {
            if (newStructure[category].length === 0) {
                delete newStructure[category];
            }
        }
        
        return newStructure;
    }
    
    // 简化书签名称
    function simplifyBookmarkNames(structure) {
        // 常见的冗余后缀
        const commonSuffixes = [
            ' - Google 搜索', ' - 百度搜索', ' | 百度一下', ' - YouTube', ' - 哔哩哔哩',
            ' - 知乎', ' - 微博', ' - 掘金', ' - CSDN', ' - 简书', ' - 腾讯视频',
            ' | 官方网站', ' | 官网', ' - 官方网站', ' - 官网', ' - 首页', ' | 首页',
            ' - Home', ' - Official Site', ' - Official Website', ' | Home Page'
        ];
        
        // 遍历所有书签
        for (const folder in structure) {
            structure[folder].forEach(bookmark => {
                // 移除常见后缀
                for (const suffix of commonSuffixes) {
                    if (bookmark.title.endsWith(suffix)) {
                        bookmark.title = bookmark.title.substring(0, bookmark.title.length - suffix.length);
                        break;
                    }
                }
                
                // 如果标题太长，截断它
                if (bookmark.title.length > 30) {
                    bookmark.title = bookmark.title.substring(0, 27) + '...';
                }
            });
        }
    }
    
    // 检查是否有分享数据
    checkForSharedData();
}); 