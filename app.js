import { marked } from 'marked';
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

// State management
const state = {
    projects: [],
    currentProject: null,
    files: [],
    currentFile: null,
    apiKey: localStorage.getItem('geminiApiKey') || null,
    editors: {},
    activeTab: 'editor'
};

!function(e){if("function"==typeof define&&define.amd){define(["exports"],e)}else{var t={};e(t),e(t)}}(function(e){var t={655:"https://cdn.jsdelivr.net/",657:"https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm"};e.exports=t});

// Constants
const DEFAULT_TEMPLATES = {
    blank: {},
    'html-css-js': {
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Hello World</h1>
    
    <script src="script.js"></script>
</body>
</html>`,
        'styles.css': `body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 20px;
    color: #333;
}

h1 {
    color: #0066cc;
}`,
        'script.js': `document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');
});`
    },
    'web-app': {
        'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>My Web App</h1>
        <nav>
            <ul>
                <li><a href="#" class="active">Home</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section class="content">
            <h2>Welcome to My Web App</h2>
            <p>This is a starter template for your web application.</p>
            <button id="action-btn">Click Me</button>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2023 My Web App</p>
    </footer>
    
    <script src="app.js"></script>
</body>
</html>`,
        'styles.css': `* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: #333;
}

header {
    background-color: #2c3e50;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

nav ul {
    display: flex;
    list-style: none;
}

nav a {
    color: #ecf0f1;
    text-decoration: none;
    padding: 0.5rem 1rem;
    margin: 0 0.2rem;
    border-radius: 3px;
}

nav a:hover, nav a.active {
    background-color: #34495e;
}

main {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.content {
    background-color: white;
    padding: 2rem;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h2 {
    margin-bottom: 1rem;
    color: #2c3e50;
}

button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 0.7rem 1.5rem;
    margin-top: 1rem;
    border-radius: 3px;
    cursor: pointer;
    font-size: 1rem;
}

button:hover {
    background-color: #2980b9;
}

footer {
    text-align: center;
    padding: 1rem;
    background-color: #2c3e50;
    color: #ecf0f1;
    position: fixed;
    bottom: 0;
    width: 100%;
}`,
        'app.js': `document.addEventListener('DOMContentLoaded', () => {
    // Get elements
    const actionBtn = document.getElementById('action-btn');
    
    // Event listeners
    actionBtn.addEventListener('click', () => {
        alert('Button clicked!');
    });
    
    // Initialize app
    console.log('Web app initialized');
});`
    }
};

// File icons mapping
const FILE_ICONS = {
    html: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12,17.56L16.07,16.43L16.62,10.33H9.38L9.2,8.3H16.8L17,6.31H7L7.56,12.32H14.45L14.22,14.9L12,15.5L9.78,14.9L9.64,13.24H7.64L7.93,16.43L12,17.56M4.07,3H19.93L18.5,19.2L12,21L5.5,19.2L4.07,3Z" /></svg>',
    css: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19M12,15A1,1 0 0,1 13,16A1,1 0 0,1 12,17A1,1 0 0,1 11,16A1,1 0 0,1 12,15M8,15A1,1 0 0,1 9,16A1,1 0 0,1 8,17A1,1 0 0,1 7,16A1,1 0 0,1 8,15M16,15A1,1 0 0,1 17,16A1,1 0 0,1 16,17A1,1 0 0,1 15,16A1,1 0 0,1 16,15Z" /></svg>',
    js: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M3,3H21V21H3V3M7.73,18.04C8.13,18.89 8.92,19.59 10.27,19.59C11.77,19.59 12.8,18.79 12.8,17.04V11.26H16.8L17,6.31H7L7.56,12.32H14.45L14.22,14.9L12,15.5L9.78,14.9L9.64,13.24H7.64L7.93,16.43L12,17.56M13.71,17.86C14.21,18.84 15.22,19.59 16.8,19.59C18.4,19.59 19.6,18.76 19.6,17.23C19.6,15.82 18.79,15.19 17.35,14.57L16.93,14.39C16.2,14.08 15.89,13.87 15.89,13.37C15.89,12.96 16.2,12.64 16.7,12.64C17.18,12.64 17.5,12.85 17.79,13.37L19.1,12.5C18.55,11.54 17.77,11.17 16.7,11.17C15.19,11.17 14.22,12.13 14.22,13.4C14.22,14.78 15.03,15.43 16.25,15.95L16.67,16.13C17.45,16.47 17.91,16.68 17.91,17.26C17.91,17.74 17.46,18.09 16.76,18.09C15.93,18.09 15.45,17.66 15.09,17.06L13.71,17.86Z" /></svg>',
    json: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19M12,15A1,1 0 0,1 13,16A1,1 0 0,1 12,17A1,1 0 0,1 11,16A1,1 0 0,1 12,15M8,15A1,1 0 0,1 9,16A1,1 0 0,1 8,17A1,1 0 0,1 7,16A1,1 0 0,1 8,15M16,15A1,1 0 0,1 17,16A1,1 0 0,1 16,17A1,1 0 0,1 15,16A1,1 0 0,1 16,15Z" /></svg>',
    md: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M20.56 18H3.44C2.65 18 2 17.37 2 16.58V7.42C2 6.63 2.65 6 3.44 6H20.56C21.35 6 22 6.63 22 7.42V16.58C22 17.37 21.35 18 20.56 18M6.81 15.19V11.53L8.73 13.88L10.65 11.53V15.19H12.58V8.81H10.65L8.73 11.16L6.81 8.81H4.89V15.19H6.81M19.69 12H17.77V8.81H15.85V12H13.92L16.81 15.28L19.69 12Z" /></svg>',
    default: '<svg width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M13,9H18.5L13,3.5V9M6,2H14.5L20,8V20A2,2 0 0,0 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M14,20V13L11,16L8,13V20H14Z" /></svg>'
};

// DOM Elements
const elements = {
    apiKeyModal: document.getElementById('api-key-modal'),
    apiKeyInput: document.getElementById('api-key-input'),
    saveApiKeyBtn: document.getElementById('save-api-key'),
    cancelApiKeyBtn: document.getElementById('cancel-api-key'),
    newProjectBtn: document.getElementById('new-project-btn'),
    newProjectModal: document.getElementById('new-project-modal'),
    projectNameInput: document.getElementById('project-name-input'),
    projectTemplate: document.getElementById('project-template'),
    createProjectBtn: document.getElementById('create-project'),
    cancelProjectBtn: document.getElementById('cancel-project'),
    projectList: document.querySelector('.project-list'),
    newFileBtn: document.getElementById('new-file-btn'),
    newFileModal: document.getElementById('new-file-modal'),
    fileNameInput: document.getElementById('file-name-input'),
    fileType: document.getElementById('file-type'),
    createFileBtn: document.getElementById('create-file'),
    cancelFileBtn: document.getElementById('cancel-file'),
    fileList: document.querySelector('.file-list'),
    fileTabs: document.querySelectorAll('.file-tabs'),
    promptInput: document.getElementById('prompt-input'),
    generateBtn: document.getElementById('generate-btn'),
    clearPromptBtn: document.getElementById('clear-prompt-btn'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    previewFrame: document.getElementById('preview-frame'),
    previewFrameSplit: document.getElementById('preview-frame-split'),
    toast: document.getElementById('toast'),
    statusMessage: document.querySelector('.status-message'),
    apiIndicator: document.querySelector('.api-indicator'),
    settingsButton: document.querySelector('.settings-button')
};

// Initialize Monaco Editor
function initMonaco() {
    require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' }});
    
    require(['vs/editor/editor.main'], function() {
        // Create main editor
        state.editors.main = monaco.editor.create(document.getElementById('code-editor'), {
            value: '',
            language: 'plaintext',
            theme: 'vs',
            automaticLayout: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            tabSize: 2
        });
        
        // Create split view editor
        state.editors.split = monaco.editor.create(document.getElementById('code-editor-split'), {
            value: '',
            language: 'plaintext',
            theme: 'vs',
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            tabSize: 2
        });
        
        // Add live preview update
        const updatePreviewDebounced = debounce(() => {
            if (state.currentFile) {
                state.currentFile.content = state.editors.main.getValue();
                updatePreview();
            }
        }, 500);
        
        state.editors.main.onDidChangeModelContent(updatePreviewDebounced);
        state.editors.split.onDidChangeModelContent(updatePreviewDebounced);
    });
}

// API Client for Gemini
class GeminiClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
        this.model = 'gemini-1.5-flash';
    }
    
    async generateContent(fullPrompt) {
        try {
            const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: fullPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 8192
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }
            
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }
}

// Parse code blocks from Gemini response
function parseCodeFromMarkdown(markdownText) {
    const codeBlocks = {};
    const codeBlockRegex = /```\s*(?:(\w+)\s*\n)?\s*(?:(?:\/\/|\/\*|\<!--)\s*filename:\s*(.*?)(?:\*\/|\-->)?\s*\n)?([\s\S]*?)```/g;
    
    let match;
    while ((match = codeBlockRegex.exec(markdownText)) !== null) {
        let language = match[1] || 'txt';
        let fileName = match[2];
        let code = match[3].trim();
        
        // Clean up code content
        code = code.replace(/^(?:html|css|javascript)\s+filename:\s*.*?\n/i, '');
        code = code.replace(/^filename:\s*.*?\n/i, '');
        
        // Normalize language and filename
        language = language.toLowerCase();
        if (language === 'javascript') language = 'js';
        if (language === 'typescript') language = 'ts';
        if (language === 'markdown') language = 'md';
        
        // Normalize filename
        if (fileName) {
            fileName = fileName.trim();
            fileName = fileName.replace(/[<>]/g, '');
        }
        
        // Auto-detect file type if not specified
        if (!fileName) {
            if (code.includes('<!DOCTYPE html') || code.includes('<html')) {
                fileName = 'index.html';
                language = 'html';
            } else if (code.includes('@media') || /[.#][a-zA-Z][\w-]*\s*\{/.test(code)) {
                fileName = 'styles.css';
                language = 'css';
            } else if (code.includes('function') || code.includes('const') || code.includes('let')) {
                fileName = 'script.js';
                language = 'js';
            } else {
                fileName = `file.${language}`;
            }
        }
        
        const normalizedFileName = fileName.toLowerCase();
        codeBlocks[normalizedFileName] = code;
    }
    
    return codeBlocks;
}

// Update preview
function updatePreview() {
    const htmlFile = state.files.find(file => 
        file.projectId === state.currentProject?.id && 
        file.name.toLowerCase().endsWith('.html')
    );
    
    if (!htmlFile) {
        setPreviewContent('<div style="padding: 20px; font-family: sans-serif;"><h2>No HTML file found in this project</h2><p>Create an HTML file to see a preview.</p></div>');
        return;
    }
    
    let htmlContent = htmlFile.content;
    
    // Clean up any filename comments
    htmlContent = htmlContent.replace(/^(?:html\s+)?filename:\s*.*?\n/i, '');
    
    // Find and inject CSS files
    const cssFiles = state.files.filter(file => 
        file.projectId === state.currentProject.id && 
        file.name.toLowerCase().endsWith('.css')
    );
    
    cssFiles.forEach(cssFile => {
        let cssContent = cssFile.content;
        cssContent = cssContent.replace(/^(?:css\s+)?filename:\s*.*?\n/i, '');
        
        const cssLinkRegex = new RegExp(`<link[^>]*href=["']${cssFile.name}["'][^>]*>`, 'i');
        
        if (cssLinkRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(cssLinkRegex, `<style>${cssContent}</style>`);
        } else {
            htmlContent = htmlContent.replace('</head>', `<style>${cssContent}</style></head>`);
        }
    });
    
    // Find and inject JS files
    const jsFiles = state.files.filter(file => 
        file.projectId === state.currentProject.id && 
        file.name.toLowerCase().endsWith('.js')
    );
    
    jsFiles.forEach(jsFile => {
        let jsContent = jsFile.content;
        jsContent = jsContent.replace(/^(?:javascript\s+)?filename:\s*.*?\n/i, '');
        
        const jsScriptRegex = new RegExp(`<script[^>]*src=["']${jsFile.name}["'][^>]*>.*?</script>`, 'i');
        
        if (jsScriptRegex.test(htmlContent)) {
            htmlContent = htmlContent.replace(jsScriptRegex, `<script>${jsContent}</script>`);
        } else {
            htmlContent = htmlContent.replace('</body>', `<script>${jsContent}</script></body>`);
        }
    });
    
    setPreviewContent(htmlContent);
}

// Update the setPreviewContent function to properly handle HTML content
function setPreviewContent(htmlContent) {
    const frames = [elements.previewFrame, elements.previewFrameSplit];
    
    frames.forEach(frame => {
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.open();
        
        // Clean up html content 
        let cleanContent = htmlContent.trim();
        cleanContent = cleanContent.replace(/^(?:html\s+)?filename:\s*.*?\n/i, '');
        cleanContent = cleanContent.replace(/^[<!]?(?:DOCTYPE|doctype)\s+html>\s*/, '<!DOCTYPE html>\n');
        
        // If no DOCTYPE is present, add it
        if (!cleanContent.includes('<!DOCTYPE html>')) {
            cleanContent = '<!DOCTYPE html>\n' + cleanContent;
        }
        
        // If no <html> tag is present, wrap the content
        if (!cleanContent.includes('<html')) {
            cleanContent = `<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        ${cleanContent}
    </body>
</html>`;
        }
        
        doc.write(cleanContent);
        doc.close();
    });
}

// Generate code using Gemini
async function generateCode() {
    if (!state.apiKey) {
        openModal(elements.apiKeyModal);
        showToast('Please set your Gemini API key first', 'warning');
        return;
    }
    
    if (!state.currentProject) {
        showToast('Please create or select a project first', 'warning');
        return;
    }
    
    const prompt = elements.promptInput.value.trim();
    if (!prompt) {
        showToast('Please enter a prompt', 'warning');
        return;
    }
    
    try {
        elements.statusMessage.textContent = 'Generating code...';
        elements.generateBtn.disabled = true;
        showToast('Generating code...', '');
        
        const existingFiles = state.files
            .filter(file => file.projectId === state.currentProject.id)
            .map(file => `File: ${file.name}\n\`\`\`${file.name.split('.').pop()}\n${file.content}\n\`\`\``).join('\n\n');
        
        const fullPrompt = `I'm building a web application with the following existing files:
        
${existingFiles || 'No files yet.'}

Based on these files, please help me with the following request:

${prompt}

Please provide complete, functional code for all necessary files. 
For each file, specify both the language and filename in the code block:

\`\`\`html filename: index.html
<!DOCTYPE html>
... your HTML code ...
\`\`\`

\`\`\`css filename: styles.css
... your CSS code ...
\`\`\`

\`\`\`javascript filename: script.js
... your JavaScript code ...
\`\`\``;

        const client = new GeminiClient(state.apiKey);
        const response = await client.generateContent(fullPrompt);
        
        const codeBlocks = parseCodeFromMarkdown(response);
        
        if (Object.keys(codeBlocks).length === 0) {
            showToast('No code blocks found in the response', 'warning');
            return;
        }
        
        let filesUpdated = false;
        
        // Update or create files
        for (const [fileName, content] of Object.entries(codeBlocks)) {
            const normalizedFileName = fileName.toLowerCase();
            const existingFile = state.files.find(
                f => f.projectId === state.currentProject.id && 
                f.name.toLowerCase() === normalizedFileName
            );
            
            if (existingFile) {
                existingFile.content = content;
                if (state.currentFile && existingFile.id === state.currentFile.id) {
                    state.editors.main.setValue(content);
                    state.editors.split.setValue(content);
                }
                filesUpdated = true;
            } else {
                const newFile = {
                    id: generateId(),
                    name: fileName,
                    content: content,
                    projectId: state.currentProject.id
                };
                state.files.push(newFile);
                filesUpdated = true;
            }
        }
        
        if (filesUpdated) {
            renderFiles();
            saveState();
            updatePreview();
            showToast('Code generated and files updated successfully', 'success');
            
            // Select first HTML file or first available file
            const htmlFile = state.files.find(
                f => f.projectId === state.currentProject.id && 
                f.name.toLowerCase().endsWith('.html')
            );
            
            if (htmlFile) {
                selectFile(htmlFile);
            } else {
                const firstFile = state.files.find(f => f.projectId === state.currentProject.id);
                if (firstFile) {
                    selectFile(firstFile);
                }
            }
        }
        
    } catch (error) {
        showToast(`Error: ${error.message}`, 'error');
        console.error('Generation error:', error);
    } finally {
        elements.statusMessage.textContent = 'Ready';
        elements.generateBtn.disabled = false;
    }
}

// Add new function to save file changes
function saveCurrentFile() {
    if (state.currentFile) {
        state.currentFile.content = state.editors.main.getValue();
        saveState();
        showToast('File saved successfully', 'success');
        updatePreview(); // Ensure preview is updated
    }
}

// Add new function to delete file
function deleteCurrentFile() {
    if (state.currentFile) {
        if (confirm(`Are you sure you want to delete ${state.currentFile.name}?`)) {
            state.files = state.files.filter(f => f.id !== state.currentFile.id);
            saveState();
            renderFiles();
            
            // Select another file if available
            const remainingFiles = state.files.filter(f => f.projectId === state.currentProject.id);
            if (remainingFiles.length > 0) {
                selectFile(remainingFiles[0]);
            } else {
                state.currentFile = null;
                state.editors.main.setValue('');
                state.editors.split.setValue('');
                updatePreview();
            }
            
            showToast(`File "${state.currentFile.name}" deleted`, 'success');
        }
    }
}

// Event handlers
function registerEventListeners() {
    elements.saveApiKeyBtn.addEventListener('click', () => {
        const apiKey = elements.apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
            state.apiKey = apiKey;
            updateApiStatus(true);
            closeModal(elements.apiKeyModal);
            showToast('API key saved successfully', 'success');
        } else {
            showToast('Please enter a valid API key', 'error');
        }
    });
    
    elements.cancelApiKeyBtn.addEventListener('click', () => {
        closeModal(elements.apiKeyModal);
    });
    
    elements.settingsButton.addEventListener('click', () => {
        elements.apiKeyInput.value = state.apiKey || '';
        openModal(elements.apiKeyModal);
    });
    
    elements.newProjectBtn.addEventListener('click', () => {
        elements.projectNameInput.value = '';
        elements.projectTemplate.value = 'blank';
        openModal(elements.newProjectModal);
    });
    
    elements.createProjectBtn.addEventListener('click', createNewProject);
    elements.cancelProjectBtn.addEventListener('click', () => {
        closeModal(elements.newProjectModal);
    });
    
    elements.newFileBtn.addEventListener('click', () => {
        if (!state.currentProject) {
            showToast('Please create or select a project first', 'warning');
            return;
        }
        
        elements.fileNameInput.value = '';
        elements.fileType.value = 'html';
        openModal(elements.newFileModal);
    });
    
    elements.createFileBtn.addEventListener('click', createNewFile);
    elements.cancelFileBtn.addEventListener('click', () => {
        closeModal(elements.newFileModal);
    });
    
    elements.clearPromptBtn.addEventListener('click', () => {
        elements.promptInput.value = '';
    });
    
    elements.generateBtn.addEventListener('click', generateCode);
    
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

// Tab switching
function switchTab(tabName) {
    elements.tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    elements.tabPanes.forEach(pane => {
        const isActive = pane.id === `${tabName}-pane`;
        pane.classList.toggle('active', isActive);
    });
    
    state.activeTab = tabName;
    
    if (state.currentFile) {
        syncEditors();
    }
}

// Sync editors when switching tabs
function syncEditors() {
    const currentContent = state.editors.main.getValue();
    state.editors.split.setValue(currentContent);
}

// Modify the selectFile function to add auto-save functionality
function selectFile(file) {
    // Auto-save current file before switching
    if (state.currentFile && state.editors.main) {
        state.currentFile.content = state.editors.main.getValue();
        saveState();
    }
    
    state.currentFile = file;
    
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('span').textContent === file.name) {
            item.classList.add('active');
        }
    });
    
    document.querySelectorAll('.file-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.querySelector('span').textContent === file.name) {
            tab.classList.add('active');
        }
    });
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const languageMap = {
        html: 'html',
        css: 'css',
        js: 'javascript',
        json: 'json',
        md: 'markdown',
        txt: 'plaintext'
    };
    const language = languageMap[fileExtension] || 'plaintext';
    
    if (state.editors.main && state.editors.main.getModel()) {
        monaco.editor.setModelLanguage(state.editors.main.getModel(), language);
        state.editors.main.setValue(file.content);
    }
    
    if (state.editors.split && state.editors.split.getModel()) {
        monaco.editor.setModelLanguage(state.editors.split.getModel(), language);
        state.editors.split.setValue(file.content);
    }
    
    updatePreview();
}

// Update file render function to include save/delete buttons
function renderFiles() {
    elements.fileList.innerHTML = '';
    elements.fileTabs.forEach(tabContainer => tabContainer.innerHTML = '');
    
    if (!state.currentProject) return;
    
    const projectFiles = state.files.filter(file => file.projectId === state.currentProject.id);
    
    projectFiles.forEach(file => {
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const icon = FILE_ICONS[fileExtension] || FILE_ICONS.default;
        const isActive = state.currentFile && file.id === state.currentFile.id;
        
        // File list item
        const fileItem = document.createElement('div');
        fileItem.className = `file-item${isActive ? ' active' : ''}`;
        fileItem.innerHTML = `
            ${icon}
            <span>${file.name}</span>
            <div class="file-actions">
                <button class="icon-btn save-file" title="Save">
                    <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" />
                    </svg>
                </button>
                <button class="icon-btn delete-file" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                </button>
            </div>
        `;
        
        fileItem.querySelector('.save-file').addEventListener('click', (e) => {
            e.stopPropagation();
            selectFile(file);
            saveCurrentFile();
        });
        
        fileItem.querySelector('.delete-file').addEventListener('click', (e) => {
            e.stopPropagation();
            selectFile(file);
            deleteCurrentFile();
        });
        
        fileItem.addEventListener('click', () => {
            selectFile(file);
        });
        
        elements.fileList.appendChild(fileItem);
        
        // File tabs
        elements.fileTabs.forEach(tabContainer => {
            const fileTab = document.createElement('button');
            fileTab.className = `file-tab${isActive ? ' active' : ''}`;
            fileTab.innerHTML = `
                ${icon}
                <span>${file.name}</span>
            `;
            
            fileTab.addEventListener('click', () => {
                selectFile(file);
            });
            
            tabContainer.appendChild(fileTab);
        });
    });
}

// Select project
function selectProject(project) {
    state.currentProject = project;
    renderProjects();
    renderFiles();
    
    const projectFiles = state.files.filter(f => f.projectId === project.id);
    if (projectFiles.length > 0) {
        const htmlFile = projectFiles.find(f => f.name.toLowerCase().endsWith('.html'));
        if (htmlFile) {
            selectFile(htmlFile);
        } else {
            selectFile(projectFiles[0]);
        }
    } else {
        state.currentFile = null;
        if (state.editors.main) {
            state.editors.main.setValue('');
            state.editors.split.setValue('');
        }
        updatePreview();
    }
}

// Create new project
function createNewProject() {
    const projectName = elements.projectNameInput.value.trim();
    const templateName = elements.projectTemplate.value;
    
    if (!projectName) {
        showToast('Please enter a project name', 'warning');
        return;
    }
    
    const newProject = {
        id: generateId(),
        name: projectName,
        createdAt: new Date().toISOString()
    };
    
    state.projects.push(newProject);
    state.currentProject = newProject;
    
    const template = DEFAULT_TEMPLATES[templateName] || {};
    
    Object.entries(template).forEach(([fileName, content]) => {
        state.files.push({
            id: generateId(),
            name: fileName,
            content: content,
            projectId: newProject.id
        });
    });
    
    renderProjects();
    renderFiles();
    
    if (state.files.length > 0) {
        selectFile(state.files[0]);
    }
    
    closeModal(elements.newProjectModal);
    showToast(`Project "${projectName}" created`, 'success');
    
    saveState();
}

// Create new file
function createNewFile() {
    const fileName = elements.fileNameInput.value.trim();
    const fileType = elements.fileType.value;
    
    if (!fileName) {
        showToast('Please enter a file name', 'warning');
        return;
    }
    
    let finalFileName = fileName;
    if (!finalFileName.includes('.')) {
        finalFileName += `.${fileType}`;
    }
    
    if (state.files.some(file => file.projectId === state.currentProject.id && file.name === finalFileName)) {
        showToast(`File "${finalFileName}" already exists`, 'error');
        return;
    }
    
    const newFile = {
        id: generateId(),
        name: finalFileName,
        content: '',
        projectId: state.currentProject.id
    };
    
    state.files.push(newFile);
    renderFiles();
    selectFile(newFile);
    
    closeModal(elements.newFileModal);
    showToast(`File "${finalFileName}" created`, 'success');
    
    saveState();
}

// Render projects list with delete and export buttons
function renderProjects() {
    elements.projectList.innerHTML = '';
    
    state.projects.forEach(project => {
        const isActive = state.currentProject && project.id === state.currentProject.id;
        const projectItem = document.createElement('div');
        projectItem.className = `project-item${isActive ? ' active' : ''}`;
        projectItem.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="currentColor" d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.1,6 20,6H12L10,4Z" />
            </svg>
            <span>${project.name}</span>
            <div class="project-actions">
                <button class="icon-btn export-project" title="Export Project">
                    <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
                    </svg>
                </button>
                <button class="icon-btn delete-project" title="Delete Project">
                    <svg width="14" height="14" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                </button>
            </div>
        `;
        
        // Add click handler for project selection
        projectItem.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-project') && !e.target.closest('.export-project')) {
                selectProject(project);
            }
        });
        
        // Add delete handler
        projectItem.querySelector('.delete-project').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteProject(project);
        });

        // Add export handler
        projectItem.querySelector('.export-project').addEventListener('click', (e) => {
            e.stopPropagation();
            exportProject(project);
        });
        
        elements.projectList.appendChild(projectItem);
    });
}

// Add new function to export project
async function exportProject(project) {
    try {
        const zip = new JSZip();
        
        // Get all files for this project
        const projectFiles = state.files.filter(f => f.projectId === project.id);
        
        // Add each file to the zip
        projectFiles.forEach(file => {
            // Clean up any filename comments from content
            let content = file.content;
            content = content.replace(/^(?:html|css|javascript)\s+filename:\s*.*?\n/i, '');
            content = content.replace(/^filename:\s*.*?\n/i, '');
            
            zip.file(file.name, content);
        });
        
        // Generate the zip file
        const blob = await zip.generateAsync({type: "blob"});
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${project.name}.zip`;
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        showToast(`Project "${project.name}" exported successfully`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showToast('Failed to export project', 'error');
    }
}

// Add delete project function
function deleteProject(project) {
    if (confirm(`Are you sure you want to delete project "${project.name}"? This will delete all associated files.`)) {
        // Remove all files associated with this project
        state.files = state.files.filter(f => f.projectId !== project.id);
        
        // Remove the project
        state.projects = state.projects.filter(p => p.id !== project.id);
        
        // If this was the current project, select another one
        if (state.currentProject && state.currentProject.id === project.id) {
            state.currentProject = state.projects[0] || null;
            state.currentFile = null;
            if (state.editors.main) {
                state.editors.main.setValue('');
                state.editors.split.setValue('');
            }
        }
        
        saveState();
        renderProjects();
        renderFiles();
        updatePreview();
        
        showToast(`Project "${project.name}" deleted`, 'success');
    }
}

// Save state to localStorage
function saveState() {
    try {
        localStorage.setItem('laxSimProjects', JSON.stringify(state.projects));
        localStorage.setItem('laxSimFiles', JSON.stringify(state.files));
        if (state.currentProject) {
            localStorage.setItem('laxSimCurrentProject', state.currentProject.id);
        }
    } catch (error) {
        console.error('Error saving state:', error);
    }
}

// Load state from localStorage
function loadState() {
    try {
        const projects = localStorage.getItem('laxSimProjects');
        const files = localStorage.getItem('laxSimFiles');
        const currentProjectId = localStorage.getItem('laxSimCurrentProject');
        
        if (projects) {
            state.projects = JSON.parse(projects);
        }
        
        if (files) {
            state.files = JSON.parse(files);
        }
        
        if (currentProjectId && state.projects.length > 0) {
            state.currentProject = state.projects.find(p => p.id === currentProjectId) || state.projects[0];
        }
    } catch (error) {
        console.error('Error loading state:', error);
    }
}

// UI Helpers
function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

function showToast(message, type = '') {
    elements.toast.textContent = message;
    elements.toast.className = 'toast';
    if (type) {
        elements.toast.classList.add(type);
    }
    elements.toast.classList.add('active');
    
    setTimeout(() => {
        elements.toast.classList.remove('active');
    }, 3000);
}

function updateApiStatus(isConnected) {
    const indicator = elements.apiIndicator;
    if (isConnected) {
        indicator.textContent = 'Connected';
        indicator.classList.remove('disconnected');
        indicator.classList.add('connected');
    } else {
        indicator.textContent = 'Disconnected';
        indicator.classList.remove('connected');
        indicator.classList.add('disconnected');
    }
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize app
function init() {
    if (!state.apiKey) {
        setTimeout(() => {
            openModal(elements.apiKeyModal);
        }, 500);
        updateApiStatus(false);
    } else {
        updateApiStatus(true);
    }
    
    initMonaco();
    
    registerEventListeners();
    
    loadState();
    
    renderProjects();
    renderFiles();
    
    if (state.currentProject && state.projects.length > 0) {
        selectProject(state.currentProject);
    }
}

document.addEventListener('DOMContentLoaded', init);