import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import styled from "styled-components";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import { useDispatch, useSelector } from "react-redux";
import { selectUsers, selectCurrentUser } from "../redux/user/user.selector";
import { fetchAllUsersStart } from "../redux/user/user.action";
import { database } from "../utils/firebase.utils";
import {
  equalTo,
  onValue,
  orderByChild,
  query,
  ref,
  update,
} from "firebase/database";
import { BASEURL } from "../utils/baseurl";

let intervalId = null;

export default function Chat() {
  const navigate = useNavigate();
  const socket = useRef();
  const dispatch = useDispatch();
  const [currentChat, setCurrentChat] = useState(undefined);
  const currentUser = useSelector(selectCurrentUser);
  const users = useSelector(selectUsers);
  const [contacts, setContacts] = useState([]);
  const [onlineUsersState, setOnlineUsersState] = useState({});

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  });

  useEffect(() => {
    dispatch(fetchAllUsersStart());
  }, []);
  useEffect(() => {
    if (users.length > 0) {
      setContacts(() =>
        users?.map((activeUser) => ({ ...activeUser, count: 0 }))
      );
    }
  }, [users]);

  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (socket?.current) {
      intervalId = setInterval(() => {
        socket.current.emit("check-user-session", currentUser?.uid);
      }, 20000);
    }
    return () => {
      clearInterval(intervalId);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket.current?.connected) {
      socket.current = io(BASEURL);
      socket.current.emit("add-user", currentUser?.uid);
      socket.current.on("msg-receive", (data) => {
        setContacts((contacts) =>
          contacts.map((contact) => {
            if (contact?.uid === data.from && data.from !== currentChat?.uid) {
              contact.count = contact.count + 1;
            }
            return contact;
          })
        );
      });
      socket.current.on("set-user-session", (onlineUsers) => {
        const updatedContacts = users;
        setOnlineUsersState(onlineUsers);
        updatedContacts.forEach((contact) => {
          if (onlineUsers[contact.uid]) {
            contact.status = "Online";
          } else {
            contact.status = "Offline";
          }
        });
        setContacts((contacts) => [...updatedContacts]);
      });
    }
    return () => {
      socket.current.off("msg-receive");
      socket.current.off("set-user-session");
      socket.current.close();
    };
  }, [socket]);

  const handleMessageStatus = (uid) => {
    if (onlineUsersState[uid]) return "Delivered";
    else return "Sent";
  };

  const handleChatChange = async (chat) => {
    setCurrentChat(chat);
    const messageRef = ref(database, "messages");
    const room =
      currentUser?.uid > chat?.uid
        ? `${chat?.uid}-${currentUser?.uid}`
        : `${currentUser?.uid}-${chat?.uid}`;

    const roomRef = await query(
      messageRef,
      orderByChild("room"),
      equalTo(room)
    );
    onValue(
      roomRef,
      async (snapshot) => {
        const updates = {};
        snapshot.forEach((childSnapshot) => {
          const document = childSnapshot.val();
          if (document.to === currentUser.uid && document.status !== "Seen") {
            updates[childSnapshot.key + "/status"] = "Seen";
          }
        });
        await update(messageRef, updates);
        socket.current.emit("message-seen", {
          room: room,
          from: chat?.uid,
          to: currentUser?.uid,
          lastSeen: Date.now(),
        });
      },
      {
        onlyOnce: true,
      }
    );
  };
  return (
    <>
      <Container>
        <div className="container">
          <Contacts contacts={contacts} changeChat={handleChatChange} />
          {false ? (
            <Welcome />
          ) : (
            <ChatContainer
              currentChat={currentChat}
              socket={socket}
              handleMessageStatus={handleMessageStatus}
            />
          )}
        </div>
      </Container>
    </>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
