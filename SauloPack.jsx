/*
    Text Animator UI Panel
    Save as:
    TextAnimator.jsx

    Put in:
    Adobe After Effects > Support Files > Scripts > ScriptUI Panels

    Restart After Effects

    Open:
    Window > TextAnimator
*/

(function TextAnimatorPanel(thisObj){

    function buildUI(thisObj){

        var win = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", "SauloPack", undefined, {resizeable:true});

        win.orientation = "column";
        win.alignChildren = ["fill","top"];

        // =================================================
        // BUTTONS
        // =================================================

        // -----------------------------------
        // CREATE TEXT ANIMATOR
        // -----------------------------------

        var btnTextAnimator =
            win.add("button", undefined, "TextAnimator");

        // -----------------------------------
        // BASIC BOUNCE
        // -----------------------------------

        var btnBounce =
            win.add("button", undefined, "Bounce");

        // -----------------------------------
        // SLIDER CONTROLS
        // -----------------------------------

        var btnMultiSlider =
            win.add("button", undefined, "Multi Slider Link");

        // -----------------------------------
        // VELOCITY BOUNCE
        // -----------------------------------

        var btnVelocityBounce =
            win.add("button", undefined, "Velocity Bounce");

        // -----------------------------------
        // CENTER TRIM
        // -----------------------------------

        var btnCenterTrim =
            win.add("button", undefined, "Center Trim");

        // =================================================
        // TEXT ANIMATOR BUTTON
        // =================================================

        btnTextAnimator.onClick = function(){

            app.beginUndoGroup("Create Text Animator");

            var comp = app.project.activeItem;

            if (comp && comp instanceof CompItem){

                // -----------------------------------
                // CREATE TEXT LAYER
                // -----------------------------------

                var textLayer = comp.layers.addText("Text");
                textLayer.name = "Text";

                // -----------------------------------
                // EFFECTS
                // -----------------------------------

                var effects =
                    textLayer.property("ADBE Effect Parade");

                // -----------------------------------
                // ANIM SLIDER
                // -----------------------------------

                var animSlider =
                    effects.addProperty("ADBE Slider Control");

                animSlider.name = "Anim";

                var animProp =
                    animSlider.property("ADBE Slider Control-0001");

                animProp.setValueAtTime(0, 100);
                animProp.setValueAtTime(1, 0);

                // -----------------------------------
                // DELAY SLIDER
                // -----------------------------------

                var delaySlider =
                    effects.addProperty("ADBE Slider Control");

                delaySlider.name = "Delay";

                delaySlider
                    .property("ADBE Slider Control-0001")
                    .setValue(0.05);

                // -----------------------------------
                // TEXT ANIMATOR
                // -----------------------------------

                var textProps =
                    textLayer.property("ADBE Text Properties");

                var animators =
                    textProps.property("ADBE Text Animators");

                var animator =
                    animators.addProperty("ADBE Text Animator");

                animator.name = "Animator01";

                // -----------------------------------
                // POSITION PROPERTY
                // -----------------------------------

                var animatorProps =
                    animator.property("ADBE Text Animator Properties");

                var posProp =
                    animatorProps.addProperty("ADBE Text Position 3D");

                posProp.setValue([0,0,0]);

                // -----------------------------------
                // EXPRESSION SELECTOR
                // -----------------------------------

                var selectors =
                    animator.property("ADBE Text Selectors");

                var exprSelector =
                    selectors.addProperty("ADBE Text Expressible Selector");

                var amount =
                    exprSelector.property("ADBE Text Expressible Amount");

                amount.expression =
                    'anim = effect("Anim")("Slider");\r' +
                    'delay = effect("Delay")("Slider");\r' +
                    'id = textIndex;\r' +
                    'd = delay * id;\r\r' +
                    'anim.valueAtTime(time-d);';

            }else{

                alert("Please select a composition.");

            }

            app.endUndoGroup();
        };

        // =================================================
        // BASIC BOUNCE BUTTON
        // =================================================

        btnBounce.onClick = function(){

            app.beginUndoGroup("Apply Bounce Expression");

            var comp = app.project.activeItem;

            if (!(comp instanceof CompItem)){
                alert("Please select a composition.");
                return;
            }

            var selectedProps = comp.selectedProperties;

            if (selectedProps.length === 0){
                alert("Please select a property.");
                return;
            }

            var expr =

                'freq = 3;\r' +
                'decay = 10;\r\r' +

                't = time - inPoint;\r' +
                'startVal = [50,50];\r' +
                'endVal = [100,100];\r' +
                'dur = 0.05;\r\r' +

                'if (t < dur){\r' +
                '    linear(t,0,dur,startVal,endVal);\r' +
                '}else{\r' +
                '    amp = (endVal - startVal)/dur;\r' +
                '    w = freq*Math.PI*2;\r' +
                '    endVal + amp*(Math.sin((t-dur)*w)/Math.exp(decay*(t-dur))/w);\r' +
                '}';

            for (var i = 0; i < selectedProps.length; i++){

                try{
                    selectedProps[i].expression = expr;
                }catch(err){}

            }

            app.endUndoGroup();
        };

        // =================================================
        // VELOCITY BOUNCE BUTTON
        // =================================================

        btnVelocityBounce.onClick = function(){

            app.beginUndoGroup("Apply Velocity Bounce");

            var comp = app.project.activeItem;

            if (!(comp instanceof CompItem)){
                alert("Please select a composition.");
                return;
            }

            var selectedProps = comp.selectedProperties;

            if (selectedProps.length === 0){
                alert("Please select a property.");
                return;
            }

            var expr =

                'freq = 4;\r' +
                'decay = 6;\r' +
                'amp = 0.05;\r\r' +

                'n = 0;\r\r' +

                'if (numKeys > 0){\r' +
                '    n = nearestKey(time).index;\r' +
                '    if (key(n).time > time){\r' +
                '        n--;\r' +
                '    }\r' +
                '}\r\r' +

                'if (n > 0){\r' +

                '    t = time - key(n).time;\r' +

                '    v = velocityAtTime(\r' +
                '        key(n).time - thisComp.frameDuration/10\r' +
                '    ) * amp;\r\r' +

                '    value +\r' +
                '    v *\r' +
                '    (Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t))/freq;\r' +

                '}else{\r' +
                '    value;\r' +
                '}';

            for (var i = 0; i < selectedProps.length; i++){

                try{
                    selectedProps[i].expression = expr;
                }catch(err){}

            }

            app.endUndoGroup();
        };

        // =================================================
        // SLIDER CONTROLS BUTTON
        // =================================================

        btnMultiSlider.onClick = function(){

    app.beginUndoGroup("Multi Slider Link");

    var comp = app.project.activeItem;

    if (!(comp instanceof CompItem)){
        alert("Select a composition.");
        return;
    }

    var layers = comp.selectedLayers;
    var props = comp.selectedProperties;

    if (layers.length === 0 || props.length === 0){
        alert("Select a layer + a property.");
        return;
    }

    var layer = layers[0];
    var effects = layer.property("ADBE Effect Parade");

    // --------------------------------------------
    // ASK USER FOR NUMBER OF CONTROLLERS
    // --------------------------------------------

    var n = parseInt(prompt("How many sliders?", "3"), 10);

    if (isNaN(n) || n < 1){
        alert("Invalid number.");
        return;
    }

    // --------------------------------------------
    // CREATE SLIDERS + BUILD EXPRESSION
    // --------------------------------------------

    var expr = "value";

    for (var i = 1; i <= n; i++){

        var name = "Slider Control " + i;

        var slider = effects.addProperty("ADBE Slider Control");
        slider.name = name;

        expr += '\r+ effect("' + name + '")("Slider")';
    }

    // --------------------------------------------
    // APPLY EXPRESSION TO PROPERTY
    // --------------------------------------------

    for (var p = 0; p < props.length; p++){

        try{
            if (props[p] && props[p].canSetExpression){
                props[p].expression = expr;
            }
        }catch(err){}
    }

    app.endUndoGroup();
};

        // =================================================
        // CENTER TRIM BUTTON
        // =================================================

        btnCenterTrim.onClick = function(){

            app.beginUndoGroup("Center Trim");

            var comp = app.project.activeItem;

            if (!(comp instanceof CompItem)){
                alert("Select a composition.");
                return;
            }

            var layers = comp.selectedLayers;

            if (layers.length === 0){
                alert("Select a shape layer.");
                return;
            }

            for (var i = 0; i < layers.length; i++){

                var layer = layers[i];

                // -----------------------------------
                // SHAPE CONTENTS
                // -----------------------------------

                var contents =
                    layer.property("ADBE Root Vectors Group");

                if (!contents){
                    continue;
                }

                // -----------------------------------
                // ADD TRIM PATHS
                // -----------------------------------

                var trim =
                    contents.addProperty("ADBE Vector Filter - Trim");

                // -----------------------------------
                // GET START PROPERTY
                // -----------------------------------

                var startProp =
                    trim.property("ADBE Vector Trim Start");

                // -----------------------------------
                // APPLY EXPRESSION
                // -----------------------------------

                startProp.expression =
                    '100 - content("'
                    + trim.name +
                    '").end';
            }

            app.endUndoGroup();
        };

        // =================================================
        // PANEL
        // =================================================

        win.layout.layout(true);

        return win;
    }

    var myUI = buildUI(thisObj);

    if (myUI instanceof Window){
        myUI.center();
        myUI.show();
    }

})(this);