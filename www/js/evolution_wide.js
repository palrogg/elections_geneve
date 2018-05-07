(function () {
  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 30, left: 50},
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // parse the date / time
  var parseTime = d3.timeParse("%y");

  // set the ranges
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);

  // define the line
  var valueline = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.Participation); });

  // append the svg obgect to the body of the page
  // appends a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#evolution").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Get the data
  d3.csv("data/participation_historique.csv", function(error, data) {
    if (error) throw error;

    // format the data
    data.forEach(function(d) {
        d.date = d.date;
        d.Participation = +d.Participation;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, 100]);

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline);

    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 2)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.Participation); })
        .attr("fill", "steelblue");

    //d3.axisBottom.tick.format(d3.format("d"));

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
        .ticks()
          .tickFormat(d3.format("")));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y).ticks(20)
          .tickFormat(d3.format("-")));

    svg.append('line')
        .attr('class', 'textlabelline')
        .attr("x1", x(1948))
        .attr('y1', y(26))
        .attr('x2', x(1948))
        .attr('y2', y(20))
        .attr('stroke', '#000')
        .attr('stroke-opacity', 0.8)
        .attr('stroke-width', .2)

    svg.append('text')
        .attr('class', 'textLabel')
        .attr("x", x(1948))
        .attr('y', y(15))
        .attr('dx', 0)
        .attr('dy', 0)
        .attr("text-anchor", "middle")
        .text('1948: 27.9%')

  svg.append('line')
      .attr('class', 'textlabelline')
      .attr("x1", x(1989))
      .attr('y1', y(31))
      .attr('x2', x(1989))
      .attr('y2', y(20))
      .attr('stroke', '#000')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', .2)

  svg.append('text')
      .attr('class', 'textLabel')
      .attr("x", x(1989))
      .attr('y', y(15))
      .attr('dx', 0)
      .attr('dy', 0)
      .attr("text-anchor", "middle")
      .text('1989: 33.25%')


  svg.append('line')
      .attr('class', 'textlabelline')
      .attr("x1", x(2018))
      .attr('y1', y(33.5))
      .attr('x2', x(2018))
      .attr('y2', y(20))
      .attr('stroke', '#000')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', .2)

  svg.append('text')
      .attr('class', 'textLabel')
      .attr('style', 'font-weight: bold')
      .attr("x", x(2015))
      .attr('y', y(15))
      .attr('dx', 0)
      .attr('dy', 0)
      .attr("text-anchor", "middle")
      .text('2018: 35.0%')
  });
})();
