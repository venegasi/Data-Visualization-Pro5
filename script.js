// URL del conjunto de datos
const url = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';

// Dimensiones del SVG
const width = 1000;
const height = 600;

// Colores para las categorías
const colors = d3.scaleOrdinal(d3.schemeCategory10);

// Crear SVG
const svg = d3.select('#treemap')
    .attr('width', width)
    .attr('height', height);

// Crear tooltip
const tooltip = d3.select('#tooltip')
    .style('opacity', 0);

// Cargar datos y crear el treemap
d3.json(url).then(data => {
    const root = d3.hierarchy(data)
        .eachBefore(d => d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);

    d3.treemap()
        .size([width, height])
        .paddingInner(1)
        .paddingOuter(3)
        (root);

    const tile = svg.selectAll('g')
        .data(root.leaves())
        .enter().append('g')
        .attr('transform', d => `translate(${d.x0},${d.y0})`);

    tile.append('rect')
        .attr('class', 'tile')
        .attr('id', d => d.data.id)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d => colors(d.data.category))
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .on('mouseover', (event, d) => {
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`)
                .attr('data-value', d.data.value)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => tooltip.transition().duration(500).style('opacity', 0));

    tile.append('text')
        .attr('class', 'tile-text')
        .selectAll('tspan')
        .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
        .enter().append('tspan')
        .attr('x', 4)
        .attr('y', (d, i) => 13 + i * 10)
        .text(d => d);

    // Crear la leyenda
    const legend = d3.select('#legend');

    const categories = root.leaves().map(nodes => nodes.data.category).filter((category, index, self) => self.indexOf(category) === index);

    const legendItem = legend.selectAll('.legend-item')
        .data(categories)
        .enter().append('div')
        .attr('class', 'legend-item');

    legendItem.append('div')
        .style('background-color', d => colors(d))
        .style('width', '20px')
        .style('height', '20px')
        .style('margin-right', '5px');

    legendItem.append('span')
        .text(d => d);
});
