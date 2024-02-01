import { LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import BOARD_OBJ from '@salesforce/schema/Board__c';
import BOARD_NAME from '@salesforce/schema/Board__c.Name';
import BOARD_DESC from '@salesforce/schema/Board__c.Description__c';
import BOARD_SECNUM from '@salesforce/schema/Board__c.NoOfSections__c';
import saveBoard from '@salesforce/apex/BoardController.saveBoard';
import getBoards from '@salesforce/apex/BoardController.getBoards';
import { NavigationMixin } from 'lightning/navigation';

const COLUMNS = [
    {label:'Name', fieldName: 'Name'},
    {label:'Description', fieldName: 'Description__c'},
    {label:'Number of Sections', fieldName: 'NoOfSections__c'},
    {
        type:"button", typeAttributes: {
            label: 'Open Board',
            name: 'openBoard',
            title: 'Open Board',
            value: 'openBoard'
        }
    }
]

export default class Boards extends NavigationMixin(LightningElement) {

    columns = COLUMNS;
    showModalPopUp = false;
    objectApiName = BOARD_OBJ;

    name = BOARD_NAME;
    description = BOARD_DESC;
    numOfSec = BOARD_SECNUM;

    sections = [];

    @wire(getBoards)
    boards;


    newBoardClickHandler() {
        this.showModalPopUp = true;
    }

    popUpCloseHandler() {
        this.showModalPopUp = false;
    }

    numberOfSectionsHandler(event) {
        let noOfSections = event.target.value;
        this.sections = [];
        for (let i = 0; i < noOfSections; i++) {
            this.sections.push({ id: i, sectionLabel: `Section ${i + 1} Title` });
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const fields = { ...event.detail.fields };
        let sectionControls = this.template.querySelectorAll('[data-section-control]');
        let sectionList = [];
       
        for (let control of sectionControls) {
            sectionList.push({ Name: control.value, 
            Items_Background_Theme__c:`${this.getRandomTheme()}`  });
        }

        if (!this.validateData(fields, sectionList)) {
            return;
        }
        let result = await saveBoard({ 'board': fields, 'sections': sectionList });
        this.navigateToBoardRecordPage(result);
        this.popUpCloseHandler();
        this.showToast('Data saved successfully');
    }
    getRandomTheme(){
        let themes = ['slds-theme_alert-texture','slds-theme_warning','slds-theme_alt-inverse','slds-theme_inverse','slds-theme_shade'];
        return themes[Math.floor(Math.random() * themes.length)];
    }
    validateData(fields, sectionList) {
        let sectionCount = parseInt(fields.NoOfSections__c);
        if (!sectionCount || sectionCount < 1 || sectionCount > 10) {
            this.showToast('Please enter valid number of sections value between 1 to 10', 'Error', 'error');
            return false;
        }
        if (sectionList.filter(a => a.Name == '').length > 0) {
            this.showToast('Please enter title for every section.', 'Error', 'error');
            return false;
        }
        return true;
    }
    get noRecordsFound() {
        //return this.boards && this.boards.data && this.boards.data.length === 0;
        return  !this.boards || !this.boards.data || !Array.isArray(this.boards.data) || this.boards.data.length === 0;
    }
    rowActionHandler(event) {
       
        let boardId = event.detail.row.Id;
        const actionName = event.detail.action.name;
        if(actionName == 'openBoard')
        {
            this.navigateToBoardRecordPage(boardId);
        }
    }
    
    navigateToBoardRecordPage(boardId){
       
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: boardId,
                objectApiName: BOARD_OBJ,
                actionName: 'view'
            }
        })
        
    }
    showToast(message, title = 'Success', variant = 'success') {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
   
    
}
 
