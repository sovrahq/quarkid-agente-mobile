import * as TaskManager from 'expo-task-manager';
// import {
//   PullDwnMessagesCommandSymbol,
//   PullDwnMessagesCommand,
//   SubscribeToNewMessagesCommandSymbol,
//   SubscribeToNewMessagesCommand,
// } from '@agent/application';
import { BACKGROUND_NOTIFICATION_FETCH } from './recursiveTasks';

export const BACKGROUND_FETCH_TASK = 'background-fetch';

export const subscribeToNewDwnMessages = () => {
    // const mediator = new Mediator();
    // mediator.notifySymbol(
    //   SubscribeToNewMessagesCommandSymbol,
    //   new SubscribeToNewMessagesCommand(agentConfig.universalResolverUrl)
    // );
};

const pullDwnMessages = async () => {
    // const mediator = new Mediator();
    // mediator.notifySymbol(
    //   PullDwnMessagesCommandSymbol,
    //   new PullDwnMessagesCommand()
    // );
};

export const registerForegroundFetch = async () => {
    // await pullDwnMessages();
    // setInterval(async () => {
    //   await pullDwnMessages();
    // }, 10000);
};

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    // subscribeToNewDwnMessages();
    // await pullDwnMessages();
    // return BackgroundFetch.BackgroundFetchResult.NewData;
});

TaskManager.defineTask(BACKGROUND_NOTIFICATION_FETCH, async () => {
    // const publishedDid = await Storage.getItem(StorageEnum.PUBLISHED_DID);
    // const did = await Storage.getItem(StorageEnum.DID);
    // if (did && !publishedDid) {
    //   const didDocument = await checkDidDocument(did);
    //   if (didDocument) {
    //     await unregisterBackgroundNotificationFetch();
    //   }
    // }
    // return BackgroundFetch.BackgroundFetchResult.NewData;
});

export const registerBackgroundNotificationFetch = async () => {
    // await BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_FETCH, {
    //   minimumInterval: 60,
    //   stopOnTerminate: false,
    //   startOnBoot: true,
    // });
};

export const unregisterBackgroundNotificationFetch = async () => {
    // await BackgroundFetch.unregisterTaskAsync(BACKGROUND_NOTIFICATION_FETCH);
};

// export const registerBackgroundFetch = async () => {
//   await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
//     minimumInterval: 60,
//     stopOnTerminate: false,
//     startOnBoot: true,
//   });
// };

// export const unegisterBackgroundFetch = async () => {
//   await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
// };
