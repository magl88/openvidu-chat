import styles from "./Session.module.scss";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { OpenVidu } from "openvidu-browser";
import type { Publisher, Session, Subscriber } from "openvidu-browser";
import { Button, Col, Layout, Row, Typography } from "antd";
import { LeftCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Header, Content } = Layout;

import { useCreateSessionQuery, useCreateTokenQuery } from "@/utils/services";

import { UserVideoCard } from "@/components";
import { TEXT_DATA } from "@/utils/constants";

export function SessionPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { sessionId } = useParams();

	const [session, setSession] = useState<Session | undefined>();
	const [mainStreamManager, setMainStreamManager] = useState<Publisher | Subscriber | undefined>();
	const [publisher, setPublisher] = useState<Publisher | undefined>();
	const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

	const OV = useRef(new OpenVidu());

	const { refetch: sessionRefetch } = useCreateSessionQuery(sessionId ?? "DemoSession");

	const { refetch: tokenRefetch } = useCreateTokenQuery(sessionId ?? "DemoSession");

	useEffect(() => {
		const mySession = OV.current.initSession();

		mySession.on("streamCreated", (event) => {
			const subscriber = mySession.subscribe(event.stream, undefined);
			setSubscribers((subscribers) => [...subscribers, subscriber]);
		});

		mySession.on("streamDestroyed", (event) => {
			const stream = event.stream.streamManager.stream;

			setSubscribers((prevSubscribers) => {
				return prevSubscribers.filter((subscriber) => subscriber.stream !== stream);
			});
		});

		mySession.on("exception", (exception) => {
			console.warn(exception);
		});

		setSession(mySession);
	}, []);

	useEffect(() => {
		if (session) {
			sessionRefetch()
				.then(() => tokenRefetch())
				.then(async (token) => {
					try {
						await session.connect(token.data, { clientData: location.state.user ?? "User-007" });

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

						setMainStreamManager(publisher);
						setPublisher(publisher);
					} catch (error) {
						if (error instanceof Error && "code" in error) {
							console.log(
								"There was an error connecting to the session:",
								error.code,
								error.message,
							);
						} else {
							console.log("Console: error", error);
						}
					}
				});
		}
	}, [session]);

	const handleMainVideoStream = useCallback(
		(stream: Publisher | Subscriber) => {
			if (mainStreamManager !== stream) {
				setMainStreamManager(stream);
			}
		},
		[mainStreamManager],
	);

	return (
		<Layout className={styles.layout}>
			{session !== undefined ? (
				<>
					<Header className={styles.header}>
						<Title>{sessionId}</Title>
						<Button>
							<LeftCircleOutlined />
							{TEXT_DATA.back}
						</Button>
					</Header>
					<Content className={styles.content}>
						<Row gutter={[16, 0]}>
							{mainStreamManager !== undefined ? (
								<Col span={12}>
									<UserVideoCard streamManager={mainStreamManager} />
								</Col>
							) : null}
							<Col span={12}>
								<Row gutter={[16, 16]}>
									{publisher !== undefined ? (
										<Col span={12}>
											<UserVideoCard
												streamManager={publisher}
												onClick={() => handleMainVideoStream(publisher)}
											/>
										</Col>
									) : null}
									{subscribers.map((sub) => (
										<Col span={12}>
											<UserVideoCard
												key={sub.id}
												streamManager={sub}
												onClick={() => handleMainVideoStream(sub)}
											/>
										</Col>
									))}
								</Row>
							</Col>
						</Row>
					</Content>
				</>
			) : null}
		</Layout>
	);
}
