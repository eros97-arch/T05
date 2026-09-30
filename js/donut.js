const donutWidth = 720;
const donutHeight = 400;
const donutSvg = d3.select("#donut-chart")
	.append("svg")
	.attr("viewBox", `0 0 ${donutWidth} ${donutHeight}`)
	.attr("role", "img")
	.attr("aria-labelledby", "donut-chart-title donut-chart-description");

donutSvg.append("title")
	.attr("id", "donut-chart-title")
	.text("Mean energy consumption by screen type");

donutSvg.append("desc")
	.attr("id", "donut-chart-description")
	.text("A donut chart comparing mean labelled energy consumption in kilowatt-hours per year for LCD, LED, and OLED televisions.");

const energyColumn = "Mean(Labelled energy consumption (kWh/year))";

d3.csv("data/Ex5_TV_energy_Allsizes_byScreenType.csv", d3.autoType)
	.then((rows) => {
		const energyData = rows
			.map((row) => ({
				screenType: row.Screen_Tech,
				meanEnergy: row[energyColumn]
			}))
			.filter((row) => row.screenType && Number.isFinite(row.meanEnergy) && row.meanEnergy > 0);

		if (energyData.length === 0) {
			donutSvg.append("text")
				.attr("x", donutWidth / 2)
				.attr("y", donutHeight / 2)
				.attr("text-anchor", "middle")
				.text("No valid screen type energy data found.");
			return;
		}

		const colors = d3.scaleOrdinal()
			.domain(energyData.map((row) => row.screenType))
			.range(["#18765e", "#287b9b", "#d48a3f"]);

		const pieData = d3.pie()
			.value((row) => row.meanEnergy)
			.sort(null)(energyData);

		const arc = d3.arc()
			.innerRadius(76)
			.outerRadius(142);

		const donutGroup = donutSvg.append("g")
			.attr("transform", "translate(235, 200)");

		donutGroup.selectAll("path")
			.data(pieData)
			.join("path")
			.attr("d", arc)
			.attr("fill", (slice) => colors(slice.data.screenType))
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 2)
			.append("title")
			.text((slice) => `${slice.data.screenType}: ${slice.data.meanEnergy.toFixed(1)} kWh/year`);

		donutGroup.append("text")
			.attr("text-anchor", "middle")
			.attr("y", -5)
			.attr("fill", "#20312d")
			.attr("font-size", 15)
			.text("Mean annual");

		donutGroup.append("text")
			.attr("text-anchor", "middle")
			.attr("y", 17)
			.attr("fill", "#20312d")
			.attr("font-size", 15)
			.text("energy use");

		const legend = donutSvg.append("g")
			.attr("transform", "translate(440, 150)");

		const legendItems = legend.selectAll("g")
			.data(energyData)
			.join("g")
			.attr("transform", (_row, index) => `translate(0, ${index * 56})`);

		legendItems.append("circle")
			.attr("r", 7)
			.attr("fill", (row) => colors(row.screenType));

		legendItems.append("text")
			.attr("x", 17)
			.attr("y", 5)
			.attr("fill", "#20312d")
			.attr("font-weight", 700)
			.text((row) => row.screenType);

		legendItems.append("text")
			.attr("x", 17)
			.attr("y", 25)
			.attr("fill", "#52645c")
			.text((row) => `${row.meanEnergy.toFixed(1)} kWh/year`);
	})
	.catch((error) => {
		console.error("Could not load the all-sizes TV energy data:", error);
		donutSvg.append("text")
			.attr("x", donutWidth / 2)
			.attr("y", donutHeight / 2)
			.attr("text-anchor", "middle")
			.text("Could not load the data. Open this page through a local server.");
	});