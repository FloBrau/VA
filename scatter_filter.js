//Preperation
let group = [];
let group_counter = 0;
let def_col = ["#C0C0C0", "#808080", "#000000", "#FF0000", "#800000", "#FFFF00", "#808000", "#00FF00", "#008000",
"#00FFFF", "#008080", "#0000FF", "#000080", "#FF00FF", "#800080", "#FF8000", "#FF4500", "#8B0000",
"#4B0082", "#7FFF00", "#00FA9A", "#1E90FF", "#FF69B4", "#FFD700", "#DC143C"];


//Creates new group
function new_group () {
    let group_id = ++group_counter;
    group.push({
      id: group_id, color: def_col[Math.floor(Math.random() * def_col.length)], name: `Group ${group_id}`, filter: []
    });
  render_groups();
  render_scatter(current_users, current_task);
}

//Removes group
function remove_group(group_id) {
    group = group.filter(gr => gr.id !== group_id);
    render_groups();
    render_scatter(current_users, current_task);
}

//Add a new filter 
function add_filter (group_id) {
    let attr_name = document.getElementById(`group-drop-${group_id}`).value;
    if (!attr_name) return;

    let attr = filter_list_dict.find(filter => filter.label === attr_name);
    let filter = {key: attr.key, type: attr.type, attr_name: attr_name};

    if (attr.type === "cat") {
        filter.value = document.getElementById(`cat-val-${group_id}`).value;
        filter.label = attr.values[filter.value];
    } else if (attr.type === "edu") {
        let min_edu = document.getElementById(`edu-min-${group_id}`);
        let max_edu = document.getElementById(`edu-max-${group_id}`);
        filter.min_val = min_edu.value;
        filter.max_val = max_edu.value;
        filter.label = `${min_edu.options[min_edu.selectedIndex].text} – ${max_edu.options[max_edu.selectedIndex].text}`;
    } else {
        filter.min_val = document.getElementById(`num-min-${group_id}`).value;
        filter.max_val = document.getElementById(`num-max-${group_id}`).value;
        if (!filter.min_val && !filter.max_val) return;
    }

    group.find(gr => gr.id === group_id).filter.push(filter);
    render_groups();
    render_scatter(current_users, current_task);
}


//Removes the respective filter 
function remove_filter(group_id, filter_index) {
    let gr = group.find(gr => gr.id === group_id);
    gr.filter.splice(filter_index, 1);
    render_groups();
    render_scatter(current_users, current_task);
}

//return the dot color (important in scatter.js)
function get_dot_color(user) {
    for (let gr of group) {
        if (gr.filter.length > 0 && check_user(user, gr.filter)) return gr.color;
    }
    return "#8496a8";
}

//Display options in the render_group template for every group
function on_attr_change(group_id) {
    let attr_name = document.getElementById(`group-drop-${group_id}`).value;
    let attr = filter_list_dict.find(filter => filter.label === attr_name);
    document.getElementById(`cat-val-${group_id}`).style.display = attr?.type === "cat" ? "" : "none";
    document.getElementById(`num-inputs-${group_id}`).style.display = attr?.type === "num" ? "flex" : "none";
    document.getElementById(`edu-inputs-${group_id}`).style.display = attr?.type === "edu" ? "flex" : "none";
    if (attr?.type === "cat") {
        document.getElementById(`cat-val-${group_id}`).innerHTML = 
            Object.entries(attr.values).map(([key,value]) => `<option value = "${key}">${value}</option>`).join("");
    }
}

//Template for every group
function render_groups() {
    document.getElementById("group-list").innerHTML = group.map(gr => `
        <div class = "border p-2 mb-2" style = "font-size: 0.75rem; width: 65%">
            <div class = "d-flex align-items-center gap-2 mb-2">
                <input type = "color" value = "${gr.color}" class = "form-control form-control-sm p-0" style = "width: 1.25rem; min-height: unset; height: 1.25rem!important; cursor: pointer"
                    oninput = "group.find(gro => gro.id === ${gr.id}).color = this.value; render_scatter(current_users, current_task)">
                <input type = "text" value = "${gr.name}" class = "form-control form-control-sm border-0 bg-transparent fw-semibold p-0"
                    style = "outline: none; flex: 1" oninput = "group.find(grou => grou.id === ${gr.id}).name = this.value">
                <button onclick = "remove_group(${gr.id})" class = "btn btn-sm p-0" 
                    style = "width: 1rem; height: 1rem; font-size: 1rem!important; line-height: 1; display: flex; align-items: center; justify-content: center">×</button>
            </div>

            ${gr.filter.length > 0 ? `
            <div class = "d-flex gap-2 mb-3 flex-column">
                ${gr.filter.map((filter, index) => `<span class = "filter-tag" style = "max-width: auto; width: fit-content; word-break: break-all">
                    ${filter.attr_name}: <strong>${filter.label || `${filter.min_val || ""}${filter.min_val && filter.max_val ? " – " : ""}${filter.max_val || ""}`}</strong>
                    <button onclick = "remove_filter(${gr.id}, ${index})" class = "btn btn-sm p-0" 
                        style = "color: #aaa;font-size: 0.813rem; line-height: 1; display: flex; align-items: center; justify-content: center">×</button>
                </span>`).join("")}
            </div>` : ""}

            <div style = "font-size: 0.72rem" class = "gap-2">
                <select id = "group-drop-${gr.id}" onchange = "on_attr_change(${gr.id})" class = "form-select form-select-sm w-100 mb-1" style = "font-size: 0.72rem">
                    <option value = "" disabled selected>+ filter</option>
                    ${filter_list_dict.map(filter => `<option>${filter.label}</option>`).join("")}
                </select>
                <select id = "cat-val-${gr.id}" class = "form-select form-select-sm" style = "font-size: 0.72rem; width: auto; display: none;"></select>
                <div id = "num-inputs-${gr.id}" style = "display: none; flex-direction: row; align-items: center; gap: 0.5rem">
                    <input id = "num-min-${gr.id}" type = "number" placeholder = "Min" min = "0"class = "form-control form-control-sm" style = "width: 3.5rem; font-size: 0.72rem">
                    <span> − </span>
                    <input id = "num-max-${gr.id}" type = "number" placeholder = "Max" min = "0" class="form-control form-control-sm" style = "width: 3.5rem; font-size: 0.72rem">
                </div>

                <div id = "edu-inputs-${gr.id}" style = "display: none; flex-direction: row; align-items: center; gap: 0.5rem">
                    <select id = "edu-min-${gr.id}" class = "form-select form-select-sm" style= "font-size: 0.72rem; width: auto;">
                        ${Object.entries(filter_list_dict.find(filter => filter.key === "education").values)
                        .map(([key, value]) => `<option value = "${key}">${value}</option>`).join("")}
                    </select>
                    <span> – </span>
                    <select id = "edu-max-${gr.id}" class = "form-select form-select-sm" style = "font-size: 0.72rem; width:auto;">
                        ${Object.entries(filter_list_dict.find(filter => filter.key === "education").values)
                            .map(([key, value]) => `<option value = "${key}">${value}</option>`).join("")}
                    </select>
                </div>
                <button onclick = "add_filter(${gr.id})" class = "btn btn-sm btn-outline-primary mt-1" style = "font-size: 0.72rem">Add</button>
            </div>
       </div> 
  
    `).join("");
}