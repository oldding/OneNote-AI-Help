const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// 检查API密钥配置
const hasDeepSeek = process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'sk-your-deepseek-api-key-here';
const hasDashScope = process.env.DASHSCOPE_API_KEY && process.env.DASHSCOPE_API_KEY !== 'your-dashscope-api-key-here';
const aiProvider = process.env.AI_PROVIDER || 'deepseek';

if (!hasDeepSeek && !hasDashScope) {
  console.log('\n⚠️  警告：未检测到有效的API密钥');
  console.log('📝 请配置以下任一API服务：');
  console.log('� DeepSeek API: https://www.deepseek.com/');
  console.log('   配置格式：DEEPSEEK_API_KEY=sk-your-actual-key-here');
  console.log('🔸 阿里云百炼平台: https://dashscope.console.aliyun.com/');
  console.log('   配置格式：DASHSCOPE_API_KEY=sk-your-actual-key-here');
  console.log('🎯 推荐使用阿里云百炼（支持图片识别）\n');
} else {
  if (hasDashScope) {
    console.log('✅ 阿里云百炼平台已配置 - 支持图片理解');
  }
  if (hasDeepSeek) {
    console.log('✅ DeepSeek API已配置');
  }
  console.log(`🤖 当前使用: ${aiProvider} 提供商\n`);
}

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// OneNote故障解决知识库 - 中文版
const onenoteKnowledge = {
  "同步问题": {
    "symptoms": ["文件不同步", "内容丢失", "同步慢", "显示离线", "同步冲突", "版本不一致"],
    "solutions": [
      "检查网络连接是否稳定，确保能访问OneDrive服务",
      "确认Microsoft账户登录状态，重新登录账户",
      "手动触发同步：文件 > 信息 > 查看同步状态 > 立即同步",
      "重启OneNote应用程序，清除临时缓存",
      "检查OneDrive存储空间是否充足",
      "在OneDrive网页版检查文件是否存在",
      "关闭防火墙或杀毒软件的阻止设置",
      "使用OneNote修复工具：控制面板 > 程序 > 修改Office",
      "清理OneNote缓存文件夹：%localappdata%\\Microsoft\\OneNote"
    ],
    "commonCauses": ["网络连接问题", "账户权限问题", "OneDrive存储空间不足", "防火墙阻止", "缓存损坏"]
  },
  
  "页面加载问题": {
    "symptoms": ["页面空白", "加载缓慢", "内容显示不全", "页面无响应", "图片不显示", "视频无法播放"],
    "solutions": [
      "清除OneNote缓存：文件 > 选项 > 保存和备份 > 清除缓存",
      "检查网络连接速度和稳定性",
      "重新登录Microsoft账户",
      "更新OneNote到最新版本",
      "关闭硬件加速：文件 > 选项 > 高级 > 显示",
      "重置OneNote设置：注册表清理或重新安装",
      "检查系统内存使用情况，关闭不必要的程序",
      "暂时关闭实时保护软件",
      "使用兼容模式运行OneNote"
    ],
    "commonCauses": ["缓存文件损坏", "网络速度慢", "系统资源不足", "软件版本过旧", "兼容性问题"]
  },
  
  "搜索功能问题": {
    "symptoms": ["搜索无结果", "搜索慢", "搜索不准确", "搜索崩溃", "索引不完整", "特殊字符搜索失败"],
    "solutions": [
      "重建搜索索引：文件 > 选项 > 搜索 > 重新索引所有文件",
      "检查搜索范围设置，确保包含所有笔记本",
      "确保文件已完全同步到本地",
      "重启OneNote应用程序",
      "使用Windows搜索服务重建索引",
      "检查搜索关键词拼写和语法",
      "尝试使用不同的搜索词组合",
      "清除搜索历史并重新搜索",
      "在OneDrive网页版中进行搜索对比"
    ],
    "commonCauses": ["搜索索引损坏", "同步不完整", "搜索服务异常", "关键词错误", "文件权限问题"]
  },
  
  "打印问题": {
    "symptoms": ["打印排版错乱", "无法打印", "打印内容不完整", "页面缩放错误", "颜色失真", "字体变形"],
    "solutions": [
      "使用'导出为PDF'功能后再打印",
      "调整页面设置和边距：文件 > 打印 > 页面设置",
      "检查打印机驱动程序是否最新",
      "尝试打印预览功能检查效果",
      "选择合适的纸张大小和方向",
      "调整打印质量和颜色设置",
      "使用系统默认打印机测试",
      "清除打印队列并重新打印",
      "将笔记复制到Word后打印"
    ],
    "commonCauses": ["打印机驱动问题", "页面设置不当", "内容格式复杂", "打印机兼容性", "系统打印服务异常"]
  },
  
  "性能问题": {
    "symptoms": ["运行缓慢", "卡顿", "崩溃", "内存占用高", "响应迟缓", "启动慢"],
    "solutions": [
      "关闭不必要的笔记本，减少同时打开的页面数量",
      "清理临时文件和缓存：磁盘清理工具",
      "检查系统资源使用情况，关闭其他大型程序",
      "禁用不必要的加载项和插件",
      "重启计算机释放系统资源",
      "增加虚拟内存或物理内存",
      "关闭视觉效果和动画",
      "使用OneNote在线版本减轻本地负担",
      "定期维护和优化系统"
    ],
    "commonCauses": ["系统资源不足", "同时打开文件过多", "缓存文件积累", "硬件配置低", "系统优化不足"]
  },
  
  "账户和权限问题": {
    "symptoms": ["无法登录", "权限不足", "无法编辑", "共享失败", "账户冲突", "授权过期"],
    "solutions": [
      "检查Microsoft账户密码和两步验证",
      "确认账户类型：个人版 vs 企业版",
      "检查网络防火墙设置",
      "清除保存的凭据并重新登录",
      "联系管理员检查企业账户权限",
      "验证OneDrive访问权限",
      "检查订阅状态和服务可用性",
      "使用不同网络环境测试登录",
      "重置账户密码"
    ],
    "commonCauses": ["密码错误", "账户被锁定", "权限设置问题", "网络限制", "服务中断"]
  },
  
  "文件和笔记本管理": {
    "symptoms": ["笔记本丢失", "无法创建页面", "删除恢复", "移动失败", "重命名错误", "分区混乱"],
    "solutions": [
      "检查OneDrive回收站中的已删除文件",
      "使用版本历史记录恢复内容",
      "确认笔记本的存储位置和路径",
      "重新添加丢失的笔记本：文件 > 打开 > 浏览",
      "使用导出功能备份重要笔记",
      "整理笔记本结构和分区",
      "检查文件权限和共享设置",
      "使用OneNote修复工具扫描和修复",
      "手动合并冲突的笔记本版本"
    ],
    "commonCauses": ["意外删除", "同步冲突", "权限问题", "存储位置变更", "操作错误"]
  },
  
  "格式和排版问题": {
    "symptoms": ["格式丢失", "字体变化", "图片变形", "表格错乱", "链接失效", "样式不统一"],
    "solutions": [
      "使用格式刷工具统一样式",
      "检查和重设默认字体设置",
      "重新插入图片并调整大小",
      "使用表格工具重新排列内容",
      "更新或重新创建超链接",
      "清除格式后重新应用样式",
      "使用样板页面保持一致性",
      "避免从其他程序直接复制粘贴",
      "使用OneNote内置的格式工具"
    ],
    "commonCauses": ["跨平台同步问题", "版本兼容性", "复制粘贴格式冲突", "字体缺失", "图片链接失效"]
  },
  
  "手写和绘图功能": {
    "symptoms": ["手写识别错误", "绘图工具异常", "触控笔失效", "墨迹丢失", "转换文字失败", "压感不灵敏"],
    "solutions": [
      "校准触控笔和屏幕设置",
      "更新触控笔驱动程序",
      "检查Windows Ink工作区设置",
      "调整手写识别语言设置",
      "重新训练手写识别功能",
      "检查电池电量和笔的连接状态",
      "使用不同的绘图工具测试",
      "重启设备并重新配对触控笔",
      "清除手写缓存和重新设置"
    ],
    "commonCauses": ["设备驱动问题", "校准不准确", "电池电量低", "系统设置错误", "硬件兼容性"]
  },
  
  "移动端同步问题": {
    "symptoms": ["手机版不同步", "平板内容缺失", "跨设备显示不一致", "离线内容丢失", "移动端崩溃", "触控操作异常"],
    "solutions": [
      "检查移动设备的网络连接",
      "强制关闭并重启OneNote应用",
      "确认使用相同的Microsoft账户登录",
      "清除移动端应用缓存和数据",
      "更新OneNote移动应用到最新版本",
      "检查设备存储空间是否充足",
      "在设置中启用后台应用刷新",
      "重新安装OneNote移动应用",
      "检查移动数据和WiFi设置"
    ],
    "commonCauses": ["网络连接问题", "应用版本过旧", "存储空间不足", "后台刷新关闭", "账户同步异常"]
  },
  
  "插件和集成问题": {
    "symptoms": ["Outlook集成失败", "Teams共享异常", "第三方插件冲突", "API调用错误", "自动化脚本失效", "扩展功能异常"],
    "solutions": [
      "检查Office套件的完整性和版本一致性",
      "禁用冲突的第三方插件和加载项",
      "重新配置Outlook和OneNote的集成设置",
      "更新所有相关的Microsoft应用程序",
      "检查企业策略对插件的限制",
      "使用安全模式启动OneNote测试功能",
      "重新注册OneNote的COM组件",
      "清除注册表中的冲突项",
      "联系插件开发者获取兼容性更新"
    ],
    "commonCauses": ["版本不兼容", "插件冲突", "企业策略限制", "API权限问题", "组件注册错误"]
  },
  
  "数据恢复和备份": {
    "symptoms": ["内容意外删除", "版本回退需求", "笔记本损坏", "历史记录丢失", "备份失败", "迁移数据困难"],
    "solutions": [
      "使用OneNote版本历史记录功能恢复内容",
      "检查OneDrive回收站中的删除文件",
      "导出笔记本为.onepkg格式进行备份",
      "使用文件历史记录功能恢复本地文件",
      "通过OneDrive网页版查看文件版本",
      "使用第三方备份工具定期备份",
      "设置自动备份计划和策略",
      "创建重要笔记的多份副本",
      "使用OneNote批量导出工具"
    ],
    "commonCauses": ["误操作删除", "同步冲突", "硬件故障", "软件错误", "缺乏备份策略"]
  }
};

// OneNote故障解决知识库 - 英文版
const onenoteKnowledgeEN = {
  "Sync Issues": {
    "symptoms": ["files not syncing", "content lost", "slow sync", "shows offline", "sync conflicts", "version inconsistency"],
    "solutions": [
      "Check network connection stability and ensure OneDrive service access",
      "Confirm Microsoft account login status and re-login if needed",
      "Manually trigger sync: File > Info > View Sync Status > Sync Now",
      "Restart OneNote application and clear temporary cache",
      "Check OneDrive storage space availability",
      "Verify files exist in OneDrive web version",
      "Disable firewall or antivirus blocking settings",
      "Use OneNote repair tool: Control Panel > Programs > Modify Office",
      "Clear OneNote cache folder: %localappdata%\\Microsoft\\OneNote"
    ],
    "commonCauses": ["Network connection issues", "Account permission problems", "OneDrive storage full", "Firewall blocking", "Cache corruption"]
  },

  "Page Loading Issues": {
    "symptoms": ["blank pages", "slow loading", "incomplete content display", "page unresponsive", "images not showing", "videos won't play"],
    "solutions": [
      "Clear OneNote cache: File > Options > Save & Backup > Clear Cache",
      "Check network connection speed and stability",
      "Re-login to Microsoft account",
      "Update OneNote to latest version",
      "Disable hardware acceleration: File > Options > Advanced > Display",
      "Reset OneNote settings: Registry cleanup or reinstall",
      "Check system memory usage, close unnecessary programs",
      "Temporarily disable real-time protection software",
      "Run OneNote in compatibility mode"
    ],
    "commonCauses": ["Cache file corruption", "Slow network", "Insufficient system resources", "Outdated software version", "Compatibility issues"]
  },

  "Search Function Issues": {
    "symptoms": ["no search results", "slow search", "inaccurate search", "search crashes", "incomplete indexing", "special characters search failure"],
    "solutions": [
      "Rebuild search index: File > Options > Search > Reindex All Files",
      "Check search scope settings to include all notebooks",
      "Ensure files are fully synced locally",
      "Restart OneNote application",
      "Use Windows Search Service to rebuild index",
      "Check search keyword spelling and grammar",
      "Try different search term combinations",
      "Clear search history and search again",
      "Compare search in OneDrive web version"
    ],
    "commonCauses": ["Search index corruption", "Incomplete sync", "Search service errors", "Keyword errors", "File permission issues"]
  },

  "Printing Issues": {
    "symptoms": ["print layout corrupted", "cannot print", "incomplete print content", "page scaling errors", "color distortion", "font deformation"],
    "solutions": [
      "Use 'Export as PDF' function then print",
      "Adjust page settings and margins: File > Print > Page Setup",
      "Check printer driver updates",
      "Try print preview function to check results",
      "Select appropriate paper size and orientation",
      "Adjust print quality and color settings",
      "Test with system default printer",
      "Clear print queue and reprint",
      "Copy notes to Word then print"
    ],
    "commonCauses": ["Printer driver issues", "Improper page settings", "Complex content format", "Printer compatibility", "System print service errors"]
  },

  "Performance Issues": {
    "symptoms": ["running slowly", "lagging", "crashes", "high memory usage", "slow response", "slow startup"],
    "solutions": [
      "Close unnecessary notebooks, reduce simultaneously open pages",
      "Clean temporary files and cache using disk cleanup tools",
      "Check system resource usage, close other large programs",
      "Disable unnecessary add-ins and plugins",
      "Restart computer to free system resources",
      "Increase virtual memory or physical memory",
      "Disable visual effects and animations",
      "Use OneNote online version to reduce local burden",
      "Regular system maintenance and optimization"
    ],
    "commonCauses": ["Insufficient system resources", "Too many open files", "Cache file accumulation", "Low hardware specs", "Poor system optimization"]
  },

  "Account and Permission Issues": {
    "symptoms": ["cannot login", "insufficient permissions", "cannot edit", "sharing failed", "account conflicts", "authorization expired"],
    "solutions": [
      "Check Microsoft account password and two-factor authentication",
      "Confirm account type: Personal vs Enterprise edition",
      "Check network firewall settings",
      "Clear saved credentials and re-login",
      "Contact administrator to check enterprise account permissions",
      "Verify OneDrive access permissions",
      "Check subscription status and service availability",
      "Test login in different network environments",
      "Reset account password"
    ],
    "commonCauses": ["Wrong password", "Account locked", "Permission setting issues", "Network restrictions", "Service interruption"]
  },

  "File and Notebook Management": {
    "symptoms": ["notebook lost", "cannot create pages", "deletion recovery", "move failed", "rename errors", "section confusion"],
    "solutions": [
      "Check OneDrive recycle bin for deleted files",
      "Use version history to recover content",
      "Confirm notebook storage location and path",
      "Re-add lost notebooks: File > Open > Browse",
      "Use export function to backup important notes",
      "Organize notebook structure and sections",
      "Check file permissions and sharing settings",
      "Use OneNote repair tool to scan and fix",
      "Manually merge conflicting notebook versions"
    ],
    "commonCauses": ["Accidental deletion", "Sync conflicts", "Permission issues", "Storage location changes", "Operation errors"]
  },

  "Format and Layout Issues": {
    "symptoms": ["format lost", "font changes", "image deformation", "table disorder", "links broken", "inconsistent styles"],
    "solutions": [
      "Use format painter tool to unify styles",
      "Check and reset default font settings",
      "Re-insert images and adjust size",
      "Use table tools to rearrange content",
      "Update or recreate hyperlinks",
      "Clear format then reapply styles",
      "Use template pages for consistency",
      "Avoid direct copy-paste from other programs",
      "Use OneNote built-in formatting tools"
    ],
    "commonCauses": ["Cross-platform sync issues", "Version compatibility", "Copy-paste format conflicts", "Missing fonts", "Broken image links"]
  },

  "Handwriting and Drawing Features": {
    "symptoms": ["handwriting recognition errors", "drawing tool abnormal", "stylus malfunction", "ink loss", "text conversion failed", "pressure insensitive"],
    "solutions": [
      "Calibrate stylus and screen settings",
      "Update stylus drivers",
      "Check Windows Ink Workspace settings",
      "Adjust handwriting recognition language settings",
      "Retrain handwriting recognition function",
      "Check battery level and stylus connection status",
      "Test with different drawing tools",
      "Restart device and re-pair stylus",
      "Clear handwriting cache and reset"
    ],
    "commonCauses": ["Device driver issues", "Inaccurate calibration", "Low battery", "System setting errors", "Hardware compatibility"]
  },

  "Mobile Sync Issues": {
    "symptoms": ["mobile version not syncing", "tablet content missing", "inconsistent cross-device display", "offline content lost", "mobile crashes", "touch operation abnormal"],
    "solutions": [
      "Check mobile device network connection",
      "Force close and restart OneNote app",
      "Confirm using same Microsoft account login",
      "Clear mobile app cache and data",
      "Update OneNote mobile app to latest version",
      "Check device storage space availability",
      "Enable background app refresh in settings",
      "Reinstall OneNote mobile app",
      "Check mobile data and WiFi settings"
    ],
    "commonCauses": ["Network connection issues", "Outdated app version", "Insufficient storage", "Background refresh disabled", "Account sync errors"]
  },

  "Plugin and Integration Issues": {
    "symptoms": ["Outlook integration failed", "Teams sharing abnormal", "third-party plugin conflicts", "API call errors", "automation scripts failed", "extension function abnormal"],
    "solutions": [
      "Check Office suite integrity and version consistency",
      "Disable conflicting third-party plugins and add-ins",
      "Reconfigure Outlook and OneNote integration settings",
      "Update all related Microsoft applications",
      "Check enterprise policies for plugin restrictions",
      "Use safe mode to start OneNote for testing",
      "Re-register OneNote COM components",
      "Clear conflicting registry entries",
      "Contact plugin developers for compatibility updates"
    ],
    "commonCauses": ["Version incompatibility", "Plugin conflicts", "Enterprise policy restrictions", "API permission issues", "Component registration errors"]
  },

  "Data Recovery and Backup": {
    "symptoms": ["content accidentally deleted", "version rollback needed", "notebook corrupted", "history lost", "backup failed", "data migration difficult"],
    "solutions": [
      "Use OneNote version history feature to recover content",
      "Check OneDrive recycle bin for deleted files",
      "Export notebooks as .onepkg format for backup",
      "Use file history feature to recover local files",
      "View file versions through OneDrive web version",
      "Use third-party backup tools for regular backups",
      "Set up automatic backup plans and policies",
      "Create multiple copies of important notes",
      "Use OneNote batch export tools"
    ],
    "commonCauses": ["Accidental deletion", "Sync conflicts", "Hardware failure", "Software errors", "Lack of backup strategy"]
  }
};

// DeepSeek API调用函数
async function callDeepSeekAPI(userMessage, searchResults = null, language = 'zh') {
  try {
    // 选择知识库和系统提示词
    const knowledge = language === 'en' ? onenoteKnowledgeEN : onenoteKnowledge;
    const isEnglish = language === 'en';
    
    // 构建系统提示词
    let systemPrompt = isEnglish 
      ? `You are a professional OneNote technical support assistant. Your task is to help users solve various Microsoft OneNote problems and issues. Please respond in a friendly and professional tone.

OneNote Common Issues Solutions:
${JSON.stringify(knowledge, null, 2)}

Please provide specific steps and suggestions based on the user's questions.`
      : `你是一个专业的OneNote技术支持助理。你的任务是帮助用户解决Microsoft OneNote的各种问题和故障。请用友善、专业的语气回答用户的问题。

OneNote常见问题解决方案：
${JSON.stringify(knowledge, null, 2)}

请根据用户的问题，提供具体的解决步骤和建议。`;

    // 如果有搜索结果，添加到提示词中
    if (searchResults) {
      const searchLabel = isEnglish ? 'Latest relevant information:' : '最新相关信息：';
      systemPrompt += `\n\n${searchLabel}\n${searchResults}`;
    }

    const notes = isEnglish 
      ? `\n\nPlease note:
1. Provide different responses each time to avoid repetition
2. Offer targeted solutions based on specific issues
3. Break down complex problems into step-by-step instructions
4. Suggest users try different solution methods`
      : `\n\n请注意：
1. 每次回答都要有所不同，避免重复相同的内容
2. 根据具体问题提供针对性的解决方案
3. 如果是复杂问题，请分步骤详细说明
4. 可以建议用户尝试不同的解决方法`;

    systemPrompt += notes;

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage
        }
      ],
      temperature: 0.8, // 增加随机性，让回答更多样化
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API调用错误:', error.response?.data || error.message);
    
    // 如果API调用失败，返回基于知识库的回答
    return getLocalResponse(userMessage);
  }
}

// 图片格式验证和处理函数
function validateAndProcessImage(imageBase64) {
  try {
    if (!imageBase64) {
      return null;
    }

    let imageData = imageBase64;
    let mimeType = 'image/jpeg'; // 默认类型

    // 如果是完整的data URL，提取信息
    if (imageBase64.startsWith('data:')) {
      const dataUrlMatch = imageBase64.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (dataUrlMatch) {
        mimeType = dataUrlMatch[1];
        imageData = dataUrlMatch[2];
      } else {
        throw new Error('Invalid data URL format');
      }
    }

    // 验证base64格式
    try {
      // 简单的base64验证
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(imageData)) {
        throw new Error('Invalid base64 format');
      }
      
      // 检查图片大小（避免过大的图片）
      const sizeInBytes = (imageData.length * 3) / 4;
      const maxSizeInMB = 5; // 5MB限制
      if (sizeInBytes > maxSizeInMB * 1024 * 1024) {
        throw new Error(`Image too large: ${(sizeInBytes / 1024 / 1024).toFixed(2)}MB (max: ${maxSizeInMB}MB)`);
      }

      console.log(`图片验证成功: ${mimeType}, 大小: ${(sizeInBytes / 1024).toFixed(2)}KB`);
      return { data: imageData, mimeType, size: sizeInBytes };
    } catch (e) {
      throw new Error(`Base64 validation failed: ${e.message}`);
    }
  } catch (error) {
    console.error('图片验证失败:', error.message);
    return null;
  }
}

// 阿里云百炼平台API调用函数
async function callDashScopeAPI(userMessage, searchResults = null, imageBase64 = null, language = 'zh') {
  try {
    // 验证和处理图片
    let processedImage = null;
    if (imageBase64) {
      processedImage = validateAndProcessImage(imageBase64);
      if (!processedImage) {
        console.log('图片验证失败，降级为文本模式');
        imageBase64 = null; // 降级为文本模式
      }
    }

    // 选择知识库和系统提示词
    const knowledge = language === 'en' ? onenoteKnowledgeEN : onenoteKnowledge;
    const isEnglish = language === 'en';

    // 构建系统提示词
    let systemPrompt = isEnglish 
      ? `You are a professional OneNote technical support assistant. Your task is to help users solve various Microsoft OneNote problems and issues. Please respond in a friendly and professional tone.

OneNote Common Issues Solutions:
${JSON.stringify(knowledge, null, 2)}

Please provide specific steps and suggestions based on the user's questions.`
      : `你是一个专业的OneNote技术支持助理。你的任务是帮助用户解决Microsoft OneNote的各种问题和故障。请用友善、专业的语气回答用户的问题。

OneNote常见问题解决方案：
${JSON.stringify(knowledge, null, 2)}

请根据用户的问题，提供具体的解决步骤和建议。`;

    // 如果有搜索结果，添加到提示词中
    if (searchResults) {
      const searchSection = isEnglish 
        ? `\n\nLatest Relevant Information:\n${searchResults}`
        : `\n\n最新相关信息：\n${searchResults}`;
      systemPrompt += searchSection;
    }

    const additionalNotes = isEnglish 
      ? `\n\nPlease note:
1. Provide different responses each time, avoid repeating the same content
2. Offer targeted solutions based on specific problems
3. For complex issues, provide detailed step-by-step instructions
4. Suggest users try different solution methods
5. If the user provides an image, carefully analyze the image content and provide targeted advice`
      : `\n\n请注意：
1. 每次回答都要有所不同，避免重复相同的内容
2. 根据具体问题提供针对性的解决方案
3. 如果是复杂问题，请分步骤详细说明
4. 可以建议用户尝试不同的解决方法
5. 如果用户提供了图片，请仔细分析图片内容并提供针对性建议`;

    systemPrompt += additionalNotes;

    // 构建消息内容
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // 根据是否有图片构建不同的用户消息格式
    if (processedImage) {
      // 阿里云qwen-vl-plus模型的正确格式
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: userMessage
          },
          {
            type: 'image',
            image: `data:${processedImage.mimeType};base64,${processedImage.data}`
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: userMessage
      });
    }

    // 选择合适的模型
    const model = processedImage ? 'qwen-vl-plus' : 'qwen-plus';

    const requestData = {
      model: model,
      input: {
        messages: messages
      },
      parameters: {
        temperature: 0.8,
        max_tokens: 2000,
        top_p: 0.8
      }
    };

    console.log(`发送到阿里云百炼API - 模型: ${model}, 图片: ${processedImage ? '是' : '否'}`);
    
    // 调试：输出请求数据结构（不包含完整的base64数据）
    if (processedImage) {
      console.log('图片消息格式:', JSON.stringify({
        model: model,
        input: {
          messages: [
            {
              role: 'system',
              content: '[系统提示词]'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: userMessage
                },
                {
                  type: 'image',
                  image: `data:${processedImage.mimeType};base64,[base64数据...]`
                }
              ]
            }
          ]
        }
      }, null, 2));
    }

    // 根据模型选择合适的API端点
    const apiUrl = processedImage 
      ? 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation'
      : 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30秒超时
    });

    console.log('阿里云百炼API响应状态:', response.status);
    if (processedImage) {
      console.log('图片分析响应:', JSON.stringify(response.data, null, 2));
    }

    if (response.data.output && response.data.output.text) {
      return response.data.output.text;
    } else if (response.data.output && response.data.output.choices && response.data.output.choices.length > 0) {
      const choice = response.data.output.choices[0];
      const content = choice.message.content;
      
      // 处理多模态响应（可能是数组格式）
      if (Array.isArray(content)) {
        // 提取文本内容
        const textContent = content.find(item => item.text);
        return textContent ? textContent.text : content[0]?.text || '无法解析图片内容';
      } else if (typeof content === 'string') {
        return content;
      } else {
        console.error('未知的content格式:', content);
        return '图片分析完成，但内容格式异常';
      }
    } else {
      console.error('API响应格式:', response.data);
      throw new Error('API返回格式不正确');
    }
  } catch (error) {
    // 详细的错误处理
    if (error.response?.data) {
      console.error('阿里云百炼API错误响应:', JSON.stringify(error.response.data, null, 2));
      
      // 特定错误类型的处理
      if (error.response.data.code === 'InvalidParameter' && imageBase64) {
        console.error('图片格式或参数错误，降级为文本模式');
        // 重试，但不使用图片
        return await callDashScopeAPI(userMessage, searchResults, null);
      }
    } else {
      console.error('阿里云百炼API调用错误:', error.message);
    }
    
    // 如果API调用失败，返回基于知识库的回答
    return getLocalResponse(userMessage);
  }
}

// 统一AI调用接口
async function callAI(userMessage, searchResults = null, imageBase64 = null, language = 'zh') {
  const provider = process.env.AI_PROVIDER || 'deepseek';
  
  // 如果有图片且配置了阿里云百炼，优先使用阿里云（支持视觉理解）
  if (imageBase64 && hasDashScope) {
    console.log('使用阿里云百炼平台（图片理解）');
    return await callDashScopeAPI(userMessage, searchResults, imageBase64, language);
  }
  
  // 根据配置选择API
  if (provider === 'dashscope' && hasDashScope) {
    console.log('使用阿里云百炼平台');
    return await callDashScopeAPI(userMessage, searchResults, imageBase64, language);
  } else if (provider === 'deepseek' && hasDeepSeek) {
    console.log('使用DeepSeek API');
    return await callDeepSeekAPI(userMessage, searchResults, language);
  } else if (hasDashScope) {
    console.log('使用阿里云百炼平台（备用）');
    return await callDashScopeAPI(userMessage, searchResults, imageBase64, language);
  } else if (hasDeepSeek) {
    console.log('使用DeepSeek API（备用）');
    return await callDeepSeekAPI(userMessage, searchResults, language);
  } else {
    console.log('无有效API配置，使用本地知识库');
    return getLocalResponse(userMessage, language);
  }
}

// 在线搜索OneNote相关信息
async function searchOnlineInfo(query) {
  try {
    // 使用DuckDuckGo的即时答案API（免费且无需密钥）
    const searchQuery = `OneNote ${query} 解决方案 微软官方`;
    const response = await axios.get(`https://api.duckduckgo.com/`, {
      params: {
        q: searchQuery,
        format: 'json',
        no_html: '1',
        skip_disambig: '1'
      },
      timeout: 5000
    });

    if (response.data && response.data.AbstractText) {
      return response.data.AbstractText;
    }
    
    return null;
  } catch (error) {
    console.log('在线搜索失败，使用本地知识库:', error.message);
    return null;
  }
}

// 图片分析函数
function analyzeImage(imageBase64, userMessage) {
  try {
    // 从base64中提取文件类型
    const imageData = imageBase64.split(',')[1] || imageBase64;
    const imagePrefix = imageBase64.split(',')[0] || 'data:image/png;base64';
    
    // 基于用户消息和图片进行简单分析
    let analysis = '';
    
    // 根据用户问题类型进行分析
    const messageLC = userMessage.toLowerCase();
    
    if (messageLC.includes('同步') || messageLC.includes('sync')) {
      analysis = '从图片看，这可能是OneNote同步相关问题。请检查网络连接状态、账户登录状态，以及是否显示了同步错误图标。';
    } else if (messageLC.includes('打印') || messageLC.includes('print') || messageLC.includes('格式')) {
      analysis = '从图片看，这可能是OneNote打印或格式问题。请检查页面布局设置、打印机选项，以及内容是否超出页面边界。';
    } else if (messageLC.includes('界面') || messageLC.includes('显示') || messageLC.includes('ui')) {
      analysis = '从图片看，这可能是OneNote界面显示问题。请检查缩放比例、主题设置，以及是否存在控件错位。';
    } else if (messageLC.includes('错误') || messageLC.includes('error') || messageLC.includes('崩溃')) {
      analysis = '从图片看，这可能是OneNote错误或崩溃问题。请检查错误代码、系统版本兼容性，以及是否需要重新安装应用。';
    } else if (messageLC.includes('加载') || messageLC.includes('卡') || messageLC.includes('慢')) {
      analysis = '从图片看，这可能是OneNote性能问题。请检查内存使用情况、网络连接速度，以及是否有大量笔记内容。';
    } else if (messageLC.includes('搜索') || messageLC.includes('search') || messageLC.includes('找不到')) {
      analysis = '从图片看，这可能是OneNote搜索功能问题。请检查搜索索引状态、关键词拼写，以及搜索范围设置。';
    } else if (messageLC.includes('手写') || messageLC.includes('绘图') || messageLC.includes('触控笔')) {
      analysis = '从图片看，这可能是OneNote手写或绘图问题。请检查触控笔设置、笔迹识别功能，以及压感灵敏度配置。';
    } else if (messageLC.includes('账户') || messageLC.includes('登录') || messageLC.includes('权限')) {
      analysis = '从图片看，这可能是OneNote账户或权限问题。请检查登录状态、账户权限设置，以及网络连接是否正常。';
    } else {
      analysis = '我看到您提供了一张图片。请详细描述您遇到的具体问题，这样我可以为您提供更准确的解决方案。';
    }
    
    return analysis;
  } catch (error) {
    console.error('图片分析失败:', error);
    return '图片分析过程中出现问题，但我仍然可以根据您的文字描述为您提供帮助。';
  }
}

// 本地知识库回答
function getLocalResponse(userMessage, language = 'zh') {
  const message = userMessage.toLowerCase();
  const knowledge = language === 'en' ? onenoteKnowledgeEN : onenoteKnowledge;
  const isEnglish = language === 'en';
  
  // 检测问题类型
  for (const [category, info] of Object.entries(knowledge)) {
    if (info.symptoms.some(symptom => message.includes(symptom.toLowerCase()))) {
      const randomSolutions = shuffleArray([...info.solutions]);
      const selectedSolutions = randomSolutions.slice(0, Math.min(5, randomSolutions.length));
      
      let response = isEnglish 
        ? `🔍 **Problem Analysis**: I detected that you're experiencing "${category}" related issues.

📋 **Solutions**:
${selectedSolutions.map((solution, index) => `${index + 1}. ${solution}`).join('\n')}`
        : `🔍 **问题分析**：我检测到您遇到的是"${category}"相关问题。

📋 **解决方案**：
${selectedSolutions.map((solution, index) => `${index + 1}. ${solution}`).join('\n')}`;

      // 如果有常见原因信息，添加到回答中
      if (info.commonCauses && info.commonCauses.length > 0) {
        const causesSection = isEnglish 
          ? `\n\n🎯 **Common Causes**:\n${info.commonCauses.map((cause, index) => `• ${cause}`).join('\n')}`
          : `\n\n🎯 **常见原因**：\n${info.commonCauses.map((cause, index) => `• ${cause}`).join('\n')}`;
        response += causesSection;
      }

      const adviceSection = isEnglish 
        ? `\n\n💡 **Professional Advice**:
✅ Try the solutions above in order
✅ Restart OneNote after each attempt to test the effect
✅ For complex issues, try combining multiple solutions
✅ Backup important data to avoid accidental loss

🔄 **Follow-up Support**: If the problem persists, please provide more detailed error information, and I'll provide more precise solutions!`
        : `\n\n💡 **专业建议**：
✅ 建议按照上述顺序逐一尝试解决方案
✅ 每次尝试后重启OneNote测试效果
✅ 如问题复杂，可尝试多个方案组合使用
✅ 做好重要数据备份，避免意外丢失

🔄 **后续支持**：如果问题仍未解决，请提供更详细的错误信息，我会为您提供更精准的解决方案！`;

      response += adviceSection;
      return response;
    }
  }
  
  // 扩展关键词检测
  const responses = [
    {
      keywords: ['你好', 'hello', '您好', '开始', 'start'],
      answer: '👋 您好！我是您的专属OneNote技术支持助理！\n\n🎯 **我的专长领域**：\n📱 移动端同步问题\n🔐 账户和权限问题\n📁 文件和笔记本管理\n🎨 格式和排版问题\n✍️ 手写和绘图功能\n🔧 插件和集成问题\n💾 数据恢复和备份\n⚡ 性能优化建议\n\n请描述您遇到的具体问题，我会为您提供专业的解决方案！'
    },
    {
      keywords: ['谢谢', '感谢', 'thank', '解决了', '好的'],
      answer: '🎉 不客气！很高兴能为您解决OneNote问题！\n\n📚 **温馨提示**：\n• 建议定期备份重要笔记\n• 保持OneNote应用更新到最新版本\n• 遇到问题时可先尝试重启应用\n\n如果您还有其他OneNote相关问题，随时可以向我咨询。我会继续为您提供专业的技术支持服务！'
    },
    {
      keywords: ['api', '密钥', 'key', '配置', 'deepseek'],
      answer: '🔐 **DeepSeek API密钥配置指南**：\n\n**方式一：网页界面配置（推荐）**\n1. 点击页面上的"本地模式"状态提示\n2. 在弹出框中粘贴您的API密钥\n3. 点击"保存并测试"按钮\n4. 配置成功后享受AI智能回答！\n\n**方式二：手动文件配置**\n1. 编辑项目根目录的 `.env` 文件\n2. 将 `DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here` 替换为实际密钥\n3. 保存文件并重启服务器\n\n🌐 **获取密钥**：访问 https://www.deepseek.com/ 注册并获取API密钥'
    },
    {
      keywords: ['功能', '能做什么', '帮助', 'help', '介绍'],
      answer: '🔧 **我的核心功能**：\n\n📊 **问题诊断**：智能分析您的OneNote问题类型\n�️ **解决方案**：提供详细的分步解决指导\n🔍 **在线搜索**：自动搜索最新的解决方案\n📚 **知识库**：涵盖12大类常见OneNote问题\n💡 **专业建议**：基于最佳实践的优化建议\n\n🎯 **支持的问题类型**：\n• 同步和云端问题\n• 性能和稳定性\n• 搜索和索引功能\n• 打印和导出\n• 账户权限管理\n• 移动端使用\n• 手写和绘图\n• 数据恢复备份\n\n请告诉我您的具体问题，我来为您提供专业解答！'
    }
  ];
  
  for (const response of responses) {
    if (response.keywords.some(keyword => message.includes(keyword))) {
      return response.answer;
    }
  }
  
  // 智能默认回答（根据消息长度和内容调整）
  const messageLength = message.length;
  let defaultResponses;
  
  if (messageLength < 10) {
    // 短消息，提供简洁回答
    defaultResponses = [
      '🤖 我是OneNote专业技术支持助理！\n\n请详细描述您遇到的问题，我会为您提供精准的解决方案。您可以说：\n• "OneNote同步很慢"\n• "搜索功能不好用"\n• "打印格式有问题"\n• "手写笔不灵敏"',
      
      '👨‍💻 您好！我专门解决OneNote技术问题！\n\n💬 **快速开始**：\n🔸 描述具体问题症状\n🔸 说明使用的设备和版本\n� 告诉我何时开始出现问题\n\n这样我就能为您提供最合适的解决方案！'
    ];
  } else {
    // 长消息，提供详细回答
    defaultResponses = [
      '� 我正在分析您的问题...\n\n看起来您遇到了OneNote相关的技术问题。为了给您提供最精准的解决方案，请告诉我：\n\n📱 **设备信息**：使用的是桌面版、手机版还是网页版？\n⚙️ **问题详情**：具体是什么功能出现了问题？\n⏰ **发生时间**：问题是什么时候开始出现的？\n🔄 **重现步骤**：能重复出现这个问题吗？\n\n有了这些信息，我就能为您提供针对性的专业解决方案！',
      
      '📋 我理解您正在寻求OneNote问题的解决方案！\n\n🎯 **我的优势**：\n✅ 涵盖12大类OneNote常见问题\n✅ 提供详细的分步操作指导\n✅ 结合在线最新解决方案\n✅ 包含问题预防和优化建议\n\n请具体描述您遇到的问题，比如：\n🔄 "同步问题：文件在不同设备上显示不一致"\n⚡ "性能问题：OneNote启动很慢且经常卡死"\n🔍 "搜索问题：无法找到明明存在的笔记内容"\n\n我会立即为您提供专业的技术支持！',
      
      '🚀 欢迎使用OneNote AI技术支持服务！\n\n🏆 **专业保障**：\n• 基于丰富的故障排除经验\n• 提供Microsoft官方推荐方案\n• 包含最新版本功能指导\n• 支持跨平台使用问题\n\n🔧 **服务范围**：\n📱 移动设备同步问题\n🖥️ 桌面应用性能优化\n🌐 网页版功能限制\n🔐 企业版权限配置\n💾 数据迁移和备份\n🎨 高级功能使用技巧\n\n请详细说明您的问题，我会提供最适合的解决方案！'
    ];
  }
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

// 数组随机排序函数
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// API路由
app.post('/api/chat', async (req, res) => {
  try {
    const { message, hasImage, image, imageName, language = 'zh' } = req.body;
    
    if (!message) {
      const errorMsg = language === 'en' ? 'Message content cannot be empty' : '消息内容不能为空';
      return res.status(400).json({ error: errorMsg });
    }

    let response;
    let searchResults = null;
    let imageAnalysis = '';

    // 如果包含图片，分析图片内容
    if (hasImage && image) {
      console.log(`收到图片: ${imageName || '未命名'}`);
      imageAnalysis = analyzeImage(image, message);
    }

    // 尝试在线搜索相关信息
    try {
      // 如果有图片，在搜索查询中包含图片分析信息
      const searchQuery = hasImage ? `${message} ${imageAnalysis}` : message;
      searchResults = await searchOnlineInfo(searchQuery);
      console.log('在线搜索结果:', searchResults ? '找到相关信息' : '未找到相关信息');
    } catch (error) {
      console.log('在线搜索失败:', error.message);
    }

    // 检查API密钥配置
    if (hasDeepSeek || hasDashScope) {
      // 使用AI API回答
      const enhancedMessage = hasImage ? `${message}\n\n本地图片分析: ${imageAnalysis}` : message;
      response = await callAI(enhancedMessage, searchResults, hasImage ? image : null, language);
    } else {
      // 使用本地知识库回答
      console.log('使用本地知识库回答（未配置API密钥）');
      const enhancedMessage = hasImage ? `${message} ${imageAnalysis}` : message;
      response = getLocalResponse(enhancedMessage, language);
      
      // 如果有图片分析，添加图片相关的回复
      if (hasImage) {
        const imageLabel = language === 'en' ? '📷 **Image Analysis**' : '📷 **图片分析**';
        response = `${imageLabel}: ${imageAnalysis}\n\n${response}`;
      }
      
      // 如果有搜索结果，附加到本地回答中
      if (searchResults) {
        const onlineLabel = language === 'en' ? '\n\n📖 **Related Online Information**：' : '\n\n📖 **相关在线信息**：';
        response += `${onlineLabel}\n${searchResults}`;
      }
    }
    
    // 确定响应来源
    let responseSource = 'Local';
    if (hasDeepSeek || hasDashScope) {
      if (hasImage && hasDashScope) {
        responseSource = '阿里云百炼 (图片理解)';
      } else if (process.env.AI_PROVIDER === 'dashscope' && hasDashScope) {
        responseSource = '阿里云百炼';
      } else if (hasDeepSeek) {
        responseSource = 'DeepSeek';
      } else if (hasDashScope) {
        responseSource = '阿里云百炼';
      }
    }
    
    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString(),
      source: responseSource,
      hasOnlineInfo: !!searchResults,
      hasImageAnalysis: !!hasImage
    });
    
    // 调试日志
    console.log('响应数据:', {
      success: true,
      responseType: typeof response,
      responseLength: response ? response.length : 0,
      source: responseSource,
      hasImage: !!hasImage
    });
  } catch (error) {
    console.error('聊天API错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      response: getLocalResponse(req.body.message || ''),
      source: 'Local'
    });
  }
});

// 获取知识库信息
app.get('/api/knowledge', (req, res) => {
  const language = req.query.language || 'zh';
  const knowledge = language === 'en' ? onenoteKnowledgeEN : onenoteKnowledge;
  
  res.json({
    success: true,
    knowledge: knowledge
  });
});

// 检查配置状态
app.get('/api/status', (req, res) => {
  const hasValidApiKey = process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== 'sk-your-deepseek-api-key-here';
  
  res.json({
    success: true,
    apiConfigured: hasValidApiKey,
    mode: hasValidApiKey ? 'AI' : 'Local',
    message: hasValidApiKey ? 
      'DeepSeek AI已配置，享受智能回答！' : 
      '当前使用本地知识库，请配置API密钥以获得更智能的回答',
    configPath: '.env文件',
    configExample: 'DEEPSEEK_API_KEY=sk-your-actual-key-here'
  });
});

// 测试API密钥
app.post('/api/test-api-key', async (req, res) => {
  try {
    const { apiKey, provider } = req.body;
    
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return res.json({
        success: false,
        error: 'API密钥格式错误，应以 sk- 开头'
      });
    }
    
    let testResponse;
    let providerName;
    
    if (provider === 'dashscope') {
      // 测试阿里云百炼API
      providerName = '阿里云百炼';
      testResponse = await axios.post('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
        model: 'qwen-plus',
        input: {
          messages: [
            {
              role: 'user',
              content: '测试连接'
            }
          ]
        },
        parameters: {
          max_tokens: 10
        }
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
    } else {
      // 测试DeepSeek API
      providerName = 'DeepSeek';
      testResponse = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '测试连接'
          }
        ],
        max_tokens: 10
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
    }
    
    if (testResponse.status === 200) {
      // API密钥有效，保存到环境变量
      if (provider === 'dashscope') {
        process.env.DASHSCOPE_API_KEY = apiKey;
        process.env.AI_PROVIDER = 'dashscope';
      } else {
        process.env.DEEPSEEK_API_KEY = apiKey;
        process.env.AI_PROVIDER = 'deepseek';
      }
      
      // 写入.env文件
      const fs = require('fs');
      const path = require('path');
      const envPath = path.join(__dirname, '.env');
      
      try {
        let envContent = '';
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // 更新或添加API密钥和提供商配置
        const lines = envContent.split('\n');
        let foundApiKey = false;
        let foundProvider = false;
        
        const apiKeyLine = provider === 'dashscope' ? 'DASHSCOPE_API_KEY=' : 'DEEPSEEK_API_KEY=';
        
        for (let i = 0; i < lines.length; i++) {
          if (provider === 'dashscope' && lines[i].startsWith('DASHSCOPE_API_KEY=')) {
            lines[i] = `DASHSCOPE_API_KEY=${apiKey}`;
            foundApiKey = true;
          } else if (provider === 'deepseek' && lines[i].startsWith('DEEPSEEK_API_KEY=')) {
            lines[i] = `DEEPSEEK_API_KEY=${apiKey}`;
            foundApiKey = true;
          } else if (lines[i].startsWith('AI_PROVIDER=')) {
            lines[i] = `AI_PROVIDER=${provider}`;
            foundProvider = true;
          }
        }
        
        if (!foundApiKey) {
          lines.push(`${apiKeyLine}${apiKey}`);
        }
        
        if (!foundProvider) {
          lines.push(`AI_PROVIDER=${provider}`);
        }
        
        // 确保包含PORT配置
        const hasPort = lines.some(line => line.startsWith('PORT='));
        if (!hasPort) {
          lines.push('PORT=3000');
        }
        
        fs.writeFileSync(envPath, lines.join('\n'));
        
        res.json({
          success: true,
          message: `${providerName} API密钥有效并已保存`,
          provider: provider
        });
      } catch (writeError) {
        console.error('写入.env文件失败:', writeError);
        res.json({
          success: true,
          message: `${providerName} API密钥有效（当前会话），但无法保存到文件`,
          provider: provider
        });
      }
    } else {
      res.json({
        success: false,
        error: 'API密钥无效'
      });
    }
  } catch (error) {
    console.error('测试API密钥错误:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      res.json({
        success: false,
        error: 'API密钥无效或已过期'
      });
    } else if (error.code === 'ECONNABORTED') {
      res.json({
        success: false,
        error: '连接超时，请检查网络连接'
      });
    } else {
      res.json({
        success: false,
        error: '测试失败：' + (error.response?.data?.error?.message || error.message)
      });
    }
  }
});

// 主页路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`OneNote AI助理服务器运行在 http://localhost:${PORT}`);
  console.log('请确保已在.env文件中配置DEEPSEEK_API_KEY');
});

module.exports = app;
