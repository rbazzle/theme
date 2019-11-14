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
        style.description = `${description} ${figma.currentPage.name.toUpperCase()}`;
    }
    else {
        console.log("PAGE NAME DOES NOT MATCH");
    }
}
function updateStyle(color, style) {
    let { rgb, opacity } = color;
    const fills = clone(style.paints);
    fills[0].color.r = rgb;
    fills[0].opacity = opacity;
    color.paints = fills;
}
function deleteStyle(style) {
    style.remove;
}
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    let styleList = figma.getLocalPaintStyles();
    console.log(styleList);
    if (styleList.length > 0) {
        console.log("HERE");
        msg.forEach(color => {
            for (let i = 0; i < styleList.length; i++) {
                let { name: styleName, description: styleDesc } = styleList[i];
                let { type, name, theme } = color;
                let THEME = theme.toUpperCase();
                var regex = new RegExp(THEME, "g");
                if (`${type}/${name}` == styleName && styleDesc.match(regex)) {
                    updateStyle(color, styleList[i]);
                    console.log(`MATCHED ${color.name}`);
                }
                else {
                    console.log(`ADDED ${color.name}`);
                    addStyle(color);
                }
            }
        });
    }
    else {
        console.log("THERE");
        msg.forEach(color => {
            addStyle(color);
            console.log(`ADDED ${color.name}`);
        });
    }
    const nodes = [];
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
});
