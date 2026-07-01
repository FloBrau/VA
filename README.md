# GUIDÆTA Explorer

This application is meant as an interactive explorer for the [GUIDÆTA dataset](https://osf.io/fhvbm/) by [Lengauer et al. (2025)](https://doi.org/10.2312/stag.20251335). It was developed by Braunegg, Florian and Rappold, David as part of the Visual Analytics course at Graz University of Technology during the Summer Term 2026.


## Dependencies

**Python**
- `fastapi`
- `uvicorn`
- `numpy`
- `scikit-learn`
- `guidaeta`

<br>

**JavaScript** (loaded via CDN, no installation needed)
- `D3.js` 
- `Observable Plot`
- `Bootstrap`


## Setup

**1. Download and unpack the dataset**
- Download the GUIDÆTA dataset from [here](https://osf.io/fhvbm/overview).
- Create a folder called `Data` in the directory where the GUIDÆTA Explorer files are located.
- Unpack the downloaded GUIDÆTA dataset into the `Data` folder. Make sure that all files (`images.csv`, `sentences.csv`, `sessions.csv`, `task_answers.csv`, `user.csv`) and folders (`keyboard_events` and `mouse_events`) of the GUIDÆTA dataset are located in the `Data` folder. 
- If you wish to store the GUIDÆTA dataset in a different location, update `DATA_ROOT` in `main.py` accordingly!

<br>

**2. Install dependencies**

- Install the dependencies manually or run the following command in a terminal opened in the GUIDÆTA Explorer directory:

```bash
python -m pip install -r requirements.txt
```


<br>

**3. Start the explorer**

- Open `main.py` and run the file, or use the following command in a terminal opened in the GUIDÆTA Explorer directory:

```bash
python main.py
```

- The explorer will open automatically in your default browser. A loading screen will be shown until the dataset is fully loaded.


<br>

## Notes
- The server runs locally at http://127.0.0.1:8000.
- Do not close the terminal while using the explorer.
- To stop the server, press `Ctrl+C` in the terminal.