// ==UserScript==
// @name         Download media recordings in Canvas
// @namespace    http://tampermonkey.net/
// @version      2024-12-04
// @description  Download student's media recordings from SpeedGrader in Canvas at the University of Agder (UiA)
// @author       Espen Raugstad
// @match        https://uia.instructure.com/courses/*/gradebook/speed_grader?assignment_id=*&student_id=*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Function to show a modal window with link to download source
    function popup(source){
        let d = document.createElement("dialog");
        d.innerHTML = `<form method="dialog" style="display:flex; flex-direction: column;"><h3>Last ned video</h3><a href="${source}" download>Last ned video her.</a><br><button class="Button Button--primary">Ferdig</button></form>`;
        document.body.appendChild(d);
        d.showModal();
    }

    const findVideoTimer = setInterval(()=>{
        // Find all iframes
        let frames = document.querySelectorAll("iframe");
        for(const frame of frames){
            // Look for video in the iframe
            let video = frame.contentDocument.querySelector("video");
            if(video){
                popup(video.src);
                clearInterval(findVideoTimer);
                return;
            }
        }
    },1000);
})();