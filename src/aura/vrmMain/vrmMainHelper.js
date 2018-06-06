({
    /**
     * removeMapElement
     *
     * @param component
     * @param helper
     */
    removeMapElement: function (component, helper) {
        var mapTabData = document.getElementById("mapTabDataId");

        // Brute force destroy DOM element
        if (mapTabData) {
            mapTabData.remove();
        }
    },

    /**
     * toggleTab
     *
     * @param component
     * @param event
     * @param helper
     */
    toggleTab: function (component, event, helper) {
        var activeTab = component.get("v.activeTab"),
            previousActiveHeader = component.find(activeTab.header),
            previousActiveData = component.find(activeTab.data),
            currentActiveHeader = component.find(event.srcElement.id),
            currentActiveData = component.find(event.srcElement.dataset.dataid);

        // Hide previous tab
        $A.util.removeClass(previousActiveHeader, 'slds-is-active');
        $A.util.addClass(previousActiveData, 'slds-hide');

        // Show current tab
        $A.util.removeClass(currentActiveData, 'slds-hide');
        $A.util.addClass(currentActiveHeader, 'slds-is-active');

        // Update model
        activeTab.header = event.srcElement.id;
        activeTab.data = event.srcElement.dataset.dataid;
    }
})