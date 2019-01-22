function Globe(svg) {

    var projection = d3.geoOrthographic()
        .scale(mapScale)
        .rotate([0, 0])
        .translate([width / 2, height / 2])
        .clipAngle(90);

    var path = d3.geoPath().projection(projection);

    var dragging = function (d) {
        var rotate = projection.rotate();
        projection.rotate([d3.event.x * dragSensitivity, -d3.event.y * dragSensitivity, rotate[2]]);
        svg.selectAll("path.map").attr("d", path);
    }

    var subject = function (d) {
        var rotate = projection.rotate();
        return { x: rotate[0] / dragSensitivity, y: -rotate[1] / dragSensitivity };
    }

    var drag = d3.drag()
        .subject(subject)
        .on("start", function () {
            d3.event.sourceEvent.stopPropagation(); // silence other listeners
            if (d3.event.sourceEvent.which == 1)
                dragInitiated = true;
        })
        .on("drag", dragging);

    this.draw = function () {
        //Create a container in which all pan-able elements will live
        var map = svg.append("g")
            .call(drag);  //Bind the dragging behavior

        //Create a new, invisible background rect to catch drag events
        map.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("r", mapScale)
            .attr("class", "map-background")

        var world = map.selectAll("path")
            .data(dataset)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", function (d) {
                return 'map country-' + d.id
            })
            // Event handlers
            .on("mouseover", function (d) {
                if (d.properties.name) {
                    // svg.dispatch('mouseOverCountry', { detail: { country: 'bla bla bla' } })

                    highlightCountry(d)
                }
            })
            .on("mouseout", function (d) {
                // d3.select("#info-box").dispatch('mouseOutCountry')
                // unHighlightCountry()
            })
            .on("click", function (d) {
                showInfoBox(d)
            })
    }

    this.rotateToCentroid = function (centroid) {
        (function transition() {
            d3.transition()
                .duration(1500)
                .tween("rotate", function () {
                    var r = d3.interpolate(projection.rotate(), [-centroid[0], -centroid[1]]);
                    return function (t) {
                        projection.rotate(r(t));
                        svg.selectAll("path.map").attr("d", path)
                    };
                })
        })();
    }

}


// var width = 960, height = 960

// var svg = d3.select("body").append("svg")
//     .attr("width", width)
//     .attr("height", height)

// var innerRadius = 180,
//     outerRadius = Math.min(width, height) * 0.77,
//     g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height * 0.78 + ")");




// var x = d3.scaleBand()
//     .range([0, 2 * Math.PI])
//     .align(0);

// var y = d3.scaleRadial()
//     .range([innerRadius, outerRadius]);

// var z = d3.scaleOrdinal()
//     .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

// var fileName = './data/whr-data.csv';
// var labelColumn = 'Country'

// d3.csv(fileName, function (d, i, columns) {

//     // console.log(d);

//     // for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
//     d.total = d["Happiness score"];
//     delete d["Happiness score"];
//     return d;
// }, function (error, data) {
//     if (error) throw error;

//     // console.log()
//     console.log(data)

//     // weave(data, function (a, b) { return b[data.columns[6]] - a[data.columns[6]]; });

//     x.domain(data.map(function (d) { return d[labelColumn]; }));
//     y.domain([0, d3.max(data, function (d) { return d.total; })]);
//     z.domain(data.columns.slice(1));

//     var stack = d3.stack()
//         .keys(data.columns.slice(1))
//         .value(function (d, i) {
//             return d[i];
//         });

//     // console.log(data)

//     g.append("g")
//         .selectAll("g")
//         .data(stack(data))
//         .enter().append("g")
//         .attr("fill", function (d) {
//             return z(d.key);
//         })
//         .selectAll("path")
//         .data(function (d) { return d; })
//         .enter().append("path")
//         .attr("d", d3.arc()
//             .innerRadius(function (d) {
//                 return y(d[0]);
//             })
//             .outerRadius(function (d) {
//                 // console.log(y(d[1]));
//                 return y(d[1]);
//             })
//             .startAngle(function (d) {

//                 return x(d.data[labelColumn]);
//             })
//             .endAngle(function (d) {
//                 // console.log(x(d.data[labelColumn]) + x.bandwidth())
//                 return x(d.data[labelColumn]) + x.bandwidth();
//             })
//             .padAngle(0.01)
//             .padRadius(innerRadius));

//     var label = g.append("g")
//         .selectAll("g")
//         .data(data)
//         .enter().append("g")
//         .attr("text-anchor", "end")
//         .style('fill', 'white')
//         .attr("transform", function (d) { return "rotate(" + ((x(d[labelColumn]) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + outerRadius + ",0)"; });

//     // // label.append("line")
//     // //     .attr("x2", -5)
//     // //     .attr("stroke", "#000");

//     label.append("text")
//         .attr("transform", function (d) { return (x(d[labelColumn]) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(0)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
//         .text(function (d) { return d[labelColumn]; });

//     // var yAxis = g.append("g")
//     //     .attr("text-anchor", "end");

//     // var yTick = yAxis
//     //     .selectAll("g")
//     //     .data(y.ticks(10).slice(1))
//     //     .enter().append("g");

//     // yTick.append("circle")
//     //     .attr("fill", "none")
//     //     .attr("stroke", "#000")
//     //     .attr("stroke-opacity", 0.5)
//     //     .attr("r", y);

//     // yTick.append("text")
//     //     .attr("x", -6)
//     //     .attr("y", function (d) { return -y(d); })
//     //     .attr("dy", "0.35em")
//     //     .attr("fill", "none")
//     //     .attr("stroke", "#fff")
//     //     .attr("stroke-linejoin", "round")
//     //     .attr("stroke-width", 3)
//     //     .text(y.tickFormat(10, "s"));

//     // yTick.append("text")
//     //     .attr("x", -6)
//     //     .attr("y", function (d) { return -y(d); })
//     //     .attr("dy", "0.35em")
//     //     .text(y.tickFormat(10, "s"));

//     // yAxis.append("text")
//     //     .attr("x", -6)
//     //     .attr("y", function (d) { return -y(y.ticks(10).pop()); })
//     //     .attr("dy", "-1em")
//     //     .text("Population");

//     // var legend = g.append("g")
//     //     .selectAll("g")
//     //     .data(data.columns.slice(1).reverse())
//     //     .enter().append("g")
//     //     .attr("transform", function (d, i) { return "translate(-40," + (i - (data.columns.length - 1) / 2) * 20 + ")"; });

//     // legend.append("rect")
//     //     .attr("width", 18)
//     //     .attr("height", 18)
//     //     .attr("fill", z);

//     // legend.append("text")
//     //     .attr("x", 24)
//     //     .attr("y", 9)
//     //     .attr("dy", "0.35em")
//     //     .text(function (d) { return d; });
// });

// function weave(array, compare) {
//     var i = -1, j, n = array.sort(compare).length, weave = new Array(n);
//     while (++i < n) weave[i] = array[(j = i << 1) >= n ? (n - i << 1) - 1 : j];
//     while (--n >= 0) array[n] = weave[n];
// }