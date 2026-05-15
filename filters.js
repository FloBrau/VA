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

let id_list = all_filter_var.map(name => "#filter-" + name).join(", ");
let selector = document.querySelectorAll(id_list);
selector.forEach(element => {
    element.addEventListener("input", apply_filters);
});
