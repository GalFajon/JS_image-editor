//page elements
let canvas;
let context;

//file upload
let fileupload;

function uploadSlika(item) {
    slika.src = URL.createObjectURL(item.files[0]);
    setsliders();
}

//image stuff
let imageData;

//slika + funkcije
let slika = new Image();

slika.onload = function () {
    canvas.width = slika.width;
    canvas.height = slika.height;

    context.drawImage(slika, 0, 0);
}

slika.onerror = function() {
    alert("Napaka pri nalaganju slike!");

    slika.src="error.jpg";
}

//init
document.body.onload = function () {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    fileupload = document.getElementById("image_upload");

    slika.src="test.jpg";

    fileupload.onchange = function() {uploadSlika(fileupload)};
}

//setsliders
function setsliders() {
    document.getElementById("gamma").value = 1;
    document.getElementsByName("red")[0].value = (255/2);
    document.getElementsByName("modra")[0].value = (255/2);
    document.getElementsByName("zelena")[0].value = (255/2);
}

function reset() {
    setsliders();
    redraw();
}

function threshold() {
    redraw();
    imageData = context.getImageData(0,0,slika.width,slika.height);
    
    let threshold = 0;

    let mode = "manual";

    if (document.getElementById("threshold-mode").checked) mode = "automatic";

    if (mode == "automatic") {
    grayscale();

    for (let i=0;i<imageData.data.length;i+=4) {
        threshold += imageData.data[i];
        threshold += imageData.data[i+1];
        threshold += imageData.data[i+2];
    }

    threshold = threshold / ((imageData.data.length / 4) * 3)
    }

    if (mode == "manual") {
        threshold = document.getElementById("threshold-value").value;
    }

    for (let i=0;i<imageData.data.length;i+=4) {
        if (0.2126*imageData.data[i] + 0.7152*imageData.data[i+1] + 0.0722*imageData.data[i+2] >= threshold) {
            imageData.data[i] = 255;
            imageData.data[i+1] = 255;
            imageData.data[i+2] = 255;
        }
        else {
            imageData.data[i] = 0;
            imageData.data[i+1] = 0;
            imageData.data[i+2] = 0;
        } 
    }

    context.putImageData(imageData,0,0)
    
}

function grayscale () {
    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (let i=0;i<imageData.data.length;i+=4) {
        let y = imageData.data[i]*0.299;
        y += imageData.data[i+1]*0.587;
        y += imageData.data[i+2]*0.114

        imageData.data[i] = y;
        imageData.data[i+1] = y;
        imageData.data[i+2] = y;

        y=0;
    }

    context.putImageData(imageData,0,0)
}

function negative () {
    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (let i=0;i<imageData.data.length;i+=4) {
        imageData.data[i] = 255-imageData.data[i];
        imageData.data[i+1] = 255-imageData.data[i+1];
        imageData.data[i+2] = 255-imageData.data[i+2];
    }

    context.putImageData(imageData,0,0)
}

function gamma (item) {
    redraw();
    let gamma = item.value;
    let gammacorrection = 1/gamma;
    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (let i=0;i<imageData.data.length;i+=4) {
        imageData.data[i] = 255*Math.pow((imageData.data[i] / 255), gammacorrection);
        imageData.data[i+1] = 255*Math.pow((imageData.data[i+1] / 255), gammacorrection);
        imageData.data[i+2] = 255*Math.pow((imageData.data[i+2] / 255), gammacorrection);
    }

    context.putImageData(imageData,0,0)
}

function redraw() {
    canvas.width = slika.width;
    canvas.height = slika.height;

    context.drawImage(slika, 0, 0);
}

function red(item) {
    let redvalue = item.value;

    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (let i=0;i<imageData.data.length;i+=4) {
        imageData.data[i] = redvalue;
    }

    context.putImageData(imageData,0,0)
}

function green(item) {
    let greenvalue = item.value;
    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (let i=0;i<imageData.data.length;i+=4) {
        imageData.data[i+1] = greenvalue;
    }

    context.putImageData(imageData,0,0)
}

function blue(item) {    
    let bluevalue = item.value;
    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (let i=0;i<imageData.data.length;i+=4) {
        imageData.data[i+2] = bluevalue;
    }

    context.putImageData(imageData,0,0)
}

function matrix(matrix,divider) {
    imageData = context.getImageData(0,0,slika.width,slika.height);
    let imageDataCopy = context.getImageData(0,0,slika.width,slika.height);

    let x=slika.width;
    let y=slika.height;

    for (let i = 0;i<=x*4;i+=4) {
    for (let j = 0;j<=y*4;j+=4) {

        let average_r = 0;
        let average_g = 0;
        let average_b = 0;

        let currentpixel = 0;

        for (let minusy=-4;minusy <= 4;minusy+=4) {
            for (let minusx=-4;minusx <= 4;minusx+=4) {
                average_r += imageData.data[(i+minusx)+((j+minusy)*slika.width)] * matrix[currentpixel];
                average_g += imageData.data[(i+minusx)+((j+minusy)*slika.width)+1] * matrix[currentpixel];
                average_b += imageData.data[(i+minusx)+((j+minusy)*slika.width)+2] * matrix[currentpixel];

                currentpixel++;
            }
        }
        
        average_r = average_r/divider;
        average_g = average_g/divider;
        average_b = average_b/divider;


        imageDataCopy.data[(i)+(j*slika.width)] = average_r;
        imageDataCopy.data[(i)+(j*slika.width)+1] = average_g;
        imageDataCopy.data[(i)+(j*slika.width)+2] = average_b;
        }
    }

    context.putImageData(imageDataCopy,1,1)
}