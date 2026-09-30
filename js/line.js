const lineWidth = 720;
const lineHeight = 400;
const lineMargin = { top: 28, right: 28, bottom: 64, left: 82 };
const priceColumn = "Average Price (notTas-Snowy)";

const lineSvg = d3.select("#line-chart")
	.append("svg")
	.attr("viewBox", `0 0 ${lineWidth} ${lineHeight}`)
	.attr("role", "img")
	.attr("aria-labelledby", "line-chart-title line-chart-description");

lineSvg.append("title")
	.attr("id", "line-chart-title")
	.text("Average Australian spot power price, 1998 to 2024");

lineSvg.append("desc")
	.attr("id", "line-chart-description")
	.text("A line chart of the annual average spot power price in dollars per megawatt hour from 1998 through 2024.");

d3.csv("data/Ex5_ARE_Spot_Prices.csv", d3.autoType)
	.then((rows) => {
		const priceData = rows
			.map((row) => ({
				year: row.Year,
				averagePrice: row[priceColumn]
			}))
			.filter((row) =>
				Number.isFinite(row.year) &&
				row.year >= 1998 &&
				row.year <= 2024 &&
				Number.isFinite(row.averagePrice)
			)
			.sort((first, second) => first.year - second.year);

		if (priceData.length === 0) {
			lineSvg.append("text")
				.attr("x", lineWidth / 2)
				.attr("y", lineHeight / 2)
				.attr("text-anchor", "middle")
				.text("No valid annual spot price data found.");
			return;
		}

		const innerWidth = lineWidth - lineMargin.left - lineMargin.right;
		const innerHeight = lineHeight - lineMargin.top - lineMargin.bottom;
		const xScale = d3.scaleLinear()
			.domain(d3.extent(priceData, (row) => row.year))
			.range([lineMargin.left, lineWidth - lineMargin.right]);

		const yScale = d3.scaleLinear()
			.domain([0, d3.max(priceData, (row) => row.averagePrice) * 1.1])
			.nice()
			.range([lineHeight - lineMargin.bottom, lineMargin.top]);

		const xAxis = lineSvg.append("g")
			.attr("transform", `translate(0, ${lineHeight - lineMargin.bottom})`)
			.call(d3.axisBottom(xScale).ticks(7).tickFormat(d3.format("d")));

		const yAxis = lineSvg.append("g")
			.attr("transform", `translate(${lineMargin.left}, 0)`)
			.call(d3.axisLeft(yScale).ticks(6).tickSize(-innerWidth));

		lineSvg.selectAll(".tick line")
			.attr("stroke", "#dce5e0")
			.attr("stroke-dasharray", "2,3");

		lineSvg.selectAll(".domain")
			.attr("stroke", "#71847a");

		xAxis.selectAll("text")
			.attr("fill", "#40554b");

		yAxis.selectAll("text")
			.attr("fill", "#40554b");

		const lineGenerator = d3.line()
			.x((row) => xScale(row.year))
			.y((row) => yScale(row.averagePrice));

		lineSvg.append("path")
			.datum(priceData)
			.attr("fill", "none")
			.attr("stroke", "#18765e")
			.attr("stroke-width", 3)
			.attr("stroke-linejoin", "round")
			.attr("stroke-linecap", "round")
			.attr("d", lineGenerator);

		lineSvg.append("g")
			.selectAll("circle")
			.data(priceData)
			.join("circle")
			.attr("cx", (row) => xScale(row.year))
			.attr("cy", (row) => yScale(row.averagePrice))
			.attr("r", 3.5)
			.attr("fill", "#18765e")
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 1)
			.append("title")
			.text((row) => `${row.year}: $${row.averagePrice.toFixed(2)} per MWh`);

		lineSvg.append("text")
			.attr("x", lineWidth / 2)
			.attr("y", lineHeight - 16)
			.attr("text-anchor", "middle")
			.attr("fill", "#20312d")
			.text("Year");

		lineSvg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -lineHeight / 2)
			.attr("y", 22)
			.attr("text-anchor", "middle")
			.attr("fill", "#20312d")
			.text("Average spot price ($/MWh)");
	})
	.catch((error) => {
		console.error("Could not load the spot power price data:", error);
		lineSvg.append("text")
			.attr("x", lineWidth / 2)
			.attr("y", lineHeight / 2)
			.attr("text-anchor", "middle")
			.text("Could not load the data. Open this page through a local server.");
	});