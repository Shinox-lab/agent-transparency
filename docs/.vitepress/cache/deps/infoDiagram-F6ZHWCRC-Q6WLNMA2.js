import {
  parse
} from "./chunk-JLOAJATN.js";
import "./chunk-65GTMUT2.js";
import "./chunk-SACRD6EF.js";
import "./chunk-D46OX37P.js";
import "./chunk-EFRYGW6E.js";
import "./chunk-DCTEG7EB.js";
import "./chunk-7XEZWDXQ.js";
import "./chunk-TE6JWOZZ.js";
import "./chunk-5XXD5M2Q.js";
import "./chunk-2W5RAYJ4.js";
import {
  package_default
} from "./chunk-L67PKS2F.js";
import {
  selectSvgElement
} from "./chunk-6TQE3MXD.js";
import {
  configureSvgSize
} from "./chunk-NIOAHNRB.js";
import {
  __name,
  log
} from "./chunk-GEMGWCGB.js";
import "./chunk-PB2W6OCC.js";
import "./chunk-5K2JB5YL.js";
import "./chunk-IKZWERSR.js";

// node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-F6ZHWCRC.mjs
var parser = {
  parse: __name(async (input) => {
    const ast = await parse("info", input);
    log.debug(ast);
  }, "parse")
};
var DEFAULT_INFO_DB = {
  version: package_default.version + (true ? "" : "-tiny")
};
var getVersion = __name(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion
};
var draw = __name((text, id, version) => {
  log.debug("rendering info diagram\n" + text);
  const svg = selectSvgElement(id);
  configureSvgSize(svg, 100, 400, true);
  const group = svg.append("g");
  group.append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
}, "draw");
var renderer = { draw };
var diagram = {
  parser,
  db,
  renderer
};
export {
  diagram
};
//# sourceMappingURL=infoDiagram-F6ZHWCRC-Q6WLNMA2.js.map
