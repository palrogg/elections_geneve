(function () {
  var mobileDevice = false;

  var svg_width = 630;
  if ($(window).width() < 640){
    svg_width = $(window).width();
    console.log('Custom width: ' + svg_width);
    $('.rotate').show();
    mobileDevice = true;
  }

  var svg = d3.select("svg#bar"),
      margin = {top: 20, right: 30, bottom: 30, left: 205},
      width = svg_width - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;
  svg.attr('width', svg_width);

  var tooltip = d3.select("body").append("div").attr("class", "barToolTip");

  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleBand().range([height, 0]);

  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var d = new Date();
  var targetFile = "data/data-ce.json?time=" + d.getHours() + '_' + d.getMinutes();
  console.log('Loading ' + targetFile + '...')
  d3.json(targetFile, function(error, data) {
      if (error) throw error;

      data.sort(function(a, b) { return a.value - b.value; });

      x.domain([0, d3.max(data, function(d) { return d.value; })]);
      y.domain(data.map(function(d) { return d.name2; })).padding(0.1);

      if(!mobileDevice){
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d); }).tickSizeInner([-height]));
      }

      counter = 11;
      g.append("g")
          .attr("class", "y axis")
          .call(d3.axisLeft(y).tickFormat(function(d){ counter -= 1; return counter + ". " + d}));

      g.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", function(d){ return "bar " + d.sigle})
          .attr("x", 0)
          .attr("height", y.bandwidth())
          .attr("y", function(d) { return y(d.name2); })
          .attr("width", function(d) { return x(d.value); })
          .on("mousemove", function(d){
              tooltip
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html((d.name2 + ' (' + d.sigle + ')') + "<br>" + + (d.value) + ' suffrages');
          })
          .on("mouseout", function(d){ tooltip.style("display", "none");});


      g.selectAll(".text")
        .data(data)
        .enter().append("text")
        .attr("class", "textLabel")
        .attr("x", function(d){ return 20 })
        .attr("y", function(d){ return y(d.name2) + height / 22; } )
        .attr("dx", -5)
        .attr("dy", ".36em")
        .attr("text-anchor", "start") // end si a droite
        .text(function(d){ return d.value + ' voix'; });


      /* separator line */
      svg.append('line')
          .attr('class', 'textlabelline')
          .attr("x1", 20)
          .attr('y1', y('Sandrine Salerno') + height / 20)
          .attr('x2', x(60000))
          .attr('y2', y('Sandrine Salerno') + height / 20)
          .attr('stroke', '#000')
          .attr('stroke-opacity', 0.8)
          .attr('stroke-width', 2)
  });
})();
