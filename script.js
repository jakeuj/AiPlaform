// 全局應用數據
let appsData = [];
let categoriesData = [];

// DOM元素
const categorizedAppsContainer = document.getElementById('categorizedApps');
const categoryFiltersContainer = document.getElementById('categoryFilters');
const installModal = document.getElementById('installModal');
const launchModal = document.getElementById('launchModal');
const adminModal = document.getElementById('adminModal');
const closeModalBtn = document.getElementById('closeModal');
const closeLaunchModalBtn = document.getElementById('closeLaunchModal');
const closeAdminModalBtn = document.getElementById('closeAdminModal');
const modalAppName = document.getElementById('modalAppName');
const launchAppName = document.getElementById('launchAppName');
const installProgress = document.getElementById('installProgress');
const installStatus = document.getElementById('installStatus');
const launchBtn = document.getElementById('launchBtn');
const adminToggleBtn = document.getElementById('adminToggle');
const saveAppBtn = document.getElementById('saveAppBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editAppCategorySelect = document.getElementById('editAppCategory');

// 當前選中的應用
let selectedApp = null;
let currentEditApp = null;
let currentCategoryFilter = 'all';

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 從JSON文件和localStorage加載應用數據
    await loadApps();
    
    // 事件監聽器
    setupEventListeners();
});

// 從JSON文件和localStorage加載應用數據
async function loadApps() {
    try {
        // 嘗試從JSON文件加載基礎應用數據
        try {
            const response = await fetch('apps.json');
            const data = await response.json();
            appsData = data.apps;
            categoriesData = data.categories || [];
        } catch (fetchError) {
            console.warn('無法通過fetch加載apps.json (可能是CORS限制)。使用內置備用數據。', fetchError);
            // 使用內置備用數據
            const backupData = getBackupAppsData();
            appsData = backupData.apps;
            categoriesData = backupData.categories;
        }
        
        // 如果存在本地儲存數據，合併它
        const localApps = localStorage.getItem('appsData');
        if (localApps) {
            const parsedLocalApps = JSON.parse(localApps);
            
            // 合併本地儲存數據與基礎數據
            parsedLocalApps.forEach(localApp => {
                const existingIndex = appsData.findIndex(app => app.id === localApp.id);
                if (existingIndex !== -1) {
                    // 更新已存在的應用
                    appsData[existingIndex] = localApp;
                } else {
                    // 添加新應用
                    appsData.push(localApp);
                }
            });
        }
        
        // 載入本地儲存的分類數據
        const localCategories = localStorage.getItem('categoriesData');
        if (localCategories) {
            const parsedLocalCategories = JSON.parse(localCategories);
            
            // 合併本地儲存的分類數據
            parsedLocalCategories.forEach(localCategory => {
                const existingIndex = categoriesData.findIndex(category => category.id === localCategory.id);
                if (existingIndex !== -1) {
                    // 更新已存在的分類
                    categoriesData[existingIndex] = localCategory;
                } else {
                    // 添加新分類
                    categoriesData.push(localCategory);
                }
            });
        }
        
        // 渲染分類按鈕
        renderCategoryFilters();
        
        // 渲染應用網格
        renderCategorizedApps();
    } catch (error) {
        console.error('加載應用數據失敗:', error);
        
        // 顯示錯誤信息在頁面上
        categorizedAppsContainer.innerHTML = `
            <div class="error-message">
                <h3>加載應用數據失敗</h3>
                <p>錯誤信息: ${error.message}</p>
                <p>建議使用本地伺服器啟動此應用，例如：</p>
                <pre>npm install -g http-server<br>http-server</pre>
                <p>或</p>
                <pre>python -m http.server 8000</pre>
                <p>然後通過 http://localhost:8000 (或 http://localhost:8080) 訪問</p>
            </div>
        `;
    }
}

// 備用應用數據 (當無法加載JSON文件時使用)
function getBackupAppsData() {
    return {
        "categories": [
            {
                "id": "analytics",
                "name": "數據分析",
                "description": "資料視覺化與數據分析相關應用"
            },
            {
                "id": "ai-tools",
                "name": "AI 工具",
                "description": "各類人工智慧輔助工具"
            },
            {
                "id": "business",
                "name": "企業管理",
                "description": "企業管理與決策支援系統"
            }
        ],
        "apps": [
            {
                "id": "Ead",
                "name": "Expense Anomaly Detection",
                "description": "Expense Anomaly Detection 是一套結合 AI 與數據視覺化的智慧財務異常偵測報告系統，專為中大型企業打造，協助快速識別並預警財務資料中的異常費用行為。無論是異常的大額支出、重複付款，或不尋常的交易模式，系統皆可自動分析並提出明確的異常事件與圖表說明，提升企業內控效率，降低營運風險。",
                "icon": "https://www.gstatic.com/analytics-lego/svg/ic_looker_studio.svg", 
                "launchUrl": "https://lookerstudio.google.com/u/0/reporting/93bc5364-af06-40a9-8412-5c8bb1b98a41/page/S7JnD",
                "categoryId": "analytics"
            },
            {
                "id": "Pead",
                "name": "Power Ennowell Anomaly Detection",
                "description": "Power Ennowell Anomaly Detection 是一套智慧化的異常行為偵測與視覺化報告工具，專為企業監控大量資料中潛藏的異常變化而設計。透過先進的機器學習演算法與直觀的使用者介面，本系統能夠即時從企業設備或財務數據中識別出異常模式，協助決策者快速掌握潛在問題，降低營運風險。",
                "icon": "https://www.gstatic.com/analytics-lego/svg/ic_looker_studio.svg", 
                "launchUrl": "https://lookerstudio.google.com/u/1/reporting/39bef502-7085-4a5c-bc45-4d3cf9a8ad32/page/S7JnD",
                "categoryId": "analytics"
            },
            {
                "id": "sf",
                "name": "Sales Forecast",
                "description": "Sales Forecast 是一套以人工智慧與歷史數據為核心的智慧化銷售預測平台，能協助企業精準掌握未來銷售走勢，優化庫存、提升營收、降低營運風險。這不僅是一個報表工具，而是企業決策的智慧副駕，讓每一個銷售策略都建立在可靠的數據基礎之上。",
                "icon": "https://www.gstatic.com/analytics-lego/svg/ic_looker_studio.svg",
                "launchUrl": "https://lookerstudio.google.com/u/0/reporting/93bc5364-af06-40a9-8412-5c8bb1b98a41/page/S7JnD",
                "categoryId": "business"
            },
            {
                "id": "Cc",
                "name": "Career Consultation",
                "description": "Career Consultation 是一套整合人工智慧與人類專業的職涯諮詢平台，針對個人職涯發展與企業人才培育提供精準建議與行動方案。無論是剛畢業的新鮮人、轉職中的職場人士，還是希望進行內部職涯規劃的企業人資部門，都能透過本平台獲得即時、量身打造的諮詢與工具。",
                "icon": "https://www.gstatic.com/analytics-lego/svg/ic_looker_studio.svg",
                "launchUrl": "https://lookerstudio.google.com/u/1/reporting/39bef502-7085-4a5c-bc45-4d3cf9a8ad32/page/S7JnD",
                "categoryId": "ai-tools"
            }
        ]
    };
}

// 保存應用數據到本地儲存
function saveAppsToLocalStorage() {
    localStorage.setItem('appsData', JSON.stringify(appsData));
}

// 保存分類數據到本地儲存
function saveCategoriesToLocalStorage() {
    localStorage.setItem('categoriesData', JSON.stringify(categoriesData));
}

// 渲染分類過濾按鈕
function renderCategoryFilters() {
    // 保留「所有應用」按鈕
    categoryFiltersContainer.innerHTML = `<button class="filter-btn active" data-category="all">所有應用</button>`;
    
    // 添加分類按鈕
    categoriesData.forEach(category => {
        const button = document.createElement('button');
        button.className = 'filter-btn';
        button.dataset.category = category.id;
        button.textContent = category.name;
        
        button.addEventListener('click', () => {
            // 設置當前過濾器
            setCurrentCategoryFilter(category.id);
        });
        
        categoryFiltersContainer.appendChild(button);
    });
    
    // 為首個按鈕（所有應用）添加點擊事件
    const allButton = categoryFiltersContainer.querySelector('[data-category="all"]');
    if (allButton) {
        allButton.addEventListener('click', () => {
            setCurrentCategoryFilter('all');
        });
    }
}

// 設置當前分類過濾器
function setCurrentCategoryFilter(categoryId) {
    currentCategoryFilter = categoryId;
    
    // 更新按鈕狀態
    const buttons = categoryFiltersContainer.querySelectorAll('.filter-btn');
    buttons.forEach(button => {
        if (button.dataset.category === categoryId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // 重新渲染應用程式
    renderCategorizedApps();
}

// 創建默認圖標
function createDefaultIcon(appName) {
    // 創建一個canvas元素
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 設置畫布大小
    canvas.width = 80;
    canvas.height = 80;
    
    // 設置背景色
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, 80, 80);
    
    // 設置文字
    ctx.fillStyle = '#F9FAFB';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 獲取首字母或前兩個字母
    let initials;
    if (appName.length > 0) {
        if (/^[a-zA-Z]/.test(appName)) {
            // 如果以英文字母開頭，取第一個字母
            initials = appName.charAt(0).toUpperCase();
        } else {
            // 如果是中文或其他語言，取前一個字
            initials = appName.substring(0, 1);
        }
    } else {
        initials = '?';
    }
    
    // 繪製文字
    ctx.fillText(initials, 40, 40);
    
    // 返回數據URL
    return canvas.toDataURL('image/png');
}

// 渲染分類應用列表
function renderCategorizedApps() {
    categorizedAppsContainer.innerHTML = '';
    
    if (currentCategoryFilter === 'all') {
        // 按分類顯示所有應用
        categoriesData.forEach(category => {
            // 過濾該分類下的應用
            const categoryApps = appsData.filter(app => app.categoryId === category.id);
            
            // 如果此分類下有應用，則創建分類部分
            if (categoryApps.length > 0) {
                // 創建分類區塊
                const categorySection = document.createElement('div');
                categorySection.className = 'category-section';
                categorySection.innerHTML = `
                    <h3>${category.name}</h3>
                    <p class="category-description">${category.description}</p>
                    <div class="app-grid" id="appGrid-${category.id}"></div>
                `;
                
                categorizedAppsContainer.appendChild(categorySection);
                
                // 在該分類下渲染應用
                const categoryGrid = document.getElementById(`appGrid-${category.id}`);
                renderAppsInGrid(categoryApps, categoryGrid);
            }
        });
        
        // 處理沒有分類的應用
        const uncategorizedApps = appsData.filter(app => !app.categoryId || !categoriesData.some(cat => cat.id === app.categoryId));
        if (uncategorizedApps.length > 0) {
            // 創建未分類區塊
            const uncategorizedSection = document.createElement('div');
            uncategorizedSection.className = 'category-section';
            uncategorizedSection.innerHTML = `
                <h3>未分類應用</h3>
                <p class="category-description">尚未分類的應用程式</p>
                <div class="app-grid" id="appGrid-uncategorized"></div>
            `;
            
            categorizedAppsContainer.appendChild(uncategorizedSection);
            
            // 在未分類區塊下渲染應用
            const uncategorizedGrid = document.getElementById('appGrid-uncategorized');
            renderAppsInGrid(uncategorizedApps, uncategorizedGrid);
        }
    } else {
        // 只顯示特定分類的應用
        const category = categoriesData.find(cat => cat.id === currentCategoryFilter);
        if (category) {
            // 過濾該分類下的應用
            const categoryApps = appsData.filter(app => app.categoryId === category.id);
            
            // 創建分類區塊
            const categorySection = document.createElement('div');
            categorySection.className = 'category-section';
            categorySection.innerHTML = `
                <h3>${category.name}</h3>
                <p class="category-description">${category.description}</p>
                <div class="app-grid" id="appGrid-filtered"></div>
            `;
            
            categorizedAppsContainer.appendChild(categorySection);
            
            // 在該分類下渲染應用
            const categoryGrid = document.getElementById('appGrid-filtered');
            renderAppsInGrid(categoryApps, categoryGrid);
        } else {
            // 分類不存在，顯示錯誤信息
            categorizedAppsContainer.innerHTML = `
                <div class="error-message">
                    <h3>找不到分類</h3>
                    <p>指定的分類不存在。</p>
                </div>
            `;
        }
    }
    
    // 如果沒有應用程序，顯示提示信息
    if (appsData.length === 0) {
        categorizedAppsContainer.innerHTML = `
            <div class="info-message">
                <h3>沒有應用程式</h3>
                <p>目前沒有可用的應用程式。請使用右下角的「管理應用」按鈕添加新應用。</p>
            </div>
        `;
    }
}

// 在網格中渲染應用
function renderAppsInGrid(apps, gridElement) {
    apps.forEach(app => {
        const appCard = document.createElement('div');
        appCard.className = 'app-card';
        appCard.dataset.appId = app.id;
        
        // 預先生成默認圖標數據URL
        const defaultIconUrl = createDefaultIcon(app.name);
        
        appCard.innerHTML = `
            <img src="${app.icon}" alt="${app.name}" class="app-icon" onerror="this.src='${defaultIconUrl}'">
            <div class="app-info">
                <h3 class="app-title">${app.name}</h3>
                <p class="app-description">${app.description}</p>
            </div>
        `;
        
        // 點擊卡片顯示安裝模態框
        appCard.addEventListener('click', () => {
            startInstallation(app);
        });
        
        gridElement.appendChild(appCard);
    });
}

// 開始安裝應用
function startInstallation(app) {
    selectedApp = app;
    modalAppName.textContent = app.name;
    installProgress.style.width = '0%';
    installStatus.textContent = '準備安裝...';
    
    // 顯示安裝模態框
    installModal.style.display = 'flex';
    
    // 模擬安裝進度
    simulateInstallation();
}

// 模擬安裝進度
function simulateInstallation() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // 完成安裝
            installStatus.textContent = '安裝完成！';
            
            // 2秒後顯示啟動模態框
            setTimeout(() => {
                installModal.style.display = 'none';
                showLaunchModal();
            }, 2000);
        }
        
        // 更新進度條
        installProgress.style.width = `${progress}%`;
        
        // 更新狀態文本
        if (progress < 30) {
            installStatus.textContent = '下載應用程式...';
        } else if (progress < 70) {
            installStatus.textContent = '安裝依賴項...';
        } else {
            installStatus.textContent = '配置應用程式...';
        }
    }, 300);
}

// 顯示啟動模態框
function showLaunchModal() {
    launchAppName.textContent = selectedApp.name;
    launchModal.style.display = 'flex';
    
    // 設置啟動按鈕點擊事件
    launchBtn.onclick = function() {
        // 在新窗口中打開應用程式的URL
        window.open(selectedApp.launchUrl, '_blank');
        launchModal.style.display = 'none';
    };
}

// 打開應用編輯模態框
function openAppEditor(app = null) {
    // 如果提供了應用，編輯該應用；否則創建新應用
    currentEditApp = app ? {...app} : {
        id: generateId(),
        name: '',
        description: '',
        icon: '',
        launchUrl: '',
        categoryId: ''
    };
    
    // 填充表單
    document.getElementById('editAppId').value = currentEditApp.id;
    document.getElementById('editAppName').value = currentEditApp.name;
    document.getElementById('editAppDescription').value = currentEditApp.description;
    document.getElementById('editAppIcon').value = currentEditApp.icon;
    document.getElementById('editAppLaunchUrl').value = currentEditApp.launchUrl;
    
    // 填充分類下拉選單
    populateCategoryDropdown(currentEditApp.categoryId);
    
    // 顯示模態框
    adminModal.style.display = 'flex';
}

// 填充分類下拉選單
function populateCategoryDropdown(selectedCategoryId = '') {
    // 清空現有選項
    editAppCategorySelect.innerHTML = '';
    
    // 添加空選項
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '-- 選擇分類 --';
    editAppCategorySelect.appendChild(emptyOption);
    
    // 添加所有分類選項
    categoriesData.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        editAppCategorySelect.appendChild(option);
    });
    
    // 設置選中的分類
    editAppCategorySelect.value = selectedCategoryId;
}

// 保存應用編輯
function saveAppEdit() {
    // 獲取表單數據
    const updatedApp = {
        id: document.getElementById('editAppId').value,
        name: document.getElementById('editAppName').value,
        description: document.getElementById('editAppDescription').value,
        icon: document.getElementById('editAppIcon').value,
        launchUrl: document.getElementById('editAppLaunchUrl').value,
        categoryId: document.getElementById('editAppCategory').value
    };
    
    // 驗證必填字段
    if (!updatedApp.name || !updatedApp.description || !updatedApp.launchUrl) {
        alert('應用名稱、描述和啟動URL是必填的！');
        return;
    }
    
    // 如果圖標為空，使用默認生成的圖標
    if (!updatedApp.icon) {
        updatedApp.icon = createDefaultIcon(updatedApp.name);
    }
    
    // 更新或添加應用
    const existingIndex = appsData.findIndex(app => app.id === updatedApp.id);
    if (existingIndex !== -1) {
        appsData[existingIndex] = updatedApp;
    } else {
        appsData.push(updatedApp);
    }
    
    // 保存到本地儲存
    saveAppsToLocalStorage();
    
    // 重新渲染應用網格
    renderCategorizedApps();
    
    // 關閉模態框
    adminModal.style.display = 'none';
    
    // 顯示成功消息
    alert(`應用 "${updatedApp.name}" 已成功保存！`);
}

// 生成隨機ID
function generateId() {
    return 'app_' + Math.random().toString(36).substr(2, 9);
}

// 設置所有事件監聽器
function setupEventListeners() {
    // 關閉安裝模態框
    closeModalBtn.addEventListener('click', () => {
        installModal.style.display = 'none';
    });
    
    // 關閉啟動模態框
    closeLaunchModalBtn.addEventListener('click', () => {
        launchModal.style.display = 'none';
    });
    
    // 關閉管理模態框
    closeAdminModalBtn.addEventListener('click', () => {
        adminModal.style.display = 'none';
    });
    
    // 顯示管理模態框
    adminToggleBtn.addEventListener('click', () => {
        // 顯示應用列表和添加新應用選項
        const appSelector = document.createElement('div');
        appSelector.className = 'app-selector';
        appSelector.innerHTML = `
            <h3>選擇要編輯的應用</h3>
            <div class="app-list">
                ${appsData.map(app => `
                    <div class="app-list-item" data-app-id="${app.id}">
                        <span>${app.name}</span>
                        <span class="app-list-category">${getCategoryNameById(app.categoryId) || '未分類'}</span>
                    </div>
                `).join('')}
            </div>
            <button id="addNewAppBtn" class="btn primary">添加新應用</button>
            <button id="manageCategoriesBtn" class="btn secondary">管理分類</button>
        `;
        
        // 替換當前的管理內容
        const adminContent = document.querySelector('.admin-content');
        const originalContent = adminContent.innerHTML;
        adminContent.innerHTML = '';
        adminContent.appendChild(appSelector);
        
        // 添加事件監聽器
        document.querySelectorAll('.app-list-item').forEach(item => {
            item.addEventListener('click', () => {
                const appId = item.dataset.appId;
                const app = appsData.find(a => a.id === appId);
                
                // 恢復原始內容
                adminContent.innerHTML = originalContent;
                
                // 打開應用編輯器
                openAppEditor(app);
            });
        });
        
        // 添加新應用按鈕
        document.getElementById('addNewAppBtn').addEventListener('click', () => {
            // 恢復原始內容
            adminContent.innerHTML = originalContent;
            
            // 打開空白的應用編輯器
            openAppEditor();
        });
        
        // 管理分類按鈕 (如果需要這個功能的話)
        const manageCategoriesBtn = document.getElementById('manageCategoriesBtn');
        if (manageCategoriesBtn) {
            manageCategoriesBtn.addEventListener('click', () => {
                // 這裡可以實現分類管理功能，暫時只顯示一個提示
                alert('分類管理功能尚未實現。目前可通過JSON文件管理分類。');
            });
        }
        
        // 顯示模態框
        adminModal.style.display = 'flex';
    });
    
    // 保存應用編輯
    saveAppBtn.addEventListener('click', saveAppEdit);
    
    // 取消編輯
    cancelEditBtn.addEventListener('click', () => {
        adminModal.style.display = 'none';
    });
    
    // 點擊模態框背景關閉模態框
    window.addEventListener('click', (event) => {
        if (event.target === installModal) {
            installModal.style.display = 'none';
        }
        if (event.target === launchModal) {
            launchModal.style.display = 'none';
        }
        if (event.target === adminModal) {
            adminModal.style.display = 'none';
        }
    });
}

// 根據分類ID獲取分類名稱
function getCategoryNameById(categoryId) {
    if (!categoryId) return null;
    const category = categoriesData.find(cat => cat.id === categoryId);
    return category ? category.name : null;
} 