(function () {
  var legend_svg, legendOrdinal;
  var geoChoice = 'ge';
  var columnChoice = 'parti_max';

  var scale = d3.scaleLinear()
      .domain([30, 50])
      .range(['#fff', '#34779D']);

  var customScale; // pour les partis

  var geo = {
    'ge':
    {
      'geofile': 'data/communes_geneve.json',
      'scale': 59000,
      'center': [6.4, 46.201549],
      'domain': [0.2, 0.4, .6, .8],
      'geodata': null
    }
  }

  var width = 400,
    height = 400;
  var scaleFactor = 1, translateX = 480, translateY = 268, legendPadding = 0;

  var windowWidth = $( window ).width();
  if (windowWidth < 450){
    // resize
    width = windowWidth - 20;
    ratio = width / 450;
    console.log("Width is " + windowWidth + " -> resize to ratio " + ratio);
    height *= ratio;
    scaleFactor *= ratio;
    translateX *= ratio;
    translateY *= ratio;
    legendPadding = 0;
  }


  var partiColors = {'EAG': '#660c0c',
   'MCG': '#cea106',
   'PDC': '#d66306',
   'PLR': '#3860f5',
   'SOC': '#d65050',
   'UDC': '#044704',
   'VERT': '#04aa04'};

  var svg = d3.select("#viz")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g");

  var projection = d3.geoMercator()
        .scale(scaleFactor * geo[geoChoice]['scale'])
        .center(geo[geoChoice]['center'])
        .translate([translateX, translateY]);

  var path = d3.geoPath()
      .projection(projection);

  var dataById = d3.map();

  function showTooltip(d, i){
    var row = dataById.get(d.properties.NO_COM_FED);
    var partiString = '';

    if(row){
      if( (columnChoice != 'Participation') && (columnChoice != 'parti_max') && (columnChoice != 'parti_max_2013') ){
        partiString = '<p>Parti sélectionné: <b>' + row[columnChoice] + '%</b></p>';
      }

      var en_tete = row['parti_max'];
      if(columnChoice == 'parti_max_2013'){
        if( row['parti_max_2013'] == row['parti_max']){
          en_tete += '</b> en 2013 et en 2018<b>';
        }else{
          en_tete = row['parti_max_2013'] + '</b> en 2013 mais <b>' + row['parti_max'] + '</b> en 2018<b>';
        }
      }
      d3.select('#tooltip').html(`
        <h3>` + row['Commune'] + `</h3>` + partiString + `
        <p><b>` + row['Participation'] + `%</b> de participation</p>
        <p>Parti en tête: <b>` + en_tete + `</b> (score: ` + row['max'] + `%)</p>
        `);
    }
  }

  d3.queue()
    .defer(d3.json, geo[geoChoice]['geofile'])
    .defer(d3.csv, "data/geodata-communes.csv", function(row){
      dataById.set(row.No, row);
    })
    .await(ready);

  function ready(error, geodata) {
    if (error)
    {
      console.log('Could not load data');
      throw error;
    }

    svg.append("g")
      .attr("class", "commune")
      .selectAll("path")
		  .data(topojson.feature(geodata, geodata.objects.lacs_communes).features)
      .enter().append("path")
      .attr("class", "boundary")
      .attr("fill", function(d){
        if(d.properties.NO_COM_FED == 0){
          return 'lightblue';
        }
        var result = dataById.get(d.properties.NO_COM_FED);
        if(!result){
          console.log('No result for ' + d.properties.NOM_MIN + '/' + d.properties.NO_COM_FED)
          return 'white';
        }else{
          return partiColors[ dataById.get(d.properties.NO_COM_FED)['parti_max'] ];
        }

        return 'white';
      })
      .attr("d", path)
      .on('mouseover', showTooltip);
  }



  function updateMap(column){
    legendScale = scale;
    columnChoice = column;

    if( (column != 'Participation') && (column != 'parti_max') && (column != 'parti_max_2013')){
      var maxArray = {101: 11.43,
         102: 20.8,
         103: 22.79,
         104: 54.51,
         105: 30.73,
         106: 11.2,
         107: 5.93,
         108: 1.95,
         109: 8.36,
         110: 8.37, /* vrai max: 8.37 */
         111: 18.18,
         112: 4.88,
         113: 1.79};
      var colorDict = {101: '#660c0c', // EAG
        102: '#04aa04', // VERT
        103: '#d65050', // SOC
        104: '#3860f5', // PLR
        105: '#d66306', // PDC
        106: '#044704', // UDC
        107: '#9A15D0', // FEM
        108: '#919D5A', // LPG
        109: '#9D7034', // GEMA
        110: '#C39D1C', // PBD
        111: '#cea106', // MCG
        112: '#00D0AB', // VERL
        113: '#62A2A9'}; // LEE
      customScale = d3.scaleLinear()
           .domain([0, maxArray[column] ])
           .range(['#fff', colorDict[column] ]);
      legendScale = customScale;
    }

    svg.selectAll(".boundary")
    .transition().duration(500)
    .attr("fill", function(d){
      if(column == 'Participation'){
        return scale(dataById.get(d.properties.NO_COM_FED)[column]);
      }else if(column == 'parti_max'){
        return partiColors[ dataById.get(d.properties.NO_COM_FED)['parti_max'] ];
      }else if(column == 'parti_max_2013'){
        return partiColors[ dataById.get(d.properties.NO_COM_FED)['parti_max_2013'] ];
      }else{
        return customScale(dataById.get(d.properties.NO_COM_FED)[column]);
      }
    });

    // Update or remove legend
    d3.select("#legend svg").remove();
    if ( (column != 'parti_max') && (column != 'parti_max_2013') ){
      legend_svg = d3.select("#legend").append('svg');

      legend_svg.append("g")
      .attr("class", "legendOrdinal")
      .attr("transform", "translate(20,20)");

      legendOrdinal = d3.legendColor()
      .shapePadding(legendPadding)
      .scale(legendScale)
      .title('Pourcentages');
      //.labelFormat(function(d){return Math.round(d) + '%'});

      legend_svg.select(".legendOrdinal")
      .call(legendOrdinal);
    }

  }

  $('#columnChoice').change(function(d){
    console.log($(this).val())
    updateMap( $(this).val() )
  })
})();
