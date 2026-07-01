//a few general helpers for the basic filtering function and html stuff

//get element value
function get_easy(id) {
    let element = document.getElementById(id);
    if (!element) {return "";}
    return element.value;
}

//mask for out of range
function out_of_range(value, min, max) {
    if (min === "" && max === "") return false;
    if (value === -1) return true;
    if (min !== "" && value < parseFloat(min)) return true;
    if (max !== "" && value > parseFloat(max)) return true;
    return false;
}

//simple upper case function
function upper_case(word) {
    if (typeof word !== "string" || word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1);
}