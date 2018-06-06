({
	doInit : function(component, event, helper) {

        if (!component.get("v.isLoaded")) {
			document.getElementById("main").innerText = Date.now();
 	        component.set("v.message", Date.now());
            component.set("v.isLoaded", true);
        }
	}
})