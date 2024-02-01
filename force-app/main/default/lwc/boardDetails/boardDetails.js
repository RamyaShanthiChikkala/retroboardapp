import { LightningElement , wire , api , track } from 'lwc';
import getBoardDetails from '@salesforce/apex/BoardController.getBoardDetails';
import { createRecord , updateRecord, deleteRecord} from 'lightning/uiRecordApi';
import {refreshApex} from '@salesforce/apex';



export default class BoardDetails extends LightningElement {

    @api recordId;
    @track sections = [];
    wiredResult;

    @wire(getBoardDetails,{boardId: '$recordId'})
    
    wiredGetBoardDetails(result){
        this.wiredResult = result;
        if(result.data && result.data.length > 0 ){
            //this.sections = result.data;
            // to make a deep copy of the wired object we stringify and parse it as below 
            this.sections = JSON.parse(JSON.stringify(result.data));
        }
        if(result.error){
            console.log('Error occured while fetching the board details',result.error);
        }
    }

    async addNewSectionItemClickHandler(event){
        let sectionId = event.target.dataset.boardSectionId;
        const fields = { Section__c : sectionId , LikeCount__c : 0};
        const recordInput = { apiName : 'Board_Section_Item__c' , fields };
        const response = await createRecord(recordInput);
        fields.Id = response.id;
        let section = this.sections.find(a => a.Id == sectionId)
        if(!section?.Board_Section_Items__r){
           section.Board_Section_Items__r = [];
        }
        section.Board_Section_Items__r.push(fields);
    }

    async updateSectionItemDescriptionHandler(event){
        let itemId = event.target.dataset.boardSectionItemId;
        let itemDesc = event.target.value;

        const fields = {Id : itemId , Description__c : itemDesc};
        await updateRecord({fields});
    }

    async deleteBoardSectionItemHandler(event){
        let itemId = event.target.dataset.boardSectionItemId;
        await deleteRecord(itemId);
        await refreshApex(this.wiredResult);
    }

    async likeButtonHandler(event){
        let itemId = event.target.dataset.boardSectionItemId; 

        let sectionId = event.target.dataset.boardSectionId;

        let sectionItemRow = this.sections.find(a => a.Id == sectionId)?.Board_Section_Items__r.find(a => a.Id == itemId);
        let likeCount = parseInt(sectionItemRow.LikeCount__c ?? 0) + 1;

        const fields = {Id : itemId , LikeCount__c : likeCount};
        await updateRecord({fields});
        sectionItemRow.LikeCount__c = likeCount;
        }



   
}