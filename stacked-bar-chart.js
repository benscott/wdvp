function StackedBarChart(svg, innerRadius) {

    var width = +svg.attr("width");
    var height = +svg.attr("height");
    var outerRadius = Math.min(width, height) * 0.35;

    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height * 0.5 + ")");

    var x = d3.scaleBand()
        .range([0, 2 * Math.PI])
        .align(0);

    var y = d3.scaleRadial()
        .range([innerRadius, outerRadius]);

    var z = d3.scaleOrdinal()
        .range(["#9D7800", "#955C00", "#8A3C09", "#7A0022", '#800023', "#390E2D"]);

    this.draw = function () {
        // Format dataset into the object expected by d3 radial scale
        var data = []
        data.columns = dataset.explainedByColumns;
        dataset.forEach(function (d) {
            if (typeof (d.properties['total']) !== 'undefined') {
                var obj = d.properties;
                obj['id'] = d.id;
                data.push(obj)
            }
        });

        data.sort(function (a, b) { return b.total - a.total; });

        x.domain(data.map(function (d) { return d['name']; }));

        y.domain([0, d3.max(data, function (d) { return d.total; })]);

        z.domain(data.columns);

        var stack = d3.stack()
            .keys(data.columns)

        g.append("g")
            .selectAll("g")
            .data(stack(data))
            .enter().append("g")
            .attr("fill", function (d) {
                return z(d.key);
            })
            .selectAll("path")
            .data(function (d) { return d; })
            .enter().append("path")
            .attr("class", function (d) {
                return 'country-' + d.data.id
            })
            .on("mouseover", function (d) {
                rotateMapToCentroid(d.data.centroid)
                highlightCountry(d.data)
            })
            .on("mouseout", function (d) {
                unHighlightCountry(d.data)
            })
            .on("click", function (d) {
                showCountryInfo(d.data)
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

        var label = g.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("text-anchor", "start")
            .attr("class", function (d) {
                return 'label country-' + d.id
            })
            .attr("transform", function (d) {
                return "rotate(" + ((x(d.name) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + outerRadius + ",0)";
            })
            .on("mouseover", function (d) {
                rotateMapToCentroid(d.centroid)
                highlightCountry(d)
            })
            .on("mouseout", function (d) {
                unHighlightCountry(d)
            })
            .on("click", function (d) {
                showCountryInfo(d)
            })

        label.append("text")
            .attr("transform", function (d) {
                return (x(d.name) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(0)translate(0,5)" : "rotate(0)translate(0,5)";
            })
            .text(function (d) { return d.name; })



    }


}