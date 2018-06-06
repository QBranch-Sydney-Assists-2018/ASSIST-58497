({

    setup: function (isInit, component, helper) {
        console.log("### !!! INSIDE HELPER: SETUP FUNCTION: HERE !!! ###");
        var r;
        if (isInit) {
            //canvas_container
            console.log("Is initialise function");
            r = Raphael("canvas_container", 640, 600);
//            r = Raphael("mapTabDataId", 640, 600);
            return r;
        }

        //var connections = component.get("v.connections");
        //var r = component.get("v.mapContainer");
        //Raphael.st.draggable = helper.draggable;
        //Raphael.fn.connection = helper.connection;
    },

    draggable: function (connections, r) {
        console.log("###  INSIDE HELPER: Draggable FUNCTION ###");
        var me = this,
            lx = 0,
            ly = 0,
            ox = 0,
            oy = 0,
            originX = me[0].attrs.x,
            originY = me[0].attrs.y,
            maxX = me[0].paper.width,
            maxY = me[0].paper.height,
            width = me[0].attrs.width,
            height = me[0].attrs.height,
            moveFnc = function (dx, dy) {
                lx = dx + ox;
                ly = dy + oy;

                /* Top Boundary */
                if (originY - (ly * -1) < 0) {
                    var yPastZero = originY - (ly * -1);
                    ly = ly - (yPastZero);
                }
                /* Right Boundary */
                if ((originX + lx + width) > maxX) {
                    var xPastMax = (originX + lx + width) - maxX;
                    lx = lx - xPastMax;
                }
                /* Bottom Boundary */
                if ((originY + ly + height) > maxY) {
                    var yPastMax = (originY + ly + height) - maxY;
                    ly = ly - yPastMax;
                }
                /* Left Boundary */
                if (originX - (lx * -1) < 0) {
                    var xPastZero = originX - (lx * -1);
                    lx = lx - (xPastZero);
                }

                me.transform("t" + lx + "," + ly);
                //var line;
                for (var i = connections.length; i--;) {
                    r.connection(connections[i]);
                }
            },
            startFnc = function () {
            },
            endFnc = function () {
                ox = lx;
                oy = ly;
            };

        this.drag(moveFnc, startFnc, endFnc);
    },

    createEntity: function (x, y, entity, r, subject, component, helper) {
        console.log("### INSIDE HELPER:  createEntity FUNCTION ###");
        console.log(x, y);

        var connections = component.get("v.connections");
        //Raphael.st.draggable = helper.draggable;
        //Raphael.fn.connection = helper.connection;
        var anEntity = r.set(),

            container = r.rect(x, y, 150, 140, 4).attr({
                // fill: entity.Concern == true ? "#FFEAED" : "#FFFFFF",
                fill: "#FFFFFF",
                // stroke: entity.Concern == true ? "#FF0000" : "#bbbbbb",
                stroke: "#bbbbbb",
                "fill-opacity": 100,
                "stroke-width": subject ? "3" : "1",
                cursor: "move"
            }),

            entityAvatar = r.image(
                entity.avatarUrl,
                x + 45,
                y + 14,
                60,
                60
            ).attr({cursor: "move"});

        var entityNameText = r
            .text(x + 80, y + 100, entity.FirstName + ' ' + entity.LastName)
            .attr({
                fill: "#000000",
                cursor: "pointer",
                "font-size": 16,
                "font-family": "Lato, Helvetica, sans-serif",
                "font-weight": subject ? 'bolder' : ''
            }).click(function () {
                var navEvent = $A.get("e.force:navigateToSObject");

                if (navEvent) {
                    navEvent.setParams({
                        //isredirect: true,
                        recordId: entity.Id,
                        slideDevName: "detail"
                    });
                    window.open('/one/one.app#/sObject/' + entity.Id + '/view',
                        '_blank' // <- This is what makes it open in a new window.
                    );
                    //navEvent.fire();
                }
            });

        var mouseEnter = function () {
            var me = this,
                isMouseOver = false;
            for (var i = 0; i < me.length; i++) {
                if (me[i].type === "rect") {
                    var el = me[i];
                    el.mouseover(function (e) {
                        if (isMouseOver) {
                            return;
                        }
                        isMouseOver = true;
                        if (el.attrs.stroke !== color.red) {
                            el.animate({"stroke-width": 1, "stroke": color.blue}, 40, 'easeOut', function () {
                                isMouseOver = false;
                            });
                        } else {
                            el.animate({"fill": color.redDark}, 40, 'easeOut', function () {
                                isMouseOver = false;
                            });
                        }
                    });
                }
            }
        };

        anEntity.push(container, entityAvatar, entityNameText);
        anEntity.draggable(connections, r);

        return anEntity;
    },

    draw: function (r, component, helper) {
        var data = component.get("v.relationships");
        var connections = component.get("v.connections");
        var mapNodes = component.get("v.mapNodes");
        var recordId = component.get("v.recordId");
        var entityCount = 0;
        var aboveContact = true;
        var subject = false;

        console.log(recordId);
        console.log("### INSIDE HELPER: DRAW FUNCTION! ###");

        if (data.nodes.length) {

            for (var i = 0; i < data.nodes.length; i++) {
                var node = data.nodes[i];
                var x, y;

                if (recordId == node.Id) {
                    x = 200;
                    y = 160;
                    subject = true;
                } else {
                    if (entityCount == 0) {
                        x = 5;
                        y = 10;
                        aboveContact = false;
                    } else {
                        if (aboveContact == true) {
                            x = entityCount * (200);
                            y = 10;
                        } else {
                            x = (entityCount - 1) * (200);
                            y = 280;
                        }
                        aboveContact = !aboveContact;
                    }
                    entityCount++;
                }
                mapNodes[node.Id] = helper.createEntity(x, y, node, r, subject, component, helper);

                // Reset
                subject = false;

            }
        }

        if (data.edges.length) {
            for (var j = 0; j < data.edges.length; j++) {
                var edge = data.edges[j];
                connections.push(r.connection(mapNodes[edge.Person_1.Id][0], mapNodes[edge.Person_2.Id][0], edge.Concern === true ? 'red' : 'black', edge.Person_1_Role, edge.Person_2_Role));
            }
        }

        component.set("v.connections", connections);
        component.set("v.mapNodes", mapNodes);
    },
    connection: function (obj1, obj2, line, descriptionText1, descriptionText2, bg, warn, id) {
        console.log("### INSIDE HELPER: Connection FUNCTION ###");
        if (obj1.line && obj1.from && obj1.to) {
            line = obj1;
            obj1 = line.from;
            obj2 = line.to;
        }
        var bb1 = obj1.getBBox(),
            bb2 = obj2.getBBox(),
            p = [
                {x: bb1.x + bb1.width / 2, y: bb1.y - 1},
                {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
                {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
                {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
                {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
                {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
                {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
                {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}
            ],
            d = {},
            dis = [];
        for (var i = 0; i < 4; i++) {
            for (var j = 4; j < 8; j++) {
                var dx = Math.abs(p[i].x - p[j].x),
                    dy = Math.abs(p[i].y - p[j].y);
                if (
                    i == j - 4 ||
                    (((i != 3 && j != 6) || p[i].x < p[j].x) &&
                        ((i != 2 && j != 7) || p[i].x > p[j].x) &&
                        ((i != 0 && j != 5) || p[i].y > p[j].y) &&
                        ((i != 1 && j != 4) || p[i].y < p[j].y))
                ) {
                    dis.push(dx + dy);
                    d[dis[dis.length - 1]] = [i, j];
                }
            }
        }
        if (dis.length == 0) {
            var res = [0, 4];
        } else {
            res = d[Math.min.apply(Math, dis)];
        }
        var x1 = p[res[0]].x,
            y1 = p[res[0]].y,
            x4 = p[res[1]].x,
            y4 = p[res[1]].y;
        dx = Math.max(Math.abs(x1 - x4) / 2, 10);
        dy = Math.max(Math.abs(y1 - y4) / 2, 10);
        var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
            y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
            x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
            y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
        var path = [
            "M",
            x1.toFixed(3),
            y1.toFixed(3),
            "C",
            x2,
            y2,
            x3,
            y3,
            x4.toFixed(3),
            y4.toFixed(3)
        ].join(",");
        var labelBoxPadding = 4, // Relationshp label box "padding"
            labelOffset = 0.1333, // Relationship label offset as a percentage default 13%
            labelMinimumOffset = 22, // Relationship label minimum offset
            labelBoxPadding = 4, // Relationshp label box "padding"
            labelBoxRadius = "60%";
        // If connection already exists update the connection
        if (line && line.line) {
            line.bg && line.bg.attr({path: path});
            var lineAttr = {
                path: path,
            };

            var lineLength = Math.floor(line.line.getTotalLength());
            var labelOffsetValue = labelOffset * lineLength // transforms percentage into relative value
            // Set minmum size
            if (labelOffsetValue < labelMinimumOffset) {
                labelOffsetValue = labelMinimumOffset;
            }
            var label1Point = line.line.getPointAtLength(labelOffsetValue);
            var label2Point = line.line.getPointAtLength((lineLength - labelOffsetValue));

            line.text1.animate({x: Math.floor(label1Point.x), y: Math.floor(label1Point.y)}, 0);
            line.text2.animate({x: Math.floor(label2Point.x), y: Math.floor(label2Point.y)}, 0);
            line.text1Box.animate(
                {x: line.text1.getBBox().x - labelBoxPadding, y: line.text1.getBBox().y - labelBoxPadding},
                0
            );
            line.text2Box.animate(
                {x: line.text2.getBBox().x - labelBoxPadding, y: line.text2.getBBox().y - labelBoxPadding},
                0
            );
            //line.dot1.animate({ x: x1-3, y: y1-3 },0);
            //line.dot2.animate({ x: x4-3, y: y4-3 },0);
            line.line.attr(lineAttr);

            // If the line is not long enough for both labels hide the second one
            if (lineLength <= labelOffsetValue * 2) {
                line.text2.attr({opacity: 0});
                line.text2Box.attr({opacity: 0});
            } else {
                line.text2.attr({opacity: 1});
                line.text2Box.attr({opacity: 1});
            }
            // Instantiate node connections
        } else {

            var lineColor = typeof line == "string" ? line : "#bbbbbb";
            var lineAttr = {
                stroke: lineColor,
                "stroke-width": 2,
                fill: "none",
                "arrow-start": "classic-wide-long",
                "arrow-end": "classic-wide-long",
            };

            // Set Actual Line element
            var lineElement = this.path(path).attr(lineAttr);

            var lineLength = Math.floor(lineElement.getTotalLength());
            var labelOffsetValue = labelOffset * lineLength // transforms percentage into relative value
            // Set minmum size
            if (labelOffsetValue < labelMinimumOffset) {
                labelOffsetValue = labelMinimumOffset;
            }
            var label1Point = lineElement.getPointAtLength(labelOffsetValue);
            var label2Point = lineElement.getPointAtLength((lineLength - labelOffsetValue));

            var text1 = this.text(Math.floor(label1Point.x), Math.floor(label1Point.y), descriptionText1).attr({
                fill: "black",
                opacity: 1
            });
            var text2 = this.text(label2Point.x, label2Point.y, descriptionText2).attr({
                fill: "black",
                opacity: 1
            });

            // If the line isn't long enough don't hide the second label;
            if (lineLength <= labelOffsetValue * 2) {
                text2.attr({opacity: 0});
            }

            var text1Box = this.rect(
                text1.getBBox().x - labelBoxPadding,
                text1.getBBox().y - labelBoxPadding,
                text1.getBBox().width + labelBoxPadding * 2,
                text1.getBBox().height + labelBoxPadding * 2,
                labelBoxRadius
            ).attr({
                fill: "white",
                stroke: "none"
            });

            var text2Box = this.rect(
                text2.getBBox().x - labelBoxPadding,
                text2.getBBox().y - labelBoxPadding,
                text2.getBBox().width + labelBoxPadding * 2,
                text2.getBBox().height + labelBoxPadding * 2,
                labelBoxRadius
            ).attr({
                fill: "white",
                stroke: "none"
            });

            /* Force line of concern to top */
            if (lineColor === "#ff0000") {
                return {
                    bg:
                    bg &&
                    bg.split &&
                    this.path(path).attr({
                        stroke: bg.split("|")[0],
                        fill: "none",
                        "stroke-width": bg.split("|")[1] || 3
                    }),
                    line: lineElement.toFront(),
                    text1Box: text1Box.toFront(),
                    text1: text1.toFront(),
                    text2Box: text2Box.toFront(),
                    text2: text2.toFront(),

                    from: obj1,
                    to: obj2
                };
            } else {
                return {
                    bg:
                    bg &&
                    bg.split &&
                    this.path(path).attr({
                        stroke: bg.split("|")[0],
                        fill: "none",
                        "stroke-width": bg.split("|")[1] || 3
                    }),
                    line: lineElement.toBack(),
                    text1Box: text1Box.toFront(),
                    text1: text1.toFront(),
                    text2Box: text2Box.toFront(),
                    text2: text2.toFront(),

                    from: obj1,
                    to: obj2
                };
            }
        }
    },
    updateConnections: function (component, helper, relationshipId) {
        console.log("### INSIDE HELPER: updateConnections FUNCTION ###");
        var connections = component.get("v.connections");
        for (var i = connections.length; i--;) {
            line = r.connection(connections[i]);
            if (line.id === relationshipId) {
                //line.line.attr ("fill", "#0000FF");
            } else {
                //line.line.attr ("fill", "blue");
            }

        }

    },
    getMockData: function () {

        var data = {
            "edges": [
                {
                    "Concern": true,
                    "Id": "a007F00000V3jExQAJ",
                    "Person_1": {
                        "Id": "0037F00000SsQYyQAN",
                        "FirstName": "Jack",
                        "LastName": "Rogers"
                    },
                    "Person_1_Role": "Father",
                    "Person_2": {
                        "Id": "0037F00000SsQZ4QAN",
                        "FirstName": "Lauren",
                        "LastName": "Boyle"
                    },
                    "Person_2_Role": "Daughter"
                },
                {
                    "Concern": false,
                    "Id": "a007F00000V3jJKQAZ",
                    "Person_1": {
                        "Id": "0037F00000SsQZ4QAN",
                        "FirstName": "Lauren",
                        "LastName": "Boyle"
                    },
                    "Person_1_Role": "Daughter",
                    "Person_2": {
                        "Id": "0037F00000SsQZ3QAN",
                        "FirstName": "Stella",
                        "LastName": "Pavlova"
                    },
                    "Person_2_Role": "Mother"
                },
                {
                    "Concern": false,
                    "Id": "a007F00000V3jEsQAJ",
                    "Person_1": {
                        "Id": "0037F00000SsQZ3QAN",
                        "FirstName": "Stella",
                        "LastName": "Pavlova"
                    },
                    "Person_1_Role": "Spouse",
                    "Person_2": {
                        "Id": "0037F00000SsQYyQAN",
                        "FirstName": "Jack",
                        "LastName": "Rogers"
                    },
                    "Person_2_Role": "Spouse"
                }
            ],
            "nodes": [
                {
                    "Concern": false,
                    "FirstName": "Jack",
                    "Id": "0037F00000SsQYyQAN",
                    "LastName": "Rogers",
                    "avatarUrl": "https://www.w3schools.com//w3images/avatar2.png"
                },
                {
                    "Concern": true,
                    "FirstName": "Lauren",
                    "Id": "0037F00000SsQZ4QAN",
                    "LastName": "Boyle",
                    "avatarUrl": "https://www.w3schools.com//w3images/avatar5.png"
                },
                {
                    "Concern": false,
                    "FirstName": "Stella",
                    "Id": "0037F00000SsQZ3QAN",
                    "LastName": "Pavlova",
                    "avatarUrl": "https://www.w3schools.com//w3images/avatar5.png"
                }
            ]
        };
        return data;
    }
})