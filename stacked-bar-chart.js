function StackedBarChart(svg, innerRadius) {

    var self = this;

    self.svg - svg;
    self.width = +svg.attr("width");
    self.height = +svg.attr("height");
    self.outerRadius = Math.min(self.width, self.height) * 0.35;
    self.data = [];
    self.filters = [];

    self.g = svg.append("g").attr("transform", "translate(" + self.width / 2 + "," + self.height * 0.5 + ")");

    self.x = d3.scaleBand()
        .range([0, 2 * Math.PI])
        .align(0);

    self.y = d3.scaleRadial()
        .range([innerRadius, self.outerRadius]);

    self.z = d3.scaleOrdinal()
        .range(["yellow", "light-orange", "orange", "red", 'magenta', "purple"]);

    this.addLegend = function () {
        d3.select("#legend").selectAll("div")
            .data(self.z.domain())
            .enter()
            .append("div")
            .attr("class", function (d) {
                return self.z(d);
            })
            .html(function (d) {
                return '<label class="container selected">' + d + '<span class="checkmark"></span></label>'
            })
            .on("click", function (d) {
                var label = d3.select(this).select('label')
                var select = !label.classed("selected")
                label.classed("selected", select)
                select ? self.removeFilter(d) : self.addFilter(d)
            })
    }

    this.draw = function () {
        // Format dataset into the object expected by d3 radial scale
        self.data.columns = dataset.explainedByColumns;
        dataset.forEach(function (d) {
            if (typeof (d.properties['happinessScore']) !== 'undefined') {
                var obj = d.properties;
                // Ensure sum of all explainedCols match the total happiness score
                // If not, normalise the values
                if (obj['explainedByTotal'] != obj['happinessScore']) {
                    var diferential = d.properties['happinessScore'] / obj['explainedByTotal']
                    self.data.columns.forEach(function (column) {
                        obj[column] *= diferential
                    });
                }
                obj['id'] = d.id;
                self.data.push(obj)
            }
        });

        self.data.sort(function (a, b) {
            return d3.descending(a.happinessScore, b.happinessScore)
        });

        self.x.domain(self.data.map(function (d) { return d['name']; }));

        self.y.domain([0, d3.max(self.data, function (d) { return d.happinessScore; })]);

        self.z.domain(self.data.columns);

        var stack = d3.stack()
            .keys(self.data.columns)

        self.addLegend();

        self.g.selectAll("g.bar-group")
            .data(stack(self.data))
            .enter().append("g")
            .attr("fill", function (d) {
                return 'red';
            })
            .attr("class", function (d) {
                return 'bar-group ' + self.z(d.key)
            })
            .selectAll("path.bar")
            .data(function (d) { return d; })
            .enter().append("path")
            .attr("class", function (d) {
                return 'bar country-' + d.data.id;
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
                    return self.y(d[0]);
                })
                .outerRadius(function (d) {
                    return self.y(d[1]);
                })
                .startAngle(function (d) {
                    return self.x(d.data['name']);
                })
                .endAngle(function (d) {
                    return self.x(d.data['name']) + self.x.bandwidth();
                })
                .padAngle(0.01)
                .padRadius(innerRadius)
            );

        var labelRadius = self.outerRadius + 10

        var label = self.g.append("g")
            .selectAll("g.label")
            .data(self.data)
            .enter()
            .append("g")
            .attr("text-anchor", "start")
            .attr("class", function (d) {
                return 'label country-' + d.id
            })
            .attr("transform", function (d) {
                return "rotate(" + ((self.x(d.name) + self.x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + labelRadius + ",0)";
            })
            .on("mouseover", function (d) {
                rotateMapToCentroid(d.centroid)
                highlightCountry(d)
            })
            .on("mouseout", function (d) {
                unHighlightCountry(d)
            })

        label.append("text")
            .attr("transform", function (d) {
                return (self.x(d.name) + self.x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(0)translate(0,5)" : "rotate(0)translate(0,5)";
            })
            .text(function (d) { return d.name; })
    }

    this.addFilter = function (category) {
        this.filters.push(category)
        this.filterChart()
    }

    this.removeFilter = function (category) {
        this.filters.splice(this.filters.indexOf(category), 1)
        this.filterChart()
    }

    this.getData = function () {
        return self.data
    }

    this.filterChart = function () {

        var transition = d3.transition().duration(200);

        var sortColumns = []
        self.data.columns.forEach(function (column) {
            if (self.filters.indexOf(column) == -1) {
                sortColumns.push(column)
            }

        });
        self.data.sort(function (a, b) {
            aTotal = 0
            bTotal = 0
            sortColumns.forEach(function (column) {
                aTotal += a[column]
                bTotal += b[column]
            });
            return d3.descending(aTotal, bTotal)
        });

        // Create a copy. Is this really the best way of doing this!?!
        var dataCopy = JSON.parse(JSON.stringify(self.data));

        // If a filter has been applied, hide the bar by setting length to zero
        dataCopy.forEach(function (d, i) {
            self.filters.forEach(function (filter) {
                d[filter] = 0
            });
        })


        console.log(sortColumns);

        // Sort the data by subtracting
        // dataCopy.sort(function (a, b) {
        //     var aTotal = a['happinessScore'];
        //     var bTotal = b['happinessScore'];
        //     self.filters.forEach(function (filter) {
        //         aTotal -= a[filter];
        //         bTotal -= b[filter]
        //     });
        //     d3.descending(aTotal, bTotal)
        //     // return bTotal - aTotal
        // });



        var item = self.data.columns[Math.floor(Math.random() * self.data.columns.length)];

        console.log(item)





        // var sort = function (a, b) {
        //     return d3.descending(a['GDP per capita'], b['GDP per capita'])
        // };

        self.x.domain(dataCopy.map(function (d) { return d['name']; }));
        self.y.domain([0, d3.max(dataCopy, function (d) { return d.happinessScore; })]);

        var stack = d3.stack().keys(self.data.columns)

        // transition.selectAll("g.bar-group")
        //     .data(stack(dataCopy))
        //     .selectAll("path.bar")
        //     .data(function (d) { return d; })

        self.g.selectAll("g.bar-group")
            .data(stack(dataCopy))
            .selectAll("path.bar")
            .data(function (d) { return d; })
            .attr("class", function (d) {
                return 'bar country-' + d.data.id;
            })

        self.g.selectAll("g.bar-group")
            .selectAll(".bar")
            .transition()
            .duration(20)
            .attr("d", d3.arc()
                .innerRadius(function (d) {
                    return self.y(d[0]);
                })
                .outerRadius(function (d) {
                    return self.y(d[1]);
                })
                .startAngle(function (d) {
                    return self.x(d.data['name']);
                })
                .endAngle(function (d) {
                    return self.x(d.data['name']) + self.x.bandwidth();
                })
                .padAngle(0.01)
                .padRadius(innerRadius)
            )


        // .on("mouseover", function (d) {
        //     console.log(d);
        //     // rotateMapToCentroid(d.data.centroid)
        //     highlightCountry(d.data)
        // })
        // .on("mouseout", function (d) {
        //     unHighlightCountry(d.data)
        // })

        // Reattach the events
        // groups.selectAll(".bar")
        //     .data(function (d) { return d; })
        //     .on("mouseover", function (d) {
        //         rotateMapToCentroid(d.data.centroid)
        //         highlightCountry(d.data)
        //     })
        //     .on("mouseout", function (d) {
        //         unHighlightCountry(d.data)
        //     })
        //     .data(function (d) { return d; })

        // transition.selectAll("g.bar-group")
        //     .selectAll(".bar")
        //     // .data(function (d) { return d; })
        //     .attr("d", d3.arc()
        //         .innerRadius(function (d) {
        //             return self.y(d[0]);
        //         })
        //         .outerRadius(function (d) {
        //             return self.y(d[1]);
        //         })
        //         .startAngle(function (d) {
        //             return self.x(d.data['name']);
        //         })
        //         .endAngle(function (d) {
        //             return self.x(d.data['name']) + self.x.bandwidth();
        //         })
        //         .padAngle(0.01)
        //         .padRadius(innerRadius)
        //     );


        // transition.selectAll("g.bar-group").each(function (group, i) {
        //     d3.select(this).selectAll(".bar")
        //         .data(function (d) { return d; })
        //         .attr("d", d3.arc()
        //             .innerRadius(function (d) {
        //                 return self.y(d[0]);
        //             })
        //             .outerRadius(function (d) {
        //                 return self.y(d[1]);
        //             })
        //             .startAngle(function (d) {
        //                 return self.x(d.data['name']);
        //             })
        //             .endAngle(function (d) {
        //                 return self.x(d.data['name']) + self.x.bandwidth();
        //             })
        //             .padAngle(0.01)
        //             .padRadius(innerRadius)
        //         );
        // })

        self.g.selectAll("g.label")
            .data(dataCopy)
            .attr("class", function (d) {
                return 'label country-' + d.id
            })
            .select('text')
            .text(function (d) { return d.name; })
            .attr("transform", function (d) {
                return (self.x(d.name) + self.x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(0)translate(0,5)" : "rotate(0)translate(0,5)";
            })


        // label.selectAll('text')
        //     .data(dataCopy)



        // .data(function (d) { return d; })

        // transition.selectAll("g.label")
        //     .selectAll('text')


        //     .text(function (d) { return d.name; })


        // .text(function (d) { return d.name; })

        // console.log(label.selectAll('text'));


        // label.append("text")
        //     .attr("transform", function (d) {
        //         return (self.x(d.name) + self.x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(0)translate(0,5)" : "rotate(0)translate(0,5)";
        //     })
        // .text(function (d) { return d.name; })



        // var label = g.append("g")
        //     .selectAll("g")
        //     .data(self.data)
        //     .enter().append("g")
        //     .attr("text-anchor", "start")
        //     .attr("class", function (d) {
        //         return 'label country-' + d.id
        //     })
        //     .attr("transform", function (d) {
        //         return "rotate(" + ((self.x(d.name) + self.x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + labelRadius + ",0)";
        //     })
        //     .on("mouseover", function (d) {
        //         rotateMapToCentroid(d.centroid)
        //         highlightCountry(d)
        //     })
        //     .on("mouseout", function (d) {
        //         unHighlightCountry(d)
        //     })
        // console.log(group)
        // console.log(d3.select(group).selectAll(".bar"))
        // group.selectAll(".bar")


        // })
        // transition.selectAll("g.bar-group")
        //     .selectAll(".bar")
        //     .attr("d", d3.arc()
        //         .innerRadius(function (d) {
        //             return self.y(d[0]);
        //         })
        //         .outerRadius(function (d) {
        //             return self.y(d[1]);
        //         })
        //         .startAngle(function (d) {
        //             return self.x(d.data['name']);
        //         })
        //         .endAngle(function (d) {
        //             return self.x(d.data['name']) + self.x.bandwidth();
        //         })
        //         .padAngle(0.01)
        //         .padRadius(innerRadius)
        //     );

        // .attr("x", function (d) {
        //     console.log('HEY')
        //     return xCopy(d.data.Generosity)
        // })

        // groups.selectAll("path.bar")
        //     .data(function (d) { return d; })
        //     .filter(function (d) {
        //         console.log(d);
        //         return false;
        //     })
        //     .exit()
        //     .remove()

        // groups.selectAll(".bar")
        //     .data(d => d, d => d.data.State)
        //     .sort((a, b) => xCopy(a.data.State) - xCopy(b.data.State))

        // // console.log(stack(data));



        // // g.selectAll("g.bars")
        // //     .data(stack(data))
        // //     // .selectAll("path")
        // //     // .data(function (d) { return d; })
        // //     .exit()
        // //     .remove()

        // self.update(category)

    }

    this.update = function (category) {
        console.log(category);

        var sort = function (a, b) {
            return d3.ascending(a.Generosity, b.Generosity);
        }

        const transition = d3.transition().duration(750);

        const xCopy = x.domain(data.sort(sort).map(d => d.Generosity)).copy();

        const groups = d3.selectAll("g.bar-group")
            .data(d3.stack().keys(['Generosity'])(data))
            .attr("fill", function (d) { return z(d.key); });

        const bars = groups.selectAll(".bar")
            .data(d => d, d => d.data.Generosity)
            .sort((a, b) => xCopy(a.data.Generosity) - xCopy(b.data.Generosity))

        // transi

        transition.selectAll("g.bar-group")
            .selectAll(".bar")
            .attr("x", function (d) {
                console.log('HEY')
                return xCopy(d.data.Generosity)
            })



        // data.sort(function (a, b) { return b.happinessScore - a.happinessScore; });

        // data = [...data];
        // const sortFn = (a, b) => d3.ascending(a.State, b.State);
        // const xCopy = x.domain(data.sort(sortFn).map(d => d.State)).copy();
        // const t = d3.transition().duration(750);
        // const delay = (d, i) => i * 20;

        // const groups = d3.selectAll("g.bar-group")
        //     .data(d3.stack().keys(keys)(data))
        //     .attr("fill", function (d) { return z(d.key); });



        // t.selectAll("g.bar-group")
        //     .selectAll(".bar")
        //     .delay(delay)
        //     .attr("x", function (d) { return xCopy(d.data.State) })

        // t.select(".axis.x")
        //     .call(xAxis)
        //     .selectAll("g")
        //     .delay(delay)
    }


}