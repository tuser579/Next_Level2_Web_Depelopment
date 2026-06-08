import type { Request, Response, NextFunction } from "express";
import fs from "fs";

const logger = (req: Request,res: Response,next: NextFunction) => {
    // console.log("Time: ", new Date(), "Requested URL: ", req.url, "Requested Method: ", req.method, "Request Body: ", req.body);
    const log = `\nMethod - ${req.method}, URL - ${req.url}, Body - ${req.body}, Date - ${new Date()}\n`;
    fs.appendFile("logger.txt", log, (err) => {
        // if(err) {
        //     console.log("Error writing log file:", err);
        // }   
    })
    next();
}

export default logger;