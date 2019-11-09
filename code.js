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
figma.ui.postMessage({ type: 'networkRequest' });
figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
figma.ui.onmessage = (msg) => __awaiter(this, void 0, void 0, function* () {
    console.log(msg);
    let formatArr = [];
    let { lightTheme } = msg[0];
    lightTheme.forEach(element => {
        let { name } = element;
        console.log(name);
        let { r: r1, g: g1, b: b1, a } = element.colors.rgba;
        //CONVERT #RRGGBBAA to RGBA PCT
        let r = +Number(r1 / 255).toFixed(2);
        let g = +Number(g1 / 255).toFixed(2);
        let b = +Number(b1 / 255).toFixed(2);
        const style = figma.createPaintStyle();
        style.name = name;
        style.paints = [
            {
                type: 'SOLID',
                color: { r, g, b },
                opacity: a
            }
        ];
        let obj = {
            name: name,
            theme: 'Light',
            rgba: { r, g, b },
            opacity: a
        };
        formatArr.push(obj);
    });
    console.log(formatArr);
    let styleList = figma.getLocalPaintStyles();
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
        label.fills = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }];
        label.characters = name;
        label.fontSize = 30;
        label.x = 200;
        label.y = i * 150;
        label.textAlignVertical = 'TOP';
        label.lineHeight = {
            value: 100,
            unit: 'PIXELS'
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
