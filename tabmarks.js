/*
Copyright (c) <2015> Heiko 'riot' Weinen <riot@c-base.org>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var self = require('sdk/self');
var tabs = require('sdk/tabs');
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require("sdk/panel");
var notifications = require("sdk/notifications");

var ss = require('sdk/simple-storage');

var { Bookmark, Group, save } = require("sdk/places/bookmarks");

if (!ss.storage.killtabs)
    ss.storage.killtabs = ['about:blank', 'about:newtab'];

function addItem(tab) {
    ss.storage.killtabs.push(tab);
    notifications.notify({"text": "TabMarks added " + tab + " to its database."});
}

function listItems() {
    console.log("TabMarks has these items stored: ", ss.storage.killtabs);
}

function KillTabs() {
    console.log("TabMarks will now clean up all KillTabs.");

    for (let tab of tabs) {
      console.log(tab.title);
      if (ss.storage.killtabs.indexOf(tab.url) > 0) {
        console.log("Killing stupid tab.");
        tab.close();
      }
    }

    notifications.notify({"text": "Closed all KillTabs."});
}

function BookmarkTabs() {
    console.log("TabMarks will now bookmark all tabs.");
    var closeTabs = require('sdk/simple-prefs').prefs['closetabs'];

    var folderName = "TABMARKS-" + String(new Date().getTime());
    var group = Group({title: folderName});

    console.log(ss.storage.killtabs);

    var bookmarks = [];
    var urls = [];

    for (let tab of tabs) {
      if (tabs.length == 1) {
        console.log("Reached last tab, stopping closing.");
        break;
      }

      console.log(tab.title);
      console.log(tab.url);
      
      if (ss.storage.killtabs.indexOf(tab.url) < 0) {
          var bookmark = Bookmark({title: tab.title, url: tab.url, group: group});
          if (urls.indexOf(tab.url) < 0) {
              bookmarks.push(bookmark);
              urls.push(tab.url);
              console.log("Bookmark created.");
          } else {
              console.log("Bookmark already created.");
          }
      } else {
          console.log("Not bookmarking killtab.");
      }

      if (closeTabs == true) {
          tab.close();
      }
    }
    if (bookmarks.length > 0) {
        save(bookmarks).on("end", function(saves, inputs) {
            var text = "";
            if (saves.length > 1) {
                text = " saved " + saves.length + " bookmarks to " + folderName;
            } else if (saves.length == 1) {
                text = " saved one bookmark to " + folderName;
            } else {
                text = " not saved any new bookmarks.";
            }
            notifications.notify({"text": "TabMarks has " + text});
        });
    } else {
        notifications.notify({"text": "TabMarks did not create any bookmarks. Maybe check your KillTabs list?"});
    }
}

function checkTabs() {
    if (require('sdk/simple-prefs').prefs['killtabs'] == true) {
        KillTabs();
    } else {
        console.log("Not killing killtabs");
    }

    BookmarkTabs();
}



function handleHide() {
    button.state('window', {checked: false});
}

var buttonpanel = panels.Panel({
    contentURL: self.data.url("buttonpanel.html"),
    contentScriptFile: self.data.url("buttonpanel.js"),
    onHide: handleHide
});

function handleButtonChange(state) {
  if (state.checked) {
    buttonpanel.show({
        position: button
    });
  }
}

buttonpanel.port.on("click-button", function(name) {
  console.log(name);
  if (name == "addtab") {
    if (ss.storage.killtabs.indexOf(tabs.activeTab.url) == -1) {
      addItem(tabs.activeTab.url);
    } else {
      notifications.notify({"text": "TabMarks has that Tab already on the kill list."});
    }
  } else if (name == "clearkilltabs") {
    ss.storage.killtabs = [];
    notification.notify({"text": "TabMarks KillTabs have been cleared."});
  } else if (name == "bookmarktabs") {
    BookmarkTabs();
  } else if (name == "killtabs") {
    KillTabs();
  }
});

var button = ToggleButton({
  id: "tabmark-button",
  label: "Archive & close tabs",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
  onChange: handleButtonChange
});

// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;

