const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'resources/js');

const replacements = [
    // Backgrounds (warm up the dark mode)
    { regex: /dark:bg-stone-950/g, replacement: 'dark:bg-[#231F1C]' },
    { regex: /dark:bg-stone-900/g, replacement: 'dark:bg-[#2B2623]' },
    { regex: /dark:bg-stone-800/g, replacement: 'dark:bg-[#38312D]' },
    { regex: /dark:bg-stone-700/g, replacement: 'dark:bg-[#4A423C]' },
    
    // Borders
    { regex: /dark:border-stone-800/g, replacement: 'dark:border-[#4A423C]' },
    { regex: /dark:border-stone-700/g, replacement: 'dark:border-[#5C534D]' },
    
    // Ensure text is readable
    { regex: /dark:text-stone-500/g, replacement: 'dark:text-[#A89F98]' },
    { regex: /dark:text-gray-300/g, replacement: 'dark:text-[#D1CBC5]' },
    { regex: /dark:text-gray-400/g, replacement: 'dark:text-[#B8B0A8]' },
    { regex: /dark:text-gray-200/g, replacement: 'dark:text-[#E8E4DF]' }
];

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            replacements.forEach(({ regex, replacement }) => {
                content = content.replace(regex, replacement);
            });

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

processDirectory(directoryPath);
console.log("Dark mode globally fixed.");
