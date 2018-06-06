({
    relationshipsChange: function (component, event, helper) {
        //alert("Working");
        console.log("### INSIDE Mapping Controller ###");
        console.log(component.get("v.relationships"));

        if (component.get("v.relationships") === null) {
            return;
        }
        console.log(typeof Raphael);
        if (typeof Raphael !== 'function') {
            var recordId = component.get("v.recordId");
            var navEvent = $A.get("e.force:navigateToSObject");
            if (navEvent) {
                navEvent.setParams({
                    recordId: recordId,
                    slideDevName: "detail"
                });
                //navEvent.fire();
            }
        } else {

            var drawn = component.get("v.drawnMap");
            console.log('in else case');

            var r;
            var connections = [];
            var mapNodes = {};

            setTimeout(function () {
                r = helper.setup(true, component, helper);

                component.set("v.connections", connections);
                component.set("v.mapNodes", mapNodes);

                Raphael.st.draggable = helper.draggable;
                Raphael.fn.connection = helper.connection;

                helper.draw(r, component, helper);
            }, 500);

        }
    },

    handleDestroy: function (component, event, helper) {

        console.log("handleDestroy");

    },

    relationshipClicked: function (component, event, helper) {
        var relationshipId = event.getParam("relationshipId");
        helper.updateConnections(component, helper);
    }
})