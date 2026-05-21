const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'resources/js');

const replacements = [
    // Backgrounds
    { regex: /bg-indigo-[3-9]00/g, replacement: 'bg-earth-dark' },
    { regex: /bg-indigo-[1-2]00/g, replacement: 'bg-earth-warm/20' },
    { regex: /bg-violet-[3-9]00/g, replacement: 'bg-earth-sage' },
    { regex: /bg-violet-[1-2]00/g, replacement: 'bg-earth-sage/20' },
    { regex: /bg-gray-[8-9]00/g, replacement: 'bg-stone-900' },
    { regex: /bg-gray-[6-7]00/g, replacement: 'bg-stone-800' },
    { regex: /bg-gray-[1-2]00/g, replacement: 'bg-[#FCFAF8]' },
    { regex: /bg-gray-50/g, replacement: 'bg-[#FCFAF8]' },
    { regex: /bg-slate-[8-9]00/g, replacement: 'bg-stone-900' },
    { regex: /bg-slate-950/g, replacement: 'bg-stone-950' },
    { regex: /bg-slate-50/g, replacement: 'bg-[#FCFAF8]' },
    
    // Text colors
    { regex: /text-indigo-[6-9]00/g, replacement: 'text-earth-dark' },
    { regex: /text-indigo-[3-5]00/g, replacement: 'text-earth-warm' },
    { regex: /text-gray-[7-9]00/g, replacement: 'text-stone-800' },
    { regex: /text-gray-[4-6]00/g, replacement: 'text-stone-500' },
    { regex: /text-slate-[8-9]00/g, replacement: 'text-stone-800' },
    { regex: /text-slate-[7-9]50/g, replacement: 'text-stone-800' },

    // Borders
    { regex: /border-gray-[2-3]00/g, replacement: 'border-stone-200' },
    { regex: /border-gray-[7-9]00/g, replacement: 'border-stone-800' },
    { regex: /border-slate-[2-3]00/g, replacement: 'border-stone-200' },
    { regex: /border-slate-[7-9]00/g, replacement: 'border-stone-800' },
    { regex: /border-slate-850/g, replacement: 'border-stone-800' },
    { regex: /border-indigo-[4-6]00/g, replacement: 'border-earth-dark' },

    // Hovers
    { regex: /hover:bg-indigo-[6-9]00/g, replacement: 'hover:bg-earth-warm' },
    { regex: /hover:bg-gray-[1-2]00/g, replacement: 'hover:bg-stone-100' },
    { regex: /hover:text-indigo-[6-9]00/g, replacement: 'hover:text-earth-warm' },
    { regex: /hover:text-gray-[7-9]00/g, replacement: 'hover:text-stone-900' },

    // Focus rings
    { regex: /focus:ring-indigo-[4-6]00/g, replacement: 'focus:ring-earth-dark' },
    { regex: /focus:border-indigo-[4-6]00/g, replacement: 'focus:border-earth-dark' },
    
    // Gradients
    { regex: /from-indigo-[5-9]00/g, replacement: 'from-earth-dark' },
    { regex: /to-violet-[5-9]00/g, replacement: 'to-earth-warm' },
    { regex: /to-violet-[5-9]50/g, replacement: 'to-earth-warm' },
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
console.log("Done.");
