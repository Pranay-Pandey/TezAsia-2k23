import React, { useState } from 'react'; // Added React import

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
    Avatar, ConversationHeader, MainContainer, ChatContainer,
    MessageList, Message, MessageInput, TypingIndicator, MessageSeparator
} from '@chatscope/chat-ui-kit-react';

const API_KEY = import.meta.env.VITE_API_KEY;

const systemMessage = {
    "role": "system", "content": `Explain things like you would
be a health professional with 5 years of experience and can help emotionally and mentally to 
people of all ages. Do not answer any questions strictly which include anything other than health.`
}

function Chatbot() {
    const [collapsed, setCollapsed] = useState(true);
    const [messages, setMessages] = useState([
        {
            message: "Hello, I'm your health guide! Ask me anything!",
            sentTime: "just now",
            sender: "ChatGPT"
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);

    const toggleChatbot = () => {
        setCollapsed(!collapsed);
    };

    const handleSend = async (message) => {
        const newMessage = {
            message,
            direction: 'outgoing',
            sender: "user"
        };

        const newMessages = [...messages, newMessage];

        setMessages(newMessages as any);

        setIsTyping(true);
        await processMessageToChatGPT(newMessages);
    };

    async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
        // Format messages for chatGPT API
        // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
        // So we need to reformat

        let apiMessages = chatMessages.map((messageObject) => {
            let role = "";
            if (messageObject.sender === "ChatGPT") {
                role = "assistant";
            } else {
                role = "user";
            }
            return { role: role, content: messageObject.message.concat(" .Answer only if it is a destination and travel-related, otherwise strictly do not answer if related to dance,music and culture.") }
        });


        // Get the request body set up with the model we plan to use
        // and the messages which we formatted above. We add a system message in the front to'
        // determine how we want chatGPT to act. 
        const apiRequestBody = {
            "model": "gpt-3.5-turbo",
            "messages": [
                systemMessage,  // The system message DEFINES the logic of our chatGPT
                ...apiMessages // The messages from our chat with ChatGPT
            ],
        }

        await fetch("https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + API_KEY,
                    // "Organization": "",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(apiRequestBody)
            }).then((data) => {
                return data.json();
            }).then((data) => {
                console.log(data);
                setMessages([...chatMessages, {
                    message: data.choices[0].message.content,
                    sender: "ChatGPT"
                }]);
                setIsTyping(false);
            });
    }

    return (
        <div style={{ zIndex: 10 }}>
            {collapsed ? (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        cursor: 'pointer',
                    }}
                    onClick={toggleChatbot}
                >
                    <div
                        style={{
                            backgroundColor: '#00008b',
                            color: 'white',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <span>Chat</span>
                    </div>
                </div>
            ) : (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '50px',
                        right: '50px',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            height: '400px',
                            width: '400px',
                        }}
                    >
                        <MainContainer responsive>
                            <ChatContainer>
                                <ConversationHeader>
                                    <ConversationHeader.Content>
                                        <span
                                            style={{
                                                color: "#00008b",
                                                fontWeight: 600,
                                                textAlign: 'center',
                                                display: 'inline-block',
                                            }}
                                        >
                                            &nbsp; &nbsp;Health-Assistance Bot
                                        
                                        <span
                                            style={{
                                                cursor: 'pointer',
                                                float: 'right',
                                                color: 'red', // You can adjust the color as needed
                                            }}
                                            onClick={toggleChatbot}
                                        >
                                            X
                                        </span>
                                        </span>
                                    </ConversationHeader.Content>
                                </ConversationHeader>
                                <MessageList
                                    scrollBehavior="smooth"
                                    typingIndicator={isTyping ? <TypingIndicator content="Chatbot is typing" /> : null}
                                >
                                    {messages.map((message, i) => (
                                        <React.Fragment key={i}>
                                            <Message model={message as any} />
                                            <MessageSeparator />
                                        </React.Fragment>
                                    ))}
                                </MessageList>
                                <MessageInput attachButton={false} placeholder="Type query here" onSend={handleSend} />
                            </ChatContainer>
                        </MainContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Chatbot;