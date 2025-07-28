// DOM元素
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const imageButton = document.getElementById('imageButton');
const fileInput = document.getElementById('fileInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const previewImage = document.getElementById('previewImage');
const removeImageBtn = document.getElementById('removeImageBtn');
const imageInfo = document.getElementById('imageInfo');
const chatMessages = document.getElementById('chatMessages');
const loadingIndicator = document.getElementById('loadingIndicator');
const avatarImage = document.getElementById('avatarImage');
const knowledgeList = document.getElementById('knowledgeList');
const avatarStatus = document.getElementById('avatarStatus');

// 全局变量
let currentImageFile = null;
let currentImageBase64 = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    loadKnowledgeBase();
    checkSystemStatus();
    setupEventListeners();
    animateAvatar();
    showWelcomeMessage();
});

// 显示欢迎消息
function showWelcomeMessage() {
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    const isEnglish = currentLang === 'en';
    
    const welcomeMessage = isEnglish 
        ? '👋 Hello! I am your dedicated OneNote technical support assistant!\n\n🎯 **My Areas of Expertise**:\n📱 Mobile sync issues\n🔐 Account and permission problems\n📁 File and notebook management\n🎨 Formatting and layout issues\n✍️ Handwriting and drawing features\n🔧 Plugin and integration problems\n💾 Data recovery and backup\n⚡ Performance optimization suggestions\n\nPlease describe the specific problem you are experiencing, and I will provide you with professional solutions!'
        : '👋 您好！我是您的专属OneNote技术支持助理！\n\n🎯 **我的专长领域**：\n📱 移动端同步问题\n🔐 账户和权限问题\n📁 文件和笔记本管理\n🎨 格式和排版问题\n✍️ 手写和绘图功能\n🔧 插件和集成问题\n💾 数据恢复和备份\n⚡ 性能优化建议\n\n请描述您遇到的具体问题，我会为您提供专业的解决方案！';
    
    addMessage(welcomeMessage, 'assistant', 'Local', false);
}

// 更新欢迎消息（用于语言切换）
function updateWelcomeMessage() {
    // 清除现有消息
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
    
    // 重新显示欢迎消息
    showWelcomeMessage();
}

// 设置事件监听器
function setupEventListeners() {
    // 发送按钮点击
    sendButton.addEventListener('click', sendMessage);
    
    // 图片按钮点击
    imageButton.addEventListener('click', function() {
        fileInput.click();
    });
    
    // 文件选择
    fileInput.addEventListener('change', handleFileSelect);
    
    // 移除图片按钮
    removeImageBtn.addEventListener('click', removeImage);
    
    // 回车键发送
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 粘贴事件监听（Ctrl+V 粘贴图片）
    document.addEventListener('paste', handlePaste);
    
    // 拖拽上传
    const chatInputContainer = document.querySelector('.chat-input-container');
    
    chatInputContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.classList.add('drag-over');
    });
    
    chatInputContainer.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
    });
    
    chatInputContainer.addEventListener('drop', function(e) {
        e.preventDefault();
        this.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            handleImageFile(files[0]);
        }
    });
    
    // 回车键发送
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 建议按钮点击
    document.querySelectorAll('.suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', function() {
            const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
            const isEnglish = currentLang === 'en';
            
            // 根据建议类型获取多语言文本
            const suggestionType = this.getAttribute('data-i18n');
            const suggestionTexts = isEnglish ? {
                'suggestion-sync': 'OneNote sync is very slow, what should I do?',
                'suggestion-loading': 'OneNote pages won\'t load',
                'suggestion-search': 'OneNote search function doesn\'t work well',
                'suggestion-print': 'OneNote print format is messed up',
                'suggestion-performance': 'OneNote runs very slowly',
                'suggestion-account': 'Unable to login to OneNote account',
                'suggestion-mobile': 'Mobile OneNote not syncing',
                'suggestion-handwriting': 'OneNote stylus not responsive',
                'suggestion-backup': 'How to recover accidentally deleted OneNote notes'
            } : {
                'suggestion-sync': 'OneNote同步很慢怎么办？',
                'suggestion-loading': 'OneNote页面加载不出来',
                'suggestion-search': 'OneNote搜索功能不好用',
                'suggestion-print': 'OneNote打印格式乱了',
                'suggestion-performance': 'OneNote运行很卡',
                'suggestion-account': 'OneNote无法登录账户',
                'suggestion-mobile': '手机OneNote不同步',
                'suggestion-handwriting': 'OneNote手写笔不灵敏',
                'suggestion-backup': 'OneNote笔记误删如何恢复'
            };
            
            const text = suggestionTexts[suggestionType] || this.getAttribute('data-text');
            messageInput.value = text;
            sendMessage();
        });
    });
    
    // 快速帮助点击
    document.querySelectorAll('.help-item').forEach(item => {
        item.addEventListener('click', function() {
            const topic = this.getAttribute('data-topic');
            const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
            
            // 根据语言获取对应的帮助文本
            const helpTexts = currentLang === 'en' ? {
                'sync': 'How to solve OneNote sync issues? Files not syncing and showing offline status',
                'performance': 'What to do when OneNote runs slowly? Frequent crashes and slow response',
                'search': 'OneNote search function doesn\'t work well, can\'t find existing content',
                'print': 'OneNote print format issues, layout problems',
                'account': 'OneNote login and permission issues, unable to access shared notebooks',
                'mobile': 'Mobile OneNote sync issues, content inconsistency between phone and computer',
                'handwriting': 'OneNote handwriting and drawing function issues, stylus recognition problems',
                'backup': 'OneNote data recovery and backup, how to recover accidentally deleted content'
            } : {
                'sync': 'OneNote同步问题怎么解决？文件不同步且显示离线状态',
                'performance': 'OneNote运行很卡怎么办？经常崩溃和响应迟缓',
                'search': 'OneNote搜索功能不好用，搜索不到已存在的内容',
                'print': 'OneNote打印时格式有问题，排版错乱',
                'account': 'OneNote登录和权限问题，无法访问共享笔记本',
                'mobile': '移动端OneNote同步异常，手机和电脑内容不一致',
                'handwriting': 'OneNote手写和绘图功能异常，触控笔识别有问题',
                'backup': 'OneNote数据恢复和备份，误删除内容如何找回'
            };
            
            if (helpTexts[topic]) {
                messageInput.value = helpTexts[topic];
                sendMessage();
            }
        });
    });
}

// 图片处理函数
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageFile(file);
    }
}

function handlePaste(event) {
    const items = event.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            handleImageFile(file);
            break;
        }
    }
}

function handleImageFile(file) {
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    const isEnglish = currentLang === 'en';
    
    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        const typeMessage = isEnglish ? 'Please select supported image formats: JPG, PNG, GIF, WebP' : '请选择支持的图片格式：JPG、PNG、GIF、WebP';
        showToast(typeMessage, 'error');
        return;
    }
    
    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
        const sizeMessage = isEnglish ? 'Image file too large, please select an image smaller than 5MB' : '图片文件过大，请选择小于5MB的图片';
        showToast(sizeMessage, 'error');
        return;
    }
    
    // 检查最小尺寸
    if (file.size < 1024) { // 1KB
        const minSizeMessage = isEnglish ? 'Image file too small, please select a valid image file' : '图片文件过小，请选择有效的图片文件';
        showToast(minSizeMessage, 'error');
        return;
    }
    
    currentImageFile = file;
    const processingMessage = isEnglish ? 'Processing image...' : '正在处理图片...';
    showToast(processingMessage, 'info');
    
    // 创建文件读取器
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // 验证Base64格式
        const base64Data = e.target.result;
        if (!base64Data || !base64Data.startsWith('data:image/')) {
            const formatMessage = isEnglish ? 'Invalid image format, please select again' : '图片格式无效，请重新选择';
            showToast(formatMessage, 'error');
            return;
        }
        
        currentImageBase64 = base64Data;
        
        // 显示预览
        previewImage.src = currentImageBase64;
        imagePreviewContainer.classList.remove('hidden');
        imagePreviewContainer.classList.add('show');
        
        // 更新信息
        const sizeKB = Math.round(file.size / 1024);
        const sizeText = sizeKB < 1024 ? `${sizeKB}KB` : `${(sizeKB / 1024).toFixed(1)}MB`;
        const readyText = isEnglish ? 'Image ready, supports AI analysis' : '图片已准备，支持AI分析';
        imageInfo.textContent = `${file.name} (${sizeText}) - ✅ ${readyText}`;
        
        // 聚焦到输入框
        messageInput.focus();
        
        const successMessage = isEnglish ? 'Image uploaded successfully, you can now describe the issue and send' : '图片上传成功，现在可以描述问题并发送';
        showToast(successMessage, 'success');
    };
    
    reader.onerror = function() {
        const errorMessage = isEnglish ? 'Failed to read image, please try again' : '图片读取失败，请重试';
        showToast(errorMessage, 'error');
        currentImageFile = null;
        currentImageBase64 = null;
    };
    
    reader.readAsDataURL(file);
}

function removeImage() {
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    const isEnglish = currentLang === 'en';
    
    currentImageFile = null;
    currentImageBase64 = null;
    imagePreviewContainer.classList.add('hidden');
    imagePreviewContainer.classList.remove('show');
    fileInput.value = '';
    
    const removeMessage = isEnglish ? 'Image removed' : '图片已移除';
    showToast(removeMessage, 'info');
}

// 发送消息
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    // 检查图片状态
    const hasImage = !!currentImageBase64;
    const imageName = currentImageFile ? currentImageFile.name : null;
    
    // 获取当前语言
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    
    // 准备发送数据
    const sendData = {
        message: message,
        hasImage: hasImage,
        image: currentImageBase64,
        imageName: imageName,
        language: currentLang
    };
    
    // 显示用户消息（包含图片预览）
    addMessage(message, 'user', null, false, currentImageBase64);
    messageInput.value = '';
    
    // 清除图片预览
    if (currentImageBase64) {
        removeImage();
    }
    
    // 显示加载指示器
    showLoading(true);
    if (hasImage) {
        const loadingText = currentLang === 'en' ? '🔍 AI is analyzing image content...' : '🔍 AI正在分析图片内容...';
        const toastText = currentLang === 'en' ? 'Using Alibaba Cloud AI to analyze image, please wait...' : '正在使用阿里云AI分析图片，请稍候...';
        updateLoadingText(loadingText);
        showToast(toastText, 'info');
    } else {
        const loadingText = currentLang === 'en' ? '🤖 AI assistant is analyzing the problem...' : '🤖 AI助理正在分析问题...';
        updateLoadingText(loadingText);
    }
    
    // 头像动画
    animateAvatarThinking();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sendData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // 显示AI回复，包含来源信息
            let responseText = data.response;
            const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
            
            // 添加来源标识和图片分析反馈
            if (hasImage && data.source !== 'Local') {
                const successText = currentLang === 'en' ? 'Image analysis completed!' : '图片分析完成！';
                const imageAnalysisLabel = currentLang === 'en' ? '🖼️ **Image Analysis Result**' : '🖼️ **图片分析结果**';
                showToast(successText, 'success');
                responseText = `${imageAnalysisLabel}\n\n${responseText}`;
            }
            
            if (data.source === 'Local') {
                const localText = currentLang === 'en' 
                    ? '\n\n💡 *Currently using local knowledge base. [Click here to learn how to configure AI responses](#config)*'
                    : '\n\n💡 *当前使用本地知识库回答，[点击这里了解如何配置AI回答](#config)*';
                responseText += localText;
            }
            
            if (data.hasOnlineInfo) {
                const onlineText = currentLang === 'en' ? '\n\n🌐 *Includes latest online information*' : '\n\n🌐 *包含最新在线信息*';
                responseText += onlineText;
            }
            
            addMessage(responseText, 'assistant', data.source, data.hasOnlineInfo);
        } else {
            // 显示错误或备用回复
            const errorText = currentLang === 'en' 
                ? 'Sorry, I encountered some technical issues. Please try again later.'
                : '抱歉，我遇到了一些技术问题，请稍后再试。';
            addMessage(data.response || errorText, 'assistant');
        }
    } catch (error) {
        console.error('发送消息错误:', error);
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        const networkErrorText = currentLang === 'en' 
            ? 'Sorry, there was a network connection issue. Please check your network connection and try again.'
            : '抱歉，网络连接出现问题。请检查网络连接后重试。';
        addMessage(networkErrorText, 'assistant');
    } finally {
        showLoading(false);
        resetAvatarAnimation();
    }
}

// 添加消息到聊天区域
function addMessage(content, sender, source = null, hasOnlineInfo = false, imageData = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const currentTime = new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    if (sender === 'assistant') {
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        const isEnglish = currentLang === 'en';
        
        let badges = '';
        if (source === 'AI') {
            const aiBadgeText = isEnglish ? '🤖 AI Response' : '🤖 AI回答';
            badges += `<span class="source-badge ai-badge">${aiBadgeText}</span>`;
        } else if (source === 'Local') {
            const localBadgeText = isEnglish ? '📚 Local Knowledge' : '📚 本地知识库';
            badges += `<span class="source-badge local-badge">${localBadgeText}</span>`;
        }
        
        if (hasOnlineInfo) {
            const onlineBadgeText = isEnglish ? '🌐 Online Info' : '🌐 在线信息';
            badges += `<span class="source-badge online-badge">${onlineBadgeText}</span>`;
        }
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="onenote.jpg" alt="助理">
            </div>
            <div class="message-content">
                ${badges}
                <p>${formatMessage(content)}</p>
                <div class="message-time">${currentTime}</div>
            </div>
        `;
    } else {
        // 用户消息，可能包含图片
        let imageHtml = '';
        if (imageData) {
            imageHtml = `
                <div class="message-image">
                    <img src="${imageData}" alt="用户上传的图片" onclick="showImageModal(this.src)">
                    <div class="image-badge">📷 包含图片</div>
                </div>
            `;
        }
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${imageHtml}
                <p>${formatMessage(content)}</p>
                <div class="message-time">${currentTime}</div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // 添加动画效果
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
    
    // 处理配置链接点击
    if (content.includes('#config')) {
        const configLink = messageDiv.querySelector('a[href="#config"]');
        if (configLink) {
            configLink.addEventListener('click', function(e) {
                e.preventDefault();
                showConfigModal();
            });
        }
    }
}

// 格式化消息内容
function formatMessage(content) {
    // 处理换行
    content = content.replace(/\n/g, '<br>');
    
    // 处理编号列表
    content = content.replace(/(\d+)\.\s/g, '<strong>$1.</strong> ');
    
    // 处理加粗文本
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理斜体文本
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return content;
}

// 显示/隐藏加载指示器
function showLoading(show) {
    if (show) {
        loadingIndicator.classList.add('show');
    } else {
        loadingIndicator.classList.remove('show');
    }
}

// 更新加载文本
function updateLoadingText(text) {
    const loadingText = loadingIndicator.querySelector('span');
    if (loadingText) {
        loadingText.textContent = text;
    }
}

// 检查系统状态
async function checkSystemStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.success) {
            updateSystemStatus(data);
            updateSystemNotice(data);
        }
    } catch (error) {
        console.error('检查系统状态错误:', error);
    }
}

// 更新系统通知
function updateSystemNotice(status) {
    const systemNotice = document.querySelector('.system-notice');
    if (systemNotice) {
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        
        if (status.apiConfigured) {
            const successMessage = currentLang === 'en' 
                ? 'DeepSeek AI configured, enjoy intelligent responses!'
                : 'DeepSeek AI已配置，享受智能回答！';
            
            systemNotice.innerHTML = `
                <i class="fas fa-check-circle" style="color: #10b981;"></i>
                <span>${successMessage}</span>
            `;
            systemNotice.style.background = 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)';
            systemNotice.style.borderColor = '#86efac';
            systemNotice.style.color = '#065f46';
        } else {
            const localMessage = currentLang === 'en' 
                ? 'Currently using local knowledge base, <a href="#" onclick="showConfigModal(); return false;">click to configure AI responses</a>'
                : '当前使用本地知识库，<a href="#" onclick="showConfigModal(); return false;">点击配置AI回答</a>';
            
            systemNotice.innerHTML = `
                <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>
                <span>${localMessage}</span>
            `;
            systemNotice.style.background = 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)';
            systemNotice.style.borderColor = '#fbbf24';
            systemNotice.style.color = '#92400e';
        }
    }
}

// 更新系统状态显示
function updateSystemStatus(status) {
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    const isEnglish = currentLang === 'en';
    
    if (avatarStatus) {
        if (status.apiConfigured) {
            const aiModeText = isEnglish ? 'AI Mode' : 'AI模式';
            const aiTooltip = isEnglish ? 'DeepSeek AI configured, enjoy smart responses!' : 'DeepSeek AI已配置，享受智能回答！';
            
            avatarStatus.innerHTML = `<i class="fas fa-circle" style="color: #10b981;"></i><span>${aiModeText}</span>`;
            avatarStatus.title = aiTooltip;
        } else {
            const localModeText = isEnglish ? 'Local Mode' : '本地模式';
            const localTooltip = isEnglish ? 'Currently using local knowledge base, click to configure AI responses' : '当前使用本地知识库，点击配置AI回答';
            
            avatarStatus.innerHTML = `<i class="fas fa-circle" style="color: #f59e0b;"></i><span>${localModeText}</span>`;
            avatarStatus.title = localTooltip;
            avatarStatus.style.cursor = 'pointer';
            avatarStatus.addEventListener('click', showConfigModal);
        }
    }
}

// 显示配置模态框
function showConfigModal() {
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    const isEnglish = currentLang === 'en';
    
    const modal = document.createElement('div');
    modal.className = 'config-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🤖 ${isEnglish ? 'Configure AI Service' : '配置AI服务'}</h3>
                <button class="close-btn" onclick="this.closest('.config-modal').remove()">×</button>
            </div>
            <div class="modal-body">
                <p>${isEnglish ? 'To get smarter AI responses, please select and configure an AI service:' : '为了获得更智能的AI回答，请选择并配置AI服务：'}</p>
                
                <div class="api-provider-selection">
                    <h4>📋 ${isEnglish ? 'Select AI Provider' : '选择AI服务商'}</h4>
                    <div class="provider-options">
                        <div class="provider-option" data-provider="dashscope">
                            <div class="provider-header">
                                <input type="radio" name="aiProvider" value="dashscope" id="dashscope" checked>
                                <label for="dashscope">
                                    <strong>🌟 ${isEnglish ? 'Alibaba Cloud DashScope' : '阿里云百炼平台'}</strong>
                                    <span class="recommended">${isEnglish ? 'Recommended' : '推荐'}</span>
                                </label>
                            </div>
                            <div class="provider-features">
                                <span class="feature">✅ ${isEnglish ? 'Image understanding' : '支持图片理解'}</span>
                                <span class="feature">✅ ${isEnglish ? 'Qwen large model' : 'Qwen大模型'}</span>
                                <span class="feature">✅ ${isEnglish ? 'Chinese optimized' : '中文优化'}</span>
                            </div>
                        </div>
                        
                        <div class="provider-option" data-provider="deepseek">
                            <div class="provider-header">
                                <input type="radio" name="aiProvider" value="deepseek" id="deepseek">
                                <label for="deepseek">
                                    <strong>🔹 DeepSeek</strong>
                                </label>
                            </div>
                            <div class="provider-features">
                                <span class="feature">✅ ${isEnglish ? 'Strong code understanding' : '代码理解强'}</span>
                                <span class="feature">✅ ${isEnglish ? 'Good logical reasoning' : '逻辑推理好'}</span>
                                <span class="feature">❌ ${isEnglish ? 'No image support' : '不支持图片'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="api-key-input-section">
                    <label for="apiKeyInput">API密钥：</label>
                    <div class="input-with-button">
                        <input 
                            type="password" 
                            id="apiKeyInput" 
                            placeholder="粘贴您的API密钥 (sk-...)" 
                            class="api-key-input"
                            maxlength="200"
                        >
                        <button type="button" class="toggle-visibility" onclick="toggleApiKeyVisibility()">
                            <i class="fas fa-eye" id="toggleIcon"></i>
                        </button>
                    </div>
                    <div class="input-hint" id="keyHint">
                        💡 阿里云百炼密钥格式：sk-xxxxxxxxxxxxxx
                    </div>
                </div>
                
                <div class="config-actions">
                    <button class="btn-primary" onclick="saveApiKey()">
                        <i class="fas fa-save"></i> 保存并测试
                    </button>
                    <button class="btn-secondary" onclick="testCurrentConfig()">
                        <i class="fas fa-check"></i> 测试当前配置
                    </button>
                </div>
                
                <div class="divider">
                    <span>获取API密钥</span>
                </div>
                
                <div class="config-steps">
                    <div class="step-header">
                        <h4>� 获取密钥指南</h4>
                    </div>
                    <div class="api-links">
                        <a href="https://dashscope.console.aliyun.com/" target="_blank" class="api-link dashscope-link">
                            <i class="fas fa-external-link-alt"></i>
                            阿里云百炼平台
                        </a>
                        <a href="https://www.deepseek.com/" target="_blank" class="api-link deepseek-link">
                            <i class="fas fa-external-link-alt"></i>
                            DeepSeek平台
                        </a>
                    </div>
                    
                    <div class="step">
                        <span class="step-number">1</span>
                        <div class="step-content">
                            <h5>${isEnglish ? 'Get API Key' : '获取API密钥'}</h5>
                            <p>${isEnglish ? 'Visit' : '访问'} <a href="https://www.deepseek.com/" target="_blank">${isEnglish ? 'DeepSeek Official Website' : 'DeepSeek官网'}</a> ${isEnglish ? 'to register and get API key' : '注册并获取API密钥'}</p>
                        </div>
                    </div>
                    
                    <div class="step">
                        <span class="step-number">2</span>
                        <div class="step-content">
                            <h5>${isEnglish ? 'Configure Environment Variable' : '配置环境变量'}</h5>
                            <p>${isEnglish ? 'Set in the <code>.env</code> file in the project root directory:' : '在项目根目录的 <code>.env</code> 文件中设置：'}</p>
                            <div class="code-block">
                                <code>DEEPSEEK_API_KEY=sk-your-actual-key-here</code>
                                <button class="copy-btn" onclick="copyToClipboard('DEEPSEEK_API_KEY=sk-your-actual-key-here')">${isEnglish ? 'Copy' : '复制'}</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="step">
                        <span class="step-number">3</span>
                        <div class="step-content">
                            <h5>${isEnglish ? 'Restart Server' : '重启服务器'}</h5>
                            <p>${isEnglish ? 'After saving the file, restart the server to make the configuration take effect' : '保存文件后，重启服务器以使配置生效'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.config-modal').remove()">${isEnglish ? 'Configure Later' : '稍后配置'}</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 添加AI提供商选择变化监听器
    const providerRadios = modal.querySelectorAll('input[name="aiProvider"]');
    providerRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateApiKeyHint(this.value);
        });
    });
    
    // 点击背景关闭模态框
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 更新API密钥提示
function updateApiKeyHint(provider) {
    const keyHint = document.getElementById('keyHint');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    const isEnglish = currentLang === 'en';
    
    if (provider === 'dashscope') {
        keyHint.textContent = isEnglish 
            ? '💡 Alibaba Cloud key format: sk-xxxxxxxxxxxxxx'
            : '💡 阿里云百炼密钥格式：sk-xxxxxxxxxxxxxx';
        apiKeyInput.placeholder = isEnglish 
            ? 'Paste your Alibaba Cloud API key (sk-...)'
            : '粘贴您的阿里云百炼API密钥 (sk-...)';
    } else if (provider === 'deepseek') {
        keyHint.textContent = isEnglish 
            ? '💡 DeepSeek key format: sk-xxxxxxxxxxxxxxxxxxxxxxxx'
            : '💡 DeepSeek密钥格式：sk-xxxxxxxxxxxxxxxxxxxxxxxx';
        apiKeyInput.placeholder = isEnglish 
            ? 'Paste your DeepSeek API key (sk-...)'
            : '粘贴您的DeepSeek API密钥 (sk-...)';
    }
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // 显示复制成功提示
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        const successMessage = currentLang === 'en' ? 'Copied to clipboard!' : '已复制到剪贴板！';
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = successMessage;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 2000);
    }).catch(function(err) {
        console.error('复制失败:', err);
    });
}

// 切换API密钥可见性
function toggleApiKeyVisibility() {
    const input = document.getElementById('apiKeyInput');
    const icon = document.getElementById('toggleIcon');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// 保存API密钥
async function saveApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    const selectedProvider = document.querySelector('input[name="aiProvider"]:checked').value;
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    const isEnglish = currentLang === 'en';
    
    if (!apiKey) {
        const emptyMessage = isEnglish ? 'Please enter API key' : '请输入API密钥';
        showToast(emptyMessage, 'error');
        return;
    }
    
    if (!apiKey.startsWith('sk-')) {
        const formatMessage = isEnglish ? 'API key format error, should start with sk-' : 'API密钥格式错误，应以 sk- 开头';
        showToast(formatMessage, 'error');
        return;
    }
    
    try {
        const testingMessage = isEnglish ? 'Testing API key...' : '正在测试API密钥...';
        showToast(testingMessage, 'info');
        
        // 测试API密钥
        const response = await fetch('/api/test-api-key', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                apiKey: apiKey,
                provider: selectedProvider
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            const providerName = selectedProvider === 'dashscope' 
                ? (isEnglish ? 'Alibaba Cloud DashScope' : '阿里云百炼')
                : 'DeepSeek';
            const successMessage = isEnglish 
                ? `${providerName} API key is valid! Configuration saved`
                : `${providerName} API密钥有效！配置已保存`;
            showToast(successMessage, 'success');
            
            // 关闭模态框
            document.querySelector('.config-modal').remove();
            // 刷新页面以更新状态
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            const errorMessage = isEnglish 
                ? 'Invalid API key: ' + (result.error || 'Please check if the key is correct')
                : 'API密钥无效：' + (result.error || '请检查密钥是否正确');
            showToast(errorMessage, 'error');
        }
    } catch (error) {
        console.error('测试API密钥错误:', error);
        const networkMessage = isEnglish ? 'Test failed, please check network connection' : '测试失败，请检查网络连接';
        showToast(networkMessage, 'error');
    }
}

// 测试当前配置
async function testCurrentConfig() {
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    const isEnglish = currentLang === 'en';
    
    try {
        const testingMessage = isEnglish ? 'Testing current configuration...' : '正在测试当前配置...';
        showToast(testingMessage, 'info');
        
        const response = await fetch('/api/status');
        const data = await response.json();
        
        if (data.apiConfigured) {
            const successMessage = isEnglish ? 'Current configuration is valid, AI features are working!' : '当前配置有效，AI功能正常！';
            showToast(successMessage, 'success');
        } else {
            const warningMessage = isEnglish ? 'No valid API key configured' : '当前未配置有效的API密钥';
            showToast(warningMessage, 'warning');
        }
    } catch (error) {
        console.error('测试配置错误:', error);
        const errorMessage = isEnglish ? 'Test failed, please check server status' : '测试失败，请检查服务器状态';
        showToast(errorMessage, 'error');
    }
}

// 显示提示消息
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = {
        'success': 'fas fa-check-circle',
        'error': 'fas fa-exclamation-circle',
        'warning': 'fas fa-exclamation-triangle',
        'info': 'fas fa-info-circle'
    }[type] || 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// 头像思考动画
function animateAvatarThinking() {
    avatarImage.style.animation = 'pulse 1s ease-in-out infinite';
}

// 重置头像动画
function resetAvatarAnimation() {
    avatarImage.style.animation = '';
}

// 头像动画
function animateAvatar() {
    avatarImage.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(5deg)';
    });
    
    avatarImage.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
    });
}

// 更新当前时间
function updateCurrentTime() {
    const timeElement = document.getElementById('currentTime');
    if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        timeElement.textContent = timeString;
    }
}

// 加载知识库
async function loadKnowledgeBase() {
    try {
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        const response = await fetch(`/api/knowledge?language=${currentLang}`);
        const data = await response.json();
        
        if (data.success) {
            const knowledge = data.knowledge;
            knowledgeList.innerHTML = '';
            
            Object.keys(knowledge).forEach(category => {
                const li = document.createElement('li');
                li.textContent = category;
                li.style.cursor = 'pointer';
                li.addEventListener('click', function() {
                    const questionText = currentLang === 'en' 
                        ? `Please tell me how to solve ${category} issues`
                        : `请告诉我${category}的解决方案`;
                    messageInput.value = questionText;
                    sendMessage();
                });
                knowledgeList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('加载知识库错误:', error);
        const errorText = window.i18n && window.i18n.getCurrentLanguage() === 'en' 
            ? 'Failed to load knowledge base'
            : '知识库加载失败';
        knowledgeList.innerHTML = `<li>${errorText}</li>`;
    }
}

// 语音识别功能（可选）
function initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        // 添加语音输入按钮
        const voiceButton = document.createElement('button');
        voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceButton.className = 'voice-btn';
        voiceButton.title = '语音输入';
        
        voiceButton.addEventListener('click', function() {
            recognition.start();
            this.style.color = '#ef4444';
        });
        
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            messageInput.value = transcript;
            voiceButton.style.color = '';
        };
        
        recognition.onerror = function(event) {
            console.error('语音识别错误:', event.error);
            voiceButton.style.color = '';
        };
        
        recognition.onend = function() {
            voiceButton.style.color = '';
        };
        
        // 将语音按钮添加到输入框旁边
        const inputGroup = document.querySelector('.input-group');
        inputGroup.insertBefore(voiceButton, sendButton);
    }
}

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter 发送消息
    if (e.ctrlKey && e.key === 'Enter') {
        sendMessage();
    }
    
    // ESC 清空输入框
    if (e.key === 'Escape') {
        messageInput.value = '';
        messageInput.focus();
    }
});

// 自动聚焦输入框
messageInput.focus();

// 定期更新在线状态
setInterval(() => {
    const statusElement = document.querySelector('.avatar-status');
    if (statusElement) {
        // 这里可以添加实际的在线状态检查
        statusElement.innerHTML = '<i class="fas fa-circle"></i><span>在线</span>';
    }
}, 30000);

// 初始化语音识别（如果支持）
// initSpeechRecognition();

// 图片模态框功能
function showImageModal(imageSrc) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `<img src="${imageSrc}" alt="放大查看">`;
    
    // 点击关闭模态框
    modal.addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    
    // ESC键关闭模态框
    const closeOnEsc = function(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', closeOnEsc);
        }
    };
    document.addEventListener('keydown', closeOnEsc);
    
    document.body.appendChild(modal);
}

// Toast提示功能
function showToast(message, type = 'info') {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}
