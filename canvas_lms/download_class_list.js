// ==UserScript==
// @name         Download class list
// @namespace    http://tampermonkey.net/
// @version      2024-12-05
// @description  Download a list of people in a course on Canvas at the University of Agder
// @author       Espen Raugstad
// @match        https://uia.instructure.com/courses/*/users*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Dictionary
    const dict = {
        "en-GB": {
            "download": "Download as CSV",
        },
        "en-US": {
            "download": "Download as CSV",
        },
        "en-AU": {
            "download": "Download as CSV",
        },
         "en-CA": {
            "download": "Download as CSV",
        },
        "nb": {
            "download": "Last ned som CSV",
        },
        "nb-x-k12": {
            "download": "Last ned som CSV",
        },
        "de": {
            "download": "Als CSV herunterladen",
        }
    }

    function i18n(word){
        const systemDefault = "nb";
        let locale = ENV.LOCALE;

        let localeDictionary = dict[locale] || dict[systemDefault];
        return localeDictionary[word] || word;

    }

    function containsHeaders(row){
        for(const child of row.childNodes){
            if(child.nodeName === "TH"){
                return true;
            }
        }
        return false;
    }

    function hasLabel(el){
        let label = el.querySelector(".label");
        if(label){
            return true;
        } else {
            return false;
        }
    }

    function hasDivs(el){
        let divs = el.querySelectorAll("div");
        return divs.length > 1;
    }

    function downloadList(){
        const findPeople = setInterval(()=>{
            const rows = document.querySelectorAll("tr");
            if(rows.length > 0){
                clearInterval(findPeople);
                let data = "";
                let status = false; // Add status such as "waiting" if someone has been invited by not yet accepted
                let statusMsg = "";
                const defaultStatus = "ok";


                for(const [i, row] of rows.entries()){
                    let columns = Array.from(row.children);
                    for(const [j, col] of columns.entries()){
                        // Skip first column:
                        if(j > 0){
                            // Not the last column
                            if(j < row.children.length -1){
                                // This is a header, just add it to data
                                if(col.scope){
                                    data = data + col.outerText + ";";
                                } else{
                                    // Not a header****************************************************
                                    // We need to check if this cell contains more than one div, and if so, we need to combine them
                                    if(hasDivs(col)){
                                        let divs = col.querySelectorAll("div");
                                        // Add the divs sequentially with a space
                                        for(const div of divs){
                                            data = data + div.outerText + " | ";
                                        }
                                        // Remove the last space and separator
                                        data = data.slice(0,data.length - 2) + ";";
                                    } else if(hasLabel(col)){
                                        // This column has a label, likely the person has been invited but not accepted yet
                                        // Convert the string to array, pop off the label and join the remaining string.
                                        let ar = col.outerText.split(" ");
                                        statusMsg = ar.pop();
                                        data = data + ar.join(" ") + ";";
                                    }
                                    else{
                                        data = data + col.outerText + ";";
                                    }
                                    // ****************************************************Not a header
                                }
                            } else {
                                // Last column
                                if(col.scope){
                                    data = data + "Status;";;
                                } else {
                                    // Not a header****************************************************
                                    // Is there a status message?
                                    if(statusMsg !== ""){
                                        data = data + statusMsg + ";";
                                        // Reset status message for next row
                                        statusMsg = "";
                                    } else {
                                        data = data + defaultStatus + ";";
                                    }
                                    // ****************************************************Not a header
                                }
                            }
                        }
                    }
                    // End of row - remove the last ; and replace it with a line break
                    data = data.slice(0,data.length - 1) + "\n";
                }
                console.log(data);
                // Create a blob from the data
                const blob = new Blob(["\uFEFF"+data], { type: 'text/csv;charset=UTF-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'data.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }else {
                console.log("Searching...");
            }
        },1000);
    }

    // Start by adding a download button
    const addButton = setInterval(()=>{
        let place = document.getElementById("group_categories_tabs");
        if(place){
            // Stop looking for a place to add the button
            clearInterval(addButton);
            // Add a download button
            let dlbtn = document.createElement("button");
            dlbtn.innerText = i18n("download");
            dlbtn.classList.add("Button", "Button--primary");
            place.appendChild(dlbtn);
            dlbtn.addEventListener("click", ()=>{
                downloadList();
            });
        } else {
            console.log("Looking for a place to place a download button...");
        }
    }, 1000);
})();