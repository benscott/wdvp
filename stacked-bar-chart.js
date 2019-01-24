function StackedBarChart(svg, innerRadius) {

    var self = this;
    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var outerRadius = Math.min(width, height) * 0.35;
    var data = [];

    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height * 0.5 + ")");

    var x = d3.scaleBand()
        .range([0, 2 * Math.PI])
        .align(0);

    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius]);

    var z = d3.scaleOrdinal()
        .range(["yellow", "light-orange", "orange", "red", 'magenta', "purple"]);

    this.draw = function () {
        // Format dataset into the object expected by d3 radial scale
        data.columns = dataset.explainedByColumns;
        dataset.forEach(function (d, i) {
            if (typeof (d.properties['happinessScore']) !== 'undefined') {
                var obj = d.properties;
                // Ensure sum of all explainedCols match the total happiness score
                // If not, normalise the values
                if (obj['explainedByTotal'] != obj['happinessScore']) {
                    var diferential = d.properties['happinessScore'] / obj['explainedByTotal']
                    data.columns.forEach(function (column) {
                        obj[column] *= diferential
                    });
                }
                obj['id'] = d.id;
                data.push(obj)
            }
        });

        data.sort(function (a, b) { return b.happinessScore - a.happinessScore; });

        x.domain(data.map(function (d) { return d['name']; }));

        y.domain([0, d3.max(data, function (d) { return d.happinessScore; })]);

        z.domain(data.columns);

        var stack = d3.stack()
            .keys(data.columns)

        svg.append("g")
            .attr("class", "legendOrdinal")
            .attr("transform", "translate(20,20)");

        var legend = d3.legendColor()
            .labelFormat(d3.format(".2f"))
            .useClass(true)
            .scale(z)
            .on("cellclick", function (d) {
                self.filter(d)
            });

        svg.select(".legendOrdinal")
            .call(legend);

        g.selectAll("g.bars")
            .data(stack(data))
            .enter().append("g")
            .attr("fill", function (d) {
                return;
            })
            .attr("class", function (d) {
                return 'bar-group ' + z(d.key)
            })
            .selectAll("path")
            .data(function (d) { return d; })
            .enter().append("path")
            .attr("class", function (d) {
                return 'country-' + d.data.id;
            })
            .on("mouseover", function (d) {
                rotateMapToCentroid(d.data.centroid)
                highlightCountry(d.data)
            })
            .on("mouseout", function (d) {
                unHighlightCountry(d.data)
            })
            .attr("d", d3.arc()
                .innerRadius(function (d) {
                    return y(d[0]);
                })
                .outerRadius(function (d) {
                    return y(d[1]);
                })
                .startAngle(function (d) {
                    return x(d.data['name']);
                })
                .endAngle(function (d) {
                    return x(d.data['name']) + x.bandwidth();
                })
                .padAngle(0.01)
                .padRadius(innerRadius)
            );

        outerRadius += 10

        // var label = g.append("g")
        //     .selectAll("g")
        //     .data(data)
        //     .enter().append("g")
        //     .attr("text-anchor", "start")
        //     .attr("class", function (d) {
        //         return 'label country-' + d.id
        //     })
        //     .attr("transform", function (d) {
        //         return "rotate(" + ((x(d.name) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + outerRadius + ",0)";
        //     })
        //     .on("mouseover", function (d) {
        //         rotateMapToCentroid(d.centroid)
        //         highlightCountry(d)
        //     })
        //     .on("mouseout", function (d) {
        //         unHighlightCountry(d)
        //     })

        // label.append("text")
        //     .attr("transform", function (d) {
        //         return (x(d.name) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(0)translate(0,5)" : "rotate(0)translate(0,5)";
        //     })
        //     .text(function (d) { return d.name; })



    }

    this.filter = function (category) {
        // data.columns = [d]
        var stack = d3.stack()
            .keys(data.columns)

        data.sort(function (a, b) { return b[category] - a[category]; });

        // console.log(stack(data));

        // console.log(g.selectAll("g")
        //     .data(stack(data))
        //     .selectAll("path"))

        // g.selectAll("g.bars")
        //     .data(stack(data))
        //     // .selectAll("path")
        //     // .data(function (d) { return d; })
        //     .exit()
        //     .remove()

    }


}