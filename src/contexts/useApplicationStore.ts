import {
  Agent,
  AgentModenaUniversalRegistry,
  AgentModenaUniversalResolver,
  ConnectableTransport,
  CredentialManifestStyles,
  DID,
  DWNTransport,
  IdentityPlainTextDataShareBehavior,
  OpenIDProtocol,
  VCShareDIDCommBehavior,
  VCShareDIDCommParams,
  VerifiableCredential,
  WACIProtocol,
  WebsocketClientTransport,
} from "@extrimian/agent";
import { IJWK, IKeyPair } from "@extrimian/kms-core";
import { NavigationProp } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import RNRestart from "react-native-restart";
import { create } from "zustand";
import agentConfig from "../config/agent";
import extraConfig from "../config/extra";
import i18n from "../locale";
import {
  CredentialDisplay,
  IEntities,
  INotification,
  IssuerData,
  NotificationType,
  SecureStorageType,
  StateType,
  StorageItemsType,
  StorageType,
  VerifiableCredentialWithInfo,
} from "../models";
import { SecureStorage } from "../storages/secure-storage";
import { Storage } from "../storages/storage";
import { AMISDKPlugin } from "@extrimian/ami-agent-plugin";
import { ChunkedEncoder, ContentType } from "@extrimian/ami-sdk";
import { ExtrimianVCAttachmentAgentPlugin } from "@extrimian/vc-attachments-agent-plugin";
import { AttachmentFileStorage } from "../storages/fs-storage";
import { SchedulableTriggerInputTypes } from "expo-notifications";

const applicationSecureStorage = new SecureStorage("application");
const applicationStorage = new Storage("application");

const agentSecureStorage = new SecureStorage("agent");
const agentStorage = new Storage("agent");
const vcStorage = new Storage("vc");
const waciStorage = new Storage("waci");
const openidStorage = new Storage("openid");

const amiMessageStorage = new Storage("amiMessage");
const amiMessageThreadStorage = new Storage("amiMessageThread");
const amiChatStorage = new Storage("amiChat");
const amiEncoder = new ChunkedEncoder(1024 * 64);

const attachmentPlugin = new ExtrimianVCAttachmentAgentPlugin({
  attachmentStorage: new AttachmentFileStorage(),
  fileAttachmentContextName: "",
});

export const amiPlugin = new AMISDKPlugin({
  messageIStorage: amiMessageStorage,
  messageThreadIStorage: amiMessageThreadStorage,
  chatIStorage: amiChatStorage,
  encoder: amiEncoder,
});

export const websocketTransport = new WebsocketClientTransport();
export const dwnTransport = new DWNTransport({ dwnPollMilliseconds: 10000 });

const initialStates = {
  state: StateType.STARTING,
  credentials: [],
  notifications: [],
  entities: [],
  navigation: null,
  isLoading: false, //esto era true,
  isConnected: false,
};

interface ApplicationStoreProps {
  // TO DO
  state: StateType;
  updateAvailableScreen: () => Promise<void>;
  credentialArrived: (data: {
    credentials: VerifiableCredentialWithInfo[];
    issuer: IssuerData;
    messageId: string;
  }) => Promise<void>;
  ackCompleted: (data: {
    status?: string;
    messageId: string;
    code?: string;
    codeMessage?: string;
  }) => Promise<void>;
  //
  agent: Agent;
  initialize: (navigation: NavigationProp<any>) => Promise<void>;
  processMessage: (message: any) => Promise<void>;
  sendMessage: (message: any) => Promise<void>;
  reset: () => Promise<void>;
  credentials: VerifiableCredentialWithInfo[];
  notifications: INotification[];
  entities: IEntities[];
  navigation: NavigationProp<any> | any;
  isLoading: boolean;
  isConnected: boolean;
  setIsConnected: (isConnected: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  did: {
    create: (
      didMethod: string,
      keysToImport?: {
        id: string;
        vmKey: any;
        publicKeyJWK: IJWK;
        secrets: IKeyPair;
      }[]
    ) => Promise<void>;
    import: (file: any) => Promise<void>;
    export: () => Promise<any>;
    current: () => Promise<DID>;
    confirm: () => Promise<void>;
  };
  credential: {
    remove: (id: string) => Promise<void>;
    get: (id: string) => Promise<VerifiableCredentialWithInfo>;
    add: (credential: VerifiableCredentialWithInfo) => Promise<void>;
    refresh: () => Promise<void>;
    export: () => Promise<any>;
    import: (importedData: string) => Promise<
      {
        data: VerifiableCredential<any>;
        styles: CredentialManifestStyles;
        display: CredentialDisplay;
      }[]
    >;
  };
  notification: {
    send: (type: NotificationType, extra?: any) => Promise<void>;
    remove: (id: string) => Promise<void>;
    add: (notification: INotification) => Promise<void>;
    read: (id: string) => Promise<void>;
  };
  pin: {
    set: (pin: string) => Promise<void>;
    authenticate: () => Promise<void>;
    validate: (pin: string) => Promise<boolean>;
  };
  introduction: {
    skip: () => Promise<void>;
  };
  tutorial: {
    skip: () => Promise<void>;
    get: () => Promise<boolean>;
  };
}
export const useApplicationStore = create<ApplicationStoreProps>(
  (set, get) => ({
    // Init states
    ...initialStates,
    // Actions
    initialize: async (navigation) => {
      
      try {
        const notifications: INotification[] =
          (await applicationStorage.get(StorageItemsType.NOTIFICATIONS)) || [];
        
        let data: IEntities[] = [];
        let entities: IEntities[] = extraConfig.initialEntities || [];

        try {
          const response = await fetch(agentConfig.entities);
          const json = await response.json();
          data = json.service;
          entities = data || extraConfig.initialEntities || [];
        } catch (error) {
          console.error(
            "⚠️ There has been a problem with your fetch operation: " +
              (error instanceof Error ? error.message : String(error))
          );
        }

        await get().agent.initialize();

      // Wrap agent.processMessage to catch any silent errors
      try {
        const originalProcessMessage = get().agent.processMessage.bind(get().agent);
        get().agent.processMessage = async function(params: any) {
          try {
            const result = await originalProcessMessage(params);
            return result;
          } catch (err: any) {
            console.error("❌ agent.processMessage ERROR:", err.message);
            console.error("❌ Error stack:", err.stack);
            throw err;
          }
        };
      } catch (err) {
        console.error("Could not wrap agent.processMessage:", err);
      }

      // Wrap agent.vc.deriveVC to debug selective disclosure
      try {
        const originalDeriveVC = get().agent.vc.deriveVC.bind(get().agent.vc);
        get().agent.vc.deriveVC = async function(params: any) {

          
          // Check if BBS+ keys exist in KMS
          try {
            const kms = get().agent.identity.kms;
            const bbsKeys = await kms.getPublicKeysBySuiteType("Bbsbls2020" as any);
            
            if (!bbsKeys || bbsKeys.length === 0) {

              const allKeys = await agentSecureStorage.getAll();
            }
          } catch (e: any) {
            console.error("⚠️ Could not check BBS+ keys:", e.message);
          }
          
          try {
            const result = await originalDeriveVC(params);
            return result;
          } catch (err: any) {
            console.error("❌ deriveVC FAILED:", err.message);
            throw err;
          }
        };
      } catch (err) {
        console.error("Could not wrap deriveVC:", err);
      }

      // Wrap getCredentialPresentation callback in WACI
      try {
        const waciProtocol = get().agent.vc.protocols.find(p => p.constructor.name === 'WACIProtocol');
        if (waciProtocol && (waciProtocol as any).waciInterpreter) {
          const interpreter = (waciProtocol as any).waciInterpreter;
          const holderCallbacks = (interpreter as any).enabledActors?.includes('holder') 
            ? require('@extrimian/waci/dist/callbacks').callbacks.holder 
            : null;
          
          if (holderCallbacks && holderCallbacks.getCredentialPresentation) {
            const originalGetCredPresentation = holderCallbacks.getCredentialPresentation;
            holderCallbacks.getCredentialPresentation = async function(params: any) {
              try {
                const result = await originalGetCredPresentation(params);
                return result;
              } catch (err: any) {
                console.error("❌ getCredentialPresentation FAILED:", err.message);
                throw err;
              }
            };
          }
        }
      } catch (err) {
          console.error("Could not wrap getCredentialPresentation:", err);
      }

      // Wrap WACI protocol processMessage to debug
      try {
        const waciProtocol = get().agent.vc.protocols.find(p => p.constructor.name === 'WACIProtocol');
        if (waciProtocol) {
          const originalProcessMessage = waciProtocol.processMessage.bind(waciProtocol);
          waciProtocol.processMessage = async function(message, context, did) {

            const result = await originalProcessMessage(message, context, did);
            return result;
          };
        } else {
          console.info("⚠️ WACI Protocol not found");
        }
      } catch (err) {
        console.error("Could not wrap WACI processMessage:", err);
      }

      // Wrap agent.messaging.sendMessage to add debug logging for outgoing DIDComm messages
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const messaging = get().agent.messaging;
        if (messaging && messaging.sendMessage) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const originalSend = messaging.sendMessage.bind(messaging);
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          messaging.sendMessage = async (params: any) => {
            try {
              console.info("📤📤📤 agent.messaging.sendMessage called! 📤📤📤");
              console.error("📤 Message type:", params?.message?.type);
              console.error("📤 Message ID:", params?.message?.id);
              console.error("📤 Full params:", JSON.stringify(params, null, 2));
            } catch (e) {
              console.error("Error logging message:", e);
            }
            const result = await originalSend(params);
            return result;
          };
          console.info("✅ Wrapped messaging.sendMessage for debugging");
        } else {
          console.info("⚠️ messaging.sendMessage not found");
        }
      } catch (err) {
        console.error("Could not wrap messaging.sendMessage for debug:", err);
      }

      // try {
      //   amiPlugin.amisdk.standardMessage.on((e) => {
      //     if (e && e.body && e.body.contentType == ContentType.PDF_UNSIGNED) {
      //       get().notification.send(NotificationType.PDF_ARRIVED, e);
      //     } else if (e && e.body && e.body.contentType == ContentType.TEXT) {
      //       get().notification.send(NotificationType.TEXT_ARRIVED, e);
      //     }
      //   });
      // } catch (err) {
      //   console.error("err: ", err);
      // }
      
      set(() => ({
        notifications,
        entities,
        navigation,
        isLoading: false,
      }));
      get().updateAvailableScreen();
      } catch (error) {
        console.error("❌ CRITICAL ERROR in useApplicationStore.initialize:", error);
        console.error("❌ Error stack:", error instanceof Error ? error.stack : String(error));
        throw error;
      }
    },
    setIsConnected: (isConnected) => set(() => ({ isConnected })),
    agent: new Agent({
      didDocumentRegistry: new AgentModenaUniversalRegistry(
        agentConfig.universalResolverUrl
      ),
      didDocumentResolver: new AgentModenaUniversalResolver(
        agentConfig.universalResolverUrl
      ),
      vcProtocols: [
        new WACIProtocol({
          holder: {
            credentialApplication: async (
              inputs,
              _,
              message,
              issuer,
              credentialsToReceive
            ) => {

              
              const transport = message?.id
                ? get().agent.transport.getTranportByMessageId(message.id)
                : undefined;

              const isConnectableTransport =
                transport instanceof ConnectableTransport;

              const alreadySeenNotifications = await applicationStorage.get(
                StorageItemsType.ALREADY_SEEN_NOTIFICATIONS
              );

              const isAlreadySeen =
                alreadySeenNotifications &&
                message &&
                alreadySeenNotifications.includes(message.id);

              if (isAlreadySeen) {
                await applicationStorage.add(
                  StorageItemsType.ALREADY_SEEN_NOTIFICATIONS,
                  alreadySeenNotifications.filter(
                    (id: string) => id !== message.id
                  )
                );
              }

              if (isConnectableTransport) {
                set(() => ({
                  isConnected: false,
                }));
              }

              if (isConnectableTransport || isAlreadySeen) {
                // Create promise that will resolve when user selects credentials
                const verifiableCredentials = await new Promise<
                  VerifiableCredential[]
                >((resolve, reject) => {
                  const presentCredentials = (
                    credentials: VerifiableCredential[]
                  ) => {

                    // Set isConnected exactly as in the original app
                    set(() => ({
                      isConnected: isConnectableTransport,
                    }));
                    
                    resolve(credentials);
                  };

                  get().navigation.navigate("PresentCredentials", {
                    inputs,
                    issuer,
                    credentialsToReceive,
                    resolve: presentCredentials,
                  });
                });


                
                return verifiableCredentials;
              } else {
                if (!alreadySeenNotifications) {
                  await applicationStorage.add(
                    StorageItemsType.ALREADY_SEEN_NOTIFICATIONS,
                    [message?.id]
                  );
                } else {
                  await applicationStorage.add(
                    StorageItemsType.ALREADY_SEEN_NOTIFICATIONS,
                    message && message.id
                      ? [...alreadySeenNotifications, message.id]
                      : [...alreadySeenNotifications]
                  );
                }

                get().notification.send(
                  credentialsToReceive
                    ? NotificationType.OFFER_CREDENTIAL
                    : NotificationType.REQUEST_PRESENTATION,
                  {
                    issuer,
                    message,
                  }
                );

                return new Promise<VerifiableCredential[]>(
                  (resolve, reject) => {}
                );
              }
            },
          },
          storage: waciStorage,
        }),
        // new OpenIDProtocol({
        //   storage: openidStorage,
        // }),
      ],
      agentPlugins: [/*amiPlugin, */attachmentPlugin],
      agentStorage,
      secureStorage: agentSecureStorage,
      vcStorage,
      supportedTransports: [websocketTransport],
    }),

    setIsLoading: (isLoading) => {
      set(() => ({ isLoading }));
    },
    credentialArrived: async ({ credentials, issuer, messageId }) => {
      const transport = get().agent.transport.getTranportByMessageId(messageId);
      const isConnectableTransport = transport instanceof ConnectableTransport;

      if (isConnectableTransport) {
        set(() => ({
          isConnected: false,
        }));
        setTimeout(() => {
          websocketTransport.dispose();
        }, 3000);
        get().navigation.navigate("AcceptCredentials", {
          credentials,
          issuer,
        });
      } else {
        get().notification.send(NotificationType.ISSUE_CREDENTIAL, {
          credentials,
          issuer,
        });
      }
    },
    ackCompleted: async ({ status, messageId, code, codeMessage }) => {

      
      const transport = get().agent.transport.getTranportByMessageId(messageId);
      const isConnectableTransport = transport instanceof ConnectableTransport;
      
      console.log("   isConnectableTransport:", isConnectableTransport);

      if (isConnectableTransport) {
        set(() => ({
          isConnected: false,
        }));
        websocketTransport.dispose();
        console.log("🚀 Navigating to VerificationResult with:", status)
        if (status) {
          get().navigation.navigate("VerificationResult", {
            data: { status },
          });
        } else {
          get().navigation.navigate("VerificationResult", {
            data: { code, codeMessage },
          });
        }
      } else {
        console.log("   Sending notification instead of navigating");
        get().notification.send(NotificationType.PRESENTATION_ACK, {
          status,
          code,
        });
      }
    },
    updateAvailableScreen: async () => {
      console.log("=== DEBUGGING NAVIGATION ===");
      console.log("Navigation object:", get().navigation);
      console.log("Navigation available?", !!get().navigation);

      // if (get().navigation) {
      //   console.log("🚀 Attempting to navigate to DidStack -> CreateDid");
      //   get().navigation.navigate("DidStack", { screen: "CreateDid" });
      //   console.log("✅ Navigation call completed");
      // } else {
      //   console.log("❌ Navigation object is null/undefined");
      // }

      // ==============================


      console.log(get().state, "STATE");
      if (get().state === StateType.STARTING) {
        if (await applicationSecureStorage.get(SecureStorageType.PIN)) {
          set(() => ({ state: StateType.UNAUTHENTICATED }));
          get().navigation.navigate("Authenticate");
        } else {
          set(() => ({ state: StateType.NO_PIN }));
          get().navigation.navigate("PinStack");
        }
      } else if (get().state === StateType.AUTHENTICATED) {
        // if (!(await applicationStorage.get(StorageType.INTRODUCTION))) {
        //     get().navigation.navigate('Introduction');
        // } else
        if (!(await applicationStorage.get(StorageType.WITH_DID))) {
          get().navigation.navigate("DidStack", { screen: "CreateDid" }); // Comentar para ir a otra Pag
          // get().navigation.navigate("MainStack", { screen: "TabStack" });
        }
        // else if (!(await applicationStorage.get(StorageType.CONFIRMED_DID))) {
        //     get().navigation.navigate('DidStack', { screen: 'ConfirmDid' });
        // }
        else {
          //get().navigation.navigate('MainStack')
          // , {
          //     screen: 'TabStack',
          //     // params: {
          //     //     tutorial: !(await applicationStorage.get(StorageType.TUTORIAL)),
          //     // },
          // });

          get().navigation.reset({
            index: 0,
            routes: [
              {
                name: "MainStack",
                params: {
                  tutorial: !(await applicationStorage.get(
                    StorageType.TUTORIAL
                  )),
                },
              },
            ],
          });
        }
      }
    },

    did: {
      create: async (didMethod, keysToImport) => {
        try {
          console.log("🚀 Starting DID creation with method:", didMethod);
          
          if (keysToImport && keysToImport.length > 0) {
            console.log("🔑 Keys to import:", keysToImport.length);
            for (const key of keysToImport) {
              console.log("🔑 Key details:", {
                id: key.id,
                vmKey: key.vmKey,
                hasPublicKey: !!key.publicKeyJWK,
                hasSecrets: !!key.secrets,
                hasPrivateKey: !!(key.secrets?.privateKey)
              });
            }
          }

          // El agente manejará internamente el almacenamiento de las claves en el KMS
          console.log("📝 Creating DID with configuration:", {
            dwnUrl: agentConfig.dwnUrl,
            didMethod,
            keysToImport: keysToImport?.length || 0,
            keysToCreate: ["didcomm"]
          });
          
          await get().agent.identity.createNewDID({
            dwnUrl: agentConfig.dwnUrl,
            preventCredentialCreation: true,
            didMethod,
            keysToImport,
            // keysToCreate: [
            //   { id: 'didcomm', vmKey: 1 }, // VMKey.DIDComm - para mensajería
            //   { id: 'auth', vmKey: 0 },    // VMKey.Authentication - para autenticación
            //   { id: 'rsa', vmKey: 3 },     // VMKey.RSA - para firmar presentaciones
            // ]
          });
          
          const did = get().agent.identity.getOperationalDID();
          console.log("✅ DID created successfully:", did.value);

          // Verificar que las claves estén en el KMS
          try {
            const kms = get().agent.identity.kms;
            console.log("🔍 Verifying KMS has keys...");
            
            // Intentar obtener todas las claves BBS+
            const bbsKeys = await kms.getPublicKeysBySuiteType("Bbsbls2020" as any);
            console.log("🔑 BBS+ keys in KMS:", bbsKeys?.length || 0);
            
            if (bbsKeys && bbsKeys.length > 0) {
              for (let i = 0; i < bbsKeys.length; i++) {
                console.log(`  📌 BBS+ Key ${i + 1}:`, {
                  kty: bbsKeys[i].kty,
                  crv: bbsKeys[i].crv,
                  hasX: !!bbsKeys[i].x,
                  hasY: !!bbsKeys[i].y,
                });
              }
            }
            
            // Intentar obtener claves Ed25519 para DIDComm
            try {
              const ed25519Keys = await kms.getPublicKeysBySuiteType("Ed255192018" as any);
              console.log("🔑 Ed25519 keys in KMS:", ed25519Keys?.length || 0);
              
              if (ed25519Keys && ed25519Keys.length > 0) {
                for (let i = 0; i < ed25519Keys.length; i++) {
                  console.log(`  📌 Ed25519 Key ${i + 1}:`, {
                    kty: ed25519Keys[i].kty,
                    crv: ed25519Keys[i].crv,
                    hasX: !!ed25519Keys[i].x,
                  });
                }
              }
            } catch (e) {
              console.log("⚠️ Could not get Ed25519 keys");
            }
            
            // Verificar el secure storage
            const allSecureItems = await agentSecureStorage.getAll();
            console.log("🔐 Items in agentSecureStorage:", allSecureItems.size);
            const storageKeys = Array.from(allSecureItems.keys());
            console.log("🔐 Storage keys:", storageKeys);
            
            // Verificar el DID Document
            const didDocument = await get().agent.resolver.resolve(did);
            console.log("📄 DID Document verification methods:", didDocument.verificationMethod?.length || 0);
            if (didDocument.verificationMethod) {
              for (const vm of didDocument.verificationMethod) {
                console.log(`  📌 VM: ${vm.id}`, {
                  type: vm.type,
                  controller: vm.controller,
                });
              }
            }
          } catch (e: any) {
            console.log("⚠️ Could not verify KMS keys:", e.message);
          }

          await applicationStorage.add(StorageType.WITH_DID, true);
          await get().updateAvailableScreen();
        } catch (error) {
          console.log(error);
          throw error;
        }
      },
      import: async (file) => {
        await get().agent.identity.importKeys({
          exportResult: file,
          exportBehavior: new IdentityPlainTextDataShareBehavior(),
        });
        const did = get().agent.identity.getOperationalDID();
        console.log("DID imported:", did.value);
        await applicationStorage.add(StorageType.WITH_DID, true);
        await get().updateAvailableScreen();
      },
      export: async () => {
        const exportedKeys = await get().agent.identity.exportKeys({
          exportBehavior: new IdentityPlainTextDataShareBehavior(),
        });
        return exportedKeys;
      },
      current: async () => {
        return get().agent.identity.getOperationalDID();
      },
      confirm: async () => {
        await applicationStorage.add(StorageType.CONFIRMED_DID, true);
        await get().updateAvailableScreen();
      },
    },

    credential: {
      add: async (credential: VerifiableCredentialWithInfo) => {
        await get().agent.vc.saveCredentialWithInfo(credential.data, {
          display: credential.display,
          styles: credential.styles,
        });
        set((state) => {
          const allCreds = [...state.credentials];
          const exist = allCreds.some(
            (cred) => cred.data.id === credential.data.id
          );
          if (!exist) allCreds.push(credential);

          return { credentials: [...allCreds] };
        });
      },
      remove: async (id: string) => {
        await get().agent.vc.removeCredential(id);
        set((state) => ({
          credentials: state.credentials.filter(
            (credential) => credential.data.id !== id
          ),
        }));
      },
      get: async (id: string) => {
        const credential = get().credentials.find(({ data }) => data.id === id);
        if (!credential) {
          throw new Error(`Credential with id ${id} not found`);
        }
        return credential;
      },
      refresh: async () => {
        const credentials =
          await get().agent.vc.getVerifiableCredentialsWithInfo();

        set(() => ({ credentials }));
      },
      
      export: async () => {
        return new Promise((resolve, reject) => {
          resolve([]);
        })
        // const agentVcs =
        //   await get().agent.vc.getVerifiableCredentialsWithInfo();
        // const agentDID = get().agent.identity.getOperationalDID();
        // if (!agentVcs || !agentDID) {
        //   throw new Error("No credentials found");
        // }
        // const exportedVcs = await get().agent.vc.exportCredentials({
        //   did: agentDID,
        //   behavior: new VCShareDIDCommBehavior({ agent: get().agent }),
        // });

        // return exportedVcs;
      },

      import: async (importedData: string) => {
        // return [];
        const importParams: VCShareDIDCommParams = JSON.parse(importedData);
        await get().agent.vc.importCredentials({
          behavior: new VCShareDIDCommBehavior({ agent: get().agent }),
          exportParams: importParams,
        });
        const agentVcs =
          await get().agent.vc.getVerifiableCredentialsWithInfo();

        if (!agentVcs) {
          throw new Error("No credentials found");
        }
        set(() => ({ credentials: agentVcs }));

        return agentVcs;
      },
    },

    notification: {
      remove: async (id: string) => {
        let notifications: INotification[] = get().notifications || [];
        notifications = notifications.filter(
          (notification) => notification.id != id
        );
        await applicationStorage.add(
          StorageItemsType.NOTIFICATIONS,
          notifications
        );
        set(() => ({ notifications }));
      },
      add: async (notification: INotification) => {
        let notifications: INotification[] = get().notifications || [];
        notifications = [notification, ...notifications];
        await applicationStorage.add(
          StorageItemsType.NOTIFICATIONS,
          notifications
        );
        set(() => ({ notifications }));
      },
      read: async (id: string) => {
        let notifications: INotification[] = get().notifications || [];
        notifications = notifications.map((notification) => {
          if (notification.id === id) {
            notification.read = true;

            switch (notification.type) {
              case NotificationType.ISSUE_CREDENTIAL:
                get().navigation.navigate("AcceptCredentials", {
                  credentials: notification.extra.credentials,
                  issuer: notification.extra.issuer,
                });
                break;
              case NotificationType.PRESENTATION_ACK:
                get().navigation.navigate("VerificationResult", {
                  data: {
                    status: notification.extra.status,
                    code: notification.extra.code,
                  },
                });
                break;
              case NotificationType.PDF_ARRIVED:
                var acceptHandler = async () => {
                  const amiMessage = await amiPlugin.amisdk.createAckMessage(
                    notification.extra.did,
                    notification.extra.thid
                  );
                  get().sendMessage({
                    to: DID.from(notification.extra.did),
                    message: amiMessage,
                    preferredTransport: dwnTransport,
                  });
                  get().navigation.goBack();
                };
                var declineHandler = async () => {
                  const amiMessage = await amiPlugin.amisdk.createProblemReport(
                    notification.extra.did,
                    notification.extra.thid,
                    { code: "rejected", comment: "not confirmed" }
                  );
                  get().sendMessage({
                    to: DID.from(notification.extra.did),
                    message: amiMessage,
                    preferredTransport: dwnTransport,
                  });
                  get().navigation.goBack();
                };
                amiPlugin.amisdk
                  .decodeFileMessageBody(notification.extra.body)
                  .then((array) => {
                    return amiEncoder.encodeUint8ArrayToBase64(array);
                  })
                  .then((data) => {
                    get().navigation.navigate("PDFDetails", {
                      data: {
                        did: notification.extra.did,
                        thid: notification.extra.thid,
                        id: notification.id,
                        data: data,
                        acceptHandler,
                        declineHandler,
                        pdf: true,
                      },
                    });
                  });
                break;
              case NotificationType.TEXT_ARRIVED:
                var acceptHandler = async () => {
                  const amiMessage = await amiPlugin.amisdk.createAckMessage(
                    notification.extra.did,
                    notification.extra.thid
                  );
                  get().sendMessage({
                    to: DID.from(notification.extra.did),
                    message: amiMessage,
                    preferredTransport: dwnTransport,
                  });
                  get().navigation.goBack();
                };
                var declineHandler = async () => {
                  const amiMessage = await amiPlugin.amisdk.createProblemReport(
                    notification.extra.did,
                    notification.extra.thid,
                    { code: "rejected", comment: "not confirmed" }
                  );
                  get().sendMessage({
                    to: DID.from(notification.extra.did),
                    message: amiMessage,
                    preferredTransport: dwnTransport,
                  });
                  get().navigation.goBack();
                };
                get().navigation.navigate("PDFDetails", {
                  data: {
                    did: notification.extra.did,
                    thid: notification.extra.thid,
                    id: notification.id,
                    data: notification.extra.body.data,
                    acceptHandler,
                    declineHandler,
                    pdf: false,
                  },
                });
                break;
              default:
                break;
            }
          }

          return notification;
        });

        await applicationStorage.add(
          StorageItemsType.NOTIFICATIONS,
          notifications
        );
        set(() => ({ notifications }));
      },
      send: async (type, extra) => {
        let data = {
          type,
          id: Date.now().toString(),
          read: false,
          extra,
        } as INotification;
        switch (type) {
          case NotificationType.PRESENTATION_ACK:
            if (extra.status) {
              data = {
                ...data,
                title: "notifications." + type + ".titleOk",
                body: "notifications." + type + ".bodyOk",
              };
            } else {
              data = {
                ...data,
                title: "notifications." + type + ".titleFail",
                body: "notifications." + type + ".bodyFail",
              };
            }
            break;
          default:
            data = {
              ...data,
              title: "notifications." + type + ".title",
              body: "notifications." + type + ".body",
            };
            break;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: i18n.t(data.title),
            body: i18n.t(data.body),
          },
          trigger: {
            seconds: 2,
            type: SchedulableTriggerInputTypes.TIME_INTERVAL,
          }
        });

        let notifications: INotification[] = get().notifications || [];
        notifications = [data, ...notifications];
        await applicationStorage.add(
          StorageItemsType.NOTIFICATIONS,
          notifications
        );
        set(() => ({ notifications }));
      },
    },

    pin: {
      set: async (pin: string) => {
        await applicationSecureStorage.add(SecureStorageType.PIN, pin);
        set(() => ({
          state: StateType.AUTHENTICATED,
        }));
        await get().updateAvailableScreen();
      },
      authenticate: async () => {
        set(() => ({
          state: StateType.AUTHENTICATED,
        }));
        await get().updateAvailableScreen();
      },
      validate: async (pin: string) => {
        return (
          pin === (await applicationSecureStorage.get(SecureStorageType.PIN))
        );
      },
    },

    introduction: {
      skip: async () => {
        await applicationStorage.add(StorageType.INTRODUCTION, true);
        await get().updateAvailableScreen();
      },
    },

    tutorial: {
      skip: async () => {
        await applicationStorage.add(StorageType.TUTORIAL, true);
      },
      get: async () => {
        return (await applicationStorage.get(StorageType.TUTORIAL)) == null;
      },
    },

    // processMessage: async (message: any) => {
    //   try {
    //     console.log("📦 Vine processMessage del QR...");
        
    //     // ✅ Recuperar TODAS las llaves del SecureStorage
    //     const allKeys = await agentSecureStorage.getAll();
    //     console.log("🔑 Total keys in secure storage:", allKeys.size);
    //     console.log("🔑 Key IDs:", Array.from(allKeys.keys()));
        
    //     // ✅ Buscar específicamente las llaves BBS+
    //     let bbsKeyFound = false;
    //     for (const [keyId, keyValue] of allKeys.entries()) {
    //       console.log("✅ Found BBS+ key in storage:", keyId);
    //       console.log("🔑 BBS+ key data:", keyValue);
    //       bbsKeyFound = true;
    //       console.log("🔐 bbsKeyFound", bbsKeyFound);
    //       // Verificar que tenga los datos necesarios
    //       if (keyValue.secrets && keyValue.secrets.privateKey) {
    //         console.log("✅ Private key exists in storage");
    //       } else {
    //         console.log("❌ Private key MISSING in storage!");
    //       }
    //     }
        
    //     if (!bbsKeyFound) {
    //       console.log("❌ NO BBS+ keys found in secure storage!");
    //     }
        
    //     // Procesar el mensaje normalmente
    //     console.log("📨 Processing message with agent...");
    //     await get().agent.processMessage(message);
    //     console.log("✅ Message processed successfully");
        
    //   } catch (error: any) {
    //     console.error("❌ Error processing message:", error);
    //     console.error("❌ Error details:", error.message);
    //     throw error;
    //   }
    // },

    processMessage: async (message: any) => {
      if (!get().agent) {
        console.log('❌ No agent available');
        return;
      }

      if (!message) {
        console.log('❌ No message to process');
        return;
      }
      
      console.log("=== 📨 Processing Incoming Message ===");
      console.log('Message preview:', typeof message === 'string' ? message.substring(0, 100) : 'Object message');

      try {
        const operationalDID = get().agent.identity.getOperationalDID();
        console.log("🔍 Current operational DID:", operationalDID?.value || "None");
        
        // Verificar que el DID tenga claves en el KMS
        const allDIDs = get().agent.identity.getDIDs();
        console.log("📁 All DIDs in agent:", allDIDs);
        
        // Process the message - this will trigger events if it's a valid DIDComm message
        await get().agent.processMessage({
          message
        });
        
        console.log('✅ Message processed successfully');
      } catch (error: any) {
        console.error('❌ Error processing message:', error.message);
        console.error('❌ Full error:', error);
        console.error('❌ Error stack:', error.stack);
        throw error; // Re-throw para que Scan.tsx pueda manejarlo
      }
    },

    sendMessage: async (params: any) => {
      await get().agent.messaging.sendMessage(params);
    },

    reset: async () => {
      console.log("Resetting");
      await Promise.allSettled([
        applicationSecureStorage.clear(),
        agentSecureStorage.clear(),
        applicationStorage.clear(),
      ]);
      RNRestart.Restart();
    },
  })
);

