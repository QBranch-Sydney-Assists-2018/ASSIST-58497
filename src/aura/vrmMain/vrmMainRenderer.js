({
    unrender: function (component, helper) {

        // Call super
        this.superUnrender();

        helper.removeMapElement(component, helper);
    }
})