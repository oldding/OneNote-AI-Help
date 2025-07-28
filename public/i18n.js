// 国际化翻译文件
const translations = {
    zh: {
        // 页面标题和基本信息
        'title': 'OneNote AI助理',
        'subtitle': '专业解决OneNote使用问题',
        'status-online': '在线',
        'checking-status': '检查状态中...',
        'expert-title': 'OneNote专家',
        'expert-desc': '我是您的专属OneNote技术支持助理，随时为您解决使用中遇到的问题！',
        
        // 系统消息
        'system-init': '系统正在初始化，检查配置状态...',
        'ai-thinking': 'AI助理正在思考...',
        'loading': '正在加载...',
        
        // 输入区域
        'input-placeholder': '请描述您的OneNote问题...',
        'upload-image-title': '上传图片/粘贴截图',
        'send-message-title': '发送消息',
        'remove-image-title': '移除图片',
        'image-ready': '图片已准备就绪，描述问题后发送',
        
        // 快速帮助和建议
        'quick-help': '快速帮助',
        'help-sync': '同步问题',
        'help-performance': '性能优化',
        'help-search': '搜索功能',
        'help-print': '打印设置',
        'help-account': '账户权限',
        'help-mobile': '移动端问题',
        'help-handwriting': '手写绘图',
        'help-backup': '数据恢复',
        'knowledge-base': '知识库',
        
        // 建议文本
        'suggestion-sync': '同步问题',
        'suggestion-loading': '加载问题',
        'suggestion-search': '搜索问题',
        'suggestion-print': '打印问题',
        'suggestion-performance': '性能问题',
        'suggestion-account': '账户问题',
        'suggestion-mobile': '移动端问题',
        'suggestion-handwriting': '手写问题',
        'suggestion-backup': '数据恢复',
        
        // 建议问题文本
        'suggestion-sync-text': 'OneNote同步很慢怎么办？',
        'suggestion-loading-text': 'OneNote页面加载不出来',
        'suggestion-search-text': 'OneNote搜索功能不好用',
        'suggestion-print-text': 'OneNote打印格式乱了',
        'suggestion-performance-text': 'OneNote运行很卡',
        
        // 快速帮助问题文本
        'help-sync-text': '我的OneNote同步有问题，文件在不同设备上不一致',
        'help-performance-text': 'OneNote运行很慢，经常卡住，如何优化性能？',
        'help-search-text': 'OneNote搜索功能找不到我的笔记内容',
        'help-print-text': 'OneNote打印时格式乱了，如何设置正确的打印格式？',
        'help-account-text': 'OneNote账户权限有问题，无法访问某些笔记本',
        'help-mobile-text': '手机上的OneNote出现问题，与电脑不同步',
        'help-handwriting-text': 'OneNote手写和绘图功能不好用，笔迹识别有问题',
        'help-backup-text': '我的OneNote数据丢失了，如何恢复备份？'
    },
    en: {
        // 页面标题和基本信息
        'title': 'OneNote AI Assistant',
        'subtitle': 'Professional OneNote Problem Solving',
        'status-online': 'Online',
        'checking-status': 'Checking status...',
        'expert-title': 'OneNote Expert',
        'expert-desc': 'I\'m your dedicated OneNote technical support assistant, ready to help solve any issues you encounter!',
        
        // 系统消息
        'system-init': 'System initializing, checking configuration status...',
        'ai-thinking': 'AI assistant is thinking...',
        'loading': 'Loading...',
        
        // 输入区域
        'input-placeholder': 'Please describe your OneNote problem...',
        'upload-image-title': 'Upload image/paste screenshot',
        'send-message-title': 'Send message',
        'remove-image-title': 'Remove image',
        'image-ready': 'Image ready, describe the problem and send',
        
        // 快速帮助和建议
        'quick-help': 'Quick Help',
        'help-sync': 'Sync Issues',
        'help-performance': 'Performance',
        'help-search': 'Search Function',
        'help-print': 'Print Settings',
        'help-account': 'Account Permissions',
        'help-mobile': 'Mobile Issues',
        'help-handwriting': 'Handwriting',
        'help-backup': 'Data Recovery',
        'knowledge-base': 'Knowledge Base',
        
        // 建议文本
        'suggestion-sync': 'Sync Issues',
        'suggestion-loading': 'Loading Issues',
        'suggestion-search': 'Search Issues',
        'suggestion-print': 'Print Issues',
        'suggestion-performance': 'Performance Issues',
        'suggestion-account': 'Account Issues',
        'suggestion-mobile': 'Mobile Issues',
        'suggestion-handwriting': 'Handwriting Issues',
        'suggestion-backup': 'Data Recovery',
        
        // 建议问题文本
        'suggestion-sync-text': 'OneNote sync is very slow, what should I do?',
        'suggestion-loading-text': 'OneNote pages won\'t load',
        'suggestion-search-text': 'OneNote search function doesn\'t work well',
        'suggestion-print-text': 'OneNote print format is messed up',
        'suggestion-performance-text': 'OneNote runs very slowly',
        
        // 快速帮助问题文本
        'help-sync-text': 'My OneNote sync has issues, files are inconsistent across different devices',
        'help-performance-text': 'OneNote runs very slowly and often freezes, how to optimize performance?',
        'help-search-text': 'OneNote search function cannot find my note content',
        'help-print-text': 'OneNote print format is messed up, how to set correct print format?',
        'help-account-text': 'OneNote account permissions have issues, cannot access certain notebooks',
        'help-mobile-text': 'OneNote on mobile has problems, not syncing with computer',
        'help-handwriting-text': 'OneNote handwriting and drawing functions don\'t work well, handwriting recognition has issues',
        'help-backup-text': 'My OneNote data is lost, how to recover backup?'
    }
};

// 当前语言
let currentLanguage = localStorage.getItem('language') || 'zh';

// 切换语言
function switchLanguage() {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    localStorage.setItem('language', currentLanguage);
    updateUI();
    updateLanguageButton();
    
    // 重新加载知识库
    if (typeof loadKnowledgeBase === 'function') {
        loadKnowledgeBase();
    }
    
    // 重新检查系统状态以更新消息
    if (typeof checkSystemStatus === 'function') {
        checkSystemStatus();
    }
    
    // 重新显示欢迎消息
    if (typeof updateWelcomeMessage === 'function') {
        updateWelcomeMessage();
    }
}

// 获取翻译文本
function t(key) {
    return translations[currentLanguage][key] || key;
}

// 更新界面文本
function updateUI() {
    // 更新所有带有 data-i18n 属性的元素
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // 更新 placeholder 属性
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // 更新 title 属性
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });
    
    // 更新页面标题
    document.title = t('title');
    
    // 更新 HTML lang 属性
    document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
    
    // 更新建议文本
    updateSuggestions();
}

// 更新建议文本和数据
function updateSuggestions() {
    const suggestions = document.querySelectorAll('.suggestion');
    const suggestionData = {
        'suggestion-sync': 'suggestion-sync-text',
        'suggestion-loading': 'suggestion-loading-text',
        'suggestion-search': 'suggestion-search-text',
        'suggestion-print': 'suggestion-print-text',
        'suggestion-performance': 'suggestion-performance-text'
    };
    
    suggestions.forEach(suggestion => {
        const key = suggestion.getAttribute('data-i18n');
        if (suggestionData[key]) {
            suggestion.setAttribute('data-text', t(suggestionData[key]));
        }
    });
}

// 更新语言切换按钮
function updateLanguageButton() {
    const languageText = document.getElementById('languageText');
    if (languageText) {
        languageText.textContent = currentLanguage === 'zh' ? 'EN' : '中文';
    }
}

// 获取当前语言代码
function getCurrentLanguage() {
    return currentLanguage;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    updateUI();
    updateLanguageButton();
    
    // 绑定语言切换按钮事件
    const languageToggle = document.getElementById('languageToggle');
    if (languageToggle) {
        languageToggle.addEventListener('click', switchLanguage);
    }
    
    // 确保在页面加载时使用正确的语言重新加载知识库
    setTimeout(() => {
        if (typeof loadKnowledgeBase === 'function') {
            loadKnowledgeBase();
        }
    }, 100);
});

// 导出函数供外部使用
window.i18n = {
    t,
    switchLanguage,
    getCurrentLanguage,
    updateUI
};
