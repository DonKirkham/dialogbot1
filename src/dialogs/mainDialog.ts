import {
  TurnContext,
  StatePropertyAccessor,
  MessageFactory,
  InputHints
} from "botbuilder";
import {
  ComponentDialog,
  DialogSet, DialogState, DialogTurnStatus, DialogTurnResult,
  TextPrompt,
  WaterfallDialog, WaterfallStepContext
} from "botbuilder-dialogs";
import { DinnerDialog, DIALOG_DINNER } from './';

const DIALOG_MAIN = "main-dialog"; 
const DIALOG_TEXTPROMPT = "text-prompt";
const DIALOG_MAIN_WATERFALL = "main-waterfall";  

export class MainDialog extends ComponentDialog {
  constructor() {
    super(DIALOG_MAIN);
    this
      .addDialog(new TextPrompt(DIALOG_TEXTPROMPT))
      .addDialog(new DinnerDialog())
      .addDialog(new WaterfallDialog(DIALOG_MAIN_WATERFALL, [
        this.firstStep.bind(this),
        this.actStep.bind(this),
        this.lastStep.bind(this)
      ]));
    this.initialDialogId = DIALOG_MAIN_WATERFALL;

  }

  public async run(context: TurnContext, accessor: StatePropertyAccessor<DialogState>) { 
    console.log("MainDialog.run()");
    
    const dialogSet = new DialogSet(accessor);
    dialogSet.add(this);
    const dialogContext = await dialogSet.createContext(context);
    const results = await dialogContext.continueDialog();

    if (results.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(this.id);
    }
  }

  private async firstStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    console.log("MainDialog.firstStep()");
    // await stepContext.context.sendActivity('This is the first step');
    // return await stepContext.next();
  
    const messageText = (stepContext.options as any).restartMessage
      ? (stepContext.options as any).restartMessage
      : 'What can I help you with today?';
    const promptMessage = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
    return await stepContext.prompt(DIALOG_TEXTPROMPT, { prompt: promptMessage });

  }

  private async actStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    console.log("MainDialog.actStep()");
    // await stepContext.context.sendActivity('This is the act step');
    // return await stepContext.next();

    if (stepContext.result) {
      const result = (stepContext.context.activity.conversation.conversationType === 'channel') ? TurnContext.removeRecipientMention(stepContext.context.activity) : stepContext.result.trim().toLowerCase();

      switch (result) {
        case 'time':
        case 'current time':
        case 'what time is it?':
          await stepContext.context.sendActivity(`The current time is ${new Date().toLocaleTimeString()}`);
          return await stepContext.next();
        case 'dinner':
          console.log("asking for dinner ...");
          return await stepContext.beginDialog(DIALOG_DINNER);
        case 'no':
          await stepContext.context.sendActivity('OK, goodbye 👋');
          return await stepContext.endDialog();
        default:
          await stepContext.context.sendActivity(`I'm sorry, I don't how to do that.`);
          return await stepContext.next();
      }

    }
  }

  private async lastStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    console.log("MainDialog.lastStep()");

    return await stepContext.replaceDialog(this.initialDialogId, { restartMessage: 'Is there anything else I can do for you today? ' });
  }
}