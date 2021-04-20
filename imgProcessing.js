//what area of the image to edit
let start_point = {
    x:0,
    y:0
};

let end_point = {
    x:100,
    y:100
};

let clickstate = false;

//page elements
let canvas;
let context;

//file upload
let fileupload;

function  getMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  
    return {
      x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
      y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
   }
}

function clickHandler(e) {
    let coords = getMousePos(canvas,e);

    if (clickstate == false) {
        start_point.x = Math.floor(coords.x);
        start_point.y = Math.floor(coords.y);

        document.getElementById("zx").value = Math.floor(coords.x);
        document.getElementById("zy").value = Math.floor(coords.y);
    
        clickstate = true;
    }
    else {
        end_point.x = Math.floor(coords.x);
        end_point.y = Math.floor(coords.y);
        
        document.getElementById("kx").value = Math.floor(coords.x);
        document.getElementById("ky").value = Math.floor(coords.y);

        if (start_point.x > end_point.x) { 
            let swapx = 0;
    
            swapx = start_point.x;
            start_point.x = end_point.x;
            end_point.x = swapx;
        }
    
        if (start_point.y > end_point.y) {
            let swapy = 0;
    
            swapy = start_point.y;
            start_point.y = end_point.y;
            end_point.y = swapy;
        }

        clickstate = false;
    }
};

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
    
    start_point.x = 0;
    start_point.y = 0;

    document.getElementById("zx").value = 0;
    document.getElementById("zy").value = 0;

    document.getElementById("kx").value = slika.width;
    document.getElementById("ky").value = slika.height;

    end_point.x = slika.width;
    end_point.y = slika.height;
}

slika.onerror = function() {
    alert("Napaka pri nalaganju slike!");

    slika.src="error.jpg";
}

//init
document.body.onload = function () {
    canvas = document.getElementById("canvas");
    canvas.addEventListener('click',clickHandler);

    context = canvas.getContext("2d");
    fileupload = document.getElementById("image_upload");

    slika.src="https://www.protagon.gr/wp-content/uploads/2017/03/63984-141726.jpg";

    fileupload.onchange = function() {uploadSlika(fileupload)};

    document.getElementById('tocka-reset').addEventListener("click", function() {
        start_point.x = 0;
        document.getElementById("zx").value = 0;
        start_point.y = 0;
        document.getElementById("zy").value = 0;
    
        end_point.x = slika.width;
        document.getElementById("kx").value = slika.width;
        end_point.y = slika.height;
        document.getElementById("ky").value = slika.height;
    })
    
    document.getElementById('zx').addEventListener("change", function() {
        start_point.x = document.getElementById('zx').value;
    });
    
    document.getElementById('zy').addEventListener("change", function() {
        start_point.y = document.getElementById('zy').value;
    });
    
    document.getElementById('kx').addEventListener("change", function() {
        end_point.x = document.getElementById('kx').value;
    });
    
    document.getElementById('ky').addEventListener("change", function() {
        end_point.y = document.getElementById('ky').value;
    });
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
    imageData = context.getImageData(0,0,slika.width,slika.height);
    
    let threshold = 0;

    let mode = "manual";

    if (document.getElementById("threshold-mode").checked) mode = "automatic";

    if (mode == "automatic") {
    grayscale();

    for (let i=imageData.data.length;i<imageData.data.length;i+=4) {
        threshold += imageData.data[i];
        threshold += imageData.data[i+1];
        threshold += imageData.data[i+2];
    }

    threshold = threshold / ((imageData.data.length / 4) * 3)
    }

    if (mode == "manual") {
        threshold = document.getElementById("threshold-value").value;
    }
    
    for (i = start_point.x;i<end_point.x;i++) {
        for (j = start_point.y; j<end_point.y;j++) {
            let linear_coord = (i + (j*slika.width)) * 4;
            if (0.2126*imageData.data[linear_coord] + 0.7152*imageData.data[linear_coord+1] + 0.0722*imageData.data[linear_coord+2] >= threshold) {
                imageData.data[linear_coord] = 255;
                imageData.data[linear_coord+1] = 255;
                imageData.data[linear_coord+2] = 255;
            }
            else {
                imageData.data[linear_coord] = 0;
                imageData.data[linear_coord+1] = 0;
                imageData.data[linear_coord+2] = 0;
            }
        }
    }

    context.putImageData(imageData,0,0)
    
}

function grayscale () {
    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (i = start_point.x;i<end_point.x;i++) {
        for (j = start_point.y; j<end_point.y;j++) {
            let linear_coord = (i + (j*slika.width)) * 4;

            let val = imageData.data[linear_coord]*0.299;
            val += imageData.data[linear_coord+1]*0.587;
            val += imageData.data[linear_coord+2]*0.114

            imageData.data[linear_coord] = val;
            imageData.data[linear_coord+1] = val;
            imageData.data[linear_coord+2] = val;

            val=0;
        }
    }

    context.putImageData(imageData,0,0)
}

function negative () {
    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (i = start_point.x;i<end_point.x;i++) {
        for (j = start_point.y; j<end_point.y;j++) {
            let linear_coord = (i + (j*slika.width)) * 4;

            imageData.data[linear_coord] = 255-imageData.data[linear_coord];
            imageData.data[linear_coord+1] = 255-imageData.data[linear_coord+1];
            imageData.data[linear_coord+2] = 255-imageData.data[linear_coord+2];
        }
    }
    context.putImageData(imageData,0,0)
}

function gamma (item) {
    let gamma = item.value;
    let gammacorrection = 1/gamma;
    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (i = start_point.x;i<end_point.x;i++) {
        for (j = start_point.y; j<end_point.y;j++) {
            let linear_coord = (i + (j*slika.width)) * 4;

            imageData.data[linear_coord] = 255*Math.pow((imageData.data[linear_coord] / 255), gammacorrection);
            imageData.data[linear_coord+1] = 255*Math.pow((imageData.data[linear_coord+1] / 255), gammacorrection);
            imageData.data[linear_coord+2] = 255*Math.pow((imageData.data[linear_coord+2] / 255), gammacorrection);
        }
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

    for (i = start_point.x;i<end_point.x;i++) {
        for (j = start_point.y; j<end_point.y;j++) {
            let linear_coord = (i + (j*slika.width)) * 4;
            imageData.data[linear_coord] = redvalue;
        }
    }

    context.putImageData(imageData,0,0)
}

function green(item) {
    let greenvalue = item.value;
    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (i = start_point.x;i<end_point.x;i++) {
        for (j = start_point.y; j<end_point.y;j++) {
            let linear_coord = (i + (j*slika.width)) * 4;
            imageData.data[linear_coord+1] = greenvalue;
        }
    }

    context.putImageData(imageData,0,0)
}

function blue(item) {    
    let bluevalue = item.value;
    imageData = context.getImageData(0,0,slika.width,slika.height);

    for (i = start_point.x;i<end_point.x;i++) {
        for (j = start_point.y; j<end_point.y;j++) {
            let linear_coord = (i + (j*slika.width)) * 4;
            imageData.data[linear_coord+2] = bluevalue;
        }
    }

    context.putImageData(imageData,0,0)
}

function matrix(matrix,divider) {
    imageData = context.getImageData(0,0,slika.width,slika.height);
    let imageDataCopy = context.getImageData(0,0,slika.width,slika.height);
    
    for (let i = start_point.x; i <= end_point.x ;i+=1) {
    for (let j = start_point.y; j <= end_point.y ;j+=1) {
        let average_r = 0;
        let average_g = 0;
        let average_b = 0;

        let currentpixel = 0;

        for (let minusy=-1;minusy <= 1;minusy+=1) {
            for (let minusx=-1;minusx <= 1;minusx+=1) {
                average_r += imageData.data[((i+minusx)+((j+minusy)*slika.width))*4] * matrix[currentpixel];
                average_g += imageData.data[((i+minusx)+((j+minusy)*slika.width))*4+1] * matrix[currentpixel];
                average_b += imageData.data[((i+minusx)+((j+minusy)*slika.width))*4+2] * matrix[currentpixel];

                currentpixel++;
            }
        }
        
        average_r = average_r/divider;
        average_g = average_g/divider;
        average_b = average_b/divider;


        imageDataCopy.data[((i)+(j*slika.width))*4] = average_r;
        imageDataCopy.data[((i)+(j*slika.width))*4+1] = average_g;
        imageDataCopy.data[((i)+(j*slika.width))*4+2] = average_b;
        }
    }

    context.putImageData(imageDataCopy,0,0)
}

function median() {
        imageData = context.getImageData(0,0,slika.width,slika.height);
        let imageDataCopy = context.getImageData(0,0,slika.width,slika.height);
    
        for (let i = start_point.x;i<=end_point.x;i+=1) {
            for (let j = start_point.y;j<=end_point.y;j+=1) {
    
            let r_array = [];
            let g_array = [];
            let b_array = [];
    
            for (let minusy=-1;minusy <= 1;minusy+=1) {
                for (let minusx=-1;minusx <= 1;minusx+=1) {

                    let r_value = imageData.data[((i+minusx)+((j+minusy)*slika.width))*4];
                    let g_value = imageData.data[((i+minusx)+((j+minusy)*slika.width))*4+1]; 
                    let b_value = imageData.data[((i+minusx)+((j+minusy)*slika.width))*4+2]

                    if (r_value != undefined) r_array.push(r_value);
                    if (g_value != undefined) g_array.push(g_value);
                    if (b_value != undefined) b_array.push(b_value);
                    
                }
            }
                r_array.sort((a, b) => a - b);
                g_array.sort((a, b) => a - b);
                b_array.sort((a, b) => a - b);
                
                let median = array_median(r_array);
                imageDataCopy.data[((i)+(j*slika.width))*4] = r_array[median];

                median = array_median(g_array);
                imageDataCopy.data[((i)+(j*slika.width))*4+1] = g_array[median];

                median = array_median(b_array);
                imageDataCopy.data[((i)+(j*slika.width))*4+2] = b_array[median];
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

function unsharp_mask() {
    imageData = context.getImageData(0,0,slika.width,slika.height);
    let imageDataCopy = context.getImageData(0,0,slika.width,slika.height);
    let divider = 9;
    let matrix = [1,1,1,1,1,1,1,1,1];

    for (let i = start_point.x;i<=end_point.x;i+=1) {
    for (let j = start_point.y;j<=end_point.y;j+=1) {

        let average_r = 0;
        let average_g = 0;
        let average_b = 0;

        let currentpixel = 0;

        for (let minusy=-1;minusy <= 1;minusy+=1) {
            for (let minusx=-1;minusx <= 1;minusx+=1) {
                average_r += imageData.data[((i+minusx)+((j+minusy)*slika.width))*4] * matrix[currentpixel];
                average_g += imageData.data[((i+minusx)+((j+minusy)*slika.width))*4+1] * matrix[currentpixel];
                average_b += imageData.data[((i+minusx)+((j+minusy)*slika.width))*4+2] * matrix[currentpixel];

                currentpixel++;
            }
        }
        
        average_r = average_r/divider;
        average_g = average_g/divider;
        average_b = average_b/divider;


        imageDataCopy.data[((i)+(j*slika.width))*4] = average_r;
        imageDataCopy.data[((i)+(j*slika.width))*4+1] = average_g;
        imageDataCopy.data[((i)+(j*slika.width))*4+2] = average_b;
        }
    }
    
    let ThirdImageDataCopy = context.getImageData(0,0,slika.width,slika.height);

    for (i = start_point.x;i<end_point.x;i++) {
        for (j = start_point.y; j<end_point.y;j++) {
            let linear_coord = (i + (j*slika.width)) * 4;
            
            imageData.data[linear_coord]-=imageDataCopy.data[linear_coord];
            imageData.data[linear_coord+1]-=imageDataCopy.data[linear_coord+1];
            imageData.data[linear_coord+2]-=imageDataCopy.data[linear_coord+2];
        }
    }
    
    for (i = start_point.x;i<end_point.x;i++) {
        for (j = start_point.y; j<end_point.y;j++) {
            let linear_coord = (i + (j*slika.width)) * 4;
            
            ThirdImageDataCopy.data[linear_coord]+=imageData.data[linear_coord];
            ThirdImageDataCopy.data[linear_coord+1]+=imageData.data[linear_coord+1];
            ThirdImageDataCopy.data[linear_coord+2]+=imageData.data[linear_coord+2];
        }
    }

    context.putImageData(ThirdImageDataCopy,0,0);
}
