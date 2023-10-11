import {
  TurnContext,
  StatePropertyAccessor,
  MessageFactory,
  CardFactory
} from "botbuilder";
import {
  ComponentDialog,
  DialogSet, DialogState, DialogTurnStatus, DialogTurnResult,
  TextPrompt, ChoicePrompt, ChoiceFactory,
  WaterfallDialog, WaterfallStepContext
} from "botbuilder-dialogs";
import DinnerKindOptionsCard from "./dinnerKindOptions"; 

export const DIALOG_DINNER = 'dinner-dialog';
export const DIALOG_TEXT_PROMPT = 'dinner-textprompt';
export const DIALOG_ENTREE_PROMPT = 'dinner-entreeprompt';
export const DIALOG_DINNER_WATERFALL = 'dinner-waterfall';

const italian_entrees: string[] = ['pizza', 'pasta', 'calzone'];
const mexican_entrees: string[] = ['tacos', 'burritos', 'enchiladas'];

export class DinnerDialog extends ComponentDialog {

  constructor() {
    super(DIALOG_DINNER);

    this
      .addDialog(new TextPrompt(DIALOG_TEXT_PROMPT))
      .addDialog(new ChoicePrompt(DIALOG_ENTREE_PROMPT))
      .addDialog(new WaterfallDialog(DIALOG_DINNER_WATERFALL, [
        this.pickKindStep.bind(this),
        this.pickEntreeStep.bind(this),
        this.placeOrderStep.bind(this)
      ]));

    this.initialDialogId = DIALOG_DINNER_WATERFALL;
  }

  private async pickKindStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    console.log("DinnerDialog.pickKindStep()");
    
    const dinnerTypeOptionsCard = CardFactory.adaptiveCard(DinnerKindOptionsCard);
    await stepContext.context.sendActivity({ attachments: [dinnerTypeOptionsCard] });
    return await stepContext.prompt(DIALOG_TEXT_PROMPT, {});
  }

  private async pickEntreeStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    console.log("DinnerDialog.pickEntreeStep()");

    if (stepContext.result) {
      const result = (stepContext.context.activity.conversation.conversationType === 'channel')
        ? TurnContext.removeRecipientMention(stepContext.context.activity)
        : stepContext.result.trim().toLowerCase();
      
      return await stepContext.prompt(DIALOG_ENTREE_PROMPT, {
        prompt: `What kind of ${result} entree would you like?`,
        choices: ChoiceFactory.toChoices(
          (result === 'italian')
            ? italian_entrees
            : mexican_entrees
          )
        });
      }
  }

  private async placeOrderStep(stepContext: WaterfallStepContext): Promise<DialogTurnResult> {
    console.log("DinnerDialog.placeOrderStep()");

    const result = (stepContext.context.activity.conversation.conversationType === 'channel')
      ? TurnContext.removeRecipientMention(stepContext.context.activity)
      : stepContext.result.trim().toLowerCase();
    
    await stepContext.context.sendActivity(`**Fantastic choice!** Thank you for your order of **${result}**`);
    return await stepContext.endDialog();
  }

}
