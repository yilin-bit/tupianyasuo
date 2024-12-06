// 全局变量
let originalFile = null;
let compressedBlob = null;

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

// 事件监听
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#0071e3';
});
uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#e5e5e5';
});
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
qualitySlider.addEventListener('input', handleQualityChange);
downloadBtn.addEventListener('click', handleDownload);

// 处理文件拖放
function handleDrop(e) {
    e.preventDefault();
    uploadArea.style.borderColor = '#e5e5e5';
    const file = e.dataTransfer.files[0];
    if (file && isValidImage(file)) {
        processFile(file);
    }
}

// 处理文件选择
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && isValidImage(file)) {
        processFile(file);
    }
}

// 验证图片格式
function isValidImage(file) {
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        alert('请上传 PNG 或 JPG 格式的图片！');
        return false;
    }
    return true;
}

// 处理文件
function processFile(file) {
    try {
        originalFile = file;
        originalSize.textContent = formatFileSize(file.size);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            originalPreview.src = e.target.result;
            compressImage(e.target.result, qualitySlider.value / 100);
        };
        reader.onerror = () => {
            alert('读取文件失败，请重试！');
        };
        reader.readAsDataURL(file);
        
        previewArea.hidden = false;
    } catch (error) {
        console.error('处理文件时发生错误:', error);
        alert('处理文件时发生错误，请重试！');
    }
}

// 压缩图片
function compressImage(dataUrl, quality) {
    const img = new Image();
    
    img.onerror = () => {
        alert('加载图片失败，请重试！');
    };
    
    img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 保持原始尺寸
            canvas.width = img.width;
            canvas.height = img.height;
            
            // 绘制图片
            ctx.drawImage(img, 0, 0, img.width, img.height);
            
            // 转换为 blob
            canvas.toBlob((blob) => {
                if (blob) {
                    compressedBlob = blob;
                    compressedSize.textContent = formatFileSize(blob.size);
                    compressedPreview.src = URL.createObjectURL(blob);
                } else {
                    alert('压缩图片失败，请重试！');
                }
            }, originalFile.type, quality);
        } catch (error) {
            console.error('压缩图片时发生错误:', error);
            alert('压缩图片时发生错误，请重试！');
        }
    };
    
    img.src = dataUrl;
}

// 处理质量滑块变化
function handleQualityChange(e) {
    const quality = e.target.value;
    qualityValue.textContent = quality + '%';
    
    if (originalFile) {
        const reader = new FileReader();
        reader.onload = (e) => compressImage(e.target.result, quality / 100);
        reader.onerror = () => {
            alert('读取文件失败，请重试！');
        };
        reader.readAsDataURL(originalFile);
    }
}

// 处理下载
function handleDownload() {
    if (!compressedBlob || !originalFile) return;
    
    try {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(compressedBlob);
        link.download = `compressed_${originalFile.name}`;
        link.click();
        
        // 清理创建的 URL
        URL.revokeObjectURL(link.href);
    } catch (error) {
        console.error('下载文件时发生错误:', error);
        alert('下载文件失败，请重试！');
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}