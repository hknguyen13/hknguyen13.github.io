var music = false;

// Initialize event handlers

//toggle axes and grid
document.getElementById("axes_grids").onclick = function () {
    if (axes_grids) {
        removeHelpers();
    } else {
        addHelpers();
    }
};
//toggle sky background
document.getElementById("day").onclick = function () {
    changeSky();
};
//toggle party effects
var p_light;
document.getElementById("party").onclick = function () {
    if (!music) {

        //set mood
        day = true;
        changeSky();
        change_light(parseInt("0x000000"), 1);
        change_light(parseInt("0x000000"), 2);
        change_light(parseInt("0x000000"), 3);

        document.getElementById("music").play();
        p_light = setInterval( function() { party_lights(); }, 100 );
        music = true;
    } else {

        //reverse mood
        changeSky();
        change_light(parseInt("0xFFFFFF"), 1);
        change_light(parseInt("0xFFFFFF"), 2);
        change_light(parseInt("0xFFFFFF"), 3);

        document.getElementById("music").pause();
        music = false;
        clearInterval(p_light);
        scene.remove(tmp_light);
        scene.remove(tmp_light2);
        scene.remove(tmp_light3);
    }
};

//update lights on slide and click release from user

//LIGHT 1
//red
document.getElementById("light1r").oninput = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 2, 1);
};
document.getElementById("light1r").onchange = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 2, 1);
};
//green
document.getElementById("light1g").oninput = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 4, 1);
};
document.getElementById("light1g").onchange = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 4, 1);
};
//blue
document.getElementById("light1b").oninput = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 6, 1);
};
document.getElementById("light1b").onchange = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 6, 1);
};

///// LIGHT 2 ////////
//red
document.getElementById("light2r").oninput = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 2, 2);
};
document.getElementById("light2r").onchange = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 2, 2);
};
//green
document.getElementById("light2g").oninput = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 4, 2);
};
document.getElementById("light2g").onchange = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 4, 2);
};
//blue
document.getElementById("light2b").oninput = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 6, 2);
};
document.getElementById("light2b").onchange = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 6, 2);
};

////// LIGHT 3 //////
//red
document.getElementById("light3r").oninput = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 2, 3);
};
document.getElementById("light3r").onchange = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 2, 3);
};
//green
document.getElementById("light3g").oninput = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 4, 3);
};
document.getElementById("light3g").onchange = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 4, 3);
};
//blue
document.getElementById("light3b").oninput = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 6, 3);
};
document.getElementById("light3b").onchange = function() {
    var slider_value = slider_to_hex(event.srcElement.value);

    slider_input(slider_value, 6, 3);
};


function slider_input(slider_value, color_index, light_num) {

    var prim_color = slider_value;

    if (light_num == 1) {
        s_color = char_replace(s_color, color_index, prim_color);
        color_string = s_color;
    } else if (light_num == 2) {
        s_color2 = char_replace(s_color2, color_index, prim_color);
        color_string = s_color2;
    } else {
        s_color3 = char_replace(s_color3, color_index, prim_color);
        color_string = s_color3;
    }

    var color = parseInt(color_string);

    change_light(color, light_num);
}
