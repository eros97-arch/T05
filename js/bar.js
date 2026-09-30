const barWidth = 720;
const barHeight = 400;
const barMargin = { top: 28, right: 24, bottom: 64, left: 88 };
const barEnergyColumn = "Mean(Labelled energy consumption (kWh/year))";

const barSvg = d3.select("#bar-chart")
	.append("svg")
	.attr("viewBox", `0 0 ${barWidth} ${barHeight}`)
	.attr("role", "img")
	.attr("aria-labelledby", "bar-chart-title bar-chart-description");

barSvg.append("title")
	.attr("id", "bar-chart-title")
	.text("Mean energy consumption for 55-inch TVs by screen type");

barSvg.append("desc")
	.attr("id", "bar-chart-description")
	.text("A bar chart comparing mean labelled energy consumption in kilowatt-hours per year for LCD, LED, and OLED 55-inch televisions.");

d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv", d3.autoType)
	.then((rows) => {
		const energyData = rows
			.map((row) => ({
				screenType: row.Screen_Tech,
				meanEnergy: row[barEnergyColumn]
			}))
			.filter((row) => row.screenType && Number.isFinite(row.meanEnergy));

		if (energyData.length === 0) {
			barSvg.append("text")
				.attr("x", barWidth / 2)
				.attr("y", barHeight / 2)
				.attr("text-anchor", "middle")
				.text("No valid 55-inch energy data found.");
			return;
		}

		const innerWidth = barWidth - barMargin.left - barMargin.right;
		const innerHeight = barHeight - barMargin.top - barMargin.bottom;
		const xScale = d3.scaleBand()
			.domain(energyData.map((row) => row.screenType))
			.range([barMargin.left, barWidth - barMargin.right])
			.padding(0.32);

		const yScale = d3.scaleLinear()
			.domain([0, d3.max(energyData, (row) => row.meanEnergy) * 1.15])
			.nice()
			.range([barHeight - barMargin.bottom, barMargin.top]);

		const colors = d3.scaleOrdinal()
			.domain(energyData.map((row) => row.screenType))
			.range(["#18765e", "#287b9b", "#d48a3f"]);

		const xAxis = barSvg.append("g")
			.attr("transform", `translate(0, ${barHeight - barMargin.bottom})`)
			.call(d3.axisBottom(xScale));

		const yAxis = barSvg.append("g")
			.attr("transform", `translate(${barMargin.left}, 0)`)
			.call(d3.axisLeft(yScale).ticks(6).tickSize(-innerWidth));

		barSvg.selectAll(".tick line")
			.attr("stroke", "#dce5e0")
			.attr("stroke-dasharray", "2,3");

		barSvg.selectAll(".domain")
			.attr("stroke", "#71847a");

		xAxis.selectAll("text")
			.attr("fill", "#40554b");

		yAxis.selectAll("text")
			.attr("fill", "#40554b");

		barSvg.append("g")
			.selectAll("rect")
			.data(energyData)
			.join("rect")
			.attr("x", (row) => xScale(row.screenType))
			.attr("y", (row) => yScale(row.meanEnergy))
			.attr("width", xScale.bandwidth())
			.attr("height", (row) => yScale(0) - yScale(row.meanEnergy))
			.attr("fill", (row) => colors(row.screenType))
			.append("title")
			.text((row) => `${row.screenType}: ${row.meanEnergy.toFixed(1)} kWh/year`);

		barSvg.append("g")
			.selectAll("text")
			.data(energyData)
			.join("text")
			.attr("x", (row) => xScale(row.screenType) + xScale.bandwidth() / 2)
			.attr("y", (row) => yScale(row.meanEnergy) - 8)
			.attr("text-anchor", "middle")
			.attr("fill", "#20312d")
			.attr("font-weight", 700)
			.text((row) => row.meanEnergy.toFixed(1));

		barSvg.append("text")
			.attr("x", barWidth / 2)
			.attr("y", barHeight - 16)
			.attr("text-anchor", "middle")
			.attr("fill", "#20312d")
			.text("Screen technology");

		barSvg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -barHeight / 2)
			.attr("y", 22)
			.attr("text-anchor", "middle")
			.attr("fill", "#20312d")
			.text("Mean energy consumption (kWh/year)");
	})
	.catch((error) => {
		console.error("Could not load the 55-inch TV energy data:", error);
		barSvg.append("text")
			.attr("x", barWidth / 2)
			.attr("y", barHeight / 2)
			.attr("text-anchor", "middle")
			.text("Could not load the data. Open this page through a local server.");
	});