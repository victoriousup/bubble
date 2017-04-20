

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
  // var fillColor = d3.scale.ordinal()
  //   .domain(['low', 'medium', 'high'])
  //   .range(['#d84b2a', '#beccae', '#7aa25c']);

  // Sizes bubbles based on their area instead of raw radius
  var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([2, 20]);

  /*
   * This data manipulation function takes the raw data from
   * the CSV file and converts it into an array of node objects.
   * Each node will store data and visualization values to visualize
   * a bubble.
   *
   * rawData is expected to be an array of data objects, read in from
   * one of d3's loading functions like d3.csv.
   *
   * This function returns the new node array, with a node in that
   * array for each element in the rawData input.
   */
  var industries = [];
  var legend = legend || {};
  var labels = labels || {};


  $("#lang_sw").on('change',function(){
    lang_flag = $(this).is(":checked")?"cn":"en";
    $("#all").html(translate("all",lang_flag))
    $("#industry").html(translate("industry",lang_flag));
    changeLegend(false);
    labels.text(function(d){
      return translate(industries[d], lang_flag);
    });
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
    for (var el in rawData)
    {
      rawData[el].id = el;
      rawData[el].Industries = rawData[el].Industries.replace(/\s*$/,'');
      rawData[el].Industries =  rawData[el].Industries.toUpperCase();
      if (industries.indexOf(rawData[el].Industries) == -1)
      {
        industries.push(rawData[el].Industries);
        rawData[el].group = group_count;
        group_count++;
      }
      else
      {
        rawData[el].id = el;
        rawData[el].group = industries.indexOf(rawData[el].Industries);
      }
    }
 
    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(parseInt(d.Revenue*1)),
        value: parseInt(d.Revenue),
        name: d.Target,
        org: d.Industries,
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
    var maxAmount = d3.max(rawData, function (d) { return parseInt(d.Revenue); });
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
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

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
    changeLegend(true);

    // Set initial layout to single group.
    // splitBubbles();
    groupBubbles();
  };

  /*
   * Sets visualization in "single group mode".
   * The year labels are hidden and the force layout
   * tick function is set to move all nodes to the
   * center of the visualization.
   */
  function groupBubbles() {
    hideYears();
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
   *
   * Positioning is adjusted by the force layout's
   * alpha parameter which gets smaller and smaller as
   * the force layout runs. This makes the impact of
   * this moving get reduced as each node gets closer to
   * its destination, and so allows other forces like the
   * node's charge force to also impact final location.
   */
  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

  /*
   * Sets visualization in "split by year mode".
   * The year labels are shown and the force layout
   * tick function is set to move nodes to the
   * yearCenter of their data's year.
   */
  function splitBubbles() {
    showYears();
    svg.attr("height", 1100);
    force.on('tick', function (e) {
      bubbles.each(moveToIndustries(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  /*
   * Helper function for "split by year mode".
   * Returns a function that takes the data for a
   * single node and adjusts the position values
   * of that node to move it the year center for that
   * node.
   *
   * Positioning is adjusted by the force layout's
   * alpha parameter which gets smaller and smaller as
   * the force layout runs. This makes the impact of
   * this moving get reduced as each node gets closer to
   * its destination, and so allows other forces like the
   * node's charge force to also impact final location.
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
   * Hides Year title displays.
   */
  function hideYears() {
    svg.selectAll('.industries').remove();
  }

  /*
   * Shows Year title displays.
   */
  function showYears() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var groupData = d3.keys(industries);
    labels = svg.selectAll('.industries')
      .data(groupData);

    labels.enter().append('text')
      .attr('class', 'industries')
      .attr('x', function (d) { console.log("x"+d + " = " + coordinates[d].x); return lbl_coordinates[d].x; })
      .attr('y', function (d) {  console.log("y"+d + " = " + coordinates[d].y); return lbl_coordinates[d].y; })
      .attr('text-anchor', 'middle')
      .text(function (d) {  var lang = $("#lang_sw").is(":checked")?"cn":"en"; return translate(industries[d].toLowerCase(),lang); });
  }


  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');
    var lang = $("#lang_sw").is(":checked")?"cn":"en";
    var content = '<span class="name">'+translate('Target', lang)+': </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">'+translate('Industries', lang)+': </span><span class="value">' +
                  translate(d.org.toLowerCase(), lang) +
                  '</span><br/>' +
                  '<span class="name">'+translate('Revenue', lang)+': </span><span class="value">' +
                  addCommas(d.value) +
                  '</span>';
    tooltip.showTooltip(content, d3.event);
  }

  /*
   * Hides tooltip
   */
  function hideDetail(d) {
    // reset outline
    d3.select(this)
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
    if (displayName === 'industry') {
      splitBubbles();
    } else {
      groupBubbles();
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

/*
 * Helper function to convert a number into a string
 * and add commas to it to improve presentation.
 */
function addCommas(nStr) {
  // nStr += '';
  // var x = nStr.split('.');
  // var x1 = x[0];
  // var x2 = x.length > 1 ? '.' + x[1] : '';
  // var rgx = /(\d+)(\d{3})/;
  // while (rgx.test(x1)) {
  //   x1 = x1.replace(rgx, '$1' + ',' + '$2');
  // }

  // return x1 + x2;
  return nStr + " $/Mon"
}

// Load the data.
// d3.csv('data/gates_money.csv', display);
d3.csv('data/revenue_data.csv', display);

// setup the buttons.
setupButtons();

/* Translate Function */

function translate(str, lang)
{
  var localstr  = []

  localstr["cn"] = {
    "target"    : "公司",
    "industries": "产业",
    "revenue"   : "营收",
    "all"       : "所有的公司",
    "industry"  : "公司按产业",
    "finance & business services" : "金融 & 商务服务",
    "healthcare & biotech"  : "医疗保健 & 生物技术",
    "consumer products & retail & e-commerce" : "消费品 & 零售 & 电子商务",
    "agriculture & food"  : "农业 & 食品",
    "industrials" : "工业",
    "energy & infrastructure & construction"  : "能源 & 基础设施 & 建设",
    "real estate & hospitality" : "房地产 & 酒店",
    "aerospace & defense" : " 航空 & 国防",
    "materials & chemicals"  : "材料 & 化学",
    "entertainment"  : "招待",
    "tmt" : "数字新媒体",
    "transportation"  : "运输",
    "education" : "教育",
    "automotive"  : "自动化"
  };
  localstr["en"] = {
    "target"    : "Target",
    "industries": "Industry",
    "revenue"   : "Revenue",
    "all"       : "All Companies",
    "industry"  : "Targets By Industries",
    "finance & business services" : "Finance & Business Services",
    "healthcare & biotech"  : "Healthcare & BioTech",
    "consumer products & retail & e-commerce" : "Consumer Products & Retail & E-Commerce",
    "agriculture & food"  : "Agriculture & Food",
    "industrials" : "Industrials",
    "energy & infrastructure & construction"  : "Energy & Infrastructure & Construction",
    "real estate & hospitality" : "Real Estate & Hospitality",
    "aerospace & defense" : "Aerospace & Defense",
    "materials & chemicals"  : "Materials & Chemicals",
    "entertainment"  : "Entertainment",
    "tmt" : "TMT",
    "transportation"  : "Transportation",
    "education" : "Education",
    "automotive"  : "Automotive"
  };
  return localstr[lang.toLowerCase()][str.toLowerCase()];
}

