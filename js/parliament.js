(function () {

  //$('h2#parliamentTitle').text('Grand Conseil: résultats provisoires (19h30)')
  var tableExists = false;
  var d = new Date();
  var targetFile = "data/data-gc.json?time=" + d.getHours() + '_' + d.getMinutes();
  console.log('Loading ' + targetFile + '...')

  // tooltip container
  tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

  toolval = tooltip.append("div");

  var parliamentWidth = 400, wWidth = $(window).width();
  if(wWidth < parliamentWidth){
    parliamentWidth = wWidth - 20;
  }

  function buildTooltip(d){
    var deltaStr = String(d.party.delta);
    if(d.party.delta > 0){
      deltaStr = '+' + deltaStr;
    }
    tooltip.style("visibility", "visible")
    .style("top",(d3.event.pageY-30)+"px").style("left",(d3.event.pageX+20)+"px");
    tooltip.select("div").html(d.party.name + ': ' + d.party.seats + ' sièges (' + deltaStr + ')');
  }

  var parliament = d3.parliament().width(parliamentWidth).height(330).innerRadiusCoef(0.5);
  parliament.enter.fromCenter(false).smallToBig(false);
  parliament.exit.toCenter(true).bigToSmall(true);
  parliament.on("mouseover",function(d){
    buildTooltip(d);
  });
  parliament.on("click", function(d){
    buildTooltip(d);
  });
  parliament.on("mouseout", function(){
    tooltip.style("visibility", "hidden");
  });

  function tabulate(data, columns, column_headers) {
      var table = d3.select('#tableContainer').append('table')
      var thead = table.append('thead')
      var	tbody = table.append('tbody');

      // append the header row
      thead.append('tr')
        .selectAll('th')
        .data(column_headers).enter()
        .append('th')
          .text(function (column) { return column; });

      // create a row for each object in the data
      var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

      // create a cell in each row for each column
      var cells = rows.selectAll('td')
        .data(function (row) {
          return columns.map(function (column) {
            return {column: column, value: row[column]};
          });
        })
        .enter()
        .append('td')
          .text(function (d) { return d.value; });
      return table;
    }

  var setData = function(d) {
      d3.select("svg#parliament").datum(d).call(parliament);
      if(!tableExists){
        tabulate(d, ['name', 'seats_and_delta', 'pourcentage'], ['Parti', 'Sièges', '% des voix']); // 2 column table
        tableExists = true;
      }
  };



  d3.json(targetFile, setData);

  $('#parliamentToolbar').append('<button class="pushed" id="load_2018">Résultats 2018</button><button id="load_2013" >Résultats 2013</button>')

  $('#load_2013').click(function(){
    d3.json("data/data-gc-2013.json", setData);
    $('#parliamentToolbar button').toggleClass('pushed')
  });

  $('#load_2018').click(function(){
    $('#parliamentToolbar button').toggleClass('pushed')

    d3.json(targetFile, setData);
  });
  /* LEGEND */
  // Legends section
  var colorDomain = [0.1, 1.1];

  var threshold = d3.scaleThreshold()
  .domain(colorDomain)
  .range(['#cc4aa7', '#e3aed5', '#fff']);

  d3.select("svg#parliament").append("g")
  .attr("class", "legendordinal")
  .attr("transform", "translate(30, 250)");

  // partiColors

  var ordinal = d3.scaleOrdinal()
  .domain(['EAG', 'PS', 'Ve',
    'PDC', 'PLR', 'MCG', 'UDC' ])
  .range(['#660c0c', '#d65050', '#04aa04',
   '#d66306', '#3860f5', '#cea106' , '#044704']);


  var legendordinal = d3.legendColor()
  .shape('circle')
  .shapeRadius(7)
  .shapePadding(30)
  .orient('horizontal')
  .scale(ordinal)
  .labelAlign("start");

  d3.select("svg#parliament").select(".legendordinal")
  .call(legendordinal);

  //# sourceURL=parliament.js
})();
