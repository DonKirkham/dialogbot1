import {
  TeamsActivityHandler,
  CardFactory,
  TurnContext,
  AdaptiveCardInvokeValue,
  AdaptiveCardInvokeResponse,
  MemoryStorage,
  ConversationState,
  UserState,
} from "botbuilder";
import rawWelcomeCard from "./adaptiveCards/welcome.json";
import rawLearnCard from "./adaptiveCards/learn.json";
import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { BaseDialogBot } from './baseDialogBot';
import { MainDialog } from './dialogs';

export class TeamsBot extends BaseDialogBot {
  constructor() {
    const memoryStorage = new MemoryStorage();
    const conversationState = new ConversationState(memoryStorage);
    const userState = new UserState(memoryStorage);

    super(conversationState, userState, new MainDialog());

    this.onMessage(async (context, next) => {
      console.log("TeamsBot.onMessage()");
      await next();
    });
  }

  protected async onAdaptiveCardInvoke(context: TurnContext, invokeValue: AdaptiveCardInvokeValue): Promise<any> {
    console.log("TeamsBot.onAdaptiveCardInvoke()");
  }

}
