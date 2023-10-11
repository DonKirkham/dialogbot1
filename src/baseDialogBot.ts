import { 
  ConversationState,
  UserState,
  TeamsActivityHandler,
  TurnContext
} from 'botbuilder';
import { MainDialog } from './dialogs';

export const DIALOG_STATE_PROPERTY = 'DialogState';
export class BaseDialogBot extends TeamsActivityHandler {
  public dialogState: any;

  constructor(public conversationState: ConversationState, public userState: UserState, public dialog: MainDialog) {
    super();

    this.dialogState = this.conversationState.createProperty(DIALOG_STATE_PROPERTY);

    this.onMessage(async (context, next) => {
      console.log('BaseDialogBot.onMessage()');

      await this.dialog.run(context, this.dialogState);
      await next();
    });

    // this.onConversationUpdate(async (context, next) => {
    //   console.log('Running dialog with ConversationUpdate Activity.');

    //   await this.dialog.run(context, this.dialogState);

    //   await next();
    // });
  }

  public async run(context: TurnContext) {
    console.log("BaseDialogBot.run()");

    await super.run(context);
    console.log("TeamsActivityHandler.run()");

    await this.conversationState.saveChanges(context, false);
    await this.userState.saveChanges(context, false);
  }
}
