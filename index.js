const fs = require('fs');
const Papa = require('papaparse');

var myArgs = process.argv.slice(2);
const salesAssociatePernerColumn = myArgs[2];
const csvFilePath = 'data/Roster 2022-02-10.csv';
let userInput = {};

const readCSV = (filePath) => {
    const csvFile = fs.readFileSync(filePath)
    const csvData = csvFile.toString()
    return new Promise(resolve => {
        Papa.parse(csvData, {
            complete: results => {
                resolve(results.data);
                processResults(results.data);
            }
        });
    });
};

let perner = new Set();
let unparseData = [];
let pernerColumnNums = JSON.parse('[' + myArgs[1] + ']');
readCSV(myArgs[0]);


function processResults(data) {

    var object = {};

    for (row of data) {

        let user = {
            'Line_of_Business__c': row[myArgs[3]],
            'Region__c': row[myArgs[4]],
            'Area__c': row[myArgs[5]],
            'Market__c': row[myArgs[6]],
            'KindredPro__c': row[myArgs[7]],
            'SalesPro__c': row[myArgs[8]],
            'TAF__c': row[myArgs[9]],
            'Date_of_Hire__c': row[myArgs[10]],
            'HH_Rebrand_Phase__c': row[myArgs[11]],
        }

        // 12,17,22,27,32,45
        for (pernerColumn of pernerColumnNums) {
            let key = row[pernerColumn];
            if (key && user && isNumeric(key) && !perner.has(key)) {
                perner.add(key);
                let region = user.Region__c;
                region = region.substring(0, region.indexOf(' ('));
                let rebrandPhase = '';
                let phase1 = '3/1/22';
                let phase2 = '6/1/22';
                let phase3 = '9/1/22';
                // console.log(phase1, phase2, phase3);
                // console.log(user.HH_Rebrand_Phase__c);
                let rebrandDate = user.HH_Rebrand_Phase__c || null;
                // console.log(rebrandDate, ' - ', phase1, phase2, phase3);
                if (rebrandDate == phase1) rebrandPhase = 'Phase 1';
                if (rebrandDate == phase2) rebrandPhase = 'Phase 2';
                if (rebrandDate == phase3) rebrandPhase = 'Phase 3';
                let user_row = [
                    key,
                    user.Line_of_Business__c,
                    region,
                    user.Area__c,
                    user.Market__c,
                ];
                if (pernerColumn == salesAssociatePernerColumn) {
                    user_row.push(user.KindredPro__c);
                    user_row.push(user.SalesPro__c);
                    user_row.push(user.TAF__c);
                    user_row.push(user.Date_of_Hire__c);
                } else {
                    user_row.push('');
                    user_row.push('');
                    user_row.push('');
                    user_row.push('');
                }
                user_row.push(rebrandPhase);
                unparseData.push(user_row);
            }
        }


    }

    var csv = Papa.unparse({
        "fields": ["Perner__c", "Line_of_Business__c", "Region__c", "Area__c", "Market__c",
            "KindredPro__c", "SalesPro__c", "TAF__c", "Date_of_Hire__c", "HH_Rebrand_Phase__c"],
        "data": unparseData
    });


    let filename = 'load.csv';
    if (myArgs[myArgs.length]) filename = myArgs[myArgs.length];
    fs.writeFile('./load_files/' + filename, csv, err => {
        if (err) {
            console.error(err)
            return
        }
        //file written successfully
    })

}

function isNumeric(value) {
    return /^-?\d+$/.test(value);
}

