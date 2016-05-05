// ==UserScript==
// @name         Delightful Apple Documentation
// @namespace    https://github.com/kwongius/
// @homepageURL  https://github.com/kwongius/DelightfulAppleDoc
// @version      0.1.1
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

    var prerelease = current_location.match(/^https?:\/\/developer\.apple\.com\/library\/prerelease/i) !== null;
    var documentation = current_location.match(/^https?:\/\/developer\.apple\.com\/library(\/prerelease)?\/[^\/]+\/documentation\//i) !== null;
    var pageNotFound = document.body.className == "pnf";

    // If page isn't found, add a simple back button
    if (pageNotFound) {
        GM_addStyle(GM_getResourceText("pure-css"));

        var backButton = document.createElement("button");
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
                #reference_container > .important { background-color: #F9BF3B; }
        `);
    }
    else {
        // Drop the opacity of the banner for current release
        GM_addStyle(".github-fork-ribbon-wrapper { opacity: 0.5; } .github-fork-ribbon-wrapper:hover { opacity: 1.0; }");
    }

    var ribbon = document.createElement("div");
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
            right: 15px;
            bottom: 15px;
            text-align: right;
            padding: 4px;
            opacity: 0.5;
            background: #ccc;
        }

        #os_buttons:hover {
            opacity: 1.0;
        }

        #os_buttons > ul > li {
           padding: 4px;
        }

        #os_buttons_list > li.other {
            display: none;
        }
        #os_buttons_list > li.current {
            display: inline-block;
        }

        #os_buttons:hover > #os_buttons_list > li {
            display: inline-block;
        }
    `);


    var os_list = ["ios", "watchos", "tvos", "mac"];
    var osVersionName = function(os) {
        if (os == "ios") {
            return "iOS";
        }
        else if (os == "watchos") {
            return "watchOS";
        }
        else if (os == "tvos") {
            return "tvOS";
        }
        else if (os == "mac") {
            return "OS X";
        }
        return os;
    }

    // Create OS buttons
    var container = document.createElement("div");
    var os_buttons = document.createElement("ul");
    container.appendChild(os_buttons);
    container.id = "os_buttons";
    os_buttons.id = "os_buttons_list";

    for (var i = 0; i < os_list.length; i++) {
        var os = os_list[i];

        var url = current_location.replace(/(apple\.com\/library(\/prerelease)?\/)([a-z]*)\//i, "$1" + os + "/");
        var current = current_os == os;

        var link = document.createElement("a");
        link.text = osVersionName(os);
        link.className = "pure-button" + (current ? " pure-button-primary" : "");
        link.setAttribute("href", url);

        var item = document.createElement("li");
        item.className = (current ? "other" : "other");
        item.appendChild(link);

        os_buttons.appendChild(item);
    }

    // Add header item
    var titleSpan = document.createElement("span");
    titleSpan.innerHTML = "Current: " + osVersionName(current_os);
    titleSpan.className = "pure-button pure-button-primary";

    var currentItem = document.createElement("li");
    currentItem.className = "current";
    currentItem.appendChild(titleSpan);
    os_buttons.appendChild(currentItem);

    document.body.appendChild(container);
})()
