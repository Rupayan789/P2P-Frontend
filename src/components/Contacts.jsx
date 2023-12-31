import React, { useState } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../redux/user/user.selector";

export default function Contacts({ contacts, changeChat }) {
  const currentUser = useSelector(selectCurrentUser)
  const [currentSelected, setCurrentSelected] = useState(undefined);
  // useEffect(async () => {
  //   const data = await JSON.parse(
  //     localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
  //   );
  //   setCurrentUserName(data.username);
  //   setCurrentUserImage(data.avatarImage);
  // }, []);
  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };
  return (
    <>
      {(
        <Container>
          <div className="brand">
            <img src={Logo} alt="logo" />
            <h3>P2P-CHAT</h3>
          </div>
          <div className="contacts">
            {contacts.map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                  
                  <div className="count"> 
                    <h4 style={{color:contact.status==="Online"?"green":"grey"}}>{contact?.status}</h4>
                    <h4>{contact?.count>0 ? contact.count : ""}</h4>
                    
                  </div>
                </div>
              );
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
            </div>
            <div className="username">
              <h2>{currentUser?.username || "Username"}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
}
const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      justify-content:space-between;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .count{
        color:orange;

      }
      .username {
        h3 {
          padding-left:10px;
          color: white;
        }
      }
    }
    .selected {
      background-color: #9a86f3;
    }
  }

  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;
