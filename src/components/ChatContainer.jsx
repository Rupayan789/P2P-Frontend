import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import { database } from "../utils/firebase.utils";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/user/user.selector";
import {
  equalTo,
  onValue,
  orderByChild,
  query,
  ref,
  set,
} from "firebase/database";

export default function ChatContainer({
  currentChat,
  socket,
  handleMessageStatus,
}) {
  const [messages, setMessages] = useState([]);
  const currentUser = useSelector(selectCurrentUser);
  const scrollRef = useRef();

  useEffect(() => {

    (async () => {
      try {
        const room =
          currentUser.uid > currentChat.uid
            ? `${currentChat.uid}-${currentUser.uid}`
            : `${currentUser.uid}-${currentChat.uid}`;
        const dbRef = query(
          ref(database, "messages"),
          orderByChild("room"),
          equalTo(room)
        );
        onValue(
          dbRef,
          (snapshot) => {
            var filteredDocuments = [];
            snapshot.forEach((childSnapshot) => {
              const document = childSnapshot.val();
              filteredDocuments.push(document);
            });
            filteredDocuments.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
            setMessages([...filteredDocuments]);
          },
          {
            onlyOnce: true,
          }
        );
      } catch (err) {
        console.log(err);
      }
    })();
  }, [currentChat]);

  const handleSendMsg = async (msg) => {
    const wholeMsg = {
      id: uuidv4(),
      from: currentUser.uid,
      to: currentChat.uid,
      status: handleMessageStatus(currentChat.uid),
      msg: msg,
      createdAt: Date.now(),
      room:
        currentUser.uid > currentChat.uid
          ? `${currentChat.uid}-${currentUser.uid}`
          : `${currentUser.uid}-${currentChat.uid}`,
    };
    setMessages([...messages, wholeMsg]);
    socket.current.emit("send-msg", wholeMsg);
    const messageRef = ref(database, "messages/" + wholeMsg.id);
    await set(messageRef, wholeMsg);
  };

  useEffect(() => {
    const localSocket = socket.current;
    const room =
      currentUser?.uid > currentChat?.uid
        ? `${currentChat?.uid}-${currentUser?.uid}`
        : `${currentUser?.uid}-${currentChat?.uid}`;
    if (socket.current) {
      socket.current.on("msg-receive", (data) => {
        if (data.room === room) {
          setMessages((messages) => [...messages, data]);
          socket.current.emit("msg-receive-ack", data);
        }
      });
      socket.current.on("msg-send-ack", (data) => {
        setMessages((messages) => {
          return messages.map((message) => {
            if (message?.id === data?.id) {
              message.status = "Seen";
            }
            return message;
          });
        });
      });
      socket.current.on("message-seen-ack", (data) => {
        const room =
          currentUser?.uid > currentChat?.uid
            ? `${currentChat?.uid}-${currentUser?.uid}`
            : `${currentUser?.uid}-${currentChat?.uid}`;
        setMessages((messages) =>
          messages.filter((message) => {
            if (message.room !== room) return false;
            if (
              message?.createdAt <= data?.lastSeen &&
              message.to === currentChat?.uid &&
              message.status !== "Seen"
            ) {
              message.status = "Seen";
            }
            return true;
          })
        );
      });
      return ()=>{
        localSocket.off("msg-receive");
        localSocket.off("msg-send-ack");
        localSocket.off("message-seen-ack");

      }
    }
  }, [currentChat, currentUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat?.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat?.username}</h3>
          </div>
        </div>
        <Logout />
      </div>
      <div className="chat-messages">
        {messages?.map((message) => {
          return (
            <div ref={scrollRef} key={uuidv4()}>
              <div
                className={`message ${
                  message?.from === currentUser?.uid ? "sended" : "recieved"
                }`}
              >
                <div className="content">
                  <p>
                    {message?.msg}{" "}
                    {message?.from === currentUser?.uid && (
                      <i
                        style={{
                          color:
                            message.status === "Seen"
                              ? "blue"
                              : message.status === "Delivered"
                              ? "yellow"
                              : "grey",
                        }}
                        id="tick"
                        class="fi fi-br-check"
                      ></i>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      #tick {
        margin-left: 10px;
        font-size: 10px;
      }
      .content {
        display: flex;
        align-items: middle;
        justify-content: space-between;
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;
