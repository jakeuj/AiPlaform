// 全局應用數據
let appsData = [];

// DOM元素
const appGrid = document.getElementById('appGrid');
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

// 當前選中的應用
let selectedApp = null;
let currentEditApp = null;

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
        } catch (fetchError) {
            console.warn('無法通過fetch加載apps.json (可能是CORS限制)。使用內置備用數據。', fetchError);
            // 使用內置備用數據
            appsData = getBackupAppsData();
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
        
        // 渲染應用網格
        renderAppGrid();
    } catch (error) {
        console.error('加載應用數據失敗:', error);
        
        // 顯示錯誤信息在頁面上
        appGrid.innerHTML = `
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
    return [
        {
            "id": "dia",
            "name": "Dia",
            "description": "Dia是一個1.6B參數的文本轉語音模型，由Nari Labs創建。Dia直接從轉錄生成高度逼真的對話。您可以調節音頻輸出，啟用情感和語調控制。該模型還可以生成非語言交流，如笑聲、咳嗽、清嗓子等。",
            "icon": "https://raw.githubusercontent.com/pinokiocomputer/assets/master/apps/dia.png",
            "launchUrl": "https://github.com/nari-labs/dia"
        },
        {
            "id": "framepack",
            "name": "FramePack",
            "description": "[僅限NVIDIA] 逐步生成視頻。FramePack是一個下一幀預測（next-frame-section）神經網絡結構，可逐步生成視頻。",
            "icon": "https://raw.githubusercontent.com/pinokiocomputer/assets/master/apps/framepack.png",
            "launchUrl": "https://github.com/lllyasviel/FramePack"
        },
        {
            "id": "wan21",
            "name": "Wan 2.1",
            "description": "[僅限NVIDIA] 針對低配GPU機器的超級優化Gradio UI。為Wan2.1視頻生成器優化。生成高達12秒的視頻。",
            "icon": "https://raw.githubusercontent.com/pinokiocomputer/assets/master/apps/wan2.1.png",
            "launchUrl": "https://github.com/deepbeepmeeep/Wan2GP"
        },
        {
            "id": "uno",
            "name": "Uno",
            "description": "[僅限NVIDIA] 從多個圖像生成圖像。https://github.com/bytedance/UNO",
            "icon": "https://raw.githubusercontent.com/pinokiocomputer/assets/master/apps/uno.png", 
            "launchUrl": "https://github.com/bytedance/UNO"
        }
    ];
}

// 保存應用數據到本地儲存
function saveAppsToLocalStorage() {
    localStorage.setItem('appsData', JSON.stringify(appsData));
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

// 渲染應用網格
function renderAppGrid() {
    appGrid.innerHTML = '';
    
    appsData.forEach(app => {
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
        
        appGrid.appendChild(appCard);
    });
    
    // 添加錯誤處理CSS
    if (!document.getElementById('errorStyles')) {
        const style = document.createElement('style');
        style.id = 'errorStyles';
        style.textContent = `
            .error-message {
                background-color: rgba(255, 0, 0, 0.1);
                border: 1px solid #ff5555;
                border-radius: 5px;
                padding: 20px;
                color: #f8f8f2;
            }
            .error-message h3 {
                color: #ff5555;
                margin-bottom: 10px;
            }
            .error-message pre {
                background-color: #282a36;
                padding: 10px;
                border-radius: 3px;
                overflow-x: auto;
                margin: 10px 0;
            }
        `;
        document.head.appendChild(style);
    }
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
        launchUrl: ''
    };
    
    // 填充表單
    document.getElementById('editAppId').value = currentEditApp.id;
    document.getElementById('editAppName').value = currentEditApp.name;
    document.getElementById('editAppDescription').value = currentEditApp.description;
    document.getElementById('editAppIcon').value = currentEditApp.icon;
    document.getElementById('editAppLaunchUrl').value = currentEditApp.launchUrl;
    
    // 顯示模態框
    adminModal.style.display = 'flex';
}

// 保存應用編輯
function saveAppEdit() {
    // 獲取表單數據
    const updatedApp = {
        id: document.getElementById('editAppId').value,
        name: document.getElementById('editAppName').value,
        description: document.getElementById('editAppDescription').value,
        icon: document.getElementById('editAppIcon').value,
        launchUrl: document.getElementById('editAppLaunchUrl').value
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
    renderAppGrid();
    
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
                    </div>
                `).join('')}
            </div>
            <button id="addNewAppBtn" class="btn primary">添加新應用</button>
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