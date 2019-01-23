function InfoBox() {

    var svg = d3.select("#legend svg");
    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var xScale = {},
        labelHeight = 30,
        barHeight = 20;

    var yScale = function (i) {
        return i * (labelHeight + barHeight) + labelHeight
    }

    this.init = function () {

        // xScale is a dictionary, so each value is scaled
        dataset.explainedByColumns.forEach(function (column) {
            var domain = [
                d3.min(dataset, function (d) {
                    return d.properties[column]
                }),
                d3.max(dataset, function (d) {
                    return d.properties[column]
                })
            ]
            xScale[column] = d3.scaleLinear()
                .domain(domain)
                .range([50, width]);
        });

        svg.selectAll("rect.background")
            .data(dataset.explainedByColumns)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", function (d, i) {
                return yScale(i)
            })
            .attr("rx", barHeight / 2)
            .attr("ry", barHeight / 2)
            .attr("width", width)
            .attr("height", barHeight)
            .attr("class", 'background')

        svg.selectAll("rect.bar")
            .data(dataset.explainedByColumns)
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", function (d, i) {
                return yScale(i)
            })
            .attr("rx", barHeight / 2)
            .attr("ry", barHeight / 2)
            .attr("width", 0)
            .attr("height", barHeight)
            .attr("fill", function (d) {
                return bar.getFill(d)
            })
            .attr("class", 'bar')

        // Add labels
        svg.selectAll("text.title")
            .data(dataset.explainedByColumns)
            .enter()
            .append("text")
            .text(function (d) {
                return d;
            })
            .attr("x", 0)
            .attr("y", function (d, i) {
                return yScale(i)
            })
            .attr("class", 'title')

        svg.selectAll("text.label")
            .data(dataset.explainedByColumns)
            .enter()
            .append("text")
            .attr("x", 0)
            .attr("y", function (d, i) {
                return yScale(i) + barHeight / 2
            })
            .attr("class", 'label')

        // svg.selectAll("rect")
        //     .data(dataset.explainedByColumns)
        //     .enter()
        //     .append("rect")
        //     .text(function (d) {
        //         return d;
        //     })

    }

    this.showLegend = function () {

        this.init()

        // Set up placeholder divs
        // svg.selectAll("g")
        //     .data(dataset.explainedByColumns)
        //     .enter()
        //     .append("g")
        //     .attr("id", function (d, i) {
        //         return self.labelToID(d)
        //     })
        //     .attr("class", "bar")



        // // d3.select("#legend").selectAll("div")
        //     .data(dataset.explainedByColumns)
        //     .enter()
        //     .append("div")
        //     .style("background-color", function (d) {
        //         return bar.getFill(d)
        //     })
        //     .attr("class", "bar")
        //     .text(function (d) { return d; });




    }

    this.removeLegend = function () {
        // d3.select("#legend").remove()
    }

    this.showCountry = function (country) {

        var properties = country.properties

        d3.select("#legend h2").html(properties.name + '<span>#' + properties.rank + '</span>');
        d3.select("#legend h3").text(properties.happinessScore);

        data = []
        dataset.explainedByColumns.forEach(function (column) {
            data.push({
                key: column,
                value: properties[column]
            })
        });

        svg.selectAll("rect.bar")
            .data(data)
            .transition()
            .duration(1000)
            .attr("width", function (d, i) {
                return xScale[d.key](d.value);
            })

        svg.selectAll("text.label")
            .data(data)
            .text(function (d) {
                return d.value.toFixed(2);
            })

        //     .enter()
        //     .append("rect")
        //     .attr("x", 0)
        //     .attr("y", function (d, i) {
        //         return yScale(i)
        //     })
        //     .attr("width", function (d, i) {
        //         console.log(d);
        //         return xScale[d.key](d.value);
        //     })
        //     .attr("height", yScale.bandwidth())
        //     .attr("fill", function (d) {
        //         return bar.getFill(d.key)
        //     });

        // var data = d;

        // this.removeLegend();



        // d3.select("#country-info").selectAll("div")
        //     .data(d3.keys(d))
        //     .enter()
        //     .filter(function (d, i) {
        //         return dataset.explainedByColumns.indexOf(d) !== -1
        //     })
        //     .append("div")
        //     .attr("class", "bar")
        //     .style("background-color", function (d) {
        //         return bar.getFill(d)
        //     })
        //     .style("width", function (d) {
        //         return scale(data[d]) + 'px'
        //     });



        // .data(d)
        // .enter()

        // .append("div")

        // .style("width", function (d) {
        //     return 200;
        // })
        // .attr("class", "bar")
        // .text(function (d) {
        //     console.log(data);
        //     return d;
        // });

    }


}