figma.showUI(__html__, { visible: false });
figma.ui.postMessage({ type: "networkRequest" });
figma.loadFontAsync({ family: "Roboto", style: "Regular" });

//Are there any styles? If the page is titled correctly, Add the styles that match the page.
//If the page is titled DELETE - then delete eisting styles.
//If there is an update make the change to the style

//Coming only update the relevant styles, delete and redraw document.
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
  console.log("ADD Func");
  let { type, rgb, name, opacity, theme, description } = color;

  const style = figma.createPaintStyle();
  style.name = `${type}/${name}`;
  style.paints = [
    {
      type: "SOLID",
      color: rgb,
      opacity
    }
  ];
  style.description = `${description} (${theme})`;
  console.log("ADDED");
}
function updateStyle(color, style, page) {
  console.log(style.name, style.description, page);

  let { rgb, opacity } = color;
  const fills = clone(style.paints);
  fills[0].color = rgb;
  fills[0].opacity = opacity;
  style.paints = fills;
  console.log("MATCH RIGHT");
}
function deleteStyle(style) {
  console.log("DELETE Func");

  style.remove();
}

//CREATE RECTANGLES/CIRCLES WITH LABELS
function styleGuide(style, i, nodes) {
  let { name, id } = style;
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

figma.ui.onmessage = async msg => {
  let styleList = figma.getLocalPaintStyles();
  let page = figma.currentPage.name;
  const nodes: SceneNode[] = [];
  console.log(msg);
  if (styleList.length == 0) {
    console.log("Here");
    msg.forEach(color => {
      if (color.active && page == color.theme) {
        addStyle(color);
      }
    });
  } else {
    msg.forEach(element => {
      for (let i = 0; i < styleList.length; i++) {
        let { name, theme } = element;
        let { name: styleName, description: styleDesc } = styleList[i];
        let styleName1 = styleName.split("/");
        styleName = styleName1[1].toString();

        if (page == "DELETE") {
          console.log("DELETING");
          deleteStyle(styleList[i]);
        } else if (
          name == styleName &&
          theme == page &&
          styleDesc.match(new RegExp(`(${theme})`, "g"))
        ) {
          console.log("There");
          updateStyle(element, styleList[i], page);
          styleGuide(styleList[i], i, nodes);
        } else {
          console.log("ANOMOLY");
        }
      }
    });
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  //CLOSE PLUGIN
  figma.closePlugin();
};
