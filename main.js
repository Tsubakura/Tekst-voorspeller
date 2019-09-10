//De volgende modules zijn vereist: csv-parser en inquirer.
//De zinnen database is opgehaald van https://tatoeba.org/eng/downloads

//PS: Programma werkt niet helemaal perfect, waarschijnlijk een flaw in de algorithme.

const fs = require("fs");
const csv = require("csv-parser");
const inquirer = require('inquirer');

let data = [];
console.log("Fetching database...")
fs.createReadStream('./sentences.csv')
.pipe(csv())
.on('data', function (row) {
  if(row.sample.split("\t")[1] == "nld"){
    let value = row.sample.split("\t")[2].toLowerCase().replace(/[&\/\\#,+()$~%.'":*!?<>{}]/g, '');
    data.push(value);
  }
})
.on('end', function () {
  return main();
})

function main(){
  let question = [
    {
      type: 'input',
      name: 'name',
      message: "Enter a sentence:"
    }
  ]
  inquirer.prompt(question).then(answer => {
    let value = answer['name'].toLowerCase();
    let load = engine(value);
    if(load.length > 0){
      let result = parseResults(processHits(load, value.split(" ").length));
      for(const x in result){
        console.log(`${x}: ${result[x]}`);
      }
    }
    return main();
  })
}

function engine(sample){
  let newArr = [];
  for(const x of data){
    if(x.startsWith(sample)){
      if(sample.split(" ").length < x.split(" ").length) newArr.push(x);
    }
  }
  return newArr;
}

function processHits(input, size){
  let newObj = {};
  for(const x of input){
    (newObj.hasOwnProperty(x.split(" ")[size])) ? newObj[x.split(" ")[size]]++ : newObj[x.split(" ")[size]] = 1;
  }
  return newObj;
}

function parseResults(object){
  let newArr = {};
  for(let i = 0; i < 10; i++){
    let key = giveHighestKey(object);
    if(key == undefined) break;
    newArr[key] = object[key];
    delete object[key];
  }
  return convertToPercent(newArr);
}

function convertToPercent(object){
  let max = 0;
  let newObj = {};
  for(const x in object){
    max += object[x];
  }
  for(const x in object){
    newObj[x] = `${Math.floor((object[x]/max)*100)}%`;
  }
  return newObj;
}

function giveHighestKey(object){
  try{
    return Object.keys(object).reduce((a, b) => object[a] > object[b] ? a : b)
  }
  catch(err){
    return undefined;
  }
}