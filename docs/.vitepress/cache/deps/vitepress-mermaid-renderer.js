import {
  package_default
} from "./chunk-L67PKS2F.js";
import {
  selectSvgElement
} from "./chunk-6TQE3MXD.js";
import {
  JSON_SCHEMA,
  load
} from "./chunk-SDAUHHIX.js";
import {
  registerLayoutLoaders
} from "./chunk-HK5GD4M7.js";
import "./chunk-XUIZND2N.js";
import "./chunk-7DTN2HVP.js";
import "./chunk-QZVYVOOR.js";
import "./chunk-ANECZFI3.js";
import "./chunk-YTGF5QB3.js";
import {
  dedent,
  registerIconPacks
} from "./chunk-DLKBKS3L.js";
import {
  cleanAndMerge,
  decodeEntities,
  encodeEntities,
  isDetailedError,
  removeDirectives,
  utils_default
} from "./chunk-W7OBELAF.js";
import "./chunk-WJGEDWIZ.js";
import {
  UnknownDiagramError,
  addDirective,
  assignWithDepth_default,
  configureSvgSize,
  defaultConfig,
  detectType,
  detectors,
  evaluate,
  frontMatterRegex,
  getConfig,
  getDiagram,
  getDiagramLoader,
  getSiteConfig,
  purify,
  registerDiagram,
  registerLazyLoadedDiagrams,
  reset,
  saveConfigFromInitialize,
  setConfig,
  setSiteConfig,
  styles_default,
  themes_default,
  updateSiteConfig
} from "./chunk-NIOAHNRB.js";
import {
  __name,
  log,
  select_default,
  setLogLevel
} from "./chunk-GEMGWCGB.js";
import {
  isEmpty_default
} from "./chunk-PB2W6OCC.js";
import "./chunk-5K2JB5YL.js";
import {
  createApp,
  createBaseVNode,
  createCommentVNode,
  createElementBlock,
  createStaticVNode,
  createVNode,
  defineComponent,
  h,
  nextTick,
  normalizeStyle,
  onMounted,
  onUnmounted,
  openBlock,
  ref,
  toDisplayString,
  unref,
  withModifiers
} from "./chunk-ZZEIC257.js";
import "./chunk-IKZWERSR.js";

// node_modules/stylis/src/Enum.js
var COMMENT = "comm";
var RULESET = "rule";
var DECLARATION = "decl";
var IMPORT = "@import";
var NAMESPACE = "@namespace";
var KEYFRAMES = "@keyframes";
var LAYER = "@layer";

// node_modules/stylis/src/Utility.js
var abs = Math.abs;
var from = String.fromCharCode;
function trim(value) {
  return value.trim();
}
function replace(value, pattern, replacement) {
  return value.replace(pattern, replacement);
}
function indexof(value, search, position2) {
  return value.indexOf(search, position2);
}
function charat(value, index) {
  return value.charCodeAt(index) | 0;
}
function substr(value, begin, end) {
  return value.slice(begin, end);
}
function strlen(value) {
  return value.length;
}
function sizeof(value) {
  return value.length;
}
function append(value, array) {
  return array.push(value), value;
}

// node_modules/stylis/src/Tokenizer.js
var line = 1;
var column = 1;
var length = 0;
var position = 0;
var character = 0;
var characters = "";
function node(value, root, parent, type, props, children, length2, siblings) {
  return { value, root, parent, type, props, children, line, column, length: length2, return: "", siblings };
}
function char() {
  return character;
}
function prev() {
  character = position > 0 ? charat(characters, --position) : 0;
  if (column--, character === 10)
    column = 1, line--;
  return character;
}
function next() {
  character = position < length ? charat(characters, position++) : 0;
  if (column++, character === 10)
    column = 1, line++;
  return character;
}
function peek() {
  return charat(characters, position);
}
function caret() {
  return position;
}
function slice(begin, end) {
  return substr(characters, begin, end);
}
function token(type) {
  switch (type) {
    // \0 \t \n \r \s whitespace token
    case 0:
    case 9:
    case 10:
    case 13:
    case 32:
      return 5;
    // ! + , / > @ ~ isolate token
    case 33:
    case 43:
    case 44:
    case 47:
    case 62:
    case 64:
    case 126:
    // ; { } breakpoint token
    case 59:
    case 123:
    case 125:
      return 4;
    // : accompanied token
    case 58:
      return 3;
    // " ' ( [ opening delimit token
    case 34:
    case 39:
    case 40:
    case 91:
      return 2;
    // ) ] closing delimit token
    case 41:
    case 93:
      return 1;
  }
  return 0;
}
function alloc(value) {
  return line = column = 1, length = strlen(characters = value), position = 0, [];
}
function dealloc(value) {
  return characters = "", value;
}
function delimit(type) {
  return trim(slice(position - 1, delimiter(type === 91 ? type + 2 : type === 40 ? type + 1 : type)));
}
function whitespace(type) {
  while (character = peek())
    if (character < 33)
      next();
    else
      break;
  return token(type) > 2 || token(character) > 3 ? "" : " ";
}
function escaping(index, count) {
  while (--count && next())
    if (character < 48 || character > 102 || character > 57 && character < 65 || character > 70 && character < 97)
      break;
  return slice(index, caret() + (count < 6 && peek() == 32 && next() == 32));
}
function delimiter(type) {
  while (next())
    switch (character) {
      // ] ) " '
      case type:
        return position;
      // " '
      case 34:
      case 39:
        if (type !== 34 && type !== 39)
          delimiter(character);
        break;
      // (
      case 40:
        if (type === 41)
          delimiter(type);
        break;
      // \
      case 92:
        next();
        break;
    }
  return position;
}
function commenter(type, index) {
  while (next())
    if (type + character === 47 + 10)
      break;
    else if (type + character === 42 + 42 && peek() === 47)
      break;
  return "/*" + slice(index, position - 1) + "*" + from(type === 47 ? type : next());
}
function identifier(index) {
  while (!token(peek()))
    next();
  return slice(index, position);
}

// node_modules/stylis/src/Parser.js
function compile(value) {
  return dealloc(parse("", null, null, null, [""], value = alloc(value), 0, [0], value));
}
function parse(value, root, parent, rule, rules, rulesets, pseudo, points, declarations) {
  var index = 0;
  var offset = 0;
  var length2 = pseudo;
  var atrule = 0;
  var property = 0;
  var previous = 0;
  var variable = 1;
  var scanning = 1;
  var ampersand = 1;
  var character2 = 0;
  var type = "";
  var props = rules;
  var children = rulesets;
  var reference = rule;
  var characters2 = type;
  while (scanning)
    switch (previous = character2, character2 = next()) {
      // (
      case 40:
        if (previous != 108 && charat(characters2, length2 - 1) == 58) {
          if (indexof(characters2 += replace(delimit(character2), "&", "&\f"), "&\f", abs(index ? points[index - 1] : 0)) != -1)
            ampersand = -1;
          break;
        }
      // " ' [
      case 34:
      case 39:
      case 91:
        characters2 += delimit(character2);
        break;
      // \t \n \r \s
      case 9:
      case 10:
      case 13:
      case 32:
        characters2 += whitespace(previous);
        break;
      // \
      case 92:
        characters2 += escaping(caret() - 1, 7);
        continue;
      // /
      case 47:
        switch (peek()) {
          case 42:
          case 47:
            append(comment(commenter(next(), caret()), root, parent, declarations), declarations);
            if ((token(previous || 1) == 5 || token(peek() || 1) == 5) && strlen(characters2) && substr(characters2, -1, void 0) !== " ") characters2 += " ";
            break;
          default:
            characters2 += "/";
        }
        break;
      // {
      case 123 * variable:
        points[index++] = strlen(characters2) * ampersand;
      // } ; \0
      case 125 * variable:
      case 59:
      case 0:
        switch (character2) {
          // \0 }
          case 0:
          case 125:
            scanning = 0;
          // ;
          case 59 + offset:
            if (ampersand == -1) characters2 = replace(characters2, /\f/g, "");
            if (property > 0 && (strlen(characters2) - length2 || variable === 0 && previous === 47))
              append(property > 32 ? declaration(characters2 + ";", rule, parent, length2 - 1, declarations) : declaration(replace(characters2, " ", "") + ";", rule, parent, length2 - 2, declarations), declarations);
            break;
          // @ ;
          case 59:
            characters2 += ";";
          // { rule/at-rule
          default:
            append(reference = ruleset(characters2, root, parent, index, offset, rules, points, type, props = [], children = [], length2, rulesets), rulesets);
            if (character2 === 123)
              if (offset === 0)
                parse(characters2, root, reference, reference, props, rulesets, length2, points, children);
              else {
                switch (atrule) {
                  // c(ontainer)
                  case 99:
                    if (charat(characters2, 3) === 110) break;
                  // l(ayer)
                  case 108:
                    if (charat(characters2, 2) === 97) break;
                  default:
                    offset = 0;
                  // d(ocument) m(edia) s(upports)
                  case 100:
                  case 109:
                  case 115:
                }
                if (offset) parse(value, reference, reference, rule && append(ruleset(value, reference, reference, 0, 0, rules, points, type, rules, props = [], length2, children), children), rules, children, length2, points, rule ? props : children);
                else parse(characters2, reference, reference, reference, [""], children, 0, points, children);
              }
        }
        index = offset = property = 0, variable = ampersand = 1, type = characters2 = "", length2 = pseudo;
        break;
      // :
      case 58:
        length2 = 1 + strlen(characters2), property = previous;
      default:
        if (variable < 1) {
          if (character2 == 123)
            --variable;
          else if (character2 == 125 && variable++ == 0 && prev() == 125)
            continue;
        }
        switch (characters2 += from(character2), character2 * variable) {
          // &
          case 38:
            ampersand = offset > 0 ? 1 : (characters2 += "\f", -1);
            break;
          // ,
          case 44:
            points[index++] = (strlen(characters2) - 1) * ampersand, ampersand = 1;
            break;
          // @
          case 64:
            if (peek() === 45)
              characters2 += delimit(next());
            atrule = peek(), offset = length2 = strlen(type = characters2 += identifier(caret())), character2++;
            break;
          // -
          case 45:
            if (previous === 45 && strlen(characters2) == 2)
              variable = 0;
        }
    }
  return rulesets;
}
function ruleset(value, root, parent, index, offset, rules, points, type, props, children, length2, siblings) {
  var post = offset - 1;
  var rule = offset === 0 ? rules : [""];
  var size = sizeof(rule);
  for (var i = 0, j = 0, k = 0; i < index; ++i)
    for (var x = 0, y = substr(value, post + 1, post = abs(j = points[i])), z = value; x < size; ++x)
      if (z = trim(j > 0 ? rule[x] + " " + y : replace(y, /&\f/g, rule[x])))
        props[k++] = z;
  return node(value, root, parent, offset === 0 ? RULESET : type, props, children, length2, siblings);
}
function comment(value, root, parent, siblings) {
  return node(value, root, parent, COMMENT, from(char()), substr(value, 2, -2), 0, siblings);
}
function declaration(value, root, parent, length2, siblings) {
  return node(value, root, parent, DECLARATION, substr(value, 0, length2), substr(value, length2 + 1, -1), length2, siblings);
}

// node_modules/stylis/src/Serializer.js
function serialize(children, callback) {
  var output = "";
  for (var i = 0; i < children.length; i++)
    output += callback(children[i], i, children, callback) || "";
  return output;
}
function stringify(element, index, children, callback) {
  switch (element.type) {
    case LAYER:
      if (element.children.length) break;
    case IMPORT:
    case NAMESPACE:
    case DECLARATION:
      return element.return = element.return || element.value;
    case COMMENT:
      return "";
    case KEYFRAMES:
      return element.return = element.value + "{" + serialize(element.children, callback) + "}";
    case RULESET:
      if (!strlen(element.value = element.props.join(","))) return "";
  }
  return strlen(children = serialize(element.children, callback)) ? element.return = element.value + "{" + children + "}" : "";
}

// node_modules/mermaid/dist/mermaid.core.mjs
var id = "c4";
var detector = __name((txt) => {
  return /^\s*C4Context|C4Container|C4Component|C4Dynamic|C4Deployment/.test(txt);
}, "detector");
var loader = __name(async () => {
  const { diagram: diagram2 } = await import("./c4Diagram-YG6GDRKO-Y2IUET4R.js");
  return { id, diagram: diagram2 };
}, "loader");
var plugin = {
  id,
  detector,
  loader
};
var c4Detector_default = plugin;
var id2 = "flowchart";
var detector2 = __name((txt, config) => {
  if (config?.flowchart?.defaultRenderer === "dagre-wrapper" || config?.flowchart?.defaultRenderer === "elk") {
    return false;
  }
  return /^\s*graph/.test(txt);
}, "detector");
var loader2 = __name(async () => {
  const { diagram: diagram2 } = await import("./flowDiagram-NV44I4VS-UYL6OEII.js");
  return { id: id2, diagram: diagram2 };
}, "loader");
var plugin2 = {
  id: id2,
  detector: detector2,
  loader: loader2
};
var flowDetector_default = plugin2;
var id3 = "flowchart-v2";
var detector3 = __name((txt, config) => {
  if (config?.flowchart?.defaultRenderer === "dagre-d3") {
    return false;
  }
  if (config?.flowchart?.defaultRenderer === "elk") {
    config.layout = "elk";
  }
  if (/^\s*graph/.test(txt) && config?.flowchart?.defaultRenderer === "dagre-wrapper") {
    return true;
  }
  return /^\s*flowchart/.test(txt);
}, "detector");
var loader3 = __name(async () => {
  const { diagram: diagram2 } = await import("./flowDiagram-NV44I4VS-UYL6OEII.js");
  return { id: id3, diagram: diagram2 };
}, "loader");
var plugin3 = {
  id: id3,
  detector: detector3,
  loader: loader3
};
var flowDetector_v2_default = plugin3;
var id4 = "er";
var detector4 = __name((txt) => {
  return /^\s*erDiagram/.test(txt);
}, "detector");
var loader4 = __name(async () => {
  const { diagram: diagram2 } = await import("./erDiagram-Q2GNP2WA-LRCUJ25T.js");
  return { id: id4, diagram: diagram2 };
}, "loader");
var plugin4 = {
  id: id4,
  detector: detector4,
  loader: loader4
};
var erDetector_default = plugin4;
var id5 = "gitGraph";
var detector5 = __name((txt) => {
  return /^\s*gitGraph/.test(txt);
}, "detector");
var loader5 = __name(async () => {
  const { diagram: diagram2 } = await import("./gitGraphDiagram-NY62KEGX-XPMRVQEO.js");
  return { id: id5, diagram: diagram2 };
}, "loader");
var plugin5 = {
  id: id5,
  detector: detector5,
  loader: loader5
};
var gitGraphDetector_default = plugin5;
var id6 = "gantt";
var detector6 = __name((txt) => {
  return /^\s*gantt/.test(txt);
}, "detector");
var loader6 = __name(async () => {
  const { diagram: diagram2 } = await import("./ganttDiagram-LVOFAZNH-NJ254ZF3.js");
  return { id: id6, diagram: diagram2 };
}, "loader");
var plugin6 = {
  id: id6,
  detector: detector6,
  loader: loader6
};
var ganttDetector_default = plugin6;
var id7 = "info";
var detector7 = __name((txt) => {
  return /^\s*info/.test(txt);
}, "detector");
var loader7 = __name(async () => {
  const { diagram: diagram2 } = await import("./infoDiagram-F6ZHWCRC-Q6WLNMA2.js");
  return { id: id7, diagram: diagram2 };
}, "loader");
var info = {
  id: id7,
  detector: detector7,
  loader: loader7
};
var id8 = "pie";
var detector8 = __name((txt) => {
  return /^\s*pie/.test(txt);
}, "detector");
var loader8 = __name(async () => {
  const { diagram: diagram2 } = await import("./pieDiagram-ADFJNKIX-ARESEOJW.js");
  return { id: id8, diagram: diagram2 };
}, "loader");
var pie = {
  id: id8,
  detector: detector8,
  loader: loader8
};
var id9 = "quadrantChart";
var detector9 = __name((txt) => {
  return /^\s*quadrantChart/.test(txt);
}, "detector");
var loader9 = __name(async () => {
  const { diagram: diagram2 } = await import("./quadrantDiagram-AYHSOK5B-WFXNUBVP.js");
  return { id: id9, diagram: diagram2 };
}, "loader");
var plugin7 = {
  id: id9,
  detector: detector9,
  loader: loader9
};
var quadrantDetector_default = plugin7;
var id10 = "xychart";
var detector10 = __name((txt) => {
  return /^\s*xychart(-beta)?/.test(txt);
}, "detector");
var loader10 = __name(async () => {
  const { diagram: diagram2 } = await import("./xychartDiagram-PRI3JC2R-WJPOAPHN.js");
  return { id: id10, diagram: diagram2 };
}, "loader");
var plugin8 = {
  id: id10,
  detector: detector10,
  loader: loader10
};
var xychartDetector_default = plugin8;
var id11 = "requirement";
var detector11 = __name((txt) => {
  return /^\s*requirement(Diagram)?/.test(txt);
}, "detector");
var loader11 = __name(async () => {
  const { diagram: diagram2 } = await import("./requirementDiagram-UZGBJVZJ-3PAWSTX3.js");
  return { id: id11, diagram: diagram2 };
}, "loader");
var plugin9 = {
  id: id11,
  detector: detector11,
  loader: loader11
};
var requirementDetector_default = plugin9;
var id12 = "sequence";
var detector12 = __name((txt) => {
  return /^\s*sequenceDiagram/.test(txt);
}, "detector");
var loader12 = __name(async () => {
  const { diagram: diagram2 } = await import("./sequenceDiagram-WL72ISMW-LA3GP2WY.js");
  return { id: id12, diagram: diagram2 };
}, "loader");
var plugin10 = {
  id: id12,
  detector: detector12,
  loader: loader12
};
var sequenceDetector_default = plugin10;
var id13 = "class";
var detector13 = __name((txt, config) => {
  if (config?.class?.defaultRenderer === "dagre-wrapper") {
    return false;
  }
  return /^\s*classDiagram/.test(txt);
}, "detector");
var loader13 = __name(async () => {
  const { diagram: diagram2 } = await import("./classDiagram-2ON5EDUG-3FNANBHV.js");
  return { id: id13, diagram: diagram2 };
}, "loader");
var plugin11 = {
  id: id13,
  detector: detector13,
  loader: loader13
};
var classDetector_default = plugin11;
var id14 = "classDiagram";
var detector14 = __name((txt, config) => {
  if (/^\s*classDiagram/.test(txt) && config?.class?.defaultRenderer === "dagre-wrapper") {
    return true;
  }
  return /^\s*classDiagram-v2/.test(txt);
}, "detector");
var loader14 = __name(async () => {
  const { diagram: diagram2 } = await import("./classDiagram-v2-WZHVMYZB-XRRI2TO3.js");
  return { id: id14, diagram: diagram2 };
}, "loader");
var plugin12 = {
  id: id14,
  detector: detector14,
  loader: loader14
};
var classDetector_V2_default = plugin12;
var id15 = "state";
var detector15 = __name((txt, config) => {
  if (config?.state?.defaultRenderer === "dagre-wrapper") {
    return false;
  }
  return /^\s*stateDiagram/.test(txt);
}, "detector");
var loader15 = __name(async () => {
  const { diagram: diagram2 } = await import("./stateDiagram-FKZM4ZOC-HYYQSB45.js");
  return { id: id15, diagram: diagram2 };
}, "loader");
var plugin13 = {
  id: id15,
  detector: detector15,
  loader: loader15
};
var stateDetector_default = plugin13;
var id16 = "stateDiagram";
var detector16 = __name((txt, config) => {
  if (/^\s*stateDiagram-v2/.test(txt)) {
    return true;
  }
  if (/^\s*stateDiagram/.test(txt) && config?.state?.defaultRenderer === "dagre-wrapper") {
    return true;
  }
  return false;
}, "detector");
var loader16 = __name(async () => {
  const { diagram: diagram2 } = await import("./stateDiagram-v2-4FDKWEC3-C3OBSV2R.js");
  return { id: id16, diagram: diagram2 };
}, "loader");
var plugin14 = {
  id: id16,
  detector: detector16,
  loader: loader16
};
var stateDetector_V2_default = plugin14;
var id17 = "journey";
var detector17 = __name((txt) => {
  return /^\s*journey/.test(txt);
}, "detector");
var loader17 = __name(async () => {
  const { diagram: diagram2 } = await import("./journeyDiagram-XKPGCS4Q-V6IFO5NJ.js");
  return { id: id17, diagram: diagram2 };
}, "loader");
var plugin15 = {
  id: id17,
  detector: detector17,
  loader: loader17
};
var journeyDetector_default = plugin15;
var draw = __name((_text, id28, version) => {
  log.debug("rendering svg for syntax error\n");
  const svg = selectSvgElement(id28);
  const g = svg.append("g");
  svg.attr("viewBox", "0 0 2412 512");
  configureSvgSize(svg, 100, 512, true);
  g.append("path").attr("class", "error-icon").attr(
    "d",
    "m411.313,123.313c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32-9.375,9.375-20.688-20.688c-12.484-12.5-32.766-12.5-45.25,0l-16,16c-1.261,1.261-2.304,2.648-3.31,4.051-21.739-8.561-45.324-13.426-70.065-13.426-105.867,0-192,86.133-192,192s86.133,192 192,192 192-86.133 192-192c0-24.741-4.864-48.327-13.426-70.065 1.402-1.007 2.79-2.049 4.051-3.31l16-16c12.5-12.492 12.5-32.758 0-45.25l-20.688-20.688 9.375-9.375 32.001-31.999zm-219.313,100.687c-52.938,0-96,43.063-96,96 0,8.836-7.164,16-16,16s-16-7.164-16-16c0-70.578 57.422-128 128-128 8.836,0 16,7.164 16,16s-7.164,16-16,16z"
  );
  g.append("path").attr("class", "error-icon").attr(
    "d",
    "m459.02,148.98c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l16,16c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16.001-16z"
  );
  g.append("path").attr("class", "error-icon").attr(
    "d",
    "m340.395,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16-16c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l15.999,16z"
  );
  g.append("path").attr("class", "error-icon").attr(
    "d",
    "m400,64c8.844,0 16-7.164 16-16v-32c0-8.836-7.156-16-16-16-8.844,0-16,7.164-16,16v32c0,8.836 7.156,16 16,16z"
  );
  g.append("path").attr("class", "error-icon").attr(
    "d",
    "m496,96.586h-32c-8.844,0-16,7.164-16,16 0,8.836 7.156,16 16,16h32c8.844,0 16-7.164 16-16 0-8.836-7.156-16-16-16z"
  );
  g.append("path").attr("class", "error-icon").attr(
    "d",
    "m436.98,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688l32-32c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32c-6.251,6.25-6.251,16.375-0.001,22.625z"
  );
  g.append("text").attr("class", "error-text").attr("x", 1440).attr("y", 250).attr("font-size", "150px").style("text-anchor", "middle").text("Syntax error in text");
  g.append("text").attr("class", "error-text").attr("x", 1250).attr("y", 400).attr("font-size", "100px").style("text-anchor", "middle").text(`mermaid version ${version}`);
}, "draw");
var renderer = { draw };
var errorRenderer_default = renderer;
var diagram = {
  db: {},
  renderer,
  parser: {
    parse: __name(() => {
      return;
    }, "parse")
  }
};
var errorDiagram_default = diagram;
var id18 = "flowchart-elk";
var detector18 = __name((txt, config = {}) => {
  if (
    // If diagram explicitly states flowchart-elk
    /^\s*flowchart-elk/.test(txt) || // If a flowchart/graph diagram has their default renderer set to elk
    /^\s*(flowchart|graph)/.test(txt) && config?.flowchart?.defaultRenderer === "elk"
  ) {
    config.layout = "elk";
    return true;
  }
  return false;
}, "detector");
var loader18 = __name(async () => {
  const { diagram: diagram2 } = await import("./flowDiagram-NV44I4VS-UYL6OEII.js");
  return { id: id18, diagram: diagram2 };
}, "loader");
var plugin16 = {
  id: id18,
  detector: detector18,
  loader: loader18
};
var detector_default = plugin16;
var id19 = "timeline";
var detector19 = __name((txt) => {
  return /^\s*timeline/.test(txt);
}, "detector");
var loader19 = __name(async () => {
  const { diagram: diagram2 } = await import("./timeline-definition-IT6M3QCI-KMEJB5VW.js");
  return { id: id19, diagram: diagram2 };
}, "loader");
var plugin17 = {
  id: id19,
  detector: detector19,
  loader: loader19
};
var detector_default2 = plugin17;
var id20 = "mindmap";
var detector20 = __name((txt) => {
  return /^\s*mindmap/.test(txt);
}, "detector");
var loader20 = __name(async () => {
  const { diagram: diagram2 } = await import("./mindmap-definition-VGOIOE7T-HSMP74KG.js");
  return { id: id20, diagram: diagram2 };
}, "loader");
var plugin18 = {
  id: id20,
  detector: detector20,
  loader: loader20
};
var detector_default3 = plugin18;
var id21 = "kanban";
var detector21 = __name((txt) => {
  return /^\s*kanban/.test(txt);
}, "detector");
var loader21 = __name(async () => {
  const { diagram: diagram2 } = await import("./kanban-definition-3W4ZIXB7-UHJYRJSX.js");
  return { id: id21, diagram: diagram2 };
}, "loader");
var plugin19 = {
  id: id21,
  detector: detector21,
  loader: loader21
};
var detector_default4 = plugin19;
var id22 = "sankey";
var detector22 = __name((txt) => {
  return /^\s*sankey(-beta)?/.test(txt);
}, "detector");
var loader22 = __name(async () => {
  const { diagram: diagram2 } = await import("./sankeyDiagram-TZEHDZUN-7DWZB7JF.js");
  return { id: id22, diagram: diagram2 };
}, "loader");
var plugin20 = {
  id: id22,
  detector: detector22,
  loader: loader22
};
var sankeyDetector_default = plugin20;
var id23 = "packet";
var detector23 = __name((txt) => {
  return /^\s*packet(-beta)?/.test(txt);
}, "detector");
var loader23 = __name(async () => {
  const { diagram: diagram2 } = await import("./diagram-S2PKOQOG-5B4H6OCR.js");
  return { id: id23, diagram: diagram2 };
}, "loader");
var packet = {
  id: id23,
  detector: detector23,
  loader: loader23
};
var id24 = "radar";
var detector24 = __name((txt) => {
  return /^\s*radar-beta/.test(txt);
}, "detector");
var loader24 = __name(async () => {
  const { diagram: diagram2 } = await import("./diagram-QEK2KX5R-6MY3HJIG.js");
  return { id: id24, diagram: diagram2 };
}, "loader");
var radar = {
  id: id24,
  detector: detector24,
  loader: loader24
};
var id25 = "block";
var detector25 = __name((txt) => {
  return /^\s*block(-beta)?/.test(txt);
}, "detector");
var loader25 = __name(async () => {
  const { diagram: diagram2 } = await import("./blockDiagram-VD42YOAC-HIXOJJAE.js");
  return { id: id25, diagram: diagram2 };
}, "loader");
var plugin21 = {
  id: id25,
  detector: detector25,
  loader: loader25
};
var blockDetector_default = plugin21;
var id26 = "architecture";
var detector26 = __name((txt) => {
  return /^\s*architecture/.test(txt);
}, "detector");
var loader26 = __name(async () => {
  const { diagram: diagram2 } = await import("./architectureDiagram-VXUJARFQ-75PR6O5Y.js");
  return { id: id26, diagram: diagram2 };
}, "loader");
var architecture = {
  id: id26,
  detector: detector26,
  loader: loader26
};
var architectureDetector_default = architecture;
var id27 = "treemap";
var detector27 = __name((txt) => {
  return /^\s*treemap/.test(txt);
}, "detector");
var loader27 = __name(async () => {
  const { diagram: diagram2 } = await import("./diagram-PSM6KHXK-VIBEDCKJ.js");
  return { id: id27, diagram: diagram2 };
}, "loader");
var treemap = {
  id: id27,
  detector: detector27,
  loader: loader27
};
var hasLoadedDiagrams = false;
var addDiagrams = __name(() => {
  if (hasLoadedDiagrams) {
    return;
  }
  hasLoadedDiagrams = true;
  registerDiagram("error", errorDiagram_default, (text) => {
    return text.toLowerCase().trim() === "error";
  });
  registerDiagram(
    "---",
    // --- diagram type may appear if YAML front-matter is not parsed correctly
    {
      db: {
        clear: __name(() => {
        }, "clear")
      },
      styles: {},
      // should never be used
      renderer: {
        draw: __name(() => {
        }, "draw")
      },
      parser: {
        parse: __name(() => {
          throw new Error(
            "Diagrams beginning with --- are not valid. If you were trying to use a YAML front-matter, please ensure that you've correctly opened and closed the YAML front-matter with un-indented `---` blocks"
          );
        }, "parse")
      },
      init: __name(() => null, "init")
      // no op
    },
    (text) => {
      return text.toLowerCase().trimStart().startsWith("---");
    }
  );
  if (true) {
    registerLazyLoadedDiagrams(detector_default, detector_default3, architectureDetector_default);
  }
  registerLazyLoadedDiagrams(
    c4Detector_default,
    detector_default4,
    classDetector_V2_default,
    classDetector_default,
    erDetector_default,
    ganttDetector_default,
    info,
    pie,
    requirementDetector_default,
    sequenceDetector_default,
    flowDetector_v2_default,
    flowDetector_default,
    detector_default2,
    gitGraphDetector_default,
    stateDetector_V2_default,
    stateDetector_default,
    journeyDetector_default,
    quadrantDetector_default,
    sankeyDetector_default,
    packet,
    xychartDetector_default,
    blockDetector_default,
    radar,
    treemap
  );
}, "addDiagrams");
var loadRegisteredDiagrams = __name(async () => {
  log.debug(`Loading registered diagrams`);
  const results = await Promise.allSettled(
    Object.entries(detectors).map(async ([key, { detector: detector28, loader: loader28 }]) => {
      if (!loader28) {
        return;
      }
      try {
        getDiagram(key);
      } catch {
        try {
          const { diagram: diagram2, id: id28 } = await loader28();
          registerDiagram(id28, diagram2, detector28);
        } catch (err) {
          log.error(`Failed to load external diagram with key ${key}. Removing from detectors.`);
          delete detectors[key];
          throw err;
        }
      }
    })
  );
  const failed = results.filter((result) => result.status === "rejected");
  if (failed.length > 0) {
    log.error(`Failed to load ${failed.length} external diagrams`);
    for (const res of failed) {
      log.error(res);
    }
    throw new Error(`Failed to load ${failed.length} external diagrams`);
  }
}, "loadRegisteredDiagrams");
var SVG_ROLE = "graphics-document document";
function setA11yDiagramInfo(svg, diagramType) {
  svg.attr("role", SVG_ROLE);
  if (diagramType !== "") {
    svg.attr("aria-roledescription", diagramType);
  }
}
__name(setA11yDiagramInfo, "setA11yDiagramInfo");
function addSVGa11yTitleDescription(svg, a11yTitle, a11yDesc, baseId) {
  if (svg.insert === void 0) {
    return;
  }
  if (a11yDesc) {
    const descId = `chart-desc-${baseId}`;
    svg.attr("aria-describedby", descId);
    svg.insert("desc", ":first-child").attr("id", descId).text(a11yDesc);
  }
  if (a11yTitle) {
    const titleId = `chart-title-${baseId}`;
    svg.attr("aria-labelledby", titleId);
    svg.insert("title", ":first-child").attr("id", titleId).text(a11yTitle);
  }
}
__name(addSVGa11yTitleDescription, "addSVGa11yTitleDescription");
var _a;
var Diagram = (_a = class {
  constructor(type, text, db, parser, renderer2) {
    this.type = type;
    this.text = text;
    this.db = db;
    this.parser = parser;
    this.renderer = renderer2;
  }
  static async fromText(text, metadata = {}) {
    const config = getConfig();
    const type = detectType(text, config);
    text = encodeEntities(text) + "\n";
    try {
      getDiagram(type);
    } catch {
      const loader28 = getDiagramLoader(type);
      if (!loader28) {
        throw new UnknownDiagramError(`Diagram ${type} not found.`);
      }
      const { id: id28, diagram: diagram2 } = await loader28();
      registerDiagram(id28, diagram2);
    }
    const { db, parser, renderer: renderer2, init: init2 } = getDiagram(type);
    if (parser.parser) {
      parser.parser.yy = db;
    }
    db.clear?.();
    init2?.(config);
    if (metadata.title) {
      db.setDiagramTitle?.(metadata.title);
    }
    await parser.parse(text);
    return new _a(type, text, db, parser, renderer2);
  }
  async render(id28, version) {
    await this.renderer.draw(this.text, id28, version, this);
  }
  getParser() {
    return this.parser;
  }
  getType() {
    return this.type;
  }
}, __name(_a, "Diagram"), _a);
var interactionFunctions = [];
var attachFunctions = __name(() => {
  interactionFunctions.forEach((f) => {
    f();
  });
  interactionFunctions = [];
}, "attachFunctions");
var cleanupComments = __name((text) => {
  return text.replace(/^\s*%%(?!{)[^\n]+\n?/gm, "").trimStart();
}, "cleanupComments");
function extractFrontMatter(text) {
  const matches = text.match(frontMatterRegex);
  if (!matches) {
    return {
      text,
      metadata: {}
    };
  }
  let parsed = load(matches[1], {
    // To support config, we need JSON schema.
    // https://www.yaml.org/spec/1.2/spec.html#id2803231
    schema: JSON_SCHEMA
  }) ?? {};
  parsed = typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  const metadata = {};
  if (parsed.displayMode) {
    metadata.displayMode = parsed.displayMode.toString();
  }
  if (parsed.title) {
    metadata.title = parsed.title.toString();
  }
  if (parsed.config) {
    metadata.config = parsed.config;
  }
  return {
    text: text.slice(matches[0].length),
    metadata
  };
}
__name(extractFrontMatter, "extractFrontMatter");
var cleanupText = __name((code) => {
  return code.replace(/\r\n?/g, "\n").replace(
    /<(\w+)([^>]*)>/g,
    (match2, tag, attributes) => "<" + tag + attributes.replace(/="([^"]*)"/g, "='$1'") + ">"
  );
}, "cleanupText");
var processFrontmatter = __name((code) => {
  const { text, metadata } = extractFrontMatter(code);
  const { displayMode, title, config = {} } = metadata;
  if (displayMode) {
    if (!config.gantt) {
      config.gantt = {};
    }
    config.gantt.displayMode = displayMode;
  }
  return { title, config, text };
}, "processFrontmatter");
var processDirectives = __name((code) => {
  const initDirective = utils_default.detectInit(code) ?? {};
  const wrapDirectives = utils_default.detectDirective(code, "wrap");
  if (Array.isArray(wrapDirectives)) {
    initDirective.wrap = wrapDirectives.some(({ type }) => type === "wrap");
  } else if (wrapDirectives?.type === "wrap") {
    initDirective.wrap = true;
  }
  return {
    text: removeDirectives(code),
    directive: initDirective
  };
}, "processDirectives");
function preprocessDiagram(code) {
  const cleanedCode = cleanupText(code);
  const frontMatterResult = processFrontmatter(cleanedCode);
  const directiveResult = processDirectives(frontMatterResult.text);
  const config = cleanAndMerge(frontMatterResult.config, directiveResult.directive);
  code = cleanupComments(directiveResult.text);
  return {
    code,
    title: frontMatterResult.title,
    config
  };
}
__name(preprocessDiagram, "preprocessDiagram");
function toBase64(str) {
  const utf8Bytes = new TextEncoder().encode(str);
  const utf8Str = Array.from(utf8Bytes, (byte) => String.fromCodePoint(byte)).join("");
  return btoa(utf8Str);
}
__name(toBase64, "toBase64");
var MAX_TEXTLENGTH = 5e4;
var MAX_TEXTLENGTH_EXCEEDED_MSG = "graph TB;a[Maximum text size in diagram exceeded];style a fill:#faa";
var SECURITY_LVL_SANDBOX = "sandbox";
var SECURITY_LVL_LOOSE = "loose";
var XMLNS_SVG_STD = "http://www.w3.org/2000/svg";
var XMLNS_XLINK_STD = "http://www.w3.org/1999/xlink";
var XMLNS_XHTML_STD = "http://www.w3.org/1999/xhtml";
var IFRAME_WIDTH = "100%";
var IFRAME_HEIGHT = "100%";
var IFRAME_STYLES = "border:0;margin:0;";
var IFRAME_BODY_STYLE = "margin:0";
var IFRAME_SANDBOX_OPTS = "allow-top-navigation-by-user-activation allow-popups";
var IFRAME_NOT_SUPPORTED_MSG = 'The "iframe" tag is not supported by your browser.';
var DOMPURIFY_TAGS = ["foreignobject"];
var DOMPURIFY_ATTR = ["dominant-baseline"];
function processAndSetConfigs(text) {
  const processed = preprocessDiagram(text);
  reset();
  addDirective(processed.config ?? {});
  return processed;
}
__name(processAndSetConfigs, "processAndSetConfigs");
async function parse2(text, parseOptions) {
  addDiagrams();
  try {
    const { code, config } = processAndSetConfigs(text);
    const diagram2 = await getDiagramFromText(code);
    return { diagramType: diagram2.type, config };
  } catch (error) {
    if (parseOptions?.suppressErrors) {
      return false;
    }
    throw error;
  }
}
__name(parse2, "parse");
var cssImportantStyles = __name((cssClass, element, cssClasses = []) => {
  return `
.${cssClass} ${element} { ${cssClasses.join(" !important; ")} !important; }`;
}, "cssImportantStyles");
var createCssStyles = __name((config, classDefs = /* @__PURE__ */ new Map()) => {
  let cssStyles = "";
  if (config.themeCSS !== void 0) {
    cssStyles += `
${config.themeCSS}`;
  }
  if (config.fontFamily !== void 0) {
    cssStyles += `
:root { --mermaid-font-family: ${config.fontFamily}}`;
  }
  if (config.altFontFamily !== void 0) {
    cssStyles += `
:root { --mermaid-alt-font-family: ${config.altFontFamily}}`;
  }
  if (classDefs instanceof Map) {
    const htmlLabels = config.htmlLabels ?? config.flowchart?.htmlLabels;
    const cssHtmlElements = ["> *", "span"];
    const cssShapeElements = ["rect", "polygon", "ellipse", "circle", "path"];
    const cssElements = htmlLabels ? cssHtmlElements : cssShapeElements;
    classDefs.forEach((styleClassDef) => {
      if (!isEmpty_default(styleClassDef.styles)) {
        cssElements.forEach((cssElement) => {
          cssStyles += cssImportantStyles(styleClassDef.id, cssElement, styleClassDef.styles);
        });
      }
      if (!isEmpty_default(styleClassDef.textStyles)) {
        cssStyles += cssImportantStyles(
          styleClassDef.id,
          "tspan",
          (styleClassDef?.textStyles || []).map((s) => s.replace("color", "fill"))
        );
      }
    });
  }
  return cssStyles;
}, "createCssStyles");
var createUserStyles = __name((config, graphType, classDefs, svgId) => {
  const userCSSstyles = createCssStyles(config, classDefs);
  const allStyles = styles_default(graphType, userCSSstyles, config.themeVariables);
  return serialize(compile(`${svgId}{${allStyles}}`), stringify);
}, "createUserStyles");
var cleanUpSvgCode = __name((svgCode = "", inSandboxMode, useArrowMarkerUrls) => {
  let cleanedUpSvg = svgCode;
  if (!useArrowMarkerUrls && !inSandboxMode) {
    cleanedUpSvg = cleanedUpSvg.replace(
      /marker-end="url\([\d+./:=?A-Za-z-]*?#/g,
      'marker-end="url(#'
    );
  }
  cleanedUpSvg = decodeEntities(cleanedUpSvg);
  cleanedUpSvg = cleanedUpSvg.replace(/<br>/g, "<br/>");
  return cleanedUpSvg;
}, "cleanUpSvgCode");
var putIntoIFrame = __name((svgCode = "", svgElement) => {
  const height = svgElement?.viewBox?.baseVal?.height ? svgElement.viewBox.baseVal.height + "px" : IFRAME_HEIGHT;
  const base64encodedSrc = toBase64(`<body style="${IFRAME_BODY_STYLE}">${svgCode}</body>`);
  return `<iframe style="width:${IFRAME_WIDTH};height:${height};${IFRAME_STYLES}" src="data:text/html;charset=UTF-8;base64,${base64encodedSrc}" sandbox="${IFRAME_SANDBOX_OPTS}">
  ${IFRAME_NOT_SUPPORTED_MSG}
</iframe>`;
}, "putIntoIFrame");
var appendDivSvgG = __name((parentRoot, id28, enclosingDivId, divStyle, svgXlink) => {
  const enclosingDiv = parentRoot.append("div");
  enclosingDiv.attr("id", enclosingDivId);
  if (divStyle) {
    enclosingDiv.attr("style", divStyle);
  }
  const svgNode = enclosingDiv.append("svg").attr("id", id28).attr("width", "100%").attr("xmlns", XMLNS_SVG_STD);
  if (svgXlink) {
    svgNode.attr("xmlns:xlink", svgXlink);
  }
  svgNode.append("g");
  return parentRoot;
}, "appendDivSvgG");
function sandboxedIframe(parentNode, iFrameId) {
  return parentNode.append("iframe").attr("id", iFrameId).attr("style", "width: 100%; height: 100%;").attr("sandbox", "");
}
__name(sandboxedIframe, "sandboxedIframe");
var removeExistingElements = __name((doc, id28, divId, iFrameId) => {
  doc.getElementById(id28)?.remove();
  doc.getElementById(divId)?.remove();
  doc.getElementById(iFrameId)?.remove();
}, "removeExistingElements");
var render = __name(async function(id28, text, svgContainingElement) {
  addDiagrams();
  const processed = processAndSetConfigs(text);
  text = processed.code;
  const config = getConfig();
  log.debug(config);
  if (text.length > (config?.maxTextSize ?? MAX_TEXTLENGTH)) {
    text = MAX_TEXTLENGTH_EXCEEDED_MSG;
  }
  const idSelector = "#" + id28;
  const iFrameID = "i" + id28;
  const iFrameID_selector = "#" + iFrameID;
  const enclosingDivID = "d" + id28;
  const enclosingDivID_selector = "#" + enclosingDivID;
  const removeTempElements = __name(() => {
    const tmpElementSelector = isSandboxed ? iFrameID_selector : enclosingDivID_selector;
    const node2 = select_default(tmpElementSelector).node();
    if (node2 && "remove" in node2) {
      node2.remove();
    }
  }, "removeTempElements");
  let root = select_default("body");
  const isSandboxed = config.securityLevel === SECURITY_LVL_SANDBOX;
  const isLooseSecurityLevel = config.securityLevel === SECURITY_LVL_LOOSE;
  const fontFamily = config.fontFamily;
  if (svgContainingElement !== void 0) {
    if (svgContainingElement) {
      svgContainingElement.innerHTML = "";
    }
    if (isSandboxed) {
      const iframe = sandboxedIframe(select_default(svgContainingElement), iFrameID);
      root = select_default(iframe.nodes()[0].contentDocument.body);
      root.node().style.margin = 0;
    } else {
      root = select_default(svgContainingElement);
    }
    appendDivSvgG(root, id28, enclosingDivID, `font-family: ${fontFamily}`, XMLNS_XLINK_STD);
  } else {
    removeExistingElements(document, id28, enclosingDivID, iFrameID);
    if (isSandboxed) {
      const iframe = sandboxedIframe(select_default("body"), iFrameID);
      root = select_default(iframe.nodes()[0].contentDocument.body);
      root.node().style.margin = 0;
    } else {
      root = select_default("body");
    }
    appendDivSvgG(root, id28, enclosingDivID);
  }
  let diag;
  let parseEncounteredException;
  try {
    diag = await Diagram.fromText(text, { title: processed.title });
  } catch (error) {
    if (config.suppressErrorRendering) {
      removeTempElements();
      throw error;
    }
    diag = await Diagram.fromText("error");
    parseEncounteredException = error;
  }
  const element = root.select(enclosingDivID_selector).node();
  const diagramType = diag.type;
  const svg = element.firstChild;
  const firstChild = svg.firstChild;
  const diagramClassDefs = diag.renderer.getClasses?.(text, diag);
  const rules = createUserStyles(config, diagramType, diagramClassDefs, idSelector);
  const style1 = document.createElement("style");
  style1.innerHTML = rules;
  svg.insertBefore(style1, firstChild);
  try {
    await diag.renderer.draw(text, id28, package_default.version, diag);
  } catch (e) {
    if (config.suppressErrorRendering) {
      removeTempElements();
    } else {
      errorRenderer_default.draw(text, id28, package_default.version);
    }
    throw e;
  }
  const svgNode = root.select(`${enclosingDivID_selector} svg`);
  const a11yTitle = diag.db.getAccTitle?.();
  const a11yDescr = diag.db.getAccDescription?.();
  addA11yInfo(diagramType, svgNode, a11yTitle, a11yDescr);
  root.select(`[id="${id28}"]`).selectAll("foreignobject > *").attr("xmlns", XMLNS_XHTML_STD);
  let svgCode = root.select(enclosingDivID_selector).node().innerHTML;
  log.debug("config.arrowMarkerAbsolute", config.arrowMarkerAbsolute);
  svgCode = cleanUpSvgCode(svgCode, isSandboxed, evaluate(config.arrowMarkerAbsolute));
  if (isSandboxed) {
    const svgEl = root.select(enclosingDivID_selector + " svg").node();
    svgCode = putIntoIFrame(svgCode, svgEl);
  } else if (!isLooseSecurityLevel) {
    svgCode = purify.sanitize(svgCode, {
      ADD_TAGS: DOMPURIFY_TAGS,
      ADD_ATTR: DOMPURIFY_ATTR,
      HTML_INTEGRATION_POINTS: { foreignobject: true }
    });
  }
  attachFunctions();
  if (parseEncounteredException) {
    throw parseEncounteredException;
  }
  removeTempElements();
  return {
    diagramType,
    svg: svgCode,
    bindFunctions: diag.db.bindFunctions
  };
}, "render");
function initialize(userOptions = {}) {
  const options = assignWithDepth_default({}, userOptions);
  if (options?.fontFamily && !options.themeVariables?.fontFamily) {
    if (!options.themeVariables) {
      options.themeVariables = {};
    }
    options.themeVariables.fontFamily = options.fontFamily;
  }
  saveConfigFromInitialize(options);
  if (options?.theme && options.theme in themes_default) {
    options.themeVariables = themes_default[options.theme].getThemeVariables(
      options.themeVariables
    );
  } else if (options) {
    options.themeVariables = themes_default.default.getThemeVariables(options.themeVariables);
  }
  const config = typeof options === "object" ? setSiteConfig(options) : getSiteConfig();
  setLogLevel(config.logLevel);
  addDiagrams();
}
__name(initialize, "initialize");
var getDiagramFromText = __name((text, metadata = {}) => {
  const { code } = preprocessDiagram(text);
  return Diagram.fromText(code, metadata);
}, "getDiagramFromText");
function addA11yInfo(diagramType, svgNode, a11yTitle, a11yDescr) {
  setA11yDiagramInfo(svgNode, diagramType);
  addSVGa11yTitleDescription(svgNode, a11yTitle, a11yDescr, svgNode.attr("id"));
}
__name(addA11yInfo, "addA11yInfo");
var mermaidAPI = Object.freeze({
  render,
  parse: parse2,
  getDiagramFromText,
  initialize,
  getConfig,
  setConfig,
  getSiteConfig,
  updateSiteConfig,
  reset: __name(() => {
    reset();
  }, "reset"),
  globalReset: __name(() => {
    reset(defaultConfig);
  }, "globalReset"),
  defaultConfig
});
setLogLevel(getConfig().logLevel);
reset(getConfig());
var handleError = __name((error, errors, parseError) => {
  log.warn(error);
  if (isDetailedError(error)) {
    if (parseError) {
      parseError(error.str, error.hash);
    }
    errors.push({ ...error, message: error.str, error });
  } else {
    if (parseError) {
      parseError(error);
    }
    if (error instanceof Error) {
      errors.push({
        str: error.message,
        message: error.message,
        hash: error.name,
        error
      });
    }
  }
}, "handleError");
var run = __name(async function(options = {
  querySelector: ".mermaid"
}) {
  try {
    await runThrowsErrors(options);
  } catch (e) {
    if (isDetailedError(e)) {
      log.error(e.str);
    }
    if (mermaid.parseError) {
      mermaid.parseError(e);
    }
    if (!options.suppressErrors) {
      log.error("Use the suppressErrors option to suppress these errors");
      throw e;
    }
  }
}, "run");
var runThrowsErrors = __name(async function({ postRenderCallback, querySelector, nodes } = {
  querySelector: ".mermaid"
}) {
  const conf = mermaidAPI.getConfig();
  log.debug(`${!postRenderCallback ? "No " : ""}Callback function found`);
  let nodesToProcess;
  if (nodes) {
    nodesToProcess = nodes;
  } else if (querySelector) {
    nodesToProcess = document.querySelectorAll(querySelector);
  } else {
    throw new Error("Nodes and querySelector are both undefined");
  }
  log.debug(`Found ${nodesToProcess.length} diagrams`);
  if (conf?.startOnLoad !== void 0) {
    log.debug("Start On Load: " + conf?.startOnLoad);
    mermaidAPI.updateSiteConfig({ startOnLoad: conf?.startOnLoad });
  }
  const idGenerator = new utils_default.InitIDGenerator(conf.deterministicIds, conf.deterministicIDSeed);
  let txt;
  const errors = [];
  for (const element of Array.from(nodesToProcess)) {
    log.info("Rendering diagram: " + element.id);
    if (element.getAttribute("data-processed")) {
      continue;
    }
    element.setAttribute("data-processed", "true");
    const id28 = `mermaid-${idGenerator.next()}`;
    txt = element.innerHTML;
    txt = dedent(utils_default.entityDecode(txt)).trim().replace(/<br\s*\/?>/gi, "<br/>");
    const init2 = utils_default.detectInit(txt);
    if (init2) {
      log.debug("Detected early reinit: ", init2);
    }
    try {
      const { svg, bindFunctions } = await render2(id28, txt, element);
      element.innerHTML = svg;
      if (postRenderCallback) {
        await postRenderCallback(id28);
      }
      if (bindFunctions) {
        bindFunctions(element);
      }
    } catch (error) {
      handleError(error, errors, mermaid.parseError);
    }
  }
  if (errors.length > 0) {
    throw errors[0];
  }
}, "runThrowsErrors");
var initialize2 = __name(function(config) {
  mermaidAPI.initialize(config);
}, "initialize");
var init = __name(async function(config, nodes, callback) {
  log.warn("mermaid.init is deprecated. Please use run instead.");
  if (config) {
    initialize2(config);
  }
  const runOptions = { postRenderCallback: callback, querySelector: ".mermaid" };
  if (typeof nodes === "string") {
    runOptions.querySelector = nodes;
  } else if (nodes) {
    if (nodes instanceof HTMLElement) {
      runOptions.nodes = [nodes];
    } else {
      runOptions.nodes = nodes;
    }
  }
  await run(runOptions);
}, "init");
var registerExternalDiagrams = __name(async (diagrams, {
  lazyLoad = true
} = {}) => {
  addDiagrams();
  registerLazyLoadedDiagrams(...diagrams);
  if (lazyLoad === false) {
    await loadRegisteredDiagrams();
  }
}, "registerExternalDiagrams");
var contentLoaded = __name(function() {
  if (mermaid.startOnLoad) {
    const { startOnLoad } = mermaidAPI.getConfig();
    if (startOnLoad) {
      mermaid.run().catch((err) => log.error("Mermaid failed to initialize", err));
    }
  }
}, "contentLoaded");
if (typeof document !== "undefined") {
  window.addEventListener("load", contentLoaded, false);
}
var setParseErrorHandler = __name(function(parseErrorHandler) {
  mermaid.parseError = parseErrorHandler;
}, "setParseErrorHandler");
var executionQueue = [];
var executionQueueRunning = false;
var executeQueue = __name(async () => {
  if (executionQueueRunning) {
    return;
  }
  executionQueueRunning = true;
  while (executionQueue.length > 0) {
    const f = executionQueue.shift();
    if (f) {
      try {
        await f();
      } catch (e) {
        log.error("Error executing queue", e);
      }
    }
  }
  executionQueueRunning = false;
}, "executeQueue");
var parse22 = __name(async (text, parseOptions) => {
  return new Promise((resolve, reject) => {
    const performCall = __name(() => new Promise((res, rej) => {
      mermaidAPI.parse(text, parseOptions).then(
        (r) => {
          res(r);
          resolve(r);
        },
        (e) => {
          log.error("Error parsing", e);
          mermaid.parseError?.(e);
          rej(e);
          reject(e);
        }
      );
    }), "performCall");
    executionQueue.push(performCall);
    executeQueue().catch(reject);
  });
}, "parse");
var render2 = __name((id28, text, container) => {
  return new Promise((resolve, reject) => {
    const performCall = __name(() => new Promise((res, rej) => {
      mermaidAPI.render(id28, text, container).then(
        (r) => {
          res(r);
          resolve(r);
        },
        (e) => {
          log.error("Error parsing", e);
          mermaid.parseError?.(e);
          rej(e);
          reject(e);
        }
      );
    }), "performCall");
    executionQueue.push(performCall);
    executeQueue().catch(reject);
  });
}, "render");
var getRegisteredDiagramsMetadata = __name(() => {
  return Object.keys(detectors).map((id28) => ({
    id: id28
  }));
}, "getRegisteredDiagramsMetadata");
var mermaid = {
  startOnLoad: true,
  mermaidAPI,
  parse: parse22,
  render: render2,
  init,
  run,
  registerExternalDiagrams,
  registerLayoutLoaders,
  initialize: initialize2,
  parseError: void 0,
  contentLoaded,
  setParseErrorHandler,
  detectType,
  registerIconPacks,
  getRegisteredDiagramsMetadata
};
var mermaid_default = mermaid;

// node_modules/vitepress-mermaid-renderer/dist/vitepress-mermaid-renderer.js
var ie = { class: "zoom-level" };
var se = {
  key: 0,
  class: "copied-notification"
};
var le = { class: "mobile-zoom-controls" };
var ae = { class: "zoom-level" };
var ue = { class: "mobile-nav-buttons" };
var de = { class: "mobile-utility-controls" };
var ce = defineComponent({
  __name: "MermaidControls",
  props: {
    scale: {},
    code: {},
    isFullscreen: { type: Boolean }
  },
  emits: ["zoomIn", "zoomOut", "resetView", "toggleFullscreen", "panUp", "panDown", "panLeft", "panRight"],
  setup(a, { expose: e, emit: s }) {
    const o = a, i = ref(null), h2 = ref(null), d = ref(false), p = async () => {
      try {
        if (!navigator.clipboard)
          throw new Error("Clipboard API not available in this browser.");
        await navigator.clipboard.writeText(o.code), d.value = true, setTimeout(() => {
          d.value = false;
        }, 1e3);
      } catch (l) {
        console.error("Failed to copy diagram code:", l), alert(
          "Failed to copy to clipboard. Your browser might not support this feature."
        );
      }
    }, f = () => {
      try {
        o.isFullscreen ? (i.value && i.value.classList.add("force-show"), h2.value && h2.value.classList.add("force-show")) : (i.value && i.value.classList.remove("force-show"), h2.value && h2.value.classList.remove("force-show"));
      } catch (l) {
        console.error("Error updating fullscreen controls:", l);
      }
    };
    return onMounted(() => {
      i.value && (i.value.style.opacity = "1", i.value.style.visibility = "visible"), h2.value && (h2.value.style.opacity = "1", h2.value.style.visibility = "visible");
    }), e({
      updateFullscreenControls: f
    }), (l, t) => (openBlock(), createElementBlock("div", null, [
      createBaseVNode("div", {
        class: "desktop-controls controls visible-controls",
        ref_key: "controls",
        ref: i
      }, [
        createBaseVNode("button", {
          onClick: t[0] || (t[0] = (m) => l.$emit("zoomIn")),
          title: "Zoom In"
        }, t[12] || (t[12] = [
          createStaticVNode('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>', 1)
        ])),
        createBaseVNode("span", ie, toDisplayString(Math.round(l.scale * 100)) + "%", 1),
        createBaseVNode("button", {
          onClick: t[1] || (t[1] = (m) => l.$emit("zoomOut")),
          title: "Zoom Out"
        }, t[13] || (t[13] = [
          createBaseVNode("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor"
          }, [
            createBaseVNode("circle", {
              cx: "11",
              cy: "11",
              r: "8"
            }),
            createBaseVNode("line", {
              x1: "21",
              y1: "21",
              x2: "16.65",
              y2: "16.65"
            }),
            createBaseVNode("line", {
              x1: "8",
              y1: "11",
              x2: "14",
              y2: "11"
            })
          ], -1)
        ])),
        createBaseVNode("button", {
          onClick: t[2] || (t[2] = (m) => l.$emit("resetView")),
          title: "Reset View"
        }, t[14] || (t[14] = [
          createBaseVNode("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor"
          }, [
            createBaseVNode("path", { d: "M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.9 3.2L21 8" }),
            createBaseVNode("path", { d: "M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.9-3.2L3 16" })
          ], -1)
        ])),
        createBaseVNode("button", {
          onClick: p,
          title: "Copy Code"
        }, [
          t[15] || (t[15] = createBaseVNode("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor"
          }, [
            createBaseVNode("rect", {
              x: "9",
              y: "9",
              width: "13",
              height: "13",
              rx: "2",
              ry: "2"
            }),
            createBaseVNode("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
          ], -1)),
          d.value ? (openBlock(), createElementBlock("span", se, "Copied")) : createCommentVNode("", true)
        ]),
        createBaseVNode("button", {
          onClick: t[3] || (t[3] = (m) => l.$emit("toggleFullscreen")),
          title: "Toggle Fullscreen"
        }, t[16] || (t[16] = [
          createBaseVNode("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            width: "20",
            height: "20",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor"
          }, [
            createBaseVNode("path", { d: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" })
          ], -1)
        ]))
      ], 512),
      createBaseVNode("div", {
        class: "mobile-controls controls visible-controls",
        ref_key: "mobileControls",
        ref: h2
      }, [
        createBaseVNode("div", le, [
          createBaseVNode("button", {
            onClick: t[4] || (t[4] = (m) => l.$emit("zoomIn")),
            title: "Zoom In"
          }, t[17] || (t[17] = [
            createStaticVNode('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>', 1)
          ])),
          createBaseVNode("span", ae, toDisplayString(Math.round(l.scale * 100)) + "%", 1),
          createBaseVNode("button", {
            onClick: t[5] || (t[5] = (m) => l.$emit("zoomOut")),
            title: "Zoom Out"
          }, t[18] || (t[18] = [
            createBaseVNode("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor"
            }, [
              createBaseVNode("circle", {
                cx: "11",
                cy: "11",
                r: "8"
              }),
              createBaseVNode("line", {
                x1: "21",
                y1: "21",
                x2: "16.65",
                y2: "16.65"
              }),
              createBaseVNode("line", {
                x1: "8",
                y1: "11",
                x2: "14",
                y2: "11"
              })
            ], -1)
          ]))
        ]),
        createBaseVNode("div", ue, [
          createBaseVNode("button", {
            onClick: t[6] || (t[6] = (m) => l.$emit("panUp")),
            title: "Pan Up"
          }, t[19] || (t[19] = [
            createBaseVNode("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor"
            }, [
              createBaseVNode("path", { d: "M12 19V5M5 12l7-7 7 7" })
            ], -1)
          ])),
          createBaseVNode("button", {
            onClick: t[7] || (t[7] = (m) => l.$emit("panDown")),
            title: "Pan Down"
          }, t[20] || (t[20] = [
            createBaseVNode("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor"
            }, [
              createBaseVNode("path", { d: "M12 5v14M5 12l7 7 7-7" })
            ], -1)
          ])),
          createBaseVNode("button", {
            onClick: t[8] || (t[8] = (m) => l.$emit("panLeft")),
            title: "Pan Left"
          }, t[21] || (t[21] = [
            createBaseVNode("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor"
            }, [
              createBaseVNode("path", { d: "M19 12H5m7-7l-7 7 7 7" })
            ], -1)
          ])),
          createBaseVNode("button", {
            onClick: t[9] || (t[9] = (m) => l.$emit("panRight")),
            title: "Pan Right"
          }, t[22] || (t[22] = [
            createBaseVNode("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor"
            }, [
              createBaseVNode("path", { d: "M5 12h14M12 5l7 7-7 7" })
            ], -1)
          ]))
        ]),
        createBaseVNode("div", de, [
          createBaseVNode("button", {
            onClick: t[10] || (t[10] = (m) => l.$emit("resetView")),
            title: "Reset View"
          }, t[23] || (t[23] = [
            createBaseVNode("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor"
            }, [
              createBaseVNode("path", { d: "M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.9 3.2L21 8" }),
              createBaseVNode("path", { d: "M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.9-3.2L3 16" })
            ], -1)
          ])),
          createBaseVNode("button", {
            onClick: t[11] || (t[11] = (m) => l.$emit("toggleFullscreen")),
            title: "Toggle Fullscreen"
          }, t[24] || (t[24] = [
            createBaseVNode("svg", {
              xmlns: "http://www.w3.org/2000/svg",
              width: "20",
              height: "20",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor"
            }, [
              createBaseVNode("path", { d: "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" })
            ], -1)
          ]))
        ])
      ], 512)
    ]));
  }
});
var me = {
  key: 0,
  class: "diagram-error"
};
var he = { class: "error-message" };
var ge = {
  key: 0,
  class: "error-details"
};
var fe = defineComponent({
  __name: "MermaidError",
  props: {
    renderError: { type: Boolean },
    renderErrorDetails: {}
  },
  setup(a) {
    const e = ref(false), s = () => {
      e.value = !e.value;
    };
    return (o, i) => o.renderError ? (openBlock(), createElementBlock("div", me, [
      createBaseVNode("div", he, [
        i[0] || (i[0] = createBaseVNode("svg", {
          xmlns: "http://www.w3.org/2000/svg",
          width: "24",
          height: "24",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor"
        }, [
          createBaseVNode("circle", {
            cx: "12",
            cy: "12",
            r: "10"
          }),
          createBaseVNode("line", {
            x1: "12",
            y1: "8",
            x2: "12",
            y2: "12"
          }),
          createBaseVNode("line", {
            x1: "12",
            y1: "16",
            x2: "12.01",
            y2: "16"
          })
        ], -1)),
        i[1] || (i[1] = createBaseVNode("span", null, "Failed to render diagram", -1)),
        createBaseVNode("button", {
          onClick: s,
          class: "error-toggle-button"
        }, toDisplayString(e.value ? "Hide Details" : "Show Details"), 1)
      ]),
      e.value ? (openBlock(), createElementBlock("pre", ge, toDisplayString(o.renderErrorDetails), 1)) : createCommentVNode("", true)
    ])) : createCommentVNode("", true);
  }
});
var ve = (a, e) => {
  const s = a.__vccOpts || a;
  for (const [o, i] of e)
    s[o] = i;
  return s;
};
var pe = ve(fe, [["__scopeId", "data-v-41babc14"]]);
function we() {
  const a = ref(1), e = ref(0), s = ref(0), o = ref(false), i = ref(false), h2 = ref(0), d = ref(0), p = ref(0), f = ref(false), l = ref(0), t = ref(0), m = 50;
  return {
    // State
    scale: a,
    translateX: e,
    translateY: s,
    isPanning: o,
    isFullscreen: i,
    // Actions
    zoomIn: () => {
      a.value = a.value * 1.2;
    },
    zoomOut: () => {
      a.value > 0.2 && (a.value = a.value / 1.2);
    },
    resetView: () => {
      a.value = 1, e.value = 0, s.value = 0;
    },
    toggleFullscreen: (r) => {
      try {
        if (document.fullscreenElement)
          document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen ? document.webkitExitFullscreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.msExitFullscreen && document.msExitFullscreen(), i.value = false;
        else {
          if (r?.requestFullscreen)
            r.requestFullscreen();
          else if (r?.webkitRequestFullscreen)
            r.webkitRequestFullscreen();
          else if (r?.mozRequestFullScreen)
            r.mozRequestFullScreen();
          else if (r?.msRequestFullscreen)
            r.msRequestFullscreen();
          else
            throw new Error("Fullscreen API not available");
          i.value = true;
        }
      } catch (v) {
        console.error("Fullscreen error:", v), alert("Fullscreen mode is not supported in this browser.");
      }
    },
    startPan: (r) => {
      o.value = true, h2.value = r.clientX, d.value = r.clientY;
    },
    pan: (r) => {
      if (!o.value) return;
      const v = r.clientX - h2.value, C = r.clientY - d.value;
      e.value += v / a.value, s.value += C / a.value, h2.value = r.clientX, d.value = r.clientY;
    },
    endPan: () => {
      o.value = false;
    },
    handleWheel: (r) => {
      if (r.ctrlKey) {
        const v = -Math.sign(r.deltaY) * 0.1, C = a.value * (1 + v);
        C >= 0.2 && C <= 10 && (a.value = C);
      } else
        e.value += -r.deltaX / a.value, s.value += -r.deltaY / a.value;
    },
    handleTouchStart: (r) => {
      if (r.touches.length === 1)
        f.value = true, l.value = r.touches[0].clientX, t.value = r.touches[0].clientY;
      else if (r.touches.length === 2) {
        f.value = false;
        const v = r.touches[0], C = r.touches[1];
        p.value = Math.hypot(
          C.clientX - v.clientX,
          C.clientY - v.clientY
        );
      }
    },
    handleTouchMove: (r) => {
      if (r.preventDefault(), f.value && r.touches.length === 1) {
        const v = r.touches[0], C = v.clientX - l.value, P = v.clientY - t.value;
        e.value += C / a.value, s.value += P / a.value, l.value = v.clientX, t.value = v.clientY;
      } else if (r.touches.length === 2) {
        const v = r.touches[0], C = r.touches[1], P = Math.hypot(
          C.clientX - v.clientX,
          C.clientY - v.clientY
        );
        if (p.value > 0) {
          const D = P / p.value, $ = a.value * (1 + (D - 1) * 0.2);
          $ >= 0.2 && $ <= 10 && (a.value = $), p.value = P;
        }
      }
    },
    handleTouchEnd: () => {
      f.value = false, p.value = 0;
    },
    panUp: () => {
      s.value -= m / a.value;
    },
    panDown: () => {
      s.value += m / a.value;
    },
    panLeft: () => {
      e.value -= m / a.value;
    },
    panRight: () => {
      e.value += m / a.value;
    },
    updateFullscreenControls: (r) => {
      try {
        document.fullscreenElement ? (i.value = true, r.controls && r.controls.classList.add("force-show"), r.mobileControls && r.mobileControls.classList.add("force-show")) : (i.value = false, r.controls && r.controls.classList.remove("force-show"), r.mobileControls && r.mobileControls.classList.remove("force-show"));
      } catch (v) {
        console.error("Error updating fullscreen controls:", v);
      }
    }
  };
}
function ye(a = {}) {
  const e = ref(false), s = ref(false), o = ref(false), i = ref(""), h2 = ref({ width: 0, height: 0 }), d = (f) => {
    const l = f.trim().toLowerCase();
    return l.startsWith("c4context") || l.startsWith("c4container") || l.startsWith("c4component") || l.startsWith("c4dynamic") || l.startsWith("c4deployment") ? "c4" : l.startsWith("gitgraph") || l.includes("gitgraph:") ? "gitgraph" : l.startsWith("flowchart") || l.startsWith("graph") ? "flowchart" : l.startsWith("sequencediagram") || l.startsWith("sequenceDiagram") ? "sequence" : l.startsWith("gantt") ? "gantt" : "unknown";
  }, p = async (f, l, t = 0, m = 3) => {
    try {
      let w = document.getElementById(f);
      if (!w) {
        if (console.warn(
          `[Mermaid] Diagram container element not found, attempt ${t + 1}/${m + 1}`
        ), t < m) {
          const M = 100 * Math.pow(2, t);
          return await new Promise((c) => setTimeout(c, M)), p(f, l, t + 1, m);
        }
        throw new Error("Failed to find diagram container element");
      }
      w.classList.add("mermaid-rendering");
      try {
        const M = typeof window < "u";
        if (await mermaid_default.run({
          nodes: [w],
          suppressErrors: false
        }), await new Promise(
          (c) => setTimeout(c, M ? 150 : 50)
        ), s.value = true, o.value = false, w.classList.remove("mermaid-rendering"), w.firstElementChild) {
          const c = w.querySelector("svg");
          if (c) {
            await new Promise(
              (T) => setTimeout(T, M ? 150 : 50)
            );
            const F = w.parentElement?.querySelector(".diagram-wrapper");
            if (F) {
              const T = F.getBoundingClientRect(), E = d(l);
              if (w.classList.add(`mermaid-${E}`), E === "c4" || E === "gitgraph") {
                if (c.style.width = "100%", c.style.height = "auto", c.style.maxWidth = "100%", c.style.display = "block", c.removeAttribute("width"), c.removeAttribute("height"), !c.getAttribute("viewBox"))
                  try {
                    const x = c.getBBox();
                    x.width && x.height && (c.setAttribute(
                      "viewBox",
                      `0 0 ${x.width} ${x.height}`
                    ), c.setAttribute(
                      "preserveAspectRatio",
                      "xMidYMid meet"
                    ));
                  } catch (x) {
                    console.warn("Could not set viewBox for diagram:", x);
                  }
                c.style.display = "none", c.offsetHeight, c.style.display = "block";
              }
            }
            h2.value = {
              width: c.getBoundingClientRect().width,
              height: c.getBoundingClientRect().height
            };
          }
        }
        a.onRenderComplete?.({ id: f, success: true });
      } catch (M) {
        console.error("Failed to render mermaid diagram:", M), o.value = true, i.value = M instanceof Error ? M.toString() : "Unknown error rendering diagram", s.value = true, w.classList.remove("mermaid-rendering"), a.onRenderComplete?.({ id: f, success: false, error: M }), typeof window < "u" && t === 0 && setTimeout(() => {
          p(f, l, t + 1, m);
        }, 1e3);
      }
    } catch (w) {
      console.error("Error in diagram initialization:", w), o.value = true, i.value = w instanceof Error ? w.toString() : "Unknown error initializing component", a.onRenderComplete?.({ id: f, success: false, error: w });
    }
  };
  return onMounted(() => {
    e.value = true;
    const l = {
      ...{
        theme: "default",
        securityLevel: "loose",
        startOnLoad: false,
        flowchart: {
          useMaxWidth: false,
          htmlLabels: true
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
          mirrorActors: true,
          bottomMarginAdj: 1,
          useMaxWidth: false,
          rightAngles: false,
          showSequenceNumbers: false
        },
        gantt: {
          useMaxWidth: false,
          topPadding: 50,
          leftPadding: 50,
          rightPadding: 50,
          gridLineStartPadding: 35,
          barHeight: 50,
          barGap: 40,
          displayMode: "compact",
          axisFormat: "%Y-%m-%d",
          topAxis: false,
          tickInterval: "day",
          useWidth: 2048
        },
        class: {
          arrowMarkerAbsolute: false,
          useMaxWidth: false
        },
        journey: {
          useMaxWidth: false
        },
        pie: {},
        c4: {
          useMaxWidth: false,
          diagramMarginX: 20,
          diagramMarginY: 20
        },
        gitGraph: {
          useMaxWidth: false,
          rotateCommitLabel: false,
          showBranches: true,
          showCommitLabel: true,
          mainBranchName: "main"
        }
      },
      ...a.config
    };
    mermaid_default.initialize({
      ...l
    });
  }), {
    // State
    mounted: e,
    isRendered: s,
    renderError: o,
    renderErrorDetails: i,
    originalDiagramSize: h2,
    // Actions
    renderMermaidDiagram: p,
    detectDiagramType: d
  };
}
var Ce = {
  key: 0,
  class: "mermaid-container"
};
var be = defineComponent({
  __name: "MermaidDiagram",
  props: {
    code: {},
    config: {}
  },
  emits: ["renderComplete"],
  setup(a, { emit: e }) {
    const s = e, o = a, i = we(), h2 = ye({
      config: o.config,
      onRenderComplete: (k) => s("renderComplete", k)
    }), {
      scale: d,
      translateX: p,
      translateY: f,
      isPanning: l,
      isFullscreen: t,
      zoomIn: m,
      zoomOut: w,
      resetView: M,
      toggleFullscreen: c,
      startPan: F,
      pan: T,
      endPan: E,
      handleWheel: x,
      handleTouchStart: W,
      handleTouchMove: N,
      handleTouchEnd: Y,
      panUp: I,
      panDown: X,
      panLeft: V,
      panRight: U,
      updateFullscreenControls: H
    } = i, {
      mounted: Z,
      isRendered: r,
      renderError: v,
      renderErrorDetails: C,
      renderMermaidDiagram: P
    } = h2, D = ref(null), $ = ref(null), Q = `mermaid-${Math.random().toString(36).slice(2)}`, J = () => {
      c($.value);
    }, L = () => {
      const k = {
        controls: D.value?.$refs.controls,
        mobileControls: D.value?.$refs.mobileControls
      };
      H(k);
    };
    return onMounted(async () => {
      try {
        await nextTick(), await P(Q, o.code), document.addEventListener("fullscreenchange", L), document.addEventListener("webkitfullscreenchange", L), document.addEventListener("mozfullscreenchange", L), document.addEventListener("MSFullscreenChange", L);
      } catch (k) {
        console.error("Error in component initialization:", k);
      }
    }), onUnmounted(() => {
      document.removeEventListener("fullscreenchange", L), document.removeEventListener(
        "webkitfullscreenchange",
        L
      ), document.removeEventListener("mozfullscreenchange", L), document.removeEventListener("MSFullscreenChange", L);
    }), (k, y) => unref(Z) ? (openBlock(), createElementBlock("div", Ce, [
      createVNode(ce, {
        ref_key: "controlsRef",
        ref: D,
        scale: unref(d),
        code: k.code,
        "is-fullscreen": unref(t),
        onZoomIn: unref(m),
        onZoomOut: unref(w),
        onResetView: unref(M),
        onToggleFullscreen: J,
        onPanUp: unref(I),
        onPanDown: unref(X),
        onPanLeft: unref(V),
        onPanRight: unref(U)
      }, null, 8, ["scale", "code", "is-fullscreen", "onZoomIn", "onZoomOut", "onResetView", "onPanUp", "onPanDown", "onPanLeft", "onPanRight"]),
      createVNode(pe, {
        "render-error": unref(v),
        "render-error-details": unref(C)
      }, null, 8, ["render-error", "render-error-details"]),
      createBaseVNode("div", {
        class: "diagram-wrapper",
        ref_key: "diagramWrapper",
        ref: $,
        onMousedown: y[0] || (y[0] = //@ts-ignore
        (...b) => unref(F) && unref(F)(...b)),
        onMousemove: y[1] || (y[1] = //@ts-ignore
        (...b) => unref(T) && unref(T)(...b)),
        onMouseup: y[2] || (y[2] = //@ts-ignore
        (...b) => unref(E) && unref(E)(...b)),
        onMouseleave: y[3] || (y[3] = //@ts-ignore
        (...b) => unref(E) && unref(E)(...b)),
        onWheel: y[4] || (y[4] = withModifiers(
          //@ts-ignore
          (...b) => unref(x) && unref(x)(...b),
          ["prevent"]
        )),
        onTouchstart: y[5] || (y[5] = //@ts-ignore
        (...b) => unref(W) && unref(W)(...b)),
        onTouchmove: y[6] || (y[6] = //@ts-ignore
        (...b) => unref(N) && unref(N)(...b)),
        onTouchend: y[7] || (y[7] = //@ts-ignore
        (...b) => unref(Y) && unref(Y)(...b))
      }, [
        createBaseVNode("div", {
          id: Q,
          class: "mermaid",
          style: normalizeStyle({
            opacity: unref(r) ? 1 : 0,
            transform: `scale(${unref(d)}) translate(${unref(p)}px, ${unref(f)}px)`,
            cursor: unref(l) ? "grabbing" : "grab"
          })
        }, toDisplayString(k.code), 5)
      ], 544)
    ])) : createCommentVNode("", true);
  }
});
var Me = typeof window < "u" && typeof document < "u" && typeof document.createElement == "function";
var R = class _R {
  static instance;
  config;
  observer = null;
  initialized = false;
  renderAttempts = 0;
  maxRenderAttempts = 15;
  // Increased to handle slower production environments
  retryTimeout = null;
  isClient;
  renderQueue = [];
  isRendering = false;
  initialPageRenderComplete = false;
  hydrationComplete = false;
  domContentLoaded = false;
  windowLoaded = false;
  constructor(e) {
    this.config = e || {}, this.isClient = Me, this.isClient && (this.setupMutationObserver(), this.setupHydrationListeners());
  }
  static getInstance(e) {
    return _R.instance ? e && _R.instance.setConfig(e) : _R.instance = new _R(e), _R.instance;
  }
  setConfig(e) {
    this.config = { ...this.config, ...e };
  }
  setupHydrationListeners() {
    this.isClient && (document.readyState === "loading" ? document.addEventListener(
      "DOMContentLoaded",
      () => {
        this.domContentLoaded = true, this.tryRender("DOMContentLoaded");
      },
      { once: true }
    ) : this.domContentLoaded = true, window.addEventListener(
      "load",
      () => {
        this.windowLoaded = true, this.tryRender("window.load");
      },
      { once: true }
    ), setTimeout(() => {
      this.initialPageRenderComplete || this.tryRender("safety-timeout");
    }, 2e3));
  }
  tryRender(e) {
    this.initialPageRenderComplete || this.renderWithRetry();
  }
  setupMutationObserver() {
    if (this.isClient)
      try {
        this.observer = new MutationObserver((e) => {
          e.some(
            (o) => o.type === "childList" && Array.from(o.addedNodes).some(
              (i) => i.nodeType === Node.ELEMENT_NODE && (i.querySelector?.(".language-mermaid") !== null || i.classList?.contains("language-mermaid"))
            )
          ) && this.renderMermaidDiagrams();
        }), this.observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      } catch (e) {
        console.error("Failed to setup MutationObserver:", e);
      }
  }
  cleanupMermaidWrapper(e) {
    if (!this.isClient) return;
    const s = e.getElementsByClassName("copy");
    Array.from(s).forEach((o) => o.remove());
  }
  createMermaidComponent(e) {
    if (!this.isClient) return null;
    try {
      const s = document.createElement("div");
      return s.id = `mermaid-wrapper-${Math.random().toString(36).slice(2)}`, s.className = "mermaid-wrapper", {
        wrapper: s,
        component: h(be, { code: e, config: this.config })
      };
    } catch (s) {
      return console.error("Failed to create mermaid component:", s), null;
    }
  }
  async renderNextDiagram() {
    if (!this.isClient || this.renderQueue.length === 0 || this.isRendering)
      return;
    this.isRendering = true;
    const e = this.renderQueue.shift();
    if (e)
      try {
        await this.renderMermaidDiagram(e);
      } catch (s) {
        console.error("Failed to render diagram:", s);
      }
    this.isRendering = false, this.renderQueue.length > 0 ? await this.renderNextDiagram() : this.initialPageRenderComplete || (this.initialPageRenderComplete = true, this.hydrationComplete = true);
  }
  async renderMermaidDiagram(e) {
    if (this.isClient)
      try {
        if (!e || !e.parentNode) return;
        const s = e.textContent?.trim() || "", o = this.createMermaidComponent(s);
        if (!o) return;
        const { wrapper: i, component: h2 } = o;
        return e.parentNode.replaceChild(i, e), new Promise((d) => {
          createApp({
            render: () => h2
          }).mount(i), setTimeout(d, 200);
        });
      } catch (s) {
        console.error("Failed to render mermaid diagram:", s);
      }
  }
  initialize() {
    if (!(this.initialized || !this.isClient))
      try {
        const e = () => {
          if (!document || !document.body) {
            console.warn(
              "MermaidRenderer initialization failed: document or body not available"
            );
            return;
          }
          Promise.resolve().then(() => {
            requestAnimationFrame(() => {
              try {
                this.initializeRenderer();
              } catch (o) {
                console.error(
                  "Failed to initialize MermaidRenderer:",
                  o instanceof Error ? o.message : "Unknown error"
                );
              }
            });
          });
        };
        switch (document.readyState) {
          case "loading":
            document.addEventListener("DOMContentLoaded", e, {
              once: true
            });
            break;
          case "interactive":
          case "complete":
            e();
            break;
          default:
            console.warn(
              `MermaidRenderer: Unexpected document.readyState: ${document.readyState}`
            ), e();
        }
        const s = () => {
          try {
            this.handleRouteChange();
          } catch (o) {
            console.error(
              "Error handling route change:",
              o instanceof Error ? o.message : "Unknown error"
            );
          }
        };
        window.addEventListener("popstate", s), document.addEventListener(
          "vitepress:routeChanged",
          s
        ), document.addEventListener(
          "vitepress:ready",
          () => {
            this.renderWithRetry();
          },
          { once: true }
        ), typeof window < "u" && setTimeout(() => {
          this.renderWithRetry();
        }, 500), this.initialized = true;
      } catch (e) {
        throw console.error(
          "Critical error during MermaidRenderer initialization:",
          e instanceof Error ? e.message : "Unknown error"
        ), e;
      }
  }
  initializeRenderer() {
    this.renderAttempts = 0, this.initialPageRenderComplete = false, this.renderWithRetry();
  }
  handleRouteChange() {
    this.renderAttempts = 0, this.initialPageRenderComplete = false, this.retryTimeout && (clearTimeout(this.retryTimeout), this.retryTimeout = null), this.renderWithRetry();
  }
  renderWithRetry() {
    if (!this.renderMermaidDiagrams() && this.renderAttempts < this.maxRenderAttempts) {
      const s = Math.min(
        300 * Math.pow(1.4, this.renderAttempts),
        1e4
      );
      this.retryTimeout && clearTimeout(this.retryTimeout), this.retryTimeout = setTimeout(() => {
        this.renderAttempts++, this.renderWithRetry();
      }, s);
    }
  }
  renderMermaidDiagrams() {
    if (!this.isClient) return false;
    try {
      let e = document.getElementsByClassName("language-mermaid");
      if (e.length === 0) {
        const o = document.querySelectorAll("pre"), i = Array.from(o).filter((h2) => {
          const d = h2.querySelector("code");
          return !!(d && (d.className.includes("mermaid") || d.className.includes("language-mermaid")));
        });
        i.length > 0 && (e = {
          length: i.length,
          item(d) {
            return d >= 0 && d < i.length ? i[d] : null;
          },
          namedItem(d) {
            return null;
          },
          // Implement Symbol.iterator directly on the object
          [Symbol.iterator]: function* () {
            for (let d = 0; d < this.length; d++) {
              const p = this.item(d);
              p && (yield p);
            }
          },
          // Add indexed access
          ...i.reduce(
            (d, p, f) => ({ ...d, [f]: p }),
            {}
          )
        });
      }
      if (e.length === 0) return false;
      Array.from(e).forEach(
        (o) => this.cleanupMermaidWrapper(o)
      );
      const s = Array.from(e).map((o) => {
        let i = o.querySelector("pre");
        return !i && o.tagName.toLowerCase() === "pre" && (i = o), i;
      }).filter(
        (o) => o instanceof HTMLPreElement
      );
      return s.length > 0 && (this.renderQueue.push(...s), this.isRendering || this.renderNextDiagram()), s.length > 0;
    } catch (e) {
      return console.error("Error rendering Mermaid diagrams:", e), false;
    }
  }
};
var xe = typeof window < "u" && typeof document < "u";
var ke = (a) => xe ? R.getInstance(a) : {
  initialize: () => {
  },
  renderMermaidDiagrams: () => false,
  getInstance: () => ({
    initialize: () => {
    },
    renderMermaidDiagrams: () => false
  })
};
export {
  ce as MermaidControls,
  be as MermaidDiagram,
  pe as MermaidError,
  R as MermaidRenderer,
  ke as createMermaidRenderer,
  ke as default,
  we as useMermaidNavigation,
  ye as useMermaidRenderer
};
/*! Bundled license information:

mermaid/dist/mermaid.core.mjs:
  (*! Check if previously processed *)
  (*!
   * Wait for document loaded before starting the execution
   *)
*/
//# sourceMappingURL=vitepress-mermaid-renderer.js.map
