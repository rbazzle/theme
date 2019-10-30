figma.showUI(__html__, { visible: false });
figma.ui.postMessage({ type: 'networkRequest' });

figma.ui.onmessage = async msg => {
	//CONVERT #RRGGBBAA to RGBA PCT
	function hexAToRGBA255(h) {
		let r1 = '0x' + h[1] + h[2];
		let g1 = '0x' + h[3] + h[4];
		let b1 = '0x' + h[5] + h[6];
		let a1 = '0x' + h[7] + h[8];

		let r = +(Number(r1) / 255).toFixed(3);
		let g = +(Number(g1) / 255).toFixed(3);
		let b = +(Number(b1) / 255).toFixed(3);
		let a = +(Number(a1) / 255).toFixed(2);

		let colorObj = { r: r, g: g, b: b, a: a };

		return colorObj;
	}

	const nodes: SceneNode[] = [];

	function createTheme(item, rgba) {
		//CREATE RECTANGLES/CIRCLES

		const rect = figma.createRectangle();
		rect.name = item.Name;
		rect.cornerRadius = 100;
		rect.fills = [
			{
				type: 'SOLID',
				color: { r: rgba.r, g: rgba.g, b: rgba.b },
				opacity: rgba.a
			}
		];
		figma.currentPage.appendChild(rect);
		nodes.push(rect);

		//CREATE STYLES

		const style = figma.createPaintStyle();
		style.name = item.Name;
		style.paints = [
			{
				type: 'SOLID',
				color: { r: rgba.r, g: rgba.g, b: rgba.b },
				opacity: rgba.a
			}
		];
	}

	//ITERATE THROUGH ARRAY CONVERT AND ADD STYLES
	msg.forEach(item => {
		let rgba = hexAToRGBA255(item.HexString);
		createTheme(item, rgba);
	});

	figma.currentPage.selection = nodes;
	figma.viewport.scrollAndZoomIntoView(nodes);

	//CLOSE PLUGIN

	figma.closePlugin();
};
