// opentype.js 2 ships no types. These cover the parts scripts/build-font.ts uses.
// Node loads its CommonJS build, so everything hangs off the default export.
declare module "opentype.js" {
  namespace opentype {
    class Path {
      moveTo(x: number, y: number): void;
      lineTo(x: number, y: number): void;
      quadraticCurveTo(x1: number, y1: number, x: number, y: number): void;
      curveTo(x1: number, y1: number, x2: number, y2: number, x: number, y: number): void;
      close(): void;
    }

    class Glyph {
      constructor(options: { name: string; unicode?: number; advanceWidth: number; path: Path });
      name: string;
      unicode?: number;
    }

    class Font {
      constructor(options: {
        familyName: string;
        styleName: string;
        unitsPerEm: number;
        ascender: number;
        descender: number;
        glyphs: Glyph[];
        version?: string;
        copyright?: string;
        license?: string;
        licenseURL?: string;
        manufacturerURL?: string;
        description?: string;
      });
      glyphs: { length: number; get(index: number): Glyph };
      toArrayBuffer(): ArrayBuffer;
    }

    function parse(buffer: ArrayBuffer): Font;
  }
  export default opentype;
}
