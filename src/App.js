import logo from './logo.svg';
import React, { useState, useRef } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCE4ZUyGd_rnwHG0FAUpw4m1Ml1LoxJNto",
    authDomain: "madchat-8afb4.firebaseapp.com",
    projectId: "madchat-8afb4",
    storageBucket: "madchat-8afb4.appspot.com",
    messagingSenderId: "118347123455",
    appId: "1:118347123455:web:bf77644c727fcaf3bc1aca",
    measurementId: "G-J2NH9WB1DN"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">
        <h1>FREE SPEECH CHAT</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}


function SignIn(){
  const signInWithGoogle =  () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
  }
  return (
    <>
    <button className="sign-in" onClick={signInWithGoogle}> Sign in with Google</button>
    <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom(){
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
      e.preventDefault();

      const { uid, photoURL } = auth.currentUser; 

      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL
      })

      setFormValue(''); 
      dummy.current.scrollIntoView({ behavior: 'smooth'})
  }

  return (<>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message = {msg} />) }
          <span ref={dummy}></span>
      </main>
      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice"/>
        <button type="submit" disabled={!formValue}>✉️</button>

      </form>
    </>)
}

function ChatMessage(props){
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://pbs.twimg.com/profile_images/1231949113907908609/5-Bbsoar_400x400.jpg'} />
      <p>{text}</p>
    </div>
    </>
  )
}

export default App;