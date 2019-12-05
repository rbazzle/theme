var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
figma.showUI(__html__, { visible: false });
figma.ui.postMessage({ type: "networkRequest" });
figma.loadFontAsync({ family: "Roboto", style: "Regular" });
//Check the page title. DELETE, LIGHT, or DARK
//If there is an update make the change to the style, add new ones, delete non matches
//Coming only update the relevant styles, delete and redraw document.
function clone(val) {
    const type = typeof val;
    if (val === null) {
        return null;
    }
    else if (type === "undefined" ||
        type === "number" ||
        type === "string" ||
        type === "boolean") {
        return val;
    }
    else if (type === "object") {
        if (val instanceof Array) {
            return val.map(x => clone(x));
        }
        else if (val instanceof Uint8Array) {
            return new Uint8Array(val);
        }
        else {
            let o = {};
            for (const key in val) {
                o[key] = clone(val[key]);
            }
            return o;
        }
    }
    throw "unknown";
}
function addStyle(color, pageTheme) {
    console.log("ADD Func");
    let { type, rgb, name, opacity, theme, description } = color;
    if (color.active && pageTheme == color.theme) {
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
}
function updateStyles(msg, styleList, pageTheme) {
    msg = msg.filter(msg.theme == pageTheme);
    styleList = styleList.filter(styleList.description.match(new RegExp(`(${pageTheme})`, "g")));
    msg.forEach(color => {
        let { name: colorName, rgb: colorRgb, opacity: colorOpacity, description: colorDescription, theme: colorTheme } = color;
        let styleItem = styleList.find(styleList.name == colorName);
        if (styleItem == undefined) {
            addStyle(color, pageTheme);
        }
        else {
            let { name, description: styleDescription, paints: stylePaints } = styleItem;
            let styleName = name.split("/");
            styleName = styleName[1].toString();
            const fills = clone(styleItem.paints);
            fills[0].color = colorRgb;
            fills[0].opacity = colorOpacity;
            stylePaints = fills;
            styleDescription = `${colorDescription} (${colorTheme})`;
        }
    });
    styleList.forEach(style => {
        let colorItem = msg.find(msg.name == style.name);
        if (colorItem == undefined) {
            style.remove();
        }
    });
}
function deleteAllStyles(styleList) {
    styleList.forEach(style => {
        style.remove();
    });
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
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    let styleList = figma.getLocalPaintStyles();
    let pageTheme = figma.currentPage.name;
    const nodes = [];
    if (pageTheme == "LIGHT" || "DARK") {
        console.log("UPDATING");
        updateStyles(msg, styleList, pageTheme);
    }
    else if (pageTheme == "DELETE") {
        console.log("DELETING");
        deleteAllStyles(styleList);
    }
    else {
        console.log("Try Changing Page Name to LIGHT or DARK");
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
    //CLOSE PLUGIN
    figma.closePlugin();
});
