const urlData = './media/eurostat.json';
let data;
async function loadData() {
    let res = await fetch(urlData);
    data = await res.json();

    let countries = [];
    let indicators = [];
    let years = [];
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
    data.forEach(element => {//verific daca deja exista el in array
        if (!years.includes(element.an)) {
            years.push(element.an);
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

    //acelasi lucru pentru an
    let yearSelector = document.getElementById("year");
    years.forEach(element => {
        let option = document.createElement("option");
        option.value = element;
        option.text = element;
        yearSelector.appendChild(option);
    })

    let animate = document.getElementById("animatie");
    let buttonTable = document.getElementById("buttonTable")
    countrySelector.addEventListener('change', drawSVGGraph);
    indicatorSelector.addEventListener('change', drawSVGGraph);
    yearSelector.addEventListener('change', (e) => {drawBubbleChart(e.target.value);
                                                    createTable(e.target.value)});
    animate.addEventListener('click', canvasAnimation);
    buttonTable.addEventListener('click', () => {
        document.getElementById("myTable").classList.toggle("displayTable");
    })
}

function drawSVGGraph() {
    //gasesc obiectele care coincid cu tara si indicatorul primit
    //le adaug intr-un array ca sa le am pe toate intr-un loc
    //apoi desenez graficul pt valorile din obiectele respective
    let objectsSelected=[];
    let values=[]; //pt valorile indicatorului
    let years = []; //pt anii afisati pe tooltip
    data.forEach(element => {
        if ((element.tara === document.getElementById("country").value) && (element.indicator === document.getElementById("indicator").value))
            objectsSelected.push(element);
    });
    objectsSelected.forEach(element => {
        values.push(element.valoare);
    });
    objectsSelected.forEach(element => {
        years.push(element.an);
    })
    let svg = document.getElementById("graph");
    //elimin cercurile facute pentru graficul anterior 
    svg.querySelectorAll('circle').forEach(circle => circle.remove());
    let polyline = document.getElementById("polyline");
    let points = polyline.getAttribute("points");
    //ii dau val 0 ca sa nu se suprapuna graficele
    points = 0;
    let width = svg.width.baseVal.value, height = svg.height.baseVal.value; 
    //am dat baseval aici pt ca mie height/width imi returna un obiect cu prop astea
    const n = values.length;
    const widthL = width / n;
    const maxVal = Math.max(...values);
    for (let i = 0; i < n; i++) {
        //calculez punctele x si y
        let x = i*widthL;
        let y = height - values[i] * height/ maxVal;
        if (y < height) y +=50; //conditia e ca daca coord pe y nu depaseste
        //lungimea, atunci ii adaug 50 sa mai ocupe din SVG; 
        //pt NL SV imi iesea din pagina daca adaugam direct 50
        points += `${x}, ${y} `  //si le adaug la string-ul de puncte x y
        polyline.setAttribute("points", points); 
        //adaug punctele pe care pun tooltipul
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 2);
        circle.setAttribute("stroke", "red")
        circle.setAttribute("fill", "red")
        //imi creez tooltipul cu title. dinamic, ca sa-mi afiseze deasupra punctului pe care am valoarea, ce valoare am si din ce an este
        let title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.innerHTML=`Valoarea din anul ${years[i]} este ${values[i]}`
        circle.appendChild(title); //si adaug in elementul circle
        svg.appendChild(circle);
    }
    
    //imi desenez axele
    let axis = document.getElementById("axis");
    let axisPoints = axis.getAttribute("points");
    //resetez la 0 punctele sa nu se suprapuna
    axisPoints = 0;
    let yPos = height - values[0] * height / maxVal;
    if (yPos < height) yPos += 50; //acelasi lucru ca mai sus, doar ca pt grafice

    let xPos = n*widthL;
    axisPoints += `0,0 0,${yPos} ${xPos},${yPos} `
    axis.setAttribute("points", axisPoints)
}

function drawBubbleChart(year) {
    //gasesc obiectele care coincid cu anul primit
    let objectsSelected = [];
    //am nevoie de valori PIB si valori SV, folosesc 2 vectori dif
    let valuesPIB = [];
    let valuesPOP = [];
    let valuesSV = [];
    data.forEach(element => {
        if (element.an === year)
            objectsSelected.push(element);
    });
    objectsSelected.forEach(element => {
        if (element.indicator === "PIB")
            valuesPIB.push(element.valoare);
    });
    objectsSelected.forEach(element => {
        if (element.indicator === "POP")
            valuesPOP.push(element.valoare);
    });
    objectsSelected.forEach(element => {
        if (element.indicator === "SV")
            valuesSV.push(element.valoare);
    });
    let canvas = document.getElementById("bubblechart");
    let context = canvas.getContext("2d");
    let width = canvas.width, height = canvas.height;
    // sa nu desenez peste
    context.fillStyle = "white";
    context.fillRect(0,0,width, height);

    //iau pe axa y valuesPIB si pe axa x valuesPop
    const n = valuesPIB.length; //nr de cercuri; pib
    const maxVal = Math.max(...valuesPIB);
    for (let i = 0; i < n; i++) {
        //aici imi declar culoarea randomizata cu care desenez
        let randomColor = "rgb("+Math.floor(Math.random()*256)+","
        +Math.floor(Math.random()*256)+","+Math.floor(Math.random()*256)+")";
        //desenez cercul
        context.fillStyle = randomColor;
        context.beginPath();
        let x = width * valuesPOP[i]/10000000/5+5;
        let y = height - valuesPIB[i] * height/ maxVal+5;
        let r = valuesSV[i]/10; //am ales o valoare arbitrara ca sa nu-mi ocupe prea mult spatiu
        //oricum SV sunt f apropiate intre ele si toate au o marime asemenatoare
        context.arc(x,y,r,0,2 * Math.PI);
        context.fill();
        //desenez legenda
        context.fillStyle = randomColor;
        context.fillText(`${objectsSelected[i].tara}`,447,i*10+10);
        context.fillText(`${valuesSV[i]}`,480,i*10+10);
        context.beginPath();
        context.fillStyle = randomColor;
        context.arc(470,i*10+6,5,0,2*Math.PI);
        context.fill();
    }
    //desenez si axele
    let y = height - valuesPIB.sort(function(a, b) {
        return a-b; //fac o functie de sortare numerica; sort() functioneaza doar pe stringuri
    })[0] * height / maxVal + 10;
    context.beginPath(); 
    context.lineWidth = 2;
    context.moveTo(0,0);
    context.lineTo(2,y);
    context.lineTo(width, y);
    context.strokeStyle = "black";
    context.stroke();
//  desenez anul
    context.strokeText(`${year}`, 250, 10);
}

let bool = false;
function canvasAnimation() {
    //folosesc variabila bool pentru ca atunci cand apas de mai multe ori
    //pe butonul de animatie, sa nu porneasca mai multe in acelasi timp
    if (!bool) {
    bool = true;
    let i=0;
    let years = [];
    data.forEach(element => {
        if (!years.includes(element.an)) {
            years.push(element.an);
        }
    });
    let interval = setInterval(function() {
        if (i > years.length-1) {
            clearInterval(interval);
            bool = false;
        } else {
            drawBubbleChart(years[i]);
            i++;
        }
    }
    ,1000);
    }
}


function createTable(year) {

    let objectsSelected = [];
    let indicators = [];
    let countries = [];
    let valuesPIB = [];
    let valuesSV = [];
    let valuesPOP = [];
    let sumaPIB=0, sumaPOP=0, sumaSV=0;
    data.forEach(element => {
        if (element.an === year)
            objectsSelected.push(element);
    });
    data.forEach(element => {//verific daca deja exista el in array
        if (!indicators.includes(element.indicator)) {
            indicators.push(element.indicator);
        }
    });
    objectsSelected.forEach(element => {//verific daca deja exista el in array
        if (!countries.includes(element.tara)) {
            countries.push(element.tara);
        }
        if (element.indicator === "PIB") {
            valuesPIB.push(element.valoare);
            if (element.valoare != "null") {
                sumaPIB += element.valoare;
            }
        }
        if (element.indicator === "POP") {
            valuesPOP.push(element.valoare);
            if (element.valoare != "null") {
                sumaPOP += element.valoare;
            }
        }
        if (element.indicator === "SV") {
            valuesSV.push(element.valoare);
            if (element.valoare != "null") {
                sumaSV += element.valoare;
            }
        }
    });

    let mediaPIB = sumaPIB/(valuesPIB.length);
    let mediaPOP = sumaPOP/(valuesPOP.length);
    let mediaSV = sumaSV/ (valuesSV.length);
    
    let tableExists = document.getElementById("myTable");
    if (tableExists) {
        document.body.removeChild(tableExists);
    }
    let table = document.createElement("table");

    let tableHeader = document.createElement("thead");
    let tableBody = document.createElement("tbody");
    let headerRow = document.createElement("tr");
    let headerCountry = document.createElement("th");
    headerCountry.innerHTML = "Tara";
    headerRow.appendChild(headerCountry);
    let objects = [];
    for (let i=0; i < countries.length; i++) {
        objects.push({
            tara: countries[i],
            SV: valuesSV[i],
            PIB: valuesPIB[i],
            POP: valuesPOP[i]
        });
    }
    console.log(objects);

    for (let prop of indicators) {
        let headerCell = document.createElement("th");
        headerCell.innerHTML = prop;
        headerRow.appendChild(headerCell);
    }

    for (let prop of objects) {
        let tableRow = document.createElement("tr");
        let dataCellCountry = document.createElement("td");
        let dataCellSV = document.createElement("td");
        let dataCellPIB = document.createElement("td");
        let dataCellPOP = document.createElement("td");
        dataCellCountry.innerHTML = prop.tara;
        dataCellSV.innerHTML = prop.SV;
        dataCellPIB.innerHTML = prop.PIB;
        dataCellPOP.innerHTML = prop.POP;
        tableRow.appendChild(dataCellCountry);
        tableRow.appendChild(dataCellSV);
        tableRow.appendChild(dataCellPIB);
        tableRow.appendChild(dataCellPOP);
        tableBody.appendChild(tableRow);
        if (prop.SV > mediaSV) {
            dataCellSV.style.backgroundColor = "green";
        } else {
            dataCellSV.style.backgroundColor = "red";
        }
        if (prop.PIB > mediaPIB) {
            dataCellPIB.style.backgroundColor = "green";
        } else {
            dataCellPIB.style.backgroundColor = "red";
        }
        if (prop.POP > mediaPOP) {
            dataCellPOP.style.backgroundColor = "green";
        } else {
            dataCellPOP.style.backgroundColor = "red";
        }
    }

    tableHeader.appendChild(headerRow);
    table.appendChild(tableBody);
    table.appendChild(tableHeader);
    table.id = "myTable";
    document.body.appendChild(table);
}


document.addEventListener('DOMContentLoaded', loadData);
