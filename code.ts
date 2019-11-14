figma.showUI(__html__, { visible: false });
figma.ui.postMessage({ type: "networkRequest" });
figma.loadFontAsync({ family: "Roboto", style: "Regular" });

function clone(val) {
  const type = typeof val;
  if (val === null) {
    return null;
  } else if (
    type === "undefined" ||
    type === "number" ||
    type === "string" ||
    type === "boolean"
  ) {
    return val;
  } else if (type === "object") {
    if (val instanceof Array) {
      return val.map(x => clone(x));
    } else if (val instanceof Uint8Array) {
      return new Uint8Array(val);
    } else {
      let o = {};
      for (const key in val) {
        o[key] = clone(val[key]);
      }
      return o;
    }
  }
  throw "unknown";
}
function addStyle(color) {
  let { type, rgb, name, opacity, theme, description, active } = color;
  if (theme == figma.currentPage.name && active) {
    let { r, g, b } = rgb;

    const style = figma.createPaintStyle();
    style.name = `${type}/${name}`;
    style.paints = [
      {
        type: "SOLID",
        color: { r, g, b },
        opacity
      }
    ];
    style.description = `${description} (${figma.currentPage.name})`;
    console.log("ADDED");
  } else {
    console.log("PAGE NAME DOES NOT MATCH");
  }
}
function updateStyle(color, style) {
  let { rgb, opacity } = color;
  // console.log(rgb);
  const fills = clone(style.paints);
  fills[0].color = rgb;
  fills[0].opacity = opacity;
  style.paints = fills;
  console.log(style);
  console.log("UPDATED");
}
function deleteStyle(style) {
  style.remove;
}

figma.ui.onmessage = async msg => {
  let styleList = figma.getLocalPaintStyles();
  const styleLength = styleList.length;
  if (styleLength == 0) {
    msg.forEach(color => {
      addStyle(color);
    });
  } else {
    msg.forEach(element => {
      for (let i = 0; i < styleLength; i++) {
        let { name: styleName, description: styleDesc } = styleList[i];
        let { name, theme } = element;
        let styleName1 = styleName.split("/");
        styleName = styleName1[1].toString();
        let regex = new RegExp(`(${theme})`, "g");

        if (name == styleName && styleDesc.match(theme)) {
          updateStyle(element, styleList[i]);
          console.log(`MATCHED ${element.name}`);
        } else if (name == styleName && !styleDesc.match(regex)) {
          console.log(`IGNORED ${element.name}-${element.theme}`);
        }
      }
    });
  }

  const nodes: SceneNode[] = [];

  //CREATE RECTANGLES/CIRCLES WITH LABELS

  for (let i = 0; i < styleList.length; i++) {
    const { name, id } = styleList[i];

    const rect = figma.createRectangle();
    rect.name = name;
    rect.y = i * 150;
    rect.cornerRadius = 100;
    rect.fillStyleId = id;
    figma.currentPage.appendChild(rect);

    const label = figma.createText();
    label.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
    label.characters = name;
    label.fontSize = 30;
    label.x = 200;
    label.y = i * 150;
    label.textAlignVertical = "TOP";
    label.lineHeight = {
      value: 100,
      unit: "PIXELS"
    };
    label.name = name;
    figma.currentPage.appendChild(label);

    nodes.push(rect, label);
  }

  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);

  //CLOSE PLUGIN
  figma.closePlugin();
};
