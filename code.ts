figma.showUI(__html__, { visible: false });
figma.ui.postMessage({ type: "networkRequest" });
figma.loadFontAsync({ family: "Roboto", style: "Regular" });
let styleList = figma.getLocalPaintStyles();
// styleList.forEach(element => {
// 	element.remove();
// });
figma.ui.onmessage = async msg => {
  console.log(msg);
  msg.forEach(element => {
    let { name, rgb, opacity, description, theme, type, active } = element;
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
      style.description = description;
    }
  });
  let styleList = figma.getLocalPaintStyles();
  //   console.log(styleList);
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
