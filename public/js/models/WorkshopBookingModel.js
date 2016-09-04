import {observable} from 'mobx';

export default class WorkshopBookingModel {
    @observable id;
    @observable workshopID;
    @observable studentID;
    @observable created;
    @observable creatorID;
    @observable modified;
    @observable modifierID;
    @observable archived;
    @observable archiverID;
    @observable canceled;
    @observable attended;

    constructor(value) {
    	this.id = id;
    	this.workshopID = workshopID;
    	this.studentID = studentID;
    	this.created = created;
    	this.creatorID = creatorID;
    	this.modified = modified;
    	this.modifierID = modifierID;
    	this.archived = archived;
    	this.archiverID = archiverID;
    	this.canceled = canceled;
    	this.attended = attended;
    }
}