import GCodeParser from "../utils/gcode/GCodeParser";
import GrblSimulator from "../utils/gcode/GrblSimulator";
import {readCommandsRegex} from "../utils/gcode/GCodeParser";
//import fs from "fs";
//const GCodeParser = require("../utils/gcode/GCodeParser");
const fs = require("fs");
import timeit from "qtimeit";
import {parseStringSync} from "gcode-parser";


let gcode = fs.readFile("./data/GCodeSample.nc", "utf8", function(err, data) {
    let lines = data.split("\n");

    //console.log(GCodeParser.parseLines(lines));
    let parsed;
    timeit(100, function() {
        parsed = GCodeParser.parseLines(lines);
    });

    let results;
    timeit(100, function() {
        results = GrblSimulator.simulate(parsed)
    });

    console.log("Got results", results);

    /*
    timeit(100, function() {
        parseStringSync(data);
    });

    timeit(10000, function() {
        GCodeParser.parseLines(["G1 X20.5 Y30.1 Z15.12321"]);
    });
    */

    timeit(10000, function() {
        readCommandsRegex("G1 X20.5 Y30.1 Z15.12321");
    });


});

