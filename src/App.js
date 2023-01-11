import React, { useState, useRef } from 'react'
import env from 'react-dotenv'
import './App.css'

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/analytics'

import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'

/* const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.GOOGLE_CREDS) */
firebase.initializeApp({
	apiKey: env.APIKEY,
	authDomain: env.AUTH,
	projectId: env.PROJECT,
	storageBucket: env.STORAGE,
	messagingSenderId: env.MESSAGE,
	appId: env.APPID,
	measurementId: env.MEASUREMENT,
})
const auth = firebase.auth()
const firestore = firebase.firestore()
const analytics = firebase.analytics()

function App() {
	const [user] = useAuthState(auth)

	return (
		<div className="App">
			<header className="App-header">
				<h1>FREE SPEECH CHAT</h1>
				<SignOut />
			</header>
			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	)
}

function SignIn() {
	const signInWithGoogle = () => {
		const gProvider = new firebase.auth.GoogleAuthProvider()
		auth.signInWithPopup(gProvider)
	}

	return (
		<>
			<button className="sign-in" onClick={signInWithGoogle}>
				{' '}
				Sign in with Google
			</button>
			<p>
				Do not violate the community guidelines or you will be banned for life!
			</p>
		</>
	)
}

function SignOut() {
	return (
		auth.currentUser && (
			<button className="sign-out" onClick={() => auth.signOut()}>
				Sign Out
			</button>
		)
	)
}

function ChatRoom() {
	const dummy = useRef()
	const messagesRef = firestore.collection('messages')
	const query = messagesRef.orderBy('createdAt').limit(25)

	const [messages] = useCollectionData(query, { idField: 'id' })

	const [formValue, setFormValue] = useState('')

	const sendMessage = async (e) => {
		e.preventDefault()
		const { uid, photoURL } = auth.currentUser
		await messagesRef.add({
			text: formValue,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL,
		})

		setFormValue('')
		dummy.current.scrollIntoView({ behavior: 'smooth' })
	}

	return (
		<>
			<main>
				{messages &&
					messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
				<span ref={dummy}></span>
			</main>
			<form onSubmit={sendMessage}>
				<input
					value={formValue}
					onChange={(e) => setFormValue(e.target.value)}
					placeholder="say something nice"
				/>
				<button type="submit" disabled={!formValue}>
					✉️
				</button>
			</form>
		</>
	)
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message

	const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received'

	return (
		<>
			<div className={`message ${messageClass}`}>
				<img
					src={
						photoURL ||
						'https://pbs.twimg.com/profile_images/1231949113907908609/5-Bbsoar_400x400.jpg'
					}
				/>
				<p>{text}</p>
			</div>
		</>
	)
}

export default App
