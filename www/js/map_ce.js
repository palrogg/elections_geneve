(function () {
  var legend_svg, legendOrdinal;
  var geoChoice = 'ge';
  var columnChoice = 'participation';
  var roundChoice = 'r2';

  function getColumn(){
    return roundChoice + '_' + columnChoice;
  }

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


  var colorDict = {'20001': '#660c0c',
  '20002': '#660c0c',
  '20003': '#d65050',
  '20004': '#d65050',
  '20005': '#d65050',
  '20006': '#04aa04',
  '20007': '#04aa04',
  '20008': '#04aa04',
  '20009': '#cea106',
  '20010': '#cea106',
  '20011': '#cea106',
  '20012': '#3860f5',
  '20013': '#3860f5',
  '20014': '#3860f5',
  '20015': '#3860f5',
  '20016': '#3860f5',
  '20017': '#C39D1C',
  '20018': '#660c0c',
  '20019': '#044704',
  '20020': '#044704',
  '20021': '#044704',
  '20022': '#9D7034',
  '20023': '#9D7034',
  '20024': '#C39D1C',
  '20025': '#00D0AB',
  '20026': '#919D5A',
  '20027': '#919D5A',
  '20028': '#C39D1C',
  '20029': '#C39D1C',
  '20030': '#00D0AB',
  '20031': '#00D0AB'};

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
      if( columnChoice.search('participation') >= 0 ){
        partiString = '<p><b>' + row[getColumn()] + '%</b> de participation</p>';
      }else{
        partiString = '<p>Candidat sélectionné: <b>' + row[getColumn()] + ' voix recueillies </b> sur ' + row[roundChoice + '_Bulletins valables'] + ' bulletins valables (<b>' + Math.round(row[getColumn() + '_per100']) + '</b>%)</p>';
      }
      d3.select('#tooltip').html('<h3>' + row['Commune'] + '</h3>' + partiString );
    }
  }

  d3.queue()
    .defer(d3.json, geo[geoChoice]['geofile'])
    .defer(d3.csv, "data/geodata-ce-communes.csv", function(row){
      dataById.set(row.No, row);
    })
    .await(ready);

  function ready(error, geodata) {
    if (error)
    {
      console.log('Could not load data');
      throw error;
    }

    console.log(dataById)

    svg.append("g")
      .attr("class", "commune")
      .selectAll("path")
		  .data(topojson.feature(geodata, geodata.objects.lacs_communes).features)
      .enter().append("path")
      .attr("class", "boundary")
      .attr("fill", function(d){
        var result = dataById.get(d.properties.NO_COM_FED);
        if(!result){
          console.log('No result for ' + d.properties.NOM_MIN + '/' + d.properties.NO_COM_FED)
          return 'white';
        }else{
          return scale(dataById.get(d.properties.NO_COM_FED)[getColumn()]);
        }

        return 'white';
      })
      .attr("d", path)
      .on('mouseover', showTooltip);
  }


  function updateMap(column){
    legendScale = scale;
    columnChoice = column;

    console.log(getColumn())

    if( ( columnChoice.search('participation') < 0 ) ){

      var min = d3.min(d3.values(dataById), function(d) { return +d[getColumn() + '_per100']; });
      var max = d3.max(d3.values(dataById), function(d) { return +d[getColumn() + '_per100']; });

      // Floor / ceil min and max to the multiple of 5
      if (min > 0){
        min = Math.floor(min/5)*5;
      }
      max = Math.ceil(max/5)*5;

      // Avoid have
      if (((max - min) % 10 == 5) && (min > 5)){
        console.log('max-min % 10 == 5 => min -= 5')
        min -= 5;
      }
      customScale = d3.scaleLinear()
           .domain([min, max ])
           .range(['#fff', colorDict[columnChoice] ]);
      legendScale = customScale;
    }

    svg.selectAll(".boundary")
    .transition().duration(500)
    .attr("fill", function(d){
      if( columnChoice.search('participation') >= 0 ){
        return scale(dataById.get(d.properties.NO_COM_FED)[getColumn()]);
      }else{
        return customScale(dataById.get(d.properties.NO_COM_FED)[getColumn()+'_per100']);
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

      legend_svg.select(".legendOrdinal")
      .call(legendOrdinal);
    }

  }

  $('#columnChoice').change(function(d){
    console.log($(this).val())
    updateMap( $(this).val() )
    $('#tooltip').text('Survoler ou toucher du doigt une commune pour voir le détail');
  })

  $('#roundChoice').change(function(d){
    console.log($(this).val())
    roundChoice = $(this).val();
    updateMap( $('#columnChoice').val() )
    if($(this).val() == 'r2'){
      $('.option_r1_only').hide();
    }else{
      $('.option_r1_only').show();
    }
    $('#tooltip').text('Survoler ou toucher du doigt une commune pour voir le détail');
  })

  // quick fix css on mobile
  $('.option_r1_only').hide();
})();
