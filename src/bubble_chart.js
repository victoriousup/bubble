

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
  var height = 1000;

  // tooltip for mouseover functionality
  var tooltip = floatingTooltip('gates_tooltip', 240);

  // Locations to move bubbles towards, depending
  // on which view mode is selected.
  var center = { x: width / 2, y: height / 2 };

  var coordinates = [];
  var yearCenters = {
    2008: { x: width / 3, y: height / 2 },
    2009: { x: width / 2, y: height / 2 },
    2010: { x: 2 * width / 3, y: height / 2 }
  };

    // X locations of the year titles.
  var yearsTitleX = {
    2008: 160,
    2009: width / 2,
    2010: width - 160
  };

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
  function createNodes(rawData) {
    // Use map() to convert raw data into node data.
    // Checkout http://learnjsdata.com/ for more on
    // working with data.

    var industries = [];
    var group_count = 0;
    for (var el in rawData)
    {
      rawData[el].id = el;
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
    // group_count = 9;
    var root_cnt = Math.floor(Math.pow(group_count , 0.5));
    var first_cnt = ((root_cnt * (root_cnt + 1) - group_count) != 0)?Math.floor((root_cnt * (root_cnt + 2) - group_count)/2):0;
    var last_cnt = ((root_cnt * (root_cnt + 1) - group_count) != 0)?(group_count - root_cnt * (root_cnt - 1 ) - first_cnt):0;


    for (el in industries)
    {
      if (first_cnt !=0 && el < first_cnt)
      {
        ddx = 900/(first_cnt+1) * (el*1+1);
        ddy =  600 / (root_cnt+2) * 1;
      }
      else if (last_cnt !=0 && el > group_count - last_cnt - 1)
      {
        ddx = 900/(last_cnt+1) * (last_cnt - (group_count - el*1 - 1));
        ddy =  600 - 600 / (root_cnt+2) * 1;
      }
      else
      {
        ddx = 900/(root_cnt+1) * ((el-first_cnt) % root_cnt + 1);
        ddy =  600 / (root_cnt+2) * (Math.floor((el-first_cnt) / root_cnt) + 2);
      }
      ddx = 150 + Math.floor(ddx)
      ddy = 200 + Math.floor(ddy)
      var tmp = {};
      tmp.x = ddx; tmp.y = ddy;
      coordinates.push(tmp);
    }

    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(parseInt(d.Revenue*1)),
        value: parseInt(d.Revenue),
        name: d.Target,
        org: d.Industries,
        group: d.group,
        x: Math.random() * 1200,
        y: Math.random() * 1000
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
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    // Set initial layout to single group.
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
      d.y = d.y + (center.y - d.y - 100) * damper * alpha;
    };
  }

  /*
   * Sets visualization in "split by year mode".
   * The year labels are shown and the force layout
   * tick function is set to move nodes to the
   * yearCenter of their data's year.
   */
  function splitBubbles() {
    // showYears();

    force.on('tick', function (e) {
      bubbles.each(moveToYears(e.alpha))
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
  function moveToYears(alpha) {
    return function (d) {
      var target = coordinates[d.group];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  /*
   * Hides Year title displays.
   */
  function hideYears() {
    svg.selectAll('.year').remove();
  }

  /*
   * Shows Year title displays.
   */
  function showYears() {
    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var yearsData = d3.keys(yearsTitleX);
    var years = svg.selectAll('.year')
      .data(yearsData);

    years.enter().append('text')
      .attr('class', 'year')
      .attr('x', function (d) { return yearsTitleX[d]; })
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }


  /*
   * Function called on mouseover to display the
   * details of a bubble in the tooltip.
   */
  function showDetail(d) {
    // change outline to indicate hover state.
    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">Target: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Industry: </span><span class="value">' +
                  d.org +
                  '</span><br/>' +
                  '<span class="name">Revenue: </span><span class="value">' +
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
