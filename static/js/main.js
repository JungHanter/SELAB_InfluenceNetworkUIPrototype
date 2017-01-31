$('#subMenuNode').hide();
$('#subMenuEdge').hide();
$('#subMenuNone').show();

var selectedNode = null;
function setSelectedNode(d3Node, nodeData) {
    $('#subMenuEdge').hide();
    $('#subMenuNone').hide();
    $('#subMenuNode').show();

    $('.menuDeleteNode').attr('disabled', false);
    $('.menuDeleteNode').removeClass('disabled');
    $('.menuDeleteEdge').attr('disabled', true);
    $('.menuDeleteEdge').addClass('disabled');

    $('#subMenuNodeName').val(nodeData.title);
    if (nodeData.type != null) {
        $('#subMenuNodeType').text(nodeData.type);
    } else {
        $('#subMenuNodeType').text("Select Type");
    }
    selectedEdge = null;
    selectedNode = {
        'd3Node': d3Node,
        'nodeData': nodeData
    }
}
var selectedEdge = null;
function setSelectedEdge(d3PathG, edgeData) {
    $('#subMenuNode').hide();
    $('#subMenuNone').hide();
    $('#subMenuEdge').show();

    $('.menuDeleteNode').attr('disabled', true);
    $('.menuDeleteNode').addClass('disabled');
    $('.menuDeleteEdge').attr('disabled', false);
    $('.menuDeleteEdge').removeClass('disabled');

    $('#subMenuEdgeInfluence').val(edgeData.name);
    selectedNode = null;
    selectedEdge = {
        'd3PathG': d3PathG,
        'edgeData': edgeData
    }
}
function setUnselected() {
    $('#subMenuNode').hide();
    $('#subMenuEdge').hide();
    $('#subMenuNone').show();

    $('.menuDeleteNode').attr('disabled', true);
    $('.menuDeleteNode').addClass('disabled');
    $('.menuDeleteEdge').attr('disabled', true);
    $('.menuDeleteEdge').addClass('disabled');

    $('#subMenuNodeName').val('');
    $('#subMenuNodeType').text('');
    $('#subMenuEdgeInfluence').val('');

    selectedNode = null;
    selectedEdge = null;
}

function createNode() {

}
function editNode() {
    if (selectedNode != null) {
        selectedNode.nodeData.title = $('#subMenuNodeName').val();
        selectedNode.nodeData.type = $('#subMenuNodeType').text();
        networkGraph.changeNodeTitle(selectedNode.d3Node, selectedNode.nodeData.title);
        networkGraph.updateGraph();
    }
}
function deleteNode() {
    networkGraph.deleteNode();
    setUnselected();
}

function createEdge() {

}
function editEdge() {
    if (selectedEdge != null) {
        selectedEdge.edgeData.name = $('#subMenuEdgeInfluence').val();
        networkGraph.changeEdgeName(selectedEdge.d3PathG, selectedEdge.edgeData);
        networkGraph.updateGraph();
    }
}
function deleteEdge() {
    networkGraph.deleteEdge();
    setUnselected();
}

function newFile() {
    networkGraph.deleteGraph();
    setUnselected();
}
function loadFile() {

}
function saveFile() {

}
function saveAsFile() {

}
function deleteFile() {
    networkGraph.deleteGraph();
    setUnselected();
}
function printFile() {

}

$(document).ready(function() {
    setUnselected();

    networkGraph.setSelectedCallbacks(
        function (d3Node, nodeData) {       // onNodeSelected
            console.log(nodeData);
            setSelectedNode(d3Node, nodeData);
        }, function (d3PathG, edgeData) {    // onEdgeSelected
            console.log(edgeData);
            setSelectedEdge(d3PathG, edgeData);
        }, function () {        // onUnselected
            console.log("unselected");
            setUnselected();
        }
    );

    $('#subMenuNodeEditBtn').click(editNode);
    $('#subMenuEdgeEditBtn').click(editEdge);

    $('.menuNewNode').click(createNode);
    $('.menuDeleteNode').click(deleteNode);
    $('.menuNewEdge').click(createEdge);
    $('.menuDeleteEdge').click(deleteEdge);

    $('.menuNew').click(newFile);
    $('.menuLoad').click(loadFile);
    $('.menuSave').click(saveFile);
    $('.menuSaveAs').click(saveAsFile);
    $('.menuDelete').click(deleteFile);
    $('.menuPrint').click(printFile);
});


$('#menuNew').click(function () {

});

$('#menuSave').click(function () {

});

$('#menuSaveAs').click(function () {

});

$('#menuDelete').click(function () {

});

$('#menuPrint').click(function () {

});

$('#menuEditNode').click(function () {

});
$('#menuEditEdge').click(function () {

});
$('#menuManageConfidence').click(function () {

});
$('#menuFindPathSet').click(function () {

});
$('#menuFindMaxInfluencePath').click(function () {

});
