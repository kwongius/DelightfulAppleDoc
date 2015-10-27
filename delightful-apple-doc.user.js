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
                    background-image: url('data:image/png;base64,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');
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
