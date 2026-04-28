//a few general helpers for the basic filtering function and html stuff
function get_easy(id) {
    let element = document.getElementById(id);
    if (!element) {return ""; }
    return element.value;
}
function out_of_range(value, min, max) {
    if (min === "" && max === "") return false;
    if (value === -1) return true;
    if (min !== "" && value < parseFloat(min)) return true;
    if (max !== "" && value > parseFloat(max)) return true;
    return false;
}
function upper_case(word) {
    if (typeof word !== "string" || word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
}



//init
let all_users = [];
async function load_data(){
    let response = await fetch("http://127.0.0.1:8000/users");
    all_users = await response.json();
    render_list(all_users);
}


//USER CARD render
function render_list(users_array) {
    let count_element = document.getElementById("user-count");
    count_element.innerText = `(${users_array.length} IDs)`;

    let user_id_list = document.getElementById("id-list");
    user_id_list.innerHTML = users_array.map(user => `
        <div class = "user-card" onclick = "show_details(${user.id}, this)">
            <strong>ID ${user.id}</strong>
        </div>
    `).join("");
}







let all_filter_var = ["age-min", "age-max", "dkt-min", "dkt-max", "total-duration-min", "total-duration-max", 
                      "cl-min", "cl-max", "ecl-min", "ecl-max", "icl-min", "icl-max", "edu-min",
                      "edu-max", "corr-min", "corr-max", "total-sessions-min", "total-sessions-max",
                      "sus-score-min", "sus-score-max", "total-activity-min", "total-activity-max",
                      "total-clicks-min", "total-clicks-max", "total-scrolls-min", "total-scrolls-max",
                      "total-mouse-moves-min", "total-mouse-moves-max", "total-keypresses-min", "total-keypresses-max",
                      "gender", "hand", "amblyopia"]

function apply_filters() {
    let age_min = get_easy("filter-age-min"); let age_max = get_easy("filter-age-max");
    let dkt_min = get_easy("filter-dkt-min"); let dkt_max = get_easy("filter-dkt-max");
    let cl_min = get_easy("filter-cl-min"); let cl_max = get_easy("filter-cl-max");
    let ecl_min = get_easy("filter-ecl-min"); let ecl_max = get_easy("filter-ecl-max");
    let icl_min = get_easy("filter-icl-min"); let icl_max = get_easy("filter-icl-max");
    let corr_min = get_easy("filter-corr-min"); let corr_max = get_easy("filter-corr-max");
    let total_sessions_min = get_easy("filter-total-sessions-min"); let total_sessions_max = get_easy("filter-total-sessions-max");
    let sus_score_min = get_easy("filter-sus-score-min"); let sus_score_max = get_easy("filter-sus-score-max");
    let total_activity_min = get_easy("filter-total-activity-min"); let total_activity_max = get_easy("filter-total-activity-max");
    let total_clicks_min = get_easy("filter-total-clicks-min"); let total_clicks_max = get_easy("filter-total-clicks-max");
    let total_scrolls_min = get_easy("filter-total-scrolls-min"); let total_scrolls_max = get_easy("filter-total-scrolls-max");
    let total_mouse_moves_min = get_easy("filter-total-mouse-moves-min"); let total_mouse_moves_max = get_easy("filter-total-mouse-moves-max");
    let total_keypresses_min = get_easy("filter-total-keypresses-min"); let total_keypresses_max = get_easy("filter-total-keypresses-max");
    let total_task_duration_min = get_easy("filter-total-duration-min"); let total_task_duration_max = get_easy("filter-total-duration-max");
    let edu_ranking = {"compulsoryschool": 1, "apprenticeship": 2, "highschool": 3,"university": 4, "": ""};
    let edu_min_val = edu_ranking[get_easy("filter-edu-min")]; let edu_max_val = edu_ranking[get_easy("filter-edu-max")];  
    let gender_val = get_easy("filter-gender");
    let hand_val = get_easy("filter-hand");
    let amblyopia_val = get_easy("filter-amblyopia");

    function check(user) {
        if (out_of_range(user.age, age_min, age_max)) return false;
        if (out_of_range(user.dkt2_score, dkt_min, dkt_max)) return false;
        if (out_of_range(user.total_activity, total_activity_min, total_activity_max)) return false;
        if (out_of_range(user.total_sessions, total_sessions_min, total_sessions_max)) return false;
        if (out_of_range(edu_ranking[user.education] || 0, edu_min_val, edu_max_val)) return false;
        if (out_of_range(user.avg_cl, cl_min, cl_max)) return false;
        if (out_of_range(user.avg_ecl, ecl_min, ecl_max)) return false;
        if (out_of_range(user.avg_icl, icl_min, icl_max)) return false;
        if (out_of_range(user.avg_correctness, corr_min, corr_max)) return false;
        if (out_of_range(user.sus_score, sus_score_min, sus_score_max)) return false;
        if (out_of_range(user.total_activity, total_activity_min, total_activity_max)) return false;
        if (out_of_range(user.total_clicks, total_clicks_min, total_clicks_max)) return false;
        if (out_of_range(user.total_scrolls, total_scrolls_min, total_scrolls_max)) return false;
        if (out_of_range(user.total_mouse_moves, total_mouse_moves_min, total_mouse_moves_max)) return false;
        if (out_of_range(user.total_keypresses, total_keypresses_min, total_keypresses_max)) return false;
        if (out_of_range(user.total_task_duration, total_task_duration_min, total_task_duration_max)) return false;
        if (gender_val !== "" && user.gender !== gender_val) return false;
        if (hand_val !== "" && user.handedness !== hand_val) return false;
        if (amblyopia_val !== "" && user.amblyopia !== amblyopia_val) return false;
        
        return true;
    }

    let filtered = all_users.filter(check);
    render_list(filtered);
    
}

let id_list = all_filter_var.map(name => "#filter-" + name).join(", ");
let selector = document.querySelectorAll(id_list);
selector.forEach(element => {
    element.addEventListener("input", apply_filters);
});

function reset_filters() {
    all_filter_var.forEach(variable => {let element = document.getElementById("filter-" + variable);
        if (element) {
            if (element.tagName === "SELECT") {
                element.selectedIndex = 0;
            }
             else {element.value = "";}
            }
        });
    render_list(all_users);
}







function show_details(user_id, click) {
    //SELECT/UNSELECT USER
    let was_active = click.classList.contains("active");
    document.querySelectorAll(".user-card").forEach(cl => cl.classList.remove("active"));
    let detail_view = document.getElementById("detail-view");
    if (was_active) {
        detail_view.classList.add("d-none");
        return
    } else {
        click.classList.add("active");
        detail_view.classList.remove("d-none");
    }
    let selected_user = all_users.find(user => user.id === user_id);

    document.getElementById("u-title").innerText = "ID: " + selected_user.id;

    //DEMOGRAPHIE
    let gender_map = {"m": "Male", "f": "Female", "d": "Divers"};
    document.getElementById("u-details-demo").innerHTML = `
        <div class = "fs-6">
            <div class = "mb-1"><strong>Age:</strong> ${selected_user.age === -1 ? "Unknown" : selected_user.age}</div>
            <div class = "mb-1"><strong>Gender:</strong> ${gender_map[selected_user.gender] || "Unknown"}</div>
            <div class = "mb-1"><strong>Education:</strong> ${selected_user.education === -1 ? "Unknown" : upper_case(selected_user.education)}</div>
            <div class = "mb-1"><strong>Handedness:</strong> ${selected_user.handedness === -1 ? "Unknown" : upper_case(selected_user.handedness)}</div>
            <div class = "mb-1"><strong>Amblyopia:</strong> ${selected_user.amblyopia === "yes" ? "No" : "Unknown"}</div>
        </div>
    `; //Amblyopia is wrong coded btw. Idk why (reference is the graph in the paper)

    //TASK SUMMARY
    document.getElementById("u-details-summary-table-1").innerHTML = `
        <div class = "fs-6">
            <div class = "mb-1"><strong>Duration:</strong> ${selected_user.total_task_duration.toFixed(2)}s</div>
            <div class = "mb-1"><strong>Avg. Correct:</strong> ${selected_user.avg_correctness > -1 ? selected_user.avg_correctness.toFixed(2) + "%" : "Unknown"}</div>
            <div class = "mb-1"><strong>Sessions:</strong> ${selected_user.total_sessions}</div>
            <div class = "mb-1"><strong>DKT2 Score:</strong> ${selected_user.dkt2_score > -1 ? selected_user.dkt2_score.toFixed(2) + "%" : "Unknown"}</div>
            <div class = "mb-1"><strong>SUS Score:</strong> ${selected_user.sus_score > -1 ? selected_user.sus_score : "Unknown"}</div> 
        </div>
    `;
    document.getElementById("u-details-summary-table-2").innerHTML = `
        <div class = "fs-6">
            <div class = "mb-1"><strong>Clicks:</strong> ${selected_user.total_clicks}</div>
            <div class = "mb-1"><strong>Scrolls:</strong> ${selected_user.total_scrolls}</div> 
            <div class = "mb-1"><strong>Mouse-moves:</strong> ${selected_user.total_mouse_moves}</div>
            <div class = "mb-1"><strong>Keypresses:</strong> ${selected_user.total_keypresses}</div>
            <div class = "mb-1"><strong>Total Events:</strong> ${selected_user.total_activity}</div>
        </div>
         `;
    document.getElementById("u-details-summary-table-3").innerHTML = `
        <div class = "fs-6">    
            <div class = "mb-1"><strong>Avg. ICL:</strong> ${selected_user.avg_icl > -1 ? selected_user.avg_icl.toFixed(2) : "Unknown"}</div> 
            <div class = "mb-1"><strong>Avg. ECL:</strong> ${selected_user.avg_ecl > -1 ? selected_user.avg_ecl.toFixed(2) : "Unknown"}</div> 
            <div class = "mb-1"><strong>Avg. CL:</strong> ${selected_user.avg_cl > -1 ? selected_user.avg_cl.toFixed(2) : "Unknown"}</div> 
         </div>   
        `;

    //TABLE
    document.getElementById("task-tbody").innerHTML = selected_user.task_performance.map(task => `
        <tr>
            <td class=  "text-center">Task ${task.task_no}</td>
            <td class = "text-center"> ${task.correctness === 1 ? "Correct" : "False"}</td>
            <td class = "text-center">${task.task_duration.toFixed(2)}s</td>
            <td class = "text-center">${task.num_sessions}</td>
            <td class = "text-center">${task.clicks}</td>
            <td class = "text-center">${task.scrolls}</td>
            <td class = "text-center">${task.mouse_move}</td>
            <td class = "text-center">${task.key_presses}</td>
            <td class = "text-center">${task.total_events_task}</td>
            <td class = "text-center">${task.avg_intrinsic_cognitive_load === -1 ? "Unknown" : task.avg_intrinsic_cognitive_load.toFixed(2)}</td>
            <td class = "text-center">${task.avg_extraneous_cognitive_load === -1 ? "Unknown" : task.avg_extraneous_cognitive_load.toFixed(2)}</td>
            <td class = "text-center">${task.avg_cognitive_load === -1 ? "Unknown": task.avg_cognitive_load.toFixed(2)}</td>
        </tr>
    `).join("");







let firstSessionId = selected_user.task_performance?.[0]?.session_ids?.[0];

if (firstSessionId) {
    //renderSessionStream(firstSessionId, selected_user); 
    rerender = renderSessionStream(firstSessionId, selected_user);
} 
    }




//Session stream prep
let comp_labels = {"-2": "Keyboard", "-1": "Not Specified", "0": "Fulltext", "1": "Snippets", "2": "Tilebar", 
                     "3": "WordCloud", "4": "Topiccloud", "5": "Searchbar", "6": "Imageslider"};
let context_labels = {0: "Word Cloud Term", 1: "TopicCloud Term", 2: "History Term", 3: "Chapter Expanded",
                        4: "Chapter Collapsed", 5: "Topicbar Interaction", 6: "Tilebar Item", 7: "Snippet Expansion",
                        8: "Jump to Fulltext", 9: "Searchbar Click", 10: "Image Navigation", 11: "Image Enlarged",
                        12: "Image Closed", 13: "Visualization Toggle", 14: "Like Button", 15: "Abstraction Change",
                        16: "Fulltext Sentence", 17: "Snippet Sentence"};
let types = ["MOUSE_MOVE", "MOUSE_SCROLL", "KEYPRESS", "MOUSE_CLICK"]; 
let colors = ["#dddddd", "#4e79a7", "#59a14f", "#e15759"];
let legend_labels = ["Mouse Move", "Mouse Scroll", "Keypress", "Mouse Click"];


//Zoom prep
let px_per_second = null;
let rerender = null;

document.getElementById("stream-container").addEventListener("wheel", (event) => {
    event.preventDefault(); //disables normal scrolling
    if (!px_per_second) return;
    let factor = event.deltaY < 0 ? 1.2 : 0.8;
    px_per_second *= factor;
    rerender();
}, {passive: false});
    
//Histo     
function render_hist(events, active_types, container, bin_interval, common, plot_width) {
    let main = document.querySelector(".main-content");
    let scroll = main.scrollTop;
    let old = container.querySelector(".histo-plot");
    if (old) old.remove();

    let plot_histo = Plot.plot({
        width: plot_width, height: 250, marginLeft: 70, marginBottom: 5, marginRight: 20,
        x: {... common, ticks: [], label: null, axis: null},
        y: {label: "Event Intensity", grid: true, nice: true, ticks: 5},
        marks: [
            Plot.text(["Mouse\nand\nKeypress\nEvents"], {
                frameAnchor: "left", dx: -47, fontSize: 10, textAnchor: "middle", lineHeight: 1.2
            }),
            ...types.filter(type => active_types.has(type)).map((type) => {
                let color_index = types.indexOf(type);
                return Plot.rectY(events.filter(data => data.type === type), 
                    Plot.binX({y: "count",
                         title: (bin) => { 
                            let count = bin.length;
                            let keypress = bin.map(event => decodeURIComponent(event.input));
                            let filter_gather = keypress.filter(input => input.length > 1);
                            let string_array = bin.map(event => decodeURIComponent(event.search_string));
                            let string_input = string_array.join(", ");
                            if (filter_gather.length > 0) {
                                string_input = string_input.replace(new RegExp(`(${filter_gather.join("|")})`, "g"), "");
                            }
                            let components = [...new Set(bin.map(event => comp_labels[event.component]))];
                            if (components[0] === "Keyboard") {
                                return `${legend_labels[color_index]}\nEvents: ${count}\nString: ${string_input}\nInput: ${keypress.join(", ")}`;
                                }
                            return `${legend_labels[color_index]}\nEvents: ${count}\nComponent(s): ${components.join(", ")}`
                            }}, 
                        {x: "time", fill: colors[color_index], interval: bin_interval,
                         fillOpacity: type === "MOUSE_MOVE" ? 0.5 : 0.8, inset: 0.1})
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
    requestAnimationFrame(() => main.scrollTop = scroll); 
}

//Histo Legend (some would say i stole this idea)
function render_legend(container, active_types, events, bin_interval, common) {
    let legend = document.createElement("div");
    legend.style.cssText = "display: flex; gap: 11px; padding: 8px 0 8px 50px; font: 10px system-ui, sans-serif;"
    
    types.forEach((type, index) => {
        let item = document.createElement("span");
        item.style.cssText = "cursor: pointer; display: inline-flex; align-items: center; gap: 4px;";
        item.innerHTML = `<span style = "display: inline-block; width: 11px; height: 11px; background:${colors[index]};"></span>${legend_labels[index]}`;
        item.addEventListener("click", (_) => {
            active_types.has(type) ? active_types.delete(type) : active_types.add(type);
            item.style.opacity = active_types.has(type) ? "1" : "0.4";
            item.style.textDecoration = active_types.has(type) ? "none" : "line-through";
            render_hist(events, active_types, container, bin_interval, common, total_length_x * px_per_second);
        });
        legend.appendChild(item);
    });
    container.appendChild(legend);
    legend.classList.add("histo-legend");
}


//Truncate Labels
function truncate_label(label, duration, container_width, total_length_x) {
    let available_width = ((container_width - 90) / total_length_x) * duration;
    let max_chars = Math.floor(available_width / 6);
    
    if (max_chars < 1) return "";
    if (max_chars < 2) return ".";
    if (max_chars < 3) return "..";
    if (label.length > max_chars) {
        return label.substring(0, Math.max(0, max_chars - 2)) + "...";
    }
    return label;
}


//Timeline Dwellings
function render_dwelling(session_dwellings, container, total_length_x, common, plot_width) {
    let old = container.querySelector(".dwelling-plot");
    if (old) old.remove();
    let plot_timeline_dwelling = Plot.plot({
    width: plot_width, height: 20, marginLeft: 70, marginTop: 0, marginBottom: 0, marginRight: 20,
    x: {... common, label: [], axis: null, tickFormat: () => ""},
    y: {domain: [0, 1], axis: null},
    marks: [
        Plot.text(["Dewelling"], {
        frameAnchor: "left", dx: -47, fontSize: 10, textAnchor: "middle", lineHeight: 1.2
        }),
        Plot.rectX(session_dwellings, 
                        {x1: "start", x2: "end", y1: 0, y2: 1, fill: "#d1d1d1",
                        stroke: "#8a8a8a", strokeWidth: 0.5,
                        title: dwell => `Dwelling\nFocus on: ${comp_labels[dwell.component]}\nLength: ${(dwell.end - dwell.start).toFixed(2)}s`}),
            Plot.text(session_dwellings, {x: dwell => (dwell.start + dwell.end) / 2, y: 0.5, 
                    text: dwell => {
                        let label = comp_labels[dwell.component];
                        let dwell_duration = dwell.end - dwell.start;
                        return truncate_label(label, dwell_duration, plot_width, total_length_x);
                    } ,
                        fontSize: 9, fontWeight: "bold",
                        pointerEvents: "none"
                })
        ]
    });
    plot_timeline_dwelling.classList.add("dwelling-plot");
    plot_timeline_dwelling.style.margin = "0";
    plot_timeline_dwelling.style.display = "block";
    plot_timeline_dwelling.style.minWidth = plot_width + "px";
    container.appendChild(plot_timeline_dwelling);
}


//Timeline Hovering
function render_hover(session_hoverings, container, total_length_x, common, plot_width) {
    let old = container.querySelector(".hovering-plot");
    if (old) old.remove();
    let plot_timeline_hovering = Plot.plot({
        width: plot_width, height: 50, marginLeft: 70, marginTop: 0, marginBottom: 30, marginRight: 20,
        x: {...common, label: "Session Time (s)"},
        y: {domain: [0, 1], axis: null},
        marks: [
            Plot.text(["Hover"], {
            frameAnchor: "left", dx: -47, fontSize: 10, textAnchor: "middle", lineHeight: 1.2
            }),
            Plot.rectX(session_hoverings, 
                          {x1: "start", x2: "end", y1: 0, y2: 1, fill: "#c3a8c9",
                          stroke: "#836f88", strokeWidth: 0.5,
                          title: hover => `Hovering\nHovering on: ${comp_labels[hover.component]}\nContext: ${context_labels[hover.context]}\nChapter: ${hover.chapter}
                          \nLength: ${(hover.end - hover.start).toFixed(2)}s`}),
                Plot.text(session_hoverings, {x: hover => (hover.start + hover.end) / 2, y: 0.5, 
                        text: hover => {
                            let label = comp_labels[hover.component];
                            let hover_duration = hover.end - hover.start;
                            return truncate_label(label, hover_duration, plot_width, total_length_x);
                        } ,
                            fontSize: 9, fontWeight: "bold", pointerEvents: "none"
                    })
            ]
        });  
    plot_timeline_hovering.classList.add("hovering-plot");
    plot_timeline_hovering.style.margin = "0";
    plot_timeline_hovering.style.display = "block";
    plot_timeline_hovering.style.minWidth = plot_width + "px";
    container.appendChild(plot_timeline_hovering); 
}



function renderSessionStream(session_id, user) {
    let container = document.getElementById("stream-chart");
    container.innerHTML = "";
    let session_data = user.interaction_streams[session_id];
    let events = session_data.events;
    let session_dwellings = session_data.dwellings;
    let session_hoverings = session_data.hoverings;

    let session_time_max = Math.max(...events.map(dic => dic.time));
    let total_length_x = session_time_max * 1.05;
    let bin_interval = session_time_max / 100;

    let container_width = document.getElementById("stream-container").clientWidth;
    px_per_second = container_width / total_length_x;
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
    render_legend(container, active_types, events, bin_interval, common);
    render_hist(events, active_types, container, bin_interval, common, container_width);
    render_dwelling(session_dwellings, container, total_length_x, common, container_width);
    render_hover(session_hoverings, container, total_length_x, common, container_width)

    return () => {
        px_per_second = Math.max(px_per_second, min_pps);
        let plot_width = total_length_x * px_per_second;
        render_hist(events, active_types, container, bin_interval, common, plot_width);
        render_dwelling(session_dwellings, container, total_length_x, common, plot_width);
        render_hover(session_hoverings, container, total_length_x, common, plot_width);
    };
    }    

load_data();