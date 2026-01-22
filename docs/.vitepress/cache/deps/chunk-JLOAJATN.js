import {
  __name
} from "./chunk-5XXD5M2Q.js";

// node_modules/@mermaid-js/parser/dist/mermaid-parser.core.mjs
var parsers = {};
var initializers = {
  info: __name(async () => {
    const { createInfoServices: createInfoServices2 } = await import("./info-63CPKGFF-JAVJQH3W.js");
    const parser = createInfoServices2().Info.parser.LangiumParser;
    parsers.info = parser;
  }, "info"),
  packet: __name(async () => {
    const { createPacketServices: createPacketServices2 } = await import("./packet-HUATNLJX-FFBSSZML.js");
    const parser = createPacketServices2().Packet.parser.LangiumParser;
    parsers.packet = parser;
  }, "packet"),
  pie: __name(async () => {
    const { createPieServices: createPieServices2 } = await import("./pie-WTHONI2E-APSOFQFO.js");
    const parser = createPieServices2().Pie.parser.LangiumParser;
    parsers.pie = parser;
  }, "pie"),
  architecture: __name(async () => {
    const { createArchitectureServices: createArchitectureServices2 } = await import("./architecture-O4VJ6CD3-A3MRYCHM.js");
    const parser = createArchitectureServices2().Architecture.parser.LangiumParser;
    parsers.architecture = parser;
  }, "architecture"),
  gitGraph: __name(async () => {
    const { createGitGraphServices: createGitGraphServices2 } = await import("./gitGraph-ZV4HHKMB-34NLEMBO.js");
    const parser = createGitGraphServices2().GitGraph.parser.LangiumParser;
    parsers.gitGraph = parser;
  }, "gitGraph"),
  radar: __name(async () => {
    const { createRadarServices: createRadarServices2 } = await import("./radar-NJJJXTRR-ZOZKKRQG.js");
    const parser = createRadarServices2().Radar.parser.LangiumParser;
    parsers.radar = parser;
  }, "radar"),
  treemap: __name(async () => {
    const { createTreemapServices: createTreemapServices2 } = await import("./treemap-75Q7IDZK-WZCMVOMC.js");
    const parser = createTreemapServices2().Treemap.parser.LangiumParser;
    parsers.treemap = parser;
  }, "treemap")
};
async function parse(diagramType, text) {
  const initializer = initializers[diagramType];
  if (!initializer) {
    throw new Error(`Unknown diagram type: ${diagramType}`);
  }
  if (!parsers[diagramType]) {
    await initializer();
  }
  const parser = parsers[diagramType];
  const result = parser.parse(text);
  if (result.lexerErrors.length > 0 || result.parserErrors.length > 0) {
    throw new MermaidParseError(result);
  }
  return result.value;
}
__name(parse, "parse");
var _a;
var MermaidParseError = (_a = class extends Error {
  constructor(result) {
    const lexerErrors = result.lexerErrors.map((err) => err.message).join("\n");
    const parserErrors = result.parserErrors.map((err) => err.message).join("\n");
    super(`Parsing failed: ${lexerErrors} ${parserErrors}`);
    this.result = result;
  }
}, __name(_a, "MermaidParseError"), _a);

export {
  parse
};
//# sourceMappingURL=chunk-JLOAJATN.js.map
