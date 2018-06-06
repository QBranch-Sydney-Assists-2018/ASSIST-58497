public class VrmController {

    public class VrmNode {

        @AuraEnabled public String Id { get; set; }
        @AuraEnabled public String FirstName { get; set; }
        @AuraEnabled public String LastName { get; set; }
        @AuraEnabled public String Gender { get; set; }
        @AuraEnabled public Boolean Concern { get; set; }
        @AuraEnabled public String avatarUrl { get; set; }

        // Trivial constructor, for server-side Apex -> client-side JavaScript
        public VrmNode(String id, String firstName, String lastName, String gender) {
            this.Id = id;
            this.FirstName = firstName;
            this.LastName = lastName;
            if (gender == null) {
                this.Gender = 'N/A';
            } else {
                this.Gender = gender;
            }

            this.Concern = false;
            if (this.Gender == 'Male') {
                this.avatarUrl = 'https://www.w3schools.com/w3images/avatar2.png';
            } else {
                this.avatarUrl = 'https://www.w3schools.com/w3images/avatar5.png';
            }


        }

        // Default, no-arg constructor, for client-side -> server-side
        public VrmNode() {
        }
    }

//    public class VrmEdge implements Comparable{
    public class VrmEdge {

        @AuraEnabled public String Id { get; set; }
        @AuraEnabled public Contact Person_1;
        @AuraEnabled public String Person_1_Role { get; set; }
        @AuraEnabled public Contact Person_2;
        @AuraEnabled public String Person_2_Role { get; set; }
        @AuraEnabled public Boolean Concern { get; set; }

        public VrmEdge() {
        }

        public VrmEdge(String id) {
            this.Id = id;
        }

        public VrmEdge(Relationship__c relationship) {
            this.Id = relationship.Id;
            //this.Person_1.Id = relationship.Person_1__c;
            this.Person_1_Role = relationship.Person_1_Role__c;
            //this.Person_1.FirstName = relationship.Person_1__r.FirstName;

            this.Person_1 = [
                    SELECT Id,
                            FirstName,
                            LastName
                    FROM Contact
                    WHERE Id = :relationship.Person_1__c
            ];
            this.Person_2 = [
                    SELECT Id,
                            FirstName,
                            LastName
                    FROM Contact
                    WHERE Id = :relationship.Person_2__c
            ];

            //this.Person_1.LastName = relationship.Person_1__r.LastName;
            //this.Person_2.Id = relationship.Person_2__c;
            this.Person_2_Role = relationship.Person_2_Role__c;
            //this.Person_2.FirstName = relationship.Person_2__r.FirstName;
            //this.Person_2.LastName = relationship.Person_2__r.LastName;
            this.Concern = relationship.Concern__c;
        }

        // Handle sort
//        public Integer compareTo (Object compareTo)
//        {
//
//            VrmEdge compareToAct = (VrmEdge)compareTo;
//
//            Integer returnValue = 0;
//
//            if (actDateTime > compareToAct.actDateTime) {
//                returnValue = (actSortOrder == 'ASC' ? 1 : -1);
//            } else if (actDateTime < compareToAct.actDateTime) {
//                returnValue = (actSortOrder == 'ASC' ? -1 : 1);
//            }
//
//            return returnValue;
//        }
//
//        public Integer compareTo(Object compareTo) {
//
//            PeriodsWrapper compareToPeriod = (PeriodsWrapper) compareTo;
//
//            //value 0 indicates elements are equal
//            Integer retValue = 0;
//            if(period.Start_Date__c > compareToPeriod.period.Start_Date__c) {
//                retValue = 1;
//            } else if(period.Start_Date__c < compareToPeriod.period.Start_Date__c) {
//                retValue = -1;
//            }
//
//            return retValue;
//        }


    }

    public class VrmRelationship {

        @AuraEnabled public List<VrmEdge> edges = new List<VrmEdge>();
        @AuraEnabled public List<VrmNode> nodes = new List<VrmNode>();

        public VrmRelationship() {
        }
    }

    @AuraEnabled
    public static VrmRelationship fetchRelationships(string contactId) {
        System.debug('Got Into fetchRelationships');
        System.debug(contactId);

        VrmRelationShip vrmRelationship = new VrmRelationShip();
        Set<Id> existingNodes = new Set<Id>();
        Set<Id> existingEdges = new Set<Id>();

        for (Relationship__c relation : [
                SELECT Id,
                        Person_1__c,
                        Person_1_Role__c,
                        Person_1__r.FirstName,
                        Person_1__r.LastName,
                        Person_1__r.Gender__c,
                        Person_2__c,
                        Person_2_Role__c,
                        Person_2__r.FirstName,
                        Person_2__r.LastName,
                        Person_2__r.Gender__c,
                        Concern__c
                FROM Relationship__c
                WHERE Person_1__c = :contactId
                OR Person_2__c = :contactId
        ]) {

            if (!existingNodes.contains(relation.Person_1__c)) {
                vrmRelationship.nodes.add(new VrmNode(
                        relation.Person_1__c,
                        relation.Person_1__r.FirstName,
                        relation.Person_1__r.LastName,
                        relation.Person_1__r.Gender__c));

                existingNodes.add(relation.Person_1__c);
            }

            if (!existingNodes.contains(relation.Person_2__c)) {
                vrmRelationship.nodes.add(new VrmNode(
                        relation.Person_2__c,
                        relation.Person_2__r.FirstName,
                        relation.Person_2__r.LastName,
                        relation.Person_2__r.Gender__c));
                existingNodes.add(relation.Person_2__c);
            }

            if (!existingEdges.contains(relation.id)) {
                vrmRelationship.edges.add(new VrmEdge(relation));
                existingEdges.add(relation.id);
            }

            //vrmRelationship.edges.add(new VrmEdge());
        }

        for (Id nodeId : existingNodes) {
            if (nodeId == contactId) {
                continue;
            }
            for (Relationship__c relation : [
                    SELECT Id,
                            Person_1__c,
                            Person_1_Role__c,
                            Person_1__r.FirstName,
                            Person_1__r.LastName,
                            Person_1__r.Gender__c,
                            Person_2__c,
                            Person_2_Role__c,
                            Person_2__r.FirstName,
                            Person_2__r.LastName,
                            Person_2__r.Gender__c,
                            Concern__c
                    FROM Relationship__c
                    WHERE Person_1__c = :nodeId
                    OR Person_2__c = :nodeId
            ]) {
                if (!existingNodes.contains(relation.Person_1__c)) {
                    vrmRelationship.nodes.add(new VrmNode(
                            relation.Person_1__c,
                            relation.Person_1__r.FirstName,
                            relation.Person_1__r.LastName,
                            relation.Person_1__r.Gender__c));
                    existingNodes.add(relation.Person_1__c);
                }
                if (!existingNodes.contains(relation.Person_2__c)) {
                    vrmRelationship.nodes.add(new VrmNode(
                            relation.Person_2__c,
                            relation.Person_2__r.FirstName,
                            relation.Person_2__r.LastName,
                            relation.Person_2__r.Gender__c));
                    existingNodes.add(relation.Person_2__c);
                }

                if (!existingEdges.contains(relation.id)) {
                    vrmRelationship.edges.add(new VrmEdge(relation));
                    existingEdges.add(relation.id);
                }
            }

        }
        //Set the nodes to be flagged as Concern if conditions are met
        for (Integer i = 0; i < vrmRelationship.nodes.size(); i++) {
            VrmNode node = vrmRelationship.nodes[i];
            for (VrmEdge edge : vrmRelationship.edges) {
                if (edge.Concern == true && edge.Person_1.Id == node.Id) {
                    vrmRelationship.nodes[i].Concern = true;
                }
            }
        }

        return vrmRelationship;
    }
}