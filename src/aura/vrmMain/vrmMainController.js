({
    doInit: function (component, event, helper) {
        var action = component.get("c.fetchRelationships");
        var contactId = component.get("v.recordId") ? component.get("v.recordId") : '0037F00000SgJJ4QAN';
        component.set("v.recordId", contactId);

        action.setParams({contactId: contactId});

        // Remove pre-existing parent Map element
        helper.removeMapElement(component, helper);

        action.setCallback(this, function (response) {
            var state = response.getState();
            if (component.isValid() && state === "SUCCESS") {
                component.set("v.relationships", response.getReturnValue());

                /* If the component cVrmMapping already exists we remove and recreate it */
                if (component.find("cVrmMapping") != undefined) {
                    console.log('### Component cVrmMapping exists! ###');
                    component.find("cVrmMapping").destroy();
                }
                if (component.find("cVrmMapping") == undefined) {
                    // Check component still exists
                    if (component.isValid()) {

                        $A.createComponent(
                            "c:vrmMapping",
                            {
                                "aura:id": "cVrmMapping",
                                "relationships": response.getReturnValue(),
                                "recordId": contactId
                            },
                            function (map, status, errorMessage) {
                                if (status === "SUCCESS") {
                                    console.log("### Create Map Component Successful! " + Date.now() + " ###");

                                    var container = component.find("mapTabDataId");
                                    if (container.isValid()) {
                                        if (map.isValid()) {
                                            console.log("### map is valid! ###");

                                            //Paull
                                            //container.set("v.body", []);
                                            //var body = container.get("v.body");
                                            //body.push(map);
                                            //container.set("v.body", body);
                                            component.set("v.vrmMapping", map);
                                        }
                                    }
                                } else if (status === "INCOMPLETE") {
                                    console.log("No response from server or client is offline.")
                                } else if (status === "ERROR") {
                                    console.log("Error: " + errorMessage);
                                }
                            }
                        );
                    }
                }
            }
        });
        $A.enqueueAction(action);
    },

    /**
     * handleTabClick
     *
     * @param component
     * @param event
     * @param helper
     */
    handleTabClick: function (component, event, helper) {
        helper.toggleTab(component, event, helper);
    },

    navigateToRecord: function (component, event, helper) {
        var recordId = event.getParam("recordId");
        //window.location.href = '/one/one.app#/sObject/'+recordId+'/view';
        /*window.open(
  		'/one/one.app#/sObject/'+recordId+'/view',
  		'_blank' // <- This is what makes it open in a new window.
		);*/
    },
})