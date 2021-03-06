var user = null;
var nowGraphInfo = null;

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

var nodeConfidences = {
    0: {
        1: 0.2, 2: 0.3
    }, 1: {
        0: 0.6, 2: 0.1
    }, 2: {
        0: 0.5, 1: 0.7
    }
}

//remove defaults
nodeTypes = {}
nodeTypeCnt = 0;
nodeConfidences = {}

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
    updateNodeList();
    networkGraph.updateGraph();
}
function updateNodeList(event, updatedData) {  //if updatedData is null, all data update
    if (event == undefined || updatedData == undefined)
        event = updatedData = null;

    // For submenu
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
    if (selectedEdge != null) {
        if (selectedEdge.edgeData.source == updatedData) {
            $('#subMenuEdgeSourceDropdown > li > a').each(function (idx, elem) {
                if ($(this).find('.nodeName').data('nodeid') == updatedData.id) {
                    $('#subMenuEdgeSource').html($(this).html());
                }
            });
        } else if (selectedEdge.edgeData.target == updatedData) {
            $('#subMenuEdgeTargetDropdown > li > a').each(function (idx, elem) {
                if ($(this).find('.nodeName').data('nodeid') == updatedData.id) {
                    $('#subMenuEdgeTarget').html($(this).html());
                }
            });
        }
    }

    // For new edge dialog
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

    // For side menu
    var newListItems = null;
    if (updatedData == null) {
        $('#sideMenuNodeList').empty();
        for (var i=0; i<networkGraph.nodes.length; i++) {
            nodeData = networkGraph.nodes[i];
            var nodeInfoHtml = "<li><a data-nodeid='" + nodeData.id
                + "'><span class='nodeName'>" + nodeData.title + "</span></a></li>";
            $('#sideMenuNodeList').append(nodeInfoHtml);
        }
        newListItems = $('#sideMenuNodeList > li > a');
    } else {
        if (event == 'created') {
            var nodeInfoHtml = "<li><a data-nodeid='" + updatedData.id
                + "'><span class='nodeName'>" + updatedData.title + "</span></a></li>";
            $('#sideMenuNodeList').append(nodeInfoHtml);
            newListItems = $('#sideMenuNodeList > li > a:last');
        } else if (event == 'updated') {
            $('#sideMenuNodeList > li > a').each(function(idx, elem) {
                if (updatedData.id == $(this).data('nodeid')) {
                    $(this).find('.nodeName').text(updatedData.title);
                }
            });

            $('#sideMenuEdgeList > li > a .edge-source, ' +
                '#sideMenuEdgeList > li > a .edge-target').each(function(idx, elem) {
                if (updatedData.id == $(this).data('nodeid')) {
                    $(this).text(updatedData.title);
                }
            });
        } else if (event == 'deleted') {
            var deletedNodeElem = null;
            $('#sideMenuNodeList > li > a').each(function(idx, elem) {
                if (updatedData.id == $(this).data('nodeid')) {
                    deletedNodeElem = $(this);
                }
            });
            if (deletedNodeElem != null) deletedNodeElem.remove();

            var deletedEdgeElems = [];
            $('#sideMenuEdgeList > li > a').each(function(idx, elem) {
                if (updatedData.id == $(this).find('.edge-source').data('nodeid') ||
                        updatedData.id == $(this).find('.edge-target').data('nodeid')) {
                    deletedEdgeElems.push(this);
                }
            });
            for (var i=deletedEdgeElems.length-1; i>=0; i--) {
                deletedEdgeElems[i].remove();
            }
        }
    }
    if (newListItems != null) {
        newListItems.off('click').unbind('click').click(function() {
            var selItem = $(this);
            if (selItem.hasClass('active')) {
                selItem.removeClass('active');
                networkGraph.unselect();
            } else {
                $('#sideMenuNodeList > li > a, #sideMenuEdgeList > li > a').removeClass('active');
                selItem.addClass('active');
                networkGraph.selectNode(selItem.data('nodeid'));
            }
        });
    }
}

function updateEdgeList(event, updatedData) {
    if (event == undefined || updatedData == undefined)
        event = updatedData = null;

    var newListItems = null;
    if (updatedData == null) {
        $('#sideMenuEdgeList').empty();
        for (var i = 0; i < networkGraph.edges.length; i++) {
            edgeData = networkGraph.edges[i];
            var edgeInfoHtml = "<li><a><span class='edge-source' data-nodeid='"
                + edgeData.source.id + "'>" + edgeData.source.title + "</span>"
                + "<span class='edge-pointer'>-></span>"
                + "<span class='edge-target' data-nodeid='" + edgeData.target.id
                + "'>" + edgeData.target.title + "</span></a></li>";
            $('#sideMenuEdgeList').append(edgeInfoHtml);
        }
        newListItems = $('#sideMenuEdgeList > li > a');
    } else {
        if (event == 'created') {
            var edgeInfoHtml = "<li><a><span class='edge-source' data-nodeid='"
                + updatedData.source.id + "'>" + updatedData.source.title + "</span>"
                + "<span class='edge-pointer'>-></span>"
                + "<span class='edge-target' data-nodeid='" + updatedData.target.id
                + "'>" + updatedData.target.title + "</span></a></li>";
            $('#sideMenuEdgeList').append(edgeInfoHtml);
            newListItems = $('#sideMenuEdgeList > li > a:last');
        } else if (event == 'updated') {
            $('#sideMenuEdgeList > li > a').each(function(idx, elem) {
                if (updatedData.source.id == $(this).find('.edge-source').data('nodeid') &&
                        updatedData.target.id == $(this).find('.edge-target').data('nodeid')) {
                    $(this).find('.edge-source').text(updatedData.source.title);
                    $(this).find('.edge-target').text(updatedData.target.title);
                }
            });
        } else if (event == 'deleted') {
            var deletedElem = null;
            $('#sideMenuEdgeList > li > a').each(function(idx, elem) {
                if (updatedData.source.id == $(this).find('.edge-source').data('nodeid') &&
                        updatedData.target.id == $(this).find('.edge-target').data('nodeid')) {
                    deletedElem = $(this);
                }
            });
            if (deletedElem != null) deletedElem.remove();
        }
    }
    if (newListItems != null) {
        newListItems.off('click').unbind('click').click(function() {
            var selItem = $(this);
            if (selItem.hasClass('active')) {
                selItem.removeClass('active');
                networkGraph.unselect();
            } else {
                $('#sideMenuNodeList > li > a, #sideMenuEdgeList > li > a').removeClass('active');
                selItem.addClass('active');
                networkGraph.selectEdge(selItem.find('.edge-source').data('nodeid'),
                    selItem.find('.edge-target').data('nodeid'));
            }
        });
    }
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
    if ('domainId' in nodeData && nodeData.domainId != null)
        $('#subMenuDomainId').val(nodeData.domainId);
    else $('#subMenuDomainId').val('');
    if (nodeData.type != null) {
        $('#subMenuNodeType').removeClass('unselected').html(nodeTypeToSubMenuHtml(nodeData.type));
    } else {
        $('#subMenuNodeType').addClass('unselected').text("Select Type");
    }

    $('#sideMenuNodeList > li > a').removeClass('active');
    $('#sideMenuEdgeList > li > a').removeClass('active');
    $('#sideMenuNodeList > li > a').each(function(idx, elem) {
        if (nodeData.id == $(this).data('nodeid')) {
            $(this).addClass('active').focus();
        }
    });

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

    $('#sideMenuNodeList > li > a').removeClass('active');
    $('#sideMenuEdgeList > li > a').removeClass('active');
    $('#sideMenuEdgeList > li > a').each(function(idx, elem) {
        if (edgeData.source.id == $(this).find('.edge-source').data('nodeid') &&
                edgeData.target.id == $(this).find('.edge-target').data('nodeid')) {
            $(this).addClass('active').focus();;
        }
    });

    selectedNode = null;
    selectedEdge = {
        'd3PathG': d3PathG,
        'edgeData': edgeData
    }
}
function setUnselected(graphUnselect) {
    $('#subMenuNode').hide();
    $('#subMenuEdge').hide();
    $('#subMenuNone').show();

    $('.menuDeleteNode').attr('disabled', true);
    $('.menuDeleteNode').addClass('disabled');
    $('.menuDeleteEdge').attr('disabled', true);
    $('.menuDeleteEdge').addClass('disabled');

    $('#subMenuNodeName').val('');
    $('#subMenuDomainId').val('');
    $('#subMenuNodeType').addClass('unselected').text('');
    $('#subMenuEdgeInfluence').val('');
    $('.subMenuEdgeNode').addClass('unselected').text('');

    $('#sideMenuNodeList > li > a').removeClass('active');
    $('#sideMenuEdgeList > li > a').removeClass('active');

    if (graphUnselect) {
        if (networkGraph.state.selectedEdge != null)
            networkGraph.removeSelectFromEdge();
        else if (networkGraph.state.selectedNode != null)
            networkGraph.removeSelectFromNode();
    }

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
    var createdNode = networkGraph.createNode();
    updateNodeList('created', createdNode);
    networkGraph.selectNode(createdNode.id);
}
function editNode() {
    if (selectedNode != null) {
        var origianlType = selectedNode.nodeData.type;
        selectedNode.nodeData.title = $('#subMenuNodeName').val();
        // selectedNode.nodeData.type = $('#subMenuNodeType .nodeTypeName').text();
        selectedNode.nodeData.type = parseInt($('#subMenuNodeType .nodeTypeId').text());

        var domainId = $('#subMenuDomainId').val();
        if (/\S/.test(domainId)) {
            //check domain
            var duplicated = false;
            for (var i=0; i<networkGraph.nodes.length; i++) {
                var nodeData = networkGraph.nodes[i];
                if (selectedNode.nodeData == nodeData) continue;
                if ('domainId' in nodeData) {
                    if (nodeData['domainId'] == domainId) {
                        duplicated = true;
                        break;
                    }
                }
            }
            if(duplicated) {
                openAlertModal("The domain ID is duplicated.", "Edit Node Failure")
            } else {
                selectedNode.nodeData.domainId = domainId;
            }
        }
        else selectedNode.nodeData.domainId = null;

        networkGraph.changeNodeTitle(selectedNode.d3Node, selectedNode.nodeData.title);
        if (origianlType != selectedNode.nodeData.type) {
            networkGraph.updateNodeType(selectedNode.d3Node);
        }
        networkGraph.updateGraph();
        updateNodeList('updated', selectedNode.nodeData);
    }
}
function deleteNode() {
    if (selectedNode != null) {
        var deletedNode = selectedNode.nodeData;
        networkGraph.deleteNode();
        setUnselected();
        updateNodeList('deleted', deletedNode);
    }
}

function createEdge() {
    if (networkGraph.nodes.length < 2) {
        openAlertModal("Edge can be created when there are more than two nodes.");
    } else {
        $('#newEdgeDlgInfluence').val('');
        if (selectedNode == null) {
            $('#newEdgeDlgSource').addClass('unselected').html("Select Source Node");
        } else {
            $('#newEdgeDlgSource').removeClass('unselected').html(nodeDataToSubMenuHtml(selectedNode.nodeData));
        }
        $('#newEdgeDlgTarget').addClass('unselected').html("Select Target Node");
        $('#newEdgeModal').modal();
    }
}
function createEdgeConfirm() {
    var sourceId = parseInt($('#newEdgeDlgSource .nodeName').data('nodeid')),
        targetId = parseInt($('#newEdgeDlgTarget .nodeName').data('nodeid')),
        influence = parseFloat($('#newEdgeDlgInfluence').val());

    var sourceNode = networkGraph.getNodeById(sourceId),
        targetNode = networkGraph.getNodeById(targetId);


    if (isNaN(sourceId) || isNaN(targetId)) {
        openAlertModal("The nodes of edge must be selected!");
        return;
    } else if (sourceId == targetId) {
        openAlertModal("The nodes of edge can not be same!");
        return;
    } else if (isNaN(influence) || !isFinite(influence)) {
        openAlertModal("The influence value is must be set!");
        return;
    } else if (validEdge(sourceNode, targetNode)) {
        var newEdge = networkGraph.createEdge(sourceNode, targetNode, influence);
        updateEdgeList('created', newEdge);
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
        updateEdgeList('updated', selectedEdge.edgeData);
    }
}
function deleteEdge() {
    if (selectedEdge != null) {
        var deletedEdge = selectedEdge.edgeData;
        networkGraph.deleteEdge();
        setUnselected();
        updateEdgeList('deleted', deletedEdge);
    }
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
    $('#manageNodeTypeModal').modal();
}
function manageConfidence() {
    $('#manageConfidenceModal').modal();
}

$(document).ready(function() {
    setUnselected();
    updateNodeTypes();
    updateEdgeList();

    networkGraph.setCallbacks(
        function (d3Node, nodeData) {       // onNodeSelected
            setSelectedNode(d3Node, nodeData);
        }, function (d3PathG, edgeData) {   // onEdgeSelected
            // console.log(edgeData);
            setSelectedEdge(d3PathG, edgeData);
        }, function () {                    // onUnselected
            // console.log("unselected");
            setUnselected();
        }, function(event, nodeData) {      // onNodeChanged
            updateNodeList(event, nodeData);
        }, function(event, edgeData) {      // onEdgeChanged
            updateEdgeList(event, edgeData);
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

    $('.menuNew').click(menuNewGraph);
    $('.menuOpen').click(menuOpenGraph);
    $('.menuClose').click(menuCloseGraph);
    $('.menuSave').click(menuSaveGraph);
    $('.menuSaveAs').click(menuSaveAsGraph);
    $('.menuPrint').click(menuPrintGraph);
    $('.menuAbout').click(menuAbout);
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

    // Confirm Modal
    $('#confirmModal').on('hidden.bs.modal', function (e) {
        $('#btnConfirmModal').off('click').unbind('click');
    });

    initManageNodeTypeUI();
    initManageConfidenceUI();
    initControllers();
}

function initManageNodeTypeUI() {
    $('#btnEditNodeTypeName').attr('disabled', true);
    $('#btnDeleteNodeType').attr('disabled', true);
    $('#manageNodeTypeColorList').css('visibility', 'hidden');

    $('#manageNodeTypeModal').on('hide.bs.modal', function (e) {
        setUnselected(true);
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

    updateManageNodeTypeUI();

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
        // add confidence table
        addNodeTypeConfidence(nodeTypeCnt);
        nodeTypeCnt++;

        var appendedElem = $('#manageNodeTypeList').find('.list-group-item:last-of-type');
        nodeTypeManageListItemAddClick(appendedElem);
        appendedElem.find('> .nodeTypeName').attr('contenteditable', true)
            .blur(function() {
                $(this).attr('contenteditable', false);
                var typeid = parseInt(appendedElem.find('> .typeId').text());
                nodeTypes[typeid]['name'] = $(this).text();
                editNodeTypeConfidenceName(typeid);
                window.getSelection().removeAllRanges();
            }).keydown(function(e) {
                if (e.which == 13) {
                    $(this).blur();
                }
            }).focus();
        document.execCommand('selectAll', false, null);
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
                    editNodeTypeConfidenceName(typeid);
                    window.getSelection().removeAllRanges();

                    // if (selectedNodeTypeElem != null)
                    if (selectedNodeTypeElem == nowElem)
                        selectedNodeTypeElem.attr('class', classes);
                }).keydown(function(e) {
                    if (e.which == 13) {
                        $(this).blur();
                    }
                }).focus();
            document.execCommand('selectAll', false, null);
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

            deleteNodeTypeConfidence(typeid);
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
            editNodeTypeConfidenceName(typeId);
        }
    });
}

function updateManageNodeTypeUI() {
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

function initManageConfidenceUI() {
    //fixed header table reference http://codepen.io/ajkochanowicz/pen/KHdih
    var confidenceTable, fixedTable;
    fixedTable = function (el) {
        var $body, $header, $sidebar;
        $body = $(el).find('.fixedTable-body');
        $sidebar = $(el).find('.fixedTable-sidebar table');
        $header = $(el).find('.fixedTable-header table');
        return $($body).scroll(function () {
            $($sidebar).css('margin-top', -$($body).scrollTop());
            return $($header).css('margin-left', -$($body).scrollLeft());
        });
    };
    confidenceTable = new fixedTable($('#confidenceTable'));

    updateManageConfidenceUI();
}

function updateManageConfidenceUI() {
    //set table from nodetypes
    $('#confidenceTable .fixedTable-header thead tr').empty();
    $('#confidenceTable .fixedTable-sidebar tbody').empty();
    $('#confidenceTable .fixedTable-body tbody').empty();

    var typeList = [];
    for (var typeid in nodeTypes) {
        typeList.push(typeid);
        addNodeTypeConfidence(typeid);
    }
}

function addNodeTypeConfidence(typeid) {
    var nodeType = nodeTypes[typeid];
    var prevTypeIds = [];
    // var prevTypeIds = {};
    $('#confidenceTable .fixedTable-header thead tr th').each(function (idx, elem) {
        prevTypeIds.push(parseInt($(this).data('typeid')));
        // prevTypeIds[idx] = parseInt($(this).data('typeid'));
    });

    $('#confidenceTable .fixedTable-header thead tr').append(
        "<th class='type-color-bg type-color-text type-color-" + nodeType['color']
        + "' data-typeid=" + typeid + ">" + nodeType['name'] + "</th>"
    );

    $('#confidenceTable .fixedTable-sidebar tbody').append(
        "<tr><th class='type-color-bg type-color-text type-color-" + nodeType['color']
        + "' data-typeid=" + typeid + ">" + nodeType['name'] + "</th></tr>"
    );

    $('#confidenceTable .fixedTable-body tbody tr').each(function (idx, elem) {
        var sourceId = prevTypeIds[idx];
        var defaultConfidence = 0.5;
        if (sourceId in nodeConfidences) {
            if (typeid in nodeConfidences[sourceId]) {
                defaultConfidence = nodeConfidences[sourceId][typeid];
            } else {
                nodeConfidences[sourceId][typeid] = defaultConfidence;
            }
        } else {
            nodeConfidences[sourceId] = {};
            nodeConfidences[sourceId][typeid] = defaultConfidence;
        }

        $(elem).append(
            "<td class='td-input'><input type='number' step=0.01 min=0 max=1 "
            + "data-source=" + sourceId + " data-target=" + typeid + " /></td>"
        );

        var appendedElem = $(elem).find('> td:last-of-type');
        appendedElem.find('> input').val(defaultConfidence).blur(function() {
            var sourceId = parseInt($(this).data('source')),
                targetId = parseInt($(this).data('target'));
            var confidence = parseFloat($(this).val());
            if (isNaN(confidence) || !isFinite(confidence)) {
                confidence = 0.5;
                $(this).val(confidence);
            } else if (confidence < 0) {
                confidence = 0;
                $(this).val(confidence);
            } else if (confidence > 1) {
                confidence = 1;
                $(this).val(confidence);
            }
            nodeConfidences[sourceId][targetId] = confidence;
        });
    });

    var newRowHtml = "<tr>";
    for (var idx=0; idx<prevTypeIds.length; idx++) {
        var targetId = prevTypeIds[idx];
        var defaultConfidence = 0.5;
        if (typeid in nodeConfidences) {
            if (targetId in nodeConfidences[typeid]) {
                //pass
            } else {
                nodeConfidences[typeid][targetId] = defaultConfidence;
            }
        } else {
            nodeConfidences[typeid] = {};
            nodeConfidences[typeid][targetId] = defaultConfidence;
        }

        newRowHtml += "<td class='td-input'><input type='number' step=0.01 min=0 max=1 "
            + "data-source=" + typeid + " data-target=" + targetId + " /></td>"
    }
    newRowHtml += "<td class='td-empty'></td></tr>"
    $('#confidenceTable .fixedTable-body tbody').append(newRowHtml);
    var appendedElem = $('#confidenceTable .fixedTable-body tbody > tr:last-of-type');
    appendedElem.find('> td > input').each(function (idx, elem) {
        var sourceId = parseInt($(elem).data('source')),
            targetId = parseInt($(elem).data('target'));
        $(this).val(nodeConfidences[sourceId][targetId]);
    });
    appendedElem.find('> td > input').blur(function() {
        var sourceId = parseInt($(this).data('source')),
            targetId = parseInt($(this).data('target'));
        var confidence = parseFloat($(this).val());
        if (isNaN(confidence) || !isFinite(confidence)) {
            confidence = 0.5;
            $(this).val(confidence);
        } else if (confidence < 0) {
            confidence = 0;
            $(this).val(confidence);
        } else if (confidence > 1) {
            confidence = 1;
            $(this).val(confidence);
        }
        nodeConfidences[sourceId][targetId] = confidence;
    });
}

function editNodeTypeConfidenceName(typeid) {
    $('#confidenceTable .fixedTable-header thead tr th').each(function (idx, elem) {
        if (typeid == parseInt($(this).data('typeid'))) {
            $(this).attr('class', 'type-color-bg type-color-text')
                .addClass('type-color-' + nodeTypes[typeid]['color'])
                .text(nodeTypes[typeid]['name']);
        }
    });

    var removingSide = null;
    $('#confidenceTable .fixedTable-sidebar tbody tr th').each(function (idx, elem) {
        if (typeid == parseInt($(this).data('typeid'))) {
            $(this).attr('class', 'type-color-bg type-color-text')
                .addClass('type-color-' + nodeTypes[typeid]['color'])
                .text(nodeTypes[typeid]['name']);
        }
    });
}

function deleteNodeTypeConfidence(typeid) {
    var removingHeader = null;
    $('#confidenceTable .fixedTable-header thead tr th').each(function (idx, elem) {
        if (typeid == parseInt($(this).data('typeid'))) {
            removingHeader = $(this);
        }
    });
    removingHeader.remove();

    var removingSide = null;
    $('#confidenceTable .fixedTable-sidebar tbody tr').each(function (idx, elem) {
        if (typeid == parseInt($(this).find('> th').data('typeid'))) {
            removingSide = $(this);
        }
    });
    removingSide.remove();

    var removingRow = null;
    $('#confidenceTable .fixedTable-body tbody tr').each(function (idx, elem) {
        if (typeid == parseInt($(this).find('> td.td-input:first-of-type > input').data('source'))) {
            removingRow = $(this);
        }
    });
    if (removingRow == null) {
        removingRow = $('#confidenceTable .fixedTable-body tbody tr');
    }
    removingRow.remove();

    var removingColumns = [];
    $('#confidenceTable .fixedTable-body tbody tr td').each(function (idx, elem) {
        if (typeid == parseInt($(this).find('> input').data('target'))) {
            removingColumns.push($(this));
        }
    });
    for (var i=0; i<removingColumns.length; i++) {
        removingColumns[i].remove();
    }

    delete nodeConfidences[typeid];
    for (var source in nodeConfidences) {
        delete nodeConfidences[source][typeid];
    }
}

function openAlertModal(msg, title) {
    if (title == undefined || title == null || !/\S/.test(title)) {
        title = "Alert";
    }
    $('#alertModalTitle').text(title);
    $('#alertModalMsg').text(msg);
    $('#alertModal').modal();
}

function openConfirmModal(msg, title, callback) {
    $('#confirmModalTitle').text(title);
    $('#confirmModalMsg').text(msg);
    $('#btnConfirmModal').unbind('click').off('click').click(callback);
    $('#confirmModal').modal();
}

function initControllers() {
    var welcomeOverlayHeight = $(window).height() - global_consts.graphSvgStartY;
    var welcomeTextMarginTop = welcomeOverlayHeight / 2 - 40;
    $('.welcome-overlay').css('height', welcomeOverlayHeight);
    $('.welcome-overlay > h2').css('margin-top', welcomeTextMarginTop);
    $( window ).resize(function() {
        var welcomeOverlayHeight = $(window).height() - global_consts.graphSvgStartY;
        var welcomeTextMarginTop = welcomeOverlayHeight / 2 - 40;
        $('.welcome-overlay').css('height', welcomeOverlayHeight);
        $('.welcome-overlay > h2').css('margin-top', welcomeTextMarginTop);
    });

    var graphOverlayHeight = $(window).height() - global_consts.graphSvgStartY + 31;
    var graphOverlayTextMarginTop = graphOverlayHeight / 2 - 40;
    $('.graph-close-overlay').css('height', graphOverlayHeight);
    $('.graph-close-overlay > h4').css('margin-top', graphOverlayTextMarginTop);
    $( window ).resize(function() {
        var graphOverlayHeight = $(window).height() - global_consts.graphSvgStartY + 31;
        var graphOverlayTextMarginTop = graphOverlayHeight / 2 - 40;
        $('.graph-close-overlay').css('height', graphOverlayHeight);
        $('.graph-close-overlay > h4').css('margin-top', graphOverlayTextMarginTop);
    });

    // getSesison();

    $('.main-menu > .dropdown > .dropdown-toggle').attr('disabled', true)
        .addClass('disabled');
    $('#signinForm').on('submit', function (e) {
        e.preventDefault();
        signin();
    });
    $('#menuSignout').click(function() {
        signout();
    });

    //for test
    user = {user_name: 'sm', email: 'sm@gmail.com'}
    $('#menuSignin').hide();
    $('#menuUserWelcome').text("Welcome " + user.user_name + "!");
    $('#menuUser').show();
    $('.content').show();
    $('.welcome-overlay').hide();
    $('.main-menu > .dropdown > .dropdown-toggle')
        .attr('disabled', false).removeClass('disabled');
    setGraphUIEnable(false);

    $('#btnNewGraph').click(function() {
        var newGraphName = $('#newGraphName').val();
        if (newGraphName!=null && /\S/.test(newGraphName)) {
            if (newGraphName.substring(0,1) == ' ') {
                openAlertModal("Graph name cannot start with a white space.", "Create Error");
            } else {
                if (nowGraphInfo == null) {
                    $('#newGraphModal').modal('hide');
                    newGraph(newGraphName);
                } else {
                    openConfirmModal("Are you sure to create new graph? \nIf you didn't save the current graph, any unsaved changes will be discarded.",
                            "Create Graph Confirm", function() {
                        $('#openGraphModal').modal('hide');
                        newGraph(newGraphName);
                    });
                }
            }
        } else openAlertModal("Please input a graph name.", "Create Error");
    });
    $('#btnOpenGraph').click(function() {
        var selectedGraphId = parseInt($('#graphList .list-group-item.active').data('graphid'));
        if (!isNaN(selectedGraphId) && isFinite(selectedGraphId))  {
            if (nowGraphInfo == null) {
                $('#openGraphModal').modal('hide');
                openGraph(selectedGraphId);
            } else {
                openConfirmModal("Are you sure to open the selected graph? \nIf you didn't save the current graph, any unsaved changes will be discarded.",
                        "Open Graph Confirm", function() {
                    $('#openGraphModal').modal('hide');
                    openGraph(selectedGraphId);
                });
            }
        } else openAlertModal("Please select a graph.", "Open Error");
    });
}

function setGraphUIEnable(enable) {
    if (enable) {
        $('.main-menu > .dropdown > .dropdown-toggle:not(.dropdown-default)')
            .attr('disabled', false).removeClass('disabled');
        $('.main-menu > .dropdown > .dropdown-menu-file a:not(.menuDefault)')
            .attr('disabled', false).removeClass('disabled');
        $('.side-menu .menuNewNode, .side-menu .menuNewEdge')
            .attr('disabled', false).removeClass('disabled');
        $('.graph-close-overlay').css('display', 'none');
        $('.graph-area').css('display', 'inline-block');
    } else {
        $('.main-menu > .dropdown > .dropdown-toggle:not(.dropdown-default)')
            .attr('disabled', true).addClass('disabled');
        $('.main-menu > .dropdown > .dropdown-menu-file a:not(.menuDefault)')
            .attr('disabled', true).addClass('disabled');
        $('.side-menu .menuNewNode, .side-menu .menuNewEdge')
            .attr('disabled', true).addClass('disabled');
        $('.graph-area').css('display', 'none');
        $('.graph-close-overlay').css('display', 'inline-block');
    }
}

function getSesison() {
    $.LoadingOverlay('show');
    $.ajax("http://203.253.23.45:8080/session", {
        method: 'GET',
        dataType: 'json',
        success: function (res) {
            $.LoadingOverlay('hide');
            if (res['result'] == 'success') {
                user = res['user'];
                $('#menuSignin').hide();
                $('#menuUserWelcome').text("Welcome " + user.user_name + "!");
                $('#menuUser').show();
                $('.content').show();
                $('.welcome-overlay').hide();
                $('.main-menu > .dropdown > .dropdown-toggle')
                    .attr('disabled', false).removeClass('disabled');
                setGraphUIEnable(false);
            }
        }, error: function(xhr, status, error) {
            $.LoadingOverlay('hide');
        }
    });
}

function signin() {
    var email = $('#signinEmail').val();
    var password = $('#signinPassword').val();

    $.LoadingOverlay('show');
    $.ajax("http://203.253.23.45:8080/session", {
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            action: 'login',
            email: email,
            password: password
        }),
        success: function (res) {
            $.LoadingOverlay('hide');
            console.log(res);
            if (res['result'] == 'success') {
                user = res['user'];
                openAlertModal("Welcome " + user.user_name + "!", 'Login Success');
                $('#menuSignin').hide();
                $('#menuUserWelcome').text("Welcome " + user.user_name + "!");
                $('#menuUser').show();
                $('.content').show();
                $('.welcome-overlay').hide();
                $('.main-menu > .dropdown > .dropdown-toggle')
                    .attr('disabled', false).removeClass('disabled');
                setGraphUIEnable(false);
            } else {
                openAlertModal(res['message'], 'Login Failure');
            }
        }, error: function(xhr, status, error) {
            $.LoadingOverlay('hide');
            console.log(xhr);
            openAlertModal(xhr.statusText, 'Login Failure');
        }
    });
}

function signout() {
    var signoutCallback = function(data) {
        $.LoadingOverlay('hide');
        console.log(data);
        user = null;
        nowGraphInfo = null;
        networkGraph.deleteGraph();
        $('#menuSignin').show();
        $('#menuUser').hide();
        $('.welcome-overlay').show();
        $('.content').hide();
        $('.main-menu > .dropdown > .dropdown-toggle').attr('disabled', true)
            .addClass('disabled');
    }

    $.LoadingOverlay('show');
    $.ajax("http://203.253.23.45:8080/session", {
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            action: 'logout'
        }),
        success: signoutCallback,
        error: signoutCallback
    });
}

function menuNewGraph() {
    $('#newGraphName').val('');
    $('#newGraphModal').modal();
}
function newGraph(graphName) {
    $.LoadingOverlay('show');
    $.ajax("http://203.253.23.45:8080/graph", {
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            action: 'create',
            email: user.email,
            graph_name: graphName
        }),
        success: function (res) {
            $.LoadingOverlay('hide');
            console.log(res);
            if (res['result'] == 'success') {
                closeGraph();;
                setGraphUIEnable(true);
                $('#graphName').text(graphName);
                nowGraphInfo = {graphId: res['graph_id'], graphName: graphName}
            } else {
                openAlertModal(res['message'], 'Open Graph Failure');
            }
        }, error: function (xhr, status, error) {
            $.LoadingOverlay('hide');
            openAlertModal(xhr.statusText, 'Open Graph Failure');
        }
    });
}

function menuOpenGraph() {
    //test
    // closeGraph();
    // setGraphUIEnable(true);
    // $('#graphName').text('asdf');
    // nowGraphInfo = {graphId: 1, graphName: 'asdf'}
    // return;

    $.LoadingOverlay('show');
    $.ajax("http://203.253.23.45:8080/graph", {
        method: 'GET',
        dataType: 'json',
        data: {
            email: user.email
        },
        success: function (res) {
            $.LoadingOverlay('hide');
            if (res['result'] == 'success') {
                graph_list = res['graph_list'];

                $('#graphList').empty();
                for(var i=0; i<graph_list.length; i++) {
                    var graph = graph_list[i];
                    $('#graphList').append("<a href='#' class='list-group-item' data-graphid="
                        + graph.graph_id + ">" + graph.graph_name + "</a>" );
                }
                $('#graphList .list-group-item').click(function() {
                    $('#graphList .list-group-item').removeClass('active');
                    $(this).addClass('active');
                });
                $('#openGraphModal').modal();
            } else {
                openAlertModal(res['message'], 'Retrive Graph List Failure');
            }
        }, error: function(xhr, status, error) {
            $.LoadingOverlay('hide');
            openAlertModal(xhr.statusText, 'Retrive Graph List Failure');
        }
    })
}
function openGraph(graphId) {
    $.LoadingOverlay('show');
    $.ajax("http://203.253.23.45:8080/graph", {
        method: 'GET',
        dataType: 'json',
        data: {
            email: user.email,
            graph_id: graphId
        },
        success: function (res) {
            console.log(res);
            $.LoadingOverlay('hide');
            if (res['result'] == 'success') {
                closeGraph();
                setGraphUIEnable(true);
                $('#graphName').text(res['graph_name']);
                nowGraphInfo = {graphId: graphId, graphName: res['graph_name']}

                loadGraph(res);
            } else {
                openAlertModal(res['message'], 'Open Graph Failure');
            }
        }, error: function (xhr, status, error) {
            $.LoadingOverlay('hide');
            openAlertModal(xhr.statusText, 'Open Graph Failure');
        }
    });
}
function menuCloseGraph() {
    if ($(this).hasClass('disabled') || $(this).attr('disabled')) return;
    openConfirmModal("Are you sure to close the graph? \nIf you didn't save the current graph, any unsaved changes will be discarded.",
            "Close Graph Confirm", closeGraph);
}
function closeGraph() {
    setUnselected();
    networkGraph.deleteGraph(true);
    setGraphUIEnable(false);
    nowGraphInfo = null;
    nodeTypes = {}
    nodeTypeCnt = 0;
    nodeConfidences = {}
    updateNodeTypes();
    updateEdgeList();
    updateManageNodeTypeUI();
    updateManageConfidenceUI();
}

function menuSaveGraph() {
    if ($(this).hasClass('disabled') || $(this).attr('disabled')) return;
    $.LoadingOverlay('show');
    $.ajax("http://203.253.23.45:8080/graph", {
        method: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            action: 'save',
            email: user.email,
            graph: generateSaveGraphJson()
        }),
        success: function (res) {
            console.log(res);
            $.LoadingOverlay('hide');
            if (res['result'] == 'success') {
                //save done
                nodeTypeMap = res['nodetype_id_map'];
                for (nodeTypeId in nodeTypes) {
                    nodeTypes[nodeTypeId].serverId = nodeTypeMap[nodeTypeId];
                }
            } else {
                openAlertModal(res['message'], 'Save Graph Failure');
            }
        }, error: function (xhr, status, error) {
            $.LoadingOverlay('hide');
            openAlertModal(xhr.statusText, 'Save Graph Failure');
        }
    });
}

function menuSaveAsGraph() {
    if ($(this).hasClass('disabled') || $(this).attr('disabled')) return;

    $('#saveAsGraphModal').modal();
    console.log(generateSaveGraphJson(true));
}

function menuPrintGraph() {
    if ($(this).hasClass('disabled') || $(this).attr('disabled')) return;
}
function menuAbout() {
}

function loadGraph(graphData) {
    nodeTypes = {};
    nodeTypeCnt = 0;
    var nodeTypeServerIds = {}
    for (var i=0; i<graphData['node_type_set'].length; i++) {
        var json = graphData['node_type_set'][i];
        var nodeType = {name: json['node_type_name'],
                        color: json['color'],
                        serverId: json['node_type_id']};
        nodeTypes[nodeTypeCnt] = nodeType;
        nodeTypeServerIds[json['node_type_id']] = nodeTypeCnt;
        nodeTypeCnt++;
    }
    updateManageNodeTypeUI();

    nodeConfidences = {};
    for (var i=0; i<graphData['confidence_set'].length; i++) {
        var json = graphData['confidence_set'][i];
        var sourceCid = nodeTypeServerIds[json['n1_type_id']];
        var targetCid = nodeTypeServerIds[json['n2_type_id']];
        var confidenceValue = json['confidence_value'];
        if (!(sourceCid in nodeConfidences)) {
            nodeConfidences[sourceCid] = {};
        }
        nodeConfidences[sourceCid][targetCid] = confidenceValue;
    }
    updateManageConfidenceUI();

    var nodeServerIds = {}
    for (var i=0; i<graphData['node_set'].length; i++) {
        var json = graphData['node_set'][i];
        var newNodeData = {};
        newNodeData.serverId = json['node_id'];
        if ('domain_id' in json)
            newNodeData.domainId = json['domain_id'];
        else newNodeData.domainId = null;
        newNodeData.title = json['node_name'];
        if ('node_type_id' in json)
            newNodeData.type = nodeTypeServerIds[json['node_type_id']];
        else newNodeData.type = null;
        newNodeData.x = json['x'];
        newNodeData.y = json['y'];
        networkGraph.insertNode(newNodeData);
        nodeServerIds[json['node_id']] = newNodeData;
    }
    updateNodeTypes();

    for (var i=0; i<graphData['edge_set'].length; i++) {
        var json = graphData['edge_set'][i];
        var sourceNode = nodeServerIds[json['n1_id']];
        var targetNode = nodeServerIds[json['n2_id']];
        var influence = json['influence_value'];
        networkGraph.createEdge(sourceNode, targetNode, influence);
    }
    updateEdgeList();
    networkGraph.updateGraph();
}

function generateSaveGraphJson(saveAs=false) {
    if (saveAs == undefined || saveAs == null) saveAs=false;
    var graphData = {};
    if (!saveAs) {
        graphData['graph_id'] = nowGraphInfo.graphId;
        graphData['graph_name'] = nowGraphInfo.graphName;
    }

    var nodeTypeServerIds = {};
    graphData['node_type_set'] = [];
    for (var nodeTypeId in nodeTypes) {
        var nodeType = nodeTypes[nodeTypeId];
        var json = {};
        json['node_type_client_id'] = nodeTypeId;
        if (!saveAs && 'serverId' in nodeType) {
            json['node_type_id'] = nodeType.serverId;
            nodeTypeServerIds[nodeType.serverId] = parseInt(nodeTypeId);
        }
        // else json['node_type_id'] = null;
        json['node_type_name'] = nodeType.name;
        json['color'] = nodeType.color;
        graphData['node_type_set'].push(json);
    }

    graphData['confidence_set'] = [];
    for (var sourceId in nodeConfidences) {
        var nodeConfidence = nodeConfidences[sourceId];
        for (targetId in nodeConfidence) {
            var confidenceValue = nodeConfidence[targetId];
            var json = {};
            if (!saveAs && 'serverId' in nodeTypes[sourceId]) {
                json['n1_type_id'] = nodeTypes[sourceId].serverId;
            } else json['n1_type_client_id'] = parseInt(sourceId);
            if (!saveAs && 'serverId' in nodeTypes[targetId]) {
                json['n2_type_id'] = nodeTypes[targetId].serverId;
            } else json['n2_type_client_id'] = parseInt(targetId);
            json['confidence_value'] = parseFloat(confidenceValue);
            graphData['confidence_set'].push(json);
        }
    }

    nodeServerIds = {};
    graphData['node_set'] = [];
    for (var i=0; i<networkGraph.nodes.length; i++) {
        var nodeData = networkGraph.nodes[i];
        var json = {}
        if ('domainId' in nodeData)
            json['domain_id'] = nodeData.domainId;
        else json['domain_id'] = null;
        if (!saveAs && 'serverId' in nodeData) {
            json['node_id'] = nodeData.serverId;
            nodeServerIds[nodeData.serverId] = nodeData;
        } //else json['node_id'] = null;
        json['node_client_id'] = nodeData.id;
        json['node_name'] = nodeData.title;
        if (nodeData.type != null) {
            if (!saveAs && 'serverId' in nodeTypes[nodeData.type]) {
                json['node_type_id'] = nodeTypes[nodeData.type].serverId;
            } else json['node_type_client_id'] = parseInt(nodeData.type);
        } else json['node_type_id'] = null;
        json['x'] = nodeData.x;
        json['y'] = nodeData.y;
        graphData['node_set'].push(json);
    }

    graphData['edge_set'] = [];
    for (var i=0; i<networkGraph.edges.length; i++) {
        var edgeData = networkGraph.edges[i];
        var json = {}
        if (!saveAs && 'serverId' in edgeData.source) {
            json['n1_id'] = edgeData.source.serverId;
        } else json['n1_client_id'] = edgeData.source.id;
        if (!saveAs && 'serverId' in edgeData.target) {
            json['n2_id'] = edgeData.target.serverId;
        } else json['n2_client_id'] = edgeData.target.id;
        json['influence_value'] = parseFloat(edgeData.name);
        graphData['edge_set'].push(json);
    }

    return graphData;
}