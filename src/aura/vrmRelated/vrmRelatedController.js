({
    viewRecord: function (component, event, helper) {
        var navEvent = $A.get("e.force:navigateToSObject");
        var idx = event.target.getAttribute('data-index');
        var contactIndex = parseInt(event.target.getAttribute('data-contact-index'));
        var edge = component.get("v.relationships.edges")[idx];
        var personRecordId = edge.Person_1.Id;
        if (contactIndex == 2) {
            personRecordId = edge.Person_2.Id;
        }
        if (navEvent) {
            navEvent.setParams({
                recordId: personRecordId,
                slideDevName: "detail"
            });
            //navEvent.fire();

            window.open(
                '/one/one.app#/sObject/' + personRecordId + '/view',
                '_blank' // <- This is what makes it open in a new window.
            );
        }

    },
    editRecord: function (component, event, helper) {
        var editRecordEvent = $A.get("e.force:editRecord");
        var idx = event.target.getAttribute('data-index');
        var edge = component.get("v.relationships.edges")[idx];

        if (editRecordEvent) {
            editRecordEvent.setParams({
                recordId: edge.Id,
            });
            editRecordEvent.fire();
        }

    },
})