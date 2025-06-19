import {
    readdirSync,
    existsSync,
    mkdirSync,
    writeFileSync,
    statSync,
    readFileSync,
} from 'fs';
import { resolve, extname, basename, join, relative, dirname } from 'path';
import ttf2woff from 'ttf2woff';
import ttf2woff2 from 'ttf2woff2';

const FONTS_DIR = 'resources/fonts';
const OUTPUT_DIR = 'public/fonts';
const CSS_OUTPUT = 'resources/scss/common/_fonts.scss';

// Копируем функции из vite-font-plugin.js
function findFontFiles(dir) {
    let fontFiles = [];

    if (!existsSync(dir)) return fontFiles;

    const items = readdirSync(dir);

    for (const item of items) {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
            fontFiles = fontFiles.concat(findFontFiles(fullPath));
        } else if (item.endsWith('.ttf') || item.endsWith('.otf')) {
            fontFiles.push(fullPath);
        }
    }

    return fontFiles;
}

function convertFont(inputPath, outputBaseDir, fontsDir) {
    const fileName = basename(inputPath, extname(inputPath));
    const relativePath = relative(fontsDir, dirname(inputPath));
    const outputDir = relativePath ? join(outputBaseDir, relativePath) : outputBaseDir;

    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }

    try {
        console.log(`🔄 Обработка файла: ${inputPath}`);

        const fontBuffer = readFileSync(inputPath);

        // WOFF2
        const woff2Output = resolve(outputDir, `${fileName}.woff2`);
        const woff2 = ttf2woff2(fontBuffer);
        writeFileSync(woff2Output, Buffer.from(woff2));
        console.log(`✅ Converted: ${relativePath ? relativePath + '/' : ''}${fileName}.woff2`);

        // WOFF
        const woffOutput = resolve(outputDir, `${fileName}.woff`);
        const woff = ttf2woff(fontBuffer).buffer;
        writeFileSync(woffOutput, Buffer.from(woff));
        console.log(`✅ Converted: ${relativePath ? relativePath + '/' : ''}${fileName}.woff`);

        return {
            name: fileName,
            path: relativePath ? `${relativePath}/${fileName}` : fileName,
            family: relativePath || fileName.replace(/[-_](regular|bold|light|medium|semibold|thin|black|heavy)$/i, ''),
        };
    } catch (error) {
        console.error(`❌ Error converting ${fileName}:`, error.message);
        return null;
    }
}

function generateFontCSS(convertedFonts) {
    const fontFaces = convertedFonts
        .filter(Boolean)
        .map((font) => {
            return `@font-face {
  font-family: '${font.family}';
  src: url('{{ asset('fonts/${font.path}.woff2') }}') format('woff2'),
       url('{{ asset('fonts/${font.path}.woff') }}') format('woff');
  font-display: swap;
}`;
        })
        .join('\n\n');

    return fontFaces;
}

function convertFonts() {
    if (!existsSync(FONTS_DIR)) {
        console.log('📁 Creating fonts directory...');
        mkdirSync(FONTS_DIR, { recursive: true });
        console.log('Put your .ttf or .otf files in resources/fonts/ directory');
        return;
    }

    if (!existsSync(OUTPUT_DIR)) {
        mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const fontFiles = findFontFiles(FONTS_DIR);

    if (fontFiles.length === 0) {
        console.log('No font files found in resources/fonts/ (including subdirectories)');
        return;
    }

    console.log(`🔤 Converting ${fontFiles.length} font(s)...`);
    console.log('Found fonts:', fontFiles.map((f) => basename(f)));

    const convertedFonts = fontFiles.map((file) => {
        return convertFont(file, OUTPUT_DIR, FONTS_DIR);
    });

    const successfulConversions = convertedFonts.filter(Boolean);

    if (successfulConversions.length > 0) {
        const cssContent = generateFontCSS(successfulConversions);

        if (!existsSync(dirname(CSS_OUTPUT))) {
            mkdirSync(dirname(CSS_OUTPUT), { recursive: true });
        }

        writeFileSync(CSS_OUTPUT, cssContent);
        console.log(`✅ Generated ${CSS_OUTPUT}`);
    }

    console.log(`🎉 Font conversion completed! Converted ${successfulConversions.length} fonts`);
    console.log('💡 Don\'t forget to import _fonts.scss in your main SCSS file');
}

convertFonts();
