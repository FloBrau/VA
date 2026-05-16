from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import guidaeta
import numpy as np
from pathlib import Path
import webbrowser
import asyncio
import os
import signal

DATA_ROOT = "Data"


def get_all_users_aggregated():
    #small helper
    def to_val(val):
        if val is None or val =="na":
            return -1
        return val.value if hasattr(val, "value") else val
    
    def timestamp(event, session_start):
        return (event.timestamp - session_start).total_seconds()


    output = []
    for user in db["users"]:
        task_performance_list = []
        interaction_streams = {}

        all_users_cl_scores = []
        all_users_icl_scores = []
        all_users_ecl_scores = []
        all_users_correctness = []
        

        for task in user.task_answers:

            valid_task_correctness = task.correctness
            all_users_correctness.append(valid_task_correctness)
            
            all_scores = task.cl.scores
            task_avg_cl = -1
            task_avg_icl = -1
            task_avg_ecl = -1

            if all_scores[0] != -1:
                task_avg_icl = float(np.mean(all_scores[0:5]))
                all_users_icl_scores.append(task_avg_icl)
                task_avg_ecl = float(np.mean(all_scores[5:10]))
                all_users_ecl_scores.append(task_avg_ecl)
                task_avg_cl = float(np.mean(all_scores))
                all_users_cl_scores.append(task_avg_cl)

            duration = 0
            mouse_clicks = 0
            mouse_scrolls = 0
            mouse_move = 0
            key_presses = 0 
            session_ids = []

            for session in task.sessions:
                current_session_events = []
                current_sessions_id = session.id
                session_dwellings = [] 
                session_hoverings = []               
                session_ids.append(current_sessions_id)
                session_start = session.from_ts
                session_time = (session.to_ts - session_start).total_seconds()
                duration += session_time

                for event in session.mouse_events:
                    if event.type == 1:
                        mouse_clicks += 1
                        current_session_events.append({
                            "time": timestamp(event, session_start),
                            "type": "MOUSE_CLICK",
                            "component": to_val(event.component),
                            "chapter": to_val(event.chapter)
                            })
                    elif event.type in [2, 3]:
                        mouse_scrolls += 1
                        current_session_events.append({
                            "time": timestamp(event, session_start),
                            "type": "MOUSE_SCROLL",
                            "direction": "Up" if event.type == 2 else "Down",
                            "component": to_val(event.component),
                            "chapter": to_val(event.chapter)
                            })
                    elif event.type == 0:
                        mouse_move += 1 
                        current_session_events.append({
                            "time": timestamp(event, session_start),
                            "type": "MOUSE_MOVE",
                            "component": to_val(event.component),
                            "chapter": to_val(event.chapter)
                            })

                for event in session.keyboard_events:
                    key_presses += 1
                    current_session_events.append({
                        "time": timestamp(event, session_start),
                        "type": "KEYPRESS",
                        "component": -2,
                        "search_string": to_val(event._context),
                        "input": to_val(event._key)
                        }) 
                
                session.compute_dwellings()
                for dwelling in session.dwellings:
                    start_dwelling = (dwelling.from_ts - session.from_ts).total_seconds()
                    end_dwelling = (dwelling.to_ts - session.from_ts).total_seconds()
                    if end_dwelling - start_dwelling >= 1:
                        session_dwellings.append({
                        "component": to_val(dwelling.component),
                        "start": start_dwelling,
                        "end": end_dwelling,
                        "chapter": to_val(dwelling.chapter)
                        })


                session.compute_hoverings()
                for hovering in session.hoverings:
                    start_hover = (hovering.from_ts - session.from_ts).total_seconds()
                    end_hover = (hovering.to_ts - session.from_ts).total_seconds()
                    session_hoverings.append({
                    "component": hovering.component,
                    #had to add 0.001 sconds because otherwise it would have been 0.0 sec length
                    "start": start_hover - 0.001 if end_hover == start_hover else start_hover,
                    "end": end_hover + 0.001 if end_hover == start_hover else end_hover,
                    "chapter": hovering.chapter,
                    "context": hovering.context.type
                    })          
                

                current_session_events.sort(key = lambda x: x["time"])
                interaction_streams[current_sessions_id] = {
                    "events": current_session_events,
                    "dwellings": session_dwellings, 
                    "hoverings": session_hoverings,
                    "init_type": to_val(session._initialization_type),
                    "fin_type": to_val(session._finalization_type)
                }

            task_total_events = key_presses + mouse_scrolls + mouse_clicks + mouse_move
            
            task_performance_list.append({
                "task_no": task.task_no,
                "correctness": valid_task_correctness,
                "task_duration": duration,
                "avg_cognitive_load": task_avg_cl,
                "avg_extraneous_cognitive_load": task_avg_ecl,
                "avg_intrinsic_cognitive_load": task_avg_icl,
                "session_ids": session_ids,
                "num_sessions": len(session_ids),
                "total_events_task": task_total_events,
                "clicks": mouse_clicks,
                "scrolls": mouse_scrolls,
                "key_presses": key_presses,
                "mouse_move": mouse_move,
            })

        output.append({
            "id": user.id,
            "age": to_val(user.age),
            "gender": to_val(user.gender),
            "education": to_val(user.education),
            "handedness": user.handedness,
            "amblyopia": to_val(user.amblyopia),
            "dkt2_score": user.diabetes_knowledge.score() * 100,
            "avg_cl": float(np.mean(all_users_cl_scores)) if all_users_cl_scores else -1,
            "avg_ecl": float(np.mean(all_users_ecl_scores)) if all_users_ecl_scores else -1,
            "avg_icl": float(np.mean(all_users_icl_scores)) if all_users_icl_scores else -1,
            "sus_score": sum(user.system_usability_scale.scores()) if \
                None not in user.system_usability_scale.scores() else -1,    
            "avg_correctness": float(np.mean(all_users_correctness)) * 100 if all_users_correctness else -1,
            "total_clicks": sum(task["clicks"] for task in task_performance_list),
            "total_scrolls": sum(task["scrolls"] for task in task_performance_list),
            "total_keypresses": sum(task["key_presses"] for task in task_performance_list), 
            "total_mouse_moves": sum(task["mouse_move"] for task in task_performance_list),    
            "total_activity": sum(task["total_events_task"] for task in task_performance_list),
            "total_sessions": sum(task["num_sessions"] for task in task_performance_list),
            "total_task_duration": sum(task["task_duration"] for task in task_performance_list),
            "task_performance": task_performance_list,
            "interaction_streams": interaction_streams
        })
    return output

db = {}
ready = False

async def load_in_background():
    global ready
    loop = asyncio.get_running_loop()
    db["sentences"], db["sessions"], db["users"], db["tasks"] = await loop.run_in_executor(None, guidaeta.load_data, DATA_ROOT)
    db["aggregated"] = await loop.run_in_executor(None, get_all_users_aggregated)
    ready = True

@asynccontextmanager
async def lifespan(app):
    global ready
    ready = False
    webbrowser.open(Path("index.html").resolve().as_uri())
    asyncio.create_task(load_in_background())
    yield
    db.clear()


app = FastAPI(lifespan = lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_methods = ["*"],
    allow_headers = ["*"],
)

@app.get("/status")
def status():
    return {"ready": ready}

@app.get("/users")
def get_users():
    return db["aggregated"]

if __name__ == "__main__":
    uvicorn.run("main:app", host = "127.0.0.1", port = 8000, reload = False)