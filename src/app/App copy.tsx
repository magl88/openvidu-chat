import { OpenVidu } from "openvidu-browser";

import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import UserVideoComponent from "./UserVideoComponent";

const APPLICATION_SERVER_URL =
	process.env.NODE_ENV === "production" ? "" : "https://demos.openvidu.io/";

export default function App() {
	const [mySessionId, setMySessionId] = useState("SessionA");
	const [myUserName, setMyUserName] = useState(`Participant${Math.floor(Math.random() * 100)}`);
	const [session, setSession] = useState(undefined);
	const [mainStreamManager, setMainStreamManager] = useState(undefined);
	const [publisher, setPublisher] = useState(undefined);
	const [subscribers, setSubscribers] = useState([]);
	const [currentVideoDevice, setCurrentVideoDevice] = useState(null);

	const OV = useRef(new OpenVidu());

	const handleMainVideoStream = useCallback(
		(stream) => {
			if (mainStreamManager !== stream) {
				setMainStreamManager(stream);
			}
		},
		[mainStreamManager],
	);

	const joinSession = useCallback(() => {
		const mySession = OV.current.initSession();

		mySession.on("streamCreated", (event) => {
			const subscriber = mySession.subscribe(event.stream, undefined);
			setSubscribers((subscribers) => [...subscribers, subscriber]);
		});

		mySession.on("streamDestroyed", (event) => {
			deleteSubscriber(event.stream.streamManager);
		});

		mySession.on("exception", (exception) => {
			console.warn(exception);
		});

		setSession(mySession);
	}, []);

	useEffect(() => {
		if (session) {
			// Get a token from the OpenVidu deployment
			getToken().then(async (token) => {
				try {
					await session.connect(token, { clientData: myUserName });

					let publisher = await OV.current.initPublisherAsync(undefined, {
						audioSource: undefined,
						videoSource: undefined,
						publishAudio: true,
						publishVideo: true,
						resolution: "640x480",
						frameRate: 30,
						insertMode: "APPEND",
						mirror: false,
					});

					session.publish(publisher);

					const devices = await OV.current.getDevices();
					const videoDevices = devices.filter((device) => device.kind === "videoinput");
					const currentVideoDeviceId = publisher.stream
						.getMediaStream()
						.getVideoTracks()[0]
						.getSettings().deviceId;
					const currentVideoDevice = videoDevices.find(
						(device) => device.deviceId === currentVideoDeviceId,
					);

					setMainStreamManager(publisher);
					setPublisher(publisher);
					setCurrentVideoDevice(currentVideoDevice);
				} catch (error) {
					console.log("There was an error connecting to the session:", error.code, error.message);
				}
			});
		}
	}, [session, myUserName]);

	const leaveSession = useCallback(() => {
		// Leave the session
		if (session) {
			session.disconnect();
		}

		// Reset all states and OpenVidu object
		OV.current = new OpenVidu();
		setSession(undefined);
		setSubscribers([]);
		setMySessionId("SessionA");
		setMyUserName("Participant" + Math.floor(Math.random() * 100));
		setMainStreamManager(undefined);
		setPublisher(undefined);
	}, [session]);

	const switchCamera = useCallback(async () => {
		try {
			const devices = await OV.current.getDevices();
			const videoDevices = devices.filter((device) => device.kind === "videoinput");

			if (videoDevices && videoDevices.length > 1) {
				const newVideoDevice = videoDevices.filter(
					(device) => device.deviceId !== currentVideoDevice.deviceId,
				);

				if (newVideoDevice.length > 0) {
					const newPublisher = OV.current.initPublisher(undefined, {
						videoSource: newVideoDevice[0].deviceId,
						publishAudio: true,
						publishVideo: true,
						mirror: true,
					});

					if (session) {
						await session.unpublish(mainStreamManager);
						await session.publish(newPublisher);
						setCurrentVideoDevice(newVideoDevice[0]);
						setMainStreamManager(newPublisher);
						setPublisher(newPublisher);
					}
				}
			}
		} catch (e) {
			console.error(e);
		}
	}, [currentVideoDevice, session, mainStreamManager]);

	const deleteSubscriber = useCallback((streamManager) => {
		setSubscribers((prevSubscribers) => {
			const index = prevSubscribers.indexOf(streamManager);
			if (index > -1) {
				const newSubscribers = [...prevSubscribers];
				newSubscribers.splice(index, 1);
				return newSubscribers;
			} else {
				return prevSubscribers;
			}
		});
	}, []);

	useEffect(() => {
		const handleBeforeUnload = (event) => {
			leaveSession();
		};
		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};
	}, [leaveSession]);

	const getToken = useCallback(async () => {
		return createSession(mySessionId).then((sessionId) => createToken(sessionId));
	}, [mySessionId]);

	return (
		<div className="container">
			{session !== undefined ? (
				<div id="session">
					<div id="session-header">
						<h1 id="session-title">{mySessionId}</h1>
						<input
							className="btn btn-large btn-danger"
							type="button"
							id="buttonLeaveSession"
							onClick={leaveSession}
							value="Leave session"
						/>
						<input
							className="btn btn-large btn-success"
							type="button"
							id="buttonSwitchCamera"
							onClick={switchCamera}
							value="Switch Camera"
						/>
					</div>

					{mainStreamManager !== undefined ? (
						<div id="main-video" className="col-md-6">
							<UserVideoComponent streamManager={mainStreamManager} />
						</div>
					) : null}
					<div id="video-container" className="col-md-6">
						{publisher !== undefined ? (
							<div
								className="stream-container col-md-6 col-xs-6"
								onClick={() => handleMainVideoStream(publisher)}
							>
								<UserVideoComponent streamManager={publisher} />
							</div>
						) : null}
						{subscribers.map((sub, i) => (
							<div
								key={sub.id}
								className="stream-container col-md-6 col-xs-6"
								onClick={() => handleMainVideoStream(sub)}
							>
								<span>{sub.id}</span>
								<UserVideoComponent streamManager={sub} />
							</div>
						))}
					</div>
				</div>
			) : null}
		</div>
	);
}
