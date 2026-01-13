import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { shallow } from 'zustand/shallow';
import Loading from '../components/Loading';
import { NotificationType } from '../models';
import { useApplicationStore, websocketTransport } from './useApplicationStore';

const initialState = {};

const Context = createContext(initialState);

export const AppProvider = ({ children }) => {
    const navigation = useNavigation();

    // Usar un selector más específico para evitar re-renders innecesarios
    const isLoading = useApplicationStore((state) => state.isLoading);
    const agent = useApplicationStore((state) => state.agent);
    const isConnected = useApplicationStore((state) => state.isConnected);
    const notification = useApplicationStore((state) => state.notification);
    const credential = useApplicationStore((state) => state.credential);
    
    
    // Acciones
    const setIsConnected = useApplicationStore((state) => state.setIsConnected);
    const credentialArrived = useApplicationStore((state) => state.credentialArrived);
    const ackCompleted = useApplicationStore((state) => state.ackCompleted);
    const initialize = useApplicationStore((state) => state.initialize);
    const processMessage = useApplicationStore((state) => state.processMessage);

    useEffect(() => {
        // Function initialize the app
        const initializeStores = async () => {
            try {
                await initialize(navigation);
            } catch (error) {
                console.error("❌ AppProvider: Initialization error:", error);
            }
        };

        // Function to handle credential arrived
        const handleCredentialArrived = (data) => {
            credentialArrived(data);
        };

        const handleAckCompleted = (data) => {
            ackCompleted(data);
        };
        const handleProblemReport  = (data) => { 
            ackCompleted(data)
        } 
        const handleAuthenticate = () => {
            ackCompleted({ status: 'OK' });
        };

        const handleConnect = (e) => {
            setIsConnected(true);
        };

        const handleDisconnect = (e) => {
            setIsConnected(false);
        };

        // Function to get initial url
        const getInitialUrl = async (url) => {
            const message = url || (await Linking.getInitialURL());
            if (url && Platform.OS === 'ios') WebBrowser.dismissBrowser();
            if (message) processMessage({ message });
        };

        // Function to handle linking url
        const handleLinkingUrl = ({ url }) => {
            getInitialUrl(url);
        };

        // Function to initialize events
        const initializeEvents = async () => {
            getInitialUrl();
            credential.refresh();
            const linking = Linking.addEventListener('url', handleLinkingUrl);
            agent.vc.credentialArrived.on(handleCredentialArrived);
            agent.vc.ackCompleted.on(handleAckCompleted);
            agent.vc.problemReport.on(handleProblemReport);
            agent.transport.connected.on(handleConnect);
            agent.transport.disconnected.on(handleDisconnect);
            // oneClickPlugin.problemReport.on(handleProblemReport);
            // oneClickPlugin.userLoggedIn.on(handleAuthenticate);

            return () => {
                linking.remove();
                agent.vc.credentialArrived.off(handleCredentialArrived);
                agent.vc.ackCompleted.off(handleAckCompleted);
                agent.vc.problemReport.off(handleProblemReport);
                // oneClickPlugin.problemReport.off(handleProblemReport);
                // oneClickPlugin.userLoggedIn.off(handleAuthenticate);
                agent.transport.connected.off(handleConnect);
                agent.transport.disconnected.off(handleDisconnect);
            };
        };

        const notifyCreation = async () => {
            await notification.send(NotificationType.DID_CREATED);
        };

        // Function to handle identity created
        const handleIdentityCreated = () => {
            agent.identity.operationalDIDChanged.on(initializeEvents);
            agent.identity.didCreated.on(notifyCreation);
            return () => {
                agent.identity.operationalDIDChanged.off(initializeEvents);
                agent.identity.didCreated.off(notifyCreation);
            };
        };

        // Initialize stores
        initializeStores();

        // Initialize events
        agent.identity.identityInitialized.on(() => {
            agent.identity.getOperationalDID() ? initializeEvents() : handleIdentityCreated();
        });

        return () => {
            agent.identity.identityInitialized.off();
        };
    }, []);


    return (
        <Context.Provider value={{}}>
            {isLoading && <Loading />}
            {isConnected && (
                <Loading
                    closeConnection={() => {
                        setIsConnected(false);
                        websocketTransport.dispose();
                    }}
                />
            )}
            {children}
        </Context.Provider>
    );
};

export const useAppProvider = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error('useAppProvider must be used within a AppProvider');
    }
    return context;
};
