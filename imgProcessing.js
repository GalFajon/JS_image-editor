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

    context.putImageData(imageDataCopy,0,0)
}

function median() {
        imageData = context.getImageData(0,0,slika.width,slika.height);
        let imageDataCopy = context.getImageData(0,0,slika.width,slika.height);
    
        let x=slika.width;
        let y=slika.height;
    
        for (let i = 0;i<=x*4;i+=4) {
            for (let j = 0;j<=y*4;j+=4) {
    
            let r_array = [];
            let g_array = [];
            let b_array = [];
    
            for (let minusy=-4;minusy <= 4;minusy+=4) {
                for (let minusx=-4;minusx <= 4;minusx+=4) {

                    let r_value = imageData.data[(i+minusx)+((j+minusy)*slika.width)];
                    let g_value = imageData.data[(i+minusx)+((j+minusy)*slika.width)+1]; 
                    let b_value = imageData.data[(i+minusx)+((j+minusy)*slika.width)+2]

                    if (r_value != undefined) r_array.push(r_value);
                    if (g_value != undefined) g_array.push(g_value);
                    if (b_value != undefined) b_array.push(b_value);
                    
                }
            }
                r_array.sort((a, b) => a - b);
                g_array.sort((a, b) => a - b);
                b_array.sort((a, b) => a - b);
                
                let median = array_median(r_array);
                imageDataCopy.data[(i)+(j*slika.width)] = r_array[median];

                median = array_median(g_array);
                imageDataCopy.data[(i)+(j*slika.width)+1] = g_array[median];

                median = array_median(b_array);
                imageDataCopy.data[(i)+(j*slika.width)+2] = b_array[median];
            }
    }
    context.putImageData(imageDataCopy,0,0)
}

function array_median(array) {
    if (array.lenght == 0) {
        return 0
    }
    else if (array.length % 2 == 0) {
        return array.lenght / 2
    }
    else {
        return (Math.floor(array.length/2) + 1)
    }
}

function combine_images() {    
    let slika_2 = new Image();
    slika_2.src = URL.createObjectURL(document.getElementById('combine_upload').files[0]); 

    slika_2.onload = function() {
    let imageData_1 = context.getImageData(0,0,slika.width,slika.height);
    let imageDataCopy = context.getImageData(0,0,slika.width,slika.height);
    let v_canvas = document.createElement('canvas');
    v_canvas.width = slika_2.width;
    v_canvas.height = slika_2.height;

    let v_context = v_canvas.getContext('2d');
    v_context.drawImage(slika_2, 0, 0);

    let imageData_2 = v_context.getImageData(0,0,slika_2.width,slika_2.height);

    for (let i=0;i<imageData_1.data.length;i+=4) {
        imageDataCopy.data[i] = (imageData_1.data[i] + imageData_2.data[i]);
        imageDataCopy.data[i+1] = imageData_1.data[i+1] + imageData_2.data[i+1];
        imageDataCopy.data[i+2] = imageData_1.data[i+2] + imageData_2.data[i+2];
        
        imageDataCopy.data[i+3] = 128;  
    }

    context.putImageData(imageDataCopy,0,0);
    }
}