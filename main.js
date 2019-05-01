// dimensions and margins of the graph
const margin = { top: 20, right: 20, bottom: 30, left: 200 };
const width = 960 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// ranges
const y = d3
  .scaleBand()
  .range([height, 0])
  .padding(0.1);
const x = d3.scaleLinear().range([0, width]);

// main SVG
const svg = d3
  .select('#chart_area')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// axes
const xAxisGroup = svg.append('g').attr('transform', 'translate(0,' + height + ')');
const yAxisGroup = svg.append('g');

// main function thats called with each selection change
function update(data) {
  const t = d3.transition().duration(1000);
  const rating_select = $('#rating_select').val();
  // complete the ranges by adding domains (data specific)
  x.domain([
    0,
    d3.max(data, function(d) {
      return d[rating_select];
    }),
  ]);
  y.domain(
    data.map(function(d) {
      return d.team_name;
    }),
  );
  // complete x axis
  xAxisGroup.transition(t).call(d3.axisBottom(x));
  // complete y axis
  yAxisGroup.transition(t).call(d3.axisLeft(y));

  // update bars:
  const rects = svg.selectAll('rect').data(data);
  rects.exit().remove();
  rects
    .enter()
    .append('rect')
    .attr('fill', 'steelblue')
    .attr('data-teamname', function(d) {
      return d.team_name;
    })
    .attr('y', function(d) {
      return y(d.team_name);
    })
    .attr('height', y.bandwidth())
    .on('mouseover', mouseOverBar)
    .on('mouseout', mouseOutOfBar)
    .merge(rects)
    .transition(t)
    .attr('width', function(d) {
      return x(d[rating_select]);
    });

  // update bar labels:
  const labels = svg.selectAll('text.value').data(data);
  labels.exit().remove();
  labels
    .enter()
    .append('text')
    .attr('class', 'value')
    .attr('fill', 'white')
    .attr('text-anchor', 'end')
    .merge(labels)
    .transition(t)
    .text(d => {
      return d[rating_select];
    })
    .attr('x', d => {
      return x(d[rating_select]) - 10;
    })
    .attr('y', d => {
      return y(d.team_name) + y.bandwidth() / 2 + 5;
    });
}
// helper functions:
function mouseOverBar() {
  let currentlyFocusedTeam = this.getAttribute('data-teamname');
  d3.select(this).attr('fill', 'DarkOrange');
  d3.selectAll('text')
    .filter(function() {
      return d3.select(this).text() == currentlyFocusedTeam;
    })
    .attr('font-weight', 'bold')
    .attr('font-size', '12px');
}
function mouseOutOfBar() {
  let currentlyFocusedTeam = this.getAttribute('data-teamname');
  d3.select(this).attr('fill', 'steelblue');
  d3.selectAll('text')
    .filter(function() {
      return d3.select(this).text() == currentlyFocusedTeam;
    })
    .attr('font-weight', 'normal')
    .attr('font-size', '10px');
}

// load data asynchronously and set locations
var locations;
d3.json('./data.json').then(function(data) {
  locations = data.locations;
  update(locations);
});

// event listener: dropdown selection
$('#rating_select').on('change', function() {
  update(locations);
});
