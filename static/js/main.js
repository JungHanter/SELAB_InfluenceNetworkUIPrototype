var typeColors = [
    'red', 'pink', 'purple', 'deep-purple', 'indigo', 'blue',
    'light-blue', 'cyan', 'teal', 'green', 'light-green',
    'lime', 'yellow', 'amber', 'orange', 'deep-orange',
    'brown','grey', 'blue-grey'
];

var nodeTypes = {
    0: {name: "A", color: "red"},
    1: {name: "B", color: "blue"},
    2: {name: "C", color: "yellow"}
};
var nodeTypeCnt = 3;

function updateNodeTypes() {
    $('#subMenuNodeTypeDropdown').empty();
    for (var tid in nodeTypes) {
        $('#subMenuNodeTypeDropdown').append("<li><a href='#'>"
            + nodeTypeToSubMenuHtml(tid) + "</a></li>");
    }
    $('#subMenuNodeTypeDropdown > li > a').off('click').unbind('click').click(function() {
        var selItem = $(this);
        $('#subMenuNodeType').removeClass('unselected').html(selItem.html());
    });

    networkGraph.setTypes(nodeTypes);
    updateNodeDropdown();
    networkGraph.updateGraph();
}
function updateNodeDropdown() {
    $('.subMenuEdgeNodeDropdown').empty();
    for (var i=0; i<networkGraph.nodes.length; i++) {
        nodeData = networkGraph.nodes[i];
        nodeInfoHtml = "<li><a href='#'>" + nodeDataToSubMenuHtml(nodeData) + "</a></li>";
        $('.subMenuEdgeNodeDropdown').append(nodeInfoHtml);
    }
    $('#subMenuEdgeSourceDropdown > li > a').off('click').unbind('click').click(function() {
        var selItem = $(this);
        $('#subMenuEdgeSource').removeClass('unselected').html(selItem.html());
    });
    $('#subMenuEdgeTargetDropdown > li > a').off('click').unbind('click').click(function() {
        var selItem = $(this);
        $('#subMenuEdgeTarget').removeClass('unselected').html(selItem.html());
    });


    $('.newEdgeDlgNodeDropdown').empty();
    for (var i=0; i<networkGraph.nodes.length; i++) {
        nodeData = networkGraph.nodes[i];
        nodeInfoHtml = "<li><a href='#'>" + nodeDataToSubMenuHtml(nodeData) + "</a></li>";
        $('.newEdgeDlgNodeDropdown').append(nodeInfoHtml);
    }
    $('#newEdgeDlgSourceDropdown > li > a').off('click').unbind('click').click(function() {
        var selItem = $(this);
        $('#newEdgeDlgSource').removeClass('unselected').html(selItem.html());
    });
    $('#newEdgeDlgTargetDropdown > li > a').off('click').unbind('click').click(function() {
        var selItem = $(this);
        $('#newEdgeDlgTarget').removeClass('unselected').html(selItem.html());
    });
}

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
        $('#subMenuNodeType').removeClass('unselected').html(nodeTypeToSubMenuHtml(nodeData.type));
    } else {
        $('#subMenuNodeType').addClass('unselected').text("Select Type");
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
    $('#subMenuEdgeSource').removeClass('unselected').html(nodeDataToSubMenuHtml(edgeData.source));
    $('#subMenuEdgeTarget').removeClass('unselected').html(nodeDataToSubMenuHtml(edgeData.target));

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
    $('#subMenuNodeType').addClass('unselected').text('');
    $('#subMenuEdgeInfluence').val('');
    $('.subMenuEdgeNode').addClass('unselected').text('');

    selectedNode = null;
    selectedEdge = null;
}

function nodeTypeToSubMenuHtml(typeid) {
    return "<span class='nodeTypeColor type-color-bg type-color-"
            + nodeTypes[typeid]['color'] + "'>&nbsp;</span><span class='nodeTypeName'>"
            + nodeTypes[typeid]['name'] +"</span><span class='nodeTypeId'>"
            + typeid + "</span>";
}
function nodeDataToSubMenuHtml(nodeData) {
    console.log(nodeData);
    var nodeInfoHtml = "<span class='nodeName' data-nodeId=" + nodeData.id
            + ">" + nodeData.title + "</span> (";
    if (nodeData.type == null) {
        nodeInfoHtml += "No Type)";
    } else {
        nodeInfoHtml += "<span class='nodeTypeColor type-color-bg type-color-"
            + nodeTypes[nodeData.type]['color'] + "'>&nbsp;</span><span class='nodeTypeName'>"
            + nodeTypes[nodeData.type]['name'] +"</span><span class='nodeTypeId'>" +
            + nodeData.type + "</span>)";
    }
    return nodeInfoHtml;
}

function createNode() {
    networkGraph.createNode();
    updateNodeDropdown();
}
function editNode() {
    if (selectedNode != null) {
        var origianlType = selectedNode.nodeData.type;
        selectedNode.nodeData.title = $('#subMenuNodeName').val();
        // selectedNode.nodeData.type = $('#subMenuNodeType .nodeTypeName').text();
        selectedNode.nodeData.type = parseInt($('#subMenuNodeType .nodeTypeId').text());
        networkGraph.changeNodeTitle(selectedNode.d3Node, selectedNode.nodeData.title);
        if (origianlType != selectedNode.nodeData.type) {
            networkGraph.updateNodeType(selectedNode.d3Node);
        }
        networkGraph.updateGraph();
        updateNodeDropdown();
    }
}
function deleteNode() {
    networkGraph.deleteNode();
    setUnselected();
    updateNodeDropdown();
}

function createEdge() {
    $('#newEdgeDlgInfluence').val('');
    if (selectedNode == null) {
        $('#newEdgeDlgSource').addClass('unselected').html("Select Source Node");
    } else {
        $('#newEdgeDlgSource').removeClass('unselected').html(nodeDataToSubMenuHtml(selectedNode.nodeData));
    }
    $('#newEdgeDlgTarget').addClass('unselected').html("Select Target Node");
    $('#newEdgeModal').modal();
}
function createEdgeConfirm() {
    var sourceId = parseInt($('#newEdgeDlgSource .nodeName').data('nodeid')),
        targetId = parseInt($('#newEdgeDlgTarget .nodeName').data('nodeid')),
        influence = parseFloat($('#newEdgeDlgInfluence').val());
    var sourceNode = networkGraph.getNodeById(sourceId),
        targetNode = networkGraph.getNodeById(targetId);

    if (sourceId == targetId) {
        openAlertModal("The nodes of path can not be same!");
        return;
    } else if (validEdge(sourceNode, targetNode)) {
        networkGraph.createEdge(sourceNode, targetNode, influence);
        $('#newEdgeModal').modal('hide');
    } else {
        openAlertModal("The path is already existed!");
        return;
    }
}
function editEdge() {
    if (selectedEdge != null) {
        var origianlSourceId = selectedEdge.edgeData.source.id,
            originalTargetId = selectedEdge.edgeData.target.id;
        var changedSourceId = parseInt($('#subMenuEdgeSource .nodeName').data('nodeid')),
            changedTargetId = parseInt($('#subMenuEdgeTarget .nodeName').data('nodeid'))
        selectedEdge.edgeData.name = $('#subMenuEdgeInfluence').val();

        if (origianlSourceId == changedSourceId && originalTargetId == changedTargetId) {
            //pass
        } else {
            var changedSource = networkGraph.getNodeById(changedSourceId);
            var changedTarget = networkGraph.getNodeById(changedTargetId);

            if (changedSourceId == changedTargetId) {
                openAlertModal("The nodes of path can not be same!");
                return;
            } else if (validEdge(changedSource, changedTarget)) {
                selectedEdge.edgeData.source = changedSource;
                selectedEdge.edgeData.target = changedTarget;
                networkGraph.updateEdges();
            } else {
                openAlertModal("The path is already existed!");
                return;
            }
        }

        networkGraph.changeEdgeName(selectedEdge.d3PathG, selectedEdge.edgeData);
        networkGraph.updateGraph();
    }
}
function deleteEdge() {
    networkGraph.deleteEdge();
    setUnselected();
}
function validEdge(sourceNode, targedNode) {
    for (var i=0; i<networkGraph.edges.length; i++) {
        if (networkGraph.edges[i].source === sourceNode &&
                networkGraph.edges[i].target === targedNode) {
            return false;
        }
    }
    return true;
}

function manageNodeType() {
    $('#manageNodeTypeColorList > .list-group-item').each(function() {
        $(this).attr('class', 'list-group-item');
    });

    $('#manageNodeTypeModal').modal();
}
function manageConfidence() {

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
    updateNodeTypes();

    networkGraph.setSelectedCallbacks(
        function (d3Node, nodeData) {       // onNodeSelected
            // console.log(nodeData);
            setSelectedNode(d3Node, nodeData);
        }, function (d3PathG, edgeData) {    // onEdgeSelected
            // console.log(edgeData);
            setSelectedEdge(d3PathG, edgeData);
        }, function () {        // onUnselected
            // console.log("unselected");
            setUnselected();
        }
    );

    initUI();

    $('#subMenuNodeEditBtn').click(editNode);
    $('#subMenuEdgeEditBtn').click(editEdge);

    $('.menuNewNode').click(createNode);
    $('.menuDeleteNode').click(deleteNode);
    $('.menuNewEdge').click(createEdge);
    $('.menuDeleteEdge').click(deleteEdge);

    $('.menuManageNodeType').click(manageNodeType);
    $('.menuManageConfidence').click(manageConfidence);

    $('.menuNew').click(newFile);
    $('.menuLoad').click(loadFile);
    $('.menuSave').click(saveFile);
    $('.menuSaveAs').click(saveAsFile);
    $('.menuDelete').click(deleteFile);
    $('.menuPrint').click(printFile);
});

var selectedNodeTypeElem = null;
function initUI() {
    // About Edge
    $('#subMenuEdgeInfluence, #newEdgeDlgInfluence').blur(function() {
        var influence = parseFloat($(this).val());
        if (isNaN(influence) || !isFinite(influence)) {
            $(this).val(0);
        } else if (influence < 0) {
            $(this).val(0);
        } else if (influence > 1) {
            $(this).val(1);
        }
    });
    $('#btnNewEdgeModalConfirm').click(createEdgeConfirm);

    // About Node Types
    initManageNodeTypeUI();
}

function initManageNodeTypeUI() {
    $('#btnEditNodeTypeName').attr('disabled', true);
    $('#btnDeleteNodeType').attr('disabled', true);
    $('#manageNodeTypeColorList').css('visibility', 'hidden');

    $('#manageNodeTypeModal').on('hide.bs.modal', function (e) {
        setUnselected();
        updateNodeTypes();
    });
    $('#manageNodeTypeModal').on('hidden.bs.modal', function (e) {
        $('#manageNodeTypeColorList').css('visibility', 'hidden');
        $('#manageNodeTypeList > .list-group-item').each(function() {
            $(this).attr('class', 'list-group-item');
        });
        $('#manageNodeTypeColorList > .list-group-item').each(function() {
            $(this).attr('class', 'list-group-item');
        });
    });

    $('#manageNodeTypeList').empty();
    for (var typeid in nodeTypes) {
        $('#manageNodeTypeList').append("<a href='#' class='list-group-item'>"
            + "<span class='nodeTypeName'>" + nodeTypes[typeid]['name'] + "</span>"
            + "<span class='typeColor type-color-bg type-color-" + nodeTypes[typeid]['color']
            + "' data-color='" + nodeTypes[typeid]['color'] + "'>&nbsp;</span>"
            + "<span class='typeId'>" + typeid + "</span></a>");
        var appendedElem = $('#manageNodeTypeList').find('.list-group-item:last-of-type');
        nodeTypeManageListItemAddClick(appendedElem);
    }

    $('#btnAddNodeType').click(function() {
        var usedNames = [];
        var usedColors = [];
        for (var typeid in nodeTypes) {
            usedNames.push(nodeTypes[typeid]['name']);
            usedColors.push(nodeTypes[typeid]['color']);
        }

        var defaultNewTypeName = 'New Type';
        var defaultCnt = 1;
        while (true) {
            var used = false;
            for (var k=0; k<usedNames.length; k++) {
                if (defaultNewTypeName == usedNames[k]) {
                    used = true;
                    break;
                }
            }
            if (used) {
                defaultCnt++;
                defaultNewTypeName = 'New Type ' + defaultCnt;
            } else {
                break;
            }
        }

        var defaultNewTypeColor = null;
        var remainedColors = [];
        for (var i=0; i<typeColors.length; i++) {
            var color = typeColors[i];
            var used = false;
            for (var k=0; k<usedColors.length; k++) {
                if (color == usedColors[k]) {
                    used = true;
                    break;
                }
            }
            if (!used) remainedColors.push(color);
        }
        if (remainedColors.length > 0) {
            var randColorIdx = Math.floor((Math.random() * remainedColors.length));
            defaultNewTypeColor = remainedColors[randColorIdx];
        } else {
            var randColorIdx = Math.floor((Math.random() * typeColors.length));
            defaultNewTypeColor = typeColors[randColorIdx];
        }

        //reset active other list item
        $('#manageNodeTypeList > .list-group-item').each(function() {
            $(this).attr('class', 'list-group-item');
        });

        //add list item
        $('#manageNodeTypeList').append("<a href='#' class='list-group-item'>"
            + "<span class='nodeTypeName'>" + defaultNewTypeName + "</span>"
            + "<span class='typeColor type-color-bg type-color-" + defaultNewTypeColor
            + "' data-color='" + defaultNewTypeColor + "'>&nbsp;</span>"
            + "<span class='typeId'>" + nodeTypeCnt + "</span></a>");
        //add nodeTypes with default
        nodeTypes[nodeTypeCnt] = {name: defaultNewTypeName, color:defaultNewTypeColor};
        nodeTypeCnt++;

        var appendedElem = $('#manageNodeTypeList').find('.list-group-item:last-of-type');
        nodeTypeManageListItemAddClick(appendedElem);
        appendedElem.find('> .nodeTypeName').attr('contenteditable', true)
            .blur(function() {
                $(this).attr('contenteditable', false);
                var typeid = parseInt(appendedElem.find('> .typeId').text());
                nodeTypes[typeid]['name'] = $(this).text();
                // $('#manageNodeTypeModal .modal-body .row::before').focus();
                // document.execCommand('blur', false, true);
                // document.execCommand('selectAll', false, null);
            }).keydown(function(e) {
                if (e.which == 13) {
                    $(this).blur();
                }
            }).focus();
        // document.execCommand('selectAll', false, null);
    });

    $('#btnEditNodeTypeName').click(function() {
        if (selectedNodeTypeElem != null) {
            var typeColor = selectedNodeTypeElem.find('> .typeColor').data('color');
            var nowElem = selectedNodeTypeElem;
            var classes = selectedNodeTypeElem.attr('class');
            selectedNodeTypeElem.attr('class', 'list-group-item');

            selectedNodeTypeElem.find('> .nodeTypeName').attr('contenteditable', true)
                .blur(function() {
                    $(this).attr('contenteditable', false);
                    var typeid = parseInt(nowElem.find('> .typeId').text());
                    nodeTypes[typeid]['name'] = $(this).text();
                    // if (selectedNodeTypeElem != null)
                    if (selectedNodeTypeElem == nowElem)
                        selectedNodeTypeElem.attr('class', classes);
                }).keydown(function(e) {
                    if (e.which == 13) {
                        $(this).blur();
                    }
                }).focus();
            // document.execCommand('selectAll', false, null);
        }
    });

    $('#btnDeleteNodeType').click(function() {
        if (selectedNodeTypeElem != null) {
            var typeid = parseInt(selectedNodeTypeElem.find('> .typeId').text());
            delete nodeTypes[typeid];

            selectedNodeTypeElem.remove();
            selectedNodeTypeElem = null;
            $('#btnEditNodeTypeName').attr('disabled', true);
            $('#btnDeleteNodeType').attr('disabled', true);
            $('#manageNodeTypeColorList').css('visibility', 'hidden');
        }
    });

    $('#manageNodeTypeColorList > .list-group-item').click(function() {
        var color = $(this).data('color');
        $('#manageNodeTypeColorList > .list-group-item').each(function() {
            $(this).attr('class', 'list-group-item');
        });
        $(this).addClass('active').addClass('type-color-bg')
            .addClass('type-color-text').addClass('type-color-'+color);

        if (selectedNodeTypeElem != null) {
            var prevColor = selectedNodeTypeElem.find('> .typeColor').data('color');
            selectedNodeTypeElem.attr('class', 'list-group-item active');
            selectedNodeTypeElem.addClass('type-color-bg')
                .addClass('type-color-text').addClass('type-color-' + color);
            selectedNodeTypeElem.find('> .typeColor').removeClass('type-color-' + prevColor)
                .addClass('type-color-' + color).data('color', color);
            var typeId = parseInt(selectedNodeTypeElem.find('> .typeId').text());
            nodeTypes[typeId]['color'] = color;
        }
    });
}

function nodeTypeManageListItemAddClick(elem) {
    elem.click(function() {
        if ($(this).hasClass('active')) {   //active->inactive
            selectedNodeTypeElem = null;
            $(this).find('> .nodeTypeName').blur();
            $(this).attr('class', 'list-group-item');

            $('#btnEditNodeTypeName').attr('disabled', true);
            $('#btnDeleteNodeType').attr('disabled', true);
            $('#manageNodeTypeColorList').css('visibility', 'hidden');
            $('#manageNodeTypeColorList > .list-group-item').each(function() {
                $(this).attr('class', 'list-group-item');
            });
        } else {    //inactive->active
            selectedNodeTypeElem = $(this);
            var typeColor = $(this).find('> .typeColor').data('color');
            $('#manageNodeTypeList > .list-group-item').each(function() {
                $(this).attr('class', 'list-group-item');
            });
            $(this).addClass('active').addClass('type-color-bg')
                .addClass('type-color-text').addClass('type-color-'+typeColor);

            $('#btnEditNodeTypeName').attr('disabled', false);
            $('#btnDeleteNodeType').attr('disabled', false);
            $('#manageNodeTypeColorList').css('visibility', 'visible');
            $('#manageNodeTypeColorList > .list-group-item').each(function() {
                if ($(this).data('color') == typeColor) {
                    $(this).addClass('active').addClass('type-color-bg')
                        .addClass('type-color-text').addClass('type-color-'+typeColor);
                    $('#manageNodeTypeColorList').focus();
                    $(this).focus().blur();
                } else {
                    $(this).attr('class', 'list-group-item');
                }
            });
        }
    });
}

function openAlertModal(msg, title) {
    if (title == undefined || title == null || !/\S/.test(title)) {
        title = "Alert";
    }
    $('#alertModalTitle').text(title);
    $('#alertModalMsg').text(msg);
    $('#alertModal').modal();
}
