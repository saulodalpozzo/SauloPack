/*
    SauloPack.jsx
    Put in: Adobe After Effects > Support Files > Scripts > ScriptUI Panels
*/

(function SauloPack(thisObj){

    // =================================================
    // HELPERS
    // =================================================

    function getActiveComp(){
        var comp = app.project.activeItem;

        if (!(comp instanceof CompItem)){
            alert("Please select a composition.");
            return null;
        }

        return comp;
    }

    function getSelectedProps(comp){
        var props = comp.selectedProperties;

        if (!props || props.length === 0){
            alert("Please select at least one property.");
            return null;
        }

        return props;
    }

    function applyExpressionToSelectedProps(expr, undoName){

        app.beginUndoGroup(undoName);

        try{
            var comp = getActiveComp();
            if (!comp) return;

            var props = getSelectedProps(comp);
            if (!props) return;

            for (var i = 0; i < props.length; i++){
                try{
                    if (props[i].canSetExpression){
                        props[i].expression = expr;
                    }
                }catch(err){}
            }

        }finally{
            app.endUndoGroup();
        }
    }

    function addSlider(layer, name, value){
        var effects = layer.property("ADBE Effect Parade");
        var slider = effects.addProperty("ADBE Slider Control");

        slider.name = name;
        slider.property("ADBE Slider Control-0001").setValue(value);

        return slider;
    }

    // =================================================
    // UI
    // =================================================

    function buildUI(thisObj){

        var win = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", "SauloPack", undefined, {resizeable:true});

        win.orientation = "column";
        win.alignChildren = ["fill","top"];
        win.spacing = 6;
        win.margins = 10;

        var btnTextAnimator = win.add("button", undefined, "Create Text Animator");
        var btnBounce = win.add("button", undefined, "Bounce");
        var btnVelocityBounce = win.add("button", undefined, "Velocity Bounce");
        var btnMultiSlider = win.add("button", undefined, "Multi Slider Link");
        var btnCenterTrim = win.add("button", undefined, "Center Trim");

        // =================================================
        // CREATE TEXT ANIMATOR
        // =================================================

        btnTextAnimator.onClick = function(){

            app.beginUndoGroup("Create Text Animator");

            try{
                var comp = getActiveComp();
                if (!comp) return;

                var textLayer = comp.layers.addText("Text");
                textLayer.name = "Text";

                addSlider(textLayer, "Anim", 100);
                addSlider(textLayer, "Delay", 0.05);

                var animProp = textLayer
                    .property("ADBE Effect Parade")
                    .property("Anim")
                    .property("ADBE Slider Control-0001");

                animProp.setValueAtTime(0, 100);
                animProp.setValueAtTime(1, 0);

                var textProps = textLayer.property("ADBE Text Properties");
                var animators = textProps.property("ADBE Text Animators");

                var animator = animators.addProperty("ADBE Text Animator");
                animator.name = "Animator01";

                var animatorProps = animator.property("ADBE Text Animator Properties");

                var posProp = animatorProps.addProperty("ADBE Text Position 3D");
                posProp.setValue([0, 25, 0]);

                var selectors = animator.property("ADBE Text Selectors");

                var exprSelector = selectors.addProperty("ADBE Text Expressible Selector");
                exprSelector.name = "Per Character Delay";

                var amount = exprSelector.property("ADBE Text Expressible Amount");

                amount.expression =
                    'anim = effect("Anim")("Slider");\r' +
                    'delay = effect("Delay")("Slider");\r' +
                    'd = delay * (textIndex - 1);\r\r' +
                    'anim.valueAtTime(time - d);';

            }finally{
                app.endUndoGroup();
            }
        };

        // =================================================
        // BASIC BOUNCE
        // =================================================

        btnBounce.onClick = function(){

            var expr =
                'freq = 3;\r' +
                'decay = 8;\r' +
                'amp = 20;\r\r' +

                't = time - inPoint;\r' +
                'value + amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);';

            applyExpressionToSelectedProps(expr, "Apply Bounce Expression");
        };

        // =================================================
        // VELOCITY BOUNCE
        // =================================================

        btnVelocityBounce.onClick = function(){

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
                '    v = velocityAtTime(key(n).time - thisComp.frameDuration/10) * amp;\r' +
                '    value + v * (Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t)) / freq;\r' +
                '}else{\r' +
                '    value;\r' +
                '}';

            applyExpressionToSelectedProps(expr, "Apply Velocity Bounce");
        };

        // =================================================
        // MULTI SLIDER LINK
        // =================================================

        btnMultiSlider.onClick = function(){

            app.beginUndoGroup("Multi Slider Link");

            try{
                var comp = getActiveComp();
                if (!comp) return;

                var layers = comp.selectedLayers;
                var props = getSelectedProps(comp);

                if (!props) return;

                if (!layers || layers.length === 0){
                    alert("Select a layer to hold the sliders.");
                    return;
                }

                var layer = layers[0];

                var n = parseInt(prompt("How many sliders?", "3"), 10);

                if (isNaN(n) || n < 1){
                    alert("Invalid number.");
                    return;
                }

                var expr = "value";

                for (var i = 1; i <= n; i++){

                    var name = "Slider Control " + i;

                    addSlider(layer, name, 0);

                    expr += '\r+ effect("' + name + '")("Slider")';
                }

                for (var p = 0; p < props.length; p++){
                    try{
                        if (props[p].canSetExpression){
                            props[p].expression = expr;
                        }
                    }catch(err){}
                }

            }finally{
                app.endUndoGroup();
            }
        };

        // =================================================
        // CENTER TRIM
        // =================================================

        btnCenterTrim.onClick = function(){

            app.beginUndoGroup("Center Trim");

            try{
                var comp = getActiveComp();
                if (!comp) return;

                var layers = comp.selectedLayers;

                if (!layers || layers.length === 0){
                    alert("Select at least one shape layer.");
                    return;
                }

                for (var i = 0; i < layers.length; i++){

                    var layer = layers[i];
                    var contents = layer.property("ADBE Root Vectors Group");

                    if (!contents) continue;

                    var trim = contents.addProperty("ADBE Vector Filter - Trim");
                    trim.name = "Center Trim";

                    var startProp = trim.property("ADBE Vector Trim Start");

                    startProp.expression =
                        '100 - content("' + trim.name + '").end';
                }

            }finally{
                app.endUndoGroup();
            }
        };

        // =================================================
        // PANEL
        // =================================================

        win.layout.layout(true);
        win.layout.resize();

        return win;
    }

    var myUI = buildUI(thisObj);

    if (myUI instanceof Window){
        myUI.center();
        myUI.show();
    }

})(this);