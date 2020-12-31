const urlData = './media/eurostat.json';
let data;
async function loadData() {
    let res = await fetch(urlData);
    data = await res.json();

    let countries = [];
    let indicators = [];
    //incarc un array de countries cu elementele tari din arr de obj
    data.forEach(element => {//verific daca deja exista el in array
        if (!countries.includes(element.tara)) {
            countries.push(element.tara);
        }
    });
    //acelasi lucru pt indicatori
    data.forEach(element => {//verific daca deja exista el in array
        if (!indicators.includes(element.indicator)) {
            indicators.push(element.indicator);
        }
    });
    //creez un option value pt fiecare element din countries
    //preiau selectorul pt tari
    let countrySelector = document.getElementById("country");
    countries.forEach(element => {
        let option = document.createElement("option");
        option.value = element;
        option.text = element;
        countrySelector.appendChild(option);
    })
    //acelasi lucru pt indicators
    let indicatorSelector = document.getElementById("indicator");
    indicators.forEach(element => {
        let option = document.createElement("option");
        option.value = element;
        option.text = element;
        indicatorSelector.appendChild(option);
    })
    console.log(countries);
    console.log(data);

    countrySelector.addEventListener('change', drawGraph);
    indicatorSelector.addEventListener('change',drawGraph);
}

function drawGraph() {
    //gasesc obiectele care coincid cu tara si indicatorul primit
    //le adaug intr-un array ca sa le am pe toate intr-un loc
    //apoi desenez graficul pt valorile din obiectele respective
    let objectsSelected=[];
    let values=[]; //pt valorile indicatorului
    data.forEach(element => {
        if ((element.tara === document.getElementById("country").value) && (element.indicator === document.getElementById("indicator").value))
            objectsSelected.push(element);
    });
    objectsSelected.forEach(element => {
        values.push(element.valoare);
    });
    console.log(values);
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");
    let width = canvas.width, height = canvas.height;
    //sa nu desenez peste
    context.fillStyle = "white";
    context.fillRect(0,0,width, height);

    const n = values.length;
    const widthL = width / n;
    const maxVal = Math.max(...values);
    context.strokeStyle = "red";
    context.lineWidth = 3;
    
    context.beginPath();
    for (let i = 0; i < n; i++) {
        let x = i*widthL;
        let y = height - values[i] * height/ maxVal;
        context.lineTo(x,y+50);
        console.log(x,y)
    }
    context.stroke();
    let y = height - values[0] *height /maxVal;
    context.beginPath();
    context.lineWidth = 2;
    context.moveTo(2,20);
    context.lineTo(2,y+50);
    context.lineTo(n*widthL, y+50);
    context.strokeStyle = "black";
    context.stroke();
    console.log(n, width, height, widthL, maxVal);
}

document.addEventListener('DOMContentLoaded', loadData);
