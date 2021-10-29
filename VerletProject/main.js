var container = document.getElementById("container_div");
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
scaleToWindow();
var canvasPositionLeft = canvas.getBoundingClientRect().left + window.scrollX;
var canvasPositionTop = canvas.getBoundingClientRect().top + window.scrollY;
var pointAmt = 0;
var all_points = [];
var connects = [];

//settings
var to_display = false;
var span_Bool_Display = true;



//Dimentions Of Mesh 
var width_Mesh = 80;
var height_Mesh = 40;


//count of threads
var horiz_thread_count = width_Mesh;
var vertical_thread_count = height_Mesh;


var strength_factor = 4;
var friction = 0.999;
var gravity = 0.5;
var bouncyness = 0.9;
var skLoss = 0.8;

//scaling

//interaction
var mouseCanvasX;
var mouseCanvasY;
var grabRadius = canvas.width / 25;
var fabricStrength = 25;

//Point Object 
function Point(cur_x, cur_y) {
    this.cx = cur_x;
    this.cy = cur_y;
    this.px = this.cx;
    this.py = this.cy;
    this.pinned = false;
    this.grabbed = false;
    this.mxd = null;
    this.myd = null;
    this.id = pointAmt;
    pointAmt += 1;
}

//Create Points

for (i = 0; i < vertical_thread_count; i++) {
    var y = (i * height_Mesh / (vertical_thread_count - 1)) + (100 - width_Mesh) / 2;
    for (j = 0; j < horiz_thread_count; j++) {
        var x = (j * width_Mesh / (horiz_thread_count - 1)) + (100 - width_Mesh) / 2;
        add_Point(x, y);
    }
}


//Ensue top row gets pinned 
for (i = 0; i < horiz_thread_count; i++) { all_points[i].pinned = true; }

//create span structure
function Span(point_1, point_2, visibility = "visible") {
    this.p1 = point_1;
    this.p2 = point_2;
    this.l = distance_Formula(this.p1, this.p2);
    this.visibility = visibility;
}

//create connects
for (i = 0; i < all_points.length - 1; i++) {
    if ((i + 1) % horiz_thread_count !== 0) { add_span_objec(i, i + 1); }
    if (i < all_points.length - horiz_thread_count) { add_span_objec(i, i + horiz_thread_count); }
}





var rand_x = gen_Rand_Number(-50, 50);
for (i = 0; i < all_points.length / 4; i++) {
    var rp = gen_Rand_Number(Math.floor(all_points.length / 3), all_points.length - 1);
    all_points[rp].px += rand_x;
    all_points[rp].py += gen_Rand_Number(10, 30);
}
for (i = vertical_thread_count * horiz_thread_count - vertical_thread_count - 1; i < vertical_thread_count * horiz_thread_count - 1; i++) {
    all_points[i].px += rand_x;
    all_points[i].py += gen_Rand_Number(100, 300);
}



update();


function scaleToWindow() {
    if (window.innerWidth > window.innerHeight) {
        container.style.height = window.innerHeight * 0.8 + "px";
        container.style.width = container.style.height;
    } else {
        container.style.width = window.innerWidth * 0.8 + "px";
        container.style.height = container.style.width;
    }
    canvas.width = document.getElementById("canvas_div").clientWidth;
    canvas.height = document.getElementById("canvas_div").clientHeight;
}




function get_point_tug(id) {
    for (var i = 0; i < all_points.length; i++) {
        if (all_points[i].id == id) { return all_points[i]; }
    }
}


//Random Number Generator 
function gen_Rand_Number(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//creates a point object instance
function add_Point(xp, yp) {
    all_points.push(new Point(xPerc(xp), yPerc(yp)));
}

//creates a span object instance
function add_span_objec(p1, p2, visibility = "visible") {
    connects.push(new Span(get_point_tug(p1), get_point_tug(p2), visibility));
}




function update() {
    verlet_Update();
    for (var i = 0; i < strength_factor; i++) {
        wall_Bound_Bounce();
        updateSpans();
    }
    clearCanvas();
    if (to_display) { renderPoints(); }
    if (span_Bool_Display) { renderSpans(); }
    window.requestAnimationFrame(update);
}

function verlet_Update() {
    for (var i = 0; i < all_points.length; i++) {
        var p = all_points[i];
        if (!p.pinned) {
            var xv = (p.cx - p.px) * friction;
            var yv = (p.cy - p.py) * friction;
            if (p.py >= canvas.height - 1 && p.py <= canvas.height) { xv *= skLoss; }
            p.px = p.cx;
            p.py = p.cy;
            p.cx += xv;
            p.cy += yv;
            p.cy += gravity;
        }
    }
}


function wall_Bound_Bounce() {
    for (var i = 0; i < all_points.length; i++) {
        var p = all_points[i];
        if (p.cx > canvas.width) {
            p.cx = canvas.width;
            p.px = p.cx + (p.cx - p.px) * bouncyness;
        }
        if (p.cx < 0) {
            p.cx = 0;
            p.px = p.cx + (p.cx - p.px) * bouncyness;
        }
        if (p.cy > canvas.height) {
            p.cy = canvas.height;
            p.py = p.cy + (p.cy - p.py) * bouncyness;
        }
        if (p.cy < 0) {
            p.cy = 0;
            p.py = p.cy + (p.cy - p.py) * bouncyness;
        }
    }
}


function updateSpans() {
    for (var i = 0; i < connects.length; i++) {
        var s = connects[i];
        var dx = s.p2.cx - s.p1.cx;
        var dy = s.p2.cy - s.p1.cy;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d > s.l * fabricStrength) { connects.splice(i, 1); }
        var r = s.l / d;
        var mx = s.p1.cx + dx / 2;
        var my = s.p1.cy + dy / 2;
        var ox = dx / 2 * r;
        var oy = dy / 2 * r;
        if (s.p1.pinned === false) {
            s.p1.cx = mx - ox;
            s.p1.cy = my - oy;
        }
        if (s.p2.pinned === false) {
            s.p2.cx = mx + ox;
            s.p2.cy = my + oy;
        }
    }
}

// clears canvas frame
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// displays all_points
function renderPoints() {
    for (var i = 0; i < all_points.length; i++) {
        var p = all_points[i];
        ctx.beginPath();
        ctx.arc(p.cx, p.cy, 3, 0, 2 * Math.PI);
        // ctx.fillStyle = "gray";
        ctx.fill();
    }
}


function renderSpans() {
    ctx.beginPath();
    for (var i = 0; i < connects.length; i++) {
        var s = connects[i];
        if (s.visibility == "visible") {
            ctx.strokeStyle = `rgba(0, 50, 255, 0.8)`;
            ctx.lineWidth = "6";
            ctx.moveTo(s.p1.cx, s.p1.cy);
            ctx.lineTo(s.p2.cx, s.p2.cy);
        }
    }
    ctx.stroke();
}



function grabFabric(e) {
    mouseCanvasX = e.pageX - canvasPositionLeft;
    mouseCanvasY = e.pageY - canvasPositionTop;
    for (var i = 0; i < all_points.length; i++) {
        var x_diff = all_points[i].cx - mouseCanvasX;
        var y_diff = all_points[i].cy - mouseCanvasY;
        var dist = Math.sqrt(x_diff * x_diff + y_diff * y_diff);
        if (dist <= grabRadius) {
            all_points[i].grabbed = true;
            all_points[i].mxd = x_diff;
            all_points[i].myd = y_diff;
        }
    }
}


function moveFabric(e) {
    mouseCanvasX = e.pageX - canvasPositionLeft;
    mouseCanvasY = e.pageY - canvasPositionTop;

    if (mouseCanvasX < 0 || mouseCanvasX > canvas.width ||
        mouseCanvasY < 0 || mouseCanvasY > canvas.height) {
        fabric_Dropper();
    }

    for (var i = 0; i < all_points.length; i++) {
        if (all_points[i].grabbed === true && all_points[i].pinned === false) {
            all_points[i].cx = all_points[i].px = mouseCanvasX + all_points[i].mxd;
            all_points[i].cy = all_points[i].py = mouseCanvasY + all_points[i].myd;
        }
    }
}

//drops fabric
function fabric_Dropper() {
    for (var i = 0; i < all_points.length; i++) {
        all_points[i].grabbed = false;
    }
}



function distance_Formula(point_1, point_2) {
    var x_difference = point_2.cx - point_1.cx;
    var y_difference = point_2.cy - point_1.cy;
    return Math.sqrt(x_difference * x_difference + y_difference * y_difference);
}

function xPerc(pct) {
    return pct * canvas.width / 100;
}


function yPerc(pct) {
    return pct * canvas.height / 100;
}



window.addEventListener('resize', scaleToWindow);


document.addEventListener("mousedown", grabFabric);
document.addEventListener("mousemove", moveFabric);
document.addEventListener("mouseup", fabric_Dropper);

document.addEventListener("touchstart", grabFabric);
document.addEventListener("touchmove", moveFabric);
document.addEventListener("touchend", fabric_Dropper);