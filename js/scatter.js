const chartContainer = d3.select("#scatter-plot");
const chartWidth = 720;
const chartHeight = 400;
const margin = { top: 24, right: 24, bottom: 64, left: 76 };

const svg = chartContainer
	.append("svg")
	.attr("viewBox", `0 0 ${chartWidth} ${chartHeight}`)
	.attr("role", "img")
	.attr("aria-labelledby", "scatter-chart-title scatter-chart-description");

svg.append("title")
	.attr("id", "scatter-chart-title")
	.text("TV energy consumption by star rating");

svg.append("desc")
	.attr("id", "scatter-chart-description")
	.text("Each point shows a TV's energy consumption and star rating.");

d3.csv("data/Ex5_TV_energy.csv", d3.autoType)
	.then((rows) => {
		const data = rows.filter((row) =>
			Number.isFinite(row.energy_consumpt) && Number.isFinite(row.star2)
		);

		if (data.length === 0) {
			svg.append("text")
				.attr("x", chartWidth / 2)
				.attr("y", chartHeight / 2)
				.attr("text-anchor", "middle")
				.text("No valid energy and star rating data found.");
			return;
		}

		const innerWidth = chartWidth - margin.left - margin.right;
		const innerHeight = chartHeight - margin.top - margin.bottom;

		const xScale = d3.scaleLinear()
			.domain(d3.extent(data, (row) => row.energy_consumpt))
			.nice()
			.range([margin.left, chartWidth - margin.right]);

		const yScale = d3.scaleLinear()
			.domain(d3.extent(data, (row) => row.star2))
			.nice()
			.range([chartHeight - margin.bottom, margin.top]);

		const xAxis = svg.append("g")
			.attr("transform", `translate(0, ${chartHeight - margin.bottom})`)
			.call(d3.axisBottom(xScale).ticks(8).tickSize(-innerHeight));

		const yAxis = svg.append("g")
			.attr("transform", `translate(${margin.left}, 0)`)
			.call(d3.axisLeft(yScale).ticks(7).tickSize(-innerWidth));

		svg.selectAll(".tick line")
			.attr("stroke", "#dce5e0")
			.attr("stroke-dasharray", "2,3");

		svg.selectAll(".domain")
			.attr("stroke", "#71847a");

		svg.append("g")
			.selectAll("circle")
			.data(data)
			.join("circle")
			.attr("cx", (row) => xScale(row.energy_consumpt))
			.attr("cy", (row) => yScale(row.star2))
			.attr("r", 4)
			.attr("fill", "#18765e")
			.attr("fill-opacity", 0.68)
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 0.7)
			.append("title")
			.text((row) => `${row.brand} | Energy: ${row.energy_consumpt} | Star rating: ${row.star2}`);

		xAxis.selectAll("text")
			.attr("fill", "#40554b");

		yAxis.selectAll("text")
			.attr("fill", "#40554b");

		svg.append("text")
			.attr("x", chartWidth / 2)
			.attr("y", chartHeight - 16)
			.attr("text-anchor", "middle")
			.attr("fill", "#20312d")
			.text("Energy consumption");

		svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -chartHeight / 2)
			.attr("y", 20)
			.attr("text-anchor", "middle")
			.attr("fill", "#20312d")
			.text("Star rating");
	})
	.catch((error) => {
		console.error("Could not load the TV energy data:", error);
		svg.append("text")
			.attr("x", chartWidth / 2)
			.attr("y", chartHeight / 2)
			.attr("text-anchor", "middle")
			.text("Could not load the data. Check the CSV path and local server.");
	});