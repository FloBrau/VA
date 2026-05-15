//Session stream prep
let comp_labels = {"-2": "Keyboard", "-1": "Other", "0": "Fulltext", "1": "Snippets",
                   "2": "Tilebar", "3": "WordCloud", "4": "Topiccloud", "5": "Searchbar", "6": "Imageslider"};
let context_labels = {0: "Word Cloud Term", 1: "TopicCloud Term", 2: "History Term", 3: "Chapter Expanded",
                        4: "Chapter Collapsed", 5: "Topicbar Interaction", 6: "Tilebar Item", 7: "Snippet Expansion",
                        8: "Jump to Fulltext", 9: "Searchbar Click", 10: "Image Navigation", 11: "Image Enlarged",
                        12: "Image Closed", 13: "Visualization Toggle", 14: "Like Button", 15: "Abstraction Change",
                        16: "Fulltext Sentence", 17: "Snippet Sentence"};
let init_labels = {"-1": "Unknown Init.", 0: "First Visit", 1: "Tab Focus", 2: "Helper Modal Close", 3: "Task Modal Close", 
                  4: "User Modal Close"};
let fin_labels = {"-1": "Unknown Fin.", 0: "Tab Blur", 1: "Helper Modal Open", 2: "Task Modal Open", 3: "User Modal Open",
                  4: "Exploration Destroy", 5: "Invalid"};
let types = ["MOUSE_MOVE", "MOUSE_SCROLL", "KEYPRESS", "MOUSE_CLICK"]; 
let colors = ["#dddddd", "#4e79a7", "#59a14f", "#e15759"];
let legend_labels = ["Mouse Move", "Mouse Scroll", "Keypress", "Mouse Click"];




function create_stream(task_no, session_id, user) {
let container = document.getElementById(`stream-chart-${task_no}`);

//Zoom prep
let px_per_second = null;
let offset = 0;
let rerender = null;
let max_zoom_reached = null
let last_bar_count = 0;


//Zoom
container.addEventListener("wheel", (event) => {
    event.preventDefault(); //disables normal scrolling
    if (!rerender) return;
    let factor = event.deltaY < 0 ? 1.2 : 0.8;
    if (max_zoom_reached && factor > 1) return;
    px_per_second *= factor;
    rerender()
}, {passive: false});


//mouse drag prep
let is_dragging = false;
let drag_start_x = null;
let drag_start_offset = null;

//mouse drag
container.addEventListener("mousedown", (event) => {
    is_dragging = true;
    drag_start_x = event.clientX;
    drag_start_offset = offset
});

document.addEventListener("mouseup", (_) => {
    is_dragging = false;
});

container.addEventListener("mousemove", (event) => {
    if (!is_dragging || !rerender) return;
    let delta_pixel = event.clientX - drag_start_x;
    let move = delta_pixel / px_per_second;
    offset = drag_start_offset - move;
    rerender();
});
    





//Histo     
function render_hist(events, active_types, container, bin_interval, common, plot_width, y_max = null) {
    let main = document.querySelector(".main-content");
    let scroll = main.scrollTop;
    let old = container.querySelector(".histo-plot");
    if (old) old.remove();

    let actual = {};

    let plot_histo = Plot.plot({
        width: plot_width, height: 280, marginLeft: 70, marginBottom: 5, marginRight: 20,
        x: {... common, ticks: [], label: null, axis: null},
        y: {label: "Event Intensity", grid: true, nice: true, domain: y_max ? [0, y_max] : undefined, ticks: 5},
        style: {fontSize: "11px"},
        marks: [
            Plot.text(["Mouse\nand\nKeypress\nEvents"], {
                frameAnchor: "left", dx: -50, fontSize: 11, textAnchor: "middle", lineHeight: 1.2
            }),
            ...types.filter(type => active_types.has(type)).map((type) => {
                let color_index = types.indexOf(type);
                return Plot.rectY(events.filter(data => data.type === type && data.time >= common.domain[0] && data.time <= common.domain[1]) ,
                    Plot.binX({y: "count",
                         title: (bin) => { 
                            let up = 0;
                            let down = 0;
                            let chapters = new Set();
                            bin.forEach(event => {
                                let chapter = event.chapter;
                                event.direction === "Up" ? up++ : 
                                event.direction === "Down" ? down++ : null;
                                chapter === -1 ? chapters.add("NoChap.") :
                                chapter !== null && chapter !== -1 ? chapters.add(chapter) : null;
                            });
                            let direction = up === 0 && down === 0 ? null : 
                                up === 0 ? "Down" :
                                down === 0 ? "Up" : "Up and Down";
                            let count = bin.length;
                            let keypress = bin.map(event => decodeURIComponent(event.input));
                            let filter_gather = keypress.filter(input => input.length > 1);
                            let string_array = bin.map(event => decodeURIComponent(event.search_string));
                            let string_input = string_array.join(", ");
                            if (filter_gather.length > 0) {
                                string_input = string_input.replace(new RegExp(`(${filter_gather.join("|")})`, "g"), "");
                            }
                            string_input = string_input.split(", ").map(string => string === "" ? "<empty>" : string).join(", ");
                            let components = [...new Set(bin.map(event => comp_labels[event.component]))];
                            if (components[0] === "Keyboard") {
                                return `${legend_labels[color_index]}\nEvents: ${count}\nString: ${string_input.length >= 1 ? string_input : "<empty>"}\nInput: ${keypress.join(", ")}`;
                                }
                            return `${legend_labels[color_index]}\n${count === 1 ? "Event" : "Events"}: ${count}${direction === "Up and Down" ? `\nDirections: ${direction}` : direction ? `\nDirection: ${direction}` : ""}\n${components.length === 1 ? "Component" : "Components"}: ${components.join(", ")}${chapters.size > 0 ? `\n${chapters.size === 1 ? "Chapter" : "Chapters"}: ${[...chapters].join(", ")}` : ""}`
                            }}, 
                        {x: "time", fill: colors[color_index], interval: bin_interval,
                         fillOpacity: type === "MOUSE_MOVE" ? 0.5 : 0.8, inset: 0.1, clip: true,})
                );
            }),  
            Plot.ruleY([0], {strokeWidth: 1.5})
        ]
    });


    plot_histo.classList.add("histo-plot");
    plot_histo.style.margin = "0";
    plot_histo.style.display = "block";
    plot_histo.style.minWidth = plot_width + "px";
    container.querySelector(".histo-legend").after(plot_histo);
    requestAnimationFrame((_) => main.scrollTop = scroll); 
}


let leg_activate = null;
//Histo Legend (some would say i stole this idea)
function render_legend(container, active_types, events, bin_interval, common, session_init_type, session_fin_type) {
    let info = document.createElement("span");

    info.style.cssText = "margin-left: auto; color: #8a8a8a";
    info.innerHTML = `Ses.Init.: ${init_labels[session_init_type]} &nbsp; &nbsp; Ses.End: ${fin_labels[session_fin_type]}`;

    let legend = document.createElement("div");
    legend.style.cssText = "display: flex; gap: 11px; padding: 8px 0 15px 50px; font: 11px system-ui, sans-serif;"
    
    types.forEach((type, index) => {
        let item = document.createElement("span");
        item.style.cssText = "cursor: pointer; display: flex; align-items: center; gap: 4px;";
        item.innerHTML = `<span style = "display: inline-block; width: 11px; height: 11px; background:${colors[index]};"></span>${legend_labels[index]}`;
        
        item.addEventListener("click", (_) => {
            active_types.has(type) ? active_types.delete(type) : active_types.add(type);
            item.style.opacity = active_types.has(type) ? "1" : "0.4";
            item.style.textDecoration = active_types.has(type) ? "none" : "line-through";
            leg_activate = true;
            if (rerender) rerender();
            leg_activate =  null;   
        });
        legend.appendChild(item);
    });
    container.appendChild(legend);
    legend.appendChild(info);
    legend.classList.add("histo-legend");

}


//Truncate Labels
function truncate_label(label, duration, container_width, visible_seconds) {
    if (!label) label = "Other";
    let available_width = ((container_width - 90) / visible_seconds) * duration;
    let max_chars = Math.floor(available_width / 6.8);
    
    if (max_chars < 1) return "";
    if (max_chars < 2) return ".";
    if (max_chars < 3) return "..";
    if (label.length > max_chars) {
        return label.substring(0, Math.max(0, max_chars - 2)) + "...";
    }
    return label;
}


//Timeline Dwellings
function render_dwelling(session_dwellings, container, total_length_x, common, plot_width, visible_seconds) {
    let old = container.querySelector(".dwelling-plot");
    if (old) old.remove();
    let plot_timeline_dwelling = Plot.plot({
    width: plot_width, height: 21, marginLeft: 70, marginTop: 0, marginBottom: 0, marginRight: 20,
    x: {... common, label: [], axis: null, tickFormat: () => ""},
    y: {domain: [0, 1], axis: null},
    style: {fontSize: "12px"},
    marks: [
        Plot.text(["Dewelling"], {
        frameAnchor: "left", dx: -47, fontSize: 11, textAnchor: "middle", lineHeight: 1.2
        }),
        Plot.rectX(session_dwellings, 
                        {x1: "start", x2: "end", y1: 0, y2: 1, fill: "#d1d1d1",
                        stroke: "#8a8a8a", strokeWidth: 0.5, clip: true,
                        title: dwell => `Dwelling\nFocus on: ${comp_labels[dwell.component] ?? "Other"}\nChapter: ${dwell.chapter === -1 ? "NoChap." : dwell.chapter}\nLength: ${(dwell.end - dwell.start).toFixed(2)}s`}),
            Plot.text(session_dwellings, {x: dwell => (dwell.start + dwell.end) / 2, y: 0.5, 
                    text: dwell => {
                        let label = comp_labels[dwell.component] ?? "Other";
                        let dwell_duration = dwell.end - dwell.start;
                        return truncate_label(label, dwell_duration, plot_width, visible_seconds ?? total_length_x);
                    } ,
                        fontSize: 10.5, fontWeight: "600", pointerEvents: "none", clip: true,
                })
        ]
    });
    plot_timeline_dwelling.classList.add("dwelling-plot");
    plot_timeline_dwelling.style.margin = "0";
    plot_timeline_dwelling.style.display = "block";
    plot_timeline_dwelling.style.minWidth = plot_width + "px";
    container.querySelector(".histo-plot").after(plot_timeline_dwelling);;
}


//Timeline Hovering
function render_hover(session_hoverings, container, total_length_x, common, plot_width, visible_seconds) {
    let old = container.querySelector(".hovering-plot");
    if (old) old.remove();
    let plot_timeline_hovering = Plot.plot({
        width: plot_width, height: 56, marginLeft: 70, marginTop: 0, marginBottom: 35, marginRight: 20,
        x: {...common, label: "Session Time (s)"},
        y: {domain: [0, 1], axis: null},
        style: {fontSize: "12px"},
        marks: [
            Plot.text(["Hover"], {
            frameAnchor: "left", dx: -50, fontSize: 11, textAnchor: "middle", lineHeight: 1.2
            }),
            Plot.rectX(session_hoverings, 
                          {x1: "start", x2: "end", y1: 0, y2: 1, fill: "#c3a8c9",
                          stroke: "#836f88", strokeWidth: 0.5, clip: true,
                          title: hover => `Hovering\nHovering on: ${comp_labels[hover.component] ?? "Other"}` +
                          `\nContext: ${context_labels[hover.context] ?? "NoCont."}\nChapter: ${hover.chapter === -1 ? "NoChap.": hover.chapter}` +
                          `\nLength: ${(hover.end - hover.start).toFixed(2) === "0.00" ? "<0.01" : (hover.end - hover.start).toFixed(2)}s`}),
                Plot.text(session_hoverings, {x: hover => (hover.start + hover.end) / 2, y: 0.5, 
                        text: hover => {
                            let label = comp_labels[hover.component];
                            let hover_duration = hover.end - hover.start;
                            return truncate_label(label, hover_duration, plot_width, visible_seconds ?? total_length_x);
                        },
                            fontSize: 10.5, fontWeight: "600", pointerEvents: "none", clip: true,
                    })
            ]
        });  
    plot_timeline_hovering.classList.add("hovering-plot");
    plot_timeline_hovering.style.margin = "0";
    plot_timeline_hovering.style.display = "block";
    plot_timeline_hovering.style.minWidth = plot_width + "px";
    container.querySelector(".dwelling-plot").after(plot_timeline_hovering);    
}

function calc_y_max(events, active_types, bin_interval, domain) {
    if (active_types.size === 0) return 0;
    let bin_gen = d3.bin()
        .value(data => data.time)
        .domain(domain)
        .thresholds(d3.range(domain[0], domain[1] + bin_interval, bin_interval));
    
    let global_max = 0;
    for (let type of active_types) {
        let bins = bin_gen(events.filter(event => event.type === type));
        for (let bin of bins) {
            if (bin.length > global_max) global_max = bin.length;
        }
    }
    return global_max;
}



//full render stream of the session graph
function render_session(session_id, user, container) {
    container.innerHTML = "";
    let session_data = user.interaction_streams[session_id];
    let events = session_data.events;
    let session_dwellings = session_data.dwellings;
    let session_hoverings = session_data.hoverings;
    let session_init_type = session_data.init_type;
    let session_fin_type = session_data.fin_type;

    let session_time_max = Math.max(...events.map(dic => dic.time));
    let total_length_x = session_time_max * 1.05;
    let full_bin_interval = total_length_x / 90;

    let container_width = document.querySelector(".table-responsive").clientWidth;
    px_per_second = container_width / total_length_x; //px per second
    let min_pps = px_per_second;

    let keypress_events = events.filter(event => event.type === "KEYPRESS");
    keypress_events.forEach((event, index) => {
        let next = keypress_events[index + 1];
        if (!next) return;
        let next_key = decodeURIComponent(next.input);
        if (decodeURIComponent(event.input) !== "Control") return;
        if (!["v", "a", "z", "x"].includes(next_key)) return;
        if (next.time - event.time < 1) {
            next.search_string = decodeURIComponent(next.search_string).slice(0, -1);
        }
    }); 
    
    let common = {domain: [0, total_length_x], grid: true};
    let active_types = new Set(types);
    let y_max = null;
    let scrollbar_max = null;
    let cached_zoom = null;
    let pps_at_max1 = null;

    render_legend(container, active_types, events, full_bin_interval, common, session_init_type, session_fin_type);
    render_hist(events, active_types, container, full_bin_interval, common, container_width, null);
    render_dwelling(session_dwellings, container, total_length_x, common, container_width, null);
    render_hover(session_hoverings, container, total_length_x, common, container_width, null)

    //Scrollbar
    let scrollbar_container = document.createElement("div");
    scrollbar_container.style.cssText = "margin-left: 65px;";
    scrollbar_container.style.display = "none";
    let scrollbar = document.createElement("input");
    scrollbar.type = "range"; scrollbar.min = 0; scrollbar.max = 0; scrollbar.value = 0;
    scrollbar.step = "any"; ; scrollbar.style.cssText = "width: 100%;"; 
    scrollbar.classList.add("stream-scrollbar");
    scrollbar_container.appendChild(scrollbar);
    container.appendChild(scrollbar_container);
    
    scrollbar.addEventListener("input", (_) => {
    offset = parseFloat(scrollbar.value);
    if (!rerender) return;
    rerender();
    });

    return (_) => {
        px_per_second = Math.max(px_per_second, min_pps);
        let visible_seconds = container_width / px_per_second; //sec in container
        offset = Math.max(Math.min(offset, total_length_x - visible_seconds), 0);
        let bin_interval = visible_seconds / 90;
        scrollbar_max = total_length_x - visible_seconds;
        scrollbar.max = total_length_x - visible_seconds; scrollbar.value = offset;
        scrollbar_container.style.display = scrollbar_max < 0.0001 ? "none" : "block"; //weil wegen floating point ... super sache
        let new_common = {domain: [offset, offset + visible_seconds], grid: true};
        if (px_per_second !== cached_zoom || leg_activate) {
            let zooming_in = cached_zoom !== null && px_per_second > cached_zoom;
            if (leg_activate || (y_max > 1) || (zooming_in === false && pps_at_max1 === null)) {
                y_max = calc_y_max(events, active_types, bin_interval, [0, total_length_x]);
                if (y_max === 1 && zooming_in) pps_at_max1 = px_per_second;
                if (y_max > 1) pps_at_max1 = null; 
            } else if (!zooming_in && pps_at_max1 !== null && px_per_second < pps_at_max1 * 0.4) {
                y_max = calc_y_max(events, active_types, bin_interval, [0, total_length_x]);
                pps_at_max1 = null;
            }
            cached_zoom = px_per_second;
        }
        
        render_hist(events, active_types, container, bin_interval, new_common, container_width, y_max);
        render_dwelling(session_dwellings, container, total_length_x, new_common, container_width, visible_seconds);
        render_hover(session_hoverings, container, total_length_x, new_common, container_width, visible_seconds);

        //max zoom request
        requestAnimationFrame((_) => {
            let ticks = container.querySelectorAll(".hovering-plot [aria-label='x-axis tick label'] text");
            let decimals = ticks[1].textContent.split(".")[1] ?? "";
            max_zoom_reached = decimals.length > 2;
        });
        };

    }   
    let main = document.querySelector(".main-content");
    let main_pos = main.scrollTop;
    rerender = render_session(session_id, user, container);
    requestAnimationFrame((_) => main.scrollTop = main_pos);
} 

