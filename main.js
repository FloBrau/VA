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
            <div class = "mb-1"><strong style = "font-weight: 500;">Age:</strong> ${selected_user.age === -1 ? "Unknown" : selected_user.age}</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">Gender:</strong> ${gender_map[selected_user.gender] || "Unknown"}</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">Education:</strong> ${selected_user.education === -1 ? "Unknown" : upper_case(selected_user.education)}</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">Handedness:</strong> ${selected_user.handedness === -1 ? "Unknown" : upper_case(selected_user.handedness)}</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">Amblyopia:</strong> ${selected_user.amblyopia === "yes" ? "No" : "Unknown"}</div>
        </div>
    `; //Amblyopia is wrong coded btw. Idk why (reference is the graph in the paper)

    //TASK SUMMARY
    document.getElementById("u-details-summary-table-1").innerHTML = `
        <div class = "fs-6">
            <div class = "mb-1"><strong style = "font-weight: 500;">Duration:</strong> ${selected_user.total_task_duration.toFixed(2)}s</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">Avg. Correct:</strong> ${selected_user.avg_correctness > -1 ? selected_user.avg_correctness.toFixed(2) + "%" : "Unknown"}</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">Sessions:</strong> ${selected_user.total_sessions}</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">DKT2 Score:</strong> ${selected_user.dkt2_score > -1 ? selected_user.dkt2_score.toFixed(2) + "%" : "Unknown"}</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">SUS Score:</strong> ${selected_user.sus_score > -1 ? selected_user.sus_score : "Unknown"}</div> 
        </div>
    `;
    document.getElementById("u-details-summary-table-2").innerHTML = `
        <div class = "fs-6">
            <div class = "mb-1"><strong style = "font-weight: 500;">Clicks:</strong> ${selected_user.total_clicks}</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">Scrolls:</strong> ${selected_user.total_scrolls}</div> 
            <div class = "mb-1"><strong style = "font-weight: 500;">Mouse-moves:</strong> ${selected_user.total_mouse_moves}</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">Keypresses:</strong> ${selected_user.total_keypresses}</div>
            <div class = "mb-1"><strong style = "font-weight: 500;">Total Events:</strong> ${selected_user.total_activity}</div>
        </div>
         `;
    document.getElementById("u-details-summary-table-3").innerHTML = `
        <div class = "fs-6">    
            <div class = "mb-1"><strong style = "font-weight: 500;">Avg. ICL:</strong> ${selected_user.avg_icl > -1 ? selected_user.avg_icl.toFixed(2) : "Unknown"}</div> 
            <div class = "mb-1"><strong style = "font-weight: 500;">Avg. ECL:</strong> ${selected_user.avg_ecl > -1 ? selected_user.avg_ecl.toFixed(2) : "Unknown"}</div> 
            <div class = "mb-1"><strong style = "font-weight: 500;">Avg. CL:</strong> ${selected_user.avg_cl > -1 ? selected_user.avg_cl.toFixed(2) : "Unknown"}</div> 
         </div>   
        `;

    //TABLE
    document.getElementById("task-tbody").innerHTML = selected_user.task_performance.map(task => `
        <tr data-bs-toggle = "collapse" data-bs-target = "#task-collapse-${task.task_no}" style = "cursor: pointer; --bs-table-hover-bg: #f1f3f5;" >
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
        <tr style = "--bs-table-hover-bg: transparent">
            <td colspan = "12"; style = "padding: 0;">
                <div class = "collapse" id = "task-collapse-${task.task_no}">
                <div class = "d-flex align-items-center gap-2 mb-3 mt-3" style = "font-size: 14px; font-weight: 600">
                    <label>Session:</label>
                    <input type = "number" min = "1" max = "${task.session_ids.length}" value = "1" class = "form-control form-control-sm" style = "width: 50px; font-size: 14px">
                </div>
                    <div class = "mb-4" id = "stream-chart-${task.task_no}"></div>           
                </div>
            </td>
        </tr>
    `).join("");


    selected_user.task_performance.forEach(task => {
    let first_session = task.session_ids[0];
    create_stream(task.task_no, first_session, selected_user);
    
    let input = document.querySelector(`#task-collapse-${task.task_no} input[type="number"]`);
    input.addEventListener("input", (_) => {
        let index = parseInt(input.value) - 1;
        let session_id = task.session_ids[index];
        create_stream(task.task_no, session_id, selected_user);
    });
});
}

//USER CARD render
function render_list(users_array) {
    let count_element = document.getElementById("user-count");
    count_element.innerText = `(${users_array.length} IDs)`;

    let user_id_list = document.getElementById("id-list");
    user_id_list.innerHTML = users_array.map(user => `
        <div class = "user-card" onclick = "show_details(${user.id}, this)">
            <strong style = "font-weight: 600;">ID ${user.id}</strong>
        </div>
    `).join("");
}

    

//init
let all_users = [];
async function load_data(){
    let response = await fetch("http://127.0.0.1:8000/users");
    all_users = await response.json();
    render_list(all_users);
}

load_data();