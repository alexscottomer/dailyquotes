// Daily Quotes FitBit Clockface
// Version: 1.2.0
//  Author: Alexander S Omer
//    Date: 05/22/18

import clock from "clock";
import document from "document";
import { HeartRateSensor } from "heart-rate";
import { preferences } from "user-settings";
import * as util from "../resources/utils";
import * as quotes from "../resources/quotes";
import * as fs from "fs";

clock.granularity = "seconds"; // Tick the clock every second

// Declare variables
var day = null; // We will need to keep track of the day
var hrm = new HeartRateSensor(); // Create a new instance of the HeartRateSensor object
var init = false; // This tells us whether or not the app has been initialized
const settingsFileName = "dailyQuotes.txt"; // This is where we will store our state settings

// Get handles on the elements
const quoteLabel = document.getElementById("quote");
const clockLabel = document.getElementById("clock");
const heartLabel = document.getElementById("heart");
const background = document.getElementById("background");

// Wire up events
quoteLabel.onclick = function(e) {
  updateQuote();
}

background.onclick = function(e) {
  updateBackground();
}

hrm.onreading = function() {
  updateHeart();
}

clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  let mins = util.zeroPad(today.getMinutes());
  
  if (preferences.clockDisplay === "12h")
    hours = hours % 12 || 12; // 12h format
  else 
    hours = util.zeroPad(hours); // 24h format
  
  clockLabel.text = `${hours}:${mins}`; // Update the clock element with the current time
  
  if (init === false) { // Is app initialized?
    try {
      loadSettings(); // Try loading settings
    }
    catch (err) {
      updateQuote();
      background.href = "images/1.png";
      day = today.getDay();
      saveSettings();
    }
    
    init = true;
  }
  else {
    // Update quote if needed
    if (day < today.getDay()) { // Has midnight passed since our last tick?
      updateQuote();
      day = today.getDay(); // Update our stored day value
    }
  }
  
  hrm.start(); // Start the heart monitor
}

// Update functions
function updateQuote() {
    quoteLabel.text = quotes.quotes[Math.floor(Math.random() * (quotes.quotes.length - 1))];
    saveSettings();
}

function updateHeart() {
  heartLabel.text = "♥ "; // Heart symbol
  
  // Peek the current sensor values
  if (hrm.heartRate === "00")
    heartLabel.text += "--"; // Show lines instead of all zeros
  else
    heartLabel.text += hrm.heartRate;

  
  hrm.stop(); // Stop monitoring the sensor
}

function updateBackground() {
  if (background.href === "images/1.png") {
    background.href = "images/2.png";
  }
  else if (background.href === "images/2.png") {
    background.href = "images/3.png";
  }
  else if (background.href === "images/3.png") {
    quoteLabel.style.fill = "black";
    clockLabel.style.fill = "black";
    heartLabel.style.fill = "black";
    background.href = "images/4.png";
  }
  else if (background.href === "images/4.png") {
    quoteLabel.style.fill = "white";
    clockLabel.style.fill = "white";
    heartLabel.style.fill = "white";
    background.href = "images/5.png";
  }
  else {
    background.href = "images/1.png";
  }
  
  saveSettings();
}

//Settings functions
function saveSettings() {
  let json_data = {
    "quote": quoteLabel.text,
    "color": quoteLabel.style.fill,
    "background": background.href,
    "day": day
  };
  fs.writeFileSync(settingsFileName, json_data, "json");
}

function loadSettings() {
  let json_object = fs.readFileSync(settingsFileName, "json");
  quoteLabel.text = json_object.quote;
  quoteLabel.style.fill = json_object.color;
  clockLabel.style.fill = json_object.color;
  heartLabel.style.fill = json_object.color;
  background.href = json_object.background;
  day = json_object.day;
}


