//preperation used for our filters
let edu_ranking = {"compulsoryschool": 1, "apprenticeship": 2, "highschool": 3, "university": 4, "": ""};
let filter_list_dict = [
    {key: "age", type: "num", id_min: "filter-age-min",id_max: "filter-age-max", label: "Age"},
    {key: "dkt2_score", type: "num", id_min: "filter-dkt-min", id_max: "filter-dkt-max", label: "DKT2 Score (%)"},
    {key: "avg_cl", type: "num", id_min: "filter-cl-min", id_max: "filter-cl-max", label: "Avg. Cognitive Load"},
    {key: "avg_ecl", type: "num", id_min: "filter-ecl-min", id_max: "filter-ecl-max", label: "Avg. Extraneous Cognitive Load (ECL)"},
    {key: "avg_icl", type: "num", id_min: "filter-icl-min", id_max: "filter-icl-max", label: "Avg. Intrinsic Cognitive Load (ICL)"},
    {key: "avg_correctness", type: "num", id_min: "filter-corr-min", id_max: "filter-corr-max", label: "Avg. Correctness (%)"},
    {key: "sus_score", type: "num", id_min: "filter-sus-score-min", id_max: "filter-sus-score-max", label: "SUS Score"},
    {key: "total_activity", type: "num", id_min: "filter-total-activity-min", id_max: "filter-total-activity-max", label: "Total Events"},
    {key: "total_sessions", type: "num", id_min: "filter-total-sessions-min", id_max: "filter-total-sessions-max", label: "Total Sessions"},
    {key: "total_clicks", type: "num", id_min: "filter-total-clicks-min", id_max: "filter-total-clicks-max", label: "Total Clicks"},
    {key: "total_scrolls", type: "num", id_min: "filter-total-scrolls-min", id_max: "filter-total-scrolls-max", label: "Total Scrolls"},
    {key: "total_mouse_moves", type: "num", id_min: "filter-total-mouse-moves-min", id_max: "filter-total-mouse-moves-max", label: "Total Mouse Moves"},
    {key: "total_keypresses", type: "num", id_min: "filter-total-keypresses-min", id_max: "filter-total-keypresses-max", label: "Total Keypresses"},
    {key: "total_task_duration", type: "num", id_min: "filter-total-duration-min", id_max: "filter-total-duration-max", label: "Task Duration (sek.)"},
    {key: "education", type: "edu", id_min: "filter-edu-min", id_max: "filter-edu-max",
    values: {"": "Any", "compulsoryschool": "Compulsory", "apprenticeship": "Apprenticeship", "highschool": "Highschool", "university": "University"}, label: "Education"},
    {key: "gender", type: "cat", id: "filter-gender", values: {"": "All", "m": "Male", "f": "Female", "d": "Diverse"}, label: "Gender"},
    {key: "handedness", type: "cat", id: "filter-hand", values: {"right": "Right","left": "Left","both": "Both"}, label: "Handedness"},
    {key: "amblyopia", type: "cat", id: "filter-amblyopia", values: {"yes": "No", "": "All"}, label: "Amblyopia"},
];


//Masking function used in applsy filters
function check_user(user, filters) {
    return filters.every(filter => {
        if (filter.type === "cat") return filter.value === "" || String(user[filter.key]) === String(filter.value);
        let value = filter.key === "education" ? edu_ranking[user[filter.key]] : user[filter.key];
        let min = filter.key === "education" ? edu_ranking[filter.min_val] : filter.min_val;
        let max = filter.key === "education" ? edu_ranking[filter.max_val] : filter.max_val;
        return !out_of_range(value, min, max);
    });
};


//Applying the filters with check_user 
function apply_filters() {
    let filters = filter_list_dict.map(filter => filter.type === "cat"
        ? {...filter, value: get_easy(filter.id)}
        : {...filter, min_val: get_easy(filter.id_min), max_val: get_easy(filter.id_max)}
    );
    render_list(all_users.filter(user => check_user(user, filters)));
};


//reset all filters
function reset_filters() {
    filter_list_dict.forEach(filter => {
        let element = document.getElementById(filter.id || filter.id_min);
        element.tagName === "SELECT" ? element.selectedIndex = 0 : element.value = "";
        if (filter.id_max) document.getElementById(filter.id_max).value = "";
    });
    render_list(all_users);
}


let all_ids = filter_list_dict.map(filter => filter.type === "cat" ? `#${filter.id}` :
     `#${filter.id_min}, #${filter.id_max}`).join(", ");

document.querySelectorAll(all_ids).forEach(element => element.addEventListener("input", apply_filters));

