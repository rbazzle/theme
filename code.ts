figma.showUI(__html__, { visible: false });
figma.ui.postMessage({ type: 'networkRequest' });
figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });

figma.ui.onmessage = async msg => {
	console.log(msg);
	console.log("Hello")

	msg.forEach(element => {
		const lightTheme = element => {
			let { name } = element;
			let { r: r1, g: g1, b: b1, a } = element.light.rgba;
			//CONVERT #RRGGBBAA to RGBA PCT
			let r = +Number(r1 / 255).toFixed(3);
			let g = +Number(g1 / 255).toFixed(3);
			let b = +Number(b1 / 255).toFixed(3);
			const style = figma.createPaintStyle();
			style.name = 'LIGHT' + name;
			style.paints = [
				{
					type: 'SOLID',
					color: { r, g, b },
					opacity: a
				}
			];
		};

		const darkTheme = element => {
			let { name } = element;
			let { r: r1, g: g1, b: b1, a } = element.dark.rgba;
			//CONVERT #RRGGBBAA to RGBA PCT
			let r = +Number(r1 / 255).toFixed(3);
			let g = +Number(g1 / 255).toFixed(3);
			let b = +Number(b1 / 255).toFixed(3);
			const style = figma.createPaintStyle();
			style.name = 'DARK' + name;
			style.paints = [
				{
					type: 'SOLID',
					color: { r, g, b },
					opacity: a
				}
			];
		};
		lightTheme(element);
		darkTheme(element);
	});

	let styleList = figma.getLocalPaintStyles();
	console.log(styleList);

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
};
