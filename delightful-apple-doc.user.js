// ==UserScript==
// @name         Delightful Apple Documentation
// @namespace    https://github.com/kwongius/
// @homepageURL  https://github.com/kwongius/DelightfulAppleDoc
// @version      0.1.0
// @description  Simple script to denote the difference between current and prerelease documentation as well as providing simple buttons to switch between the current documentation OS.
// @author       Kevin Wong
// @match        *://developer.apple.com/library/*
// @run-at       document-body
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @resource     gh-fork-ribbon https://cdnjs.cloudflare.com/ajax/libs/github-fork-ribbon-css/0.1.1/gh-fork-ribbon.min.css
// @resource     pure-css http://yui.yahooapis.com/pure/0.6.0/pure-min.css
// ==/UserScript==

(function() {
    // Get the current URL
    var current_location = window.location.href;

    var prerelease = current_location.match(/^https?:\/\/developer\.apple\.com\/library\/prerelease/i) != null;
    var documentation = current_location.match(/^https?:\/\/developer\.apple\.com\/library(\/prerelease)?\/[^\/]+\/documentation\//i) != null;
    var pageNotFound = document.body.className == "pnf";

    // If page isn't found, add a simple back button
    if (pageNotFound) {
        GM_addStyle(GM_getResourceText("pure-css"));

        var backButton = document.createElement('button');
        backButton.id = "back_button";
        backButton.className = "pure-button";
        backButton.innerHTML = "Go Back";
        backButton.style.margin = "10px";
        backButton.setAttribute("onclick", "window.history.back()");

        var content = document.getElementById("content");
        content.appendChild(backButton);
    }

    // If we aren't looking at active documentation, stop
    if (!documentation || pageNotFound) {
        return;
    }

    GM_addStyle(GM_getResourceText("gh-fork-ribbon"));
    GM_addStyle(GM_getResourceText("pure-css"));

    // Determine the current OS of the documentation
    var current_os = current_location.match(/^https?:\/\/developer\.apple\.com\/library(?:\/prerelease)?\/([a-z]*)\//i)[1].toLowerCase();

    var prereleaseUrl = prerelease ? current_location : current_location.replace(/(apple\.com\/library)/i, "$1/prerelease");
    var currentUrl = prerelease ? current_location.replace(/(apple\.com\/library)\/prerelease/i, "$1") : current_location;

    // Add a simple way to differentiate prerelease documentation (background image)
    if (prerelease) {
        // BG image from extensionizer: https://raw.githubusercontent.com/altryne/extensionizr/master/img/bg.png
        GM_addStyle(`
                body.jazz {
                    background-image: url('https://raw.githubusercontent.com/kwongius/DelightfulAppleDoc/master/prerelease_bg.png');
                    background-attachment: fixed;
                }
                #reference_container > .important { background-color: #F9BF3B; } "
        `);
    }
    else {
        // Drop the opacity of the banner for current release
        GM_addStyle(".github-fork-ribbon-wrapper { opacity: 0.5; } .github-fork-ribbon-wrapper:hover { opacity: 1.0; }");
    }

    var ribbon = document.createElement('div');
    ribbon.id = "ribbon";
    ribbon.className = "github-fork-ribbon-wrapper right";
    ribbon.style.position = "fixed";
    ribbon.innerHTML = '<div class="github-fork-ribbon"' + (prerelease ? "" : 'style="background-color: #59abe3;"') + '>\
        <a href="' + (prerelease ? currentUrl : prereleaseUrl) + '">\
        ' + (prerelease ? 'View Current Release' : 'View Prerelease') + '\
        </a></div>';

    document.body.appendChild(ribbon);


    // Add CSS for buttons

    GM_addStyle(`
        #os_buttons {
            z-index: 9999;
            position: fixed;
            right: 12px;
            top: 150px;
            text-align: right;
            background-color: #ccc;
            padding:4px;
        }

        #os_buttons > div {
            margin: 4px;
        }
    `);

    var createRow = function(os, osName) {
        var url = current_location.replace(/(apple\.com\/library(\/prerelease)?\/)([a-z]*)\//i, "$1" + os + "/");
        var classes = current_os == os ? "pure-button pure-button-primary" : "pure-button";

        return '<div>' +
        '<a href=' + url + ' class="' + classes + '">' + osName + '</a>' +
        '</div>';
    }

    // Create OS buttons
    var os_buttons = document.createElement('div');
    os_buttons.id = "os_buttons";
    os_buttons.innerHTML =
        createRow('ios', 'iOS') +
        createRow('mac', 'OS X') +
        createRow('watchos', 'watchOS') +
        createRow('tvos', 'tvOS');

    document.body.appendChild(os_buttons);
})()
