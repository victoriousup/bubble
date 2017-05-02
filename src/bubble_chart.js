

/* bubbleChart creation function. Returns a function that will
 * instantiate a new bubble chart given a DOM element to display
 * it in and a dataset to visualize.
 *
 * Organization and style inspired by:
 * https://bost.ocks.org/mike/chart/
 *
 */
function bubbleChart() {
  // Constants for sizing
  var width = 1200;
  var height = 900;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('gates_tooltip', 240);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  // Used when setting up force and
  // moving around nodes
  var damper = 0.10;

  // These will be set in create_nodes and create_vis
  var svg = null;
  var bubbles = null;
  var nodes = [];

  // Charge function that is called for each node.
  // Charge is proportional to the diameter of the
  // circle (which is stored in the radius attribute
  // of the circle's associated data.
  // This is done to allow for accurate collision
  // detection with nodes of different sizes.
  // Charge is negative because we want nodes to repel.
  // Dividing by 8 scales down the charge to be
  // appropriate for the visualization dimensions.
  function charge(d) {
    return -Math.pow(d.radius, 2.0)/10;
  }

  // Here we create a force layout and
  // configure it to use the charge function
  // from above. This also sets some contants
  // to specify how the force layout should behave.
  // More configuration is done below.
  var force = d3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.01)
    .friction(0.9);

  
  // Nice looking colors - no reason to buck the trend
  var fillColor = d3.scale.category20c();
  // console.log(fillColor);
  // function colores_google(n) {
  //   var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  //   var colores_g = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  //   return colores_g[n % colores_g.length];
  // }
  // var fillColor = d3.scale.ordinal()
  //   .domain(['low', 'medium', 'high'])
  //   .range(['#d84b2a', '#beccae', '#7aa25c']);

  // Sizes bubbles based on their area instead of raw radius
  var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([5, 60]);

  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function retrt142dsfdsaf8677jjrtyvdwhbnadfkcurns the new node array, with a node in that
   * array for each element in the rawData input.
   */
  var industries = [];
  var legend = legend || {};
  var legend_radius = legend_radius || {};
  var legend_stroke = legend_stroke || {};
  var labels = labels || {};

  // Hide Language Switching when click Language button.
  $("#lang_sw").on('change',function(){
    lang_flag = $(this).is(":checked")?"cn":"en";
    $("#all").html(translate("all",lang_flag))
    $("#industry").html(translate("industry",lang_flag));
    $("#netincome").html(translate("netincome",lang_flag));
    $("#scores").html(translate("scores",lang_flag));
    changeLegend(false);
    labels.text(function(d){
      return translate(industries[d], lang_flag);
    });
  });

  // Hide Tooltip when clicking close button.
  $('body').on('click','.tooltip .close_btn', function(e){
      // Reset node size
      svg.selectAll('.bubble')
          .classed('active', false)
          .transition()
          .ease(d3.easeElastic)
          .delay(0)
          .duration(1000)
          .attr('r', function (d) {
            return d.radius;
          })
          .attr('stroke', function(d){return d3.rgb(fillColor(d.group)).darker();});
      tooltip.hideTooltip();
  });
  
  function changeLegend(flg)
  {
    if (flg){
      legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", fillColor);

      legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function (d) {  var lang = $("#lang_sw").is(":checked")?"cn":"en"; return translate(industries[d].toLowerCase(), lang); } );
   
     // var legend_scale = d3.scale.sqrt()
     //            .domain([0, 1000000])
     //            .range([0, 100])
     //  legend_scale.domain([0,1000000])

      var formatSI = d3.format('s')
      var formatCurrencySI = function(d) { 
        if (d == 3) return 'Net Income < 0 or not disclosed'
        else return 'Net Income = US$' + d + 'M';
      }

      var circleKey = circleLegend()
          .scale(radiusScale)
          .tickValues([3, 100, 500, 999])
          .tickFormat(formatCurrencySI)
          .tickPadding(10)
          .orient("right") //default

      svg.append('g')
        .attr('transform', 'translate(100, 130)')
        .call(circleKey)

      legend_stroke
                      .append("rect")
                      .attr("x", 500)
                      .attr("y", function(d){return 20 + d.id*15})
                      .attr("width" , 30)
                      .attr("height" , function(d){ return d.size;})
                      .style("fill", "rgb(49, 130, 189)")
      legend_stroke.append("text")
                      .attr("x", 550)
                      .attr("y", function(d){return 20 + d.id*15 + d.id })
                      .attr("dy", ".35em")
                      .style("text-anchor", "start")
                      .text(function(d){return d.value;});


    } else {
      legend.select("text")
                .text(function (d) {  var lang = $("#lang_sw").is(":checked")?"cn":"en"; return translate(industries[d].toLowerCase(), lang); } );
    }

  }
  function createNodes(rawData) {
    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.

    var group_count = 0;
    var co_ord = [];

    rawData = rawData.filter(item => parseInteger(item["Net income (US$M)"])!=0);
    rawData = rawData.filter(item => item["Industries"].replace(/\s*$/,'')!='');

    for (var el in rawData)
    {
      rawData[el].id = el;
      // debugger;
      rawData[el].Industries = rawData[el].Industries.replace(/\s*$/,'');
      rawData[el].Industries =  rawData[el].Industries.toUpperCase();
      if (industries.indexOf(rawData[el].Industries) == -1)
      {
        industries.push(rawData[el].Industries);
        rawData[el].group = group_count;
        co_ord[rawData[el].group] = 1;
        group_count++;
      }
      else
      {
        rawData[el].id = el;
        rawData[el].group = industries.indexOf(rawData[el].Industries);
        co_ord[rawData[el].group]++;
      }
    }

    var myNodes = rawData.map(function (d) {
      var netincome = parseInteger(d["Net income (US$M)"]);
      var revenue = parseInteger(d["Revenue (US$M)"]);
      var year = parseInt(d["Funded year"]);
      return {
        id: d.id,
        radius: (netincome<0)?3:radiusScale(netincome),
        value: netincome,
        revenue: revenue,
        year: year,
        description: d["Description"],
        name: d["Target company"],
        org: d.Industries,
        url: d.Website,
        group: d.group,
        x: Math.random() * width,
        y: Math.random() * height
      };
    });
    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.value - a.value; });
    

    return myNodes;
  }

  /*
   * Main entry point to the bubble chart. This function is returned
   * by the parent closure. It prepares the rawData for visualization
   * and adds an svg element to the provided selector and starts the
   * visualization creation process.
   *
   * selector is expected to be a DOM element or CSS selector that
   * points to the parent element of the bubble chart. Inside this
   * element, the code will add the SVG continer for the visualization.
   *
   * rawData is expected to be an array of data objects as provided by
   * a d3 loading function like d3.csv.
   */
  var chart = function chart(selector, rawData) {
    // Use the max total_amount in the data as the max in the scale's domain
    // note we have to ensure the total_amount is a number by converting it
    // with `+`.
    var maxAmount = d3.max(rawData, function (d) { return parseInt(d["Net income (US$M)"]); });
    radiusScale.domain([0, maxAmount]);

    nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

    // Create a SVG element inside the provided selector
    // with desired size.
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });
    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.group); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.group)).darker(); })
      .attr('stroke-width', function(d){
        if (d.revenue < 100)
        {
          return 1;
        }else if ((d.revenue >= 100) && (d.revenue <= 500))
        {
          return 3;
        }else if (d.revenue > 500)
        {
          return 6;
        }
      })
      .attr('opacity', function(d){
        var yr = parseInt(d.year);
        if (yr<2014)
        {
          return 1;
        }
        else if((yr >= 2014) && (yr < 2016 ) )
        {
          return 0.7;
        }
        else if(yr >= 2016)
        {
          return 0.4;
        }
      })
      .on('click', function(d){
        var node = this, d3Node = d3.select(node);
        if (d3Node.classed('active')) {
            // Reset node size
						svg.selectAll('.bubble')
                .classed('active', false)
                .transition()
								.ease(d3.easeElastic)
								.delay(0)
								.duration(1000)
								.attr('r', function (d) {
									return d.radius;
								})
            hideDetail(d,this);
				}
				// If node is selected for first time
				else {
						// Change selected node to 'active'
						// Enlarge selected node, shrink all others
						svg.selectAll('.bubble')
              .classed('active', false)
              .transition()
							.ease(d3.easeElastic)
							.delay(0)
							.duration(800)
							.attr('r', function (d) {
								return (this === node) ? d.radius * 1.1 : d.radius;
							})
            d3Node.classed('active', true)
            showDetail(d, this);
    		}

      });
      // .on('mouseover', showDetail) 
      // .on('mouseout', hideDetail);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
      .duration(1000)
      .attr('r', function (d) { return d.radius; });


    legend = svg.selectAll(".legend")
      .data(fillColor.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    legend_stroke = svg.selectAll(".stroke_legend")
      .data(stroke_lg)
      .enter().append("g")
      .attr("class", "stroke_legend")
      .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });
    changeLegend(true);

    // Set initial layout to single group.
    // splitByNetIncome();
    groupAll();
  };

  /*
   * Sets visualization in "single group mode".
   */
  function groupAll() {
    hideIndividualLabels();
    // svg.attr("height", 900); 
    force.on('tick', function (e) {
      bubbles.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "single group mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it toward the center of
   * the visualization.
   */
  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

  /*
   * Sets visualization in "split by Net Income mode".
   */
  function splitByNetIncome() {
    showIndividualLabels(2);
    svg.attr("height", 1100);
    force.on('tick', function (e) {
      bubbles.each(moveToNetIncome(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "split by Net Income mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it the year center for that
   * node.
   */
  function moveToNetIncome(alpha) {
    return function (d) {
      var gn = 0;
      // if (d.value <0) gn = 0; else
      if (d.value >0 &&  d.value<=20) gn = 1;
      else if (d.value > 20 && d.value <= 50) gn = 2;
      else if (d.value > 50 && d.value <= 100) gn = 3;
      else if (d.value > 100) gn = 4;

      var target = netIncomeCenterPos[gn];
      d.x = d.x + (target.x - d.x) * damper * alpha ;
      d.y = d.y + (target.y - d.y) * damper * alpha ;
      // console.log(d);      
    };
  }

  /*
   * Sets visualization in "split by Industry mode".
   */

  function splitByIndustry() {
    showIndividualLabels(1);
    svg.attr("height", 1100);
    force.on('tick', function (e) {
      bubbles.each(moveToIndustries(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "split by Industry mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it the year center for that
   * node.
   */
  function moveToIndustries(alpha) {
    return function (d) {
      var target = coordinates[d.group];
      d.x = d.x + (target.x - d.x) * damper * alpha ;
      d.y = d.y + (target.y - d.y) * damper * alpha ;
      // console.log(d);      
    };
  }

  /*
   * Sets visualization in "split by Serra Scores mode".
   */
  function splitBySerraScores() {
    showIndividualLabels(3);
    svg.attr("height", 1100);
    force.on('tick', function (e) {
      bubbles.each(moveToSerraScores(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "split by Industry mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it the year center for that
   * node.
   */
  function moveToSerraScores(alpha) {
    return function (d) {
      var gn = 0
      if (d.year < 2014) gn = 0;
      else if (d.year >= 2014 && d.year < 2016) gn = 1;
      else if (d.year >= 2016) gn = 2;
      var target = scoresCenterPos[gn];
      d.x = d.x + (target.x - d.x) * damper * alpha ;
      d.y = d.y + (target.y - d.y) * damper * alpha ;
      // console.log(d);      
    };
  }



  /*
   * Hides Year title displays.
   */
  function hideIndividualLabels() {
    svg.selectAll('.industries').remove();
    svg.selectAll('.netincomes').remove();
    svg.selectAll('.scores').remove();
  }

  /*
   * Shows Year title displays.
   */
  function showIndividualLabels(nInd) {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    if (nInd == 1)
    {
      svg.selectAll('.netincomes').remove();      
      svg.selectAll('.scores').remove();      
      var groupData = d3.keys(industries);
      labels = svg.selectAll('.industries')
        .data(groupData);

      labels.enter().append('text')
        .attr('class', 'industries')
        .attr('x', function (d) { return lbl_coordinates[d].x; })
        .attr('y', function (d) { return lbl_coordinates[d].y; })
        .attr('text-anchor', 'middle')
        .text(function (d) {  var lang = $("#lang_sw").is(":checked")?"cn":"en"; return translate(industries[d].toLowerCase(),lang); });
    }
    else if (nInd == 2)
    {
      svg.selectAll('.industries').remove();
      svg.selectAll('.scores').remove();
      // svg.selectAll('.netincomes').remove();
      labels = svg.selectAll('.netincomes')
        .data(lbl_netIncome);
      labels.enter().append('text')
        .attr('class', 'netincomes')
        .attr('x', function(d){ return d.x;})
        .attr('y', function(d){ return d.y;})
        .attr('text-anchor', 'middle')
        .text(function(d){ var lang = $('#lang_sw').is(":checked")?"cn":"en"; return translate(d.value, lang);});
    }
    else if (nInd == 3)
    {
      svg.selectAll('.industries').remove();
      svg.selectAll('.netincomes').remove();
      labels = svg.selectAll('.scores')
        .data(lbl_scores);
      labels.enter().append('svg:image')
        .attr('class', 'scores')
        .attr('x', function(d){ return d.x;})
        .attr('y', function(d){ return d.y;})
        .attr('text-anchor', 'middle')
        .attr('xlink:href',function(d){ return 'img/star-'+d.id+'.png'})
        .attr('width',function(d){ return d.id*20})
        .attr('height',20)
        .attr('title',function(d){ var lang = $('#lang_sw').is(":checked")?"cn":"en"; return translate(d.value.toLowerCase(), lang);});
    }
  }


  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d, obj) {
    // change outline to indicate hover state.
    d3.selectAll('.bubble')
      .attr('stroke', function(d){
        if (this == obj)
          return 'black';
        else
          return d3.rgb(fillColor(d.group)).darker();
      });
    var lang = $("#lang_sw").is(":checked")?"cn":"en";
    var content = '<button class="close_btn">X</button>'+
                  '<span class="name">'+translate('Target Company', lang)+': </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">'+translate('Description', lang)+': </span><span class="value">' +
                  d.description +
                  '</span><br/>' +
                  '<span class="name">'+translate('Industries', lang)+': </span><span class="value">' +
                  translate(d.org.toLowerCase(), lang) +
                  '</span><br/>' +
                  '<span class="name">'+translate('Year', lang)+': </span><span class="value">' +
                  d.year +
                  '</span><br/>' +
                  '<span class="name">'+translate('Revenue US$M', lang)+': </span><span class="value">' +
                  d.revenue + ' US$M' +
                  '</span><br/>' +
                  '<span class="name">'+translate('Net Income US$M', lang)+': </span><span class="value">' +
                  d.value + '   US$M' +
                  '</span><br/>' + 
                  '<span class="name">'+translate('Web Site', lang)+': </span><span class="value"><a href="'+
                  url2link(d.url)+'" target="_blank">' + url2link(d.url) +
                  '</a></span>';
    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d, obj) {
    // reset outline
    d3.select(obj)
      .attr('stroke', d3.rgb(fillColor(d.group)).darker());

    tooltip.hideTooltip();
  }

  /*
   * Externally accessible function (this is attached to the
   * returned chart function). Allows the visualization to toggle
   * between "single group" and "split by year" modes.
   *
   * displayName is expected to be a string and either 'year' or 'all'.
   */
  chart.toggleDisplay = function (displayName) {
    if (displayName === 'all')
    {
      groupAll();
    }
    else if (displayName === 'industry') {
      splitByIndustry();
    } 
    else if (displayName === 'netincome') {
      splitByNetIncome();
    }
    else if (displayName === 'scores') {
      splitBySerraScores();
    }
  };

  // return the chart function from closure.
  return chart;
}

/*
 * Below is the initialization code as well as some helper functions
 * to create a new bubble chart instance, load the data, and display it.
 */

var myBubbleChart = bubbleChart();

/*
 * Function called once data is loaded from CSV.
 * Calls bubble chart function to display inside #vis div.
 */
function display(error, data) {
  if (error) {
    console.log(error);
  }

  myBubbleChart('#vis', data);
}

/*
 * Sets up the layout buttons to allow for toggling between view modes.
 */
function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);

      // Get the id of the button
      var buttonId = button.attr('id');

      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}


// Load the data.
d3.csv('data/data_new.csv', display);

// setup the buttons.
setupButtons();

/* parse integer function */
function parseInteger(nStr)
{
  var nRet = 0;
  if (nStr == undefined || nStr == '') nStr = '0';
  nRet = nStr.replace(/\,/g , ''); // 1125, but a string, so convert it to number
  nRet = parseInt(nRet , 10); 
  return nRet;
}
