import { MouseEventHandler, useEffect, useRef } from "react";
import { Card } from "antd";
import cn from "classnames";

import type { StreamManager } from "openvidu-browser";
import styles from "./UserVideoCard.module.scss";

interface UserVideoCardProps {
	streamManager: StreamManager;
	onClick?: MouseEventHandler<HTMLDivElement> | undefined;
}

export const UserVideoCard = ({ streamManager, onClick }: UserVideoCardProps) => {
	const videoRef = useRef(null);

	useEffect(() => {
		if (streamManager && videoRef.current) {
			streamManager.addVideoElement(videoRef.current);
		}
	}, [streamManager]);

	const getNicknameTag = () => {
		return JSON.parse(streamManager.stream.connection.data).clientData;
	};

	return (
		<>
			{streamManager !== undefined ? (
				<Card
					className={cn(styles.card, !!onClick && styles.cardCliked)}
					title={getNicknameTag()}
					onClick={onClick}
				>
					<video className={styles.video} autoPlay={true} ref={videoRef} />
				</Card>
			) : null}
		</>
	);
};
