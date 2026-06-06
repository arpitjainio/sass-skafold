const ts = require('typescript');

module.exports = {
  process(sourceText, sourcePath) {
    if (!sourcePath.endsWith('.ts') && !sourcePath.endsWith('.tsx')) {
      return { code: sourceText };
    }

    const { outputText } = ts.transpileModule(sourceText, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2021,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        esModuleInterop: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        sourceMap: true,
        inlineSourceMap: true,
        inlineSources: true,
      },
      fileName: sourcePath,
    });

    return { code: outputText };
  },
};
