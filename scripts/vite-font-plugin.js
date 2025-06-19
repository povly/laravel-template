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

const require = createRequire(import.meta.url);
const ttf2woff2 = require('ttf2woff2');

export function fontConversionPlugin(options = {}) {
  const {
    fontsDir = 'resources/fonts',
    outputDir = 'public/fonts',
    generateCSS = true,
    cssOutput = 'resources/scss/common/_fonts.scss'
  } = options;

  return {
    name: 'font-conversion',
    buildStart() {
      if (existsSync(fontsDir)) {
        console.log('🔤 Converting fonts...');
        convertFonts(fontsDir, outputDir, generateCSS, cssOutput);
      }
    }
  };
}

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
    const fontBuffer = readFileSync(inputPath);

    // WOFF2
    const woff2Output = resolve(outputDir, `${fileName}.woff2`);
    const woff2 = ttf2woff2(fontBuffer);
    writeFileSync(woff2Output, Buffer.from(woff2));

    // WOFF
    const woffOutput = resolve(outputDir, `${fileName}.woff`);
    const woff = ttf2woff(fontBuffer).buffer;
    writeFileSync(woffOutput, Buffer.from(woff));

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
  src: url('../../public/fonts/${font.path}.woff2') format('woff2'),
       url('../../public/fonts/${font.path}.woff') format('woff');
  font-display: swap;
}`;
    })
    .join('\n\n');

  return fontFaces;
}

function convertFonts(fontsDir, outputDir, generateCSS, cssOutput) {
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const fontFiles = findFontFiles(fontsDir);

  if (fontFiles.length === 0) {
    return;
  }

  const convertedFonts = fontFiles.map((file) => {
    return convertFont(file, outputDir, fontsDir);
  });

  if (generateCSS && convertedFonts.some(Boolean)) {
    const cssContent = generateFontCSS(convertedFonts);

    if (!existsSync(dirname(cssOutput))) {
      mkdirSync(dirname(cssOutput), { recursive: true });
    }

    writeFileSync(cssOutput, cssContent);
    console.log(`✅ Generated ${cssOutput}`);
  }

  console.log(`🎉 Converted ${convertedFonts.filter(Boolean).length} fonts`);
}
