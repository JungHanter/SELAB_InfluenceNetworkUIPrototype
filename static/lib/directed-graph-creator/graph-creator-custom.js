var global_consts = {
    defaultTitle: "New Node",
    defaultEdgeValue: 0.5,
    graphSvgStartX: 51,
    graphSvgStartY: 70
};
var global_settings = {
    appendElSpec: "#graph"
};

document.onload = (function(d3, saveAs, Blob, undefined){
    "use strict";

    // TODO add user settings

    // define graphcreator object
    var GraphCreator = function(svg, nodes, edges){
        var thisGraph = this;
        thisGraph.idct = 0;

        thisGraph.nodes = nodes || [];
        thisGraph.edges = edges || [];
        // thisGraph.types = types || [];

        thisGraph.state = {
            selectedNode: null,
            selectedEdge: null,
            mouseDownNode: null,
            mouseDownLink: null,
            justDragged: false,
            justScaleTransGraph: false,
            lastKeyDown: -1,
            shiftNodeDrag: false,
            selectedText: null
        };

        // define arrow markers for graph links
        var defs = svg.append('svg:defs');
        defs.append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            // .attr('viewBox', '-5 -5 10 10')
            .attr('refX', "32")
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');
            // .attr('d', 'M-5,-5L5,0L-5,5');

        // define arrow markers for leading arrow
        defs.append('svg:marker')
            .attr('id', 'mark-end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 7)
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

        thisGraph.svg = svg;
        thisGraph.svgG = svg.append("g")
                    .classed(thisGraph.consts.graphClass, true);
        var svgG = thisGraph.svgG;

        // displayed when dragging between nodes
        thisGraph.dragLine = svgG.append('svg:path')
                    .attr('class', 'link dragline hidden')
                    .attr('d', 'M0,0L0,0')
                    .style('marker-end', 'url(#mark-end-arrow)');

        // svg nodes and edges
        thisGraph.paths = svgG.append("g").selectAll("g");
        thisGraph.circles = svgG.append("g").selectAll("g");

        thisGraph.drag = d3.behavior.drag()
                    .origin(function(d){
                        return {x: d.x, y: d.y};
                    })
                    .on("drag", function(args){
                        thisGraph.state.justDragged = true;
                        thisGraph.dragmove.call(thisGraph, args);
                    })
                    .on("dragend", function() {
                        // todo check if edge-mode is selected
                    });

        // listen for key events
        d3.select(window).on("keydown", function(){
            thisGraph.svgKeyDown.call(thisGraph);
        })
        .on("keyup", function(){
            thisGraph.svgKeyUp.call(thisGraph);
        });
        svg.on("mousedown", function(d){thisGraph.svgMouseDown.call(thisGraph, d);});
        svg.on("mouseup", function(d){thisGraph.svgMouseUp.call(thisGraph, d);});

        // listen for dragging
        var dragSvg = d3.behavior.zoom()
                    .on("zoom", function(){
                        if (d3.event.sourceEvent.shiftKey){
                            // TODO  the internal d3 state is still changing
                            return false;
                        } else{
                            thisGraph.zoomed.call(thisGraph);
                        }
                        return true;
                    })
                    .on("zoomstart", function(){
                        var ael = d3.select("#" + thisGraph.consts.activeEditId).node();
                        if (ael){
                            ael.blur();
                        }
                        if (!d3.event.sourceEvent.shiftKey) d3.select('body').style("cursor", "move");
                    })
                    .on("zoomend", function(){
                        d3.select('body').style("cursor", "auto");
                    });

        svg.call(dragSvg).on("dblclick.zoom", null);

        // listen for resize
        window.onresize = function(){thisGraph.updateWindow(svg);};
    };

    GraphCreator.prototype.setIdCt = function(idct){
        this.idct = idct;
    };

    GraphCreator.prototype.consts =  {
        selectedClass: "selected",
        connectClass: "connect-node",
        circleGClass: "conceptG",
        edgeGClass: "edgeG",
        graphClass: "graph",
        activeEditId: "active-editing",
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ENTER_KEY: 13,
        nodeRadius: 50
    };

    /* PROTOTYPE FUNCTIONS */

    GraphCreator.prototype.dragmove = function(d) {
        var thisGraph = this;
        if (thisGraph.state.shiftNodeDrag){
            thisGraph.dragLine.attr('d', 'M' + d.x + ',' + d.y + 'L' + d3.mouse(thisGraph.svgG.node())[0] + ',' + d3.mouse(this.svgG.node())[1]);
        } else{
            d.x += d3.event.dx;
            d.y +=  d3.event.dy;
            thisGraph.updateGraph();
        }
    };

    GraphCreator.prototype.deleteGraph = function(skipPrompt){
        var thisGraph = this,
                doDelete = true;
        if (!skipPrompt){
            doDelete = window.confirm("Press OK to delete this graph");
        }
        if(doDelete){
            thisGraph.nodes = [];
            thisGraph.edges = [];
            thisGraph.updateGraph();
        }
    };

    /* select all text in element: taken from http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element */
    GraphCreator.prototype.selectElementContents = function(el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };


    /* insert svg line breaks: taken from http://stackoverflow.com/questions/13241475/how-do-i-include-newlines-in-labels-in-d3-charts */
    GraphCreator.prototype.insertTitleLinebreaks = function (gEl, title) {
        var words = title.split(/\s+/g),
                nwords = words.length;
        var el = gEl.append("text")
                    .attr("text-anchor","middle")
                    .attr("dy", "-" + (nwords-1)*7.5);

        for (var i = 0; i < words.length; i++) {
            var tspan = el.append('tspan').text(words[i]);
            if (i > 0)
                tspan.attr('x', 0).attr('dy', 15);
        }
    };

    GraphCreator.prototype.insertEdgeName = function (gEl, name) {
        var el = gEl.append("text")
                    .attr("text-anchor","middle")
                    .attr("dy", "10");
        var tspan = el.append('tspan').text(name);
    };


    // remove edges associated with a node
    GraphCreator.prototype.spliceLinksForNode = function(node) {
        var thisGraph = this,
                toSplice = thisGraph.edges.filter(function(l) {
            return (l.source === node || l.target === node);
        });
        toSplice.map(function(l) {
            thisGraph.edges.splice(thisGraph.edges.indexOf(l), 1);
        });
    };

    GraphCreator.prototype.replaceSelectEdge = function(d3Path, edgeData){
        var thisGraph = this;
        d3Path.classed(thisGraph.consts.selectedClass, true);
        if (thisGraph.state.selectedEdge){
            thisGraph.removeSelectFromEdge();
        }
        thisGraph.state.selectedEdge = edgeData;
    };

    GraphCreator.prototype.replaceSelectNode = function(d3Node, nodeData){
        var thisGraph = this;
        d3Node.classed(this.consts.selectedClass, true);
        if (thisGraph.state.selectedNode){
            thisGraph.removeSelectFromNode();
        }
        thisGraph.state.selectedNode = nodeData;
    };

    GraphCreator.prototype.removeSelectFromNode = function(){
        var thisGraph = this;
        thisGraph.circles.filter(function(cd){
            return cd.id === thisGraph.state.selectedNode.id;
        }).classed(thisGraph.consts.selectedClass, false);
        thisGraph.state.selectedNode = null;
    };

    GraphCreator.prototype.removeSelectFromEdge = function(){
        var thisGraph = this;
        thisGraph.paths.filter(function(cd){
            return cd === thisGraph.state.selectedEdge;
        }).classed(thisGraph.consts.selectedClass, false);
        thisGraph.state.selectedEdge = null;
    };

    GraphCreator.prototype.pathMouseDown = function(d3path, d){
        var thisGraph = this,
                state = thisGraph.state;
        d3.event.stopPropagation();
        state.mouseDownLink = d;

        if (state.selectedNode){
            thisGraph.removeSelectFromNode();
        }

        var prevEdge = state.selectedEdge;
        if (!prevEdge || prevEdge !== d){
            thisGraph.replaceSelectEdge(d3path, d);
        } else{
            thisGraph.removeSelectFromEdge();
        }
    };

    // mousedown on node
    GraphCreator.prototype.circleMouseDown = function(d3node, d){
        var thisGraph = this,
                state = thisGraph.state;
        d3.event.stopPropagation();
        state.mouseDownNode = d;
        if (d3.event.shiftKey){
            state.shiftNodeDrag = d3.event.shiftKey;
            // reposition dragged directed edge
            thisGraph.dragLine.classed('hidden', false)
                .attr('d', 'M' + d.x + ',' + d.y + 'L' + d.x + ',' + d.y);
            return;
        }
    };

    /* place editable text on node in place of svg text */
    GraphCreator.prototype.changeTextOfNode = function(d3node, d){
        var thisGraph= this,
            consts = thisGraph.consts,
            htmlEl = d3node.node();
        d3node.selectAll("text").remove();
        var nodeBCR = htmlEl.getBoundingClientRect(),
            curScale = nodeBCR.width/consts.nodeRadius,
            placePad  =  5*curScale,
            useHW = curScale > 1 ? nodeBCR.width*0.71 : consts.nodeRadius*1.42;
        // replace with editableconent text
        var d3txt = thisGraph.svg.selectAll("foreignObject")
            .data([d])
            .enter()
            .append("foreignObject")
            .attr("x", nodeBCR.left + placePad - global_consts.graphSvgStartX)
            .attr("y", nodeBCR.top + placePad - global_consts.graphSvgStartY)
            .attr("height", 2*useHW)
            .attr("width", useHW)
            .append("xhtml:p")
            .attr("id", consts.activeEditId)
            .attr("contentEditable", "true")
            .text(d.title)
            .on("mousedown", function(d){
                d3.event.stopPropagation();
            })
            .on("keydown", function(d){
                d3.event.stopPropagation();
                if (d3.event.keyCode == consts.ENTER_KEY && !d3.event.shiftKey){
                    this.blur();
                }
            })
            .on("blur", function(d){
                d.title = this.textContent;
                thisGraph.insertTitleLinebreaks(d3node, d.title);
                d3.select(this.parentElement).remove();
            });
        return d3txt;
    };

    /* place editable text on node in place of svg text */
    GraphCreator.prototype.changeTextOfEdge = function(d3edge, d) {
        var thisGraph= this,
            consts = thisGraph.consts,
            htmlEl = d3edge.node();
        d3edge.selectAll("text").remove();
        var nodeBCR = htmlEl.getBoundingClientRect(),
            curScale = nodeBCR.width/consts.nodeRadius,
            placePad = 10,
            useHW = 120;
        // replace with editableconent text
        var d3txt = thisGraph.svg.selectAll("foreignObject")
            .data([d])
            .append("foreignObject")
            .attr("x", nodeBCR.left + placePad - global_consts.graphSvgStartX)
            .attr("y", nodeBCR.top + placePad - global_consts.graphSvgStartY)
            .attr("height", useHW/2)
            .attr("width", useHW)
            .append("xhtml:p")
            .attr("id", consts.activeEditId)
            .attr("contentEditable", "true")
            .text(d.title)
            .on("mousedown", function(d){
                d3.event.stopPropagation();
            })
            .on("keydown", function(d){
                d3.event.stopPropagation();
                if (d3.event.keyCode == consts.ENTER_KEY && !d3.event.shiftKey){
                    this.blur();
                }
            })
            .on("blur", function(d){
                d.name = this.textContent;
                thisGraph.insertTitleLinebreaks(d3edge, d.name);
                d3.select(this.parentElement).remove();
            });
        return d3txt;
    }

    // mouseup on nodes
    GraphCreator.prototype.circleMouseUp = function(d3node, d){
        var thisGraph = this,
            state = thisGraph.state,
            consts = thisGraph.consts;
        // reset the states
        state.shiftNodeDrag = false;
        d3node.classed(consts.connectClass, false);

        var mouseDownNode = state.mouseDownNode;

        if (!mouseDownNode) return;

        thisGraph.dragLine.classed("hidden", true);

        if (mouseDownNode !== d){
            // we're in a different node: create new edge for mousedown edge and add to graph
            // TODO here is to create edge!!!
            var newEdge = {source: mouseDownNode, target: d};
            var filtRes = thisGraph.paths.filter(function(d){
                if (d.source === newEdge.target && d.target === newEdge.source){
                    // console.log("=== Same Nodes Edges ===");
                    // console.log(newEdge);
                    // console.log(d);
                    // thisGraph.edges.splice(thisGraph.edges.indexOf(d), 1);
                }
                return d.source === newEdge.source && d.target === newEdge.target;
            });
            if (!filtRes[0].length){
                thisGraph.edges.push(newEdge);
                thisGraph.updateGraph();

                // make name of text immeidately editable
                var d3txt = thisGraph.changeTextOfEdge(thisGraph.paths.filter(function(dval) {
                    return dval.source === newEdge.source && dval.target === newEdge.target;
                }), d),
                    txtNode = d3txt.node();
                thisGraph.selectElementContents(txtNode);
                thisGraph.focus();
            }
        } else{
            // we're in the same node
            if (state.justDragged) {
                // dragged, not clicked
                state.justDragged = false;
            } else{
                // clicked, not dragged
                if (d3.event.shiftKey){
                    // shift-clicked node: edit text content
                    var d3txt = thisGraph.changeTextOfNode(d3node, d);
                    var txtNode = d3txt.node();
                    thisGraph.selectElementContents(txtNode);
                    txtNode.focus();
                } else{
                    if (state.selectedEdge){
                        thisGraph.removeSelectFromEdge();
                    }
                    var prevNode = state.selectedNode;

                    if (!prevNode || prevNode.id !== d.id){
                        thisGraph.replaceSelectNode(d3node, d);
                    } else{
                        thisGraph.removeSelectFromNode();
                    }
                }
            }
        }
        state.mouseDownNode = null;
        return;

    }; // end of circles mouseup

    // mousedown on main svg
    GraphCreator.prototype.svgMouseDown = function(){
        this.state.graphMouseDown = true;
    };

    // mouseup on main svg
    GraphCreator.prototype.svgMouseUp = function(){
        var thisGraph = this,
                state = thisGraph.state;
        if (state.justScaleTransGraph) {
            // dragged not clicked
            state.justScaleTransGraph = false;

        } else if (state.graphMouseDown && d3.event.shiftKey){
            // clicked not dragged from svg
            var xycoords = d3.mouse(thisGraph.svgG.node()),
                d = {id: thisGraph.idct++, title: global_consts.defaultTitle, x: xycoords[0], y: xycoords[1]};
            thisGraph.nodes.push(d);
            thisGraph.updateGraph();
            // make title of text immediately editable
            var d3txt = thisGraph.changeTextOfNode(thisGraph.circles.filter(function(dval){
                return dval.id === d.id;
            }), d),
                txtNode = d3txt.node();
            thisGraph.selectElementContents(txtNode);
            txtNode.focus();

        } else if (state.shiftNodeDrag){
            // dragged from node
            state.shiftNodeDrag = false;
            thisGraph.dragLine.classed("hidden", true);
        }
        state.graphMouseDown = false;
    };

    // keydown on main svg
    GraphCreator.prototype.svgKeyDown = function() {
        var thisGraph = this,
                state = thisGraph.state,
                consts = thisGraph.consts;
        // make sure repeated key presses don't register for each keydown
        if(state.lastKeyDown !== -1) return;

        state.lastKeyDown = d3.event.keyCode;
        var selectedNode = state.selectedNode,
                selectedEdge = state.selectedEdge;

        switch(d3.event.keyCode) {
        case consts.BACKSPACE_KEY:
        case consts.DELETE_KEY:
            d3.event.preventDefault();
            if (selectedNode){
                thisGraph.nodes.splice(thisGraph.nodes.indexOf(selectedNode), 1);
                thisGraph.spliceLinksForNode(selectedNode);
                state.selectedNode = null;
                thisGraph.updateGraph();
            } else if (selectedEdge){
                thisGraph.edges.splice(thisGraph.edges.indexOf(selectedEdge), 1);
                state.selectedEdge = null;
                thisGraph.updateGraph();
            }
            break;
        }
    };

    GraphCreator.prototype.svgKeyUp = function() {
        this.state.lastKeyDown = -1;
    };

    // call to propagate changes to graph
    GraphCreator.prototype.updateGraph = function(){

        var thisGraph = this,
                consts = thisGraph.consts,
                state = thisGraph.state;

        thisGraph.paths = thisGraph.paths.data(thisGraph.edges, function(d){
            return String(d.source.id) + "+" + String(d.target.id);
        });

        // add new paths
        var paths = thisGraph.paths;
        // var paths = thisGraph.paths.enter().append("g");
        paths.enter()
            .append("path")
        // paths
            .style('marker-end','url(#end-arrow)')
            .classed("link", true)
            .attr("d", function(d){
                return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
            })
            .on("mousedown", function(d){
                thisGraph.pathMouseDown.call(thisGraph, d3.select(this), d);
                }
            )
            .on("mouseup", function(d){
                state.mouseDownLink = null;
            });

        // update existing paths
        paths.style('marker-end', 'url(#end-arrow)')
            .classed(consts.selectedClass, function(d){
                return d === state.selectedEdge;
            })
            .attr("d", function(d){
                var filtRes = paths.filter(function(d2) {
                    if (d.source === d2.target && d.target === d2.source) {
                        return true;
                    } else {
                        return false;
                    }
                });
                // console.log("(update)" + d.source.id + " -> " + d.target.id);
                // console.log(filtRes);
                if(filtRes[0].length == 1) {    //bi-direct
                    var dx = Math.abs(d.source.x - d.target.x);
                    var dy = Math.abs(d.source.y - d.target.y);
                    if (dx >= dy) {
                        if (d.source.x <= d.target.x) {
                            return "M" + d.source.x + "," + (d.source.y - 10) + "L" + d.target.x + "," + (d.target.y - 10);
                        } else {
                            return "M" + d.source.x + "," + (d.source.y + 10) + "L" + d.target.x + "," + (d.target.y + 10);
                        }
                    } else {
                        if (d.source.y <= d.target.y) {
                            return "M" + (d.source.x - 10) + "," + d.source.y + "L" + (d.target.x - 10) + "," + d.target.y;
                        } else {
                            return "M" + (d.source.x + 10) + "," + d.source.y + "L" + (d.target.x + 10) + "," + d.target.y;
                        }
                    }
                } else {    //single-direct
                    return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
                }
            });

        paths.each(function(d){
            console.log(d);
            thisGraph.insertEdgeName(d3.select(this), d.name);
        });

        // remove old links
        // paths.exit().remove();
        thisGraph.paths.exit().remove();


        // update existing nodes
        thisGraph.circles = thisGraph.circles.data(thisGraph.nodes, function(d){ return d.id;});
        thisGraph.circles.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";});

        // add new nodes
        var newGs= thisGraph.circles.enter()
                    .append("g");

        newGs.classed(consts.circleGClass, true)
            .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
            .on("mouseover", function(d){
                if (state.shiftNodeDrag){
                    d3.select(this).classed(consts.connectClass, true);
                }
            })
            .on("mouseout", function(d){
                d3.select(this).classed(consts.connectClass, false);
            })
            .on("mousedown", function(d){
                thisGraph.circleMouseDown.call(thisGraph, d3.select(this), d);
            })
            .on("mouseup", function(d){
                thisGraph.circleMouseUp.call(thisGraph, d3.select(this), d);
            })
            .call(thisGraph.drag);

        newGs.append("circle")
            .attr("r", String(consts.nodeRadius));

        newGs.each(function(d){
            thisGraph.insertTitleLinebreaks(d3.select(this), d.title);
        });

        // remove old nodes
        thisGraph.circles.exit().remove();
    };

    GraphCreator.prototype.zoomed = function(){
        this.state.justScaleTransGraph = true;
        d3.select("." + this.consts.graphClass)
            .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
    };

    GraphCreator.prototype.updateWindow = function(svg){
        var docEl = document.documentElement,
                bodyEl = document.getElementsByTagName('body')[0];
        var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
        var y = window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;
        svg.attr("width", x).attr("height", y);
    };



    /**** MAIN ****/

    // warn the user when leaving
    window.onbeforeunload = function(){
        return "Make sure to save your graph locally before leaving :-)";
    };

    var docEl = document.documentElement,
        bodyEl = document.getElementsByTagName('graph')[0];

    var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
        height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

    var xLoc = width/2 - 125,
        yLoc = 150;

    // initial node data
    var nodes = [{title: "Node 0", id: 0, x: xLoc, y: yLoc, type: 0},
                 {title: "Node 1", id: 1, x: xLoc, y: yLoc + 300, type: 1},
                 {title: "Node 2", id: 2, x: xLoc+200, y: yLoc + 150, type: 1}];
    var edges = [{source: nodes[2], target: nodes[0], name:'1'},
                 {source: nodes[0], target: nodes[2], name:'0.12'},
                 {source: nodes[1], target: nodes[2], name: '0.69'},
                 {source: nodes[0], target: nodes[1], name: '0.44'}];


    /** MAIN SVG **/
    var svg = d3.select(global_settings.appendElSpec).append("svg")
                .attr("width", width)
                .attr("height", height);
    var graph = new GraphCreator(svg, nodes, edges);
            graph.setIdCt(3);
    graph.updateGraph();
})(window.d3, window.saveAs, window.Blob);
