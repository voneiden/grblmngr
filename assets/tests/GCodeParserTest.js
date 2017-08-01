import GCodeParser from "../utils/gcode/GCodeParser";
//import fs from "fs";
//const GCodeParser = require("../utils/gcode/GCodeParser");
const fs = require("fs");
let gcode = fs.readFile("./data/GCodeSample.nc", "utf8", function(err, data) {
    GCodeParser.parseLines(data.split("\n"));
});

