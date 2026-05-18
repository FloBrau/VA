function render_scatter(users_array) {
    let container = document.getElementById("scatter-chart");
    container.innerHTML = "";
    let used_height = container.clientWidth / 3;
    
    let plot = Plot.plot({
        width: container.clientWidth / 2.5, 
        height: used_height,
        style: {fontSize: "12px"},
        marks: [
            Plot.dot(users_array, {
                x: "pca1",
                y: "pca2",
                r: 5,
                fill: "#8496a8",
                fillOpacity: 0.8,
            }),
        ]
    });

    plot.querySelectorAll("circle").forEach((circle, index) => {
        circle.addEventListener("click", (_) => {
          let user_card = document.querySelector(`.user-card[onclick = "show_details(${users_array[index].id}, this)"]`);
          user_card.click();
          user_card.scrollIntoView({behavior: "smooth", block: "center"});
        });
    });

container.appendChild(plot);

let svg = d3.select(container.querySelector("svg"));

let x_scale_obj = plot.scale("x");
let x_axis = d3.axisBottom(d3.scaleLinear(x_scale_obj.domain, x_scale_obj.range));
let y_scale_obj = plot.scale("y");
let y_axis = d3.axisLeft(d3.scaleLinear(y_scale_obj.domain, y_scale_obj.range));

svg.selectAll("[aria-label = 'x-axis tick'], [aria-label = 'y-axis tick'], [aria-label = 'x-axis tick label'],"
    + "[aria-label = 'y-axis tick label']").style("display", "none");

let x_scale = x_axis.scale();
let vert_line = svg.append("line").attr("x1", x_scale(0)).attr("x2", x_scale(0)).attr("y1", -9999)
      .attr("y2", 9999).attr("stroke", "#eceded").attr("stroke-width", 1);

let y_scale = y_axis.scale();
let hor_line = svg.append("line").attr("x1", -9999).attr("x2", 9999).attr("y1", y_scale(0))
      .attr("y2", y_scale(0)).attr("stroke", "#eceded").attr("stroke-width", 1);

svg.append("rect").attr("x", 0).attr("y", 0).attr("width", x_scale_obj.range[0])
    .attr("height", used_height).attr("fill", "white");
svg.append("rect").attr("x", 0).attr("y", y_scale_obj.range[0]).attr("width", svg.attr("width"))
    .attr("height", used_height).attr("fill", "white");  
svg.append("rect").attr("x", x_scale_obj.range[1]).attr("y", 0).attr("width", svg.attr("width"))
    .attr("height", used_height).attr("fill", "white");
svg.append("rect").attr("x", 0).attr("y", 0).attr("width", svg.attr("width"))
    .attr("height", y_scale_obj.range[1]).attr("fill", "white");


let gx = svg.append("g").attr("transform", `translate(0, ${y_scale_obj.range[0]})`);
x_axis(gx);
let gy = svg.append("g").attr("transform", `translate(${x_scale_obj.range[0]}, 0)`)
y_axis(gy);

gx.select(".domain").remove();
gy.select(".domain").remove();

svg.node().append(svg.select("[aria-label = 'x-axis label']").node(), svg.select("[aria-label = 'y-axis label']").node());

let plot_width = x_scale_obj.range[1] - x_scale_obj.range[0];
let dots = svg.select("[aria-label = 'dot']");
let zoom = d3.zoom().scaleExtent([0.95, 15])
    .translateExtent([[x_scale_obj.range[0] - plot_width/15, y_scale_obj.range[1] - used_height/15], 
    [x_scale_obj.range[1] + plot_width/15, y_scale_obj.range[0] + used_height/15]])
    .on("zoom", ({transform}) => {
        let zx = transform.rescaleX(x_scale);
        let zy = transform.rescaleY(y_scale);
        dots.attr("transform", transform);
        gx.call(x_axis.scale(zx));
        gy.call(y_axis.scale(zy));
        gx.select(".domain").remove();
        gy.select(".domain").remove();
        vert_line.attr("x1", zx(0)).attr("x2", zx(0));
        hor_line.attr("y1", zy(0)).attr("y2", zy(0));
    });

svg.call(zoom.scaleBy, 0.95);    
svg.call(zoom);
}