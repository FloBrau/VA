let scatter_zoom_transform = null;

//Full function for rendering and transforming the scatterplot
function render_scatter(users_array, task_no = 1) {
    //Reset the plot
    let container = document.getElementById("scatter-chart");
    container.innerHTML = "";
    let used_height = container.clientWidth * 0.8;

    //Create a handy version of the pca values and the users 
    let task_users = users_array.map(user => {
        let task = user.task_performance.find(task => task.task_no === task_no);
        return {...user, pca1: task?.pca_x , pca2: task?.pca_y};
    })


    //If no user is selected
    if (task_users.length === 0) {
    document.getElementById("scatter-chart").innerHTML = `<div style = "height: ${used_height}px; display: flex; align-items: center; justify-content: center; color: #aaa;">No users match the current filters</div>`;
    return;
    };
    
    //Plot the scatterplot
    let plot = Plot.plot({
        width: container.clientWidth, 
        height: used_height,
        style: {fontSize: "11px"},
        y: {label: "Experience Cognitive Load"}, x: {label: "Task Interaction Effort"},
        marks: [
            Plot.dot(task_users, {
                x: "pca1", y: "pca2", r: 3.5, fill: user => get_dot_color(user), fillOpacity: 0.65, 
                title: user => `ID: ${user.id}\nAge: ${user.age === -1 ? "Unknown" : user.age} \nGender: ${user.gender === "m" ? "Male" : user.gender === "f" ? "Female" : user.gender === "d" ? "Diverse" : "Unknown"}
Education: ${user.education === -1 ? "Unknown" : upper_case(user.education)}\nHandedness: ${user.handedness === -1 ? "Unknown" : upper_case(user.handedness)}
DKT2 Score: ${user.dkt2_score > -1 ? user.dkt2_score.toFixed(2) + "%" : "Unknown"}\nSUS Score: ${user.sus_score > -1 ? user.sus_score : "Unknown"}
Avg. CL: ${user.avg_cl > -1 ? user.avg_cl.toFixed(2) : "Unknown"}\nAvg. Correctness: ${user.avg_correctness > -1 ? user.avg_correctness.toFixed(2) + "%" : "Unknown"}`
            }),
        ]
    });


    //Eventlistener for the dots and simulation of the click on the sidebar
    plot.querySelectorAll("circle").forEach((circle, index) => {
        circle.addEventListener("click", (_) => {
          let title = circle.querySelector("title").textContent;
          let id = parseInt(title.match(/ID: (\d+)/)?.[1]);  
          let user_card = document.querySelector(`.user-card[onclick = "show_details(${id}, this)"]`);
          user_card.click();
          user_card.scrollIntoView({behavior: "smooth", block: "center"});
        });
    });

container.appendChild(plot);
document.querySelector(".col-md-6.ps-3").style.maxHeight = used_height + "px";


//Zooming and transformation of the different components
let svg = d3.select(container.querySelector("svg"));

//Create real D3-axis based on the observable plot
let x_scale_obj = plot.scale("x");
let x_axis = d3.axisBottom(d3.scaleLinear(x_scale_obj.domain, x_scale_obj.range));
let y_scale_obj = plot.scale("y");
let y_axis = d3.axisLeft(d3.scaleLinear(y_scale_obj.domain, y_scale_obj.range));

//Hiding elements from the original scatterplot
svg.selectAll("[aria-label = 'x-axis tick'], [aria-label = 'y-axis tick'], [aria-label = 'x-axis tick label'],"
    + "[aria-label = 'y-axis tick label']").style("display", "none");

//Create new axis-lines through the graph (Lines for x=0  and y=0)
let x_scale = x_axis.scale();
let vert_line = svg.append("line").attr("x1", x_scale(0)).attr("x2", x_scale(0)).attr("y1", -9999)
      .attr("y2", 9999).attr("stroke", "#eceded").attr("stroke-width", 1);

let y_scale = y_axis.scale();
let hor_line = svg.append("line").attr("x1", -9999).attr("x2", 9999).attr("y1", y_scale(0))
      .attr("y2", y_scale(0)).attr("stroke", "#eceded").attr("stroke-width", 1);

//White rectangles to simulate cuts    
svg.append("rect").attr("x", 0).attr("y", 0).attr("width", x_scale_obj.range[0])
    .attr("height", used_height).attr("fill", "white");
svg.append("rect").attr("x", 0).attr("y", y_scale_obj.range[0]).attr("width", svg.attr("width"))
    .attr("height", used_height).attr("fill", "white");  
svg.append("rect").attr("x", x_scale_obj.range[1]).attr("y", 0).attr("width", x_scale_obj.range[1])
    .attr("height", used_height).attr("fill", "white");
svg.append("rect").attr("x", 0).attr("y", 0).attr("width", svg.attr("width"))
    .attr("height", y_scale_obj.range[1]).attr("fill", "white");

//New x- and y-axis    
let gx = svg.append("g").attr("transform", `translate(0, ${y_scale_obj.range[0]})`);
x_axis(gx);
let gy = svg.append("g").attr("transform", `translate(${x_scale_obj.range[0]}, 0)`)
y_axis(gy);
gx.style("font-size", "11px");
gy.style("font-size", "11px");
gx.select(".domain").remove();
gy.select(".domain").remove();

//append the original x- and y-axis label 
svg.node().append(svg.select("[aria-label = 'x-axis label']").node(), svg.select("[aria-label = 'y-axis label']").node());

//Zoom function with max extent and memory  
let plot_width = x_scale_obj.range[1] - x_scale_obj.range[0];
let dots = svg.select("[aria-label = 'dot']");
let zoom = d3.zoom().scaleExtent([0.92, 15])
    .translateExtent([[x_scale_obj.range[0] - plot_width/15, y_scale_obj.range[1] - used_height/15], 
    [x_scale_obj.range[1] + plot_width/15, y_scale_obj.range[0] + used_height/15]])
    .on("zoom", ({transform}) => {
        scatter_zoom_transform = transform;
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

if (scatter_zoom_transform) {
    svg.call(zoom.transform, scatter_zoom_transform);
} else {
    svg.call(zoom.scaleBy, 0.92);
}    
svg.call(zoom);
}